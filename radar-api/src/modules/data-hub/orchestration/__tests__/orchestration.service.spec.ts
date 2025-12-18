import { Test, TestingModule } from '@nestjs/testing';
import { RawData, RawDataSource, RawDataType } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { OrchestrationService } from '../orchestration.service';
import { CollectionService } from '../../collection/collection.service';
import { ProcessingService } from '../../processing/processing.service';

describe('OrchestrationService', () => {
    let service: OrchestrationService;
    let collectionService: CollectionService;
    let processingService: ProcessingService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrchestrationService,
                {
                    provide: CollectionService,
                    useValue: {
                        collectAllDataAndSave: jest.fn(),
                    },
                },
                {
                    provide: ProcessingService,
                    useValue: {
                        processRawData: jest.fn(),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        rawData: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<OrchestrationService>(OrchestrationService);
        collectionService = module.get<CollectionService>(CollectionService);
        processingService = module.get<ProcessingService>(ProcessingService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handleDataCollectionCron', () => {
        it('should call collectAllDataAndSave on the collection service', async () => {
            (collectionService.collectAllDataAndSave as jest.Mock).mockResolvedValue([]);

            await service.handleDataCollectionCron();

            expect(collectionService.collectAllDataAndSave).toHaveBeenCalled();
        });
    });

    describe('handleDataProcessingCron', () => {
        it('should find unprocessed raw data and call processRawData on the processing service', async () => {
            const mockRawData: RawData[] = [
                {
                    id: '1',
                    source: RawDataSource.GITHUB,
                    dataType: RawDataType.CODE_ASSET,
                    content: {},
                    collectedAt: new Date(),
                    processedAt: null,
                },
            ];
            (prismaService.rawData.findMany as jest.Mock).mockResolvedValue(mockRawData);
            (processingService.processRawData as jest.Mock).mockResolvedValue(undefined);

            await service.handleDataProcessingCron();

            expect(prismaService.rawData.findMany).toHaveBeenCalledWith({
                where: {
                    processedAt: null,
                },
            });
            expect(processingService.processRawData).toHaveBeenCalledWith(mockRawData);
        });

        it('should not call processRawData if no unprocessed raw data is found', async () => {
            (prismaService.rawData.findMany as jest.Mock).mockResolvedValue([]);
            (processingService.processRawData as jest.Mock).mockResolvedValue(undefined);

            await service.handleDataProcessingCron();

            expect(prismaService.rawData.findMany).toHaveBeenCalledWith({
                where: {
                    processedAt: null,
                },
            });
            expect(processingService.processRawData).not.toHaveBeenCalled();
        });
    });
});
