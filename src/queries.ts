import axios, { AxiosError } from "axios";
import { useJwtData } from "./hooks/useJwtData";

export interface Credential
{
    key: string;
    secret: string;
    demoTrading: boolean;
    isActive: boolean;
}

export interface CredentialsSubmitionRequestBody
{
    credentials: Credential[];
}

export interface CredentialsActivationRequestBody
{
    key: string;
}

export interface CredentialsDeletionRequestBody
{
    key: string;
}

export interface SuccessfulLoginResponse
{
    accessToken: string;
    expirationTimestamp: number;
}

export interface CredentialsResponse
{
    credentials: Credential[];
    active_credential: Credential;
}

export interface UserDataResponse
{
    email: string;
    id: string;
    rank: string;
}

const apiUrl = "http://localhost:4000/v1";

const service = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

service.interceptors.request.use(async (config) => {
    let jwtData = useJwtData();
    if(!jwtData)
        return config;

    /*
    // TODO: fix code (if running; it freezes the browser for unknown reason)
    if(Date.now() >= jwtData.expirationTimestamp)
    {
        const response = await service.post<SuccessfulLoginResponse>("/auth/refresh");
        jwtData = response.data;
        localStorage.setItem("jwt", JSON.stringify(jwtData));
    }
    */

    config.headers["Authorization"] = "bearer " + jwtData.accessToken;
    return config;
});

export const googleAuthMutation = {
    mutationFn: async (idToken: string) => {
        const response = await service.post<SuccessfulLoginResponse>("/auth/google", { id_token: idToken });
        if(response.status !== 200)
            return null;

        return response.data;
    },
};

export const refreshJwtTokenMutation = {
    mutationFn: async () => {
        const response = await service.post<SuccessfulLoginResponse>("/auth/refresh");
        if(response.status !== 200)
            return null;

        return response.data;
    }
};

export const logoutMutation = {
    mutationFn: async () => {
        try
        {
            const response = await service.post("/auth/logout");
            return response.status;
        }
        catch(error)
        {
            if(error instanceof AxiosError && error.response)
                return error.response.status;

            return 500;
        }
    }
}

export const accountCredentialsSubmitionMutation = {
    mutationFn: async (body: CredentialsSubmitionRequestBody) => {
        try
        {
            const response = await service.post("/account/credentials", body);
            return response.status;
        }
        catch(error)
        {
            return null;
        }
    }
};

export const accountCredentialsActivationMutation = {
    mutationFn: async (body: CredentialsActivationRequestBody) => {
        try
        {
            const response = await service.put("/account/credentials/activate", body);
            return response.status;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const accountCredentialsDeletionMutation = {
    mutationFn: async (body: CredentialsDeletionRequestBody) => {
        try
        {
            const response = await service.post("/account/credentials/delete", body);
            return response.status;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const accountCredentialsQuery = {
    gcTime: 0,
    queryKey: ["account", "credentials"],
    queryFn: async () => {
        try
        {
            const response = await service.get<CredentialsResponse>("/account/credentials");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    },
};

export const userDataQuery = {
    gcTime: 0,
    queryKey: ["account", "user-data"],
    queryFn: async () => {
        try
        {
            const response = await service.get<UserDataResponse>("/account/user-data");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

// TODO: take a look in axios interceptors