import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeFragment, RawDataSource, RawDataType } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '@/modules/ai-agents/ai-agents.service';
import { DataGatewayService } from '../gateway.service';
import { SearchQueryDto } from '../dto/search-query.dto';

describe('DataGatewayService', () => {
    let service: DataGatewayService;
    let prisma: PrismaService;
    let aiAgentService: AiAgentsService;

    const mockKnowledgeFragment: KnowledgeFragment = {
        id: 'fragment1',
        textSnippet: 'Test snippet',
        associatedKPIs: {},
        sourceRawDataId: 'rawData1',
        createdAt: new Date(),
    } as KnowledgeFragment;

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

    describe('search logic', () => {
        describe('Identity & Filtered Search (findMany)', () => {
            it('should perform identity search if query is provided and k is not', async () => {
                const dto: SearchQueryDto = { query: 'test', limit: 10, offset: 0 };
                (prisma.knowledgeFragment.findMany as jest.Mock).mockResolvedValue([mockKnowledgeFragment]);

                const result = await service.search(dto);

                expect(prisma.knowledgeFragment.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: expect.objectContaining({
                            textSnippet: { contains: 'test', mode: 'insensitive' },
                        }),
                    }),
                );
                expect(result).toEqual([mockKnowledgeFragment]);
            });

            it('should cover startDate and endDate branches (Lines 28, 31)', async () => {
                const start = new Date('2025-01-01');
                const end = new Date('2025-12-31');
                const dto: SearchQueryDto = { limit: 5, offset: 0, startDate: start, endDate: end };

                await service.search(dto);

                expect(prisma.knowledgeFragment.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: {
                            AND: [{}, {}, { createdAt: { gte: start } }, { createdAt: { lte: end } }],
                        },
                    }),
                );
            });

            it('should perform search with sources and dataTypes', async () => {
                const dto: SearchQueryDto = {
                    sources: [RawDataSource.GITHUB],
                    dataTypes: [RawDataType.CODE_ASSET],
                    limit: 5,
                    offset: 0,
                };

                await service.search(dto);

                expect(prisma.knowledgeFragment.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: {
                            AND: [
                                { sourceRawData: { source: { in: [RawDataSource.GITHUB] } } },
                                { sourceRawData: { dataType: { in: [RawDataType.CODE_ASSET] } } },
                                {},
                                {},
                            ],
                        },
                    }),
                );
            });
        });

        describe('Hybrid Semantic Search ($queryRaw)', () => {
            it('should perform hybrid search with all filters (Full SQL path)', async () => {
                const dto: SearchQueryDto = {
                    query: 'semantic',
                    k: 5,
                    limit: 10,
                    offset: 0,
                    sources: [RawDataSource.ARXIV_ORG],
                    startDate: new Date(),
                };

                (aiAgentService.generateEmbeddings as jest.Mock).mockResolvedValue([[0.1, 0.2, 0.3]]);
                (prisma.$queryRaw as jest.Mock).mockResolvedValue([mockKnowledgeFragment]);

                const result = await service.search(dto);

                expect(aiAgentService.generateEmbeddings).toHaveBeenCalledWith(['semantic']);
                expect(prisma.$queryRaw).toHaveBeenCalled();
                expect(result).toEqual([mockKnowledgeFragment]);
            });

            it('should handle hybrid search with NO extra filters (finalWhereClause = empty)', async () => {
                const dto: SearchQueryDto = { query: 'only-semantic', k: 5, limit: 10, offset: 0 };
                (aiAgentService.generateEmbeddings as jest.Mock).mockResolvedValue([[0.1]]);
                (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

                await service.search(dto);

                // Verificamos que no falló la construcción de la query vacía
                expect(prisma.$queryRaw).toHaveBeenCalled();
            });

            it('should handle hybrid search with only dataTypes (partial whereClauses)', async () => {
                const dto: SearchQueryDto = {
                    query: 'test',
                    k: 5,
                    limit: 10,
                    offset: 0,
                    dataTypes: [RawDataType.TEXT_CONTENT],
                };
                (aiAgentService.generateEmbeddings as jest.Mock).mockResolvedValue([[0.1]]);

                await service.search(dto);
                expect(prisma.$queryRaw).toHaveBeenCalled();
            });
        });

        describe('Edge Cases & Branch Protection', () => {
            it('should treat k=0 as an identity search (skips vector logic)', async () => {
                const dto: SearchQueryDto = { query: 'test', k: 0, limit: 10, offset: 0 };
                await service.search(dto);
                expect(aiAgentService.generateEmbeddings).not.toHaveBeenCalled();
                expect(prisma.knowledgeFragment.findMany).toHaveBeenCalled();
            });

            it('should handle empty arrays for sources and dataTypes gracefully', async () => {
                const dto: SearchQueryDto = { query: 'test', sources: [], dataTypes: [], limit: 10, offset: 0 };
                await service.search(dto);

                expect(prisma.knowledgeFragment.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: expect.objectContaining({
                            AND: [{}, {}, {}, {}],
                        }),
                    }),
                );
            });
        });
    });
});
