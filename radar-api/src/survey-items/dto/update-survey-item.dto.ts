import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { RadarQuadrant, RadarRing } from '@prisma/client';
import {
  SurveyItemRadarQuadrant,
  SurveyItemRadarRing,
} from '../enum/survey-items-options';
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

  @ApiProperty({
    description:
      'Cuadrante en el que se ubicó el elemento, por defecto desconocido',
  })
  @IsString()
  @IsOptional()
  @IsEnum(SurveyItemRadarQuadrant, {
    message: `Los valores de cuadrante posibles son: ${SurveyItemRadarQuadrant}`,
  })
  radarQuadrant?: RadarQuadrant = RadarQuadrant.UNKNOWN;

  @ApiProperty({
    description:
      'Anillo en el que se ubicó el elemento, por defecto desconocido',
  })
  @IsString()
  @IsOptional()
  @IsEnum(SurveyItemRadarRing, {
    message: `Los valores de anillo posibles son: ${SurveyItemRadarRing}`,
  })
  radarRing?: RadarRing = RadarRing.UNKNOWN;
}
