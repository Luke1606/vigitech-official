import { Module } from '@nestjs/common';
import { SurveyItemsModule } from './survey-items/survey-items.module';
import { UserItemListsModule } from './user-item-lists/user-item-lists.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';

@Module({
    imports: [SurveyItemsModule, ReportsModule, UserItemListsModule, UserPreferencesModule, UsersModule],
})
export class DataManagementModule {}
