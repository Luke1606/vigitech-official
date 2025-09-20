import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateSurveyItemDto } from './create-survey-item.dto';
import { RadarQuadrant, RadarRing } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    SurveyItemRadarQuadrant,
    SurveyItemRadarRing,
} from '../enum/survey-items-options';
import { CreateItemAnalysisDto } from '../../external-data-usage/types/create-item-analysis.type';

export class UpdateSurveyItemDto extends PartialType(CreateSurveyItemDto) {
    @ApiProperty({
        description: 'Primer analisis que se le hace al objeto',
    })
    @IsString()
    @IsOptional()
    @Type(() => CreateItemAnalysisDto)
    lastAnalysis?: CreateItemAnalysisDto;

    @ApiProperty({
        description:
            'Anillo en el que se ubicó el elemento, basado en el último análisis',
    })
    @IsString()
    @IsOptional()
    @IsEnum(SurveyItemRadarRing, {
        message: `Los valores de anillo posibles son: ${SurveyItemRadarRing}`,
    })
    radarRing?: RadarRing;

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
