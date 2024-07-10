import { AxiosError, AxiosInstance } from "axios";

export interface LoginResponse
{
    accessToken: string;
    expirationTimestamp: number;
}

export const googleAuthMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (idToken: string) => {
        const response = await axiosInst.post<LoginResponse>("/auth/google", { id_token: idToken });
        if(response.status !== 200)
            return null;

        return response.data;
    },
});

export const refreshJwtTokenMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async () => {
        const response = await axiosInst.post<LoginResponse>("/auth/refresh");
        if(response.status !== 200)
            return null;

        return response.data;
    }
});

export const logoutMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async () => {
        try
        {
            const response = await axiosInst.post("/auth/logout");
            return response.status;
        }
        catch(error)
        {
            if(error instanceof AxiosError && error.response)
                return error.response.status;

            return 500;
        }
    }
});