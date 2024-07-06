import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { orderAmendmentMutation } from "../../queries";

export interface AddOrderStopLossFormData
{
    stopLoss: string;
}

export interface AddOrderStopLossProps
{
    orderId: string;
}

export function AddOrderStopLossForm(props: AddOrderStopLossProps)
{
    const amendOrderMutation = useMutation(orderAmendmentMutation);

    const formik = useFormik<AddOrderStopLossFormData>({
        initialValues: {
            stopLoss: "",
        },
        validationSchema: Yup.object({
            stopLoss: Yup.number().required(),
        }),
        onSubmit: values => {
            amendOrderMutation.mutateAsync({
                orderId: props.orderId,
                stopLoss: +values.stopLoss,
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

            { amendOrderMutation.isPending &&
                <div className="px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500"></div>
            }
            { !amendOrderMutation.isPending &&
                <button type="submit" className="transition duration-150 ease-in-out delay-100 px-4 py-1 rounded-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">Add</button>
            }
        </form>
    );
}