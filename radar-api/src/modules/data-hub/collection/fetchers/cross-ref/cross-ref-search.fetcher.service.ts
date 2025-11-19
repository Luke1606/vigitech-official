import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { CrossrefWork } from '../../types/cross-ref/cross-ref.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class CrossrefSearchFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.CROSS_REF;
    }

    getDatatype(): RawDataType {
        return RawDataType.ACADEMIC_PAPER;
    }

    async fetch(): Promise<CrossrefWork[]> {
        this.logger.log('Collecting high volume of works from Crossref (Computer Science & Engineering)...');

        // Búsqueda amplia por términos clave y límite de resultados.
        const apiUrl = 'https://api.crossref.org/works?query.bibliographic=computer+science+engineering+data&rows=500';

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));

            const works = (response?.data?.message?.items as CrossrefWork[]) ?? [];

            this.logger.log(`Successfully collected ${works.length} works from Crossref.`);
            return works;
        } catch (error) {
            this.logger.error('Failed to collect data from Crossref', error);
            // Crossref usa Rate Limits muy estrictos, el manejo de errores es crucial.
            throw error;
        }
    }
}
