import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '@prisma/client';
import { CreateUserItemListDto } from './create-user-item-list.dto';
import { NotificationChannelOption } from '@/common/enums/notification-channel-options.enum';

/**
 * DTO para la actualización parcial de una lista de elementos de usuario.
 * Hereda de `CreateUserItemListDto` y hace que todos sus campos sean opcionales.
 * Permite actualizar el nombre de la lista y el canal de notificación preferido.
 */
export class UpdateUserItemListDto extends PartialType(CreateUserItemListDto) {
    /**
     * El canal de notificación preferido para esta lista de ítems.
     * Es opcional y debe ser uno de los valores definidos en `NotificationChannelOption`.
     */
    @ApiProperty({
        description: 'Canal de notificación preferido para esta lista de ítems',
    })
    @IsString()
    @IsOptional()
    @IsEnum(NotificationChannelOption, {
        message: `Las opciones de canales son: ${NotificationChannelOption.join()}`,
    })
    preferredNotificationChannel?: NotificationChannel;
}
