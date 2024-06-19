import { EventEmitter } from "events";
import { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesOptionsMap } from "lightweight-charts";
import colors from "tailwindcss/colors";
import { PriceLabel } from "./PriceLabel";
import { PriceLine } from "./PriceLine";
import { DragButton } from "./DragButton";
import { CloseButton } from "./CloseButton";

export type ChartOrderType = "Limit" | "Stop" | "TakeProfit" | "StopLoss";
export type ChartOrderSide = "Buy" | "Sell";

export const chartOrderColors = {
    sell: colors.red[400],
    buy: colors.blue[400],
    takeProfit: colors.green[400],
    stopLoss: colors.amber[400],
};

function getColor(orderType: ChartOrderType, orderSide: ChartOrderSide)
{
    let color: string = colors.gray[500];
    if(orderType === "Limit" || orderType === "Stop")
    {
        if(orderSide === "Buy")
            color = chartOrderColors.buy;
        else if(orderSide === "Sell")
            color = chartOrderColors.sell;
    }
    else if(orderType === "TakeProfit")
        color = chartOrderColors.takeProfit;
    else if(orderType === "StopLoss")
        color = chartOrderColors.stopLoss;

    return color;
}

function getOrderTypeText(orderType: ChartOrderType)
{
    switch(orderType)
    {
        case "Limit": return "LMT";
        case "Stop": return "STP";
        case "StopLoss": return "SL";
        case "TakeProfit": return "TP";
    }
}

export class ChartOrder extends EventEmitter<{
    "price": [number],
    "close": [],
}> implements ISeriesPrimitive
{
    private chart: IChartApi;
    private series: ISeriesApi<keyof SeriesOptionsMap>;
    private price: number;
    private size: number;
    private priceLabel: PriceLabel;
    private priceLine: PriceLine;
    private dragButton: DragButton;
    private closeButton: CloseButton;
    private isDragging: boolean;

    constructor(price: number, size: number, type: ChartOrderType, side: ChartOrderSide, chart: IChartApi, series: ISeriesApi<keyof SeriesOptionsMap>)
    {
        super();
        this.chart = chart;
        this.series = series;

        this.chart.chartElement().addEventListener("mousedown", this.onMouseDown.bind(this));
        this.chart.chartElement().addEventListener("mouseup", this.onMouseUp.bind(this));
        this.chart.chartElement().addEventListener("mousemove", this.onMouseMove.bind(this));

        let color = getColor(type, side);;
        let orderTypeText = getOrderTypeText(type);

        this.price = price;
        this.size = size;

        this.priceLabel = new PriceLabel({
            series,
            price,
            color,
        });

        this.priceLine = new PriceLine({
            series,
            price,
            color,
        });

        this.closeButton = new CloseButton({
            series,
            left: 10,
            xPadding: 8,
            yPadding: 8,
            fontSizePx: 12,
            price,
            color,
        });

        this.dragButton = new DragButton({
            series,
            left: 48,
            xPadding: 16,
            yPadding: 8,
            fontSizePx: 12,
            price,
            size: this.size,
            color,
            text: orderTypeText,
        });

        this.isDragging = false;
    }

    public setPrice(price: number)
    {
        this.price = price;
        this.chart.applyOptions({});
    }

    public onMouseDown(ev: MouseEvent)
    {
        if(this.dragButton.HitBox.containsPoint(ev.offsetX, ev.offsetY))
        {
            this.isDragging = true;
            ev.stopPropagation();
        }
        else if(this.closeButton.HitBox.containsPoint(ev.offsetX, ev.offsetY))
        {
            this.emit("close");
        }
    }

    public onMouseUp()
    {
        this.isDragging = false;
        this.emit("price", this.price);
    }
    
    public onMouseMove(ev: MouseEvent)
    {
        if(this.isDragging)
        {
            this.price = this.series.coordinateToPrice(ev.offsetY) ?? this.price;
            this.chart.applyOptions({});
            ev.stopPropagation();
        }
    }

    public updateAllViews()
    {
        this.priceLabel.updatePrice(this.price);
        this.priceLine.updatePrice(this.price);
        this.closeButton.updatePrice(this.price);
        this.dragButton.updatePrice(this.price);
    }

    public priceAxisViews()
    {
        return [
            this.priceLabel,
        ];
    }

    public paneViews()
    {
        return [
            this.priceLine,
            this.closeButton,
            this.dragButton,
        ];
    }
}