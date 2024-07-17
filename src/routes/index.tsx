import { createBrowserRouter, Navigate, RouteObject, RouterProvider } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { LoginPage } from "../pages/LoginPage";
import { ProtectedRoute } from "../pages/ProtectedRoute";
import { ChartPage } from "../pages/ChartPage";
import { PairsPage } from "../pages/PairsPage";
import { AccountPage } from "../pages/AccountPage";
import { accountPageLoader } from "../pages/AccountPage/loader";
import { UsersPage } from "../pages/UsersPage";
import { usersPageLoader } from "../pages/UsersPage/loader";
import { useQueryFunctionsWithAuth } from "../hooks/useQueryFunctionsWithAuth";

export function Routes()
{
    const [token] = useAuth();
    const queryFunctionsWithAuth = useQueryFunctionsWithAuth();
    const queryClient = useQueryClient();

    const publicRoutes: RouteObject[] = [

    ];

    const authOnlyRoutes: RouteObject[] = [
        {
            path: "/",
            element: <ProtectedRoute />,
            children: [
                {
                    index: true,
                    element: <Navigate to="/chart" />,
                },
                {
                    path: "/chart",
                    element: <ChartPage />,
                },
                {
                    path: "/pairs",
                    element: <PairsPage />,
                },
                {
                    path: "/account",
                    element: <AccountPage />,
                    loader: accountPageLoader.bind(null, queryClient, queryFunctionsWithAuth),
                },
                {
                    path: "/users",
                    element: <UsersPage />,
                    loader: usersPageLoader.bind(null, queryClient, queryFunctionsWithAuth),
                },
            ],
        },
    ];

    const noAuthOnlyRoutes: RouteObject[] = [
        {
            path: "/",
            element: <Navigate to="/login" />,
        },
        {
            path: "/login",
            element: <LoginPage />,
        },
    ];

    const router = createBrowserRouter([
        ...publicRoutes,
        ...(!token ? noAuthOnlyRoutes : []),
        ...authOnlyRoutes,
    ]);

    return <RouterProvider router={router} />;
}