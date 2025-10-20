/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { ClerkClientProvider } from './providers/clerk.provider';
import { ClerkAuthGuard } from './guards/clerk.guard';

@Module({
    imports: [PassportModule],
    providers: [
        ClerkStrategy, 
        ClerkClientProvider,
        {
            provide: APP_GUARD,
            useClass: ClerkAuthGuard,
        },
    ],
    exports: [PassportModule, ClerkClientProvider],
})
export class AuthModule {}
