import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

export abstract class BaseExternalActor {
    protected readonly logger: Logger;

    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string,
    ) {
        this.logger = new Logger(loggerName);

        this.httpService.axiosRef.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                config.baseURL = this.baseURL;

                if (this.apiKey) config.headers.Authorization = `Bearer ${this.apiKey}`;

                config.headers['Content-Type'] = 'application/json';

                return config;
            },
            (error: Error) => Promise.reject(error),
        );

        this.httpService.axiosRef.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => {
                this.logger.error('API Request Failed:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    data: error.response?.data,
                });
                return Promise.reject(error);
            },
        );

        this.logger.log('Initialized');
    }
}
