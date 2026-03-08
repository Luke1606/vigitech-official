import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { UUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/services/prisma.service';
import { Frequency, Language, NotificationChannel, Theme, UserPreferences } from '@prisma/client';
import { UpdateUserPreferenceDto } from '@/modules/user-data/user-preferences/dto/update-user-preference.dto';

export type PreferencesCheckableFields = Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'>;

describe('User Preferences E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Constantes para pruebas
    const MOCK_USER_ID: UUID = '7741cb6b-5aca-4f99-b4f8-3d135a92c73b' as UUID;
    const BASE_PATH: string = '/user-data/preferences';
    const DEFAULT_PREFERENCES: PreferencesCheckableFields = {
        userId: MOCK_USER_ID,
        reClasificationFrequency: Frequency.EVERY_6_HOURS,
        theme: Theme.SYSTEM,
        recommendationsUpdateFrequency: Frequency.DAILY,
        language: Language.ES,
        defaultNotificationChannel: NotificationChannel.IN_APP,
    };

    const clean = async () => {
        await prisma.userPreferences.deleteMany();
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
            data: [{ id: MOCK_USER_ID, clerkId: MOCK_USER_ID }],
        });
    });

    afterAll(async () => {
        await clean();
        await prisma.$disconnect();
        await app.close();
    });

    const filterToRelevantFields = (data: UserPreferences) => {
        const propertiesToFilter = ['id', 'createdAt', 'updatedAt'];

        return Object.keys(data)
            .filter((key) => !propertiesToFilter.includes(key))
            .reduce((acc, key) => {
                acc[key] = data[key];
                return acc;
            }, {} as PreferencesCheckableFields);
    };

    describe('G1: Auth & Happy Path', () => {
        it('1. Debe denegar el acceso con 401 si falta el x-user-id en $method $path', async () => {
            await request(app.getHttpServer()).get(BASE_PATH).expect(401);
            await request(app.getHttpServer()).post(BASE_PATH).expect(401);
            await request(app.getHttpServer()).patch(BASE_PATH).send({ language: Language.EN }).expect(401);
        });

        it('2. La primera vez que el user se conecte y pida los ajustes debe generar sus ajustes predeterminados y devolverlos correctamente', async () => {
            const { body } = await request(app.getHttpServer())
                .get(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(body).toBeDefined();

            if (body) {
                const filteredReturnedData = filterToRelevantFields(body);
                expect(filteredReturnedData).toEqual(DEFAULT_PREFERENCES);
            }
        });

        it('3. Debe crear preferencias predeterminadas si no existen', async () => {
            const { body } = await request(app.getHttpServer())
                .post(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .expect(201);

            expect(body).toBeDefined();
            expect(filterToRelevantFields(body)).toEqual(DEFAULT_PREFERENCES);
        });

        it('4. Debe permitir actualizar las preferencias del user conectado', async () => {
            const { body: initialPreferences } = await request(app.getHttpServer())
                .get(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .expect(200);

            expect(initialPreferences).toBeDefined();

            if (initialPreferences) {
                const updatedPreferencesDto: UpdateUserPreferenceDto = {
                    reClasificationFrequency: Frequency.EVERY_6_HOURS,
                    theme: Theme.LIGHT,
                };

                const { body: updatedPreferences } = await request(app.getHttpServer())
                    .patch(BASE_PATH)
                    .set('x-user-id', MOCK_USER_ID)
                    .send(updatedPreferencesDto)
                    .expect(200);

                expect(updatedPreferences).toBeDefined();

                if (updatedPreferences) {
                    expect(filterToRelevantFields(updatedPreferences)).toEqual({
                        ...DEFAULT_PREFERENCES,
                        ...updatedPreferencesDto,
                    });
                }
            }
        });
    });

    describe('G2: Sad Path & Edge Cases', () => {
        it('5. Debe devolver 400 si los datos de actualización son inválidos', async () => {
            const invalidUpdatePreferencesDto: UpdateUserPreferenceDto = {
                theme: 'invalid-theme' as Theme, // Valor no válido para el tipo Theme
            };

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(invalidUpdatePreferencesDto)
                .expect(400);
        });

        it('6. Debe devolver 400 si las propiedades a actualizar son inválidas', async () => {
            const invalidUpdatePreferencesDto: UpdateUserPreferenceDto = {
                reClasificationFreq: 'EVERY_35_MINUTES' as Frequency, // Propiedad inexistente
            } as UpdateUserPreferenceDto;

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(invalidUpdatePreferencesDto)
                .expect(400);
        });

        it('7. Debe manejar correctamente el caso en que no se proporciona un valor válido para reClasificationFrequency', async () => {
            const updatePreferencesDto: UpdateUserPreferenceDto = {
                reClasificationFrequency: undefined as unknown as Frequency,
            };

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(updatePreferencesDto)
                .expect(200);
        });

        it('8. Debe manejar correctamente el caso en que no se proporciona un valor válido para recommendationsUpdateFrequency', async () => {
            const updatePreferencesDto: UpdateUserPreferenceDto = {
                recommendationsUpdateFrequency: undefined as unknown as Frequency,
            };

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(updatePreferencesDto)
                .expect(200);
        });

        it('9. Debe manejar correctamente el caso en que no se proporciona un valor válido para theme', async () => {
            const updatePreferencesDto: UpdateUserPreferenceDto = {
                theme: undefined as unknown as Theme,
            };

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(updatePreferencesDto)
                .expect(200);
        });

        it('10. Debe manejar correctamente el caso en que no se proporciona un valor válido para language', async () => {
            const updatePreferencesDto: UpdateUserPreferenceDto = {
                language: undefined as unknown as Language, // Valor nulo
            };

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(updatePreferencesDto)
                .expect(200);
        });

        it('11. Debe manejar correctamente el caso en que no se proporciona un valor válido para defaultNotificationChannel', async () => {
            const updatePreferencesDto: UpdateUserPreferenceDto = {
                defaultNotificationChannel: undefined as unknown as NotificationChannel, // Valor nulo
            };

            await request(app.getHttpServer())
                .patch(BASE_PATH)
                .set('x-user-id', MOCK_USER_ID)
                .send(updatePreferencesDto)
                .expect(200);
        });
    });
});
