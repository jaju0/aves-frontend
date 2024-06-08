import { useLayoutEffect, useMemo } from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { refreshJwtTokenMutation } from "./queries";
import { ProtectedAreaLayout } from "./pages/ProtectedAreaLayout";
import { AccountPage } from "./pages/AccountPage";
import { accountPageLoader } from "./pages/AccountPage/loader";
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

    const router = useMemo(() => (
        createBrowserRouter(
            createRoutesFromElements(
                <Route path="/">
                    <Route element={<ProtectedAreaLayout />}>
                        <Route path="/account" loader={accountPageLoader.bind(null, queryClient)} element={<AccountPage />} />
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
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
                <RouterProvider router={router} />
            </GoogleOAuthProvider>
        </QueryClientProvider>
    );
}