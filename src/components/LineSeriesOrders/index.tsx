import { useContext, useLayoutEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LineSeriesContext } from "../Series";
import { ChartContainerContext } from "../Chart/ChartContainer";
import { SpreadDataFeedContext, WSDataFeedContext } from "../SpreadChartWithControl";
import { OrderData, orderAmendmentMutation, orderCancelationMutation, orderListQuery } from "../../queries";
import { ChartOrder, ChartOrderType } from "../../lwcharts/plugins/ChartOrder";

export function LineSeriesOrders()
{
    const queryClient = useQueryClient();
    const spreadDataFeed = useContext(SpreadDataFeedContext);
    const wsDataFeed = useContext(WSDataFeedContext);
    const chart = useContext(ChartContainerContext);
    const lineSeries = useContext(LineSeriesContext);

    const chartOrders = useMemo(() => new Map<string, [OrderData, ChartOrder]>(), []);

    const createChartOrderIfNotExists = (orderData: OrderData) => {
        if(chartOrders.has(orderData.id))
            return false;

        let orderType: ChartOrderType;
        if(orderData.type === "Limit")
            orderType = "Limit";
        else if(orderData.type === "Stop")
            orderType = "Stop";
        else
            return false;

        const chartOrder = new ChartOrder(
            orderData.entryResidual ? +orderData.entryResidual : 0,
            orderData.quoteQty ? +orderData.quoteQty : 0,
            orderType,
            orderData.side,
            chart.api(),
            lineSeries.api()
        );

        chartOrder.on("price", price => {
            const latestSymbol2Price = spreadDataFeed.getLatestPriceOfSymbol2();
            if(latestSymbol2Price === undefined)
                return;

            const statistics = spreadDataFeed.getStatistics();
            if(statistics === undefined)
                return;

            const orderSlope = +orderData.regressionSlope;
            const priceWithoutError = price - orderSlope * latestSymbol2Price + statistics.hedgeRatio * latestSymbol2Price;
            orderAmendmentMutation.mutationFn({
                orderId: orderData.id,
                entryResidual: priceWithoutError,
            });
        });

        chartOrder.on("close", () => {
            orderCancelationMutation.mutationFn({
                orderId: orderData.id,
            });
        });

        chartOrders.set(orderData.id, [orderData, chartOrder]);
        lineSeries.api().attachPrimitive(chartOrder);

        return true;
    }

    const updatePriceOfOrder = ([orderData, chartOrder]: [OrderData, ChartOrder]) => {
        if(orderData.entryResidual === undefined)
            return;

        const statistics = spreadDataFeed.getStatistics();
        if(statistics === undefined)
            return;

        const symbol2LatestPrice = spreadDataFeed.getLatestPriceOfSymbol2();
        if(symbol2LatestPrice === undefined)
            return;

        const orderSlope = +orderData.regressionSlope;
        const orderEntry = +orderData.entryResidual;
        const errorAdjustedPrice = orderSlope * symbol2LatestPrice + orderEntry - statistics.hedgeRatio * symbol2LatestPrice;
        chartOrder.setPrice(errorAdjustedPrice);
    }

    useLayoutEffect(() => {
        spreadDataFeed.on("update", () => {
            chartOrders.forEach(([orderData, chartOrder]: [OrderData, ChartOrder]) => {
                updatePriceOfOrder([orderData, chartOrder]);
            });
        });

        wsDataFeed.on("order", event => {
            console.log(event);
            createChartOrderIfNotExists(event.data);

            const order = chartOrders.get(event.data.id);
            if(order === undefined)
                return;

            const chartOrder = order[1];

            if(event.data.status === "Executed" || event.data.status === "Failed")
            {
                chartOrder.removeAllListeners();
                lineSeries.api().detachPrimitive(chartOrder);
                chartOrders.delete(event.data.id);
                return;
            }

            chartOrders.set(event.data.id, [event.data, chartOrder]);
            updatePriceOfOrder([event.data, chartOrder]);
        });

        queryClient.fetchQuery(orderListQuery).then(orders => {
            orders?.forEach(order => {
                createChartOrderIfNotExists(order);
            });
        });

        return () => {
            chartOrders.forEach((value) => {
                const chartOrder = value[1];
                chartOrder.removeAllListeners();
                lineSeries.api().detachPrimitive(chartOrder);
            });

            chartOrders.clear();
        }
    }, []);

    return (
        <></>
    );
}