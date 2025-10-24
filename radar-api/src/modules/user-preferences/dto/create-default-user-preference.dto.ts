import type { UUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannelOption } from '../../../common/enums/notification-channel-options';
import { FrequencyValue, LanguageValue, ThemeValue } from '../enum/user-preferences-options';
import { Frequency, NotificationChannel, Theme, Language } from '@prisma/client';

export class CreateDefaultUserPreferenceDto {
    @ApiProperty({ description: 'Referencia al usuario' })
    userId!: UUID;

    @ApiProperty({
        description: 'Frecuencia en la que realizar el analisis de los items a los que el usuario sigue',
    })
    @IsString()
    @IsEnum(Frequency)
    analysisFrequency?: Frequency = Frequency.WEEKLY;

    @ApiProperty({
        description: 'Frecuencia en la que renovar las recomendaciones de items para el usuario',
    })
    @IsEnum(FrequencyValue, {
        message: `Los valores permitidos son ${FrequencyValue.join()}`,
    })
    recommendationsUpdateFrequency?: Frequency = Frequency.WEEKLY;

    @ApiProperty({ description: 'Tema preferido por el usuario' })
    @IsString()
    @IsOptional()
    @IsEnum(ThemeValue, {
        message: `Los valores permitidos son ${ThemeValue.join()}`,
    })
    theme?: Theme = Theme.SYSTEM;

    @ApiProperty({ description: 'Idioma preferido por el usuario' })
    @IsString()
    @IsOptional()
    @IsEnum(LanguageValue, {
        message: `Los valores permitidos son ${LanguageValue.join()}`,
    })
    language?: Language = Language.ES;

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
