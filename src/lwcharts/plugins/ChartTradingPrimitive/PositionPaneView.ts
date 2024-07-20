import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope, Size } from "fancy-canvas";
import { ISeriesApi, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView, SeriesOptionsMap } from "lightweight-charts";
import colors from "tailwindcss/colors";
import { SpreadDataFeed } from "../../../SpreadDataFeed";
import { ChartPosition } from ".";
import { Rectangle } from "../../helpers/dimensions/common";
import { ChartObject } from "./ChartObject";

export const orderType = ["stop_loss", "take_profit"] as const;
export type OrderType = typeof orderType[number];

export const chartPositionColors = {
    sell: colors.red[400],
    sellShade: "#44292c",
    buy: colors.blue[400],
    buyShade: "#1F252F",
}

export const chartOrderColors = {
    takeProfit: colors.green[400],
    takeProfitShade: "#223f2f",
    stopLoss: colors.amber[400],
    stopLossShade: "#45391c",
};

export interface PositionPaneViewParams
{
    spreadDataFeed: SpreadDataFeed;
    series: ISeriesApi<keyof SeriesOptionsMap>;
    positions: Map<string, ChartPosition>;
    infoShieldMarginLeft: number;
}

function getPositionColor(position: ChartPosition)
{
    return position.data.side === "Long" ? chartPositionColors.buy : chartPositionColors.sell;
}

function getPositionColorShade(position: ChartPosition)
{
    return position.data.side === "Long" ? chartPositionColors.buyShade : chartPositionColors.sellShade;
}

export function getOrderColor(orderType: OrderType)
{
    return orderType === "take_profit" ? chartOrderColors.takeProfit : chartOrderColors.stopLoss;
}

export function getOrderColorShade(orderType: OrderType)
{

    return orderType === "take_profit" ? chartOrderColors.takeProfitShade : chartOrderColors.stopLossShade;
}

export function getOrderTypeText(orderType: OrderType)
{
    return orderType === "take_profit" ? "TP" : "SL";
}

export class PositionPaneRenderer implements ISeriesPrimitivePaneRenderer
{
    private params: PositionPaneViewParams;

    constructor(params: PositionPaneViewParams)
    {
        this.params = params;
    }

