import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSurveyItemDto {
    @ApiProperty({
        description:
            'Define si el elemento está marcado como activo o no, si está en false, se eliminará antes de la siguiente renovación de tendencias',
    })
    @IsBoolean()
    @IsOptional()
    active? = false;

    @ApiProperty({
        description:
            'Define si el elemento está marcado como suscrito o no, si está en false, no es analizado periódicamente',
    })
    @IsBoolean()
    @IsOptional()
    subscribed? = false;
}
