import { createContext, ReactNode, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import { activateAccountCredentialMutation, amendOrderMutation, amendPositionMutation, amendUserMutation, cancelOrderMutation, createUserMutation, deleteAccountCredentialMutation, deleteUserMutation, liquidatePositionMutation, startPairFinderMutation, stopPairFinderMutation, submitAccountCredentialsMutation, submitOrderMutation } from "./mutations";
import { accountCredentialsQuery, orderListQuery, pairFinderStatusQuery, pairListQuery, positionListQuery, userDataQuery, userListQuery } from "./queries";

const setup = (axiosInst: AxiosInstance) => ({
    accountCredentialsQuery: accountCredentialsQuery(axiosInst),
    userDataQuery: userDataQuery(axiosInst),
    userListQuery: userListQuery(axiosInst),
    orderListQuery: orderListQuery(axiosInst),
    positionListQuery: positionListQuery(axiosInst),
    pairListQuery: pairListQuery(axiosInst),
    pairFinderStatusQuery: pairFinderStatusQuery(axiosInst),
    submitAccountCredentialsMutation: submitAccountCredentialsMutation(axiosInst),
    activateAccountCredentialMutation: activateAccountCredentialMutation(axiosInst),
    deleteAccountCredentialMutation: deleteAccountCredentialMutation(axiosInst),
    createUserMutation: createUserMutation(axiosInst),
    amendUserMutation: amendUserMutation(axiosInst),
    deleteUserMutation: deleteUserMutation(axiosInst),
    submitOrderMutation: submitOrderMutation(axiosInst),
    amendOrderMutation: amendOrderMutation(axiosInst),
    cancelOrderMutation: cancelOrderMutation(axiosInst),
    liquidatePositionMutation: liquidatePositionMutation(axiosInst),
    amendPositionMutation: amendPositionMutation(axiosInst),
    startPairFinderMutation: startPairFinderMutation(axiosInst),
    stopPairFinderMutation: stopPairFinderMutation(axiosInst),
});

export type QueryFunctionsWithAuth = ReturnType<typeof setup>;
export const QueriesWithAuthContext = createContext<QueryFunctionsWithAuth>({} as QueryFunctionsWithAuth);

export interface QueriesWithAuthProviderProps
{
    children?: ReactNode;
}

export function QueriesWithAuthProvider(props: QueriesWithAuthProviderProps)
{
    const [token] = useAuth();

    const functions = useMemo(() => {
        const config: CreateAxiosDefaults = {};
        config.baseURL = "http://localhost:4000/v1";
        config.withCredentials = true;

        if(token)
        {
            config.headers = {
                Authorization: "Bearer " + token,
            };
        }

        const axiosInstance = axios.create(config);

        return setup(axiosInstance);
    }, [token]);

    return (
        <QueriesWithAuthContext.Provider value={functions}>
            {props.children}
        </QueriesWithAuthContext.Provider>
    );
}