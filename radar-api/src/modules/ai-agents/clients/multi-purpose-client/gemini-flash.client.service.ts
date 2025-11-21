/**
 * Cliente de IA para la generación de texto utilizando la API de Gemini Flash.
 * Gestiona la comunicación con el servicio de generación de contenido de Gemini.
 * @class GeminiFlashAiClient
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RawData } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeminiFlashAiClient {
    private readonly logger: Logger = new Logger(GeminiFlashAiClient.name);
    private readonly baseURL: string;
    private readonly apiKey: string;

    /**
     * @param httpService Servicio HTTP para realizar solicitudes.
     * @param configService Servicio de configuración para acceder a las variables de entorno.
     */
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

        if (!this.apiKey) throw new Error('Gemini API key not found.');

        this.baseURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

        this.logger.log('Initialized');
    }

    /**
     * Genera una respuesta de texto utilizando el modelo Gemini Flash.
     * @param prompt La instrucción principal para el modelo.
     * @param context (Opcional) Datos adicionales o contexto en formato RawData[] u objeto.
     * @returns Una promesa que resuelve con la respuesta del modelo Gemini.
     * @throws {Error} Si ocurre un error durante la generación de texto.
     */
    async generateResponse(prompt: string, context?: RawData[] | object): Promise<object> {
        this.logger.log('Generando texto utilizando el cliente Gemini Flash');

        const content = [
            {
                parts: [{ text: prompt }, { text: `Context: ${JSON.stringify(context)}` }],
            },
        ];

        try {
            const response = await firstValueFrom(this.httpService.post(this.baseURL, { contents: content }));
            return response.data;
        } catch (error) {
            this.logger.error('Error generando texto con Gemini Flash client', error);
            throw error;
        }
    }
}
