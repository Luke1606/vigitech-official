import { Test, TestingModule } from '@nestjs/testing';
import { SurveyItemsService } from '../survey-items.service';
import { PrismaClient } from '@prisma/client';
import { ItemAnalysisService } from '../../item-analysis/item-analysis.service';
import {
    MOCK_USER_ID,
    MOCK_ITEM_ID,
    mockSurveyItem,
    mockItemAnalysis,
    mockPrismaClient,
    mockItemAnalysisService,
    mockUserSubscribedItem,
    mockUserHiddenItem,
    mockExternalDataUsageService,
} from '../../../shared/__tests__/shared.mock';
import { ExternalDataUsageService } from '../../external-data-usage/external-data-usage.service';

describe('SurveyItemsService', () => {
    let service: SurveyItemsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SurveyItemsService,
                { provide: PrismaClient, useValue: mockPrismaClient },
                { provide: ItemAnalysisService, useValue: mockItemAnalysisService },
                { provide: ExternalDataUsageService, useValue: mockExternalDataUsageService },
            ],
        }).compile();

        service = module.get<SurveyItemsService>(SurveyItemsService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('debe devolver un item con su último análisis, oculto y suscripción', async () => {
            (mockPrismaClient.surveyItem.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);
            mockItemAnalysisService.findLastAnalysisFromItem.mockResolvedValue(mockItemAnalysis);
            (mockPrismaClient.userSubscribedItem.findMany as jest.Mock).mockResolvedValue([mockUserSubscribedItem]);
            (mockPrismaClient.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(mockUserHiddenItem);

            const result = await service.findOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(result).toEqual(
                expect.objectContaining({
                    item: mockSurveyItem,
                    lastAnalysis: mockItemAnalysis,
                    isSubscribed: true,
                    isHidden: true,
                }),
            );
        });

        it('debe devolver isSubscribed e isHidden en false si no se encuentran registros', async () => {
            (mockPrismaClient.surveyItem.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);
            mockItemAnalysisService.findLastAnalysisFromItem.mockResolvedValue(mockItemAnalysis);
            (mockPrismaClient.userSubscribedItem.findMany as jest.Mock).mockResolvedValue([]);
            (mockPrismaClient.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.findOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(result.isSubscribed).toBe(false);
            expect(result.isHidden).toBe(false);
        });
    });

    describe('subscribeOne', () => {
        it('debe crear una suscripción y devolver el item', async () => {
            (mockPrismaClient.surveyItem.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);
            (mockPrismaClient.userSubscribedItem.create as jest.Mock).mockResolvedValue(mockUserSubscribedItem);

            const result = await service.subscribeOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(result).toEqual(mockSurveyItem);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockPrismaClient.userSubscribedItem.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        userId: MOCK_USER_ID,
                        itemId: MOCK_ITEM_ID,
                    },
                }),
            );
        });
    });
});
