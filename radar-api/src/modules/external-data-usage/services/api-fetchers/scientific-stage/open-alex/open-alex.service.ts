import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SurveyItem } from '@prisma/client';

import { CreateSurveyItemType } from '../../../../../survey-items/types/create-survey-item.type';
import { BaseFetchingService } from '../../fetching-service.base';
import {
    OpenAlexResponse,
    OpenAlexTopic,
    OpenAlexWork,
} from '../../../../types/api-responses/scientific-stage/open-alex-responses.type';

@Injectable()
export class OpenAlexService extends BaseFetchingService {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'OpenAlexAPIFetcher';

        const openAlexUrl: string = configService.get<string>('OPEN_ALEX_API_URL') || 'https://api.openalex.org';

        if (!openAlexUrl) {
            throw new Error('OpenALEX API URL is missing!');
        }
        super(httpService, loggerName, openAlexUrl);
    }

    /**
     * Obtiene los tópicos en tendencia actualmente de OpenAlex
     * Los tópicos se ordenan por el recuento de citas para encontrar los más relevantes
     */
    async getTrendings(): Promise<CreateSurveyItemType[]> {
        this.logger.log('Executed getTrendings');

        try {
            // Obtener tópicos populares ordenados por cited_by_count
            const response: AxiosResponse<OpenAlexResponse> = await firstValueFrom(
                this.httpService.get('/topics', {
                    params: {
                        sort: 'cited_by_count:desc',
                        per_page: 25,
                        filter: 'works_count:>1000', // Filtramos tópicos con suficiente contenido
                    },
                }),
            );

            const topics = response.data.results as OpenAlexTopic[];

            // Mapear los tópicos a CreateSurveyItemDto
            return topics.map((topic) => this.mapTopicToSurveyItemDto(topic));
        } catch (error) {
            this.logger.error('Error fetching trending topics from OpenAlex', error);
            throw new Error('Failed to fetch trending topics');
        }
    }

    /**
     * Obtiene información detallada de un ítem específico
     */
    async getInfoFromItem(item: SurveyItem): Promise<OpenAlexResponse> {
        this.logger.log('Executed getInfoFromItem');

        try {
            // Buscar works relacionados con el ítem por título o contenido
            const response: AxiosResponse<OpenAlexResponse> = await firstValueFrom(
                this.httpService.get('/works', {
                    params: {
                        search: item.title, // Buscar por título
                        per_page: 10,
                    },
                }),
            );

            const works = response.data.results as OpenAlexWork[];

            if (works.length === 0) {
                throw new Error('No se encontraron works relacionados con el ítem');
            }

            // Obtener el work más relevante (mayor número de citas)
            const mostRelevantWork = works.reduce((prev, current) =>
                prev.cited_by_count > current.cited_by_count ? prev : current,
            );

            return this.mapWorkToOpenAlexResult(mostRelevantWork, item);
        } catch (error) {
            this.logger.error('Error fetching item info from OpenAlex', error);
            throw new Error('Failed to fetch item information');
        }
    }

    /**
     * Método adicional para buscar works por tópico específico
     */
    async getWorksByTopic(topicId: string, limit = 10): Promise<OpenAlexWork[] | undefined> {
        try {
            const response: AxiosResponse<OpenAlexResponse> = await firstValueFrom(
                this.httpService.get('/works', {
                    params: {
                        filter: `topics.id:${topicId}`,
                        sort: 'cited_by_count:desc',
                        per_page: limit,
                    },
                }),
            );

            return response.data.results as OpenAlexWork[];
        } catch (error) {
            this.logger.error('Error fetching works by topic from OpenAlex', error);
            throw new Error('Failed to fetch works by topic');
        }
    }

    /**
     * Método para obtener tópicos relacionados basados en keywords
     */
    async getRelatedTopics(keywords: string[], limit = 5): Promise<OpenAlexTopic[] | undefined> {
        try {
            const keywordQuery = keywords.join('|');
            const response: AxiosResponse<OpenAlexResponse> = await firstValueFrom(
                this.httpService.get('/topics', {
                    params: {
                        search: keywordQuery,
                        per_page: limit,
                        sort: 'works_count:desc',
                    },
                }),
            );

            return response.data.results as OpenAlexTopic[];
        } catch (error) {
            this.logger.error('Error fetching related topics from OpenAlex', error);
            throw new Error('Failed to fetch related topics');
        }
    }

    /**
     * Mapea un tópico de OpenAlex a CreateSurveyItemDto
     */
    private mapTopicToSurveyItemDto(topic: OpenAlexTopic): CreateSurveyItemType {
        return {
            title: topic.display_name,
            summary:
                topic.description ||
                `Topic in ${topic.field?.display_name || 'unknown field'} with ${topic.works_count} works and ${topic.cited_by_count} citations`,
            source: 'OpenAlex',
            metadata: {
                id: topic.id,
                keywords: topic.keywords,
                field: topic.field?.display_name,
                subfield: topic.subfield?.display_name,
                domain: topic.domain?.display_name,
                works_count: topic.works_count,
                cited_by_count: topic.cited_by_count,
                created_date: topic.created_date,
                updated_date: topic.updated_date,
            },
            // Otros campos requeridos por CreateSurveyItemDto
        } as unknown as CreateSurveyItemType;
    }

    /**
     * Mapea un work de OpenAlex a CrossRefResultDto
     */
    private mapWorkToOpenAlexResult(work: OpenAlexWork, originalItem: SurveyItem): OpenAlexResponse {
        return {
            title: work.title || work.display_name,
            abstract: work.abstract || '',
            authors: [], // OpenAlex no proporciona autores directamente en este nivel
            publication_date: work.publication_date,
            publisher: '', // Disponible en niveles más profundos de la respuesta
            topic: work.topics?.[0]?.topic.display_name || '',
            keywords: work.topics?.flatMap((t) => t.topic.keywords) || [],
            citation_count: work.cited_by_count,
            source: 'OpenAlex',
            metadata: {
                id: work.id,
                type: work.type,
                is_retracted: work.is_retracted,
                is_paratext: work.is_paratext,
                related_works: work.related_works,
                topics: work.topics.map((t) => ({
                    id: t.topic.id,
                    display_name: t.topic.display_name,
                    score: t.score,
                })),
            },
            originalItem: originalItem,
        } as unknown as OpenAlexResponse;
    }
}
