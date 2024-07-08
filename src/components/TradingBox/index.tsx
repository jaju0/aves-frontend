import { useState } from "react";
import { TabButton } from "./TabButton";
import { OpenPositionsTab } from "./OpenPositionsTab";
import { OpenOrdersTab } from "./OpenOrdersTab";

export interface TradingBoxState
{
    selectedTab: "OpenOrders" | "OpenPositions";
}

export function TradingBox()
{
    const [state, setState] = useState<TradingBoxState>({
        selectedTab: "OpenPositions",
    });

    const openPositionsTabClicked = () => {
        setState({
            ...state,
            selectedTab: "OpenPositions",
        });
    }

    const openOrdersTabClicked = () => {
        setState({
            ...state,
            selectedTab: "OpenOrders",
        });
    }

    return (
        <div>
            <div className="py-2 border-b-8 border-zinc-600">
                <ul className="flex flex-row">
                    <li className="mx-2">
                        <TabButton onClick={openPositionsTabClicked} name="OpenPositions" selected={state.selectedTab}>
                            Open Positions
                        </TabButton>
                    </li>
                    <li className="mx-2">
                        <TabButton onClick={openOrdersTabClicked} name="OpenOrders" selected={state.selectedTab}>
                            Open Orders
                        </TabButton>
                    </li>
                </ul>
            </div>
            { state.selectedTab === "OpenPositions" &&
                <OpenPositionsTab />
            }
            { state.selectedTab === "OpenOrders" &&
                <OpenOrdersTab />
            }
        </div>
    );
}