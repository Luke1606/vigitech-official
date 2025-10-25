import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { ItemAnalysisService } from '../../item-analysis/item-analysis.service';
import { SurveyItemsService } from '../../survey-items/survey-items.service';
import { ReportsService } from '../reports.service';
import {
    MOCK_USER_ID,
    MOCK_ITEM_ID,
    MOCK_START_DATE,
    MOCK_END_DATE,
    mockSurveyItemWithAnalysis,
    mockItemAnalysis,
    mockPrismaClient,
    mockItemAnalysisService,
    mockSurveyItemsService,
} from '../../../shared/__tests__/shared.mock';

describe('ReportsService', () => {
    let service: ReportsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                { provide: PrismaClient, useValue: mockPrismaClient },
                { provide: ItemAnalysisService, useValue: mockItemAnalysisService },
                { provide: SurveyItemsService, useValue: mockSurveyItemsService },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('generate', () => {
        const itemIds = [MOCK_ITEM_ID];

        it('debe generar el reporte correctamente llamando a los servicios y guardando en DB', async () => {
            // Mocks de dependencias (usamos casting para la compatibilidad con Jest)
            mockSurveyItemsService.findOne.mockResolvedValue(mockSurveyItemWithAnalysis);
            mockItemAnalysisService.findAllInsideIntervalFromObjective.mockResolvedValue([mockItemAnalysis]);

            // Mock de Prisma (Corregido con la definición de MockDelegate)
            (mockPrismaClient.report.create as jest.Mock).mockResolvedValue({ id: 'report-id' });

            const result = await service.generate(itemIds, MOCK_START_DATE, MOCK_END_DATE, MOCK_USER_ID);

            // 3. Verificar la creación del reporte en DB
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockPrismaClient.report.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        startDate: MOCK_START_DATE,
                        endDate: MOCK_END_DATE,
                        items: { connect: [{ id: MOCK_ITEM_ID }] },
                    },
                }),
            );

            // 4. Verificar la estructura del resultado
            expect(result).toEqual([
                {
                    item: mockSurveyItemWithAnalysis.item,
                    analysises: [mockItemAnalysis],
                },
            ]);
        });

        it('debe lanzar un error si un item no se encuentra', async () => {
            // Simular que el item no existe (findOne devuelve null o lanza un error)
            mockSurveyItemsService.findOne.mockResolvedValue(null);

            await expect(service.generate(itemIds, MOCK_START_DATE, MOCK_END_DATE, MOCK_USER_ID)).rejects.toThrow(
                `Id ${MOCK_ITEM_ID} not found`,
            );

            // El reporte no debe guardarse si falla la búsqueda de un ítem
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockPrismaClient.report.create).not.toHaveBeenCalled();
        });
    });
});
