import { useContext, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SymbolPairContext } from "../../pages/ChartPage";
import { ChartDataContext, SpreadDataFeedContext } from "../SpreadChartWithControl";
import { orderSubmitionMutation } from "../../queries";

export interface OrderSubmitionFormData
{
    type: "Market" | "Limit" | "Stop";
    side: "Buy" | "Sell";
    hedgeRatio: string;
    qty: string;
    entry: string;
    takeProfit: string;
    stopLoss: string;
    qtyType: "QuoteQty" | "BaseQty";
}

export function OrderSubmitionForm()
{
    const [symbolPair] = useContext(SymbolPairContext);
    const [chartData] = useContext(ChartDataContext);
    const spreadDataFeed = useContext(SpreadDataFeedContext);
    const submitOrderMutation = useMutation(orderSubmitionMutation);

    const formik = useFormik<OrderSubmitionFormData>({
        initialValues: {
            type: "Market",
            side: "Buy",
            hedgeRatio: "",
            qty: "",
            entry: "",
            takeProfit: "",
            stopLoss: "",
            qtyType: "QuoteQty",
        },
        validationSchema: Yup.object({
            type: Yup.string().oneOf(["Market", "Limit", "Stop"]).required("Mandatory Field"),
            side: Yup.string().oneOf(["Buy", "Sell"]).required("Mandatory Field"),
            hedgeRatio: Yup.number().required("Mandatory Field"),
            qty: Yup.number().required("Mandatory Field"),
            entry: Yup.number().when("type", {
                is: (val: string) => val === "Limit" || val === "Stop",
                then: schema => schema.required(),
                otherwise: schema => schema.optional(),
            }),
            takeProfit: Yup.number().optional(),
            stopLoss: Yup.number().optional(),
            qtyType: Yup.string().oneOf(["QuoteQty", "BaseQty"]).required("Mandatory Field"),
        }),
        onSubmit: values => {
            if(chartData?.statistics === undefined)
            {
                console.error("Cannot submit order: chart data statistics is undefined.");
                return;
            }

            const symbol2LatestPrice = spreadDataFeed.getLatestPriceOfSymbol2();
            const slope = chartData.statistics.hedgeRatio;
            if(symbol2LatestPrice === undefined)
            {
                console.error("Cannot submit order: symbol2LatestPrice is undefined");
                return;
            }

            const entryResidual = values.entry === "" ? undefined : +values.entry;
            const symbol1Price = entryResidual === undefined ? undefined : slope * symbol2LatestPrice + +values.entry;

            const takeProfitResidual = values.takeProfit === "" ? undefined : +values.takeProfit;
            const stopLossResidual = values.stopLoss === "" ? undefined : +values.stopLoss;

            const takeProfit = takeProfitResidual && entryResidual ? takeProfitResidual - entryResidual : undefined;
            const stopLoss = stopLossResidual && entryResidual ? stopLossResidual - entryResidual : undefined;

            submitOrderMutation.mutateAsync({
                type: values.type,
                side: values.side,
                symbol1: symbolPair.symbol1,
                symbol2: symbolPair.symbol2,
                regressionSlope: values.hedgeRatio === "" ? chartData.statistics.hedgeRatio : +values.hedgeRatio,
                symbol1EntryPrice: symbol1Price,
                symbol2EntryPrice: symbol1Price === undefined ? undefined : symbol2LatestPrice,
                baseQty: values.qtyType === "BaseQty" ? +values.qty : undefined,
                quoteQty: values.qtyType === "QuoteQty" ? +values.qty : undefined,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
            });
        }
    });

    useEffect(() => {
        formik.setFieldValue("hedgeRatio", chartData?.statistics?.hedgeRatio);
    }, [chartData]);

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-12 gap-1">
                <p className="col-span-12 text-xl text-semibold text-center">Submit Order</p>
                <select
                    className="col-span-6 bg-zinc-800 px-4 py-2 focus:outline-0"
                    {...formik.getFieldProps("type")}
                >
                    <option className="bg-zinc-950" value="Market">Market</option>
                    <option className="bg-zinc-950" value="Limit">Limit</option>
                    <option className="bg-zinc-950" value="Stop">Stop</option>
                </select>
                <select
                    className="col-span-6 bg-zinc-800 px-4 py-2 focus:outline-0"
                    {...formik.getFieldProps("side")}
                >
                    <option className="bg-zinc-950" value="Buy">Buy</option>
                    <option className="bg-zinc-950" value="Sell">Sell</option>
                </select>
                <select
                    className="col-span-12 bg-zinc-800 px-4 py-2 focus:outline-0"
                    {...formik.getFieldProps("qtyType")}
                >
                    <option className="bg-zinc-950" value="QuoteQty">Quote Asset Quantity</option>
                    <option className="bg-zinc-950" value="BaseQty">Base Asset Quantity (Symbol 1)</option>
                </select>
                <div className="col-span-12">
                    <input
                        type="number"
                        placeholder="Hedge Ratio"
                        className={
                            `col-span-11 block w-full bg-zinc-800 px-4 py-2 focus:outline-0 ` +
                            `${formik.touched.hedgeRatio && formik.errors.hedgeRatio ? "border border-1 border-red-500" : ""}`
                        }
                        {...formik.getFieldProps("hedgeRatio")}
                    />
                    { formik.touched.hedgeRatio && formik.errors.hedgeRatio &&
                        <span className="text-red-500">* {formik.errors.hedgeRatio}</span>
                    }
                </div>
                <div className="col-span-12">
                    <input
                        type="number"
                        placeholder="Quantity"
                        className={
                            `col-span-11 block w-full bg-zinc-800 px-4 py-2 focus:outline-0 ` +
                            `${formik.touched.qty && formik.errors.qty ? "border border-1 border-red-500" : ""}`
                        }
                        {...formik.getFieldProps("qty")}
                    />
                    { formik.touched.qty && formik.errors.qty &&
                        <span className="text-red-500">* {formik.errors.qty}</span>
                    }
                </div>
                <div className="col-span-12">
                    <input
                        type="number"
                        placeholder="Entry"
                        className={
                            `block w-full bg-zinc-800 px-4 py-2 focus:outline-0 ` +
                            `${formik.touched.entry && formik.errors.entry ? "border border-1 border-red-500" : ""}`
                        }
                        {...formik.getFieldProps("entry")}
                    />
                    { formik.touched.entry && formik.errors.entry &&
                        <span className="text-red-500">* {formik.errors.qty}</span>
                    }
                </div>
                <div className="col-span-12">
                    <input
                        type="number"
                        placeholder="Take Profit"
                        className="block w-full bg-zinc-800 px-4 py-2 focus:outline-0"
                        {...formik.getFieldProps("takeProfit")}
                    />
                </div>
                <div className="col-span-12">
                    <input
                        type="number"
                        placeholder="Stop Loss"
                        className="block w-full bg-zinc-800 px-4 py-2 focus:outline-0"
                        {...formik.getFieldProps("stopLoss")}
                    />
                </div>
                <div className="col-span-12">
                    <button type="submit" className="transition duration-150 ease-in-out delay-100 block w-full px-4 py-1 rounded-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">submit</button>
                </div>
            </div>
        </form>
    );
}