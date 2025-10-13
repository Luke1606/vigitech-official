import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { SurveyItemsModule } from './modules/survey-items/survey-items.module';
import { UsersModule } from './modules/users/users.module';
// import { UserItemListsModule } from './user-item-lists/user-item-lists.module';

@Module({
    imports: [
        CommonModule,
        ConfigModule,
        SurveyItemsModule,
        UsersModule,
        // UserItemListsModule,
    ],
})
export class AppModule {}
