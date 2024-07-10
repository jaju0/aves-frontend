import { QueryClient } from "@tanstack/react-query";
import { QueryFunctionsWithAuth } from "../../provider/QueriesWithAuthProvider";

export async function accountPageLoader(queryClient: QueryClient, queryFunctionsWithAuth: QueryFunctionsWithAuth)
{
    return {
        userDataResponse: await queryClient.fetchQuery(queryFunctionsWithAuth.userDataQuery),
        credentialsResponse: await queryClient.fetchQuery(queryFunctionsWithAuth.accountCredentialsQuery),
    };
}

export type AccountPageLoaderResponse = Awaited<ReturnType<typeof accountPageLoader>>;