import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseFetchingService } from '../fetching-service.base';
import { SurveyItemBasicData } from 'src/modules/survey-items/types/survey-item-basic-data.type';
import { UnpaywallResponse } from 'src/modules/external-data-usage/types/unpaywall-result.type';

@Injectable()
export class UnpaywallService extends BaseFetchingService {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        const loggerName: string = 'UnpaywallAPIFetcher';

        const unpaywallURL: string =
            configService.get<string>('UNPAYWALL_API_URL') ||
            'https://api.unpaywall.org/v2';

        const apiKey: string =
            configService.get<string>('UNPAYWALL_API_KEY') || 'apikey';

        if (!unpaywallURL || !apiKey) {
            throw new Error('Unpaywall API URL or API key is missing!');
        }
        super(httpService, loggerName, unpaywallURL, apiKey);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getTrendings(): Promise<SurveyItemBasicData[]> {
        // // Ejemplo: realizar una request GET y mapear la respuesta
        // return this.httpService.get('/trending').pipe(
        //     map((response) => response.data.message.items), // Ajusta según la estructura de la API de CrossRef
        //     map((items) => items.map(this.mapToCreateSurveyItemDto))
        // );
        throw new Error('Method not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getInfoFromItem(
        _item: SurveyItemBasicData
    ): Promise<UnpaywallResponse> {
        // // Ejemplo: realizar una request GET para un ítem específico
        // return this.httpService.get(`/works/${item.doi}`).pipe(
        //     map((response) => response.data.message),
        //     map(this.mapToCrossRefResultDto)
        // );
        throw new Error('Method not implemented');
    }
}
