/**
 * Módulo de autenticación global que integra Clerk para la gestión de usuarios.
 * Proporciona `ClerkAuthGuard` para proteger las rutas y el `ClerkClient` para interactuar con la API de Clerk.
 * @module AuthModule
 */
import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { ClerkClientProvider } from './providers/clerk.provider';
import { UsersModule } from '../user-data/users/users.module';

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
