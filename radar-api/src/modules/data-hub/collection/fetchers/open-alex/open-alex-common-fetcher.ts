import { lastValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OpenAlexResults } from '../../types/open-alex/open-alex.types';

// Función auxiliar para manejar la lógica repetitiva de la API de OpenAlex
export async function fetchOpenAlex<T>(
    httpService: HttpService,
    endpoint: string,
    filterParams: Record<string, string>,
    logger: Logger,
): Promise<T[]> {
    const EMAIL_CONTACT: string = 'TODO: añadir_email@ejemplo.com'; // Debe ser una variable de ENV en prod
    const BASE_URL: string = `https://api.openalex.org/${endpoint}`;

    const params = new URLSearchParams({
        ...filterParams,
        'per-page': '100',
        mailto: EMAIL_CONTACT,
    });

    const apiUrl = `${BASE_URL}?${params.toString()}`;

    try {
        const response = await lastValueFrom(httpService.get<OpenAlexResults<T>>(apiUrl));
        return response?.data?.results ?? [];
    } catch (error) {
        logger.error(`Failed to collect data from OpenAlex API at ${endpoint}`, error);
        return [];
    }
}
