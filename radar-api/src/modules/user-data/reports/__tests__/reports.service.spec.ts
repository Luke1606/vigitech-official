import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '../reports.service';
import { PrismaService } from '@/common/services/prisma.service';
import { MOCK_USER_ID } from '../../__mocks__/shared.mock';
import { CreateReportDto } from '../dto/create-report.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UUID } from 'crypto';

describe('ReportService', () => {
    let service: ReportService;

    const mockPrismaService = {
        report: {
            create: jest.fn(),
        },
        item: {
            findMany: jest.fn(),
        },
        logger: {
            log: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ReportService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        service = module.get<ReportService>(ReportService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateReport', () => {
        const createReportDto: CreateReportDto = {
            itemIds: ['item1' as UUID, 'item2' as UUID],
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().getTime() + 86400000).toISOString(), // A day ahead
        };

        it('should create a report successfully', async () => {
            const expectedResponse = { id: 'uuid-123', ...createReportDto, creatorId: MOCK_USER_ID };
            mockPrismaService.report.create.mockResolvedValue(expectedResponse);
            mockPrismaService.item.findMany.mockResolvedValue([{ id: 'item1' }, { id: 'item2' }]);

            const result = await service.generateReport(MOCK_USER_ID, createReportDto);

            expect(result).toEqual(expectedResponse);
            expect(mockPrismaService.report.create).toHaveBeenCalledWith({
                data: {
                    items: {
                        connect: [{ id: 'item1' }, { id: 'item2' }],
                    },
                    startDate: createReportDto.startDate,
                    endDate: createReportDto.endDate,
                    creatorId: MOCK_USER_ID,
                },
                include: {
                    items: true,
                },
            });
        });

        it('should throw BadRequestException if startDate is after endDate', async () => {
            const invalidCreateReportDto = {
                ...createReportDto,
                startDate: new Date(new Date().getTime() + 86400000).toISOString(),
                endDate: createReportDto.startDate,
            };
            await expect(service.generateReport(MOCK_USER_ID, invalidCreateReportDto)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw ForbiddenException if some items are not accessible', async () => {
            mockPrismaService.item.findMany.mockResolvedValue([{ id: 'item1' }]);

            await expect(service.generateReport(MOCK_USER_ID, createReportDto)).rejects.toThrow(ForbiddenException);
        });

        it('should include items in the report', async () => {
            mockPrismaService.item.findMany.mockResolvedValue([{ id: 'item1' }, { id: 'item2' }]);

            await service.generateReport(MOCK_USER_ID, createReportDto);

            expect(mockPrismaService.report.create).toHaveBeenCalledWith({
                data: {
                    items: {
                        connect: [{ id: 'item1' }, { id: 'item2' }],
                    },
                    startDate: createReportDto.startDate,
                    endDate: createReportDto.endDate,
                    creatorId: MOCK_USER_ID,
                },
                include: {
                    items: true,
                },
            });
        });
    });
});
