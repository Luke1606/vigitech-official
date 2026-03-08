import { UUID } from 'crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, UserPreferences } from '@prisma/client';
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

        const preferences = await this.prisma.userPreferences.findUnique({
            where: { userId },
        });

        if (preferences) return preferences;
        else {
            try {
                const user = await this.prisma.user.findUniqueOrThrow({
                    where: { id: userId },
                });
                if (!user) throw new NotFoundException('El usuario no existe.');

                return await this.createOrSetToDefault(user.id as UUID);
            } catch (error) {
                this.logger.error(error);
                // Esto no debería pasar nunca, ya que el guard se encarga de insertar el user en la primera petición.
                // Obviamente siempre que clerk detecte que está correctamente autenticado.
                // Osea que si llega a esta sentencia, significa que de alguna forma
                // llegó hasta acá sin estar autenticado.
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
                    throw new NotFoundException('El usuario no existe.');
                return null;
            }
        }
    }

    /**
     * Crea las preferencias predeterminadas para un usuario si no existen,
     * o resetea las preferencias existentes.
     * @param userId El UUID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserPreferences creado o reseteado.
     */
    async createOrSetToDefault(userId: UUID): Promise<UserPreferences> {
        this.logger.log('Executed createOrSetToDefault');
        const defaultPreferences: CreateDefaultUserPreferenceDto = {
            userId,
        };

        return await this.prisma.userPreferences.upsert({
            where: { userId },
            create: defaultPreferences,
            update: defaultPreferences,
        });
    }

    /**
     * Actualiza las preferencias de un usuario.
     * @param newPreferences El DTO con las nuevas preferencias.
     * @returns Una Promesa que resuelve con el objeto UserPreferences actualizado.
     */
    async update(userId: UUID, newPreferences: UpdateUserPreferenceDto) {
        this.logger.log('Executed update');
        const data: CreateDefaultUserPreferenceDto = {
            userId,
            ...newPreferences,
        };

        return await this.prisma.userPreferences.upsert({
            where: { userId },
            create: data,
            update: data,
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
