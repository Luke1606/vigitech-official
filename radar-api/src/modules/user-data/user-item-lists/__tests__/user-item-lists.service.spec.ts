/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserItemListsService } from '../user-item-lists.service';
import {
    MOCK_USER_ID,
    MOCK_LIST_ID,
    MOCK_ITEM_ID,
    mockUserItemList,
    mockPrismaClient,
    notFoundError,
    mockSurveyItem,
} from '../../__mocks__/shared.mock';
import { PrismaService } from '../../../../common/services/prisma.service';

describe('UserItemListsService', () => {
    let service: UserItemListsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserItemListsService, { provide: PrismaService, useValue: mockPrismaClient }],
        }).compile();

        service = module.get<UserItemListsService>(UserItemListsService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('debe devolver todas las listas de un usuario', async () => {
            (mockPrismaClient.userItemList.findMany as jest.Mock).mockResolvedValue([mockUserItemList]);

            const result = await service.findAll(MOCK_USER_ID);

            expect(result).toEqual([mockUserItemList]);
            expect(mockPrismaClient.userItemList.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { ownerId: MOCK_USER_ID } }),
            );
        });
    });

    describe('findOne', () => {
        it('debe devolver una lista por ID y verificar propiedad de usuario', async () => {
            (mockPrismaClient.userItemList.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUserItemList);

            const result = await service.findOne(MOCK_LIST_ID);

            expect(result).toEqual(mockUserItemList);
            expect(mockPrismaClient.userItemList.findUniqueOrThrow).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: MOCK_LIST_ID } }),
            );
        });

        it('debe lanzar Prisma.NotFoundError si la lista no existe o no es del usuario', async () => {
            (mockPrismaClient.userItemList.findUniqueOrThrow as jest.Mock).mockRejectedValue(notFoundError);

            await expect(service.findOne(MOCK_LIST_ID)).rejects.toThrow(notFoundError);
        });
    });

    describe('createList', () => {
        it('debe crear una nueva lista y devolverla', async () => {
            (mockPrismaClient.userItemList.create as jest.Mock).mockResolvedValue(mockUserItemList);
            const createDto = { name: 'Nueva Lista' };

            const result = await service.createList(MOCK_USER_ID, createDto);

            expect(result).toEqual(mockUserItemList);
            expect(mockPrismaClient.userItemList.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { ...createDto, ownerId: MOCK_USER_ID },
                }),
            );
        });
    });

    // Añadir item a la lista (appendOneItem)
    describe('appendOneItem', () => {
        it('debe añadir un item a la lista y devolver la lista actualizada', async () => {
            // Mock para item.findUniqueOrThrow
            (mockPrismaClient.item.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);
            const listWithItem = { ...mockUserItemList, items: [mockSurveyItem] };
            (mockPrismaClient.userItemList.update as jest.Mock).mockResolvedValue(listWithItem);

            const result = await service.appendOneItem(MOCK_USER_ID, MOCK_LIST_ID, MOCK_ITEM_ID);

            expect(result).toEqual(listWithItem);
            expect(mockPrismaClient.item.findUniqueOrThrow).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: MOCK_ITEM_ID } }),
            );
            expect(mockPrismaClient.userItemList.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: MOCK_LIST_ID, ownerId: MOCK_USER_ID },
                    data: { items: { connect: { id: MOCK_ITEM_ID } } },
                }),
            );
        });

        it('debe lanzar Prisma.NotFoundError si el item a añadir no existe', async () => {
            (mockPrismaClient.item.findUniqueOrThrow as jest.Mock).mockRejectedValue(notFoundError);

            await expect(service.appendOneItem(MOCK_USER_ID, MOCK_LIST_ID, MOCK_ITEM_ID)).rejects.toThrow(
                notFoundError,
            );
        });
    });
});