    private renderOrderLine(ctx: CanvasRenderingContext2D, mediaSize: Size, orderType: OrderType, position: ChartPosition, price: number, moveObject: ChartObject, closeObject: ChartObject)
    {
        const yCoord = this.params.series.priceToCoordinate(price);
        if(yCoord === null)
            return;

        ctx.font = "lighter 8pt Arial";

        const sizeText = `${position.data.symbol1BaseQty} ${position.data.symbol2BaseQty}`;
        const typeText = getOrderTypeText(orderType);
        const color = getOrderColor(orderType);
        const colorShade = getOrderColorShade(orderType);

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
        ctx.setLineDash([4, 2]);
        ctx.moveTo(0, yCoord);
        ctx.lineTo(mediaSize.width, yCoord);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = color;
        ctx.fillStyle = colors.zinc[900];
        ctx.lineWidth = 1;
        ctx.beginPath();
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

    private renderPositionLine(ctx: CanvasRenderingContext2D, mediaSize: Size, position: ChartPosition, closeObject: ChartObject, price: number)
    {
        const yCoord = this.params.series.priceToCoordinate(price);
        if(yCoord === null)
            return;

        ctx.font = "lighter 8pt Arial";

        const sizeText = `${position.data.symbol1BaseQty} ${position.data.symbol2BaseQty}`;
        const pnlText = parseFloat(position.data.lastPnl).toFixed(4);
        const color = getPositionColor(position);
        const colorShade = getPositionColorShade(position);

        const infoShieldPaddingX = 4;
        const infoShieldPaddingY = 6;

        const sizeTextMetrics = ctx.measureText(sizeText);
        const sizeTextHeight = sizeTextMetrics.actualBoundingBoxAscent - sizeTextMetrics.actualBoundingBoxDescent;
        const sizeTextPaddingX = 4;

        const pnlTextMetrics = ctx.measureText(pnlText);
        const pnlTextHeight = pnlTextMetrics.actualBoundingBoxAscent - pnlTextMetrics.actualBoundingBoxDescent;
        const pnlTextPaddingX = 4;
        const pnlTextColor = +position.data.lastPnl < 0 ? colors.red[500] : colors.green[500];

        const seperatorPaddingX = 4;
        const seperatorWidth = 1;

        const closeSymbolPaddingX = 4;

        const textHeight = Math.max(sizeTextHeight, pnlTextHeight);

        const infoShieldRect = new Rectangle();
        infoShieldRect.width = 2 * infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + seperatorWidth + 2 * seperatorPaddingX + textHeight + 2 * closeSymbolPaddingX;
        infoShieldRect.height = textHeight + 2 * infoShieldPaddingY;
        infoShieldRect.left = this.params.infoShieldMarginLeft;
        infoShieldRect.top = yCoord - 0.5 * infoShieldRect.height;

        Object.assign(closeObject.Rect, infoShieldRect);
        closeObject.Rect.width = textHeight + 2 * closeSymbolPaddingX;
        closeObject.Rect.left =  this.params.infoShieldMarginLeft + 2 * infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + seperatorWidth + 2 * seperatorPaddingX;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, yCoord);
        ctx.lineTo(mediaSize.width, yCoord);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.fillStyle = colors.zinc[900];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(infoShieldRect.left, infoShieldRect.top, infoShieldRect.width, infoShieldRect.height, 4),
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(infoShieldRect.left, infoShieldRect.top, infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX, infoShieldRect.height, 4);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX - 4, infoShieldRect.top, 4, infoShieldRect.height);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.fillText(sizeText, infoShieldRect.left + infoShieldPaddingX + sizeTextPaddingX, infoShieldRect.top + textHeight + infoShieldPaddingY);

        ctx.fillStyle = pnlTextColor;
        ctx.beginPath();
        ctx.fillText(pnlText, infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextPaddingX, infoShieldRect.top + textHeight + infoShieldPaddingY);

