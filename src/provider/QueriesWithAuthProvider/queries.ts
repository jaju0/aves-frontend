import { AxiosInstance } from "axios";
import { CredentialsResponse, OrderData, PairData, PairFinderStatusResponse, PositionData, UserDataResponse, UserListResponse } from "./datatypes";

export const accountCredentialsQuery = (axiosInst: AxiosInstance) => ({
    gcTime: 0,
    queryKey: ["account", "credentials"],
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<CredentialsResponse>("/account/credentials");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    },
});

export const userDataQuery = (axiosInst: AxiosInstance) => ({
    gcTime: 0,
    queryKey: ["account", "user-data"],
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<UserDataResponse>("/account/user-data");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const userListQuery = (axiosInst: AxiosInstance) => ({
    gcTime: 0,
    queryKey: ["user", "list"],
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<UserListResponse>("/user/list");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const orderListQuery = (axiosInst: AxiosInstance) => ({
    gcTime: 0,
    queryKey: ["order", "list"],
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<OrderData[]>("/order/list");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const positionListQuery = (axiosInst: AxiosInstance) => ({
    gcTime: 0,
    queryKey: ["position", "list"],
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<PositionData[]>("/position/list");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const pairListQuery = (axiosInst: AxiosInstance) => ({
    queryKey: ["pair-finder", "pairs"],
    refetchInterval: 60 * 1000,
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<PairData[]>("/pair-finder/pairs");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const pairFinderStatusQuery = (axiosInst: AxiosInstance) => ({
    queryKey: ["pair-finder", "status"],
    refetchInterval: 60 * 1000,
    queryFn: async () => {
        try
        {
            const response = await axiosInst.get<PairFinderStatusResponse>("/pair-finder/status");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});