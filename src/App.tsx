import { RestClientV5, WebsocketClient } from "bybit-api";
import { createContext, useLayoutEffect, useMemo } from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { refreshJwtTokenMutation } from "./queries";
import { ProtectedAreaLayout } from "./pages/ProtectedAreaLayout";
import { AccountPage } from "./pages/AccountPage";
import { accountPageLoader } from "./pages/AccountPage/loader";
import { UsersPage } from "./pages/UsersPage";
import { usersPageLoader } from "./pages/UsersPage/loader";

export interface BybitConnectors
{
    restClient: RestClientV5;
    wsClient: WebsocketClient;
}

export const BybitConnectorsContext = createContext<BybitConnectors>({} as BybitConnectors);

export function App()
{
    const queryClient = useMemo(() => (
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: Infinity,
                }
            }
        })
    ), []);

    const bybitConnectors = {
        restClient: useMemo(() => {
            return new RestClientV5();
        }, []),
        wsClient: useMemo(() => {
            return new WebsocketClient({
                market: "v5",
            });
        }, []),
    };

    const router = useMemo(() => (
        createBrowserRouter(
            createRoutesFromElements(
                <Route path="/">
                    <Route element={<ProtectedAreaLayout />}>
                        <Route path="/account" loader={accountPageLoader.bind(null, queryClient)} element={<AccountPage />} />
                        <Route path="/users" loader={usersPageLoader.bind(null, queryClient)} element={<UsersPage />} />
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                </Route>
            )
        )
    ), []);

    const jwtTokenRefreshMutationResult = useMutation(refreshJwtTokenMutation, queryClient);

    useLayoutEffect(() => {
        jwtTokenRefreshMutationResult.mutateAsync().then(jwtData => {
            if(!jwtData)
                return;

            localStorage.setItem("jwt", JSON.stringify(jwtData));
        });
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <BybitConnectorsContext.Provider value={bybitConnectors}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
                <RouterProvider router={router} />
            </GoogleOAuthProvider>
            </BybitConnectorsContext.Provider>
        </QueryClientProvider>
    );
}