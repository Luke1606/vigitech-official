import { UUID } from 'crypto';
import {
    type SurveyItemsInterface,
    type SurveyItem
} from '../../..';
import { AxiosConfiguredInstance } from '../../../utils/AxiosConfiguredInstance.util';
import { getEnv } from '../../../config/env';
export class SurveyItemsRepository implements SurveyItemsInterface {
    private readonly axios: AxiosConfiguredInstance;

    constructor() {

        this.axios = new AxiosConfiguredInstance(
            `${getEnv().VITE_SERVER_BASE_URL}/tech-survey`
        );

    }

    async findAllRecommended(): Promise<SurveyItem[]> {
        return await this.axios.http
            .get('survey-items/recommended');
    };

    async findAllSubscribed(): Promise<SurveyItem[]> {
        return await this.axios.http
            .get('survey-items/subscribed');
    };

    async findOne(
        itemId: UUID
    ): Promise<SurveyItem> {
        return await this.axios.http
            .get(`survey-items/${itemId}`);
    };

    async create(
        title: string,
    ): Promise<void> {
        return await this.axios.http
            .post('survey-items/create', { title: title })
    }

    async subscribeOne(
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http
            .patch(`survey-items/subscribe/${itemId}`);
    };

    async unsubscribeOne(
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http
            .patch(`survey-items/unsubscribe/${itemId}`);
    };

    async removeOne(
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http
            .delete(`survey-items/${itemId}`);
    };

    async createBatch(
        titles: string[],
    ): Promise<void> {
        const data = titles.map(title => ({ title }));

        return await this.axios.http
            .post('survey-items/create/batch', data)
    }

    async subscribeBatch(itemIds: UUID[]): Promise<void> {
        return await this.axios.http.patch('survey-items/subscribe/batch', itemIds);
    }

    async unsubscribeBatch(itemIds: UUID[]): Promise<void> {
        return await this.axios.http.patch('survey-items/unsubscribe/batch', itemIds);
    }

    async removeBatch(itemIds: UUID[]): Promise<void> {
        return await this.axios.http.delete('survey-items/batch', { data: itemIds });
    }

    async runGlobalRecommendations(): Promise<{ message: string, data: any[] }> {
        const response = await this.axios.http
            .post('orchestration/run-global-recommendations');

        return response.data;
    }
}

export const surveyItemsRepository = new SurveyItemsRepository();