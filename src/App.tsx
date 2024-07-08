import { RestClientV5, WebsocketClient } from "bybit-api";
import { createContext, useLayoutEffect, useRef } from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { refreshJwtTokenMutation } from "./queries";
import { ChartPage } from "./pages/ChartPage";
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
    const queryClientRef = useRef(
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: Infinity,
                }
            }
        })
    );

    const bybitConnectorsRef = useRef<BybitConnectors>({
        restClient: new RestClientV5(),
        wsClient: new WebsocketClient({ market: "v5" }),
    });

    const routerRef = useRef(
        createBrowserRouter(
            createRoutesFromElements(
                <Route path="/">
                    <Route element={<ProtectedAreaLayout />}>
                        <Route path="/chart" element={<ChartPage />} />
                        <Route path="/account" loader={accountPageLoader.bind(null, queryClientRef.current)} element={<AccountPage />} />
                        <Route path="/users" loader={usersPageLoader.bind(null, queryClientRef.current)} element={<UsersPage />} />
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                </Route>
            )
        )
    );

    const jwtTokenRefreshMutationResult = useMutation(refreshJwtTokenMutation, queryClientRef.current);

    useLayoutEffect(() => {
        jwtTokenRefreshMutationResult.mutateAsync().then(jwtData => {
            if(!jwtData)
                return;

            localStorage.setItem("jwt", JSON.stringify(jwtData));
        });
    }, []);

    return (
        <QueryClientProvider client={queryClientRef.current}>
            <BybitConnectorsContext.Provider value={bybitConnectorsRef.current}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
                    <RouterProvider router={routerRef.current} />
                </GoogleOAuthProvider>
            </BybitConnectorsContext.Provider>
        </QueryClientProvider>
    );
}