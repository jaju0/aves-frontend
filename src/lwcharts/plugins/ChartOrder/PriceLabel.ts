import { Coordinate, ISeriesApi, ISeriesPrimitiveAxisView, SeriesOptionsMap } from "lightweight-charts";
import colors from "tailwindcss/colors";

export interface PriceLabelProps
{
    price: number;
    series: ISeriesApi<keyof SeriesOptionsMap>;
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
        this.yCoord = this.props.series.priceToCoordinate(this.price);
    }

    public updatePrice(newPrice: number)
    {
        this.price = newPrice;
        this.yCoord = this.props.series.priceToCoordinate(this.price);
    }

    public coordinate(): number
    {
        return this.yCoord ?? 0;
    }

    public text()
    {
        return this.price.toFixed(2).toString();
    }

    public textColor()
    {
        return colors.white;
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