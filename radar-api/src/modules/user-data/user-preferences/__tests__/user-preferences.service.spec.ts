import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/common/services/prisma.service';
import { UserPreferencesService } from '../user-preferences.service';
import { mockPrismaClient, MOCK_USER_ID } from '../../__mocks__/shared.mock';
import { Frequency } from '@prisma/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('UserPreferencesService', () => {
    let service: UserPreferencesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserPreferencesService, { provide: PrismaService, useValue: mockPrismaClient }],
        }).compile();

        service = module.get<UserPreferencesService>(UserPreferencesService);

        // Aseguramos que la propiedad exista en el mock antes de cada test
        if (!mockPrismaClient.userPreferences) {
            (mockPrismaClient as any).userPreferences = {
                findUnique: jest.fn(),
                upsert: jest.fn(),
                update: jest.fn(),
                findMany: jest.fn(),
            };
        }
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findActualUserPreferences', () => {
        it('debe llamar a findUnique con el userId', async () => {
            const mockPrefs = { userId: MOCK_USER_ID };
            (mockPrismaClient.userPreferences.findUnique as jest.Mock).mockResolvedValue(mockPrefs as never);

            const result = await service.findActualUserPreferences(MOCK_USER_ID);

            expect(result).toEqual(mockPrefs);
            expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID },
            });
        });
    });

    describe('createOrSetToDefault', () => {
        it('debe hacer upsert de las preferencias', async () => {
            // Mock de findActualUserPreferences para que devuelva nulo inicialmente
            (mockPrismaClient.userPreferences.findUnique as jest.Mock).mockResolvedValue(null as never);
            (mockPrismaClient.userPreferences.upsert as jest.Mock).mockResolvedValue({ id: 'new-id' } as never);

            await service.createOrSetToDefault(MOCK_USER_ID);

            expect(mockPrismaClient.userPreferences.upsert).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('debe permitir actualizar preferencias del user autenticado', async () => {
            const dto = { recommendationsUpdateFrequency: Frequency.DAILY };
            (mockPrismaClient.userPreferences.update as jest.Mock).mockResolvedValue(dto as never);

            await service.update(MOCK_USER_ID, dto);

            expect(mockPrismaClient.userPreferences.update).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID },
                data: dto,
            });
        });
    });

    describe('findAllPreferences', () => {
        it('debe devolver selección de campos para orquestración', async () => {
            (mockPrismaClient.userPreferences.findMany as jest.Mock).mockResolvedValue([] as never);
            await service.findAllPreferences();
            expect(mockPrismaClient.userPreferences.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ select: expect.any(Object) }),
            );
        });
    });
});
