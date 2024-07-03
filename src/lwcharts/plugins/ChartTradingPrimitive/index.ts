import EventEmitter from "events";
import { IChartApi, ISeriesApi, ISeriesPrimitive, ISeriesPrimitivePaneView, MouseEventParams, PrimitiveHoveredItem, SeriesAttachedParameter, SeriesOptionsMap, Time } from "lightweight-charts";
import { OrderEventData, PositionEventData, WebsocketEvent } from "../../../WSDataFeed";
import { OrderPaneView } from "./OrderPaneView";
import { PositionPaneView } from "./PositionPaneView";
import { ChartMouse } from "./ChartMouse";
import { ChartObject } from "./ChartObject";
import { SpreadDataFeed } from "../../../SpreadDataFeed";

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

export interface ChartPosition
{
    data: PositionEventData;
    closeObject: ChartObject;
    takeProfitCloseObject?: ChartObject;
    takeProfitMoveObject?: ChartObject;
    stopLossCloseObject?: ChartObject;
    stopLossMoveObject?: ChartObject;
    amendedTakeProfit?: number;
    amendedStopLoss?: number;
    focused: boolean;
}

export interface CancelOrderEvent
{
    orderId: string;
}

export interface ChangeOrderEvent
{
    orderId: string;
    symbol1EntryPrice?: number;
    symbol2EntryPrice?: number;
    takeProfit?: number | null;
    stopLoss?: number | null;
}

export interface LiquidatePositionEvent
{
    symbol1: string;
    symbol2: string;
}

export interface ChangePositionEvent
{
    symbol1: string;
    symbol2: string;
    takeProfit?: number | null;
    stopLoss?: number | null;
}

