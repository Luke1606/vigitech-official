import { PartialType } from '@nestjs/mapped-types';
import { CreateUserItemListDto } from './create-user-item-list.dto';
import { NotificationChannel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannelOption } from '../../../common/enums/notification-channel-options';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserItemListDto extends PartialType(CreateUserItemListDto) {
    @ApiProperty({
        description: 'Canal de notificación preferido para esta lista de ítems',
    })
    @IsString()
    @IsOptional()
    @IsEnum(NotificationChannelOption, {
        message: `Las opciones de canales son: ${NotificationChannelOption.join()}`,
    })
    preferredNotificationChannel!: NotificationChannel;
}
