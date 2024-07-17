import { KlineIntervalV3 } from "bybit-api";

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

export interface PairData
{
    id: string;
    created_at: Date;
    symbol1: string;
    symbol2: string;
    interval: KlineIntervalV3;
    slope: number;
    tstat: number;
    lag: number;
    half_life: number;
}

export interface SubmitAccountCredentialsRequestBody
{
    credentials: Credential[];
}

export interface ActivateAccountCredentialRequestBody
{
    key: string;
}

export interface DeleteAccountCredentialRequestBody
{
    key: string;
}

export interface CreateUserRequestBody
{
    email: string;
    rank: string;
}

export interface AmendUserRequestBody
{
    email: string;
    rank: string;
}

export interface SubmitOrderRequestBody
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

export interface AmendOrderRequestBody
{
    orderId: string;
    symbol1EntryPrice?: number;
    symbol2EntryPrice?: number;
    takeProfit?: number | null;
    stopLoss?: number | null;
}

export interface CancelOrderRequestBody
{
    orderId: string;
}

export interface LiquidatePositionRequestBody
{
    symbol1: string;
    symbol2: string;
}

export interface AmendPositionRequestBody
{
    symbol1: string;
    symbol2: string;
    takeProfit?: string | null;
    stopLoss?: string | null;
}


export interface CredentialsResponse
{
    credentials: Credential[];
    active_credential: Credential;
}

export type UserDataResponse = UserData;
export type UserListResponse = UserData[];

export interface PairFinderStatusResponse
{
    isRunning: boolean;
}