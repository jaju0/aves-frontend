import { ReactNode, createContext, forwardRef, useContext, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { ChartOrder, ChartOrderSide, ChartOrderType } from "../../lwcharts/plugins/ChartOrder";
import { LineSeriesContext } from "../Series";
import { ChartContainerContext } from "../Chart/ChartContainer";

export interface OrderLineContextRef
{
    _api?: ChartOrder;
    api(): ChartOrder;
    free(): void;
}

export const OrderLineContext = createContext<OrderLineContextRef>({} as OrderLineContextRef);

export interface OrderLineProps
{
    children?: ReactNode;
    price: number;
    size: number;
    type: ChartOrderType;
    side: ChartOrderSide;
}

export const OrderLine = forwardRef<ChartOrder, OrderLineProps>((props: OrderLineProps, ref) =>
{
    const { children, ...options } = props;
    const chart = useContext(ChartContainerContext);
    const parent = useContext(LineSeriesContext);

    const context = useRef<OrderLineContextRef>({
        api() {
            if(!this._api)
            {
                this._api = new ChartOrder(options.price, options.size, options.type, options.side, chart.api(), parent.api());
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

    useImperativeHandle(ref, () => context.current.api(), []);

    return (
        <OrderLineContext.Provider value={context.current}>
            {children}
        </OrderLineContext.Provider>
    )
});