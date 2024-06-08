import { useLayoutEffect, useMemo } from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedAreaLayout } from "./pages/ProtectedAreaLayout";
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
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                </Route>
            )
        )
    ), []);


    return (
        <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
        </QueryClientProvider>
    );
}