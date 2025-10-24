import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { UsersService } from './users/users.service';

@Global()
@Module({
    providers: [
        UsersService,
        {
            provide: APP_GUARD,
            useClass: ClerkAuthGuard,
        },
    ],
})
export class AuthModule {}
