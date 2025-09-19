import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { GeneralSearchResultDto } from './general-search-result.dto';
import { MetricsDto } from './analysis-metrics.dto';

export class CreateItemAnalysisDto {
    @ApiProperty({ description: 'Datos obtenidos de todas las APIs' })
    @ValidateNested()
    @IsJSON()
    @Type(() => GeneralSearchResultDto)
    searchedData!: GeneralSearchResultDto;

    @ApiProperty({ description: 'Métricas obtenidas mediante agentes IA' })
    @ValidateNested()
    @IsJSON()
    @Type(() => MetricsDto)
    obtainedMetrics!: MetricsDto;

    @ApiProperty({ description: 'Id del item relacionado' })
    @IsString()
    @IsUUID()
    itemId!: string;
}
