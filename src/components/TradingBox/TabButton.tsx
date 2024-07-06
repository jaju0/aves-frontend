import { ReactNode } from "react";

export interface TabButtonProps
{
    name: string;
    selected: string;
    children?: ReactNode;
    onClick?: () => void;
}

export function TabButton({ name, selected, children, onClick }: TabButtonProps)
{
    const clickHandler = (ev: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        ev.preventDefault();

        if(name === selected)
            return;

        if(onClick)
            onClick();
    }

    return (
        <span onClick={clickHandler} className={`${ name === selected ? "border-b-2 border-yellow-500" : "transition ease-in-out delay-150 cursor-pointer hover:text-zinc-200"}`}>
            {children}
        </span>
    );
}