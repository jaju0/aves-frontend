import { OrderEventData, PositionEventData, WebsocketEvent } from "../../../WSDataFeed";
import { ChartObject } from "./ChartObject";
export interface ChartOrder
{
    data: OrderEventData;
    entryCloseObject: ChartObject;
    entryMoveObject: ChartObject;
    takeProfitCloseObject?: ChartObject;
    takeProfitMoveObject?: ChartObject;
    stopLossCloseObject?: ChartObject;
    stopLossMoveObject?: ChartObject;
    amendedSymbol1EntryPrice?: number;
    amendedSymbol2EntryPrice?: number;
    amendedTakeProfit?: number;
    amendedStopLoss?: number;
    focused: boolean;
}
