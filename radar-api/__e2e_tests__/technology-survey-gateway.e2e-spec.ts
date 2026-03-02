import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { UUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { Field, Classification, Item } from '@prisma/client';
import { PrismaService } from '../src/common/services/prisma.service';

describe('Radar API Integration E2E Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Constantes para pruebas
    const MOCK_USER_ID: UUID = uuidv4() as UUID;
    const OTHER_USER_ID: UUID = uuidv4() as UUID;
    const BASE_PATH_ITEMS: string = '/tech-survey/survey-items';
    const BASE_PATH_ORCH: string = '/tech-survey/orchestration';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        prisma = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();
    });

    beforeEach(async () => {
        // Limpieza estricta asegurando el orden de las llaves foráneas
        await prisma.itemCitedFragment.deleteMany();
        await prisma.itemClassification.deleteMany();
        await prisma.userSubscribedItem.deleteMany();
        await prisma.userHiddenItem.deleteMany();
        await prisma.knowledgeFragment.deleteMany();
        await prisma.item.deleteMany();
        await prisma.user.deleteMany();

        await prisma.user.createMany({
            data: [
                { id: MOCK_USER_ID, clerkId: 'Mock User' },
                { id: OTHER_USER_ID, clerkId: 'Other User' },
            ],
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    // --- Helpers de Base de Datos ---
    const seedItem = async (title: string, userId?: string): Promise<Item> => {
        const defaultSummary = `Summary for ${title}`;

        const data = {
            title,
            summary: defaultSummary,
            itemField: Field.SCIENTIFIC_STAGE,
            insertedBy: userId
                ? {
                      connect: { id: userId },
                  }
                : undefined,
        };

        return prisma.item.create({
            data,
            include: {
                insertedBy: true,
            },
        });
    };

    /**
     * Crea un item con su lastestClassification en HOLD
     */
    const seedItemWithClassification = async (title: string, userId?: string): Promise<Item> => {
        const defaultSummary = `Summary for ${title}`;

        const itemData = {
            title,
            summary: defaultSummary,
            itemField: Field.SCIENTIFIC_STAGE,
            insertedBy: userId
                ? {
                      connect: { id: userId },
                  }
                : undefined,
        };

        const classification = await prisma.itemClassification.create({
            data: {
                classification: Classification.HOLD,
                insightsValues: { reason: 'xd' },
                item: {
                    create: itemData,
                },
            },
            include: {
                item: true,
            },
        });

        return await prisma.item.update({
            where: { id: classification.item.id },
            data: {
                latestClassificationId: classification.id,
            },
            include: {
                latestClassification: true,
            },
        });
    };

    // =========================================================================
    // GRUPO 1: SEGURIDAD, CABECERAS Y VALIDACIONES GLOBALES (Aprox. 30 tests)
    // =========================================================================
    describe('G1: Security & Global Validation (Parameterized)', () => {
        const endpoints = [
            { method: 'get', path: `${BASE_PATH_ITEMS}/recommended` },
            { method: 'get', path: `${BASE_PATH_ITEMS}/subscribed` },
            { method: 'get', path: `${BASE_PATH_ITEMS}/${uuidv4()}` },
            { method: 'post', path: `${BASE_PATH_ITEMS}/create` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/subscribe/${uuidv4()}` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/unsubscribe/${uuidv4()}` },
            { method: 'delete', path: `${BASE_PATH_ITEMS}/${uuidv4()}` },
            { method: 'post', path: `${BASE_PATH_ITEMS}/create/batch` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/subscribe/batch` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/unsubscribe/batch` },
            { method: 'delete', path: `${BASE_PATH_ITEMS}/batch` },
            { method: 'post', path: `${BASE_PATH_ORCH}/run-global-recommendations` },
        ];

        it.each(endpoints)(
            'Debe denegar el acceso con 400/401/403 si falta el x-user-id en $method $path',
            async ({ method, path }) => {
                const req = request(app.getHttpServer())[method](path);
                const res = await req.send({});
                expect(res.status).toBeGreaterThanOrEqual(400);
            },
        );
    });

    // =========================================================================
    // GRUPO 2: FLUJOS DE LECTURA Y EXCLUSIONES (Recomendados vs Suscritos)
    // =========================================================================
    describe('G2: Core Data Fetching & Visibility Rules', () => {
        it('Debe retornar lista vacía si no hay items en DB', async () => {
            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200, []);

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200, []);
        });

        it('Debe listar items creados como recomendados para un usuario que no ha interactuado', async () => {
            const item = await seedItem('Tech A');

            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('Cookie', ['__session=dummy-token'])
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(item.id);
        });

        it('NO debe listar un item en recomendados si el usuario actual ya está suscrito o si esta oculto o no es dueño de items creados personalmente', async () => {
            const recommendedItem = await seedItem('Tech A');
            const suscribedItem = await seedItem('Tech B');
            const hiddenItem = await seedItem('Tech C');

            await seedItem('Personal But Not Own Item', OTHER_USER_ID);

            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: suscribedItem.id } });
            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: hiddenItem.id } });

            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body.some((i: Item) => i.id === recommendedItem.id)).toBe(true);
        });

        it('Al crear un item no debe mostrarse para ningun otro user, debe mostrarse solamente en los recomendados del user creador', async () => {
            await seedItem('Tech C', MOCK_USER_ID);

            const userRecommended = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(userRecommended.body).toHaveLength(1);

            const userSuscribed = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(userSuscribed.body).toHaveLength(0);

            const otherUserRecommended = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', OTHER_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(otherUserRecommended.body).toHaveLength(0);

            const otherUserSuscribed = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', OTHER_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(otherUserSuscribed.body).toHaveLength(0);
        });

        it('SÍ debe listar el item en recomendados para OTRO usuario, incluso si MOCK_USER_ID se suscribió', async () => {
            const item = await seedItem('Tech C');

            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', OTHER_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(1);
        });

        it('NO debe listar un item en recomendados si el usuario lo ha ocultado (Borrado lógico para el usuario)', async () => {
            const item = await seedItem('Tech D');

            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(0);
        });

        it('Debe devolver la clasificación más reciente al consultar un item específico o al obtenerlo dentro de las listas', async () => {
            const item = await seedItemWithClassification('Tech Detail');

            const specificRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(specificRes.body.latestClassification).toBeDefined();
            expect(specificRes.body.latestClassification.classification).toBe(Classification.HOLD);

            const recommendedRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(recommendedRes.body[0].latestClassification).toBeDefined();
            expect(recommendedRes.body[0].latestClassification.classification).toBe(Classification.HOLD);

            // Se suscribe al item para probar que suscrito tambien muestre la clasificacion
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const suscribedRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(suscribedRes.body[0].latestClassification).toBeDefined();
            expect(suscribedRes.body[0].latestClassification.classification).toBe(Classification.HOLD);
        });

        it('Debe arrojar 403 al intentar consultar por ID un item que el usuario ocultó', async () => {
            const item = await seedItem('Hidden Detail');
            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(403);
        });

        it('Debe arrojar 404 al intentar consultar por ID un item que otro usuario creó', async () => {
            const item = await seedItem('Tech Detail', OTHER_USER_ID);

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(404);
        });
    });

    // =========================================================================
    // GRUPO 3: CREACIÓN Y RELACIONES DE DOMINIO (Creación única y batch)
    // =========================================================================
    describe('G3: Item Creation, Constraints & Classification integration', () => {
        it('Debe crear un item único, clasificándolo y persistiendo autoría', async () => {
            const payload = { title: 'NestJS Pro' };
            const res = await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/create`)
                .set('x-user-id', MOCK_USER_ID)
                .send(payload)
                .set('Cookie', ['__session=dummy-token'])
                .expect(201);

            const dbItem = await prisma.item.findUnique({
                where: { id: res.body.id },
                include: { latestClassification: true },
            });
            expect(dbItem?.insertedById).toBe(MOCK_USER_ID);
            expect(dbItem?.latestClassification).toBeDefined();
        });

        it('Batch Create: Debe crear múltiples items en una sola transacción', async () => {
            const payload = [{ title: 'Batch 1' }, { title: 'Batch 2' }];

            await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/create/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(payload)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const count = await prisma.item.count({ where: { title: { startsWith: 'Batch' } } });
            expect(count).toBe(2);
        });

        it('Batch Create: Debe funcionar aun con un array vacio pero fallar limpiamente si se envían datos malformados', async () => {
            await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/create/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send([])
                .set('Cookie', ['__session=dummy-token'])
                .expect(201);

            await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/create/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ notAnArray: true })
                .set('Cookie', ['__session=dummy-token'])
                .expect(400);
        });
    });

    // =========================================================================
    // GRUPO 4: SUSCRIPCIONES Y LÓGICA DE NEGOCIO (Idempotencia y transiciones)
    // =========================================================================
    describe('G4: Subscription Lifecycle', () => {
        it('Debe permitir suscribirse a un item y moverlo de Recomendados a Suscritos', async () => {
            const item = await seedItem('Target Sub');

            // Suscribir
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            // Verificar suscritos
            const subRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(subRes.body.some((i: Item) => i.id === item.id)).toBe(true);

            const recRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(recRes.body.some((i: Item) => i.id === item.id)).toBe(false);
        });

        it('Suscribirse doblemente al mismo item debe ser una operación idempotente (no arrojar error ni duplicar DB)', async () => {
            const item = await seedItem('Idempotent Sub');

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const subsByHTTP = await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID, itemId: item.id } });
            expect(subs).toEqual(subsByHTTP.body.length);
            expect(subs).toBe(1);
        });

        it('Intentar suscribirse o dessuscribirse a un item creado por otro user no debe poderse hacer desde la API', async () => {
            const item = await seedItem('Not subscribable item', OTHER_USER_ID);

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(404);

            // ESTO ES SOLO PARA PRUEBAS, NUNCA DEBERIA HABER USERS SUSCRITOS A ITEMS
            // CREADOS PERSONALMENTE POR OTROS USERS
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(404);
        });

        it('Debe desuscribirse correctamente y regresar el item a Recomendados', async () => {
            const item = await seedItem('Unsub Flow');
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const recRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(recRes.body.some((i: Item) => i.id === item.id)).toBe(true);
        });

        it('Desuscribirse de un item no suscrito no debe romper el servidor', async () => {
            const item = await seedItem('Never Subbed');

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(404);
        });

        it('Batch Subscribe y Unsubscribe deben procesar arreglos completos correctamente', async () => {
            const item1 = await seedItem('B1');
            const item2 = await seedItem('B2');
            const itemsBatch = { itemIds: [item1.id, item2.id] };

            // Subscribe
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(itemsBatch)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            let subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID } });
            expect(subs).toBe(2);

            // Unsubscribe
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(itemsBatch)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID } });
            expect(subs).toBe(0);
        });
    });

    // =========================================================================
    // GRUPO 5: ELIMINACIÓN Y OCULTAMIENTO (Hard delete vs Soft delete)
    // =========================================================================
    describe('G5: Deletion & Hiding Strategies', () => {
        it('Debe hacer HARD DELETE si el usuario intenta borrar un item del cual ES creador', async () => {
            const item = await seedItem('My Item', MOCK_USER_ID);

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const dbItem = await prisma.item.findUnique({ where: { id: item.id } });
            expect(dbItem).toBeNull(); // Borrado físicamente
        });

        it('Debe hacer SOFT DELETE (Ocultar) si el usuario intenta borrar un item del cual NO ES creador (huerfano)', async () => {
            const item = await seedItem('Orphan Item');

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            const dbItem = await prisma.item.findUnique({ where: { id: item.id } });
            expect(dbItem).not.toBeNull(); // Sigue existiendo en la base de datos

            const hidden = await prisma.userHiddenItem.findFirst({ where: { userId: MOCK_USER_ID, itemId: item.id } });
            expect(hidden).toBeDefined(); // Pero está oculto para MOCK_USER_ID
        });

        it('Debe devolver 404 si el usuario intenta borrar un item creado por otro usuario (esto nunca deberia poder pasar, pero si pasa, deberia manejarse bien)', async () => {
            const item = await seedItem('Orphan Item', OTHER_USER_ID);
            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(404);
        });

        it('Batch Remove debe separar inteligentemente items propios y ajenos', async () => {
            const myItem = await seedItem('Me', MOCK_USER_ID);
            const theirItem = await seedItem('Them', OTHER_USER_ID);
            const orphanItem = await seedItem('Orphan');

            // Ambos usuarios se suscriben al huerfano (al insertar uno propio se guarda ya suscrito)
            await prisma.userSubscribedItem.createMany({
                data: [
                    {
                        userId: MOCK_USER_ID,
                        itemId: orphanItem.id,
                    },
                    {
                        userId: OTHER_USER_ID,
                        itemId: orphanItem.id,
                    },
                ],
            });

            // Deberia mostrar 2 elementos, el propio y el huerfano
            const mySuscribedItemsRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            expect(mySuscribedItemsRes.body).toHaveLength(2);

            // Deberia mostrar 2 elementos, el propio y el huerfano
            const theirSuscribedItemsRes = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', OTHER_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            expect(theirSuscribedItemsRes.body).toHaveLength(2);

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemIds: [myItem.id, theirItem.id] })
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            // myItem no debería existir
            const myDbItem = await prisma.item.findUnique({ where: { id: myItem.id } });
            expect(myDbItem).toBeNull();

            // theirItem debería existir, pero estar oculto para MOCK_USER_ID
            const theirDbItem = await prisma.item.findUnique({ where: { id: theirItem.id } });
            expect(theirDbItem).not.toBeNull();

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${theirItem.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(404);
        });
    });

    // =========================================================================
    // GRUPO 6: ORQUESTACIÓN COMPLETA (Escenarios de integración masiva)
    // =========================================================================
    describe('G6: Orchestration, Reclassifications & Data integrity', () => {
        it('Orquestación: runAllReclassifications debe actualizar correctamente items en estado HOLD', async () => {
            // Este test prueba la integración desde el controller de orquestación hasta prisma
            const item = await seedItem('Reclass Target', OTHER_USER_ID);
            // Suscribimos al usuario para forzar que el sistema lo tome en cuenta para reclasificación
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            const res = await request(app.getHttpServer())
                .post(`${BASE_PATH_ORCH}/run-all-reclassifications`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            // Verificamos el payload de respuesta
            expect(res.body.data).toBeDefined();

            // Verificamos que al consultar el item tenga un timestamp actualizado
            const updated = await prisma.item.findUnique({ where: { id: item.id } });
            expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(item.createdAt.getTime());
        });
    });
});
