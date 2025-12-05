import { Test, TestingModule } from '@nestjs/testing';
import { RawData, RawDataSource, RawDataType } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { ProcessingService } from '../processing/processing.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';

describe('ProcessingService', () => {
    let service: ProcessingService;
    let prismaService: PrismaService;
    let aiAgentService: AiAgentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProcessingService,
                {
                    provide: PrismaService,
                    useValue: {
                        rawData: {
                            findMany: jest.fn(),
                            updateMany: jest.fn(),
                        },
                        $executeRaw: jest.fn(),
                        $queryRaw: jest.fn(),
                    },
                },
                {
                    provide: AiAgentsService,
                    useValue: {
                        generateResponse: jest.fn(),
                        generateEmbeddings: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ProcessingService>(ProcessingService);
        prismaService = module.get<PrismaService>(PrismaService);
        aiAgentService = module.get<AiAgentsService>(AiAgentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processRawData', () => {
        const mockRawDataBatch: RawData[] = [
            {
                id: 'raw1',
                source: RawDataSource.GITHUB,
                dataType: RawDataType.CODE_ASSET,
                content: { name: 'repo1', description: 'desc1' },
                processedAt: null,
                collectedAt: new Date(),
            },
            {
                id: 'raw2',
                source: RawDataSource.NPM,
                dataType: RawDataType.TEXT_CONTENT,
                content: { name: 'package1', version: '1.0.0' },
                processedAt: null,
                collectedAt: new Date(),
            },
        ];

        it('should process raw data, generate knowledge fragments and update raw data status', async () => {
            const mockAiResponse = {
                fragments: [
                    {
                        textSnippet: 'Snippet 1',
                        associatedKPIs: { kpi1: 'value1' },
                        sourceRawDataId: 'raw1',
                    },
                    {
                        textSnippet: 'Snippet 2',
                        associatedKPIs: { kpi2: 'value2' },
                        sourceRawDataId: 'raw2',
                    },
                ],
            };
            const mockEmbeddings = [
                [0.1, 0.2],
                [0.3, 0.4],
            ];

            (aiAgentService.generateResponse as jest.Mock).mockResolvedValue(mockAiResponse);
            (aiAgentService.generateEmbeddings as jest.Mock).mockResolvedValue(mockEmbeddings);
            (prismaService.$executeRaw as jest.Mock).mockResolvedValue(2); // Number of rows affected
            (prismaService.rawData.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

            await service.processRawData(mockRawDataBatch);

            expect(aiAgentService.generateResponse).toHaveBeenCalled();
            expect(aiAgentService.generateEmbeddings).toHaveBeenCalledWith(['Snippet 1', 'Snippet 2']);
            expect(prismaService.$executeRaw).toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalledWith({
                where: {
                    id: {
                        in: ['raw1', 'raw2'],
                    },
                },
                data: { processedAt: expect.any(Date) },
            });
        });

        it('should log if no raw data is provided', async () => {
            const loggerSpy = jest.spyOn(service['logger'], 'log');
            await service.processRawData([]);
            expect(loggerSpy).toHaveBeenCalledWith('Procesando lote de datos crudos de 0 elementos');
            expect(aiAgentService.generateResponse).not.toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).not.toHaveBeenCalled();
        });

        it('should log if AI response contains no fragments', async () => {
            const loggerSpy = jest.spyOn(service['logger'], 'log');
            (aiAgentService.generateResponse as jest.Mock).mockResolvedValue({ fragments: [] });

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('AI response contained no knowledge fragments.');
            expect(aiAgentService.generateEmbeddings).not.toHaveBeenCalled();
            expect(prismaService.$executeRaw).not.toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalled(); // RawData should still be marked as processed
        });

        it('should handle errors during AI response generation', async () => {
            (aiAgentService.generateResponse as jest.Mock).mockRejectedValue(
                new Error('Error generando texto con Gemini Flash client'),
            );
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('Error during AI response generation', expect.any(Error));
            expect(prismaService.$executeRaw).not.toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalled(); // RawData should still be marked as processed
        });

        it('should handle errors during embedding generation', async () => {
            const mockAiResponse = {
                fragments: [
                    {
                        textSnippet: 'Snippet 1',
                        associatedKPIs: { kpi1: 'value1' },
                        sourceRawDataId: 'raw1',
                    },
                ],
            };
            (aiAgentService.generateResponse as jest.Mock).mockResolvedValue(mockAiResponse);
            (aiAgentService.generateEmbeddings as jest.Mock).mockRejectedValue(
                new Error('Error generando embeddings con el cliente de OpenAI'),
            );
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('Error during embedding generation', expect.any(Error));
            expect(prismaService.$executeRaw).not.toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalled(); // RawData should still be marked as processed
        });

        it('should handle errors during bulk insertion to database', async () => {
            const mockAiResponse = {
                fragments: [
                    {
                        textSnippet: 'Snippet 1',
                        associatedKPIs: { kpi1: 'value1' },
                        sourceRawDataId: 'raw1',
                    },
                ],
            };
            const mockEmbeddings = [[0.1, 0.2]];

            (aiAgentService.generateResponse as jest.Mock).mockResolvedValue(mockAiResponse);
            (aiAgentService.generateEmbeddings as jest.Mock).mockResolvedValue(mockEmbeddings);
            (prismaService.$executeRaw as jest.Mock).mockRejectedValue(new Error('DB insertion error'));
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('Error during bulk knowledge fragment insertion', expect.any(Error));
            expect(prismaService.rawData.updateMany).toHaveBeenCalled(); // RawData should still be marked as processed
        });
    });
});
