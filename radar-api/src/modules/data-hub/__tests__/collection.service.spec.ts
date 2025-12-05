import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/common/services/prisma.service';
import { CollectionService } from '../collection/collection.service';
import { BaseFetcher } from '../collection/base.fetcher';
import { FETCHERS_ARRAY_TOKEN } from '../collection/constants';
import { RawData, RawDataSource, RawDataType, Prisma } from '@prisma/client';

// Mock Fetcher implementation
class MockFetcher extends BaseFetcher {
    constructor(
        private readonly source: RawDataSource,
        private readonly type: RawDataType,
        private readonly mockData: any[],
        private readonly shouldThrowError = false,
    ) {
        super();
    }

    getDataSource(): RawDataSource {
        return this.source;
    }

    getDatatype(): RawDataType {
        return this.type;
    }

    async fetch(): Promise<any[]> {
        if (this.shouldThrowError) {
            throw new Error('Mock fetch error');
        }
        return Promise.resolve(this.mockData);
    }
}

describe('CollectionService', () => {
    let service: CollectionService;
    let prismaService: PrismaService;
    let mockFetchers: MockFetcher[]; // Use MockFetcher type

    beforeEach(async () => {
        // Initialize mockFetchers with instances of MockFetcher
        mockFetchers = [
            new MockFetcher(RawDataSource.GITHUB, RawDataType.CODE_ASSET, [{ repo: 'test1' }]),
            new MockFetcher(RawDataSource.NPM, RawDataType.TEXT_CONTENT, [{ package: 'test2' }]),
            new MockFetcher(RawDataSource.ARXIV_ORG, RawDataType.ACADEMIC_PAPER, [], true),
            new MockFetcher(RawDataSource.HACKER_NEWS, RawDataType.COMMUNITY_POST, [null, { story: 'test3' }]),
        ];

        // Create spies for the fetch method of each mock fetcher
        mockFetchers.forEach((fetcher) => {
            jest.spyOn(fetcher, 'fetch');
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CollectionService,
                {
                    provide: PrismaService,
                    useValue: {
                        rawData: {
                            createManyAndReturn: jest.fn().mockResolvedValue([]),
                        },
                    },
                },
                {
                    provide: FETCHERS_ARRAY_TOKEN,
                    useValue: mockFetchers,
                },
            ],
        }).compile();

        service = module.get<CollectionService>(CollectionService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks(); // Clear mocks after getting service and prismaService
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('collectAllDataAndSave', () => {
        it('should call fetch on all fetchers and save collected data', async () => {
            const expectedRawData: Prisma.RawDataCreateManyInput[] = [
                {
                    source: RawDataSource.GITHUB,
                    dataType: RawDataType.CODE_ASSET,
                    content: { repo: 'test1' },
                },
                {
                    source: RawDataSource.NPM,
                    dataType: RawDataType.TEXT_CONTENT,
                    content: { package: 'test2' },
                },
                {
                    source: RawDataSource.HACKER_NEWS,
                    dataType: RawDataType.COMMUNITY_POST,
                    content: { story: 'test3' },
                },
            ];

            // Configure the mock fetchers to return their data
            (mockFetchers[0].fetch as jest.Mock).mockResolvedValue([{ repo: 'test1' }]);
            (mockFetchers[1].fetch as jest.Mock).mockResolvedValue([{ package: 'test2' }]);
            (mockFetchers[2].fetch as jest.Mock).mockRejectedValue(new Error('Mock fetch error'));
            (mockFetchers[3].fetch as jest.Mock).mockResolvedValue([null, { story: 'test3' }]);

            (prismaService.rawData.createManyAndReturn as jest.Mock).mockResolvedValue(expectedRawData as RawData[]);

            const result = await service.collectAllDataAndSave();

            expect(mockFetchers[0].fetch).toHaveBeenCalled();
            expect(mockFetchers[1].fetch).toHaveBeenCalled();
            expect(mockFetchers[2].fetch).toHaveBeenCalled(); // Even if it throws, it should be called
            expect(mockFetchers[3].fetch).toHaveBeenCalled();
            expect(prismaService.rawData.createManyAndReturn).toHaveBeenCalledWith({
                data: expectedRawData,
                skipDuplicates: true,
            });
            expect(result).toEqual(expectedRawData);
        });

        it('should handle no data collected gracefully', async () => {
            // Re-initialize mockFetchers to return no data
            const emptyDataFetchers = [new MockFetcher(RawDataSource.GITHUB, RawDataType.CODE_ASSET, [])];
            emptyDataFetchers.forEach((fetcher) => {
                jest.spyOn(fetcher, 'fetch');
                (fetcher.fetch as jest.Mock).mockResolvedValue([]);
            });

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CollectionService,
                    {
                        provide: PrismaService,
                        useValue: {
                            rawData: {
                                createManyAndReturn: jest.fn().mockResolvedValue([]),
                            },
                        },
                    },
                    {
                        provide: FETCHERS_ARRAY_TOKEN,
                        useValue: emptyDataFetchers,
                    },
                ],
            }).compile();

            const emptyService = module.get<CollectionService>(CollectionService);
            const emptyPrismaService = module.get<PrismaService>(PrismaService);

            const result = await emptyService.collectAllDataAndSave();

            expect(emptyDataFetchers[0].fetch).toHaveBeenCalled();
            expect(emptyPrismaService.rawData.createManyAndReturn).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should throw an error if Prisma createMany fails', async () => {
            (prismaService.rawData.createManyAndReturn as jest.Mock).mockRejectedValue(new Error('Prisma error'));

            await expect(service.collectAllDataAndSave()).rejects.toThrow('Prisma error');
        });
    });
});
