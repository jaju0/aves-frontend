import EventEmitter from "events";
import { IChartApi } from "lightweight-charts";

export class ChartMouse extends EventEmitter<{
    "mousedown": [MouseEvent],
    "mouseup": [MouseEvent],
}>
{
    private chart: IChartApi;
    private isMouseDown: boolean;

    constructor(chart: IChartApi)
    {
        super();
        this.chart = chart;
        this.isMouseDown = false;
    }

    public attached()
    {
        this.chart.chartElement().addEventListener("mousedown", this.mouseDownHandler.bind(this));
        this.chart.chartElement().addEventListener("mouseup", this.mouseUpHandler.bind(this));
    }

    public detached()
    {
        this.chart.chartElement().removeEventListener("mousedown", this.mouseDownHandler.bind(this));
        this.chart.chartElement().removeEventListener("mouseup", this.mouseUpHandler.bind(this));
    }

    private mouseDownHandler(ev: MouseEvent)
    {
        this.isMouseDown = true;
        this.emit("mousedown", ev);
    }

    private mouseUpHandler(ev: MouseEvent)
    {
        this.isMouseDown = false;
        this.chart.applyOptions({ handleScroll: true });
        this.emit("mouseup", ev);
    }

    public get IsMouseDown()
    {
        return this.isMouseDown;
    }
}