import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";

export function useAuth()
{
    return useContext(AuthContext);
}