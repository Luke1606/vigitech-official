import axios, {
    AxiosError, 
    type AxiosInstance, 
    type AxiosResponse, 
} from "axios";

export class AxiosConfiguredInstance {
    http: AxiosInstance;

    constructor(
        baseURL: string,
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