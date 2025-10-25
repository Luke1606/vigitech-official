import { Test, TestingModule } from '@nestjs/testing';
import { ItemAnalysisService } from '../item-analysis.service';
import { ExternalDataUsageService } from '../../external-data-usage/external-data-usage.service';
import {
    MOCK_ITEM_ID,
    MOCK_START_DATE,
    MOCK_END_DATE,
    mockSurveyItem,
    mockItemAnalysis,
    notFoundError,
    mockPrismaClient,
    mockExternalDataUsageService,
    mockGeneralSearchResult,
    mockInsights,
} from '../../../shared/__tests__/shared.mock';
import { PrismaService } from '../../../common/services/prisma.service';

describe('ItemAnalysisService', () => {
    let service: ItemAnalysisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemAnalysisService,
                { provide: PrismaService, useValue: mockPrismaClient },
                { provide: ExternalDataUsageService, useValue: mockExternalDataUsageService },
            ],
        }).compile();

        service = module.get<ItemAnalysisService>(ItemAnalysisService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('createAndGetAnalysisesFromSurveyItems', () => {
        it('debe llamar a servicios externos, formar DTOs y crear análisis en lote', async () => {
            // Mocks de servicios externos (usamos casting para la compatibilidad con Jest)
            mockExternalDataUsageService.getSurveyItemData.mockResolvedValue(mockGeneralSearchResult);
            mockExternalDataUsageService.getSurveyItemMetricsFromData.mockResolvedValue(mockInsights);

            // Mock de Prisma (Corregido con la definición de MockDelegate)
            (mockPrismaClient.itemAnalysis.createManyAndReturn as jest.Mock).mockResolvedValue([mockItemAnalysis]);

            const itemsToAnalyze = [mockSurveyItem];
            const result = await service.createAndGetAnalysisesFromSurveyItems(itemsToAnalyze);

            expect(result).toEqual([mockItemAnalysis]);
            expect(mockExternalDataUsageService.getSurveyItemData).toHaveBeenCalledWith(mockSurveyItem);

            // Verificar la llamada a createManyAndReturn
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockPrismaClient.itemAnalysis.createManyAndReturn).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: [
                        {
                            itemId: MOCK_ITEM_ID,
                            dataId: mockGeneralSearchResult.id,
                            metricsId: mockInsights.id,
                        },
                    ],
                }),
            );
        });
    });

    describe('findAllInsideIntervalFromObjective', () => {
        it('debe devolver solo los análisis que caen estrictamente dentro del intervalo', async () => {
            const analysisBefore = { ...mockItemAnalysis, id: 'a1', createdAt: new Date('2022-12-31') };
            const analysisInside = { ...mockItemAnalysis, id: 'a2', createdAt: new Date('2023-06-01') };
            const analysisAfter = { ...mockItemAnalysis, id: 'a3', createdAt: new Date('2024-01-01') };

            // Mock de Prisma (Corregido)
            (mockPrismaClient.itemAnalysis.findMany as jest.Mock).mockResolvedValue([
                analysisBefore,
                analysisInside,
                analysisAfter,
            ]);

            const result = await service.findAllInsideIntervalFromObjective(
                MOCK_ITEM_ID,
                MOCK_START_DATE,
                MOCK_END_DATE,
            );

            // Solo 'analysisInside' debe ser filtrado
            expect(result).toEqual([analysisInside]);
        });
    });

    describe('findLastAnalysisFromItem', () => {
        it('debe devolver el análisis más reciente para un item', async () => {
            // Mock de Prisma (Corregido)
            (mockPrismaClient.itemAnalysis.findFirstOrThrow as jest.Mock).mockResolvedValue(mockItemAnalysis);

            const result = await service.findLastAnalysisFromItem(MOCK_ITEM_ID);

            expect(result).toEqual(mockItemAnalysis);
        });

        it('debe lanzar un error si no se encuentra ningún análisis', async () => {
            (mockPrismaClient.itemAnalysis.findFirstOrThrow as jest.Mock).mockRejectedValue(notFoundError);

            await expect(service.findLastAnalysisFromItem(MOCK_ITEM_ID)).rejects.toThrow(notFoundError);
        });
    });
});
