import { ReactNode, useCallback, useState } from "react";
import { ChartContainer } from "./ChartContainer";
import { DeepPartial, TimeChartOptions } from "lightweight-charts";

export interface ChartProps
{
    children?: ReactNode;
}

export function Chart(props: ChartProps & DeepPartial<TimeChartOptions>)
{
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const handleRef = useCallback((ref: HTMLDivElement | null) => setContainer(ref), []);

    return (
        <div ref={handleRef} className="w-full h-full">
            { container !== null && <ChartContainer {...props} container={container} /> }
        </div>
    )
}