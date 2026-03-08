import { Test, TestingModule } from '@nestjs/testing';
import { UserItemListsService } from '../user-item-lists.service';
import {
    MOCK_USER_ID,
    MOCK_LIST_ID,
    MOCK_ITEM_ID,
    mockUserItemList,
    notFoundError,
    mockSurveyItem,
} from '../../__mocks__/shared.mock';
import { PrismaService } from '../../../../common/services/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('UserItemListsService', () => {
    let service: UserItemListsService;

    // Definimos un mock local robusto para Prisma
    const mockPrisma = {
        userItemList: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findUniqueOrThrow: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        item: {
            findUniqueOrThrow: jest.fn(),
            findMany: jest.fn(),
        },
        userSubscribedItem: {
            count: jest.fn(),
        },
        userHiddenItem: {
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserItemListsService, { provide: PrismaService, useValue: mockPrisma }],
        }).compile();

        service = module.get<UserItemListsService>(UserItemListsService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('debe devolver todas las listas de un usuario', async () => {
            mockPrisma.userItemList.findMany.mockResolvedValue([mockUserItemList] as never);
            const result = await service.findAll(MOCK_USER_ID);
            expect(result).toEqual([mockUserItemList]);
            expect(mockPrisma.userItemList.findMany).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('debe devolver una lista por ID', async () => {
            mockPrisma.userItemList.findUniqueOrThrow.mockResolvedValue(mockUserItemList as never);
            const result = await service.findOne(MOCK_USER_ID, MOCK_LIST_ID);
            expect(result).toEqual(mockUserItemList);
        });

        it('debe lanzar error si la lista no existe', async () => {
            mockPrisma.userItemList.findUniqueOrThrow.mockResolvedValue(notFoundError as never);
            await expect(service.findOne(MOCK_USER_ID, MOCK_LIST_ID)).resolves.toThrow();
        });
    });

    describe('createList', () => {
        it('debe crear una nueva lista', async () => {
            mockPrisma.userItemList.create.mockResolvedValue(mockUserItemList as never);
            const result = await service.createList(MOCK_USER_ID, { name: 'Test' });
            expect(result).toEqual(mockUserItemList);
        });
    });

    describe('updateList', () => {
        it('debe actualizar una lista', async () => {
            mockPrisma.userItemList.update.mockResolvedValue(mockUserItemList as never);
            const result = await service.updateList(MOCK_USER_ID, MOCK_LIST_ID, { name: 'New' });
            expect(result).toEqual(mockUserItemList);
        });
    });

    describe('removeList', () => {
        it('debe eliminar una lista', async () => {
            mockPrisma.userItemList.delete.mockResolvedValue(mockUserItemList as never);
            const result = await service.removeList(MOCK_USER_ID, MOCK_LIST_ID);
            expect(result).toEqual(mockUserItemList);
        });
    });

    describe('appendOneItem', () => {
        it('debe añadir un item', async () => {
            mockPrisma.item.findUniqueOrThrow.mockResolvedValue(mockSurveyItem as never);
            mockPrisma.userItemList.update.mockResolvedValue(mockUserItemList as never);
            mockPrisma.userSubscribedItem.count.mockResolvedValue(1 as never);
            mockPrisma.userHiddenItem.count.mockResolvedValue(0 as never);
            const result = await service.appendOneItem(MOCK_USER_ID, MOCK_LIST_ID, MOCK_ITEM_ID);
            expect(result).toEqual(mockUserItemList);
        });
    });

    describe('appendAllItems', () => {
        it('debe añadir múltiples items', async () => {
            const itemIds = [MOCK_ITEM_ID];
            mockPrisma.item.findMany.mockResolvedValue([{ id: MOCK_ITEM_ID }] as never);
            mockPrisma.userItemList.update.mockResolvedValue(mockUserItemList as never);
            const result = await service.appendAllItems(MOCK_USER_ID, MOCK_LIST_ID, itemIds);
            expect(result).toEqual(mockUserItemList);
        });

        it('debe lanzar NotFoundException si falta algún item', async () => {
            mockPrisma.item.findMany.mockResolvedValue([] as never);
            await expect(service.appendAllItems(MOCK_USER_ID, MOCK_LIST_ID, [MOCK_ITEM_ID])).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getListItems', () => {
        it('debe obtener los items de una lista', async () => {
            mockPrisma.userItemList.findUnique.mockResolvedValue({ items: [] } as never);
            const result = await service.getListItems(MOCK_USER_ID, MOCK_LIST_ID);
            expect(result).toBeDefined();
            expect(mockPrisma.userItemList.findUnique).toHaveBeenCalled();
        });
    });
});
