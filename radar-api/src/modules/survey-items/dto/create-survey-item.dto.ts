import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { RadarQuadrant } from '@prisma/client';
import { SurveyItemRadarQuadrant } from '../enum/survey-items-options';

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
        description:
            'Cuadrante en el que se ubicó el elemento, basado en la búsqueda',
    })
    @IsString()
    @IsOptional()
    @IsEnum(SurveyItemRadarQuadrant, {
        message: `Los valores de cuadrante posibles son: ${SurveyItemRadarQuadrant}`,
    })
    radarQuadrant!: RadarQuadrant;
}
