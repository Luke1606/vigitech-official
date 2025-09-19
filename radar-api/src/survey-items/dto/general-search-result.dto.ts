import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

import { CrossRefResultDto } from './api-results/cross-ref-result.dto';
import { LensResultDto } from './api-results/lens-result.dto';
import { OpenAlexResultDto } from './api-results/open-alex-result.dto';
import { UnpaywallResultDto } from './api-results/unpaywall-result.dto';

export class GeneralSearchResultDto
    implements Record<string, Prisma.InputJsonValue>
{
    [key: string]: Prisma.InputJsonValue;

    @ApiProperty({ description: 'Resultados obtenidos de la API de CrossRef' })
    @ValidateNested()
    @IsJSON()
    @Type(() => CrossRefResultDto)
    crossRefResults!: CrossRefResultDto;

    @ApiProperty({ description: 'Resultados obtenidos de la API de OpenAlex' })
    @ValidateNested()
    @IsJSON()
    @Type(() => OpenAlexResultDto)
    openAlexResults!: OpenAlexResultDto;

    @ApiProperty({ description: 'Resultados obtenidos de la API de Unpaywall' })
    @ValidateNested()
    @IsJSON()
    @Type(() => UnpaywallResultDto)
    unpaywallResults!: UnpaywallResultDto;

    @ApiProperty({ description: 'Resultados obtenidos de la API de Lens.org' })
    @ValidateNested()
    @IsJSON()
    @Type(() => LensResultDto)
    lensResults!: LensResultDto;

    constructor(
        crossRefResults: CrossRefResultDto,
        openAlexResults: OpenAlexResultDto,
        unpaywallResults: UnpaywallResultDto,
        lensResults: LensResultDto
    ) {
        this.crossRefResults = crossRefResults;
        this.openAlexResults = openAlexResults;
        this.unpaywallResults = unpaywallResults;
        this.lensResults = lensResults;
    }
}
