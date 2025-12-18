// reports.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '../reports.service';
import { PrismaService } from '@/common/services/prisma.service';
import { MOCK_USER_ID } from '../../__mocks__/shared.mock';
import { CreateReportDto } from './dto/create-report.dto';

describe('ReportService', () => {
    let service: ReportService;
    let prisma: PrismaService;

    const mockPrismaService = {
        report: {
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ReportService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        service = module.get<ReportService>(ReportService);
        prisma = module.get<PrismaService>(PrismaService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateReport', () => {
        it('debe crear un reporte en la base de datos conectándolo al creador', async () => {
            const dto: CreateReportDto = { title: 'Test', content: 'Content' } as any;
            const expectedResponse = { id: 'uuid-123', ...dto, creatorId: MOCK_USER_ID };

            mockPrismaService.report.create.mockResolvedValue(expectedResponse);

            const result = await service.generateReport(MOCK_USER_ID, dto);

            expect(result).toEqual(expectedResponse);
            expect(mockPrismaService.report.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    creator: {
                        connect: { id: MOCK_USER_ID },
                    },
                },
            });
        });
    });
});
