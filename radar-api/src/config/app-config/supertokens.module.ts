/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { 
    SuperTokensModule as NestSuperTokensModule, 
    SuperTokensAuthGuard 
} from 'supertokens-nestjs';

import { AuthModule } from '../../modules/auth/auth.module';
import { AuthConfigService } from '../../modules/auth/auth.service';
import { UsersModule } from '../../modules/users/users.module';

@Module({
    imports: [
        AuthModule,
        NestSuperTokensModule.forRootAsync({
            imports: [
                AuthModule,
                UsersModule
            ],
            inject: [AuthConfigService],
            useFactory: (authConfigService) => {
                const cfg: AuthConfigService =
                    authConfigService as AuthConfigService;
                return {
                    ...cfg.getConfig(),
                    framework: 'express',
                };
            },
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: SuperTokensAuthGuard,
        }
    ],
})
export class SupertokensModule {}
