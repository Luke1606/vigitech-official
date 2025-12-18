import { Test, TestingModule } from '@nestjs/testing';
import { UserItemListsController } from '../user-item-lists.controller';
import { UserItemListsService } from '../user-item-lists.service';
import {
    MOCK_LIST_ID,
    MOCK_USER_ID,
    MOCK_ITEM_ID,
    mockUserItemList,
    mockUserItemListsService,
    mockAuthenticatedRequest,
} from '../../__mocks__/shared.mock';
import { CreateUserItemListDto } from '../dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from '../dto/update-user-item-list.dto';

describe('UserItemListsController', () => {
    let controller: UserItemListsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserItemListsController],
            providers: [{ provide: UserItemListsService, useValue: mockUserItemListsService }],
        }).compile();

        controller = module.get<UserItemListsController>(UserItemListsController);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('debe llamar a findAll del servicio con el userId', async () => {
            mockUserItemListsService.findAll.mockResolvedValue([mockUserItemList]);
            const result = await controller.findAll(mockAuthenticatedRequest);
            expect(result).toEqual([mockUserItemList]);
            expect(mockUserItemListsService.findAll).toHaveBeenCalledWith(MOCK_USER_ID);
        });
    });

    describe('findOne', () => {
        it('debe llamar a findOne del servicio con el id de la lista', async () => {
            mockUserItemListsService.findOne.mockResolvedValue(mockUserItemList);
            const result = await controller.findOne(MOCK_LIST_ID);
            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.findOne).toHaveBeenCalledWith(MOCK_LIST_ID);
        });
    });

    describe('createList', () => {
        it('debe llamar a createList del servicio con el DTO y userId', async () => {
            mockUserItemListsService.createList.mockResolvedValue(mockUserItemList);
            const createDto: CreateUserItemListDto = { name: 'Test List' };

            const result = await controller.createList(createDto, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.createList).toHaveBeenCalledWith(MOCK_USER_ID, createDto);
        });
    });

    describe('updateList', () => {
        it('debe llamar a updateList del servicio', async () => {
            const updateDto: UpdateUserItemListDto = { name: 'Updated Title' };
            mockUserItemListsService.updateList.mockResolvedValue(mockUserItemList);

            const result = await controller.updateList(MOCK_LIST_ID, updateDto, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.updateList).toHaveBeenCalledWith(MOCK_USER_ID, MOCK_LIST_ID, updateDto);
        });
    });

    describe('removeList', () => {
        it('debe llamar a removeList del servicio', async () => {
            mockUserItemListsService.removeList.mockResolvedValue(mockUserItemList);

            const result = await controller.removeList(MOCK_LIST_ID, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.removeList).toHaveBeenCalledWith(MOCK_USER_ID, MOCK_LIST_ID);
        });
    });

    describe('appendOneItem', () => {
        it('debe llamar a appendOneItem del servicio', async () => {
            const listWithItem = { ...mockUserItemList, items: [{ id: MOCK_ITEM_ID }] };
            mockUserItemListsService.appendOneItem.mockResolvedValue(listWithItem);

            const result = await controller.appendOneItem(MOCK_LIST_ID, MOCK_ITEM_ID, mockAuthenticatedRequest);

            expect(result).toEqual(listWithItem);
            expect(mockUserItemListsService.appendOneItem).toHaveBeenCalledWith(
                MOCK_USER_ID,
                MOCK_LIST_ID,
                MOCK_ITEM_ID,
            );
        });
    });

    describe('appendAllItems', () => {
        it('debe llamar a appendAllItems (Batch) del servicio', async () => {
            const itemIds = [MOCK_ITEM_ID];
            mockUserItemListsService.appendAllItems.mockResolvedValue(mockUserItemList);

            const result = await controller.appendAllItems(MOCK_LIST_ID, itemIds, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.appendAllItems).toHaveBeenCalledWith(MOCK_USER_ID, MOCK_LIST_ID, itemIds);
        });
    });

    describe('removeOneItem', () => {
        it('debe llamar a removeOneItem del servicio', async () => {
            mockUserItemListsService.removeOneItem.mockResolvedValue(mockUserItemList);

            const result = await controller.removeOneItem(MOCK_LIST_ID, MOCK_ITEM_ID, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.removeOneItem).toHaveBeenCalledWith(
                MOCK_USER_ID,
                MOCK_LIST_ID,
                MOCK_ITEM_ID,
            );
        });
    });

    describe('removeAllItems', () => {
        it('debe llamar a removeAllItems (Batch) del servicio', async () => {
            const itemIds = [MOCK_ITEM_ID];
            mockUserItemListsService.removeAllItems.mockResolvedValue(mockUserItemList);

            const result = await controller.removeAllItems(MOCK_LIST_ID, itemIds, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.removeAllItems).toHaveBeenCalledWith(MOCK_USER_ID, MOCK_LIST_ID, itemIds);
        });
    });
});
