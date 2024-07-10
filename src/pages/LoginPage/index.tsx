import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import logo from "../../assets/images/logo-lg.png";
import { useAuth } from "../../hooks/useAuth";
import { useQueryFunctionsWithoutAuth } from "../../hooks/useQueryFunctionsWithoutAuth";

export function LoginPage()
{
    const [token, setToken] = useAuth();
    const queryFunctionsWithoutAuth = useQueryFunctionsWithoutAuth();
    const googleAuthMutationResult = useMutation(queryFunctionsWithoutAuth.googleAuthMutation);
    const navigate = useNavigate();
    const [idToken, setIdToken] = useState<string | null>(null);

    useEffect(() => {
        if(idToken === null)
            return;

        googleAuthMutationResult.mutateAsync(idToken).then(jwtData => {
            if(!jwtData)
                return;

            setToken(jwtData.accessToken);
            navigate("/", { replace: true });
        });
    }, [idToken]);

    if(token)
        return <Navigate to="/" />;

    return (
        <div className="inline-block w-fit h-screen m-auto flex flex-col justify-center">
            <div className="text-center">
                <img alt="logo-lg" src={logo} />
            </div>
            <p className="text-4xl text-center font-semibold font-mono my-5">Aves Stack</p>
            <div className="mx-auto my-4">
                <GoogleLogin
                    onSuccess={(res => setIdToken(res.credential ?? null))}
                    onError={() => alert("error")}
                    auto_select={false}
                    useOneTap={true}
                />
            </div>
        </div>
    );
}