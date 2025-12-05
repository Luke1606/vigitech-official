import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiAgentsService } from './ai-agents.service';
import { GenerateEmbeddingsDto } from './dto/generate-embeddings.dto';
import { GenerateResponseDto } from './dto/generate-response.dto';

/**
 * Controlador para la interacción con los agentes de IA.
 * Expone endpoints para generar respuestas de texto y embeddings.
 */
@ApiTags('ai-agents')
@Controller('ai-agents')
export class AiAgentsController {
    private readonly logger: Logger = new Logger(AiAgentsController.name);

    constructor(private readonly aiAgentsService: AiAgentsService) {
        this.logger.log('Initialized');
    }

    /**
     * Genera una respuesta de texto utilizando el cliente de IA multi-propósito (Gemini Flash).
     * @param generateResponseDto DTO que contiene el prompt y el contexto opcional.
     * @returns La respuesta generada por el modelo de IA.
     */
    @Post('generate-response')
    @ApiOperation({ summary: 'Genera una respuesta de texto utilizando un agente de IA.' })
    @ApiResponse({ status: 200, description: 'Respuesta generada exitosamente.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async generateResponse(@Body() generateResponseDto: GenerateResponseDto): Promise<object> {
        this.logger.log('Received request for text generation.');
        return this.aiAgentsService.generateResponse(generateResponseDto.prompt, generateResponseDto.context);
    }

    /**
     * Genera embeddings (vectores numéricos) para un array de cadenas de texto
     * utilizando el cliente de embeddings de texto (OpenAI).
     * @param generateEmbeddingsDto DTO que contiene el array de cadenas de texto.
     * @returns Un array de embeddings, donde cada embedding es un array de números.
     */
    @Post('generate-embeddings')
    @ApiOperation({ summary: 'Genera embeddings para un array de textos.' })
    @ApiResponse({ status: 200, description: 'Embeddings generados exitosamente.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async generateEmbeddings(@Body() generateEmbeddingsDto: GenerateEmbeddingsDto): Promise<number[][]> {
        this.logger.log('Received request for embeddings generation.');
        return this.aiAgentsService.generateEmbeddings(generateEmbeddingsDto.text);
    }
}
