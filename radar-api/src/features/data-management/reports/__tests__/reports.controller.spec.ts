import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../reports.controller';
import { ReportsService } from '../reports.service';
import {
    MOCK_USER_ID,
    MOCK_ITEM_ID,
    MOCK_START_DATE,
    MOCK_END_DATE,
    mockSurveyItemWithAnalysis,
    mockItemAnalysis,
    mockAuthenticatedRequest,
    mockReportsService,
} from '../../__mocks__/shared.mock';

// Estructura de AnalysisHistoryType para el mock de servicio
const mockAnalysisHistoryType = {
    item: mockSurveyItemWithAnalysis.item,
    analysises: [mockItemAnalysis],
};

describe('ReportsController', () => {
    let controller: ReportsController;
    let service: typeof mockReportsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [
                {
                    provide: ReportsService,
                    useValue: mockReportsService,
                },
            ],
        }).compile();

        controller = module.get<ReportsController>(ReportsController);
        service = module.get(ReportsService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('GET /reports/generate', () => {
        it('debe llamar a generate del servicio con todos los parámetros correctos', async () => {
            // Usamos casting para mockear el resultado
            service.generate.mockResolvedValue([mockAnalysisHistoryType]);

            const itemIds = [MOCK_ITEM_ID];

            // Llamada directa al método del controlador (simulando que los pipes ya actuaron)
            const result = await controller.generate(itemIds, MOCK_START_DATE, MOCK_END_DATE, mockAuthenticatedRequest);

            expect(result).toEqual([mockAnalysisHistoryType]);

            // Verificar que el servicio fue llamado con los datos de la URL/Body y el userId
            expect(service.generate).toHaveBeenCalledWith(itemIds, MOCK_START_DATE, MOCK_END_DATE, MOCK_USER_ID);
        });
    });
});
