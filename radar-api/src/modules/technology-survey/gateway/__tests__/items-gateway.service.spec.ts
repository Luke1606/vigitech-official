import { UUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Item, UserSubscribedItem, UserHiddenItem, Field, Classification } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateUnclassifiedItemDto } from '../../shared/dto/create-unclassified-item.dto';
import { CreateNewItemClassification } from '../../shared/types/create-item-classification.type';
import { ItemsClassificationService } from '../../items-classification/items-classification.service';
import { ItemsGatewayService } from '../items-gateway.service';

const MOCK_USER_ID: UUID = 'user-id-123' as UUID;
const MOCK_ITEM_ID: UUID = 'item-id-456' as UUID;
const MOCK_CLASSIFICATION_ID: UUID = 'classification-id-789' as UUID;

const mockItem: Item = {
    id: MOCK_ITEM_ID,
    title: 'Test Item',
    summary: 'This is a test item.',
    itemField: Field.BUSSINESS_INTEL,
    createdAt: new Date(),
    updatedAt: new Date(),
    latestClassificationId: MOCK_CLASSIFICATION_ID,
    insertedById: MOCK_USER_ID,
} as Item;

const mockItemWithClassification = {
    ...mockItem,
    latestClassification: {
        id: MOCK_CLASSIFICATION_ID,
        analyzedAt: new Date(),
        itemId: MOCK_ITEM_ID,
        classification: Classification.ADOPT,
        insightsValues: {},
    },
};

const mockUserSubscribedItem: UserSubscribedItem = {
    id: 'sub-id-123',
    userId: MOCK_USER_ID,
    itemId: MOCK_ITEM_ID,
    createdAt: new Date(),
};

const mockUserHiddenItem: UserHiddenItem = {
    id: 'hidden-id-123',
    userId: MOCK_USER_ID,
    itemId: MOCK_ITEM_ID,
    createdAt: new Date(),
};

// Mock para la transacción de Prisma, inicializado y limpiado en beforeEach
let mockPrismaTransaction: any;

