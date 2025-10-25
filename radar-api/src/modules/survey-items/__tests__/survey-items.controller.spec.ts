import { Test, TestingModule } from '@nestjs/testing';
import { SurveyItemsController } from '../survey-items.controller';
import { SurveyItemsService } from '../survey-items.service';
import {
    MOCK_USER_ID,
    MOCK_ITEM_ID,
    mockSurveyItemWithAnalysis,
    mockUserSubscribedItem,
    mockUserHiddenItem,
    mockAuthenticatedRequest,
    mockSurveyItemsService,
} from '../../../shared/__tests__/shared.mock';

describe('SurveyItemsController', () => {
    let controller: SurveyItemsController;
    let service: typeof mockSurveyItemsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SurveyItemsController],
            providers: [
                {
                    provide: SurveyItemsService,
                    useValue: mockSurveyItemsService,
                },
            ],
        }).compile();

        controller = module.get<SurveyItemsController>(SurveyItemsController);
        service = module.get(SurveyItemsService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(controller).toBeDefined();
    });

    // --- Pruebas de Lectura ---

    describe('GET /recommended', () => {
        it('debe llamar a findAllRecommended con el userId', async () => {
            service.findAllRecommended.mockResolvedValue([mockSurveyItemWithAnalysis]);
            const result = await controller.findAllRecommendations(mockAuthenticatedRequest);
            expect(result).toEqual([mockSurveyItemWithAnalysis]);
            expect(service.findAllRecommended).toHaveBeenCalledWith(MOCK_USER_ID);
        });
    });

    describe('GET /subscribed', () => {
        it('debe llamar a findAllSubscribed con el userId', async () => {
            service.findAllSubscribed.mockResolvedValue([mockSurveyItemWithAnalysis]);
            const result = await controller.findAllSubscribed(mockAuthenticatedRequest);
            expect(result).toEqual([mockSurveyItemWithAnalysis]);
            expect(service.findAllSubscribed).toHaveBeenCalledWith(MOCK_USER_ID);
        });
    });

    describe('GET /:id', () => {
        it('debe llamar a findOne con el itemId y el userId', async () => {
            service.findOne.mockResolvedValue(mockSurveyItemWithAnalysis);
            const result = await controller.findOne(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toEqual(mockSurveyItemWithAnalysis);
            expect(service.findOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    // --- Pruebas de Suscripción (Patch) ---

    describe('PATCH /subscribe/:id', () => {
        it('debe llamar a subscribeOne con el itemId y el userId', async () => {
            service.subscribeOne.mockResolvedValue(mockUserSubscribedItem);
            const result = await controller.subscribe(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toEqual(mockUserSubscribedItem);
            expect(service.subscribeOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    describe('PATCH /unsubscribe/:id', () => {
        it('debe llamar a unsubscribeOne con el itemId y el userId', async () => {
            service.unsubscribeOne.mockResolvedValue(undefined);
            const result = await controller.unsubscribe(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toBeUndefined();
            expect(service.unsubscribeOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    // --- Pruebas de Ocultar (Delete/Patch) ---

    describe('DELETE /:id (removeOne)', () => {
        it('debe llamar a removeOne con el itemId y el userId', async () => {
            service.removeOne.mockResolvedValue(mockUserHiddenItem);
            const result = await controller.remove(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toEqual(mockUserHiddenItem);
            expect(service.removeOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    // --- Pruebas de Lote (Batch) ---

    describe('PATCH /subscribe/batch', () => {
        it('debe llamar a subscribeBatch con el array de IDs y el userId', async () => {
            const itemIds = [MOCK_ITEM_ID];
            service.subscribeBatch.mockResolvedValue(undefined);

            const result = await controller.subscribeBatch(itemIds, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.subscribeBatch).toHaveBeenCalledWith(itemIds, MOCK_USER_ID);
        });
    });

    describe('PATCH /unsubscribe/batch', () => {
        it('debe llamar a unsubscribeBatch con el array de IDs y el userId', async () => {
            const itemIds = [MOCK_ITEM_ID];
            service.unsubscribeBatch.mockResolvedValue(undefined);

            const result = await controller.unsubscribeBatch(itemIds, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.unsubscribeBatch).toHaveBeenCalledWith(itemIds, MOCK_USER_ID);
        });
    });

    describe('DELETE /batch (removeBatch)', () => {
        it('debe llamar a removeBatch con el array de IDs y el userId', async () => {
            const itemIds = [MOCK_ITEM_ID];
            service.removeBatch.mockResolvedValue(undefined);

            const result = await controller.removeBatch(itemIds, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.removeBatch).toHaveBeenCalledWith(itemIds, MOCK_USER_ID);
        });
    });
});
