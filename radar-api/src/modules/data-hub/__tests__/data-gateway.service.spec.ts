import { Test, TestingModule } from '@nestjs/testing';
import { DataGatewayService } from '../data-gateway/data-gateway.service';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { SearchQueryDto } from '../data-gateway/dto/search-query.dto';
import { KnowledgeFragment, RawDataSource, RawDataType } from '@prisma/client';

describe('DataGatewayService', () => {
    let service: DataGatewayService;
    let prisma: PrismaService;
    let aiAgentService: AiAgentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataGatewayService,
                {
                    provide: PrismaService,
                    useValue: {
                        knowledgeFragment: {
                            findMany: jest.fn(),
                        },
                        $queryRaw: jest.fn(),
                    },
                },
                {
                    provide: AiAgentsService,
                    useValue: {
                        generateEmbeddings: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<DataGatewayService>(DataGatewayService);
        prisma = module.get<PrismaService>(PrismaService);
        aiAgentService = module.get<AiAgentsService>(AiAgentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('search', () => {
        const mockKnowledgeFragment: KnowledgeFragment = {
            id: 'fragment1',
            textSnippet: 'Test snippet',
            associatedKPIs: {},
            sourceRawDataId: 'rawData1',
            createdAt: new Date(),
        } as KnowledgeFragment; // Casting because embedding is Unsupported

        it('should perform identity search if query is provided and k is not', async () => {
            const searchQueryDto: SearchQueryDto = {
                query: 'test',
                limit: 10,
                offset: 0,
            };
            (prisma.knowledgeFragment.findMany as jest.Mock).mockResolvedValue([mockKnowledgeFragment]);

            const result = await service.search(searchQueryDto);

            expect(prisma.knowledgeFragment.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [{}, {}, {}, {}],
                    textSnippet: {
                        contains: 'test',
                        mode: 'insensitive',
                    },
                },
                take: 10,
                skip: 0,
            });
            expect(result).toEqual([mockKnowledgeFragment]);
        });

        it('should perform hybrid semantic search if query and k are provided', async () => {
            const searchQueryDto: SearchQueryDto = {
                query: 'semantic query',
                k: 5,
                limit: 10,
                offset: 0,
                sources: [RawDataSource.GITHUB],
                dataTypes: [RawDataType.CODE_ASSET],
            };
            const mockEmbedding = [0.1, 0.2, 0.3];
            (aiAgentService.generateEmbeddings as jest.Mock).mockResolvedValue([mockEmbedding]);
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([mockKnowledgeFragment]);

            const result = await service.search(searchQueryDto);

            expect(aiAgentService.generateEmbeddings).toHaveBeenCalledWith(['semantic query']);
            expect(prisma.$queryRaw).toHaveBeenCalled();
            expect(result).toEqual([mockKnowledgeFragment]);
        });

        it('should perform filtered search if no query is provided', async () => {
            const searchQueryDto: SearchQueryDto = {
                sources: [RawDataSource.NPM],
                dataTypes: [RawDataType.TEXT_CONTENT],
                limit: 5,
                offset: 0,
            };
            (prisma.knowledgeFragment.findMany as jest.Mock).mockResolvedValue([mockKnowledgeFragment]);

            const result = await service.search(searchQueryDto);

            expect(prisma.knowledgeFragment.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [
                        { sourceRawData: { source: { in: [RawDataSource.NPM] } } },
                        { sourceRawData: { dataType: { in: [RawDataType.TEXT_CONTENT] } } },
                        {},
                        {},
                    ],
                },
                take: 5,
                skip: 0,
            });
            expect(result).toEqual([mockKnowledgeFragment]);
        });
    });
});
