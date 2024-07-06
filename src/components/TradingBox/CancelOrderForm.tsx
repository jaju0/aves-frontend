import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { orderCancelationMutation } from "../../queries";

export interface CancelOrderFormProps
{
    orderId: string;
}

export function CancelOrderForm(props: CancelOrderFormProps)
{
    const cancelOrderMutation = useMutation(orderCancelationMutation);

    const formik = useFormik({
        initialValues: {},
        onSubmit: () => {
            cancelOrderMutation.mutateAsync(props);
        }
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            { cancelOrderMutation.isPending &&
                <div className="px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500"></div>
            }
            { !cancelOrderMutation.isPending &&
                <button type="submit" className="transition duration-150 ease-in-out delay-100 px-4 py-1 rounded-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">Cancel</button>
            }
        </form>
    );
}