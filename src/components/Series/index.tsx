import { ReactNode, createContext, forwardRef, useContext, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { ISeriesApi, LineData, WhitespaceData, Time, DeepPartial, LineStyleOptions, SeriesOptionsCommon } from "lightweight-charts";
import { ChartContainerContext } from "../Chart/ChartContainer";

export interface SeriesProps
{
    children?: ReactNode;
    data?: (LineData<Time> | WhitespaceData<Time>)[];
}

export interface LineSeriesContextRef
{
    _api?: ISeriesApi<"Line">;
    api(): ISeriesApi<"Line">;
    free(): void;
}

export const LineSeriesContext = createContext<LineSeriesContextRef>({} as LineSeriesContextRef);

export const LineSeries = forwardRef((props: SeriesProps & DeepPartial<LineStyleOptions & SeriesOptionsCommon>, ref) =>
{
    const { children, data, ...options } = props;
    const parent = useContext(ChartContainerContext);

    const context = useRef<LineSeriesContextRef>({
        api() {
            if(!this._api)
            {
                this._api = parent.api().addLineSeries();
                if(data)
                    this._api.setData(data);
            }

            return this._api;
        },
        free() {
            if(this._api && !parent.isRemoved)
            {
                parent.free(this._api);
                this._api = undefined;
            }
        }
    })

    useLayoutEffect(() => {
        const currentRef = context.current;
        currentRef.api();
        return () => {
            currentRef.free();
        };
    }, []);

    useLayoutEffect(() => {
        const currentRef = context.current;
        currentRef.api().applyOptions(options);
    }, []);

    useImperativeHandle(ref, () => context.current.api(), []);

    return (
        <LineSeriesContext.Provider value={context.current}>
            {children}
        </LineSeriesContext.Provider>
    );
});