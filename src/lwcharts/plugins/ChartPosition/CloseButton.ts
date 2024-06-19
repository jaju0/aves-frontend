import { Coordinate, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView } from "lightweight-charts";
import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope } from "fancy-canvas";
import { Rectangle } from "../../helpers/dimensions/common";

export interface CloseButtonProps
{
    left: number;
    xPadding: number;
    yPadding: number;
    fontSizePx: number;
    yCoord: Coordinate;
    color: string;
}

class CloseButtonRenderer implements ISeriesPrimitivePaneRenderer
{
    private yCoord: Coordinate;
    private color: string;
    private left: number;
    private xPadding: number;
    private yPadding: number;
    private fontSizePx: number;
    private rect: Rectangle;

    constructor(yCoord: Coordinate, color: string, left: number, xPadding: number, yPadding: number, fontSizePx: number, rect: Rectangle)
    {
        this.yCoord = yCoord;
        this.color = color;
        this.rect = rect;
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
        const textMetrics = ctx.measureText("X");
        const textMetricsHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        this.rect.left = this.left;
        this.rect.top = this.yCoord-0.5*textMetricsHeight-this.yPadding;
        this.rect.width = textMetrics.width+2*this.xPadding;
        this.rect.height = textMetricsHeight+2*this.yPadding;

        ctx.fillRect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);
        ctx.strokeRect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);

        ctx.strokeText("X", this.left+this.xPadding, this.yCoord+0.5*textMetricsHeight);

        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.font = oldFont;
    }

    public draw(target: CanvasRenderingTarget2D)
    {
        target.useMediaCoordinateSpace(this.mediaCoordinateSpaceCallback.bind(this));
    }
}

export class CloseButton implements ISeriesPrimitivePaneView
{
    private props: CloseButtonProps;
    private yCoord: Coordinate;
    private hitBox: Rectangle;

    constructor(props: CloseButtonProps)
    {
        this.props = props;
        this.yCoord = this.props.yCoord;
        this.hitBox = new Rectangle();
    }

    public updatePrice(yCoord: Coordinate)
    {
        this.yCoord = yCoord;
    }

    public renderer()
    {
        return this.yCoord !== null ? new CloseButtonRenderer(this.yCoord, this.props.color, this.props.left, this.props.xPadding, this.props.yPadding, this.props.fontSizePx, this.hitBox) : null;
    }

    public get HitBox()
    {
        return this.hitBox;
    }
}