import { Module } from '@nestjs/common';
import { UserItemListsService } from './user-item-lists.service';
import { UserItemListsController } from './user-item-lists.controller';

@Module({
    controllers: [UserItemListsController],
    providers: [UserItemListsService],
})
export class UserItemListsModule {}
