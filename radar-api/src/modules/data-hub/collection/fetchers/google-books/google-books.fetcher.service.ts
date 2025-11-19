import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RawDataSource, RawDataType } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { GoogleBooksVolume } from '../../types/google-books/google-books.types';

@Injectable()
export class GoogleBooksSearchFetcher extends BaseFetcher {
    // TODO: La API de Google Books tiene un límite de 1000 consultas por día sin API Key.
    // Para escalamiento, conseguir Google API Key y adjuntarla como parámetro de consulta.
    private readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GOOGLE_BOOKS;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<GoogleBooksVolume[]> {
        this.logger.log('Collecting a high volume of technology books from Google Books...');

        // Búsqueda amplia de libros técnicos, ordenados por los más nuevos (maxResults=40 es el máximo).
        const apiUrl = `${this.BASE_URL}?q=subject:technology+OR+subject:engineering&maxResults=40&orderBy=newest`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));

            // La respuesta contiene un objeto wrapper, necesitamos acceder a 'items'
            const volumes = (response?.data?.items as GoogleBooksVolume[]) ?? [];

            this.logger.log(`Successfully collected ${volumes.length} books.`);
            return volumes;
        } catch (error) {
            this.logger.error('Failed to collect data from Google Books', error);
            throw error;
        }
    }
}
