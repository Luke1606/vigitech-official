/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Global()
@Module({
    providers: [
        {
            provide: APP_GUARD,
            useClass: ClerkAuthGuard,
        },
    ],
})
export class AuthModule {}
