import EventEmitter from "events";
import { Coordinate, IChartApi, ISeriesApi, ISeriesPrimitive, SeriesOptionsMap } from "lightweight-charts";
import colors from "tailwindcss/colors";
import { PriceLabel } from "./PriceLabel";
import { PriceLine } from "./PriceLine";
import { CloseButton } from "./CloseButton";
import { InfoLabel } from "./InfoLabel";

export type ChartPositionSide = "Buy" | "Sell";

export const chartPositionColors = {
    sell: colors.red[400],
    buy: colors.green[400],
};

function getColor(positionSide: ChartPositionSide)
{
    switch(positionSide)
    {
        case "Buy": return chartPositionColors.buy;
        case "Sell": return chartPositionColors.sell;
    }
}

function getPositionSideText(positionSide: ChartPositionSide)
{
    switch(positionSide)
    {
        case "Buy": return "LONG";
        case "Sell": return "SHORT";
    }
}

export class ChartPosition extends EventEmitter<{
    "close": [],
}> implements ISeriesPrimitive
{
    private price: number;
    private pnl: number;
    private side: ChartPositionSide;
    private chart: IChartApi;
    private series: ISeriesApi<keyof SeriesOptionsMap>;

    private yCoord: Coordinate;

    private priceLabel: PriceLabel;
    private priceLine: PriceLine;
    private closeButton: CloseButton;
    private infoLabel: InfoLabel;

    constructor(price: number, pnl: number, side: ChartPositionSide, chart: IChartApi, series: ISeriesApi<keyof SeriesOptionsMap>)
    {
        super();
        this.price = price;
        this.pnl = pnl;
        this.side = side;
        this.chart = chart;
        this.series = series;

        this.yCoord = this.series.priceToCoordinate(this.price) ?? 0 as Coordinate;

        this.chart.chartElement().addEventListener("mousedown", this.onMouseDown.bind(this));

        const color = getColor(this.side);
        const positionSideText = getPositionSideText(this.side);

        this.priceLabel = new PriceLabel({
            price: this.price,
            yCoord: this.yCoord,
            color,
        });

        this.priceLine = new PriceLine({
            yCoord: this.yCoord,
            color,
        });

        this.closeButton = new CloseButton({
            yCoord: this.yCoord,
            color,
            fontSizePx: 12,
            left: 10,
            xPadding: 8,
            yPadding: 8,
        });

        this.infoLabel = new InfoLabel({
            yCoord: this.yCoord,
            pnl: this.pnl,
            text: positionSideText,
            color,
            fontSizePx: 12,
            left: 48,
            xPadding: 16,
            yPadding: 8,
        })
    }

    public set Pnl(pnl: number)
    {
        this.pnl = pnl;
    }

    public set Price(price: number)
    {
        this.price = price;
        this.yCoord = this.series.priceToCoordinate(this.price) ?? 0 as Coordinate;
    }

    private onMouseDown(ev: MouseEvent)
    {
        if(this.closeButton.HitBox.containsPoint(ev.offsetX, ev.offsetY))
            this.emit("close");
    }

    public updateAllViews()
    {
        this.yCoord = this.series.priceToCoordinate(this.price) ?? 0 as Coordinate;
        this.priceLabel.updatePrice(this.price, this.yCoord);
        this.priceLine.updatePrice(this.yCoord);
        this.closeButton.updatePrice(this.yCoord);
        this.infoLabel.update(this.yCoord, this.pnl);
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
            this.infoLabel,
        ];
    }
}