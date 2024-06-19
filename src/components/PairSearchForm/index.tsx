import { KlineIntervalV3 } from "bybit-api";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { bybitInstrumentInfoQuery } from "../../queries";
import { BybitConnectorsContext } from "../../App";
import { SymbolPairContext } from "../../pages/ChartPage";

export interface PairSearchFormData
{
    symbol1: string;
    symbol2: string;
    interval: KlineIntervalV3;
}

const klineIntervalSet = new Set([
    '1', '3', '5', '15', '30', '60', '120', '240', '360', '720', 'D', 'W', 'M'
]);

export function PairSearchForm()
{
    const bybitConnectors = useContext(BybitConnectorsContext);
    const [symbolPair, setSymbolPair] = useContext(SymbolPairContext);
    const instrumentsInfoQuery = useQuery(bybitInstrumentInfoQuery(bybitConnectors.restClient));

    const formik = useFormik<PairSearchFormData>({
        initialValues: symbolPair,
        validationSchema: Yup.object({
            symbol1: Yup.string().required("Mandatory Field"),
            symbol2: Yup.string().test("symbols-are-unequal", "Symbols must be different", (symbol2, context) => (
                symbol2 !== context.parent.symbol1
            )).required("Mandatory Field"),
            interval: Yup.string().oneOf(Array.from(klineIntervalSet.keys())).required("Mandatory Field"),
        }),
        onSubmit: values => {
            if(values.symbol1 === values.symbol2)
                return;

            if(values.symbol1)
            {
                const foundInstInfo = instrumentsInfoQuery.data?.result.list.find(instrumentInfo => instrumentInfo.symbol === values.symbol1);
                if(!foundInstInfo)
                    return;
            }

            if(values.symbol2)
            {
                const foundInstInfo = instrumentsInfoQuery.data?.result.list.find(instrumentInfo => instrumentInfo.symbol === values.symbol2);
                if(!foundInstInfo)
                    return;
            }

            if(!klineIntervalSet.has(values.interval))
                return;

            setSymbolPair(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-col w-full h-full justify-center">
            <div className="grid grid-cols-4 w-1/2 gap-1">
                { instrumentsInfoQuery.isPending &&
                    <>
                        <input type="text" className="w-full px-4 py-1 bg-zinc-400 animate-pulse" disabled />
                        <input type="text" className="w-full px-4 py-1 bg-zinc-400 animate-pulse" disabled />
                        <input type="text" className="w-full px-4 py-1 bg-zinc-400 animate-pulse" disabled />
                        <input type="text" className="w-full px-4 py-1 bg-zinc-400 rounded-r-full animate-pulse" disabled />
                    </>
                }
                { instrumentsInfoQuery.isSuccess &&
                    <>
                        <input
                            type="text"
                            list="bybit-symbols"
                            placeholder="Symbol 1"
                            className={
                                `box-border bg-transparent px-4 py-1 border-2 focus:outline-0`+
                                `${formik.touched.symbol1 && formik.errors.symbol1 ? "border border-2 border-red-500" : ""}`
                            }
                            {...formik.getFieldProps("symbol1")}
                        />
                        <input
                            type="text"
                            list="bybit-symbols"
                            placeholder="Symbol 2"
                            className={
                                `box-border bg-transparent px-4 py-1 border-2 focus:outline-0`+
                                `${formik.touched.symbol2 && formik.errors.symbol2 ? "border border-2 border-red-500" : ""}`
                            }
                            {...formik.getFieldProps("symbol2")}
                        />
                        <datalist id="bybit-symbols">
                            { instrumentsInfoQuery.data?.result.list.map(instrumentInfo => (
                                <option key={instrumentInfo.symbol} value={instrumentInfo.symbol}>{instrumentInfo.symbol}</option>
                            ))}
                        </datalist>
                        <select
                            className="bg-transparent px-4 py-1 border-2 focus:outline-0"
                            {...formik.getFieldProps("interval")}
                        >
                            <option className="bg-zinc-950" value="1">1 min</option>
                            <option className="bg-zinc-950" value="3">3 mins</option>
                            <option className="bg-zinc-950" value="5">5 mins</option>
                            <option className="bg-zinc-950" value="15">15 mins</option>
                            <option className="bg-zinc-950" value="30">30 mins</option>
                            <option className="bg-zinc-950" value="60">1 hour</option>
                            <option className="bg-zinc-950" value="120">2 hours</option>
                            <option className="bg-zinc-950" value="240">4 hours</option>
                            <option className="bg-zinc-950" value="360">6 hours</option>
                            <option className="bg-zinc-950" value="720">12 hours</option>
                            <option className="bg-zinc-950" value="D">1 day</option>
                            <option className="bg-zinc-950" value="W">1 week</option>
                            <option className="bg-zinc-950" value="M">1 month</option>
                        </select>
                        <button type="submit" className="transition duration-150 ease-in-out delay-100 px-4 py-1 rounded-r-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">Apply</button>
                    </>
                }
            </div>
        </form>
    );
}

// TODO: - add formik validation messages to form elements