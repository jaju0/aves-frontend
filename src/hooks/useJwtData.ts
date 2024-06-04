import { SuccessfulLoginResponse } from "../queries";

export function useJwtData()
{
    const jwtDataString = localStorage.getItem("jwt");
    if(!jwtDataString)
        return undefined;

    const jwtData = JSON.parse(jwtDataString) as SuccessfulLoginResponse;
    return jwtData;
}