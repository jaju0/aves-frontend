import { RestClientV5, WebsocketClient } from "bybit-api";
import { createContext, useRef } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./provider/AuthProvider";
import { QueriesWithoutAuthProvider } from "./provider/QueriesWithoutAuthProvider";
import { QueriesWithAuthProvider } from "./provider/QueriesWithAuthProvider";
import { Routes } from "./routes";

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

    return (
        <QueryClientProvider client={queryClientRef.current}>
            <BybitConnectorsContext.Provider value={bybitConnectorsRef.current}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
                    <QueriesWithoutAuthProvider>
                        <AuthProvider>
                            <QueriesWithAuthProvider>
                                <Routes />
                            </QueriesWithAuthProvider>
                        </AuthProvider>
                    </QueriesWithoutAuthProvider>
                </GoogleOAuthProvider>
            </BybitConnectorsContext.Provider>
        </QueryClientProvider>
    );
}