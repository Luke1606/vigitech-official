import type { UUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Frequency, NotificationChannel, Theme, Language } from '@prisma/client';

/**
 * DTO para la creación de preferencias de usuario predeterminadas.
 * Define la estructura para establecer las preferencias iniciales de un usuario,
 * incluyendo la frecuencia de análisis, la frecuencia de actualización de recomendaciones,
 * el tema, el idioma y el canal de notificación por defecto.
 */
export class CreateDefaultUserPreferenceDto {
    /**
     * La referencia al ID del usuario al que pertenecen estas preferencias.
     * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
     */
    @ApiProperty({
        description: 'Referencia al ID del usuario',
        format: 'uuid',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    userId!: UUID;

    /**
     * Frecuencia con la que se realizará el análisis de los ítems que el usuario sigue.
     * Por defecto es `Frequency.WEEKLY`.
     * @example "WEEKLY"
     */
    @ApiProperty({
        description: 'Frecuencia en la que realizar el análisis de los ítems a los que el usuario sigue',
        enum: Frequency,
        example: Frequency.WEEKLY,
    })
    @IsOptional()
    @IsEnum(Frequency)
    analysisFrequency?: Frequency = Frequency.WEEKLY;

    /**
     * Frecuencia con la que se renovarán las recomendaciones de ítems para el usuario.
     * Por defecto es `Frequency.DAILY`.
     * @example "DAILY"
     */
    @ApiProperty({
        description: 'Frecuencia en la que renovar las recomendaciones de ítems para el usuario',
        enum: Frequency,
        example: Frequency.DAILY,
    })
    @IsOptional()
    @IsEnum(Frequency)
    recommendationsUpdateFrequency?: Frequency = Frequency.DAILY;

    /**
     * Tema preferido por el usuario para la interfaz.
     * Es opcional y por defecto es `Theme.SYSTEM`.
     * @example "SYSTEM"
     */
    @ApiProperty({
        description: 'Tema preferido por el usuario para la interfaz',
        enum: Theme,
        example: Theme.SYSTEM,
    })
    @IsOptional()
    @IsEnum(Theme)
    theme?: Theme = Theme.SYSTEM;

    /**
     * Idioma preferido por el usuario para la aplicación.
     * Es opcional y por defecto es `Language.ES` (Español).
     * @example "ES"
     */
    @ApiProperty({
        description: 'Idioma preferido por el usuario para la aplicación',
        enum: Language,
        example: Language.ES,
    })
    @IsOptional()
    @IsEnum(Language)
    language?: Language = Language.ES;

    /**
     * Canal de notificaciones predeterminado preferido por el usuario.
     * Es opcional y por defecto es `NotificationChannel.IN_APP`.
     * @example "IN_APP"
     */
    @ApiProperty({
        description: 'Canal de notificaciones predeterminado preferido por el usuario',
        enum: NotificationChannel,
        example: NotificationChannel.IN_APP,
    })
    @IsOptional()
    @IsEnum(NotificationChannel)
    defaultNotificationChannel?: NotificationChannel = NotificationChannel.IN_APP;
}
