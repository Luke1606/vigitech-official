import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSurveyItemDto } from './create-survey-item.dto';

export class UpdateSurveyItemDto extends PartialType(CreateSurveyItemDto) {
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
