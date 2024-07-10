import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryFunctionsWithAuth } from "../../hooks/useQueryFunctionsWithAuth";

export interface AddPositionStopLossFormData
{
    stopLoss: string;
}

export interface AddPositionStopLossFormProps
{
    symbol1: string;
    symbol2: string;
}

export function AddPositionStopLossForm(props: AddPositionStopLossFormProps)
{
    const queryFunctionsWithAuth = useQueryFunctionsWithAuth();
    const amendPositionMutation = useMutation(queryFunctionsWithAuth.amendPositionMutation);

    const formik = useFormik({
        initialValues: {
            stopLoss: "",
        },
        validationSchema: Yup.object({
            stopLoss: Yup.number().required(),
        }),
        onSubmit: values => {
            amendPositionMutation.mutateAsync({
                symbol1: props.symbol1,
                symbol2: props.symbol2,
                stopLoss: values.stopLoss,
            });
        }
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <input
                type="text"
                className={`w-24 bg-transparent outline-0 border-0 border-b-2 ${formik.touched.stopLoss && formik.errors.stopLoss ? "border-red-400" : "border-zinc-400"}`}
                {...formik.getFieldProps("stopLoss")}
            />

            { amendPositionMutation.isPending &&
                <div className="px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500"></div>
            }
            { !amendPositionMutation.isPending &&
                <button type="submit" className="transition duration-150 ease-in-out delay-100 px-4 py-1 rounded-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">Add</button>
            }
        </form>
    );
}