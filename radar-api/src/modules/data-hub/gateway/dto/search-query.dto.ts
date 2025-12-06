import { IsOptional, IsString, IsNumber, IsEnum, Min, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RawDataSource, RawDataType } from '@prisma/client';

/**
 * DTO (Data Transfer Object) para encapsular los parámetros de consulta de búsqueda.
 * Permite definir criterios para búsquedas por identidad, semánticas y filtrado de datos.
 * @class SearchQueryDto
 */
export class SearchQueryDto {
    /**
     * Cadena de texto para la búsqueda por palabras clave o semántica.
     * @type {string}
     */
    @ApiProperty({ description: 'Cadena de texto para la búsqueda por palabras clave o semántica', required: false })
    @IsOptional()
    @IsString()
    query?: string;

    /**
     * Array de fuentes de datos (`RawDataSource`) para filtrar los resultados.
     * @type {RawDataSource[]}
     */
    @ApiProperty({
        description: 'Array de fuentes de datos (`RawDataSource`) para filtrar los resultados',
        required: false,
        isArray: true,
        enum: RawDataSource,
    })
    @IsOptional()
    @IsEnum(RawDataSource, { each: true })
    sources?: RawDataSource[];

    /**
     * Array de tipos de datos brutos (`RawDataType`) para filtrar los resultados.
     * @type {RawDataType[]}
     */
    @ApiProperty({
        description: 'Array de tipos de datos brutos (`RawDataType`) para filtrar los resultados',
        required: false,
        isArray: true,
        enum: RawDataType,
    })
    @IsOptional()
    @IsEnum(RawDataType, { each: true })
    dataTypes?: RawDataType[];

    // --- FILTROS DE FECHA ---

    /**
     * Filtra fragmentos creados a partir de esta fecha (ISO 8601, ej: 2024-01-01T00:00:00Z).
     * El servicio asumirá que se aplica al campo `createdAt`.
     * @type {Date}
     */
    @ApiProperty({
        description: 'Filtra fragmentos creados a partir de esta fecha (ISO 8601)',
        required: false,
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    /**
     * Filtra fragmentos creados antes de esta fecha (ISO 8601, ej: 2024-12-31T23:59:59Z).
     * El servicio asumirá que se aplica al campo `createdAt`.
     * @type {Date}
     */
    @ApiProperty({
        description: 'Filtra fragmentos creados antes de esta fecha (ISO 8601)',
        required: false,
        type: String,
        format: 'date-time',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    // --- PAGINACIÓN Y BÚSQUEDA VECTORIAL ---

    /**
     * Límite de resultados a devolver.
     * @type {number}
     */
    @ApiProperty({ description: 'Límite de resultados a devolver', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    /**
     * Offset para la paginación de resultados.
     * @type {number}
     */
    @ApiProperty({ description: 'Offset para la paginación de resultados', default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    /**
     * Número de vecinos más cercanos a recuperar para la búsqueda semántica (k-NN).
     * Solo aplica si `query` está presente.
     * @type {number}
     */
    @ApiProperty({ description: 'Número de vecinos más cercanos a recuperar para la búsqueda semántica', default: 5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    k?: number = 5; // For semantic search: number of nearest neighbors
}
