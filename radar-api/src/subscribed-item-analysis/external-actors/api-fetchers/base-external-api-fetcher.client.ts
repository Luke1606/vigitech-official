import {
    create,
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from 'axios';

export abstract class BaseExternalAPIClient {
    protected readonly http: AxiosInstance;

    protected constructor(
        baseURL: string,
        apiKey?: string,
        axiosInstance?: AxiosInstance
    ) {
        this.http = axiosInstance ??
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
                return Promise.reject(
                    error.response ??
                        error.message ??
                        'Error desconocido de axios'
                );
            }
        );
    }

    protected generalFetch(): object[] {
        return {} as object[];
    }

    protected abstract specificFetch(objective: object): object;
}
