import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * Módulo para la gestión de usuarios.
 * Proporciona y exporta `UsersService` para la interacción con los datos de usuario.
 * @module Users
 */
@Module({
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
