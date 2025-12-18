// reports.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from '../reports.controller';
import { ReportService } from '../reports.service';
import { MOCK_USER_ID, mockAuthenticatedRequest } from '../../__mocks__/shared.mock';
import { CreateReportDto } from '../dto/create-report.dto';

describe('ReportController', () => {
    let controller: ReportController;
    let service: ReportService;

    const mockReportService = {
        generateReport: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportController],
            providers: [{ provide: ReportService, useValue: mockReportService }],
        }).compile();

        controller = module.get<ReportController>(ReportController);
        service = module.get<ReportService>(ReportService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('generateReport', () => {
        it('debe llamar al servicio con el userId del request y los datos del body', async () => {
            const dto: CreateReportDto = { title: 'Test Report', content: 'Description' } as any;
            mockReportService.generateReport.mockResolvedValue({ id: 'report-1', ...dto });

            await controller.generateReport(mockAuthenticatedRequest, dto);

            expect(mockReportService.generateReport).toHaveBeenCalledWith(MOCK_USER_ID, dto);
        });
    });
});
