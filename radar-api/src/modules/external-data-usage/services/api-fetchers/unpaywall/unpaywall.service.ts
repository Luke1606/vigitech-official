import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { SurveyItem } from '@prisma/client';
import { BaseFetchingService } from '../fetching-service.base';
import {
    UnpaywallResponse,
    UnpaywallWork,
} from '../../../types/unpaywall-responsestype';
import { CreateSurveyItemType } from '../../../../survey-items/types/create-survey-item.type';

@Injectable()
export class UnpaywallService extends BaseFetchingService {
    private readonly email: string;

    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        const loggerName: string = 'UnpaywallAPIFetcher';

        const unpaywallURL: string =
            configService.get<string>('UNPAYWALL_API_URL') ||
            'https://api.unpaywall.org/v2';

        const email =
            configService.get<string>('UNPAYWALL_EMAIL') ||
            'luisalbertohedzro@gmail.com';

        if (!unpaywallURL) throw new Error('Unpaywall API URL is missing!');

        if (!email)
            throw new Error('Unpaywall email is required for authentication!');

        super(httpService, loggerName, unpaywallURL);
        this.email = email;
    }

    /**
     * Obtiene trabajos en tendencia de Unpaywall (artículos de acceso abierto populares)
     */
    async getTrendings(): Promise<CreateSurveyItemType[]> {
        try {
            // Unpaywall no tiene un endpoint directo para "tendencias", así que buscamos
            // artículos OA recientes con alto potencial de interés
            const currentYear = new Date().getFullYear();
            const params = {
                email: this.email,
                is_oa: true,
                published_date: `${currentYear}-01-01 to ${currentYear}-12-31`,
                page: 1,
                per_page: 25,
            };

            const response: AxiosResponse<UnpaywallResponse> =
                await firstValueFrom(
                    this.httpService.get('/v2/search', { params })
                );

            const works = response.data.results;

            // Mapear los works a CreateSurveyItemDto
            return works.map((work) => this.mapWorkToSurveyItem(work));
        } catch (error) {
            this.logger.error(
                'Error fetching trending works from Unpaywall',
                error
            );
            throw new Error('Failed to fetch trending works');
        }
    }

    /**
     * Obtiene información detallada de un ítem específico por DOI
     */
    async getInfoFromItem(item: SurveyItem): Promise<UnpaywallResponse> {
        try {
            // Para Unpaywall, normalmente buscaríamos por DOI
            // Si el item no tiene DOI, buscamos por título
            let work: UnpaywallWork;

            const doi: string | null = this.extractDOIFromItem(item);
            if (doi) {
                work = await this.getWorkByDOI(doi);
            } else {
                // Búsqueda por título como fallback
                const works = await this.searchWorksByTitle(item.title);
                if (works.length === 0) {
                    throw new Error(
                        'No se encontraron works relacionados con el ítem en Unpaywall'
                    );
                }
                work = works[0];
            }

            return this.mapWorkToUnpaywallResult(work, item);
        } catch (error) {
            this.logger.error('Error fetching item info from Unpaywall', error);
            throw new Error('Failed to fetch item information');
        }
    }

    /**
     * Método para obtener un trabajo por DOI
     */
    async getWorkByDOI(doi: string): Promise<UnpaywallWork> {
        try {
            const response: AxiosResponse<UnpaywallWork> = await firstValueFrom(
                this.httpService.get(`/v2/${encodeURIComponent(doi)}`, {
                    params: { email: this.email },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(
                'Error fetching work by DOI from Unpaywall',
                error
            );
            throw new Error('Failed to fetch work by DOI');
        }
    }

    /**
     * Método para buscar works por título
     */
    async searchWorksByTitle(
        title: string,
        limit = 10
    ): Promise<UnpaywallWork[]> {
        try {
            const response: AxiosResponse<UnpaywallResponse> =
                await firstValueFrom(
                    this.httpService.get('/v2/search', {
                        params: {
                            email: this.email,
                            query: title,
                            is_oa: true,
                            per_page: limit,
                        },
                    })
                );

            return response.data.results;
        } catch (error) {
            this.logger.error(
                'Error searching works by title from Unpaywall',
                error
            );
            throw new Error('Failed to search works by title');
        }
    }

    /**
     * Método para obtener el enlace PDF de un trabajo (si está disponible)
     */
    async getPDFLink(doi: string): Promise<string | null> {
        try {
            const work = await this.getWorkByDOI(doi);
            return work.best_oa_location?.url_for_pdf || null;
        } catch (error) {
            this.logger.error('Error getting PDF link from Unpaywall', error);
            return null;
        }
    }

    /**
     * Método para obtener todos los enlaces OA de un trabajo
     */
    async getAllOALinks(doi: string): Promise<string[]> {
        try {
            const work = await this.getWorkByDOI(doi);
            return work.oa_locations.map(
                (location) => location.url_for_pdf || location.url
            );
        } catch (error) {
            this.logger.error('Error getting OA links from Unpaywall', error);
            return [];
        }
    }

    /**
     * Extrae DOI de un item si está disponible
     */
    private extractDOIFromItem(item: SurveyItem): string | null {
        // Implementar lógica para extraer DOI del título o resumen si es posible
        // Esto es una implementación básica - puedes mejorarla según tus necesidades
        const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
        const match =
            item.title.match(doiRegex) || item.summary.match(doiRegex);
        return match ? match[0] : null;
    }

    /**
     * Mapea un work de Unpaywall a CreateSurveyItemDto
     */
    private mapWorkToSurveyItem(work: UnpaywallWork): CreateSurveyItemType {
        return {
            title: work.title || 'Sin título',
            summary:
                work.abstract ||
                `Trabajo publicado en ${work.journal_name || work.publisher} con acceso ${work.is_oa ? 'abierto' : 'restringido'}`,
            source: 'Unpaywall',
            metadata: {
                doi: work.doi,
                publisher: work.publisher,
                journal: work.journal_name,
                issn: work.journal_issn_l,
                is_oa: work.is_oa,
                oa_status: work.oa_status,
                published_date: work.published_date,
                year: work.year,
                best_oa_location: work.best_oa_location,
                authors:
                    work.authors?.map((a) => `${a.given} ${a.family}`.trim()) ||
                    [],
            },
        } as unknown as CreateSurveyItemType;
    }

    /**
     * Mapea un work de Unpaywall a CrossRefResultDto
     */
    private mapWorkToUnpaywallResult(
        work: UnpaywallWork,
        originalItem: SurveyItem
    ): UnpaywallResponse {
        return {
            title: work.title || 'Sin título',
            abstract: work.abstract || '',
            authors:
                work.authors?.map((author) => ({
                    name: `${author.given} ${author.family}`.trim(),
                    givenName: author.given,
                    familyName: author.family,
                    affiliation: author.affiliation,
                })) || [],
            publication_date: work.published_date,
            publisher: work.publisher,
            topic: work.journal_name || '',
            keywords: [], // Unpaywall no proporciona keywords directamente
            citation_count: 0, // Unpaywall no proporciona conteo de citas
            source: 'Unpaywall',
            metadata: {
                doi: work.doi,
                is_oa: work.is_oa,
                oa_status: work.oa_status,
                journal_name: work.journal_name,
                journal_issns: work.journal_issns,
                best_oa_location: work.best_oa_location,
                oa_locations: work.oa_locations,
                data_standard: work.data_standard,
            },
            originalItem: originalItem,
        } as unknown as UnpaywallResponse;
    }
}
