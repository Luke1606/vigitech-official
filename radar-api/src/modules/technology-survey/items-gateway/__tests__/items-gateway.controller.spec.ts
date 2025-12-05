import { Test, TestingModule } from '@nestjs/testing';
import { ItemsGatewayController } from '../items-gateway.controller';
import { ItemsGatewayService } from '../items-gateway.service';
import { Item, UserSubscribedItem } from '@prisma/client';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { CreateUnclassifiedItemDto } from '../../shared/dto/create-unclassified-item.dto';
import { UUID } from 'crypto';

const MOCK_USER_ID: UUID = 'user-id-123' as UUID;
const MOCK_ITEM_ID: UUID = 'item-id-456' as UUID;

const mockAuthenticatedRequest = {
    userId: MOCK_USER_ID,
} as AuthenticatedRequest;

const mockItem: Item = {
    id: MOCK_ITEM_ID,
    title: 'Test Item',
    summary: 'This is a test item.',
    itemField: 'BUSSINESS_INTEL',
    createdAt: new Date(),
    updatedAt: new Date(),
    latestClassificationId: 'classification-id-789',
    insertedById: MOCK_USER_ID,
} as Item;

const mockUserSubscribedItem: UserSubscribedItem = {
    id: 'sub-id-123',
    userId: MOCK_USER_ID,
    itemId: MOCK_ITEM_ID,
    createdAt: new Date(),
};

const mockItemsGatewayService = {
    findAllRecommended: jest.fn(),
    findAllSubscribed: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    subscribeOne: jest.fn(),
    unsubscribeOne: jest.fn(),
    removeOne: jest.fn(),
    createBatch: jest.fn(),
    subscribeBatch: jest.fn(),
    unsubscribeBatch: jest.fn(),
    removeBatch: jest.fn(),
};

describe('ItemsGatewayController', () => {
    let controller: ItemsGatewayController;
    let service: typeof mockItemsGatewayService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ItemsGatewayController],
            providers: [
                {
                    provide: ItemsGatewayService,
                    useValue: mockItemsGatewayService,
                },
            ],
        }).compile();

        controller = module.get<ItemsGatewayController>(ItemsGatewayController);
        service = module.get(ItemsGatewayService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // --- Pruebas de Lectura ---

    describe('GET /recommended', () => {
        it('should call findAllRecommended with the userId', async () => {
            service.findAllRecommended.mockResolvedValue([mockItem]);
            const result = await controller.findAllRecommendations(mockAuthenticatedRequest);
            expect(result).toEqual([mockItem]);
            expect(service.findAllRecommended).toHaveBeenCalledWith(MOCK_USER_ID);
        });
    });

    describe('GET /subscribed', () => {
        it('should call findAllSubscribed with the userId', async () => {
            service.findAllSubscribed.mockResolvedValue([mockItem]);
            const result = await controller.findAllSubscribed(mockAuthenticatedRequest);
            expect(result).toEqual([mockItem]);
            expect(service.findAllSubscribed).toHaveBeenCalledWith(MOCK_USER_ID);
        });
    });

    describe('GET /:id', () => {
        it('should call findOne with the itemId and the userId', async () => {
            service.findOne.mockResolvedValue(mockItem);
            const result = await controller.findOne(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toEqual(mockItem);
            expect(service.findOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    describe('POST /create', () => {
        it('should call create with the data and userId', async () => {
            const createDto: CreateUnclassifiedItemDto = {
                title: 'New Item',
                summary: 'Summary of new item',
            };
            service.create.mockResolvedValue(undefined);
            const result = await controller.create(createDto, mockAuthenticatedRequest);
            expect(result).toBeUndefined();
            expect(service.create).toHaveBeenCalledWith(createDto, MOCK_USER_ID);
        });
    });

    // --- Pruebas de Suscripción (Patch) ---

    describe('PATCH /subscribe/:id', () => {
        it('should call subscribeOne with the itemId and the userId', async () => {
            service.subscribeOne.mockResolvedValue(mockUserSubscribedItem);
            const result = await controller.subscribe(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toEqual(mockUserSubscribedItem);
            expect(service.subscribeOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    describe('PATCH /unsubscribe/:id', () => {
        it('should call unsubscribeOne with the itemId and the userId', async () => {
            service.unsubscribeOne.mockResolvedValue(undefined);
            const result = await controller.unsubscribe(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toBeUndefined();
            expect(service.unsubscribeOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    // --- Pruebas de Ocultar (Delete/Patch) ---

    describe('DELETE /:id (removeOne)', () => {
        it('should call removeOne with the itemId and the userId', async () => {
            service.removeOne.mockResolvedValue(undefined); // removeOne returns void
            const result = await controller.remove(MOCK_ITEM_ID, mockAuthenticatedRequest);
            expect(result).toBeUndefined();
            expect(service.removeOne).toHaveBeenCalledWith(MOCK_ITEM_ID, MOCK_USER_ID);
        });
    });

    // --- Pruebas de Lote (Batch) ---

    describe('PATCH /create/batch', () => {
        it('should call createBatch with the array of DTOs and userId', async () => {
            const createDtos: CreateUnclassifiedItemDto[] = [{ title: 'Batch Item 1', summary: 'Summary 1' }];
            service.createBatch.mockResolvedValue(undefined);

            const result = await controller.createBatch(createDtos, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.createBatch).toHaveBeenCalledWith(createDtos, MOCK_USER_ID);
        });
    });

    describe('PATCH /subscribe/batch', () => {
        it('should call subscribeBatch with the array of IDs and the userId', async () => {
            const itemIds = [MOCK_ITEM_ID];
            service.subscribeBatch.mockResolvedValue(undefined);

            const result = await controller.subscribeBatch(itemIds, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.subscribeBatch).toHaveBeenCalledWith(itemIds, MOCK_USER_ID);
        });
    });

    describe('PATCH /unsubscribe/batch', () => {
        it('should call unsubscribeBatch with the array of IDs and the userId', async () => {
            const itemIds = [MOCK_ITEM_ID];
            service.unsubscribeBatch.mockResolvedValue(undefined);

            const result = await controller.unsubscribeBatch(itemIds, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.unsubscribeBatch).toHaveBeenCalledWith(itemIds, MOCK_USER_ID);
        });
    });

    describe('DELETE /batch (removeBatch)', () => {
        it('should call removeBatch with the array of IDs and the userId', async () => {
            const itemIds = [MOCK_ITEM_ID];
            service.removeBatch.mockResolvedValue(undefined);

            const result = await controller.removeBatch(itemIds, mockAuthenticatedRequest);

            expect(result).toBeUndefined();
            expect(service.removeBatch).toHaveBeenCalledWith(itemIds, MOCK_USER_ID);
        });
    });
});
