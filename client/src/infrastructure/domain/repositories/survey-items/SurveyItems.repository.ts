import type { UUID } from '../../..';
import {
    AxiosConfiguredInstance,
    type SurveyItemsInterface,
    type SurveyItem
} from '../../..';
import { getEnv } from '../../../config/env';
class SurveyItemsRepository implements SurveyItemsInterface {
    private readonly axios: AxiosConfiguredInstance;

    constructor() {

        this.axios = new AxiosConfiguredInstance(
            `${getEnv().VITE_SERVER_BASE_URL}/survey-items/`
        );

    }

    async findAllRecommended(): Promise<SurveyItem[]> {
        return await this.axios.http
            .get('recommended');
    };

    async findAllSubscribed(): Promise<SurveyItem[]> {
        return await this.axios.http
            .get('subscribed');
    };

    async findOne(
        itemId: UUID
    ): Promise<SurveyItem> {
        return await this.axios.http
            .get(`${itemId}`);
    };

    async subscribeOne(
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http
            .patch(`subscribe/${itemId}`);
    };

    async unsubscribeOne(
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http
            .patch(`unsubscribe/${itemId}`);
    };

    async removeOne(
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http
            .delete(`${itemId}`);
    };

    async subscribeBatch(
        itemIds: UUID[]
    ): Promise<void> {
        return await this.axios.http
            .patch('batch', { data: itemIds });
    };

    async unsubscribeBatch(
        itemIds: UUID[]
    ): Promise<void> {
        return await this.axios.http
            .patch('batch', { data: itemIds });
    };

    async removeBatch(
        itemIds: UUID[]
    ): Promise<void> {
        return await this.axios.http
            .delete('batch', { data: { itemIds } });
    };
}

export const surveyItemsRepository = new SurveyItemsRepository();