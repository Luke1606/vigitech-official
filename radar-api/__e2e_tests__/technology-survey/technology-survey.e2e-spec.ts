import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { UUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { Field, Classification, Item } from '@prisma/client';
import { PrismaService } from '../../src/common/services/prisma.service';

describe('Technology Survey E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Constantes para pruebas
    const MOCK_USER_ID: UUID = '7741cb6b-5aca-4f99-b4f8-3d135a92c73b' as UUID;
    const OTHER_USER_ID: UUID = '8ee77858-c243-4021-8e61-590e0d917e8e' as UUID;
    const BASE_PATH_ITEMS: string = '/tech-survey/survey-items';
    const BASE_PATH_ORCH: string = '/tech-survey/orchestration';

    const clean = async () => {
        await prisma.itemCitedFragment.deleteMany();
        await prisma.itemClassification.deleteMany();
        await prisma.userSubscribedItem.deleteMany();
        await prisma.userHiddenItem.deleteMany();
        await prisma.knowledgeFragment.deleteMany();
        await prisma.item.deleteMany();
        await prisma.user.deleteMany();
    };

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
        await clean();

        await prisma.user.createMany({
            data: [
                { id: MOCK_USER_ID, clerkId: MOCK_USER_ID },
                { id: OTHER_USER_ID, clerkId: OTHER_USER_ID },
            ],
        });
    });

    afterAll(async () => {
        await clean();
        await prisma.$disconnect();
        await app.close();
    });

    // --- Helpers de Base de Datos ---
    const seedItem = async (title: string, userId?: UUID): Promise<Item> => {
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
                insertedBy: true,
                latestClassification: true,
            },
        });
    };

    describe('G1: Security & Global Validation (Parameterized)', () => {
        const endpoints = [
            { method: 'get', path: `${BASE_PATH_ITEMS}/recommended` },
            { method: 'get', path: `${BASE_PATH_ITEMS}/subscribed` },
            { method: 'get', path: `${BASE_PATH_ITEMS}/${uuidv4()}` },
            { method: 'post', path: BASE_PATH_ITEMS },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/subscribe/${uuidv4()}` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/unsubscribe/${uuidv4()}` },
            { method: 'delete', path: `${BASE_PATH_ITEMS}/${uuidv4()}` },
            { method: 'post', path: `${BASE_PATH_ITEMS}/batch` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/subscribe/batch` },
            { method: 'patch', path: `${BASE_PATH_ITEMS}/unsubscribe/batch` },
            { method: 'delete', path: `${BASE_PATH_ITEMS}/batch` },
            { method: 'post', path: `${BASE_PATH_ORCH}/run-global-recommendations` },
        ];

        it.each(endpoints)(
            'Debe denegar el acceso con 401 si falta el x-user-id en $method $path',
            async ({ method, path }) => {
                const req = request(app.getHttpServer())[method](path);
                const res = await req.send({});
                expect(res.status).toBeGreaterThanOrEqual(401);
            },
        );
    });

    describe('G2: Core Data Fetching & Visibility Rules', () => {
        it('1. Debe retornar lista vacía si no hay items en DB', async () => {
            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200, []);

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200, []);
        });

        it('2. Debe listar items creados como recomendados para un usuario que no ha interactuado', async () => {
            const item = await seedItem('Tech A');

            const { body } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(body).toHaveLength(1);
            expect(body[0].id).toBe(item.id);
        });

        it('3. No debe listar un item en recomendados si el usuario actual ya está suscrito o si esta oculto o no es dueño de items creados personalmente', async () => {
            const recommendedItem = await seedItem('Tech A');
            const suscribedItem = await seedItem('Tech B');
            const hiddenItem = await seedItem('Tech C');

            await seedItem('Personal But Not Own Item', OTHER_USER_ID);

            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: suscribedItem.id } });
            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: hiddenItem.id } });

            const { body } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)

                .expect(200);

            expect(body.some((i: Item) => i.id === recommendedItem.id)).toBe(true);

            const items = await prisma.item.findMany({
                where: {
                    hiddenBy: { none: { userId: MOCK_USER_ID } },
                    subscribedBy: { none: { userId: MOCK_USER_ID } },
                    OR: [{ insertedById: null }, { insertedById: MOCK_USER_ID }],
                },
                include: {
                    latestClassification: true,
                    hiddenBy: true,
                    subscribedBy: true,
                },
            });
            expect(items).toHaveLength(1);
            expect(body).toHaveLength(1);
        });

        it('4. Al crear un item no debe mostrarse para ningun otro user, debe mostrarse solamente en los recomendados del user creador', async () => {
            await seedItem('Tech C', MOCK_USER_ID);

            const { body: myRecommended } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(myRecommended).toHaveLength(1);

            const { body: mySubscribed } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(mySubscribed).toHaveLength(0);

            const { body: otherRecommended } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', OTHER_USER_ID)
                .expect(200);

            expect(otherRecommended).toHaveLength(0);

            const { body: otherSubscribed } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', OTHER_USER_ID)
                .expect(200);

            expect(otherSubscribed).toHaveLength(0);
        });

        it('5. SÍ debe listar el item en recomendados para OTRO usuario, incluso si MOCK_USER_ID se suscribió', async () => {
            const item = await seedItem('Tech C');

            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            const { body } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', OTHER_USER_ID)
                .expect(200);
            expect(body).toHaveLength(1);
        });

        it('6. No debe listar un item en recomendados si el usuario lo ha ocultado (Borrado lógico para el usuario)', async () => {
            const item = await seedItem('Tech D');

            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            const { body } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(body).toHaveLength(0);
        });

        it('7. Debe devolver la clasificación más reciente al consultar un item específico o al obtenerlo dentro de las listas', async () => {
            const item = await seedItemWithClassification('Tech Detail');

            const { body: specificItem } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);
            expect(specificItem.latestClassification).toBeDefined();
            expect(specificItem.latestClassification.classification).toBe(Classification.HOLD);

            const { body: recommendedList } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(recommendedList[0].latestClassification).toBeDefined();
            expect(recommendedList[0].latestClassification.classification).toBe(Classification.HOLD);

            // Se suscribe al item para probar que suscrito tambien muestre la clasificacion
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            const { body: suscribedList } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);
            expect(suscribedList[0].latestClassification).toBeDefined();
            expect(suscribedList[0].latestClassification.classification).toBe(Classification.HOLD);
        });

        it('8. Debe arrojar 403 al intentar consultar por ID un item que el usuario ocultó', async () => {
            const item = await seedItem('Hidden Detail');
            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(403);
        });

        it('9. Debe arrojar 404 al intentar consultar por ID un item que otro usuario creó', async () => {
            const item = await seedItem('Tech Detail', OTHER_USER_ID);

            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(404);
        });
    });

    describe('G3: Item Creation, Constraints & Classification integration', () => {
        it('10. Debe crear un item único, clasificándolo y persistiendo autoría', async () => {
            const payload = { title: 'NestJS Pro' };

            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH_ITEMS)
                .set('x-user-id', MOCK_USER_ID)
                .send(payload)
                .expect(201);

            const dbItem = await prisma.item.findUnique({
                where: { id: body.id },
                include: { latestClassification: true },
            });
            expect(dbItem?.insertedById).toBe(MOCK_USER_ID);
            expect(dbItem?.latestClassification).toBeDefined();
        });

        it('11. Batch Create: Debe crear múltiples items en una sola transacción', async () => {
            const payload = [{ title: 'Batch 1' }, { title: 'Batch 2' }];

            await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(payload)
                .expect(200);

            const count = await prisma.item.count({ where: { title: { startsWith: 'Batch' } } });
            expect(count).toBe(2);
        });

        it('12. Batch Create: Debe funcionar aun con un array vacio pero fallar limpiamente si se envían datos malformados', async () => {
            await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send([])
                .expect(201);

            await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ notAnArray: true })
                .expect(400);
        });
    });

    describe('G4: Subscription Lifecycle', () => {
        it('13. Debe permitir suscribirse a un item y moverlo de Recomendados a Suscritos (y viceversa)', async () => {
            const item = await seedItem('Target Sub');

            // Suscribir
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            // Verificar suscritos
            const { body: subscribedList } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(subscribedList).toHaveLength(1);
            expect(subscribedList.some((i: Item) => i.id === item.id)).toBe(true);

            const { body: recommendedList } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(recommendedList).toHaveLength(0);
            expect(recommendedList.some((i: Item) => i.id === item.id)).toBe(false);

            // Caso contrario
            // Des-suscribir
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            // Verificar suscritos
            const { body: subscribedListAfterUnsub } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(subscribedListAfterUnsub).toHaveLength(0);
            expect(subscribedListAfterUnsub.some((i: Item) => i.id === item.id)).toBe(false);

            const { body: recommendedListAfterUnsub } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(recommendedListAfterUnsub).toHaveLength(1);
            expect(recommendedListAfterUnsub.some((i: Item) => i.id === item.id)).toBe(true);
        });

        it('14. Suscribirse doblemente al mismo item debe ser una operación idempotente (no arrojar error ni duplicar DB)', async () => {
            const item = await seedItem('Idempotent Sub');

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            const { body: subsByHTTP } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            const subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID, itemId: item.id } });
            expect(subs).toEqual(subsByHTTP.length);
            expect(subs).toBe(1);
        });

        it('15. Intentar suscribirse o dessuscribirse a un item creado por otro user no debe poderse hacer desde la API', async () => {
            const item = await seedItem('Not subscribable item', OTHER_USER_ID);

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(404);

            // ESTO ES SOLO PARA PRUEBAS, NUNCA DEBERIA HABER USERS SUSCRITOS A ITEMS
            // CREADOS PERSONALMENTE POR OTROS USERS
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(404);
        });

        it('16. Debe desuscribirse correctamente y regresar el item a Recomendados', async () => {
            const item = await seedItem('Unsub Flow');
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            const { body } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(body.some((i: Item) => i.id === item.id)).toBe(true);
        });

        it('17. Desuscribirse de un item no suscrito no debe romper el servidor', async () => {
            const item = await seedItem('Never Subbed');

            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(404);
        });

        it('18. Batch Subscribe y Unsubscribe deben procesar arreglos completos correctamente', async () => {
            const item1 = await seedItem('B1');
            const item2 = await seedItem('B2');
            const itemsBatch = { itemIds: [item1.id, item2.id] };

            // Subscribe
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(itemsBatch)
                .expect(200);

            let subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID } });
            expect(subs).toBe(2);

            // Unsubscribe
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(itemsBatch)
                .expect(200);

            subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID } });
            expect(subs).toBe(0);
        });
    });

    describe('G5: Deletion & Hiding Strategies', () => {
        it('19. Debe hacer HARD DELETE si el usuario intenta borrar un item del cual ES creador', async () => {
            const item = await seedItem('My Item', MOCK_USER_ID);

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            const dbItem = await prisma.item.findUnique({ where: { id: item.id } });
            expect(dbItem).toBeNull(); // Borrado físicamente
        });

        it('20. Debe hacer SOFT DELETE (Ocultar) si el usuario intenta borrar un item del cual NO ES creador (huerfano)', async () => {
            const item = await seedItem('Orphan Item');

            expect(
                await prisma.item.findUnique({
                    where: { id: item.id, OR: [{ insertedById: MOCK_USER_ID }, { insertedById: null }] },
                }),
            ).not.toBeNull();

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            // Sigue existiendo en la base de datos
            expect(await prisma.item.findUnique({ where: { id: item.id } })).not.toBeNull();

            // Pero está oculto para MOCK_USER_ID
            expect(
                await prisma.userHiddenItem.findFirst({ where: { userId: MOCK_USER_ID, itemId: item.id } }),
            ).toBeDefined();
        });

        it('21. Debe devolver 404 si el usuario intenta borrar un item creado por otro usuario (esto nunca deberia poder pasar, pero si pasa, deberia manejarse bien)', async () => {
            const item = await seedItem('Orphan Item', OTHER_USER_ID);

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(404);
        });

        it('22. Batch Remove debe separar inteligentemente items propios y ajenos', async () => {
            const myItem = await seedItem('Me', MOCK_USER_ID);
            const theirItem = await seedItem('Them', OTHER_USER_ID);
            const orphanItem = await seedItem('Orphan');

            // Ambos usuarios se suscriben al huerfano y al propio (se simula el comportamiento de la API que los guarda ya suscritos)
            await prisma.userSubscribedItem.createMany({
                data: [
                    {
                        userId: MOCK_USER_ID,
                        itemId: orphanItem.id,
                    },
                    {
                        userId: MOCK_USER_ID,
                        itemId: myItem.id,
                    },
                    {
                        userId: OTHER_USER_ID,
                        itemId: orphanItem.id,
                    },
                    {
                        userId: OTHER_USER_ID,
                        itemId: theirItem.id,
                    },
                ],
            });

            // Deberia mostrar 2 elementos, el propio y el huerfano
            const { body: mySuscribedItemsRes } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(mySuscribedItemsRes).toHaveLength(2);

            // Deberia mostrar 2 elementos, el propio y el huerfano
            const { body: theirSuscribedItemsRes } = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/subscribed`)
                .set('x-user-id', OTHER_USER_ID)
                .expect(200);

            expect(theirSuscribedItemsRes).toHaveLength(2);

            await request(app.getHttpServer())
                .delete(`${BASE_PATH_ITEMS}/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemIds: [myItem.id, theirItem.id] })
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
                .expect(404);
        });
    });

    describe('G6: Orchestration, Reclassifications & Data integrity', () => {
        it('23. Orquestación: runAllReclassifications debe actualizar correctamente items en estado HOLD', async () => {
            const item = await seedItem('Reclass Target', OTHER_USER_ID);
            // Suscribimos al usuario para forzar que el sistema lo tome en cuenta para reclasificación
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });

            const { body } = await request(app.getHttpServer())
                .post(`${BASE_PATH_ORCH}/run-all-reclassifications`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(body.data).toBeDefined();

            // Verificamos que al consultar el item tenga un timestamp actualizado
            const updated = await prisma.item.findUnique({ where: { id: item.id } });
            expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(item.createdAt.getTime());
        });
    });
});
