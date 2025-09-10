import { PartialType } from "@nestjs/mapped-types";
import { CreateUserItemListDto } from "./create-user-item-list.dto";
import { NotificationChannel } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { NotificationChannelOption } from "app/common/utils/notification-channel-options";

export class UpdateUserItemListDto extends PartialType(CreateUserItemListDto) {
    @IsString()
    @IsOptional()
    @IsEnum(NotificationChannelOption, {
        message: `Las opciones de canales son: ${NotificationChannelOption}`
    })
    preferredNotificationChannel!: NotificationChannel;
}