import { KlineIntervalV3 } from "bybit-api";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ISeriesApi, LineData, Time, WhitespaceData } from "lightweight-charts";
import { BybitConnectorsContext } from "../../App";
import { PairSearchForm } from "../../components/PairSearchForm";
import { SpreadChart } from "../../components/SpreadChart";
import { OrderSubmitionForm } from "../../components/OrderSubmitionForm";
import { TradingBox } from "../../components/TradingBox";
import { SpreadDataFeed, SpreadDataStatistics } from "../../SpreadDataFeed";
import { WSDataFeed } from "../../WSDataFeed";

export interface SymbolPair
{
    symbol1: string;
    symbol2: string;
    interval: KlineIntervalV3;
}

export interface ChartData
{
    statistics?: SpreadDataStatistics;
    initialResidualData?: (LineData<Time> | WhitespaceData<Time>)[];
}

export const SpreadDataFeedContext = createContext<SpreadDataFeed>({} as SpreadDataFeed);
export const WSDataFeedContext = createContext<WSDataFeed>({} as WSDataFeed);
export const ChartDataContext = createContext<[ChartData | undefined, React.Dispatch<React.SetStateAction<ChartData | undefined>>]>({} as [ChartData | undefined, React.Dispatch<React.SetStateAction<ChartData | undefined>>]);
export const SymbolPairContext = createContext<[SymbolPair, React.Dispatch<React.SetStateAction<SymbolPair>>]>({} as [SymbolPair, React.Dispatch<React.SetStateAction<SymbolPair>>]);

export function ChartPage()
{
    const localSymbolPair = JSON.parse(localStorage.getItem("symbolPair") ?? "{}");
    const queryClient = useQueryClient();
    const bybitConnectors = useContext(BybitConnectorsContext);
    const [symbolPair, setSymbolPair] = useState<SymbolPair>(localSymbolPair);
    const [chartData, setChartData] = useState<ChartData>();
    const residualsLineSeriesRef = useRef<ISeriesApi<"Line">>(null);

    const spreadDataFeed = useMemo(() => {
        return new SpreadDataFeed(queryClient, bybitConnectors.restClient, bybitConnectors.wsClient);
    }, []);

    const wsDataFeed = useMemo(() => {
        return new WSDataFeed();
    }, []);

    useLayoutEffect(() => {
        spreadDataFeed.on("init", (data) => {
            setChartData({
                statistics: data.statistics,
                initialResidualData: data.chartData,
            });

            residualsLineSeriesRef.current?.setData(data.chartData);
        });

        spreadDataFeed.on("update", (data) => {
            residualsLineSeriesRef.current?.update(data);
        });

        if(
            symbolPair.symbol1 !== undefined && symbolPair.symbol2 !== undefined &&
            symbolPair.symbol1 !== "" && symbolPair.symbol2 !== ""
        )
            spreadDataFeed.reset(symbolPair.interval, symbolPair.symbol1, symbolPair.symbol2);
    }, []);

    useEffect(() => {
        localStorage.setItem("symbolPair", JSON.stringify(symbolPair));
    }, [symbolPair]);

    return (
        <SymbolPairContext.Provider value={[symbolPair, setSymbolPair]}>
            <SpreadDataFeedContext.Provider value={spreadDataFeed}>
                <WSDataFeedContext.Provider value={wsDataFeed}>
                    <ChartDataContext.Provider value={[chartData, setChartData]}>
                        <div className="h-full">
                            <div className="h-full grid grid-rows-12 grid-cols-4 gap-1 px-5">
                                <div className="row-span-1 col-span-4">
                                    <PairSearchForm />
                                </div>
                                <div className="row-span-11 col-span-3">
                                    <SpreadChart residualsLineSeriesRef={residualsLineSeriesRef} />
                                </div>
                                <div className="row-span-11">
                                    <OrderSubmitionForm />
                                </div>
                            </div>
                            <div className="w-full">
                                <TradingBox />
                            </div>
                        </div>
                    </ChartDataContext.Provider>
                </WSDataFeedContext.Provider>
            </SpreadDataFeedContext.Provider>
        </SymbolPairContext.Provider>
    );
}

