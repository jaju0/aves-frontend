import { useEffect } from "react";
import { KlineIntervalV3 } from "bybit-api";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PairData } from "../../provider/QueriesWithAuthProvider/datatypes";
import { useQueryFunctionsWithAuth } from "../../hooks/useQueryFunctionsWithAuth";

export interface StatusForm
{
    isRunning: boolean;
}

function intervalToString(interval: KlineIntervalV3)
{
    switch(interval)
    {
        case "1": return "1 min";
        case "3": return "3 mins";
        case "5": return "5 mins";
        case "15": return "15 mins";
        case "30": return "30 mins";
        case "60": return "1 hour";
        case "120": return "2 hours";
        case "240": return "4 hours";
        case "360": return "6 hours";
        case "720": return "12 hours";
        case "D": return "1 day";
        case "W": return "1 week";
        case "M": return "1 month";
        default: return interval;
    }
}

export function PairsPage()
{
    const navigate = useNavigate();
    const queryFunctionsWithAuth = useQueryFunctionsWithAuth();
    const pairListQuery = useQuery(queryFunctionsWithAuth.pairListQuery);
    const pairFinderStatusQuery = useQuery(queryFunctionsWithAuth.pairFinderStatusQuery);
    const startPairFinderMutation = useMutation(queryFunctionsWithAuth.startPairFinderMutation);
    const stopPairFinderMutation = useMutation(queryFunctionsWithAuth.stopPairFinderMutation);

    console.log("reload");

    const statusForm = useFormik<StatusForm>({
        initialValues: {
            isRunning: pairFinderStatusQuery.data ? pairFinderStatusQuery.data.isRunning : false,
        },
        validationSchema: Yup.object({
            isRunning: Yup.boolean(),
        }),
        onSubmit: values => {
            if(values.isRunning)
                startPairFinderMutation.mutateAsync();
            else
                stopPairFinderMutation.mutateAsync();
        },
    });

    useEffect(() => {
        if(pairFinderStatusQuery.data)
            statusForm.setFieldValue("isRunning", pairFinderStatusQuery.data.isRunning);
    }, [pairFinderStatusQuery.data]);

    const pairClicked = (ev: React.MouseEvent<HTMLTableRowElement, MouseEvent>, data: PairData) => {
        ev.preventDefault();

        const symbolPair = {
            symbol1: data.symbol1,
            symbol2: data.symbol2,
            interval: data.interval,
            isValid: true,
        };

        localStorage.setItem("symbolPair", JSON.stringify(symbolPair));
        navigate("/chart");
    }

    return (
        <div>
            <form onSubmit={statusForm.handleSubmit}>
                <div className="text-center">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            {...statusForm.getFieldProps("isRunning")}
                            checked={statusForm.values.isRunning}
                            onClick={() => statusForm.submitForm()}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </form>
            <table className="w-auto min-w-full text-left whitespace-nowrap border-separate border-spacing-y-0 mx-auto">
                <thead>
                    <th>Symbol 1</th>
                    <th>Symbol 2</th>
                    <th>Interval</th>
                    <th>Hedge Ratio</th>
                    <th>T-Statistic</th>
                    <th>Lag</th>
                    <th>Half Life</th>
                    <th>Time</th>
                </thead>
                <tbody>
                    { pairListQuery.data?.map(data => (
                        <tr onClick={ev => pairClicked(ev, data)} className="transition ease-in-out delay-150 cursor-pointer hover:bg-zinc-800">
                            <td className="pe-3">{data.symbol1}</td>
                            <td className="pe-3">{data.symbol2}</td>
                            <td className="pe-3">{intervalToString(data.interval)}</td>
                            <td className="pe-3">{data.slope.toPrecision(4)}</td>
                            <td className="pe-3">{data.tstat.toPrecision(4)}</td>
                            <td className="pe-3">{data.lag}</td>
                            <td className="pe-3">{data.half_life.toPrecision(4)}</td>
                            <td className="pe-3">{new Date(data.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}