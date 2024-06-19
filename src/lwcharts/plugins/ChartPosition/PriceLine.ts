import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope } from "fancy-canvas";
import { Coordinate, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView } from "lightweight-charts";

export interface PriceLineProps
{
    yCoord: Coordinate;
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
    private yCoord: Coordinate;

    constructor(props: PriceLineProps)
    {
        this.props = props;
        this.yCoord = this.props.yCoord;
    }

    public updatePrice(yCoord: Coordinate)
    {
        this.yCoord = yCoord;
    }

    public renderer()
    {
        return this.yCoord !== null ? new PriceLineRenderer(this.yCoord, this.props.color) : null;
    }
}