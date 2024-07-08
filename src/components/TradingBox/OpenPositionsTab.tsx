import { useContext, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import colors from "tailwindcss/colors";
import { PositionData, positionListQuery } from "../../queries";
import { CircleSpinner } from "../CircleSpinner";
import { WSDataFeedContext } from "../../pages/ChartPage";
import { PositionEventData, WebsocketEvent } from "../../WSDataFeed";
import { AddPositionTakeProfitForm } from "./AddPositionTakeProfitForm";
import { AddPositionStopLossForm } from "./AddPositionStopLossForm";
import { LiquidationForm } from "./LiquidationForm";

export function OpenPositionsTab()
{
    const wsDataFeed = useContext(WSDataFeedContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [positionsMap, setPositionsMap] = useState<Map<string, PositionData>>(new Map());

    useEffect(() => {
        if(!wsDataFeed)
            return;

        const positionListener = (ev: WebsocketEvent<PositionEventData>) => {
            if(ev.topic !== "position")
                return;

            if(ev.data.open)
                setPositionsMap(new Map(positionsMap).set(ev.data.id, ev.data));
            else
            {
                const newPositionsMap = new Map(positionsMap);
                newPositionsMap.delete(ev.data.id);
                setPositionsMap(newPositionsMap);
            }
        }

        wsDataFeed.on("position", positionListener);

        setIsLoading(true);
        positionListQuery.queryFn().then(data => {
            if(data)
            {
                const newEntries = data.map(val => [val.id, val]) as [string, PositionData][];
                const existingEntries = Array.from(positionsMap);
                setPositionsMap(new Map([...existingEntries, ...newEntries]));
            }

            setIsLoading(false);
        }).catch(() => setIsLoading(false));

        return () => {
            wsDataFeed.off("position", positionListener);
        }
    }, [wsDataFeed]);

    if(isLoading)
    {
        return (
            <div className="flex flex-col justify-center w-full h-[200px]">
                <CircleSpinner className="mx-auto" width="4em" height="4em" />
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
                        <th>symbol 1</th>
                        <th>symbol 2</th>
                        <th>Side</th>
                        <th>last PnL</th>
                        <th>Take Profit</th>
                        <th>Stop Loss</th>
                        <th>Base Qty (symbol 1)</th>
                        <th>Base Qty (symbol 2)</th>
                        <th>Entry Price (symbol 1)</th>
                        <th>Entry Price (symbol 2)</th>
                        <th>Hedge Ratio</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { Array.from(positionsMap.entries()).map(([positionId, data]) => (
                        <tr key={positionId}>
                            <td>{data.symbol1}</td>
                            <td>{data.symbol2}</td>
                            <td>
                                <span className={data.side === "Long" ? "text-green-400" : "text-red-400"}>
                                    {data.side === "Long" ? "LONG" : "SHORT"}
                                </span>
                            </td>
                            <td>
                                <span className={(+data.lastPnl) < 0 ? "text-red-400" : "text-green-400"}>
                                    {data.lastPnl}
                                </span>
                            </td>
                            <td>
                                { data.takeProfit !== undefined ? (+data.takeProfit).toPrecision(4) : <AddPositionTakeProfitForm symbol1={data.symbol1} symbol2={data.symbol2} /> }
                            </td>
                            <td>
                                { data.stopLoss !== undefined ? (+data.stopLoss).toPrecision(4) : <AddPositionStopLossForm symbol1={data.symbol1} symbol2={data.symbol2} /> }
                            </td>
                            <td>{data.symbol1BaseQty}</td>
                            <td>{data.symbol2BaseQty}</td>
                            <td>{data.symbol1EntryPrice}</td>
                            <td>{data.symbol2EntryPrice}</td>
                            <td>{(+data.regressionSlope).toPrecision(4)}</td>
                            <td><LiquidationForm symbol1={data.symbol1} symbol2={data.symbol2} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Scrollbars>
    );
}