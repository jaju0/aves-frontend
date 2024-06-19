import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope } from "fancy-canvas";
import { Coordinate, ISeriesApi, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView, SeriesOptionsMap } from "lightweight-charts";

export interface PriceLineProps
{
    price: number;
    series: ISeriesApi<keyof SeriesOptionsMap>;
    color: string;
}

export class PriceLineRenderer implements ISeriesPrimitivePaneRenderer
{
    private yCoord: Coordinate;
    private color: string;

    constructor(yCoord: Coordinate, color: string)
    {
        this.yCoord = yCoord;
        this.color = color;
    }

    private mediaCoordinateSpaceCallback(scope: MediaCoordinatesRenderingScope)
    {
        const ctx = scope.context;

        const oldFillStyle = ctx.fillStyle;

        ctx.fillStyle = this.color;
        ctx.fillRect(0, this.yCoord, scope.mediaSize.width, 1);

        ctx.fillStyle = oldFillStyle;
    }

    public draw(target: CanvasRenderingTarget2D)
    {
        target.useMediaCoordinateSpace(this.mediaCoordinateSpaceCallback.bind(this));
    }

}

export class PriceLine implements ISeriesPrimitivePaneView
{
    private props: PriceLineProps;
    private price: number;
    private yCoord: Coordinate | null;

    constructor(props: PriceLineProps)
    {
        this.props = props;
        this.price = this.props.price;
        this.yCoord = this.props.series.priceToCoordinate(this.price);
    }

    public updatePrice(newPrice: number)
    {
        this.price = newPrice;
        this.yCoord = this.props.series.priceToCoordinate(this.price);
    }

    public renderer()
    {
        return this.yCoord !== null ? new PriceLineRenderer(this.yCoord, this.props.color) : null;
    }

}