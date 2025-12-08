import { UUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

/**
 * DTO para la creación de un nuevo reporte.
 * Define la estructura de los datos esperados para crear un reporte,
 * incluyendo los items relacionados y el intervalo de tiempo.
 */
export class CreateReportDto {
    /**
     * Ids de los items a reportar.
     * Este campo es requerido y debe ser un array de items.
     */
    @ApiProperty({ description: 'Ids de los items a reportar' })
    itemIds!: UUID[];

    /**
     * Fecha de inicio a tener en cuenta para definir el intervalo de análisis.
     * Este campo es requerido y debe ser un string con formato Date.
     */
    @ApiProperty({ description: 'Fecha de inicio a tener en cuenta para definir el intervalo de análisis' })
    @IsDateString()
    startDate!: string;

    /**
     * Fecha de fin a tener en cuenta para definir el intervalo de análisis.
     * Este campo es requerido y debe ser un string con formato Date.
     */
    @ApiProperty({ description: 'Fecha de inicio a tener en cuenta para definir el intervalo de análisis' })
    @IsDateString()
    endDate!: string;
}
