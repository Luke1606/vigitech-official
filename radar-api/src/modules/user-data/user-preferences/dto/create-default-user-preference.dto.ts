import type { UUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannelOption } from '../../../../common/enums/notification-channel-options';
import { FrequencyValue, LanguageValue, ThemeValue } from '../enum/user-preferences-options';
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
     */
    @ApiProperty({ description: 'Referencia al usuario' })
    userId!: UUID;

    /**
     * Frecuencia con la que se realizará el análisis de los ítems que el usuario sigue.
     * Por defecto es SEMANAL.
     */
    @ApiProperty({
        description: 'Frecuencia en la que realizar el analisis de los items a los que el usuario sigue',
    })
    @IsString()
    @IsEnum(Frequency)
    analysisFrequency?: Frequency = Frequency.WEEKLY;

    /**
     * Frecuencia con la que se renovarán las recomendaciones de ítems para el usuario.
     * Por defecto es SEMANAL.
     */
    @ApiProperty({
        description: 'Frecuencia en la que renovar las recomendaciones de items para el usuario',
    })
    @IsEnum(FrequencyValue, {
        message: `Los valores permitidos son ${FrequencyValue.join()}`,
    })
    recommendationsUpdateFrequency?: Frequency = Frequency.WEEKLY;

    /**
     * Tema preferido por el usuario para la interfaz.
     * Es opcional y por defecto es SYSTEM.
     */
    @ApiProperty({ description: 'Tema preferido por el usuario' })
    @IsString()
    @IsOptional()
    @IsEnum(ThemeValue, {
        message: `Los valores permitidos son ${ThemeValue.join()}`,
    })
    theme?: Theme = Theme.SYSTEM;

    /**
     * Idioma preferido por el usuario para la aplicación.
     * Es opcional y por defecto es ES (Español).
     */
    @ApiProperty({ description: 'Idioma preferido por el usuario' })
    @IsString()
    @IsOptional()
    @IsEnum(LanguageValue, {
        message: `Los valores permitidos son ${LanguageValue.join()}`,
    })
    language?: Language = Language.ES;

    /**
     * Canal de notificaciones predeterminado preferido por el usuario.
     * Es opcional y por defecto es PUSH.
     */
    @ApiProperty({
        description: 'Canal de notificaciones predeterminado preferido por el usuario',
    })
    @IsString()
    @IsOptional()
    @IsEnum(NotificationChannelOption, {
        message: `Los valores permitidos son ${NotificationChannelOption.join()}`,
    })
    defaultNotificationChannel?: NotificationChannel = NotificationChannel.PUSH;
}
