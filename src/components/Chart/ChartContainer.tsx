import { IChartApi, createChart, ISeriesApi, SeriesType, Time, DeepPartial, TimeChartOptions } from "lightweight-charts";
import { ReactNode, createContext, forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";

export interface ChartContainerRef
{
    _api?: IChartApi;
    isRemoved: boolean;
    api(): IChartApi;
    free(series: ISeriesApi<SeriesType, Time>): void;
}

export const ChartContainerContext = createContext<ChartContainerRef>({} as ChartContainerRef);

export interface ChartContainerProps
{
    children?: ReactNode;
    container: HTMLDivElement;
}

export const ChartContainer = forwardRef((props: ChartContainerProps & DeepPartial<TimeChartOptions>, ref) =>
{
    const { container, children, ...options } = props;

    const chartApiRef = useRef<ChartContainerRef>({
        isRemoved: false,
        api() {
            if(this._api === undefined)
                this._api = createChart(container);

            this._api.timeScale().fitContent();

            return this._api;
        },
        free(series?: ISeriesApi<SeriesType, Time>) {
            if(this._api && series)
                this._api.removeSeries(series);
        }
    });

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        const chart = currentRef.api();

        const handleResize = () => {
            chart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight,
            });
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chartApiRef.current.isRemoved = true;
            chart.remove();
            currentRef._api = undefined;
        };
    }, []);

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api();
    }, []);

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api().applyOptions(options);
    }, []);

    useImperativeHandle(ref, () => chartApiRef.current.api(), []);
    
    return (
        <ChartContainerContext.Provider value={chartApiRef.current}>
            {children}
        </ChartContainerContext.Provider>
    );
});