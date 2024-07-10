import { createContext, ReactNode, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useQueryFunctionsWithoutAuth } from "../../hooks/useQueryFunctionsWithoutAuth";

export const AuthContext = createContext<[string | null, React.Dispatch<React.SetStateAction<string | null>>]>([] as any as [string | null, React.Dispatch<React.SetStateAction<string | null>>]);

export interface AuthProviderProps
{
    children?: ReactNode;
}

export function AuthProvider(props: AuthProviderProps)
{
    const queryFunctionsWithoutAuth = useQueryFunctionsWithoutAuth();
    const logoutMutationResult = useMutation(queryFunctionsWithoutAuth.logoutMutation);
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwt"));

    useEffect(() => {
        if(token)
            localStorage.setItem("jwt", token);
        else
        {
            logoutMutationResult.mutateAsync().then(() => {
                localStorage.removeItem("jwt");
            });
        }
    }, [token]);

    return (
        <AuthContext.Provider value={[token, setToken]}>
            {props.children}
        </AuthContext.Provider>
    );
}