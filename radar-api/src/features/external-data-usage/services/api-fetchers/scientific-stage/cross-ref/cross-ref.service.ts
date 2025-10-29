import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { SurveyItem } from '@prisma/client';
import { BaseFetchingService } from '../../fetching-service.base';
import {
    CrossRefParams,
    CrossRefResponse,
    CrossRefWork,
} from '../../../../types/api-responses/scientific-stage/cross-ref-responses.type';
import { CreateSurveyItemType } from '../../../../../data-management/survey-items/types/create-survey-item.type';

@Injectable()
export class CrossRefService extends BaseFetchingService {
    private readonly mailto: string | undefined;

    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'CrossRefAPIFetcher';

        const crossRefUrl: string = configService.get<string>('CROSSREF_API_URL') || 'https://api.crossref.org';

        const mailto: string = configService.get<string>('CROSSREF_MAILTO') || 'luisalbertohedzro@gmail.com';

        if (!crossRefUrl) {
            throw new Error('CrossRef API URL is missing!');
        }

        super(httpService, loggerName, crossRefUrl);

        if (mailto) this.mailto = mailto;
    }

    /**
     * Obtiene los trabajos en tendencia actualmente de CrossRef
     * Ordenados por el recuento de citas para encontrar los más relevantes
     */
    async getTrendings(): Promise<CreateSurveyItemType[]> {
        try {
            // Obtener works populares ordenados por is-referenced-by-count (citas)
            const params: CrossRefParams = {
                sort: 'is-referenced-by-count',
                order: 'desc',
                rows: 25,
                filter: 'from-pub-date:2024,type:journal-article',
            };

            // Añadir mailto si está configurado (para polite pool)
            if (this.mailto) params.mailto = this.mailto;

            const response: AxiosResponse<CrossRefResponse> = await firstValueFrom(
                this.httpService.get('/works', { params }),
            );

            const works: CrossRefWork[] = response.data.message.items;

            // Mapear los works a CreateSurveyItemDto
            return works.map((work: CrossRefWork) => this.mapWorkToSurveyItem(work));
        } catch (error) {
            this.logger.error('Error fetching trending works from CrossRef', error);
            throw new Error('Failed to fetch trending works');
        }
    }

    /**
     * Obtiene información detallada de un ítem específico de CrossRef
     */
    async getInfoFromItem(item: SurveyItem): Promise<CrossRefResponse> {
        try {
            // Buscar works por título
            const params: CrossRefParams = {
                query: `title:"${item.title}"`,
                rows: 10,
            };

            // Añadir mailto si está configurado
            if (this.mailto) {
                params.mailto = this.mailto;
            }

            const response: AxiosResponse<CrossRefResponse> = await firstValueFrom(
                this.httpService.get('/works', { params }),
            );

            const works = response.data.message.items;

            if (works.length === 0) {
                throw new Error('No se encontraron works relacionados con el ítem en CrossRef');
            }

            // Obtener el work más relevante (mayor número de citas)
            const mostRelevantWork = works.reduce((prev, current) =>
                prev['is-referenced-by-count'] > current['is-referenced-by-count'] ? prev : current,
            );

            return this.mapWorkToCrossRefResult(mostRelevantWork, item);
        } catch (error) {
            this.logger.error('Error fetching item info from CrossRef', error);
            throw new Error('Failed to fetch item');
        }
    }

    /**
     * Método adicional para buscar works por DOI específico
     */
    async getWorkByDOI(doi: string): Promise<CrossRefWork> {
        try {
            const params: CrossRefParams = {};

            // Añadir mailto si está configurado
            if (this.mailto) {
                params.mailto = this.mailto;
            }

            const response: AxiosResponse<{ message: CrossRefWork }> = await firstValueFrom(
                this.httpService.get(`/works/${encodeURIComponent(doi)}`, {
                    params,
                }),
            );

            return response.data.message;
        } catch (error) {
            this.logger.error('Error fetching work by DOI from CrossRef', error);
            throw new Error('Failed to fetch work by DOI');
        }
    }

    /**
     * Método para obtener works relacionados basados en referencias
     */
    async getRelatedWorks(doi: string, limit = 10): Promise<CrossRefWork[]> {
        try {
            const params: CrossRefParams = {
                filter: `references:${doi}`,
                rows: limit,
            };

            // Añadir mailto si está configurado
            if (this.mailto) {
                params.mailto = this.mailto;
            }

            const response: AxiosResponse<CrossRefResponse> = await firstValueFrom(
                this.httpService.get('/works', { params }),
            );

            return response.data.message.items;
        } catch (error) {
            this.logger.error('Error fetching related works from CrossRef', error);
            throw new Error('Failed to fetch related works');
        }
    }

    /**
     * Mapea un work de CrossRef a CreateSurveyItemDto
     */
    private mapWorkToSurveyItem(work: CrossRefWork): CreateSurveyItemType {
        return {
            title: work.title?.[0] || 'Sin título',
            summary:
                work.abstract ||
                `Trabajo publicado en ${work.publisher} con ${work['is-referenced-by-count'] || 0} citas`,
            source: 'CrossRef',
            metadata: {
                doi: work.doi,
                publisher: work.publisher,
                type: work.type,
                subjects: work.subject || [],
                citationCount: work['is-referenced-by-count'] || 0,
                referenceCount: work['reference-count'] || 0,
                publicationDate:
                    work.published?.['date-parts']?.[0]?.join('-') || work.issued?.['date-parts']?.[0]?.join('-'),
                createdDate: work.created?.['date-time'],
                depositedDate: work.deposited?.['date-time'],
            },
        } as unknown as CreateSurveyItemType;
    }

    /**
     * Mapea un work de CrossRef a CrossRefResultDto
     */
    private mapWorkToCrossRefResult(work: CrossRefWork, originalItem: CreateSurveyItemType): CrossRefResponse {
        return {
            title: work.title?.[0] || 'Sin título',
            abstract: work.abstract || '',
            authors:
                work.author?.map((author) => ({
                    name: author.name || `${author.given} ${author.family}`.trim(),
                    givenName: author.given,
                    familyName: author.family,
                    orcid: author.ORCID,
                })) || [],
            publication_date:
                work.published?.['date-parts']?.[0]?.join('-') || work.issued?.['date-parts']?.[0]?.join('-'),
            publisher: work.publisher,
            topic: work.subject?.[0] || '',
            keywords: work.subject || [],
            citation_count: work['is-referenced-by-count'] || 0,
            source: 'CrossRef',
            metadata: {
                doi: work.doi,
                type: work.type,
                subtype: work.subtype,
                url: work.URL,
                references: work.references?.length || 0,
                relations: work.relation ? Object.keys(work.relation) : [],
            },
            originalItem: originalItem,
        } as unknown as CrossRefResponse;
    }
}
