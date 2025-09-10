import type { UUID } from "crypto";
import { AxiosConfiguredInstance } from "../../../api";
import type { SurveyItemsInterface } from "../../interfaces";
import type { SurveyItemDto } from "../../types";

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