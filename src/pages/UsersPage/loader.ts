import { QueryClient } from "@tanstack/react-query";
import { userDataQuery, usersListQuery } from "../../queries";

export async function usersPageLoader(queryClient: QueryClient)
{
    return {
        userDataResponse: await queryClient.fetchQuery(userDataQuery),
        usersListDataResponse: await queryClient.fetchQuery(usersListQuery),
    };
}

export type UsersPageLoaderResponse = Awaited<ReturnType<typeof usersPageLoader>>;