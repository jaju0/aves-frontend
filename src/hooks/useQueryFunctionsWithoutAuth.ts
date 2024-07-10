import { useContext } from "react";
import { QueriesWithoutAuthContext } from "../provider/QueriesWithoutAuthProvider";

export function useQueryFunctionsWithoutAuth()
{
    return useContext(QueriesWithoutAuthContext);
}