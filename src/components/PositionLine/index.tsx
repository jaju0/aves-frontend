import { ReactNode, createContext, useContext, useLayoutEffect, useRef } from "react";
import { ChartPosition, ChartPositionSide } from "../../lwcharts/plugins/ChartPosition";
import { ChartContainerContext } from "../Chart/ChartContainer";
import { LineSeriesContext } from "../Series";

export interface PositionLineContextRef
{
    _api?: ChartPosition;
    api(): ChartPosition;
    free(): void;
}

export const PositionLineContext = createContext<PositionLineContextRef>({} as PositionLineContextRef);

export interface PositionLineProps
{
    children?: ReactNode;
    price: number;
    pnl: number;
    side: ChartPositionSide;
}

export function PositionLine(props: PositionLineProps)
{
    const { children, ...options } = props;
    const chart = useContext(ChartContainerContext);
    const parent = useContext(LineSeriesContext);

    const context = useRef<PositionLineContextRef>({
        api() {
            if(!this._api)
            {
                this._api = new ChartPosition(options.price, options.pnl, options.side, chart.api(), parent.api());
                parent.api().attachPrimitive(this._api);
            }

            return this._api;
        },
        free() {
            if(this._api && parent._api)
            {
                parent._api.detachPrimitive(this._api);
                this._api = undefined;
            }
        }
    });

    useLayoutEffect(() => {
        const currentRef = context.current;
        currentRef.api();
        return () => {
            currentRef.free();
        };
    }, []);

    return (
        <PositionLineContext.Provider value={context.current}>
            {children}
        </PositionLineContext.Provider>
    );
}