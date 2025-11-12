import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UserItemListsModule } from './user-item-lists/user-item-lists.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';

@Module({
    imports: [UserItemListsModule, UserPreferencesModule, UsersModule],
})
export class UserDataModule {}
