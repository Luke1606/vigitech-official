import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LLMClient implements OnModuleInit {
    private readonly logger: Logger = new Logger(LLMClient.name);
    private genAI!: GoogleGenerativeAI;
    private model!: GenerativeModel;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        const apiKey = this.configService.get<string>('LLM_API_KEY');
        const modelName = this.configService.get<string>('LLM_MODEL') || 'gemini-1.5-flash';

        if (!apiKey) throw new Error('LLM API key not found.');

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.logger.log(`Initialized with SDK. Model: ${modelName}`);
    }

    /**
     * Genera una respuesta y la parsea al tipo esperado.
     * @template T El tipo de estructura esperada (debe ser un objeto o array).
     */
    async generateResponse<T>(prompt: string, context?: unknown): Promise<T> {
        this.logger.log('Generando contenido con Gemini SDK');

        const fullPrompt = `${prompt}\n\nContext: ${JSON.stringify(context)}`;

        try {
            const result = await this.model.generateContent(fullPrompt);
            const text = result.response.text();

            if (!text) throw new Error('El modelo devolvió una respuesta vacía.');

            // Limpieza de Markdown
            const cleanText = text.replace(/```json|```/g, '').trim();

            try {
                return JSON.parse(cleanText) as T;
            } catch (parseError) {
                this.logger.warn(`Could not parse response as JSON. Returning raw text.`, parseError);
                return cleanText as T;
            }
        } catch (error) {
            this.logger.error('Gemini SDK Error:', (error as Error).message);
            throw error;
        }
    }
}
