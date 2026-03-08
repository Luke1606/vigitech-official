import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import { UUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { Field, NotificationChannel } from '@prisma/client';
import { PrismaService } from '../../src/common/services/prisma.service';

describe('User Item Lists E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const MOCK_USER_ID: UUID = '7741cb6b-5aca-4f99-b4f8-3d135a92c73b' as UUID;
    const OTHER_USER_ID: UUID = '8ee77858-c243-4021-8e61-590e0d917e8e' as UUID;
    const BASE_PATH = '/user-data/item-lists';
    const GATEWAY_PATH = '/tech-survey/survey-items';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    const clean = async () => {
        await prisma.userItemList.deleteMany();
        await prisma.userSubscribedItem.deleteMany();
        await prisma.userHiddenItem.deleteMany();
        await prisma.item.deleteMany();
        await prisma.user.deleteMany();
    };

    beforeEach(async () => {
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

    const seedItem = async (title: string) =>
        await prisma.item.create({
            data: { title, summary: '...', itemField: Field.SCIENTIFIC_STAGE },
        });

    const subscribeUser = async (userId: UUID, itemId: UUID) =>
        await prisma.userSubscribedItem.create({ data: { userId, itemId } });

    describe('G1: CRUD Básico y Validaciones', () => {
        it('1. Debe crear una lista válida', async () => {
            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send({ name: 'Lista A' })
                .expect(201);

            expect(body.name).toBe('Lista A');
        });

        it('2. Debe fallar si el nombre está vacío', async () => {
            await request(app.getHttpServer())
                .post(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send({ name: '' })
                .expect(400);
        });

        it('3. Debe listar solo las listas del usuario', async () => {
            await prisma.userItemList.create({ data: { name: 'Mía', ownerId: MOCK_USER_ID } });
            await prisma.userItemList.create({ data: { name: 'Ajena', ownerId: OTHER_USER_ID } });
            const { body } = await request(app.getHttpServer())
                .get(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(body).toHaveLength(1);
        });

        it('4. Debe actualizar el canal de notificación', async () => {
            const list = await prisma.userItemList.create({ data: { name: 'Test', ownerId: MOCK_USER_ID } });
            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ preferredNotificationChannel: NotificationChannel.EMAIL })
                .expect(200);
        });

        it('5. Debe fallar con canal inválido', async () => {
            const list = await prisma.userItemList.create({ data: { name: 'Test', ownerId: MOCK_USER_ID } });
            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ preferredNotificationChannel: 'TIKTOK' })
                .expect(400);
        });

        it('6. Debe borrar una lista propia', async () => {
            const list = await prisma.userItemList.create({ data: { name: 'Borrar', ownerId: MOCK_USER_ID } });
            await request(app.getHttpServer())
                .delete(`${BASE_PATH}/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);
        });

        it('7. GetOne debe devolver 404 para lista de otro usuario', async () => {
            const list = await prisma.userItemList.create({ data: { name: 'Ajena', ownerId: OTHER_USER_ID } });
            await request(app.getHttpServer())
                .get(`${BASE_PATH}/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(404);
        });

        it('8. Debe soportar nombres largos (hasta 255 si aplica)', async () => {
            await request(app.getHttpServer())
                .post(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send({ name: 'a'.repeat(100) })
                .expect(201);
        });

        it('9. Debe devolver 401 si no hay x-user-id', async () => {
            await request(app.getHttpServer()).get(BASE_PATH).expect(401);
        });

        it('10. Debe devolver items vacíos al crear lista', async () => {
            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send({ name: 'Vacía' });
            expect(body.items).toEqual([]);
        });
    });

    describe('G2: Reglas de Negocio - Elegibilidad', () => {
        it('11. No debe permitir añadir ítem si NO está suscrito', async () => {
            const item = await seedItem('No suscrito');
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });
            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id })
                .expect(400);
        });

        it('12. Debe permitir añadir ítem si ESTÁ suscrito', async () => {
            const item = await seedItem('Suscrito');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });
            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id })
                .expect(200);
        });

        it('13. No debe permitir añadir ítem si está OCULTO (aunque esté suscrito)', async () => {
            const item = await seedItem('Oculto');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);

            await prisma.userHiddenItem.create({ data: { userId: MOCK_USER_ID, itemId: item.id } });
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id })
                .expect(400);
        });

        it('14. Batch - Debe fallar si UNO de los ítems no está suscrito', async () => {
            const i1 = await seedItem('I1');
            await subscribeUser(MOCK_USER_ID, i1.id as UUID);

            const i2 = await seedItem('I2'); // No suscrito
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/batch/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemIds: [i1.id, i2.id] })
                .expect(400);
        });

        it('15. Batch - Debe funcionar si TODOS están suscritos', async () => {
            const i1 = await seedItem('I1');
            await subscribeUser(MOCK_USER_ID, i1.id as UUID);

            const i2 = await seedItem('I2');
            await subscribeUser(MOCK_USER_ID, i2.id as UUID);

            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/batch/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemIds: [i1.id, i2.id] })
                .expect(200);
        });

        it('16. Idempotencia - Añadir el mismo ítem dos veces no debe duplicar', async () => {
            const item = await seedItem('Idemp');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);

            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id });

            const { body } = await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id });

            expect(body.items).toHaveLength(1);
        });

        it('17. No debe permitir añadir ítems insertados por otros', async () => {
            const item = await prisma.item.create({
                data: { title: 'Otro', summary: '...', itemField: Field.SCIENTIFIC_STAGE, insertedById: OTHER_USER_ID },
            });
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id })
                .expect(400);
        });

        it('18. No debe permitir añadir ítems orphans si no hay suscripción', async () => {
            const item = await prisma.item.create({
                data: { title: 'Otro', summary: '...', itemField: Field.SCIENTIFIC_STAGE },
            });
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id })
                .expect(400);
        });

        it('19. Debe responder con 400 al remover ítem que no está en la lista', async () => {
            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .delete(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: uuidv4() })
                .expect(400);
        });

        it('20. Batch Remove - Debe remover múltiples ítems de la lista', async () => {
            const i1 = await seedItem('I1');

            await subscribeUser(MOCK_USER_ID, i1.id as UUID);

            const list = await prisma.userItemList.create({
                data: { name: 'L1', ownerId: MOCK_USER_ID, items: { connect: { id: i1.id } } },
            });

            const { body } = await request(app.getHttpServer())
                .delete(`${BASE_PATH}/batch/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemIds: [i1.id] })
                .expect(200);

            expect(body.items).toHaveLength(0);
        });

        it('21. No debe permitir que Usuario B añada ítems a la lista de Usuario A (Al no ser propia la lista, no se encuentra)', async () => {
            const item = await seedItem('Item');
            await subscribeUser(OTHER_USER_ID, item.id as UUID);
            const listA = await prisma.userItemList.create({ data: { name: 'Lista A', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${listA.id}`)
                .set('x-user-id', OTHER_USER_ID)
                .send({ itemId: item.id })
                .expect(404);
        });
    });

    describe('G3: Efecto Dominó / Integridad', () => {
        it('22. Al des-suscribirse (Unsubscribe), el ítem debe salir de la lista automáticamente', async () => {
            const item = await seedItem('Dominó');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);

            const list = await prisma.userItemList.create({
                data: { name: 'L1', ownerId: MOCK_USER_ID, items: { connect: { id: item.id } } },
            });

            // Llamada al Gateway para des-suscribirse
            await request(app.getHttpServer())
                .patch(`${GATEWAY_PATH}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            // Verificar lista
            const updatedList = await prisma.userItemList.findUnique({
                where: { id: list.id },
                include: { items: true },
            });
            expect(updatedList?.items).toHaveLength(0);
        });

        it('23. Al OCULTAR un ítem, este debe salir de la lista automáticamente', async () => {
            const item = await seedItem('Ocultar');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);

            const list = await prisma.userItemList.create({
                data: { name: 'L1', ownerId: MOCK_USER_ID, items: { connect: { id: item.id } } },
            });

            // Usamos el endpoint de borrar/ocultar un item del gateway
            await request(app.getHttpServer())
                .delete(`${GATEWAY_PATH}/${item.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            const updatedList = await prisma.userItemList.findUnique({
                where: { id: list.id },
                include: { items: true },
            });
            expect(updatedList?.items).toHaveLength(0);
        });

        it('24. Borrar un ítem de la DB debe sacarlo de todas las listas (Prisma Cascade)', async () => {
            const item = await seedItem('DB Delete');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);

            const list = await prisma.userItemList.create({
                data: { name: 'L1', ownerId: MOCK_USER_ID, items: { connect: { id: item.id } } },
            });

            await prisma.item.delete({ where: { id: item.id } });

            const updatedList = await prisma.userItemList.findUnique({
                where: { id: list.id },
                include: { items: true },
            });
            expect(updatedList?.items).toHaveLength(0);
        });

        it('25. Borrar el usuario debe borrar sus listas (User Cascade)', async () => {
            await prisma.userItemList.create({ data: { name: 'UserList', ownerId: MOCK_USER_ID } });
            await prisma.user.delete({ where: { id: MOCK_USER_ID } });

            const lists = await prisma.userItemList.findMany({ where: { ownerId: MOCK_USER_ID } });
            expect(lists).toHaveLength(0);
        });

        it('26. Unsubscribe no debe afectar las listas de OTROS usuarios', async () => {
            const item = await seedItem('Shared');

            await subscribeUser(MOCK_USER_ID, item.id as UUID);
            await subscribeUser(OTHER_USER_ID, item.id as UUID);

            await prisma.userItemList.create({
                data: { name: 'LA', ownerId: MOCK_USER_ID, items: { connect: { id: item.id } } },
            });
            const listB = await prisma.userItemList.create({
                data: { name: 'LB', ownerId: OTHER_USER_ID, items: { connect: { id: item.id } } },
            });

            await request(app.getHttpServer())
                .patch(`${GATEWAY_PATH}/unsubscribe/${item.id}`)
                .set('x-user-id', MOCK_USER_ID);

            const resB = await prisma.userItemList.findUnique({ where: { id: listB.id }, include: { items: true } });
            expect(resB?.items).toHaveLength(1); // Usuario B sigue teniendo el ítem
        });

        it('27. Verificar que la metadata de los items se devuelva correctamente', async () => {
            const item = await seedItem('Meta');
            await subscribeUser(MOCK_USER_ID, item.id as UUID);

            const list = await prisma.userItemList.create({ data: { name: 'L1', ownerId: MOCK_USER_ID } });

            await request(app.getHttpServer())
                .patch(`${BASE_PATH}/item/${list.id}`)
                .set('x-user-id', MOCK_USER_ID)
                .send({ itemId: item.id });

            const { body } = await request(app.getHttpServer())
                .get(`${BASE_PATH}/${list.id}`)
                .set('x-user-id', MOCK_USER_ID);

            expect(body.items[0]).toHaveProperty('latestClassification');
        });
    });
});
