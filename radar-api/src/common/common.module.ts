import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { UsersModule } from '../modules/users/users.module';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Module({
    imports: [UsersModule],
    providers: [
        HttpExceptionFilter,
        {
            provide: APP_GUARD,
            useClass: ClerkAuthGuard,
        },
    ],
    exports: [HttpExceptionFilter],
})
export class CommonModule {}
