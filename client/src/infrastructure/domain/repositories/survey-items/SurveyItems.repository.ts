import type { UUID } from "crypto";
import { 
    AxiosConfiguredInstance,
    type SurveyItemsInterface,
    type SurveyItemDto
} from '@/infrastructure';

class SurveyItemsRepository implements SurveyItemsInterface {
    private readonly axios: AxiosConfiguredInstance = new AxiosConfiguredInstance(
        `${process.env.VITE_SERVER_BASE_URL}/survey-items/`
    );

    async findAllRecommended (): Promise<SurveyItemDto[]> {
        return await this.axios.http.get('recommended');
    };

    async findAllSubscribed (): Promise<SurveyItemDto[]> {
        return await this.axios.http.get('subscribed');
    };

    async findOne (
        itemId: UUID
    ): Promise<SurveyItemDto> {
        return await this.axios.http.get(`${itemId}`);
    };

    async subscribeOne (
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http.patch(`subscribe/${itemId}`);
    };

    async unsubscribeOne (
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http.patch(`unsubscribe/${itemId}`);
    };

    async removeOne (
        itemId: UUID
    ): Promise<void> {
        return await this.axios.http.delete(`${itemId}`);
    };

    async subscribeBatch (
        itemIds: UUID[]
    ): Promise<void> {
        return await this.axios.http.patch(`subscribe/batch`, { itemIds });
    };

    async unsubscribeBatch (
        itemIds: UUID[]
    ): Promise<void> {
        return await this.axios.http.patch(`unsubscribe/batch`, { itemIds });
    };

    async removeBatch (
        itemIds: UUID[]
    ): Promise<void> {
        return await this.axios.http.delete(`batch`, { data: { itemIds } });
    };
}

export const surveyItemsRepository = new SurveyItemsRepository();