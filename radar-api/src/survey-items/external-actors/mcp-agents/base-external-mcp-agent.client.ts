import {
    create,
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from 'axios';
import { GeneralSearchResultDto } from '../../dto/general-search-result.dto';
import { MetricsDto } from '../../dto/analysis-metrics.dto';
import { SurveyItemBasicData } from '../../types/survey-item-basic-data.type';

export abstract class BaseExternalMCPClient {
    protected http: AxiosInstance;

    protected constructor(
        baseURL: string,
        apiKey?: string,
        axiosInstance?: AxiosInstance
    ) {
        this.http =
            axiosInstance ??
            create({
                baseURL,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        if (apiKey) {
            this.http.interceptors.request.use(
                (config: InternalAxiosRequestConfig) => {
                    config.headers = config.headers ?? {};
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

    abstract specificAnalysis(
        item: SurveyItemBasicData,
        data: GeneralSearchResultDto
    ): Promise<MetricsDto>;
}
