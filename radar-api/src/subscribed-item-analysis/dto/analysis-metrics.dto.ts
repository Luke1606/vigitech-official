import { IsEnum, IsNumber, IsPositive, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { Trending, AccesibilityLevel } from "../enum/item-analysis-options";

export class MetricsDto {
    @ApiProperty({ description: 'Cantidad promedio de citas' })
    @IsNumber()
    @IsPositive()
    citations!: number;

    @ApiProperty({ description: 'Cantidad promedio de descargas' })
    @IsNumber()
    @IsPositive()
    downloads!: number;

    @ApiProperty({ description: 'Índice de relevancia (0-100)' })
    @IsNumber()
    @IsPositive()
    relevance!: number;

    @ApiProperty({ description: 'Nivel de acceso (gratis o de pago)' })
    @IsString()
    @IsEnum(AccesibilityLevel)
    accesibilityLevel!: AccesibilityLevel;

    @ApiProperty({ description: 'Tendencia (aumentar, disminuir, estable, inestable)' })
    @IsString()
    @IsEnum(Trending)
    trending!: Trending;
}