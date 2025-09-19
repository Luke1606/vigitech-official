import { SurveyItem } from '@prisma/client';
import {
    create,
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from 'axios';
import { CreateSurveyItemDto } from 'src/survey-items/dto/create-survey-item.dto';

export abstract class BaseExternalAPIClient {
    protected readonly http: AxiosInstance;

    protected constructor(baseURL: string, apiKey?: string) {
        this.http = create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (apiKey) {
            this.http.interceptors.request.use(
                (config: InternalAxiosRequestConfig) => {
                    config.headers = config.headers ?? {};

                    if (apiKey)
                        config.headers.Authorization = `Bearer ${apiKey}`;

                    return config;
                }
            );
        }

        this.http.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );
    }

    abstract getTrendings(): Promise<CreateSurveyItemDto[]>;

    abstract getInfoFromItem(item: SurveyItem): Promise<object>;
}
