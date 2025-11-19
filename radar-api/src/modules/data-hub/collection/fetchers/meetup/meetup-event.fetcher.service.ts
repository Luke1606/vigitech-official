import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { MeetupEvent } from '../../types/meetup/meetup.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class MeetupEventsFetcher extends BaseFetcher {
    // TODO: Conseguir una API Key/Token y/o credenciales de socio para acceder a esta data.
    private readonly BASE_URL: string = 'https://api.meetup.com/find/events';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.MEETUP;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<MeetupEvent[]> {
        this.logger.log('Collecting upcoming technology-related Meetup events...');

        const params = new URLSearchParams({
            text: 'technology,software,ai',
            order: 'time',
            page: '50',
            // TODO: Añadir aquí 'key': 'YOUR_API_KEY'
        });

        const apiUrl = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await lastValueFrom(this.httpService.get<MeetupEvent[]>(apiUrl));
            return response?.data ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from Meetup API (requires authentication/partner status)', error);
            return [];
        }
    }
}
