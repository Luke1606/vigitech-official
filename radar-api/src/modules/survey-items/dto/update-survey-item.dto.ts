import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';
import { RadarQuadrant, RadarRing } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    SurveyItemRadarQuadrant,
    SurveyItemRadarRing,
} from '../enum/survey-items-options';

export class UpdateSurveyItemDto {
    @ApiProperty({ description: 'Título del ítem' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ description: 'Descripción o resumen del ítem' })
    @IsString()
    @IsOptional()
    summary?: string;

    @ApiProperty({
        description:
            'URL de la fuente del ítem, una sea una página o un recurso',
    })
    @IsString()
    @IsOptional()
    @IsUrl()
    @Type(() => URL)
    source?: string;

    @ApiProperty({
        description:
            'Cuadrante en el que se ubicó el elemento, basado en la búsqueda',
    })
    @IsString()
    @IsOptional()
    @IsEnum(SurveyItemRadarQuadrant, {
        message: `Los valores de cuadrante posibles son: ${SurveyItemRadarQuadrant.join()}`,
    })
    radarQuadrant?: RadarQuadrant;

    @ApiProperty({
        description:
            'Anillo en el que se ubicó el elemento, basado en el último análisis',
    })
    @IsString()
    @IsOptional()
    @IsEnum(SurveyItemRadarRing, {
        message: `Los valores de anillo posibles son: ${SurveyItemRadarRing.join()}`,
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
