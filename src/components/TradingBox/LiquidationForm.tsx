import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { positionLiquidationMutation } from "../../queries";

export interface LiquidationFormProps
{
    symbol1: string;
    symbol2: string;
}

export function LiquidationForm(props: LiquidationFormProps)
{
    const liquidatePositionMutation = useMutation(positionLiquidationMutation);

    const formik = useFormik({
        initialValues: {},
        onSubmit: () => {
            liquidatePositionMutation.mutateAsync(props);
        }
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            { liquidatePositionMutation.isPending &&
                <div className="px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500"></div>
            }
            { !liquidatePositionMutation.isPending &&
                <button type="submit" className="transition duration-150 ease-in-out delay-100 px-4 py-1 rounded-full border-2 hover:bg-white hover:text-zinc-950 cursor-pointer">Liquidate</button>
            }
        </form>
    );
}