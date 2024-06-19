import { useQueryClient } from "@tanstack/react-query";
import { useContext, useLayoutEffect, useMemo } from "react";
import { ChartPosition } from "../../lwcharts/plugins/ChartPosition";
import { SpreadDataFeedContext, WSDataFeedContext } from "../SpreadChartWithControl";
import { ChartContainerContext } from "../Chart/ChartContainer";
import { LineSeriesContext } from "../Series";
import { PositionData, positionLiquidationMutation, positionListQuery } from "../../queries";

export function LineSeriesPositions()
{
    const queryClient = useQueryClient();
    const spreadDataFeed = useContext(SpreadDataFeedContext);
    const wsDataFeed = useContext(WSDataFeedContext);
    const chart = useContext(ChartContainerContext);
    const lineSeries = useContext(LineSeriesContext);

    const chartPositions = useMemo(() => new Map<string, [PositionData, ChartPosition]>(), []);

    const createChartPositionIfNotExists = (positionData: PositionData) => {
        if(chartPositions.has(positionData.id))
            return false;

        if(!positionData.open || positionData.side === "None")
            return false;

        const statistics = spreadDataFeed.getStatistics();
        if(statistics === undefined)
            return false;

        const symbol1EntryPrice = +positionData.symbol1EntryPrice;
        const symbol2EntryPrice = +positionData.symbol2EntryPrice;
        const entryResidual = symbol1EntryPrice - statistics.hedgeRatio * symbol2EntryPrice;

        console.log("lastPnl: ", positionData.lastPnl);
        const chartPosition = new ChartPosition(
            entryResidual,
            positionData.lastPnl === undefined ? 0 : +positionData.lastPnl,
            positionData.side === "Long" ? "Buy" : "Sell",
            chart.api(),
            lineSeries.api()
        );

        chartPosition.on("close", () => {
            positionLiquidationMutation.mutationFn({
                symbol1: positionData.symbol1,
                symbol2: positionData.symbol2,
            });
        });

        chartPositions.set(positionData.id, [positionData, chartPosition]);
        lineSeries.api().attachPrimitive(chartPosition);
        console.log("entry residual: ", entryResidual);
        console.log("chart position attached");

        return true;
    };

    useLayoutEffect(() => {
        wsDataFeed.on("position", event => {
            console.log(event);
            createChartPositionIfNotExists(event.data);

            const position = chartPositions.get(event.data.id);
            if(position === undefined)
                return;

            const chartPosition = position[1];
            chartPosition.Pnl = event.data.lastPnl === undefined ? 0 : +event.data.lastPnl;

            if(!event.data.open)
            {
                chartPosition.removeAllListeners();
                lineSeries.api().detachPrimitive(chartPosition);
                chartPositions.delete(event.data.id);
                return;
            }

            chartPositions.set(event.data.id, [event.data, chartPosition]);
        });

        queryClient.fetchQuery(positionListQuery).then(positions => {
            positions?.forEach(position => {
                createChartPositionIfNotExists(position);
            });
        });

        return () => {
            chartPositions.forEach(value => {
                const chartPosition = value[1];
                chartPosition.removeAllListeners();
                lineSeries.api().detachPrimitive(chartPosition);
            });

            chartPositions.clear();
        }
    }, []);

    return (
        <></>
    );
}