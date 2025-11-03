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

    describe('createList', () => {
        it('debe llamar a createList del servicio con el DTO y userId', async () => {
            mockUserItemListsService.createList.mockResolvedValue(mockUserItemList);
            const createDto: CreateUserItemListDto = { name: 'Test List' };

            const result = await controller.createList(createDto, mockAuthenticatedRequest);

            expect(result).toEqual(mockUserItemList);
            expect(mockUserItemListsService.createList).toHaveBeenCalledWith(MOCK_USER_ID, createDto);
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
});
