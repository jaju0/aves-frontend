import { useContext } from "react";
import { QueriesWithAuthContext } from "../provider/QueriesWithAuthProvider";

export function useQueryFunctionsWithAuth()
{
    return useContext(QueriesWithAuthContext);
}