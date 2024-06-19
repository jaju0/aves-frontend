import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ISeriesApi, LineData, Time, WhitespaceData } from "lightweight-charts";
import { SpreadDataFeed, SpreadDataStatistics } from "../../SpreadDataFeed";
import { BybitConnectorsContext } from "../../App";
import { OrderSubmitionForm } from "../OrderSubmitionForm";
import { SpreadChart } from "../SpreadChart";
import { WSDataFeed } from "../../WSDataFeed";
import { SymbolPairContext } from "../../pages/ChartPage";

export interface ChartData
{
    statistics?: SpreadDataStatistics;
    initialResidualData?: (LineData<Time> | WhitespaceData<Time>)[];
}

export const SpreadDataFeedContext = createContext<SpreadDataFeed>({} as SpreadDataFeed);
export const WSDataFeedContext = createContext<WSDataFeed>({} as WSDataFeed);
export const ChartDataContext = createContext<[ChartData | undefined, React.Dispatch<React.SetStateAction<ChartData | undefined>>]>({} as [ChartData | undefined, React.Dispatch<React.SetStateAction<ChartData | undefined>>]);

export function SpreadChartWithControl()
{
    const queryClient = useQueryClient();
    const bybitConnectors = useContext(BybitConnectorsContext);
    const [symbolPair] = useContext(SymbolPairContext);
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

        spreadDataFeed.reset(symbolPair.interval, symbolPair.symbol1, symbolPair.symbol2);
    }, []);

    return (
        <SpreadDataFeedContext.Provider value={spreadDataFeed}>
            <WSDataFeedContext.Provider value={wsDataFeed}>
                <ChartDataContext.Provider value={[chartData, setChartData]}>
                    <div className="row-span-11 col-span-3">
                        <SpreadChart residualsLineSeriesRef={residualsLineSeriesRef} />
                    </div>
                    <div className="row-span-11">
                        <OrderSubmitionForm />
                    </div>
                </ChartDataContext.Provider>
            </WSDataFeedContext.Provider>
        </SpreadDataFeedContext.Provider>
    );
}