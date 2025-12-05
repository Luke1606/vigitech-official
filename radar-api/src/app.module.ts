import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { ModulesModule } from './modules/modules.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // 60 seconds
                limit: 10, // 10 requests
            },
        ]),
        CommonModule,
        ConfigModule,
        ModulesModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
