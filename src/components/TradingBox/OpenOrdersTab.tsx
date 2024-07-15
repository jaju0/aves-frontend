import { useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Scrollbars from "react-custom-scrollbars-2";
import colors from "tailwindcss/colors";
import { OrderData } from "../../provider/QueriesWithAuthProvider/datatypes";
import { useQueryFunctionsWithAuth } from "../../hooks/useQueryFunctionsWithAuth";
import { WSDataFeedContext } from "../../pages/ChartPage";
import { OrderEventData, WebsocketEvent } from "../../WSDataFeed";
import { CircleSpinner } from "../CircleSpinner";
import { CancelOrderForm } from "./CancelOrderForm";
import { AddOrderStopLossForm } from "./AddOrderStopLossForm";
import { AddOrderTakeProfitForm } from "./AddOrderTakeProfitForm";

export function OpenOrdersTab()
{
    const queryClient = useQueryClient();
    const queryFunctionsWithAuth = useQueryFunctionsWithAuth();
    const wsDataFeed = useContext(WSDataFeedContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ordersMap, setOrdersMap] = useState<Map<string, OrderData>>(new Map());

    useEffect(() => {
        const orderListener = (ev: WebsocketEvent<OrderEventData>) => {
            if(ev.topic !== "order")
                return;

            if(ev.data.status !== "Executed" && ev.data.status !== "Failed")
            {
                setOrdersMap(last => new Map([
                    ...Array.from(last.entries()),
                    [ev.data.id, ev.data],
                ]));
            }
            else
            {
                setOrdersMap(last => new Map([
                    ...Array.from(last.entries()).filter(entry => entry[0] !== ev.data.id),
                ]));
            }
        }

        wsDataFeed?.on("order", orderListener);

        setIsLoading(true);
        queryClient.fetchQuery(queryFunctionsWithAuth.orderListQuery).then(data => {
            if(data)
            {
                const openOrdersData = data.filter(entry => entry.status !== "Executed" && entry.status !== "Failed");

                setOrdersMap(last => new Map([
                    ...Array.from(last.entries()),
                    ...(openOrdersData.map(entry => [entry.id, entry]) as [string, OrderData][]),
                ]));
            }

            setIsLoading(false);
        }).catch(() => setIsLoading(false));

        return () => {
            wsDataFeed?.off("order", orderListener);
        };
    }, [wsDataFeed]);

    if(isLoading)
    {
        return (
            <div className="flex flex-col justify-center w-full h-[200px]">
                <CircleSpinner className="mx-auto" width="4em" height="4em" />
            </div>
        );
    }

    if(!ordersMap.size)
    {
        return (
            <div className="w-full py-4 text-center">
                <span className="font-semibold text-xl">No orders yet.</span>
            </div>
        );
    }

    return (
        <Scrollbars
            autoHeight
            autoHide
            className="w-full"
            renderThumbHorizontal={({style, className, ...props}) => (
                <div {...props} className={`${className} rounded-full`} style={{...style, backgroundColor: colors.zinc[400]}}></div>
            )}
        >
            <table className="w-auto text-left whitespace-nowrap border-separate border-spacing-x-4 border-spacing-y-2">
                <thead>
                    <tr>
                        <th>Symbol 1</th>
                        <th>Symbol 2</th>
                        <th>Type</th>
                        <th>Side</th>
                        <th>Status</th>
                        <th>Stop Loss</th>
                        <th>Take Profit</th>
                        <th>Quantity</th>
                        <th>est. Entry Price (Symbol 1)</th>
                        <th>est. Entry Price (Symbol 2)</th>
                        <th>Hedge Ratio</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { Array.from(ordersMap.entries()).map(([orderId, data]) => (
                        <tr key={orderId}>
                            <td>{data.symbol1}</td>
                            <td>{data.symbol2}</td>
                            <td>{data.type}</td>
                            <td>
                                <span className={data.side === "Buy" ? "text-green-400" : "text-red-400"}>
                                    {data.side}
                                </span>
                            </td>
                            <td>{data.status}</td>
                            <td>{data.stopLoss !== undefined ? (+data.stopLoss).toPrecision(4) : <AddOrderStopLossForm orderId={data.id} />}</td>
                            <td>{data.takeProfit !== undefined ? (+data.takeProfit).toPrecision(4) : <AddOrderTakeProfitForm orderId={data.id} />}</td>
                            <td>{data.quoteQty ?? `${data.symbol1BaseQty} ${data.symbol2BaseQty}`}</td>
                            <td>{data.symbol1EntryPrice ? (+data.symbol1EntryPrice).toPrecision(4) : ""}</td>
                            <td>{data.symbol2EntryPrice ? (+data.symbol2EntryPrice).toPrecision(4) : ""}</td>
                            <td>{(+data.regressionSlope).toPrecision(4)}</td>
                            <td><CancelOrderForm orderId={data.id} /></td>
                        </tr>
                    )) }
                </tbody>
            </table>
        </Scrollbars>
    );
}