import { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { UserPreferences } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { SurveyOrchestratorUserPreferences } from '@/shared/types/survey-orquestrator-user-preferences.type';
import { CreateDefaultUserPreferenceDto } from './dto/create-default-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

/**
 * Servicio para la gestión de las preferencias de usuario.
 * Proporciona métodos para buscar, crear y actualizar las preferencias de un usuario.
 */
@Injectable()
export class UserPreferencesService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    /**
     * Busca las preferencias actuales de un usuario.
     * @param userId El UUID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserPreferences o null si no se encuentran.
     */
    async findActualUserPreferences(userId: UUID): Promise<UserPreferences | null> {
        this.logger.log('Executed findActualUserPreferences');
        return this.prisma.userPreferences.findFirst({
            where: { userId },
        });
    }

    /**
     * Crea las preferencias predeterminadas para un usuario si no existen,
     * o devuelve las preferencias existentes.
     * @param userId El UUID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserPreferences creado o actualizado.
     */
    async createOrReturnToDefault(userId: UUID) {
        this.logger.log('Executed createOrReturnToDefault');
        const defaultPreferences: CreateDefaultUserPreferenceDto = {
            userId,
        };

        const preferences: UserPreferences | null = await this.findActualUserPreferences(userId);

        return await this.prisma.userPreferences.upsert({
            where: { id: preferences?.id },
            create: defaultPreferences,
            update: {
                id: preferences?.id as UUID,
                ...defaultPreferences,
            },
        });
    }

    /**
     * Actualiza las preferencias de un usuario.
     * @param newPreferences El DTO con las nuevas preferencias.
     * @returns Una Promesa que resuelve con el objeto UserPreferences actualizado.
     */
    async update(newPreferences: UpdateUserPreferenceDto) {
        this.logger.log('Executed update');
        return this.prisma.userPreferences.update({
            where: {
                id: newPreferences.id,
            },
            data: newPreferences,
        });
    }

    /**
     * Busca todas las preferencias de todos los usuarios.
     * @returns Una Promesa que resuelve con el objeto UserPreferences[]
     */
    async findAllPreferences(): Promise<SurveyOrchestratorUserPreferences[]> {
        this.logger.log('Executed findAllPreferences for orchestration');

        return this.prisma.userPreferences.findMany({
            select: {
                userId: true,
                recommendationsUpdateFrequency: true,
                reClasificationFrequency: true,
            },
        });
    }
}
