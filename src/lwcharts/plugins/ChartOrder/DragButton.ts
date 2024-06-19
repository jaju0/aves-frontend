import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope } from "fancy-canvas";
import { Coordinate, ISeriesApi, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView, SeriesOptionsMap } from "lightweight-charts";
import { Rectangle } from "../../helpers/dimensions/common";

export interface DragButtonProps
{
    left: number;
    xPadding: number;
    yPadding: number;
    fontSizePx: number;
    price: number;
    size: number;
    text: string;
    series: ISeriesApi<keyof SeriesOptionsMap>;
    color: string;
}

export class DragButtonRenderer implements ISeriesPrimitivePaneRenderer
{
    private yCoord: Coordinate;
    private text: string;
    private color: string;
    private left: number;
    private xPadding: number;
    private yPadding: number;
    private fontSizePx: number;
    private rect: Rectangle;

    constructor(yCoord: Coordinate, text: string, color: string, left: number, xPadding: number, yPadding: number, fontSizePx: number, rect: Rectangle)
    {
        this.yCoord = yCoord;
        this.text = text;
        this.color = color;
        this.left = left;
        this.xPadding = xPadding;
        this.yPadding = yPadding;
        this.fontSizePx = fontSizePx;
        this.rect = rect;
    }

    private mediaCoordinateSpaceCallback(scope: MediaCoordinatesRenderingScope)
    {
        const ctx = scope.context;

        const oldFillStyle = ctx.fillStyle;
        const oldStrokeStyle = ctx.strokeStyle;
        const oldFont = ctx.font;

        ctx.fillStyle = "black";
        ctx.strokeStyle = this.color;
        ctx.font = `${this.fontSizePx}`;
        const textMetrics = ctx.measureText(this.text);
        const textMetricsHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        this.rect.left = this.left;
        this.rect.top = this.yCoord-0.5*textMetricsHeight-this.yPadding;
        this.rect.width = textMetrics.width+2*this.xPadding;
        this.rect.height = textMetricsHeight+2*this.yPadding;

        ctx.fillRect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);
        ctx.strokeRect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);

        ctx.strokeText(this.text, this.left+this.xPadding, this.yCoord+0.5*textMetricsHeight);

        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.font = oldFont;
    }

    public draw(target: CanvasRenderingTarget2D)
    {
        target.useMediaCoordinateSpace(this.mediaCoordinateSpaceCallback.bind(this));
    }

}

export class DragButton implements ISeriesPrimitivePaneView
{
    private props: DragButtonProps;
    private price: number;
    private size: number;
    private yCoord: Coordinate | null;
    private label: string;
    private hitBox: Rectangle;

    constructor(props: DragButtonProps)
    {
        this.props = props;
        this.price = this.props.price;
        this.size = this.props.size;
        this.yCoord = this.props.series.priceToCoordinate(this.price);
        this.label = `${this.size} ${this.props.text}`;
        this.hitBox = new Rectangle();
    }

    public updatePrice(newPrice: number)
    {
        this.price = newPrice;
        this.yCoord = this.props.series.priceToCoordinate(this.price);
    }

    public renderer()
    {
        return this.yCoord !== null ? new DragButtonRenderer(this.yCoord, this.label, this.props.color, this.props.left, this.props.xPadding, this.props.yPadding, this.props.fontSizePx, this.hitBox) : null;
    }

    public get HitBox()
    {
        return this.hitBox;
    }
}