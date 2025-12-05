import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la solicitud de generación de embeddings de texto por un agente de IA.
 */
export class GenerateEmbeddingsDto {
    /**
     * Array de cadenas de texto para las cuales se generarán los embeddings.
     * @example ["Hello world", "NestJS is awesome"]
     */
    @ApiProperty({
        description: 'Array de cadenas de texto para las cuales se generarán los embeddings.',
        type: [String],
        example: ['Hello world', 'NestJS is awesome'],
    })
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    text!: string[];
}
