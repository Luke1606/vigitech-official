import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { RadarQuadrant, RadarRing } from '@prisma/client';
import {
    SurveyItemRadarQuadrant,
    SurveyItemRadarRing,
} from '../enum/survey-items-options';
import { CreateItemAnalysisDto } from './create-item-analysis.dto';

export class CreateSurveyItemDto {
    @ApiProperty({ description: 'Título del ítem' })
    @IsString()
    title!: string;

    @ApiProperty({ description: 'Descripción o resumen del ítem' })
    @IsString()
    summary!: string;

    @ApiProperty({
        description:
            'URL de la fuente del ítem, una sea una página o un recurso',
    })
    @IsString()
    @IsUrl()
    @Type(() => URL)
    source!: string;

    @ApiProperty({
        description: 'Primer analisis que se le hace al objeto',
    })
    @IsString()
    @IsOptional()
    @Type(() => CreateItemAnalysisDto)
    firstAnalysis!: CreateItemAnalysisDto;

    @ApiProperty({
        description:
            'Cuadrante en el que se ubicó el elemento, basado en el último análisis',
    })
    @IsString()
    @IsOptional()
    @IsEnum(SurveyItemRadarQuadrant, {
        message: `Los valores de cuadrante posibles son: ${SurveyItemRadarQuadrant}`,
    })
    radarQuadrant!: RadarQuadrant;

    @ApiProperty({
        description:
            'Anillo en el que se ubicó el elemento, basado en el último análisis',
    })
    @IsString()
    @IsOptional()
    @IsEnum(SurveyItemRadarRing, {
        message: `Los valores de anillo posibles son: ${SurveyItemRadarRing}`,
    })
    radarRing!: RadarRing;
}
