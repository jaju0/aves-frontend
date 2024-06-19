import { ReactNode, createContext, useContext, useLayoutEffect, useRef } from "react"
import { CreatePriceLineOptions, IPriceLine } from "lightweight-charts";
import { LineSeriesContext } from "../Series"

export interface PriceLineContextRef
{
    _api?: IPriceLine;
    api(): IPriceLine;
    free(): void;
}

export const PriceLineContext = createContext<PriceLineContextRef>({} as PriceLineContextRef);

export interface PriceLineProps
{
    children?: ReactNode;
}

export function PriceLine(props: PriceLineProps & CreatePriceLineOptions)
{
    const { children, ...options } = props;
    const parent = useContext(LineSeriesContext);

    const context = useRef<PriceLineContextRef>({
        api() {
            if(!this._api)
                this._api = parent.api().createPriceLine(options);

            return this._api;
        },
        free() {
            if(this._api && parent._api)
            {
                parent._api.removePriceLine(this._api);
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
        <PriceLineContext.Provider value={context.current}>
            {children}
        </PriceLineContext.Provider>
    )
}