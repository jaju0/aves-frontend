import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import { createContext, ReactNode, useMemo } from "react";
import { googleAuthMutation, logoutMutation, refreshJwtTokenMutation } from "./mutations";

const setup = (axiosInst: AxiosInstance) => ({
    googleAuthMutation: googleAuthMutation(axiosInst),
    refreshJwtTokenMutation: refreshJwtTokenMutation(axiosInst),
    logoutMutation: logoutMutation(axiosInst),
});

export type QueryFunctionsWithoutAuth = ReturnType<typeof setup>;
export const QueriesWithoutAuthContext = createContext<QueryFunctionsWithoutAuth>({} as QueryFunctionsWithoutAuth);

export interface QueriesWithoutAuthProvider
{
    children?: ReactNode;
}

export function QueriesWithoutAuthProvider(props: QueriesWithoutAuthProvider)
{
    const functions = useMemo(() => {
        const config: CreateAxiosDefaults = {};
        config.baseURL = `http://${import.meta.env.VITE_API_HOST}/v1`;
        config.withCredentials = true;

        const axiosInstance = axios.create(config);

        return setup(axiosInstance);
    }, []);

    return (
        <QueriesWithoutAuthContext.Provider value={functions}>
            {props.children}
        </QueriesWithoutAuthContext.Provider>
    )
}