import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { ClerkClientProvider } from './providers/clerk.provider';
import { UsersModule } from '../data-management/users/users.module';

@Global()
@Module({
    imports: [UsersModule],
    providers: [
        ClerkClientProvider,
        {
            provide: APP_GUARD,
            useClass: ClerkAuthGuard,
        },
    ],
    exports: ['ClerkClient'],
})
export class AuthModule {}
