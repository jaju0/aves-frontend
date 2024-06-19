import { KlineIntervalV3 } from "bybit-api";
import { createContext, useEffect, useState } from "react";
import { PairSearchForm } from "../../components/PairSearchForm";
import { SpreadChartWithControl } from "../../components/SpreadChartWithControl";

export interface SymbolPair
{
    symbol1: string;
    symbol2: string;
    interval: KlineIntervalV3;
}

export const SymbolPairContext = createContext<[SymbolPair, React.Dispatch<React.SetStateAction<SymbolPair>>]>({} as [SymbolPair, React.Dispatch<React.SetStateAction<SymbolPair>>]);

export function ChartPage()
{
    const localSymbolPair = JSON.parse(localStorage.getItem("symbolPair") ?? "{}");
    const [symbolPair, setSymbolPair] = useState<SymbolPair>(localSymbolPair);

    useEffect(() => {
        localStorage.setItem("symbolPair", JSON.stringify(symbolPair));
    }, [symbolPair]);

    return (
        <SymbolPairContext.Provider value={[symbolPair, setSymbolPair]}>
            <div className="h-full">
                <div className="h-full grid grid-rows-12 grid-cols-4 gap-1 px-5">
                    <div className="row-span-1 col-span-4">
                        <PairSearchForm />
                    </div>
                    <SpreadChartWithControl />
                </div>
            </div>
        </SymbolPairContext.Provider>
    );
}

