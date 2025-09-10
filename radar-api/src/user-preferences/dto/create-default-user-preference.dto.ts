import type { UUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { NotificationChannelOption } from 'app/common/utils/notification-channel-options';
import { Language, Theme } from '../enum/user-preferences-options';

export class CreateDefaultUserPreferenceDto {
    @ApiProperty({ description: 'Referencia al usuario' })
    userId!: UUID;

	@ApiProperty({ description: 'Frecuencia en la que realizar el analisis de los items a los que el usuario sigue' })
    @IsString()
    analysisFrequency?: string = '8h';

	@ApiProperty({ description: 'Frecuencia en la que renovar las recomendaciones de items para el usuario' })
	@IsString()
    recommendationsUpdateFrequency?: string = '7d';
    
	@ApiProperty({ description: 'Tema preferido por el usuario' })
	@IsString()
	@IsOptional()
    theme?: Theme = Theme.SYSTEM;

	@ApiProperty({ description: 'Idioma preferido por el usuario' })
	@IsString()
	@IsOptional()
    language?: Language = Language.ES;

	@ApiProperty({ description: 'Canal de notificaciones predeterminado preferido por el usuario' })
	@IsString()
	@IsOptional()
    defaultNotificationChannel?: NotificationChannelOption = NotificationChannelOption.PUSH;
}
