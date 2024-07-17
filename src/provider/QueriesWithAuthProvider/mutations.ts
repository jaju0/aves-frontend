import { AxiosInstance } from "axios";
import { ActivateAccountCredentialRequestBody, AmendOrderRequestBody, AmendPositionRequestBody, AmendUserRequestBody, CancelOrderRequestBody, CreateUserRequestBody, DeleteAccountCredentialRequestBody, LiquidatePositionRequestBody, SubmitAccountCredentialsRequestBody, SubmitOrderRequestBody, UserData } from "./datatypes";

export const submitAccountCredentialsMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: SubmitAccountCredentialsRequestBody) => {
        try
        {
            const response = await axiosInst.post("/account/credentials", body);
            return response.status;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const activateAccountCredentialMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: ActivateAccountCredentialRequestBody) => {
        try
        {
            const response = await axiosInst.put("/account/credentials/activate", body);
            return response.status;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const deleteAccountCredentialMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: DeleteAccountCredentialRequestBody) => {
        try
        {
            const response = await axiosInst.post("/account/credentials/delete", body);
            return response.status;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const createUserMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: CreateUserRequestBody) => {
        try
        {
            const response = await axiosInst.post<UserData>("/user/create", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const amendUserMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: AmendUserRequestBody) => {
        try
        {
            const response = await axiosInst.post<UserData>("/user/amend", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const deleteUserMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (email: string) => {
        try
        {
            const response = await axiosInst.post("/user/delete", { email });
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const submitOrderMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: SubmitOrderRequestBody) => {
        try
        {
            const response = await axiosInst.post("/order/submit", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const amendOrderMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: AmendOrderRequestBody) => {
        try
        {
            const response = await axiosInst.post("/order/amend", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const cancelOrderMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: CancelOrderRequestBody) => {
        try
        {
            const response = await axiosInst.post("/order/cancel", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const liquidatePositionMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: LiquidatePositionRequestBody) => {
        try
        {
            const response = await axiosInst.post("/position/liquidate", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const amendPositionMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async (body: AmendPositionRequestBody) => {
        try
        {
            const response = await axiosInst.post("/position/amend", body);
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const startPairFinderMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async () => {
        try
        {
            const response = await axiosInst.post("/pair-finder/start");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});

export const stopPairFinderMutation = (axiosInst: AxiosInstance) => ({
    mutationFn: async () => {
        try
        {
            const response = await axiosInst.post("/pair-finder/stop");
            return response.data;
        }
        catch(error)
        {
            return null;
        }
    }
});