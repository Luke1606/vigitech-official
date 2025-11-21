import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UserItemListsModule } from './user-item-lists/user-item-lists.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';

/**
 * Módulo principal de `UserData`.
 * Encapsula la lógica relacionada con la gestión de datos del usuario,
 * incluyendo listas de elementos, preferencias y perfiles de usuario.
 * @module UserData
 */
@Module({
    imports: [UserItemListsModule, UserPreferencesModule, UsersModule],
})
export class UserDataModule {}
