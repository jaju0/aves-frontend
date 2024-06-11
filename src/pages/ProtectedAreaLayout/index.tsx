import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { googleLogout } from "@react-oauth/google";
import { NavLink } from "../../components/NavLink";
import { logoutMutation } from "../../queries";
import { useJwtData } from "../../hooks/useJwtData";
import logo from "../../assets/images/logo-sm.png";

export function ProtectedAreaLayout()
{
    const logoutMutationResult = useMutation(logoutMutation);
    const jwtData = useJwtData();
    const navigate = useNavigate();

    if(!jwtData)
        return <Navigate to="/login" />;

    const logout = (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();
        logoutMutationResult.mutateAsync().then(() => {
            googleLogout();
            localStorage.removeItem("jwt");
            navigate("/login");
        });
    }

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
                    <li className="flex items-center"><button onClick={logout} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2 rounded-full">Logout</button></li>
                </ul>
            </div>
            <Outlet />
        </div>
    );
}