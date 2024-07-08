import { EventEmitter } from "events";
import { QueryClient } from "@tanstack/react-query";
import { RestClientV5, WebsocketClient, KlineIntervalV3, OHLCVKlineV5 } from "bybit-api";
import { UTCTimestamp } from "lightweight-charts";
import { BybitKlineQueryResponse, bybitKlineQuery } from "./queries";
import { OLS, adfuller, ar_halfLife } from "./statistics";

function klineClosePrices(klines: OHLCVKlineV5[])
{
    return klines.map(kline => +kline[4]);
}

function klineTimestamps(klines: OHLCVKlineV5[])
{
    return klines.map(kline => +kline[0]);
}

export interface SpreadDataStatistics
{
    tstat: number;
    usedLag: number;
    halfLife: number;
    hedgeRatio: number;
}

export interface SpreadDataFeedInitMsg
{
    chartData: { time: UTCTimestamp, value: number }[];
    statistics: SpreadDataStatistics;
}

export interface SpreadDataFeedUpdateMsg
{
    time: UTCTimestamp;
    value: number;
    symbol1LatestPrice: number;
    symbol2LatestPrice: number;
    statistics: SpreadDataStatistics;
}

export class SpreadDataFeed extends EventEmitter<{
    init: [SpreadDataFeedInitMsg];
    update: [SpreadDataFeedUpdateMsg];
}>
{
    private queryClient: QueryClient;
    private restClient: RestClientV5;
    private wsClient: WebsocketClient;

    private interval?: KlineIntervalV3;
    private symbol1?: string;
    private symbol2?: string;
    private statistics?: SpreadDataStatistics;

    private symbol1Prices: number[];
    private symbol2Prices: number[];
    private residuals: number[];
    private timestamps: number[];

    constructor(queryClient: QueryClient, restClient: RestClientV5, wsClient: WebsocketClient)
    {
        super();
        this.queryClient = queryClient;
        this.restClient = restClient;
        this.wsClient = wsClient;

        this.symbol1Prices = new Array();
        this.symbol2Prices = new Array();
        this.residuals = new Array();
        this.timestamps = new Array();
    }

    public async reset(interval: KlineIntervalV3, symbol1: string, symbol2: string)
    {
        this.unsubscribe();

        await this.fetchInitialData(interval, symbol1, symbol2);

        this.interval = interval;
        this.symbol1 = symbol1;
        this.symbol2 = symbol2;

        this.subscribe();
    }

    public shutdown()
    {
        this.removeAllListeners();
        this.unsubscribe();
    }

    public getLatestPriceOfSymbol1()
    {
        if(this.symbol1Prices.length)
            return this.symbol1Prices[this.symbol1Prices.length-1];

        return undefined;
    }

    public getLatestPriceOfSymbol2()
    {
        if(this.symbol2Prices.length)
            return this.symbol2Prices[this.symbol2Prices.length-1];

        return undefined;
    }

    public getStatistics()
    {
        return this.statistics;
    }

    private async fetchInitialData(interval: KlineIntervalV3, symbol1: string, symbol2: string)
    {
        const symbol1QueryData = this.queryClient.getQueryData<BybitKlineQueryResponse>(bybitKlineQuery(this.restClient, symbol1, interval).queryKey) ?? (await this.queryClient.fetchQuery<BybitKlineQueryResponse>(bybitKlineQuery(this.restClient, symbol1, interval)));
        const symbol2QueryData = this.queryClient.getQueryData<BybitKlineQueryResponse>(bybitKlineQuery(this.restClient, symbol2, interval).queryKey) ?? (await this.queryClient.fetchQuery<BybitKlineQueryResponse>(bybitKlineQuery(this.restClient, symbol2, interval)));

        symbol1QueryData.result.list.sort((a,b) => (+a[0]) - (+b[0]));
        symbol2QueryData.result.list.sort((a,b) => (+a[0]) - (+b[0]));

        this.symbol1Prices = klineClosePrices(symbol1QueryData.result.list);
        this.symbol2Prices = klineClosePrices(symbol2QueryData.result.list);
        this.timestamps = klineTimestamps(symbol1QueryData.result.list).map(t => t / 1000);

        const olsResult = OLS(this.symbol1Prices, this.symbol2Prices);
        this.residuals = olsResult.residuals.toArray().map(value => value.valueOf() as number);
        const adfullerResult = adfuller(this.residuals);
        const tstat = adfullerResult.result.tstat as number;
        const usedLag = adfullerResult.lagUsed;
        const halfLife = ar_halfLife(this.residuals);
        const hedgeRatio = olsResult.params as number;

        this.statistics = {
            tstat,
            usedLag,
            halfLife,
            hedgeRatio,
        };

        this.emit("init", <SpreadDataFeedInitMsg> {
            chartData: this.residuals.map((residual, index) => ({
                time: this.timestamps[index] as UTCTimestamp,
                value: residual,
            })),
            statistics: {
                tstat,
                usedLag,
                halfLife,
                hedgeRatio,
            }
        });
    }

    private unsubscribe()
    {
        if(this.interval !== undefined && this.symbol1 !== undefined && this.symbol2 !== undefined)
        {
            try
            {
                this.wsClient.unsubscribeV5([
                    `kline.${this.interval}.${this.symbol1}`,
                    `kline.${this.interval}.${this.symbol2}`,
                ], "linear");
            }
            catch(error)
            {
                console.error(`kline.${this.interval}.${this.symbol1} and kline.${this.interval}.${this.symbol2} already unsubscribed`);
            }

            this.wsClient.off("update", this.websocketUpdate.bind(this));
        }
    }

    private subscribe()
    {
        this.wsClient.on("update", this.websocketUpdate.bind(this));

        try
        {
            this.wsClient.subscribeV5([
                `kline.${this.interval}.${this.symbol1}`,
                `kline.${this.interval}.${this.symbol2}`,
            ], "linear");
        }
        catch(error)
        {
            console.error(`kline.${this.interval}.${this.symbol1} and kline.${this.interval}.${this.symbol2} already subscribed`);
        }
    }

    private websocketUpdate(response: any)
    {
        if(response.topic === `kline.${this.interval}.${this.symbol1}`)
            this.klineUpdate(this.symbol1Prices, this.symbol2Prices, response.data);
        else if(response.topic === `kline.${this.interval}.${this.symbol2}`)
            this.klineUpdate(this.symbol2Prices, this.symbol1Prices, response.data);
    }

    private klineUpdate(prices: number[], pairSymbolPrices: number[], klines: any[])
    {
        if(this.statistics === undefined)
            return;

        const sortedKlines = klines.sort((a,b) => (+a.start) - (+b.start));

        for(const kline of sortedKlines)
        {
            if(kline.start > this.timestamps[this.timestamps.length-1])
            {
                this.timestamps.push(+kline.start);
                this.timestamps.shift();

                prices.push(+kline.close);
                prices.shift();

                pairSymbolPrices.push(pairSymbolPrices[pairSymbolPrices.length-1]);
                pairSymbolPrices.shift();
                continue;
            }

            prices[prices.length-1] = kline.close;
        }

        const olsResult = OLS(this.symbol1Prices, this.symbol2Prices);
        const residuals = olsResult.residuals.toArray().map(residual => residual.valueOf() as number);
        const newResidual = residuals[residuals.length-1];

        this.emit("update", {
            time: (this.timestamps[this.timestamps.length-1] / 1000) as UTCTimestamp,
            value: newResidual,
            symbol1LatestPrice: this.symbol1Prices[this.symbol1Prices.length-1],
            symbol2LatestPrice: this.symbol2Prices[this.symbol2Prices.length-1],
            statistics: this.statistics,
        });
    }
}