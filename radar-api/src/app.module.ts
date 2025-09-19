import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { CommonModule } from './common/common.module';
import { SurveyItemsModule } from './survey-items/survey-items.module';
// import { UserItemListsModule } from './user-item-lists/user-item-lists.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.local',
        }),

        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        ttl: config.get<number>('THROTTLE_TTL', 60),
                        limit: config.get<number>('THROTTLE_LIMIT', 10),
                    },
                ],
            }),
        }),

        CommonModule,
        SurveyItemsModule,
        // UserItemListsModule,
    ],
})
export class AppModule {}
