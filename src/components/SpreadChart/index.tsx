import { useContext, useEffect, useState } from "react";
import colors from "tailwindcss/colors";
import { DeepPartial, ISeriesApi, PriceFormat } from "lightweight-charts";
import { ChartDataContext, InstrumentsInfoContext, SpreadDataFeedContext, SymbolPairContext } from "../../pages/ChartPage";
import { Chart } from "../Chart";
import { LineSeries } from "../Series";
import { ChartTrading } from "../ChartTrading";
import eagleSweetIcon from "../../assets/images/eagle-sweet.png";

export interface SpreadChartProps
{
    residualsLineSeriesRef: React.RefObject<ISeriesApi<"Line">>;
}

export function SpreadChart(props: SpreadChartProps)
{
    const [symbolPair] = useContext(SymbolPairContext);
    const [instrumentsInfoQuery, instrumentsInfo] = useContext(InstrumentsInfoContext);
    const [chartData, setChartData] = useContext(ChartDataContext);
    const [priceFormat, setPriceFormat] = useState<DeepPartial<PriceFormat> | undefined>();
    const spreadDataFeed = useContext(SpreadDataFeedContext);

    instrumentsInfoQuery; // ignore unused

    useEffect(() => {
        if(!symbolPair.isValid)
            return;

        setChartData(undefined);

        spreadDataFeed?.reset(symbolPair.interval, symbolPair.symbol1, symbolPair.symbol2);
    }, [symbolPair]);

    useEffect(() => {
        const instInfo = instrumentsInfo.get(symbolPair.symbol1);
        if(!instInfo)
            return;

        let precision: number | undefined;
        {
            const priceParts = instInfo.priceFilter.tickSize.split(".");
            if(priceParts.length < 2)
                precision = undefined;

            precision = priceParts[1].length;
        }

        const newPriceFormat: DeepPartial<PriceFormat> = {
            type: "price",
            precision,
            minMove: +instInfo.priceFilter.tickSize,
        };

        const lineSeries = props.residualsLineSeriesRef.current;
        lineSeries?.applyOptions({ priceFormat: newPriceFormat });
        setPriceFormat(newPriceFormat);
    }, [instrumentsInfo, symbolPair]);

    return (
        <div className="grid grid-rows-12 grid-cols-1 w-full h-full">
            <div className="flex flex-col w-full h-full justify-center row-span-1">
                <div className="text-center">
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">T-Statistic: </span>
                        { chartData && chartData.statistics && symbolPair.isValid &&
                            <span className="text-teal-500">{chartData.statistics.tstat.toFixed(4)}</span>
                        }
                        { !chartData && symbolPair.isValid &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                        { !symbolPair.isValid &&
                            <span className="inline-block text-teal-500">-</span>
                        }
                    </span>
                    <span className="px-3">-</span>
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">Lag: </span>
                        { chartData && chartData.statistics && symbolPair.isValid &&
                            <span className="text-teal-500">{chartData.statistics.usedLag.toFixed(4)}</span>
                        }
                        { !chartData && symbolPair.isValid &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                        { !symbolPair.isValid &&
                            <span className="inline-block text-teal-500">-</span>
                        }
                    </span>
                    <span className="px-3">-</span>
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">Half Life: </span>
                        { chartData && chartData.statistics && symbolPair.isValid &&
                            <span className="text-teal-500">{chartData.statistics.halfLife.toFixed(4)}</span>
                        }
                        { !chartData && symbolPair.isValid &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                        { !symbolPair.isValid &&
                            <span className="inline-block text-teal-500">-</span>
                        }
                    </span>
                    <span className="px-3">-</span>
                    <span className="px-3 bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-yellow-500">Hedge Ratio: </span>
                        { chartData && chartData.statistics && symbolPair.isValid &&
                            <span className="text-teal-500">{chartData.statistics.hedgeRatio.toFixed(4)}</span>
                        }
                        { !chartData && symbolPair.isValid &&
                            <span className="inline-block bg-gray-400 text-gray-400 rounded-full animate-pulse">0.0000</span>
                        }
                        { !symbolPair.isValid &&
                            <span className="inline-block text-teal-500">-</span>
                        }
                    </span>
                </div>
            </div>
            <div className="row-span-11">
                { chartData && symbolPair.isValid &&
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
                            priceFormat={priceFormat}
                        >
                            <ChartTrading />
                        </LineSeries>
                    </Chart>
                }
                { !chartData && symbolPair.isValid &&
                    <div className="w-full h-full bg-zinc-900 animate-pulse">
                    </div>
                }
                { !symbolPair.isValid &&
                    <div className="flex flex-col justify-center w-full h-full text-center border-2 border-zinc-800">
                        <div className="w-32 mx-auto p-3 bg-zinc-800 rounded-full">
                            <img className="w-full" alt="eagle-sweet" src={eagleSweetIcon} />
                        </div>
                        <p className="my-2 px-4 py-2 font-semibold text-md">
                            <span className="bg-zinc-800 px-4 py-2 text-white rounded-full">No valid symbols selected.</span>
                        </p>
                    </div>
                }
            </div>
        </div>
    );
}