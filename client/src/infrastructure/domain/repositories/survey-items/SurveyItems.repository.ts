import type { UUID } from "crypto";
import { 
    AxiosConfiguredInstance,
    type SurveyItemsInterface,
    type SurveyItemDto
} from '@/infrastructure';

export class SurveyItemsRepository implements SurveyItemsInterface {
    private readonly axios: AxiosConfiguredInstance = new AxiosConfiguredInstance(
        `${process.env.SERVER_BASE_URL}survey-items/`
    );
    
    async findAllRecommendations (): Promise<SurveyItemDto[]> {
        return await this.axios.http.get('recommended');
    };

    async findAllSubscribed (): Promise<SurveyItemDto[]> {
        return await this.axios.http.get('subscribed');
    };

    async findOne (itemId: UUID): Promise<SurveyItemDto> {
        return await this.axios.http.get(`:${itemId}`);
    };

    async subscribe (itemId: UUID): Promise<void> {
        return await this.axios.http.patch(`subscribe/:${itemId}`);
    };

    async unsubscribe (itemId: UUID): Promise<void> {
        return await this.axios.http.patch(`unsubscribe/:${itemId}`);
    };

    async remove (itemId: UUID): Promise<void> {
        return await this.axios.http.delete(`:${itemId}`);
    };
}