/**
 * DTO (Data Transfer Object) para encapsular los parámetros de consulta de búsqueda.
 * Permite definir criterios para búsquedas por identidad, semánticas y filtrado de datos.
 * @class SearchQueryDto
 */
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RawDataSource, RawDataType } from '@prisma/client';

export class SearchQueryDto {
    /**
     * Cadena de texto para la búsqueda por palabras clave o semántica.
     * @type {string}
     */
    @ApiProperty({ description: 'Cadena de texto para la búsqueda por palabras clave o semántica' })
    @IsOptional()
    @IsString()
    query?: string;

    /**
     * Array de fuentes de datos (`RawDataSource`) para filtrar los resultados.
     * @type {RawDataSource[]}
     */
    @ApiProperty({ description: 'Array de fuentes de datos (`RawDataSource`) para filtrar los resultados' })
    @IsOptional()
    @IsEnum(RawDataSource, { each: true })
    sources?: RawDataSource[];

    /**
     * Array de tipos de datos brutos (`RawDataType`) para filtrar los resultados.
     * @type {RawDataType[]}
     */
    @ApiProperty({ description: 'Array de tipos de datos brutos (`RawDataType`) para filtrar los resultados' })
    @IsOptional()
    @IsEnum(RawDataType, { each: true })
    dataTypes?: RawDataType[];

    /**
     * Límite de resultados a devolver.
     * @type {number}
     */
    @ApiProperty({ description: 'Límite de resultados a devolver' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    /**
     * Offset para la paginación de resultados.
     * @type {number}
     */
    @ApiProperty({ description: 'Offset para la paginación de resultados' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    /**
     * Número de vecinos más cercanos a recuperar para la búsqueda semántica.
     * @type {number}
     */
    @ApiProperty({ description: 'Número de vecinos más cercanos a recuperar para la búsqueda semántica' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    k?: number = 5; // For semantic search: number of nearest neighbors
}
