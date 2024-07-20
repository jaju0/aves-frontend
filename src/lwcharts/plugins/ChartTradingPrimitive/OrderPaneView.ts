import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope, Size } from "fancy-canvas";
import { ISeriesApi, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView, SeriesOptionsMap } from "lightweight-charts";
import colors from "tailwindcss/colors";
import { Rectangle } from "../../helpers/dimensions/common";
import { ChartOrder } from ".";
import { ChartObject } from "./ChartObject";
import { SpreadDataFeed } from "../../../SpreadDataFeed";

export const lineType = ["entry", "stop_loss", "take_profit"] as const;
export type LineType = typeof lineType[number];

export const chartOrderColors = {
    sell: colors.red[400],
    sellShade: "#44292c",
    buy: colors.blue[400],
    buyShade: "#1F252F",
    takeProfit: colors.green[400],
    takeProfitShade: "#223f2f",
    stopLoss: colors.amber[400],
    stopLossShade: "#45391c",
};

export interface OrderPaneViewParams
{
    spreadDataFeed: SpreadDataFeed;
    series: ISeriesApi<keyof SeriesOptionsMap>;
    orders: Map<string, ChartOrder>;
    infoShieldMarginLeft: number;
}

export function getOrderTypeText(lineType: LineType, order: ChartOrder)
{
    return lineType === "entry" ? 
        (order.data.type === "Limit" ? "LMT" : "STP") :
        (lineType === "take_profit" ? "TP" : "SL")
    ;
}

export function getOrderColor(lineType: LineType, order: ChartOrder)
{
    if(lineType === "entry")
        return order.data.side === "Buy" ? chartOrderColors.buy : chartOrderColors.sell;

    return lineType === "take_profit" ? chartOrderColors.takeProfit : chartOrderColors.stopLoss;
}

export function getOrderColorShade(lineType: LineType, order: ChartOrder)
{
    if(lineType === "entry")
        return order.data.side === "Buy" ? chartOrderColors.buyShade : chartOrderColors.sellShade;

    return lineType === "take_profit" ? chartOrderColors.takeProfitShade : chartOrderColors.stopLossShade;
}

export class OrderPaneRenderer implements ISeriesPrimitivePaneRenderer
{
    private params: OrderPaneViewParams;

    constructor(params: OrderPaneViewParams)
    {
        this.params = params;
    }

