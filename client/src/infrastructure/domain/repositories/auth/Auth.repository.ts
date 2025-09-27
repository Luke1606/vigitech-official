import { AxiosConfiguredInstance } from "@/infrastructure/utils";
import type { UserType } from "../../types/User.type";

class AuthRepository {
    private readonly axios: AxiosConfiguredInstance;

    constructor() {
        this.axios = new AxiosConfiguredInstance(
            `${import.meta.env.VITE_SERVER_BASE_URL}/users/`
        );
    }

    async fetchCurrentUser (): Promise<UserType> {
        return await this.axios.http.get('session')
        ;
    };
}

export const authRepository = new AuthRepository();