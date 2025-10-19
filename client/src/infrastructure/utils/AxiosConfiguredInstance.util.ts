import axios, {
    AxiosError, 
    type AxiosInstance, 
    type AxiosResponse, 
    type InternalAxiosRequestConfig 
} from "axios";

export class AxiosConfiguredInstance {
    http: AxiosInstance;

    constructor(
        baseURL: string,
        bearer?: string,
        axiosInstance?: AxiosInstance
    ) {
        this.http = axiosInstance??
            axios.create({
                baseURL,
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                }
            });
        
        if (bearer) {
            this.http.interceptors.request.use(
                (config: InternalAxiosRequestConfig) => {
                    config.headers = config.headers?? {};
                    config.headers.Authorization = `Bearer ${bearer}`;
                    return config;
                }
            )
        };

        this.http.interceptors.response.use(
            (response: AxiosResponse) => response.data,
            (error: AxiosError) => {
                return Promise.reject(
                    error.response ?? error.message ?? 'Error desconocido de axios'
                );
            }
        );
    };
}