    private renderLine(ctx: CanvasRenderingContext2D, mediaSize: Size, lineType: LineType, order: ChartOrder, price: number, moveObject: ChartObject, closeObject: ChartObject)
    {
        const yCoord = this.params.series.priceToCoordinate(price);
        if(yCoord === null)
            return;

        ctx.font = "lighter 8pt Arial";

        const sizeText = order.data.quoteQty?.toString() ?? `${order.data.symbol1BaseQty} ${order.data.symbol2BaseQty}`;
        const typeText = getOrderTypeText(lineType, order);
        const color = getOrderColor(lineType, order);
        const colorShade = getOrderColorShade(lineType, order);

        const infoShieldPaddingX = 4;
        const infoShieldPaddingY = 6;

        const sizeTextMetrics = ctx.measureText(sizeText);
        const sizeTextHeight = sizeTextMetrics.actualBoundingBoxAscent - sizeTextMetrics.actualBoundingBoxDescent;
        const sizeTextPaddingX = 4;

        const typeTextMetrics = ctx.measureText(typeText);
        const typeTextHeight = typeTextMetrics.actualBoundingBoxAscent - typeTextMetrics.actualBoundingBoxDescent;
        const typeTextPaddingX = 4;

        const textHeight = Math.max(sizeTextHeight, typeTextHeight);

        const seperatorPaddingX = 4;
        const seperatorWidth = 1;

        const closeSymbolPaddingX = 4;

        const infoShieldRect = new Rectangle();
        infoShieldRect.width = 2 * infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + typeTextMetrics.width + 2 * typeTextPaddingX + 2 * seperatorWidth + 4 * seperatorPaddingX + textHeight + 2 * closeSymbolPaddingX;
        infoShieldRect.height = textHeight + 2 * infoShieldPaddingY;
        infoShieldRect.left = this.params.infoShieldMarginLeft;
        infoShieldRect.top = yCoord - 0.5 * infoShieldRect.height;

        Object.assign(moveObject.Rect, infoShieldRect);
        moveObject.Rect.width -= textHeight + 2 * closeSymbolPaddingX;

        Object.assign(closeObject.Rect, infoShieldRect);
        closeObject.Rect.width = textHeight + 2 * closeSymbolPaddingX;
        closeObject.Rect.left =  this.params.infoShieldMarginLeft + 2 * infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + typeTextMetrics.width + 2 * typeTextPaddingX + 2 * seperatorWidth + 4 * seperatorPaddingX;

        ctx.fillStyle = colors.zinc[900];

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if(lineType === "take_profit" || lineType === "stop_loss")
            ctx.setLineDash([4, 2]);
        ctx.moveTo(0, yCoord);
        ctx.lineTo(mediaSize.width, yCoord);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = color;
        ctx.fillStyle = colors.zinc[900];
        ctx.lineWidth = 1;
        ctx.beginPath();
        if(lineType === "take_profit" || lineType === "stop_loss")
            ctx.setLineDash([4, 2]);
        ctx.roundRect(infoShieldRect.left, infoShieldRect.top, infoShieldRect.width, infoShieldRect.height, 4),
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fillText(sizeText, infoShieldRect.left + infoShieldPaddingX + sizeTextPaddingX, infoShieldRect.top + textHeight + infoShieldPaddingY);

        ctx.strokeStyle = colorShade;
        ctx.lineWidth = seperatorWidth;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + seperatorPaddingX, infoShieldRect.top + 1);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + seperatorPaddingX, infoShieldRect.top + infoShieldRect.height - 1);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fillText(typeText, infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + typeTextPaddingX, infoShieldRect.top + textHeight + infoShieldPaddingY);

        ctx.strokeStyle = colorShade;
        ctx.lineWidth = seperatorWidth;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + 2 * typeTextPaddingX + typeTextMetrics.width + seperatorPaddingX, infoShieldRect.top + 1);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + 2 * typeTextPaddingX + typeTextMetrics.width + seperatorPaddingX, infoShieldRect.top + infoShieldRect.height - 1);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + 2 * typeTextPaddingX + typeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX, infoShieldRect.top + infoShieldPaddingY);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + 2 * typeTextPaddingX + typeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX + textHeight, infoShieldRect.top + textHeight + infoShieldPaddingY);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + 2 * typeTextPaddingX + typeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX, infoShieldRect.top + textHeight + infoShieldPaddingY);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + 2 * sizeTextPaddingX + sizeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + 2 * typeTextPaddingX + typeTextMetrics.width + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX + textHeight, infoShieldRect.top + infoShieldPaddingY);
        ctx.stroke();
    }

    private renderContextLine(ctx: CanvasRenderingContext2D, order: ChartOrder, lineType: LineType, fromPrice: number, toPrice: number)
    {
        const fromYCoord = this.params.series.priceToCoordinate(fromPrice);
        const toYCoord = this.params.series.priceToCoordinate(toPrice);

        if(fromYCoord == undefined || toYCoord == undefined)
            return;

        const color = getOrderColor(lineType, order);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0.5 * this.params.infoShieldMarginLeft, fromYCoord);
        ctx.lineTo(0.5 * this.params.infoShieldMarginLeft, toYCoord);
        ctx.stroke();
    }

    private renderContextPoint(ctx: CanvasRenderingContext2D, order: ChartOrder, lineType: LineType, price: number)
    {

        const yCoord = this.params.series.priceToCoordinate(price);

        if(yCoord == undefined)
            return;

        const color = getOrderColor(lineType, order);
        const fillColor = getOrderColor("entry", order);

        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0.5 * this.params.infoShieldMarginLeft, yCoord, 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    private renderOrder(ctx: CanvasRenderingContext2D, mediaSize: Size, order: ChartOrder)
    {
        const statistics = this.params.spreadDataFeed.getStatistics();
        if(statistics === undefined)
            return;

        if(order.data.symbol1EntryPrice === undefined || order.data.symbol2EntryPrice === undefined)
            return;

        const symbol1EntryPrice = +order.data.symbol1EntryPrice;
        const symbol2EntryPrice = +order.data.symbol2EntryPrice;

        const entryResidual = symbol1EntryPrice - statistics.hedgeRatio * symbol2EntryPrice;
        let amendedEntryResidual: number | undefined = undefined;
        if(order.amendedSymbol1EntryPrice !== undefined && order.amendedSymbol2EntryPrice !== undefined)
            amendedEntryResidual = order.amendedSymbol1EntryPrice - statistics.hedgeRatio * order.amendedSymbol2EntryPrice;

        const entry = amendedEntryResidual ?? entryResidual;
        const takeProfit = order.data.takeProfit ? entry + (+order.data.takeProfit) : undefined;
        const stopLoss = order.data.stopLoss ? entry + (+order.data.stopLoss) : undefined;
        const amendedTakeProfit = order.amendedTakeProfit ? entry + order.amendedTakeProfit : undefined;
        const amendedStopLoss = order.amendedStopLoss ? entry + order.amendedStopLoss : undefined;

        this.renderLine(ctx, mediaSize, "entry", order, entry, order.entryMoveObject, order.entryCloseObject);

        if(takeProfit !== undefined && order.takeProfitMoveObject && order.takeProfitCloseObject)
            this.renderLine(ctx, mediaSize, "take_profit", order, amendedTakeProfit ?? takeProfit, order.takeProfitMoveObject, order.takeProfitCloseObject);
        if(stopLoss !== undefined && order.stopLossMoveObject && order.stopLossCloseObject)
            this.renderLine(ctx, mediaSize, "stop_loss", order, amendedStopLoss ?? stopLoss, order.stopLossMoveObject, order.stopLossCloseObject);

        if(!order.focused)
            return;

        this.renderContextPoint(ctx, order, "entry", entry);

        if(takeProfit !== undefined)
        {
            this.renderContextLine(ctx, order, "entry", entry, takeProfit);
            this.renderContextPoint(ctx, order, "take_profit", takeProfit);
        }
        if(stopLoss !== undefined)
        {
            this.renderContextLine(ctx, order, "entry", entry, stopLoss);
            this.renderContextPoint(ctx, order, "stop_loss", stopLoss);
        }
    }

    private mediaCoordinateSpaceCallback(scope: MediaCoordinatesRenderingScope)
    {
        const context = scope.context;
        const mediaSize = scope.mediaSize;
        const orders = this.params.orders;

        let focusedOrder: ChartOrder | undefined = undefined;
        for(const order of orders.values())
        {
            if(order.focused)
            {
                focusedOrder = order;
                continue;
            }

            this.renderOrder(context, mediaSize, order);
        }

        if(focusedOrder)
            this.renderOrder(context, mediaSize, focusedOrder);
    }

    public draw(target: CanvasRenderingTarget2D)
    {
        target.useMediaCoordinateSpace(this.mediaCoordinateSpaceCallback.bind(this));
    }
}

export class OrderPaneView implements ISeriesPrimitivePaneView
{
    private orderPaneRenderer: OrderPaneRenderer;

    constructor(params: OrderPaneViewParams)
    {
        this.orderPaneRenderer = new OrderPaneRenderer(params);
    }

    public renderer()
    {
        return this.orderPaneRenderer;
    }

}