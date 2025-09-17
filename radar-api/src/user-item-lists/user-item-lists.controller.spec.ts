import { Test, TestingModule } from '@nestjs/testing';
import { UserItemListsController } from './user-item-lists.controller';
import { UserItemListsService } from './user-item-lists.service';

describe('UserItemListsController', () => {
    let controller: UserItemListsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserItemListsController],
            providers: [UserItemListsService],
        }).compile();

        controller = module.get<UserItemListsController>(
            UserItemListsController
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
