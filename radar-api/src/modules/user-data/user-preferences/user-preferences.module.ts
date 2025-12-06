import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';

/**
 * Módulo para la gestión de preferencias de usuario.
 * Proporciona los controladores y servicios para manejar
 * las configuraciones y preferencias individuales de cada usuario.
 * @module UserPreferences
 */
@Module({
    controllers: [UserPreferencesController],
    providers: [UserPreferencesService],
    exports: [UserPreferencesService],
})
export class UserPreferencesModule {}
