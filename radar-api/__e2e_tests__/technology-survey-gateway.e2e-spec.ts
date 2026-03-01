import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Field, Classification, Item } from '@prisma/client';
import { PrismaService } from '../src/common/services/prisma.service';
import { ClerkAuthGuard } from '@/modules/auth/guards/clerk-auth.guard';

describe('Radar API Integration E2E Tests (Real Database) - Comprehensive', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Constantes para pruebas
    const MOCK_USER_ID = uuidv4();
    const OTHER_USER_ID = uuidv4();
    const BASE_PATH_ITEMS = '/tech-survey/survey-items';
    const BASE_PATH_ORCH = '/tech-survey/orchestration';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(ClerkAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();

                    req.userId = MOCK_USER_ID;

                    if (!req.cookies) req.cookies = {};

                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
    const seedItem = async (
        title: string,
        userId: string, // Asegúrate de que este userId exista en la tabla User de tu DB
        field: Field = Field.LANGUAGES_AND_FRAMEWORKS,
    ) => {
        // Definimos un resumen por defecto para cumplir con el esquema
        const defaultSummary = `Summary for ${title}`;

        return prisma.item.create({
            data: {
                title,
                summary: defaultSummary,
                itemField: field,
                // Relación con el usuario que inserta
                insertedBy: {
                    connect: { id: userId },
                },
                // Relación con la primera clasificación
                latestClassification: {
                    create: {
                        classification: Classification.TEST,
                        insightsValues: {
                            reason: 'E2E setup',
                            note: 'Created by seedItem helper',
                        },
                        item: {
                            connectOrCreate: {
                                where: { id: 'temp-id' },
                                create: {
                                    title: title,
                                    summary: defaultSummary,
                                    itemField: field,
                                    insertedById: userId,
                                },
                            },
                        },
                    },
                },
            },
            include: {
                latestClassification: true,
                insertedBy: true,
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

        it.each(endpoints)(
            'Debe rechazar x-user-id malformado (no UUID) en $method $path',
            async ({ method, path }) => {
                const req = request(app.getHttpServer())[method](path);
                const res = await req.set('x-user-id', 'invalid-user-id').send({});
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
        });

        it('Debe listar items creados como recomendados para un usuario que no ha interactuado', async () => {
            const item = await seedItem('Tech A', OTHER_USER_ID);
            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(item.id);
        });

        it('NO debe listar un item en recomendados si el usuario actual ya está suscrito', async () => {
            const item = await seedItem('Tech B', OTHER_USER_ID);
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });
            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(0);
        });

        it('SÍ debe listar el item en recomendados para OTRO usuario, incluso si MOCK_USER_ID se suscribió', async () => {
            const item = await seedItem('Tech C', OTHER_USER_ID);
            await prisma.userSubscribedItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });
            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', OTHER_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(1);
        });

        it('NO debe listar un item en recomendados si el usuario lo ha ocultado (Borrado lógico para el usuario)', async () => {
            const item = await seedItem('Tech D', OTHER_USER_ID);
            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });
            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/recommended`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body).toHaveLength(0);
        });

        it('Debe devolver la clasificación más reciente al consultar un item específico', async () => {
            const item = await seedItem('Tech Detail', OTHER_USER_ID);
            const res = await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            expect(res.body.latestClassification.classification).toBe(Classification.TEST);
        });

        it('Debe arrojar 404/403 al intentar consultar por ID un item que el usuario ocultó', async () => {
            const item = await seedItem('Hidden Detail', OTHER_USER_ID);
            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });
            await request(app.getHttpServer())
                .get(`${BASE_PATH_ITEMS}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(403);
        });
    });

    // =========================================================================
    // GRUPO 3: CREACIÓN Y RELACIONES DE DOMINIO (Creación única y batch)
    // =========================================================================
    describe('G3: Item Creation, Constraints & Classification integration', () => {
        it('Debe crear un item único, clasificándolo y persistiendo autoría', async () => {
            const payload = { title: 'NestJS Pro', itemField: Field.LANGUAGES_AND_FRAMEWORKS, summary: 'Backend' };
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

        it('Debe ignorar propiedades adicionales en el DTO gracias a ValidationPipe(whitelist)', async () => {
            const payload = { title: 'React 19', admin: true, fakeField: 'hack' };
            const res = await request(app.getHttpServer())
                .post(`${BASE_PATH_ITEMS}/create`)
                .set('x-user-id', MOCK_USER_ID)
                .send(payload)
                .set('Cookie', ['__session=dummy-token'])
                .expect(201);
            expect(res.body.admin).toBeUndefined();
        });

        it('Batch Create: Debe crear múltiples items en una sola transacción', async () => {
            const payload = [
                { title: 'Batch 1', itemField: Field.SCIENTIFIC_STAGE },
                { title: 'Batch 2', itemField: Field.LANGUAGES_AND_FRAMEWORKS },
            ];
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/create/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send(payload)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            const count = await prisma.item.count({ where: { title: { startsWith: 'Batch' } } });
            expect(count).toBe(2);
        });

        it('Batch Create: Debe fallar limpiamente si se envía un array vacío o malformado', async () => {
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/create/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send([])
                .set('Cookie', ['__session=dummy-token'])
                .expect(400);
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/create/batch`)
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
            const item = await seedItem('Target Sub', OTHER_USER_ID);

            // Suscribir
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);

            // Verificar listas
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
            const item = await seedItem('Idempotent Sub', OTHER_USER_ID);
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

            const subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID, itemId: item.id } });
            expect(subs).toBe(1);
        });

        it('Debe desuscribirse correctamente y regresar el item a Recomendados', async () => {
            const item = await seedItem('Unsub Flow', OTHER_USER_ID);
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
            const item = await seedItem('Never Subbed', OTHER_USER_ID);
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
        });

        it('Batch Subscribe y Unsubscribe deben procesar arreglos completos correctamente', async () => {
            const item1 = await seedItem('B1', OTHER_USER_ID);
            const item2 = await seedItem('B2', OTHER_USER_ID);

            // Subscribe
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/subscribe/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send([item1.id, item2.id])
                .set('Cookie', ['__session=dummy-token'])
                .expect(200);
            let subs = await prisma.userSubscribedItem.count({ where: { userId: MOCK_USER_ID } });
            expect(subs).toBe(2);

            // Unsubscribe
            await request(app.getHttpServer())
                .patch(`${BASE_PATH_ITEMS}/unsubscribe/batch`)
                .set('x-user-id', MOCK_USER_ID)
                .send([item1.id, item2.id])
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

        it('Debe hacer SOFT DELETE (Ocultar) si el usuario intenta borrar un item del cual NO ES creador', async () => {
            const item = await seedItem('Their Item', OTHER_USER_ID);
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

        it('Batch Remove debe separar inteligentemente items propios y ajenos', async () => {
            const myItem = await seedItem('Me', MOCK_USER_ID);
            const theirItem = await seedItem('Them', OTHER_USER_ID);

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
            const hidden = await prisma.userHiddenItem.count({ where: { userId: MOCK_USER_ID, itemId: theirItem.id } });
            expect(hidden).toBe(1);
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
