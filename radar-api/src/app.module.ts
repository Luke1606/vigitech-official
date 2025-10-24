import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { SurveyItemsModule } from './modules/survey-items/survey-items.module';
import { UserItemListsModule } from './modules/user-item-lists/user-item-lists.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [CommonModule, ConfigModule, AuthModule, SurveyItemsModule, UserItemListsModule],
})
export class AppModule {}
