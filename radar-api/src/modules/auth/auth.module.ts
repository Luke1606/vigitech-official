import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { UsersService } from './users/users.service';
import { ClerkClientProvider } from './providers/clerk.provider';

@Global()
@Module({
    providers: [
        UsersService,
        ClerkClientProvider,
        {
            provide: APP_GUARD,
            useClass: ClerkAuthGuard,
        },
    ],
    exports: ['ClerkClient'],
})
export class AuthModule {}
