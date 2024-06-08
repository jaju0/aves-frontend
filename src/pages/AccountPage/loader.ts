import { QueryClient } from "@tanstack/react-query";
import { accountCredentialsQuery, userDataQuery } from "../../queries";

export async function accountPageLoader(queryClient: QueryClient)
{
    console.log("revalidate")
    return {
        userDataResponse: await queryClient.fetchQuery(userDataQuery),
        credentialsResponse: await queryClient.fetchQuery(accountCredentialsQuery),
    };
}

export type AccountPageLoaderResponse = Awaited<ReturnType<typeof accountPageLoader>>;