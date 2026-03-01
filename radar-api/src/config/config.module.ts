import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

/**
 * Módulo global de configuración que carga las variables de entorno
 * y configura el módulo de limitación de peticiones (Throttler).
 */
@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
        }),
        ThrottlerModule.forRootAsync({
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
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
