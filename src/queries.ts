import axios, { AxiosError } from "axios";
import { APIResponseV3WithTime, CategorySymbolListV5, InstrumentInfoResponseV5, KlineIntervalV3, OHLCVKlineV5, RestClientV5 } from "bybit-api";
import { useJwtData } from "./hooks/useJwtData";

export const userRank = ["ADMIN", "USER", "NONE"] as const;
export type UserRank = typeof userRank[number];

export const orderType = ["Market", "Limit", "Stop"] as const;
export type OrderType = typeof orderType[number];

export const orderSide = ["Buy", "Sell"] as const;
export type OrderSide = typeof orderSide[number];

export const positionSide = ["None", "Long", "Short"] as const;
export type PositionSide = typeof positionSide[number];

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

export interface OrderSubmitionRequestBody
{
    type: OrderType;
    side: OrderSide;
    symbol1: string;
    symbol2: string;
    regressionSlope: number;
    symbol1EntryPrice?: number;
    symbol2EntryPrice?: number;
    takeProfit?: number;
    stopLoss?: number;
    quoteQty?: number;
    baseQty?: { symbol1BaseQty: number; symbol2BaseQty: number };
}

export interface OrderAmendmentRequestBody
{
    orderId: string;
    symbol1EntryPrice?: number;
    symbol2EntryPrice?: number;
    takeProfit?: number | null;
    stopLoss?: number | null;
}

export interface OrderCancelationRequestBody
{
    orderId: string;
}

export interface PositionLiquidationRequestBody
{
    symbol1: string;
    symbol2: string;
}

export interface PositionAmendmentRequestBody
{
    symbol1: string;
    symbol2: string;
    takeProfit?: string | null;
    stopLoss?: string | null;
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

export interface OrderData
{
    id: string;
    ownerId: string;
    status: string;
    type: OrderType;
    side: OrderSide;
    symbol1: string;
    symbol2: string;
    symbol1BaseQty: string;
    symbol2BaseQty: string;
    quoteQty?: string;
    symbol1EntryPrice?: string;
    symbol2EntryPrice?: string;
    regressionSlope: string;
    takeProfit?: string;
    stopLoss?: string;
}

export interface PositionData
{
    id: string;
    ownerId: string;
    side: PositionSide;
    symbol1: string;
    symbol2: string;
    symbol1EntryPrice: string;
    symbol2EntryPrice: string;
    symbol1BaseQty: string;
    symbol2BaseQty: string;
    lastPnl: string;
    regressionSlope: string;
    takeProfit?: string;
    stopLoss?: string;
    open: boolean;
}

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

export const orderListQuery = {
    gcTime: 0,
    queryKey: ["order", "list"],
    queryFn: async () => {
        try
        {
            const response = await service.get<OrderData[]>("/order/list");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const orderSubmitionMutation = {
    mutationFn: async (body: OrderSubmitionRequestBody) => {
        try
        {
            const response = await service.post("/order/submit", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const orderAmendmentMutation = {
    mutationFn: async (body: OrderAmendmentRequestBody) => {
        try
        {
            const response = await service.post("/order/amend", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const orderCancelationMutation = {
    mutationFn: async (body: OrderCancelationRequestBody) => {
        try
        {
            const response = await service.post("/order/cancel", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const positionListQuery = {
    gcTime: 0,
    queryKey: ["position", "list"],
    queryFn: async () => {
        try
        {
            const response = await service.get<PositionData[]>("/position/list");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const positionLiquidationMutation = {
    mutationFn: async (body: PositionLiquidationRequestBody) => {
        try
        {
            const response = await service.post("/position/liquidate", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}

export const positionAmendmentMutation = {
    mutationFn: async (body: PositionAmendmentRequestBody) => {
        try
        {
            const response = await service.post("/position/amend", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
}



export const bybitInstrumentInfoQuery = (bybitRestClient: RestClientV5) => ({
    staleTime: Infinity,
    queryKey: ["bybit", "instrumentInfo"],
    queryFn: async () => {
        const response = await bybitRestClient.getInstrumentsInfo({
            category: "linear",
        });

        return response;
    },
});

export type BybitInstrumentInfoQueryResponse = APIResponseV3WithTime<InstrumentInfoResponseV5<"linear">>;

export const bybitKlineQuery = (bybitRestClient: RestClientV5, symbol: string, interval: KlineIntervalV3) => ({
    staleTime: typeof (+interval) === "number" ? Date.now() % ((+interval) * 60 * 1000) : Infinity,
    queryKey: ["bybit", "kline", symbol, interval],
    queryFn: async () => {
        const response = await bybitRestClient.getKline({
            category: "linear",
            interval: interval,
            symbol: symbol,
            limit: 1000,
        });

        console.log(response);

        return response;
    },
});

export type BybitKlineQueryResponse = APIResponseV3WithTime<CategorySymbolListV5<OHLCVKlineV5[], "spot" | "linear" | "inverse">>;