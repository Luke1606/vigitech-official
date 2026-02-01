import { Test, TestingModule } from '@nestjs/testing';
import { RawData, RawDataSource, RawDataType } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { ProcessingService } from '../processing.service';
import { AiAgentsService } from '../../../ai-agents/ai-agents.service';
import { CreateKnowledgeFragment } from '../types/create-knowledge-fragment.type';

describe('ProcessingService', () => {
    let service: ProcessingService;
    let prismaService: PrismaService;
    let aiAgentService: AiAgentsService;

    // Tipos auxiliares para los fragmentos sin embedding (usados en la respuesta de la IA)
    type KnowledgeFragmentWithoutEmbedding = Omit<CreateKnowledgeFragment, 'embedding'>;

    interface KnowledgeAiResponse {
        fragments: KnowledgeFragmentWithoutEmbedding[];
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProcessingService,
                {
                    provide: PrismaService,
                    useValue: {
                        rawData: {
                            updateMany: jest.fn(),
                        },
                        $executeRaw: jest.fn(),
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
                id: 'raw-uuid-1',
                source: RawDataSource.GITHUB,
                dataType: RawDataType.CODE_ASSET,
                content: { name: 'nest-project', stars: 100 },
                processedAt: null,
                collectedAt: new Date(),
            },
            {
                id: 'raw-uuid-2',
                source: RawDataSource.NPM,
                dataType: RawDataType.TEXT_CONTENT,
                content: { package: 'lodash', version: '4.17.21' },
                processedAt: null,
                collectedAt: new Date(),
            },
        ];

        it('should process raw data, generate fragments and update status successfully', async () => {
            // Arreglar: Definimos la respuesta esperada de la IA
            const mockAiResponse: KnowledgeAiResponse = {
                fragments: [
                    {
                        textSnippet: 'Knowledge snippet from GitHub',
                        associatedKPIs: { relevance: 0.9 },
                        sourceRawDataId: 'raw-uuid-1',
                    },
                    {
                        textSnippet: 'Knowledge snippet from NPM',
                        associatedKPIs: { version: 'latest' },
                        sourceRawDataId: 'raw-uuid-2',
                    },
                ],
            };

            const mockEmbeddings = [
                [0.1, 0.2, 0.3],
                [0.4, 0.5, 0.6],
            ];

            // Configuramos los Spies con tipado estricto
            jest.spyOn(aiAgentService, 'generateResponse').mockResolvedValue(mockAiResponse);
            jest.spyOn(aiAgentService, 'generateEmbeddings').mockResolvedValue(mockEmbeddings);

            // Mocks de Prisma
            (prismaService.$executeRaw as jest.Mock).mockResolvedValue(1);
            (prismaService.rawData.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

            // Actuar
            await service.processRawData(mockRawDataBatch);

            // Afirmar
            expect(aiAgentService.generateResponse).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
            expect(aiAgentService.generateEmbeddings).toHaveBeenCalledWith([
                'Knowledge snippet from GitHub',
                'Knowledge snippet from NPM',
            ]);
            expect(prismaService.$executeRaw).toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalledWith({
                where: {
                    id: { in: ['raw-uuid-1', 'raw-uuid-2'] },
                },
                data: { processedAt: expect.any(Date) },
            });
        });

        it('should log and stop if the provided batch is empty', async () => {
            const loggerSpy = jest.spyOn(service['logger'], 'log');

            await service.processRawData([]);

            expect(loggerSpy).toHaveBeenCalledWith('The provided raw data batch is empty. No processing needed.');
            expect(aiAgentService.generateResponse).not.toHaveBeenCalled();
        });

        it('should handle cases where AI returns an empty fragments array', async () => {
            const mockEmptyResponse: KnowledgeAiResponse = { fragments: [] };
            jest.spyOn(aiAgentService, 'generateResponse').mockResolvedValue(mockEmptyResponse);
            const loggerSpy = jest.spyOn(service['logger'], 'log');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('AI response contained no knowledge fragments to create.');
            expect(aiAgentService.generateEmbeddings).not.toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalled(); // Se marca como procesado aunque esté vacío
        });

        it('should handle errors during AI response generation gracefully', async () => {
            jest.spyOn(aiAgentService, 'generateResponse').mockRejectedValue(new Error('LLM Timeout'));
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('Error generando texto con Gemini Flash client', expect.any(Error));
            expect(prismaService.rawData.updateMany).toHaveBeenCalled();
        });

        it('should handle errors during embedding generation', async () => {
            const mockAiResponse: KnowledgeAiResponse = {
                fragments: [{ textSnippet: 'Test', associatedKPIs: {}, sourceRawDataId: 'raw1' }],
            };
            jest.spyOn(aiAgentService, 'generateResponse').mockResolvedValue(mockAiResponse);
            jest.spyOn(aiAgentService, 'generateEmbeddings').mockRejectedValue(new Error('Embedding API Error'));

            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith(
                'Error generando embeddings con el cliente de OpenAI',
                expect.any(Error),
            );
            expect(prismaService.$executeRaw).not.toHaveBeenCalled();
            expect(prismaService.rawData.updateMany).toHaveBeenCalled();
        });

        it('should handle database errors during bulk insertion', async () => {
            const mockAiResponse: KnowledgeAiResponse = {
                fragments: [{ textSnippet: 'Test', associatedKPIs: {}, sourceRawDataId: 'raw1' }],
            };
            jest.spyOn(aiAgentService, 'generateResponse').mockResolvedValue(mockAiResponse);
            jest.spyOn(aiAgentService, 'generateEmbeddings').mockResolvedValue([[0.1]]);

            (prismaService.$executeRaw as jest.Mock).mockRejectedValue(new Error('DB Unique Constraint Error'));
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processRawData(mockRawDataBatch);

            expect(loggerSpy).toHaveBeenCalledWith('Error during bulk insertion to database', expect.any(Error));
            expect(prismaService.rawData.updateMany).toHaveBeenCalled();
        });
    });
});
