import { APIResponseV3WithTime, CategorySymbolListV5, InstrumentInfoResponseV5, KlineIntervalV3, OHLCVKlineV5, RestClientV5 } from "bybit-api";

export const bybitInstrumentInfoQuery = (bybitRestClient: RestClientV5) => ({
    staleTime: Infinity,
    queryKey: ["bybit", "instrumentInfo"],
    queryFn: async () => {
        const response = await bybitRestClient.getInstrumentsInfo({
            category: "linear",
        });

        return response;
    },
});

export type BybitInstrumentInfoQueryResponse = APIResponseV3WithTime<InstrumentInfoResponseV5<"linear">>;

export const bybitKlineQuery = (bybitRestClient: RestClientV5, symbol: string, interval: KlineIntervalV3) => ({
    staleTime: typeof (+interval) === "number" ? Date.now() % ((+interval) * 60 * 1000) : Infinity,
    queryKey: ["bybit", "kline", symbol, interval],
    queryFn: async () => {
        const response = await bybitRestClient.getKline({
            category: "linear",
            interval: interval,
            symbol: symbol,
            limit: 1000,
        });

        return response;
    },
});

export type BybitKlineQueryResponse = APIResponseV3WithTime<CategorySymbolListV5<OHLCVKlineV5[], "spot" | "linear" | "inverse">>;