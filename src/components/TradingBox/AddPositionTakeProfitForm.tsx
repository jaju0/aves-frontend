import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { positionAmendmentMutation } from "../../queries";

export interface AddPositionTakeProfitFormData
{
    takeProfit: string;
}

export interface AddPositionTakeProfitFormProps
{
    symbol1: string;
    symbol2: string;
}

export function AddPositionTakeProfitForm(props: AddPositionTakeProfitFormProps)
{
    const amendPositionMutation = useMutation(positionAmendmentMutation);

    const formik = useFormik({
        initialValues: {
            takeProfit: "",
        },
        validationSchema: Yup.object({
            takeProfit: Yup.number().required(),
        }),
        onSubmit: values => {
            amendPositionMutation.mutateAsync({
                symbol1: props.symbol1,
                symbol2: props.symbol2,
                takeProfit: values.takeProfit,
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

            { amendPositionMutation.isPending &&
                <div className="px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500"></div>
            }
            { !amendPositionMutation.isPending &&
                <button type="submit" className="transition duration-150 ease-in-out delay-100 px-4 py-1 rounded-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">Add</button>
            }
        </form>
    );
}