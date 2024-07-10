import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useQueryFunctionsWithoutAuth } from "../../hooks/useQueryFunctionsWithoutAuth";
import { NavLink } from "../../components/NavLink";
import logo from "../../assets/images/logo-sm.png";

export function ProtectedRoute()
{
    const [token, setToken] = useAuth();
    const queryFunctionsWithoutAuth = useQueryFunctionsWithoutAuth();
    const jwtTokenRefreshMutation = useMutation(queryFunctionsWithoutAuth.refreshJwtTokenMutation);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined = undefined;
        const refreshToken = () => {
            console.log("refresh token");
            jwtTokenRefreshMutation.mutateAsync().then(data => {
                if(data)
                {
                    setToken(data.accessToken);
                    timeout = setTimeout(refreshToken, data.expirationTimestamp-Date.now()-10000);
                }
            }).catch(() => {
                setToken(null);
            });
        };

        refreshToken();

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    if(!token)
        return <Navigate to="/login" />;

    return (
        <div className="w-full h-screen flex flex-col justify-between">
            <div className="flex flex-row justify-between w-full px-5 py-3">
                <a href="/">
                    <img alt="brand-icon" src={logo} />
                </a>
                <ul className="flex gap-5">
                    <li className="flex items-center"><NavLink to="/chart" href="/chart" className={`transition ease-in-out hover:text-zinc-300`}>Chart</NavLink></li>
                    <li className="flex items-center"><NavLink to="/account" href="/account" className={`transition ease-in-out hover:text-zinc-300`}>Account</NavLink></li>
                    <li className="flex items-center"><NavLink to="/users" href="/users" className={`transition ease-in-out hover:text-zinc-300`}>Users</NavLink></li>
                </ul>
                <ul className="flex gap-5">
                    <li className="flex items-center"><button onClick={() => setToken(null)} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2 rounded-full">Logout</button></li>
                </ul>
            </div>
            <Outlet />
        </div>
    );
}