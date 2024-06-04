export function App()
{

    const queryClient = useMemo(() => (
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: Infinity,
                }
            }
        })
    ), []);

    const router = useMemo(() => (
        createBrowserRouter(
            createRoutesFromElements(
                <Route path="/">
                </Route>
            )
        )
    ), []);


    return (
        <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
        </QueryClientProvider>
    );
}