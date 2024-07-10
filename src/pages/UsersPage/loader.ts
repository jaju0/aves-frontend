import { QueryClient } from "@tanstack/react-query";
import { QueryFunctionsWithAuth } from "../../provider/QueriesWithAuthProvider";

export async function usersPageLoader(queryClient: QueryClient, queryFunctionsWithAuth: QueryFunctionsWithAuth)
{
    return {
        userDataResponse: await queryClient.fetchQuery(queryFunctionsWithAuth.userDataQuery),
        usersListDataResponse: await queryClient.fetchQuery(queryFunctionsWithAuth.userListQuery),
    };
}

export type UsersPageLoaderResponse = Awaited<ReturnType<typeof usersPageLoader>>;