export class ChartTradingPrimitive extends EventEmitter<{
    "cancel-order": [CancelOrderEvent],
    "change-order": [ChangeOrderEvent],
    "liquidate-position": [LiquidatePositionEvent],
    "change-position": [ChangePositionEvent],
}> implements ISeriesPrimitive
{
    private spreadDataFeed: SpreadDataFeed;

    private chart: IChartApi;
    private series: ISeriesApi<keyof SeriesOptionsMap>;

    private chartMouse: ChartMouse;

    private orders: Map<string, ChartOrder>;
    private positions: Map<string, ChartPosition>;
    private chartObjects: Map<string, ChartObject>;

    private focusedChartElement?: ChartOrder | ChartPosition;

    private orderPaneView: OrderPaneView;
    private positionPaneView: PositionPaneView;

    constructor(spreadDataFeed: SpreadDataFeed, chart: IChartApi, series: ISeriesApi<keyof SeriesOptionsMap>)
    {
        super();
        this.spreadDataFeed = spreadDataFeed;

        this.chart = chart;
        this.series = series;

        this.chartMouse = new ChartMouse(this.chart);

        this.orders = new Map();
        this.positions = new Map();

        this.chartObjects = new Map();

        this.orderPaneView = new OrderPaneView({
            series: this.series,
            orders: this.orders,
            infoShieldMarginLeft: 30,
        });

        this.positionPaneView = new PositionPaneView({
            spreadDataFeed,
            series: this.series,
            positions: this.positions,
            infoShieldMarginLeft: 30,
        });
    }

    public updateAllViews()
    {
        const latestDataPoint = this.series.data().at(this.series.data().length-1);
        if(latestDataPoint === undefined)
            return;

        const tradingEvent = latestDataPoint.customValues?.tradingEvent as (WebsocketEvent<unknown> | undefined);
        if(tradingEvent === undefined)
            return;

        if(tradingEvent.topic === "order")
        {
            const data = tradingEvent.data as OrderEventData;
            const orderId = data.id;

            if(data.type === "Market")
                return;

            if(data.status === "Failed" || data.status === "Executed")
            {
                this.orders.delete(orderId);
                return;
            }

            const entryCloseObject = new ChartObject("order", orderId, "close");
            const entryMoveObject = new ChartObject("order", orderId, "move");
            let tpCloseObject: ChartObject | undefined = undefined;
            let tpMoveObject: ChartObject | undefined = undefined;
            let slCloseObject: ChartObject | undefined = undefined;
            let slMoveObject: ChartObject | undefined = undefined;

            this.chartObjects.set(entryCloseObject.Id, entryCloseObject);
            this.chartObjects.set(entryMoveObject.Id, entryMoveObject);

            if(data.takeProfit !== undefined)
            {
                tpCloseObject = new ChartObject("order", orderId, "tp-close");
                tpMoveObject = new ChartObject("order", orderId, "tp-move");

                this.chartObjects.set(tpCloseObject.Id, tpCloseObject);
                this.chartObjects.set(tpMoveObject.Id, tpMoveObject);
            }

            if(data.stopLoss !== undefined)
            {
                slCloseObject = new ChartObject("order", orderId, "sl-close");
                slMoveObject = new ChartObject("order", orderId, "sl-move");

                this.chartObjects.set(slCloseObject.Id, slCloseObject);
                this.chartObjects.set(slMoveObject.Id, slMoveObject);
            }

            this.orders.set(orderId, {
                data,
                entryCloseObject: entryCloseObject,
                entryMoveObject: entryMoveObject,
                takeProfitCloseObject: tpCloseObject,
                takeProfitMoveObject: tpMoveObject,
                stopLossCloseObject: slCloseObject,
                stopLossMoveObject: slMoveObject,
                focused: false,
            });
        }
        else if(tradingEvent.topic === "position")
        {
            const data = tradingEvent.data as PositionEventData;
            const positionId = data.id;

            if(!data.open)
            {
                this.positions.delete(positionId);
                return;
            }

            const closeObject = new ChartObject("position", data.id, "close");
            let tpCloseObject: ChartObject | undefined = undefined;
            let tpMoveObject: ChartObject | undefined = undefined;
            let slCloseObject: ChartObject | undefined = undefined;
            let slMoveObject: ChartObject | undefined = undefined;

            this.chartObjects.set(closeObject.Id, closeObject);

            if(data.takeProfit)
            {
                tpCloseObject = new ChartObject("position", data.id, "tp-close");
                tpMoveObject = new ChartObject("position", data.id, "tp-move");

                this.chartObjects.set(tpCloseObject.Id, tpCloseObject);
                this.chartObjects.set(tpMoveObject.Id, tpMoveObject);
            }
            if(data.stopLoss)
            {
                slCloseObject = new ChartObject("position", data.id, "sl-close");
                slMoveObject = new ChartObject("position", data.id, "sl-move");

                this.chartObjects.set(slCloseObject.Id, slCloseObject);
                this.chartObjects.set(slMoveObject.Id, slMoveObject);
            }

            this.positions.set(positionId, {
                data,
                closeObject,
                takeProfitCloseObject: tpCloseObject,
                takeProfitMoveObject: tpMoveObject,
                stopLossCloseObject: slCloseObject,
                stopLossMoveObject: slMoveObject,
                focused: false,
            });
        }
    }

    /*
    public priceAxisViews(): readonly ISeriesPrimitiveAxisView[]
    {
        throw new Error("method not implemented");
    }

    public timeAxisViews(): readonly ISeriesPrimitiveAxisView[]
    {
        throw new Error("method not implemented");
    }
    */
    
    public paneViews(): readonly ISeriesPrimitivePaneView[]
    {
        return [
            this.orderPaneView,
            this.positionPaneView,
        ];
    }

    /*
    public priceAxisPaneViews(): readonly ISeriesPrimitivePaneView[]
    {
        throw new Error("method not implemented");
    }

    public timeAxisPaneViews(): readonly ISeriesPrimitivePaneView[]
    {
        throw new Error("method not implemented");
    }
    
    public autoscaleInfo(startTimePoint: Logical, endTimePoint: Logical): AutoscaleInfo | null
    {
        throw new Error("method not implemented");
    }
    */
    
    public attached(param: SeriesAttachedParameter<Time, keyof SeriesOptionsMap>)
    {
        param; // ignore unused
        this.chartMouse.attached();
        this.chart.subscribeClick(this.clickHandler.bind(this));
        this.chart.subscribeCrosshairMove(this.crosshairMoveHandler.bind(this));
        this.chartMouse.on("mouseup", this.mouseUpHandler.bind(this));
    }

    public detached()
    {
        this.chartMouse.detached();
        this.chart.unsubscribeClick(this.clickHandler.bind(this));
        this.chart.unsubscribeCrosshairMove(this.crosshairMoveHandler.bind(this));
        this.chartMouse.off("mouseup", this.mouseUpHandler.bind(this));
    }
    
    public hitTest(x: number, y: number): PrimitiveHoveredItem | null
    {
        for(const order of this.orders.values())
        {
            if(order.entryCloseObject.Rect.containsPoint(x, y))
                return { externalId: order.entryCloseObject.Id, zOrder: "normal", cursorStyle: "pointer" };
            else if(order.entryMoveObject.Rect.containsPoint(x, y))
                return { externalId: order.entryMoveObject.Id, zOrder: "normal", cursorStyle: "grab" };
            else if(order.takeProfitCloseObject?.Rect.containsPoint(x, y))
                return { externalId: order.takeProfitCloseObject.Id, zOrder: "normal", cursorStyle: "pointer" };
            else if(order.takeProfitMoveObject?.Rect.containsPoint(x, y))
                return { externalId: order.takeProfitMoveObject.Id, zOrder: "normal", cursorStyle: "grab" };
            else if(order.stopLossCloseObject?.Rect.containsPoint(x, y))
                return { externalId: order.stopLossCloseObject.Id, zOrder: "normal", cursorStyle: "pointer" };
            else if(order.stopLossMoveObject?.Rect.containsPoint(x, y))
                return { externalId: order.stopLossMoveObject.Id, zOrder: "normal", cursorStyle: "grab" };
        }

        for(const position of this.positions.values())
        {
            if(position.closeObject.Rect.containsPoint(x, y))
                return { externalId: position.closeObject.Id, zOrder: "normal", cursorStyle: "pointer" };
            else if(position.takeProfitCloseObject?.Rect.containsPoint(x, y))
                return { externalId: position.takeProfitCloseObject.Id, zOrder: "normal", cursorStyle: "pointer" };
            else if(position.takeProfitMoveObject?.Rect.containsPoint(x, y))
                return { externalId: position.takeProfitMoveObject.Id, zOrder: "normal", cursorStyle: "grab" };
            else if(position.stopLossCloseObject?.Rect.containsPoint(x, y))
                return { externalId: position.stopLossCloseObject.Id, zOrder: "normal", cursorStyle: "pointer" };
            else if(position.stopLossMoveObject?.Rect.containsPoint(x, y))
                return { externalId: position.stopLossMoveObject.Id, zOrder: "normal", cursorStyle: "grab" };
        }

        return null;
    }

    private clickHandler(params: MouseEventParams<Time>)
    {
        if(this.focusedChartElement)
        {
            this.focusedChartElement.focused = false;
            this.focusedChartElement = undefined;
        }

        if(params.hoveredObjectId === undefined)
            return;

        const chartObject = this.chartObjects.get(params.hoveredObjectId as string);
        if(chartObject === undefined)
            return;

        const chartOrder = this.orders.get(chartObject.OwnerId);
        if(chartOrder)
        {
            chartOrder.focused = true;
            this.focusedChartElement = chartOrder;
        }

        const chartPosition = this.positions.get(chartObject.OwnerId)
        if(chartPosition)
        {
            chartPosition.focused = true;
            this.focusedChartElement = chartPosition;
        }

        if(chartObject.OwnerType === "order" && chartObject.Type === "close")
        {
            this.emit("cancel-order", {
                orderId: chartObject.OwnerId,
            });
        }
        else if(chartObject.OwnerType === "order" && chartObject.Type === "tp-close")
        {
            this.emit("change-order", {
                orderId: chartObject.OwnerId,
                takeProfit: null,
            });
        }
        else if(chartObject.OwnerType === "order" && chartObject.Type === "sl-close")
        {
            this.emit("change-order", {
                orderId: chartObject.OwnerId,
                stopLoss: null,
            });
        }
        else if(chartObject.OwnerType === "position" && chartObject.Type === "close" && chartPosition)
        {
            this.emit("liquidate-position", {
                symbol1: chartPosition.data.symbol1,
                symbol2: chartPosition.data.symbol2,
            });
        }
        else if(chartObject.OwnerType === "position" && chartObject.Type === "tp-close" && chartPosition)
        {
            this.emit("change-position", {
                symbol1: chartPosition.data.symbol1,
                symbol2: chartPosition.data.symbol2,
                takeProfit: null,
            });
        }
        else if(chartObject.OwnerType === "position" && chartObject.Type === "sl-close" && chartPosition)
        {
            this.emit("change-position", {
                symbol1: chartPosition.data.symbol1,
                symbol2: chartPosition.data.symbol2,
                stopLoss: null,
            });
        }
    }

    private crosshairMoveHandler(params: MouseEventParams<Time>)
    {
        if(params.hoveredObjectId === undefined)
            return;

        const chartObject = this.chartObjects.get(params.hoveredObjectId as string);
        if(chartObject === undefined)
            return;

        if(this.chartMouse.IsMouseDown && params.point)
        {
            if(chartObject.OwnerType === "order" && chartObject.Type === "move")
            {
                const order = this.orders.get(chartObject.OwnerId);
                if(order === undefined)
                    return;

                const slope = +order.data.regressionSlope;
                const symbol2LatestPrice = this.spreadDataFeed.getLatestPriceOfSymbol2();
                const residual = this.series.coordinateToPrice(params.point.y);
                if(residual && symbol2LatestPrice)
                {
                    const symbol1Price = slope * symbol2LatestPrice + residual;
                    order.amendedSymbol1EntryPrice = symbol1Price;
                    order.amendedSymbol2EntryPrice = symbol2LatestPrice;
                }

                this.chart.applyOptions({
                    handleScroll: false,
                });

                return;
            }
            else if(chartObject.OwnerType === "order" && chartObject.Type === "tp-move")
            {
                const order = this.orders.get(chartObject.OwnerId);
                if(order === undefined)
                    return;

                if(!order.data.symbol1EntryPrice || !order.data.symbol2EntryPrice || !order.data.regressionSlope)
                    return;

                const symbol1EntryPrice = +order.data.symbol1EntryPrice;
                const symbol2EntryPrice = +order.data.symbol2EntryPrice;
                const slope = +order.data.regressionSlope;
                const residual = this.series.coordinateToPrice(params.point.y);
                const entryResidual = symbol1EntryPrice - slope * symbol2EntryPrice;

                if(residual)
                {
                    const newTakeProfit = residual - entryResidual;
                    order.amendedTakeProfit = newTakeProfit;
                }

                this.chart.applyOptions({
                    handleScroll: false,
                });
            }
            else if(chartObject.OwnerType === "order" && chartObject.Type === "sl-move")
            {
                const order = this.orders.get(chartObject.OwnerId);
                if(order === undefined)
                    return;

                if(!order.data.symbol1EntryPrice || !order.data.symbol2EntryPrice || !order.data.regressionSlope)
                    return;

                const symbol1EntryPrice = +order.data.symbol1EntryPrice;
                const symbol2EntryPrice = +order.data.symbol2EntryPrice;
                const slope = +order.data.regressionSlope;
                const residual = this.series.coordinateToPrice(params.point.y);
                const entryResidual = symbol1EntryPrice - slope * symbol2EntryPrice;

                if(residual)
                {
                    const newStopLoss = residual - entryResidual;
                    order.amendedStopLoss = newStopLoss;
                }

                this.chart.applyOptions({
                    handleScroll: false,
                });
            }
            else if(chartObject.OwnerType === "position" && chartObject.Type === "tp-move")
            {
                const position = this.positions.get(chartObject.OwnerId);
                if(position === undefined)
                    return;

                if(!position.data.symbol1EntryPrice || !position.data.symbol2EntryPrice || !position.data.regressionSlope)
                    return;

                const symbol1EntryPrice = +position.data.symbol1EntryPrice;
                const symbol2EntryPrice = +position.data.symbol2EntryPrice;
                const slope = +position.data.regressionSlope;
                const residual = this.series.coordinateToPrice(params.point.y);
                const entryResidual = symbol1EntryPrice - slope * symbol2EntryPrice;

                if(residual)
                {
                    const takeProfit = residual - entryResidual;
                    position.amendedTakeProfit = takeProfit;
                }

                this.chart.applyOptions({
                    handleScroll: false,
                });
            }
            else if(chartObject.OwnerType === "position" && chartObject.Type === "sl-move")
            {
                const position = this.positions.get(chartObject.OwnerId);
                if(position === undefined)
                    return;

                if(!position.data.symbol1EntryPrice || !position.data.symbol2EntryPrice || !position.data.regressionSlope)
                    return;

                const symbol1EntryPrice = +position.data.symbol1EntryPrice;
                const symbol2EntryPrice = +position.data.symbol2EntryPrice;
                const slope = +position.data.regressionSlope;
                const residual = this.series.coordinateToPrice(params.point.y);
                const entryResidual = symbol1EntryPrice - slope * symbol2EntryPrice; 

                if(residual)
                {
                    const stopLoss = residual - entryResidual;
                    position.amendedStopLoss = stopLoss;
                }

                this.chart.applyOptions({
                    handleScroll: false,
                });
            }
        }
    }

    private mouseUpHandler()
    {
        for(const order of this.orders.values())
        {
            if(
                order.data.symbol1EntryPrice && order.amendedSymbol1EntryPrice &&
                order.data.symbol2EntryPrice && order.amendedSymbol2EntryPrice &&
                (order.amendedSymbol2EntryPrice !== +order.data.symbol2EntryPrice || order.amendedSymbol1EntryPrice !== +order.data.symbol1EntryPrice)
            )
            {
                this.emit("change-order", { orderId: order.data.id, symbol1EntryPrice: order.amendedSymbol1EntryPrice, symbol2EntryPrice: order.amendedSymbol2EntryPrice });
                order.amendedSymbol1EntryPrice = undefined;
                order.amendedSymbol2EntryPrice = undefined;
            }
            else if(
                (order.data.takeProfit === undefined && order.amendedTakeProfit !== undefined) ||
                (order.amendedTakeProfit && order.data.takeProfit && order.amendedTakeProfit !== +order.data.takeProfit)
            ) {
                this.emit("change-order", { orderId: order.data.id, takeProfit: order.amendedTakeProfit });
                order.amendedTakeProfit = undefined;
            }
            else if(
                (order.data.stopLoss === undefined && order.amendedStopLoss !== undefined) ||
                (order.amendedStopLoss && order.data.stopLoss && order.amendedStopLoss !== +order.data.stopLoss)
            ) {
                this.emit("change-order", { orderId: order.data.id, stopLoss: order.amendedStopLoss });
                order.amendedStopLoss = undefined;
            }
        }

        for(const position of this.positions.values())
        {
            if(
                (position.data.takeProfit === undefined && position.amendedTakeProfit !== undefined) ||
                (position.amendedTakeProfit && position.data.takeProfit && position.amendedTakeProfit !== +position.data.takeProfit)
            ) {
                this.emit("change-position", { symbol1: position.data.symbol1, symbol2: position.data.symbol2, takeProfit: position.amendedTakeProfit });
                position.amendedTakeProfit = undefined;
            }
            else if(
                (position.data.stopLoss === undefined && position.amendedStopLoss !== undefined) ||
                (position.amendedStopLoss && position.data.stopLoss && position.amendedStopLoss !== +position.data.stopLoss)
            ) {
                this.emit("change-position", { symbol1: position.data.symbol1, symbol2: position.data.symbol2, stopLoss: position.amendedStopLoss });
                position.amendedStopLoss = undefined;
            }
        }
    }
}
