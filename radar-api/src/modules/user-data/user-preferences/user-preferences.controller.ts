import type { UUID } from 'crypto';
import { Get, Post, Body, Patch, Param, Logger, Controller, ParseUUIDPipe, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreferencesService } from './user-preferences.service';

/**
 * Controlador para la gestión de las preferencias de usuario.
 * Proporciona endpoints para crear, obtener y actualizar las preferencias de un usuario.
 */
@Controller('preferences')
export class UserPreferencesController {
    private readonly logger: Logger;

    constructor(private readonly userPreferencesService: UserPreferencesService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    /**
     * Busca las preferencias actuales del usuario autenticado.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserPreferences o null si no se encuentran.
     */
    @Get()
    findActualUserPreferences(@Req() request: AuthenticatedRequest) {
        this.logger.log('Executed findActualUserPreferences');
        const userId: UUID = request.userId as UUID;
        return this.userPreferencesService.findActualUserPreferences(userId);
    }

    /**
     * Crea o devuelve las preferencias predeterminadas para el usuario autenticado.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserPreferences creado o existente.
     */
    @Post()
    createOrReturnToDefault(@Req() request: AuthenticatedRequest) {
        this.logger.log('Executed createOrReturnToDefault');
        const userId: UUID = request.userId as UUID;
        return this.userPreferencesService.createOrReturnToDefault(userId);
    }

    /**
     * Actualiza las preferencias de un usuario.
     * @param id El UUID de las preferencias a actualizar.
     * @param newPreferences El DTO con las nuevas preferencias.
     * @returns Una Promesa que resuelve con el objeto UserPreferences actualizado.
     */
    @Patch(':id')
    update(@Param('id', new ParseUUIDPipe()) id: UUID, @Body() newPreferences: UpdateUserPreferenceDto) {
        this.logger.log('Executed update');
        return this.userPreferencesService.update(newPreferences);
    }
}
