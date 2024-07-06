import { useContext, useEffect } from "react";
import colors from "tailwindcss/colors";
import { ISeriesApi } from "lightweight-charts";
import { ChartDataContext, SpreadDataFeedContext, SymbolPairContext } from "../../pages/ChartPage";
import { Chart } from "../Chart";
import { LineSeries } from "../Series";
import { ChartTrading } from "../ChartTrading";

export interface SpreadChartProps
{
    residualsLineSeriesRef: React.RefObject<ISeriesApi<"Line">>;
}

export function SpreadChart(props: SpreadChartProps)
{
    const [symbolPair] = useContext(SymbolPairContext);
    const [chartData, setChartData] = useContext(ChartDataContext);
    const spreadDataFeed = useContext(SpreadDataFeedContext);

    useEffect(() => {
        if(
            symbolPair.symbol1 === undefined || symbolPair.symbol2 === undefined ||
            symbolPair.symbol1 === "" || symbolPair.symbol2 === ""
        )
            return;

        setChartData(undefined);

        spreadDataFeed.reset(symbolPair.interval, symbolPair.symbol1, symbolPair.symbol2);
    }, [symbolPair]);

    return (
        <div className="grid grid-rows-12 grid-cols-1 w-full h-full">
            <div className="flex flex-col w-full h-full justify-center row-span-1">
                <div className="text-center">
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">T-Statistic: </span>
                        { chartData && chartData.statistics &&
                            <span className="text-teal-500">{chartData.statistics.tstat.toFixed(4)}</span>
                        }
                        { !chartData &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                    </span>
                    <span className="px-3">-</span>
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">Lag: </span>
                        { chartData && chartData.statistics &&
                            <span className="text-teal-500">{chartData.statistics.usedLag.toFixed(4)}</span>
                        }
                        { !chartData &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                    </span>
                    <span className="px-3">-</span>
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">Half Life: </span>
                        { chartData && chartData.statistics &&
                            <span className="text-teal-500">{chartData.statistics.halfLife.toFixed(4)}</span>
                        }
                        { !chartData &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                    </span>
                    <span className="px-3">-</span>
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">Hedge Ratio: </span>
                        { chartData && chartData.statistics &&
                            <span className="text-teal-500">{chartData.statistics.hedgeRatio.toFixed(4)}</span>
                        }
                        { !chartData &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                    </span>
                </div>
            </div>
            <div className="row-span-11">
                { chartData &&
                    <Chart
                        timeScale={{
                            timeVisible: true,
                        }}

                        layout={{
                            background: { color: colors.zinc[900] },
                            textColor: colors.zinc[100],
                        }}

                        grid={{
                            vertLines: { color: colors.zinc[700] },
                            horzLines: { color: colors.zinc[700] },
                        }}

                        watermark={{
                            text: `${symbolPair.symbol1}-${symbolPair.symbol2}`,
                            color: colors.zinc[700],
                            visible: true,
                        }}
                    >
                        <LineSeries
                            ref={props.residualsLineSeriesRef}
                            data={chartData?.initialResidualData}
                            color={colors.sky[500]}
                            lineWidth={1}
                        >
                            <ChartTrading />
                        </LineSeries>
                    </Chart>
                }
                { !chartData &&
                    <div className="w-full h-full bg-zinc-900 animate-pulse">
                    </div>
                }
            </div>
        </div>
    );
}