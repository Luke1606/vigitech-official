import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * DTO para la creación de una nueva lista de elementos de usuario.
 * Define la estructura de los datos esperados para crear una lista,
 * incluyendo su nombre.
 */
export class CreateUserItemListDto {
    /**
     * El nombre de la lista de elementos.
     * Este campo es requerido y debe ser una cadena de texto.
     */
    @ApiProperty({ description: 'Nombre de la lista' })
    @IsString()
    name!: string;
}