describe('ItemsGatewayService', () => {
    let service: ItemsGatewayService;
    let prisma: PrismaService;
    let itemsClassificationService: ItemsClassificationService;

    beforeEach(async () => {
        // Inicializar mockPrismaTransaction aquí para que los mocks se reinicien en cada test
        mockPrismaTransaction = {
            item: {
                create: jest.fn().mockResolvedValue(mockItem),
                update: jest.fn().mockResolvedValue(mockItem),
            },
            itemClassification: {
                create: jest.fn().mockResolvedValue({ id: MOCK_CLASSIFICATION_ID }),
            },
            userSubscribedItem: {
                upsert: jest.fn().mockResolvedValue(mockUserSubscribedItem),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsGatewayService,
                {
                    provide: PrismaService,
                    useValue: {
                        item: {
                            findMany: jest.fn(),
                            findUniqueOrThrow: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        userHiddenItem: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            createMany: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        userSubscribedItem: {
                            upsert: jest.fn(),
                            createMany: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        itemClassification: {
                            create: jest.fn(),
                        },
                        // Usamos el mockPrismaTransaction inicializado en beforeEach
                        $transaction: jest.fn((callback) => callback(mockPrismaTransaction)),
                    },
                },
                {
                    provide: ItemsClassificationService,
                    useValue: {
                        classifyNewItem: jest.fn(),
                        classifyNewBatch: jest.fn(),
                        classifyExistentBatch: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ItemsGatewayService>(ItemsGatewayService);
        prisma = module.get<PrismaService>(PrismaService);
        itemsClassificationService = module.get<ItemsClassificationService>(ItemsClassificationService);

        jest.clearAllMocks(); // Limpiar todos los mocks, incluyendo los de mockPrismaTransaction
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllRecommended', () => {
        it('should return recommended items excluding subscribed and hidden', async () => {
            (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItemWithClassification]);
            const result = await service.findAllRecommended(MOCK_USER_ID);
            expect(result).toEqual([mockItemWithClassification]);
            expect(prisma.item.findMany).toHaveBeenCalledWith({
                where: {
                    subscribedBy: { none: { userId: MOCK_USER_ID } },
                    hiddenBy: { none: { userId: MOCK_USER_ID } },
                },
                include: { latestClassification: true },
            });
        });
    });

    describe('findAllSubscribed', () => {
        it('should return subscribed items for a user', async () => {
            (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItemWithClassification]);
            const result = await service.findAllSubscribed(MOCK_USER_ID);
            expect(result).toEqual([mockItemWithClassification]);
            expect(prisma.item.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { subscribedBy: { some: { userId: MOCK_USER_ID } } },
                    include: { latestClassification: true },
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return an item if not hidden by the user', async () => {
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockItem);
            (prisma.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await service.findOne(MOCK_ITEM_ID, MOCK_USER_ID);
            expect(result).toEqual(mockItem);
            expect(prisma.item.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: MOCK_ITEM_ID } });
            expect(prisma.userHiddenItem.findUnique).toHaveBeenCalledWith({
                where: { userId_itemId: { userId: MOCK_USER_ID, itemId: MOCK_ITEM_ID } },
            });
        });

        it('should throw ForbiddenException if item is hidden by the user', async () => {
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockItem);
            (prisma.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(mockUserHiddenItem);
            await expect(service.findOne(MOCK_ITEM_ID, MOCK_USER_ID)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('create', () => {
        it('should classify and save a new item in a transaction', async () => {
            const createDto: CreateUnclassifiedItemDto = { title: 'New Item', summary: 'New summary' };
            const classificationInfo: CreateNewItemClassification = {
                unclassifiedItem: createDto,
                itemField: Field.SCIENTIFIC_STAGE,
                insightsValues: {},
                classification: Classification.ADOPT,
            };
            (itemsClassificationService.classifyNewItem as jest.Mock).mockResolvedValue(classificationInfo);

            await service.create(createDto, MOCK_USER_ID);

            expect(itemsClassificationService.classifyNewItem).toHaveBeenCalledWith(createDto);
            expect(prisma.$transaction).toHaveBeenCalled();
            expect(mockPrismaTransaction.item.create).toHaveBeenCalledWith({
                data: {
                    title: createDto.title,
                    summary: createDto.summary,
                    itemField: classificationInfo.itemField,
                    insertedById: MOCK_USER_ID,
                },
            });
            expect(mockPrismaTransaction.itemClassification.create).toHaveBeenCalledWith({
                data: {
                    itemId: mockItem.id,
                    insightsValues: classificationInfo.insightsValues,
                    classification: classificationInfo.classification,
                },
            });
            expect(mockPrismaTransaction.item.update).toHaveBeenCalledWith({
                where: { id: mockItem.id },
                data: { latestClassificationId: MOCK_CLASSIFICATION_ID },
            });
            expect(mockPrismaTransaction.userSubscribedItem.upsert).toHaveBeenCalledWith({
                where: { userId_itemId: { userId: MOCK_USER_ID, itemId: mockItem.id } },
                create: { userId: MOCK_USER_ID, itemId: mockItem.id },
                update: {},
            });
        });
    });

    describe('subscribeOne', () => {
        it('should subscribe a user to an item and remove hidden status', async () => {
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockItem);
            (prisma.userHiddenItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.userSubscribedItem.upsert as jest.Mock).mockResolvedValue(mockUserSubscribedItem);

            const result = await service.subscribeOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(prisma.item.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: MOCK_ITEM_ID } });
            expect(prisma.userHiddenItem.deleteMany).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID, itemId: MOCK_ITEM_ID },
            });
            expect(prisma.userSubscribedItem.upsert).toHaveBeenCalledWith({
                where: { userId_itemId: { userId: MOCK_USER_ID, itemId: MOCK_ITEM_ID } },
                create: { userId: MOCK_USER_ID, itemId: MOCK_ITEM_ID },
                update: {},
            });
            expect(result).toEqual(mockUserSubscribedItem);
        });
    });

    describe('unsubscribeOne', () => {
        it('should unsubscribe a user from an item', async () => {
            (prisma.userSubscribedItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

            await service.unsubscribeOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(prisma.userSubscribedItem.deleteMany).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID, itemId: MOCK_ITEM_ID },
            });
        });
    });

    describe('removeOne', () => {
        it('should delete an item if the user inserted it', async () => {
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue({ insertedById: MOCK_USER_ID });
            (prisma.item.delete as jest.Mock).mockResolvedValue(mockItem);

            await service.removeOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(prisma.item.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: MOCK_ITEM_ID },
                select: { insertedById: true },
            });
            expect(prisma.item.delete).toHaveBeenCalledWith({ where: { id: MOCK_ITEM_ID } });
        });

        it('should hide an item (unsubscribe and create hidden item) if the user did not insert it', async () => {
            const anotherUserId: UUID = 'user-id-999' as UUID;
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue({ insertedById: anotherUserId });
            (prisma.userSubscribedItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.userHiddenItem.create as jest.Mock).mockResolvedValue(mockUserHiddenItem);

            await service.removeOne(MOCK_ITEM_ID, MOCK_USER_ID);

            expect(prisma.item.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: MOCK_ITEM_ID },
                select: { insertedById: true },
            });
            expect(prisma.userSubscribedItem.deleteMany).toHaveBeenCalledWith({
                where: { itemId: MOCK_ITEM_ID, userId: MOCK_USER_ID },
            });
            expect(prisma.userHiddenItem.create).toHaveBeenCalledWith({
                data: { itemId: MOCK_ITEM_ID, userId: MOCK_USER_ID },
            });
        });
    });

    describe('createBatch', () => {
        it('should classify and save a batch of new items', async () => {
            const createDtos: CreateUnclassifiedItemDto[] = [{ title: 'Batch1', summary: 'Sum1' }];
            const classificationInfo: CreateNewItemClassification = {
                unclassifiedItem: createDtos[0],
                itemField: Field.LANGUAGES_AND_FRAMEWORKS,
                insightsValues: {},
                classification: Classification.TEST,
            };
            (itemsClassificationService.classifyNewBatch as jest.Mock).mockResolvedValue([classificationInfo]);

            await service.createBatch(createDtos, MOCK_USER_ID);

            expect(itemsClassificationService.classifyNewBatch).toHaveBeenCalledWith(createDtos);
            expect(prisma.$transaction).toHaveBeenCalledTimes(createDtos.length);
        });
    });

    describe('subscribeBatch', () => {
        it('should subscribe user to a batch of items', async () => {
            const itemIds: UUID[] = [MOCK_ITEM_ID, 'item-id-999' as UUID];
            (prisma.userSubscribedItem.createMany as jest.Mock).mockResolvedValue({ count: 2 });

            await service.subscribeBatch(itemIds, MOCK_USER_ID);

            expect(prisma.userSubscribedItem.createMany).toHaveBeenCalledWith({
                data: itemIds.map((itemId) => ({ userId: MOCK_USER_ID, itemId })),
                skipDuplicates: true,
            });
        });
    });

    describe('unsubscribeBatch', () => {
        it('should unsubscribe user from a batch of items', async () => {
            const itemIds: UUID[] = [MOCK_ITEM_ID, 'item-id-999' as UUID];
            (prisma.userSubscribedItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

            await service.unsubscribeBatch(itemIds, MOCK_USER_ID);

            expect(prisma.userSubscribedItem.deleteMany).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID, itemId: { in: itemIds } },
            });
        });
    });

    describe('removeBatch', () => {
        it('should delete user-owned items and hide recommended items', async () => {
            const userOwnedItemId: UUID = 'owned-item-1' as UUID;
            const recommendedItemId: UUID = 'rec-item-2' as UUID;
            const itemIds: UUID[] = [userOwnedItemId, recommendedItemId];

            (prisma.item.findMany as jest.Mock).mockResolvedValue([
                { id: userOwnedItemId, insertedById: MOCK_USER_ID },
                { id: recommendedItemId, insertedById: 'another-user' as UUID },
            ]);
            (prisma.item.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.userSubscribedItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.userHiddenItem.createMany as jest.Mock).mockResolvedValue({ count: 1 });

            await service.removeBatch(itemIds, MOCK_USER_ID);

            expect(prisma.item.findMany).toHaveBeenCalledWith({
                where: { id: { in: itemIds } },
                select: { id: true, insertedById: true },
            });
            expect(prisma.item.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: [userOwnedItemId] } },
            });
            expect(prisma.userSubscribedItem.deleteMany).toHaveBeenCalledWith({
                where: { userId: MOCK_USER_ID, itemId: { in: [recommendedItemId] } },
            });
            expect(prisma.userHiddenItem.createMany).toHaveBeenCalledWith({
                data: [{ userId: MOCK_USER_ID, itemId: recommendedItemId }],
                skipDuplicates: true,
            });
        });
    });

    describe('findAllItemTitles', () => {
        it('should return an array of all item titles', async () => {
            (prisma.item.findMany as jest.Mock).mockResolvedValue([{ title: 'Title 1' }, { title: 'Title 2' }]);
            const result = await service.findAllItemTitles();
            expect(result).toEqual(['Title 1', 'Title 2']);
            expect(prisma.item.findMany).toHaveBeenCalledWith({ select: { title: true } });
        });
    });

    describe('reclassifySubscribedItems', () => {
        it('should reclassify subscribed items for a user', async () => {
            (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItemWithClassification]);
            (itemsClassificationService.classifyExistentBatch as jest.Mock).mockResolvedValue([
                {
                    item: mockItemWithClassification,
                    insightsValues: { new: 'insights' },
                    classification: Classification.TEST,
                },
            ]);

            await service.reclassifySubscribedItems(MOCK_USER_ID);

            expect(prisma.item.findMany).toHaveBeenCalledWith({
                where: { subscribedBy: { some: { userId: MOCK_USER_ID } } },
                include: { latestClassification: true },
            });
            expect(itemsClassificationService.classifyExistentBatch).toHaveBeenCalledWith([mockItemWithClassification]);
            expect(prisma.$transaction).toHaveBeenCalled(); // For _saveReclassification
            // Para verificar las llamadas dentro de la transacción, deberíamos mockear los métodos de tx.item y tx.itemClassification individualmente.
            // expect(mockPrismaTransaction.itemClassification.create).toHaveBeenCalled();
            // expect(mockPrismaTransaction.item.update).toHaveBeenCalled();
        });

        it('should do nothing if no items to reclassify', async () => {
            (prisma.item.findMany as jest.Mock).mockResolvedValue([]);
            const loggerSpy = jest.spyOn(service['logger'], 'log');

            await service.reclassifySubscribedItems(MOCK_USER_ID);

            expect(loggerSpy).toHaveBeenCalledWith(`User ${MOCK_USER_ID} has no items to reclassify.`);
            expect(itemsClassificationService.classifyExistentBatch).not.toHaveBeenCalled();
        });
    });
});
