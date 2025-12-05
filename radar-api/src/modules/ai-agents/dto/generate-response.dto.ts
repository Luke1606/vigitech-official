import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la solicitud de generación de respuesta de texto por un agente de IA.
 */
export class GenerateResponseDto {
    /**
     * La instrucción o pregunta principal para el modelo de lenguaje.
     * @example "Describe las tendencias actuales en IA."
     */
    @ApiProperty({
        description: 'La instrucción o pregunta principal para el modelo de lenguaje.',
        example: 'Describe las tendencias actuales en IA.',
    })
    @IsString()
    prompt!: string;

    /**
     * (Opcional) Contexto adicional o datos brutos que el modelo debe considerar.
     * @example { "user_history": ["searched: AI ethics", "viewed: LLM applications"] }
     */
    @ApiProperty({
        description: '(Opcional) Contexto adicional o datos brutos que el modelo debe considerar.',
        type: Object,
        example: { user_history: ['searched: AI ethics', 'viewed: LLM applications'] },
        required: false,
    })
    @IsOptional()
    @IsObject()
    context?: object;
}
