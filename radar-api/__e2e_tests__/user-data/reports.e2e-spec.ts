import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { UUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { Field, Item } from '@prisma/client';
import { PrismaService } from '../../src/common/services/prisma.service';
import { CreateReportDto } from '@/modules/user-data/reports/dto/create-report.dto';

describe('Reports E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Constantes para pruebas
    const MOCK_USER_ID: UUID = '7741cb6b-5aca-4f99-b4f8-3d135a92c73b' as UUID;
    const OTHER_USER_ID: UUID = '8ee77858-c243-4021-8e61-590e0d917e8e' as UUID;
    const BEFORE_DATE = '2024-01-15T10:30:00Z';
    const AFTER_DATE = '2024-01-19T10:30:00Z';
    const BASE_PATH: string = '/user-data/report';

    const clean = async () => {
        await prisma.userSubscribedItem.deleteMany();
        await prisma.userHiddenItem.deleteMany();
        await prisma.report.deleteMany();
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

    describe('G1: Auth & Happy Path', () => {
        it('1. Debe denegar el acceso con 401 si falta el x-user-id en $method $path', async () => {
            const item1 = await seedItem('i1');

            const payload: CreateReportDto = {
                itemIds: [item1.id as UUID],
                startDate: BEFORE_DATE,
                endDate: AFTER_DATE,
            };

            await request(app.getHttpServer()).post(BASE_PATH).send(payload).expect(401);
        });

        it('2. Debe generar un reporte exitosamente con usuarios que tienen todos los items necesarios:', async () => {
            const item1 = await seedItem('item1', MOCK_USER_ID);
            const item2 = await seedItem('item2', MOCK_USER_ID);

            await prisma.userSubscribedItem.createMany({
                data: [
                    { userId: MOCK_USER_ID, itemId: item1.id },
                    { userId: MOCK_USER_ID, itemId: item2.id },
                ],
            });

            const payload: CreateReportDto = {
                itemIds: [item1.id as UUID, item2.id as UUID],
                startDate: BEFORE_DATE,
                endDate: AFTER_DATE,
            };

            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .send(payload)
                .set('x-user-id', MOCK_USER_ID)
                .expect(201);

            expect(body).toBeDefined();

            expect((body.items as []).every((item: Item) => [item1, item2].some((it) => it.id === item.id))).toBe(true);
        });
    });

    describe('G2: Acceso a items para reportar (403)', () => {
        it('3. Debe rechazar la generación de un reporte cuando el usuario no tiene uno o más items necesarios #1 Un item creado por otro user:', async () => {
            const item1 = await seedItem('item1', MOCK_USER_ID);
            const otherItem1 = await seedItem('other_item1', OTHER_USER_ID);

            await prisma.userSubscribedItem.createMany({
                data: [{ userId: MOCK_USER_ID, itemId: item1.id }],
            });

            const payload: CreateReportDto = {
                itemIds: [item1.id as UUID, otherItem1.id as UUID],
                startDate: BEFORE_DATE,
                endDate: AFTER_DATE,
            };

            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .send(payload)
                .set('x-user-id', MOCK_USER_ID)
                .expect(403);

            expect(body.message).toContain(
                'En la lista de items a reportar se encontraron items no disponibles para el usuario.',
            );
        });

        it('4. Debe rechazar la generación de un reporte cuando el usuario no tiene uno o más items necesarios #2 Un item valido pero sin suscribir:', async () => {
            const item1 = await seedItem('item1', MOCK_USER_ID);

            const payload: CreateReportDto = {
                itemIds: [item1.id as UUID],
                startDate: BEFORE_DATE,
                endDate: AFTER_DATE,
            };

            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .send(payload)
                .set('x-user-id', MOCK_USER_ID)
                .expect(403);

            expect(body.message).toContain(
                'En la lista de items a reportar se encontraron items no disponibles para el usuario.',
            );
        });

        it('5. Debe rechazar la generación de un reporte cuando el usuario no tiene uno o más items necesarios #3 Un item valido pero oculto:', async () => {
            const item1 = await seedItem('item1', MOCK_USER_ID);

            await prisma.userHiddenItem.createMany({
                data: [{ userId: MOCK_USER_ID, itemId: item1.id }],
            });

            const payload: CreateReportDto = {
                itemIds: [item1.id as UUID],
                startDate: BEFORE_DATE,
                endDate: AFTER_DATE,
            };

            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .send(payload)
                .set('x-user-id', MOCK_USER_ID)
                .expect(403);

            expect(body.message).toContain(
                'En la lista de items a reportar se encontraron items no disponibles para el usuario.',
            );
        });
    });

    describe('G3: Invalid data (400)', () => {
        it('6. Debe rechazar la generación de un reporte cuando la fecha de inicio es posterior a la fecha de fin:', async () => {
            const item1 = await seedItem('item1', MOCK_USER_ID);

            const payload: CreateReportDto = {
                itemIds: [item1.id as UUID],
                startDate: AFTER_DATE,
                endDate: BEFORE_DATE,
            };

            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .send(payload)
                .set('x-user-id', MOCK_USER_ID)
                .expect(400);

            expect(body.message).toContain('La fecha de inicio debe ser anterior a la fecha de fin');
        });

        it('7. Debe rechazar la generación de un reporte cuando no se proporcionan itemIds:', async () => {
            const payload = {
                startDate: BEFORE_DATE,
                endDate: AFTER_DATE,
            };

            await request(app.getHttpServer()).post(BASE_PATH).send(payload).set('x-user-id', MOCK_USER_ID).expect(400);
        });

        it('8. Debe rechazar la generación de un reporte cuando falta el startDate:', async () => {
            const item1 = await seedItem('item1');
            const payload = {
                itemIds: [item1.id as UUID],
                endDate: AFTER_DATE,
            };

            await request(app.getHttpServer()).post(BASE_PATH).send(payload).set('x-user-id', MOCK_USER_ID).expect(400);
        });

        it('9. Debe rechazar la generación de un reporte cuando falta el endDate:', async () => {
            const item1 = await seedItem('item1');
            const payload = {
                itemIds: [item1.id as UUID],
                startDate: BEFORE_DATE,
            };

            await request(app.getHttpServer()).post(BASE_PATH).send(payload).set('x-user-id', MOCK_USER_ID).expect(400);
        });
    });
});
