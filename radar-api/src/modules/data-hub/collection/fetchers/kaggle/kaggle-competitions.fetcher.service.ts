import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { KaggleCompetition } from '../../types/kaggle/kaggle.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class KaggleCompetitionsFetcher extends BaseFetcher {
    // TODO: La API de Kaggle requiere autenticación CLI.
    // La misma nota de autenticación aplica para las competiciones.
    private readonly BASE_URL = 'https://www.kaggle.com/api/v1/competitions';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.KAGGLE;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<KaggleCompetition[]> {
        this.logger.log('Collecting active and popular Kaggle competitions...');

        // Simulación: Buscamos competiciones activas y ordenadas por número de equipos.
        const apiUrl = `${this.BASE_URL}/list?sort_by=entries&page_size=100&status=running`;

        try {
            // Esta llamada es una URL simulada; fallará sin la autenticación adecuada de Kaggle.
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            return (response?.data as KaggleCompetition[]) ?? [];
        } catch (error) {
            this.logger.error('Failed to collect competitions data from Kaggle', error);
            throw error;
        }
    }
}
