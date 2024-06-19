import { Coordinate, ISeriesPrimitiveAxisView } from "lightweight-charts";

export interface PriceLabelProps
{
    price: number;
    yCoord: Coordinate | null;
    color: string;
    visible?: boolean;
}

export class PriceLabel implements ISeriesPrimitiveAxisView
{
    private props: PriceLabelProps;
    private price: number;
    private yCoord: Coordinate | null;

    constructor(props: PriceLabelProps)
    {
        this.props = props;
        this.price = this.props.price;
        this.yCoord = this.props.yCoord;
    }

    public updatePrice(price: number, yCoord: Coordinate)
    {
        this.price = price;
        this.yCoord = yCoord;
    }

    public coordinate()
    {
        return this.yCoord ?? 0;
    }

    public text()
    {
        return this.price.toFixed(2).toString();
    }

    public textColor()
    {
        return "white";
    }

    public backColor()
    {
        return this.props.color;
    }

    public visible()
    {
        return this.props.visible ?? true;
    }

    public tickVisible()
    {
        return this.props.visible ?? true;
    }
}