import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryFunctionsWithAuth } from "../../hooks/useQueryFunctionsWithAuth";

export interface AddOrderTakeProfitFormData
{
    takeProfit: string;
}

export interface AddOrderTakeProfitFormProps
{
    orderId: string;
}

export function AddOrderTakeProfitForm(props: AddOrderTakeProfitFormProps)
{
    const queryFunctionsWithAuth = useQueryFunctionsWithAuth();
    const amendOrderMutation = useMutation(queryFunctionsWithAuth.amendOrderMutation);

    const formik = useFormik<AddOrderTakeProfitFormData>({
        initialValues: {
            takeProfit: "",
        },
        validationSchema: Yup.object({
            takeProfit: Yup.number().required(),
        }),
        onSubmit: values => {
            amendOrderMutation.mutateAsync({
                orderId: props.orderId,
                takeProfit: +values.takeProfit,
            });
        }
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <input
                type="text"
                className={`w-24 bg-transparent outline-0 border-0 border-b-2 ${formik.touched.takeProfit && formik.errors.takeProfit ? "border-red-400" : "border-zinc-400"}`}
                {...formik.getFieldProps("takeProfit")}
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