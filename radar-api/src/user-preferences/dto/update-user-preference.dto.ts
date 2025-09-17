import type { UUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { NotificationChannelOption } from 'src/common/utils/notification-channel-options';
import { Language, Theme } from '../enum/user-preferences-options';

export class UpdateUserPreferenceDto {
	@IsUUID()
	id!: UUID;

	@ApiProperty({ description: 'Frecuencia en la que realizar el analisis de los items a los que el usuario sigue' })
    @IsString()
	@IsOptional()
    analysisFrequency?: string;

	@ApiProperty({ description: 'Frecuencia en la que renovar las recomendaciones de items para el usuario' })
	@IsString()
	@IsOptional()
    recommendationsUpdateFrequency?: string;
    
	@ApiProperty({ description: 'Tema preferido por el usuario' })
	@IsString()
	@IsOptional()
    theme?: Theme;

	@ApiProperty({ description: 'Idioma preferido por el usuario' })
	@IsString()
	@IsOptional()
    language?: Language;

	@ApiProperty({ description: 'Canal de notificaciones predeterminado preferido por el usuario' })
	@IsString()
	@IsOptional()
    defaultNotificationChannel?: NotificationChannelOption;
}
