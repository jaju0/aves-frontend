import axios, { AxiosError } from "axios";
import { useJwtData } from "./hooks/useJwtData";

export const userRank = ["ADMIN", "USER", "NONE"];
export type UserRank = typeof userRank[number];

export interface Credential
{
    key: string;
    secret: string;
    demoTrading: boolean;
    isActive: boolean;
}

export interface UserData
{
    email: string;
    id: string;
    rank: UserRank;
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

export interface UserCreationRequestBody
{
    email: string;
    rank: string;
}

export interface UserAmendmentRequestBody
{
    email: string;
    rank: string;
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

export type UserDataResponse = UserData;
export type UserListResponse = UserData[];

const apiUrl = "http://localhost:4000/v1";

const service = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

let refreshTokenPending = false;
service.interceptors.request.use(async (config) => {
    if(refreshTokenPending)
        return config;

    refreshTokenPending = true;

    let jwtData = useJwtData();
    if(!jwtData)
        return config;

    if(Date.now() >= jwtData.expirationTimestamp)
    {
        const response = await service.post<SuccessfulLoginResponse>("/auth/refresh");
        jwtData = response.data;
        localStorage.setItem("jwt", JSON.stringify(jwtData));
    }

    config.headers["Authorization"] = "bearer " + jwtData.accessToken;
    refreshTokenPending = false;
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

export const usersListQuery = {
    gcTime: 0,
    queryKey: ["user", "list"],
    queryFn: async () => {
        try
        {
            const response = await service.get<UserListResponse>("/user/list");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const userCreationMutation = {
    mutationFn: async (body: UserCreationRequestBody) => {
        try
        {
            const response = await service.post<UserData>("/user/create", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const userAmendmentMutation = {
    mutationFn: async (body: UserAmendmentRequestBody) => {
        try
        {
            const response = await service.post<UserData>("/user/amend", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const userDeletionMutation = {
    mutationFn: async (email: string) => {
        try
        {
            const response = await service.post("/user/delete", { email });
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}