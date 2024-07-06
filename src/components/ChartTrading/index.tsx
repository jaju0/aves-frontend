import { ReactNode, createContext, forwardRef, useContext, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CancelOrderEvent, ChangeOrderEvent, ChangePositionEvent, ChartTradingPrimitive, LiquidatePositionEvent } from "../../lwcharts/plugins/ChartTradingPrimitive";
import { ChartContainerContext } from "../Chart/ChartContainer";
import { LineSeriesContext } from "../Series";
import { SpreadDataFeedContext, WSDataFeedContext } from "../../pages/ChartPage";
import { OrderEventData, PositionEventData, WebsocketEvent } from "../../WSDataFeed";
import { orderAmendmentMutation, orderCancelationMutation, orderListQuery, positionAmendmentMutation, positionLiquidationMutation, positionListQuery } from "../../queries";

export interface ChartTradingContextRef
{
    _api?: ChartTradingPrimitive;
    api(): ChartTradingPrimitive;
    free(): void;
}

export const ChartTradingContext = createContext<ChartTradingContextRef>({} as ChartTradingContextRef);

export interface ChartTradingProps
{
    children?: ReactNode;
}

export const ChartTrading = forwardRef<ChartTradingPrimitive, ChartTradingProps>((props, ref) =>
{
    const { children } = props;
    const queryClient = useQueryClient();
    const chart = useContext(ChartContainerContext);
    const parent = useContext(LineSeriesContext);
    const wsDataFeed = useContext(WSDataFeedContext);
    const spreadDataFeed = useContext(SpreadDataFeedContext);
    const liquidatePositionMutation = useMutation(positionLiquidationMutation);
    const amendPositionMutation = useMutation(positionAmendmentMutation);
    const cancelOrderMutation = useMutation(orderCancelationMutation);
    const amendOrderMutation = useMutation(orderAmendmentMutation);

    const context = useRef<ChartTradingContextRef>({
        api() {
            if(!this._api)
            {
                this._api = new ChartTradingPrimitive(spreadDataFeed, chart.api(), parent.api());
                parent.api().attachPrimitive(this._api);
            }

            return this._api;
        },
        free() {
            if(this._api && parent._api)
            {
                parent._api.detachPrimitive(this._api);
                this._api = undefined;
            }
        }
    });

    useLayoutEffect(() => {
        const currentRef = context.current;

        const changePositionListener = (event: ChangePositionEvent) => {
            amendPositionMutation.mutateAsync({
                symbol1: event.symbol1,
                symbol2: event.symbol2,
                takeProfit: event.takeProfit === null ? null : event.takeProfit?.toString(),
                stopLoss: event.stopLoss === null ? null : event.stopLoss?.toString(),
            });
        }

        const liquidatePositionListener = (event: LiquidatePositionEvent) => {
            liquidatePositionMutation.mutateAsync(event);
        }

        const changeOrderListener = (event: ChangeOrderEvent) => {
            amendOrderMutation.mutateAsync(event);
        }

        const cancelOrderListener = (event: CancelOrderEvent) => {
            cancelOrderMutation.mutateAsync(event);
        }

        const updateSeries = (event: WebsocketEvent<unknown>) => {
            const lastDataPoint = parent.api().data().at(parent.api().data.length-1);
            if(lastDataPoint === undefined)
                return;

            parent.api().update({
                ...lastDataPoint,
                customValues: {
                    tradingEvent: event,
                }
            });
        };

        const orderListener = (event: WebsocketEvent<OrderEventData>) => {
            updateSeries(event);
        }

        const positionListener = (event: WebsocketEvent<PositionEventData>) => {
            updateSeries(event);
        }

        currentRef.api().on("change-position", changePositionListener);
        currentRef.api().on("liquidate-position", liquidatePositionListener);
        currentRef.api().on("change-order", changeOrderListener);
        currentRef.api().on("cancel-order", cancelOrderListener);

        wsDataFeed.on("order", orderListener);
        wsDataFeed.on("position", positionListener);

        queryClient.fetchQuery(orderListQuery).then(orders => {
            orders?.forEach(order => {
                updateSeries({
                    topic: "order",
                    data: order,
                });
            });
        });

        queryClient.fetchQuery(positionListQuery).then(positions => {
            positions?.forEach(position => {
                updateSeries({
                    topic: "position",
                    data: position,
                });
            });
        });

        return () => {
            currentRef.api().off("change-position", changePositionListener);
            currentRef.api().off("liquidate-position", liquidatePositionListener);
            currentRef.api().off("change-order", changeOrderListener);
            currentRef.api().off("cancel-order", cancelOrderListener);
            wsDataFeed.off("order", orderListener);
            wsDataFeed.off("position", positionListener);
            currentRef.free();
        };
    }, []);

    useImperativeHandle(ref, () => context.current.api(), []);

    return (
        <ChartTradingContext.Provider value={context.current}>
            {children}
        </ChartTradingContext.Provider>
    );
});