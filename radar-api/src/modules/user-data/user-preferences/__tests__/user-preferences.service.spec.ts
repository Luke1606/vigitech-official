import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/common/services/prisma.service';
import { UserPreferencesService } from '../user-preferences.service';
import { mockPrismaClient, MOCK_USER_ID } from '../../__mocks__/shared.mock';
import { UUID } from 'crypto';
import { Frequency } from '@prisma/client';

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
                findFirst: jest.fn(),
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
        it('debe llamar a findFirst con el userId', async () => {
            const mockPrefs = { id: 'pref-1', userId: MOCK_USER_ID };
            (mockPrismaClient.userPreferences.findFirst as jest.Mock).mockResolvedValue(mockPrefs);

            const result = await service.findActualUserPreferences(MOCK_USER_ID);

            expect(result).toEqual(mockPrefs);
            expect(mockPrismaClient.userPreferences.findFirst).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID },
            });
        });
    });

    describe('createOrReturnToDefault', () => {
        it('debe hacer upsert de las preferencias', async () => {
            // Mock de findActualUserPreferences para que devuelva nulo inicialmente
            (mockPrismaClient.userPreferences.findFirst as jest.Mock).mockResolvedValue(null);
            (mockPrismaClient.userPreferences.upsert as jest.Mock).mockResolvedValue({ id: 'new-id' });

            await service.createOrReturnToDefault(MOCK_USER_ID);

            expect(mockPrismaClient.userPreferences.upsert).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('debe actualizar preferencias por ID', async () => {
            const dto = { id: 'some-id' as UUID, recommendationsUpdateFrequency: Frequency.DAILY };
            (mockPrismaClient.userPreferences.update as jest.Mock).mockResolvedValue(dto);

            await service.update(dto);

            expect(mockPrismaClient.userPreferences.update).toHaveBeenCalledWith({
                where: { id: dto.id },
                data: dto,
            });
        });
    });

    describe('findAllPreferences', () => {
        it('debe devolver selección de campos para orquestración', async () => {
            (mockPrismaClient.userPreferences.findMany as jest.Mock).mockResolvedValue([]);
            await service.findAllPreferences();
            expect(mockPrismaClient.userPreferences.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ select: expect.any(Object) }),
            );
        });
    });
});
