/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { ConfigModule as cfgModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SupertokensModule } from './app-config/supertokens.module';

@Global()
@Module({
    imports: [
        cfgModule.forRoot({
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
        SupertokensModule,
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