        ctx.strokeStyle = colorShade;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + seperatorPaddingX + seperatorWidth, infoShieldRect.top + 1);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + seperatorPaddingX + seperatorWidth, infoShieldRect.top + infoShieldRect.height - 1);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX, infoShieldRect.top + infoShieldPaddingY);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX + textHeight, infoShieldRect.top + infoShieldPaddingY + textHeight);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX, infoShieldRect.top + infoShieldPaddingY + textHeight);
        ctx.lineTo(infoShieldRect.left + infoShieldPaddingX + sizeTextMetrics.width + 2 * sizeTextPaddingX + pnlTextMetrics.width + 2 * pnlTextPaddingX + 2 * seperatorPaddingX + seperatorWidth + closeSymbolPaddingX + textHeight, infoShieldRect.top + infoShieldPaddingY);
        ctx.stroke();
    }

    private renderContextLine(ctx: CanvasRenderingContext2D, position: ChartPosition, orderType: OrderType | "entry", fromPrice: number, toPrice: number)
    {
        const fromYCoord = this.params.series.priceToCoordinate(fromPrice);
        const toYCoord = this.params.series.priceToCoordinate(toPrice);

        if(fromYCoord == undefined || toYCoord == undefined)
            return;

        const color = orderType === "entry" ? getPositionColor(position) : getOrderColor(orderType);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0.5 * this.params.infoShieldMarginLeft, fromYCoord);
        ctx.lineTo(0.5 * this.params.infoShieldMarginLeft, toYCoord);
        ctx.stroke();
    }

    private renderContextPoint(ctx: CanvasRenderingContext2D, position: ChartPosition, orderType: OrderType | "entry", price: number)
    {
        const yCoord = this.params.series.priceToCoordinate(price);

        if(yCoord == undefined)
            return;

        const color = orderType === "entry" ? getPositionColor(position) : getOrderColor(orderType);
        const fillColor = getPositionColor(position);

        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0.5 * this.params.infoShieldMarginLeft, yCoord, 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    private renderPosition(ctx: CanvasRenderingContext2D, mediaSize: Size, position: ChartPosition)
    {
        const statistics = this.params.spreadDataFeed.getStatistics();
        if(statistics === undefined)
            return;

        const symbol1EntryPrice = +position.data.symbol1EntryPrice;
        const symbol2EntryPrice = +position.data.symbol2EntryPrice;
        const positionStopLoss = position.data.stopLoss === undefined ? undefined : +position.data.stopLoss;
        const positionTakeProfit = position.data.takeProfit === undefined ? undefined : +position.data.takeProfit;

        const entryResidual = symbol1EntryPrice - statistics.hedgeRatio * symbol2EntryPrice;
        const absoluteStopLoss = positionStopLoss === undefined ? undefined : entryResidual + positionStopLoss;
        const absoluteTakeProfit = positionTakeProfit === undefined ? undefined : entryResidual + positionTakeProfit;
        const amendedAbsoluteTakeProfit = position.amendedTakeProfit === undefined ? undefined : entryResidual + position.amendedTakeProfit;
        const amendedAbsoluteStopLoss = position.amendedStopLoss === undefined ? undefined : entryResidual + position.amendedStopLoss;

        this.renderPositionLine(ctx, mediaSize, position, position.closeObject, entryResidual);

        if(absoluteTakeProfit !== undefined && position.takeProfitMoveObject && position.takeProfitCloseObject)
            this.renderOrderLine(ctx, mediaSize, "take_profit", position, amendedAbsoluteTakeProfit ?? absoluteTakeProfit, position.takeProfitMoveObject, position.takeProfitCloseObject);
        if(absoluteStopLoss !== undefined && position.stopLossMoveObject && position.stopLossCloseObject)
            this.renderOrderLine(ctx, mediaSize, "stop_loss", position, amendedAbsoluteStopLoss ?? absoluteStopLoss, position.stopLossMoveObject, position.stopLossCloseObject);

        const takeProfit = amendedAbsoluteTakeProfit ?? (absoluteTakeProfit === undefined ? undefined : absoluteTakeProfit);
        const stopLoss = amendedAbsoluteStopLoss ?? (absoluteStopLoss === undefined ? undefined : absoluteStopLoss);

        if(!position.focused)
            return;

        this.renderContextPoint(ctx, position, "entry", entryResidual);

        if(takeProfit !== undefined)
        {
            this.renderContextLine(ctx, position, "entry", entryResidual, takeProfit);
            this.renderContextPoint(ctx, position, "take_profit", takeProfit);
        }
        if(stopLoss !== undefined)
        {
            this.renderContextLine(ctx, position, "entry", entryResidual, stopLoss);
            this.renderContextPoint(ctx, position, "stop_loss", stopLoss);
        }
    }

    private mediaCoordinateSpaceCallback(scope: MediaCoordinatesRenderingScope)
    {
        const context = scope.context;
        const mediaSize = scope.mediaSize;
        const positions = this.params.positions;

        let focusedPosition: ChartPosition | undefined = undefined;
        for(const position of positions.values())
        {
            if(position.focused)
            {
                focusedPosition = position;
                continue;
            }

            this.renderPosition(context, mediaSize, position);
        }

        if(focusedPosition)
            this.renderPosition(context, mediaSize, focusedPosition);
    }

    public draw(target: CanvasRenderingTarget2D)
    {
        target.useMediaCoordinateSpace(this.mediaCoordinateSpaceCallback.bind(this));
    }
}

export class PositionPaneView implements ISeriesPrimitivePaneView
{
    private positionPaneRenderer: PositionPaneRenderer;

    constructor(params: PositionPaneViewParams)
    {
        this.positionPaneRenderer = new PositionPaneRenderer(params);
    }

    public renderer()
    {
        return this.positionPaneRenderer;
    }
}