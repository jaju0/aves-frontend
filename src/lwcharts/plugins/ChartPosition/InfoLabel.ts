import { CanvasRenderingTarget2D, MediaCoordinatesRenderingScope } from "fancy-canvas";
import { Coordinate, ISeriesPrimitivePaneRenderer, ISeriesPrimitivePaneView } from "lightweight-charts";
import colors from "tailwindcss/colors";
import { Rectangle } from "../../helpers/dimensions/common";

export interface InfoLabelProps
{
    yCoord: Coordinate;
    pnl: number;
    color: string;
    text: string;
    left: number;
    xPadding: number;
    yPadding: number;
    fontSizePx: number;
}

export class InfoLabelRenderer implements ISeriesPrimitivePaneRenderer
{
    private yCoord: Coordinate;
    private pnl: number;
    private text: string;
    private color: string;
    private left: number;
    private xPadding: number;
    private yPadding: number;
    private fontSizePx: number;
    private rect: Rectangle;

    constructor(yCoord: Coordinate, pnl: number, text: string, color: string, left: number, xPadding: number, yPadding: number, fontSizePx: number, hitBox: Rectangle)
    {
        this.yCoord = yCoord;
        this.pnl = pnl;
        this.text = text;
        this.color = color;
        this.left = left;
        this.xPadding = xPadding;
        this.yPadding = yPadding;
        this.fontSizePx = fontSizePx;
        this.rect = hitBox;
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

        const pnlText = `${this.pnl > 0 ? "+" : ""}${this.pnl}   `;

        const pnlTextMetrics = ctx.measureText(pnlText);
        const pnlTextMetricsHeight = pnlTextMetrics.actualBoundingBoxAscent + pnlTextMetrics.actualBoundingBoxDescent;

        const textMetrics = ctx.measureText(this.text);
        const textMetricsHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        this.rect.left = this.left;
        this.rect.top = this.yCoord-0.5*textMetricsHeight-this.yPadding;
        this.rect.width = pnlTextMetrics.width+textMetrics.width+2*this.xPadding;
        this.rect.height = textMetricsHeight+2*this.yPadding;

        ctx.fillRect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);
        ctx.strokeRect(this.rect.left, this.rect.top, this.rect.width, this.rect.height);

        if(this.pnl < 0)
            ctx.strokeStyle = colors.red[400];
        else if(this.pnl > 0)
            ctx.strokeStyle = colors.green[400];
        else
            ctx.strokeStyle = colors.gray[400];

        ctx.strokeText(pnlText, this.left+this.xPadding, this.yCoord+0.5*pnlTextMetricsHeight);

        ctx.strokeStyle = this.color;

        ctx.strokeText(this.text, this.left+this.xPadding+pnlTextMetrics.width, this.yCoord+0.5*textMetricsHeight);

        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.font = oldFont;
    }

    public draw(target: CanvasRenderingTarget2D)
    {
        target.useMediaCoordinateSpace(this.mediaCoordinateSpaceCallback.bind(this));
    }
}

export class InfoLabel implements ISeriesPrimitivePaneView
{
    private props: InfoLabelProps;
    private yCoord: Coordinate;
    private pnl: number;
    private text: string;
    private hitBox: Rectangle;

    constructor(props: InfoLabelProps)
    {
        this.props = props;
        this.yCoord = this.props.yCoord;
        this.pnl = this.props.pnl;
        this.text = this.props.text;
        this.hitBox = new Rectangle();
    }

    public update(yCoord: Coordinate, pnl: number)
    {
        this.yCoord = yCoord;
        this.pnl = pnl;
    }

    public renderer()
    {
        return new InfoLabelRenderer(this.yCoord, this.pnl, this.text, this.props.color, this.props.left, this.props.xPadding, this.props.yPadding, this.props.fontSizePx, this.hitBox);
    }

    public get HitBox()
    {
        return this.hitBox;
    }
}