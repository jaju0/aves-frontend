//https://github.com/tradingview/lightweight-charts/blob/master/plugin-examples/src/helpers/dimensions/common.ts

export interface BitmapPositionLength {
	/** coordinate for use with a bitmap rendering scope */
	position: number;
	/** length for use with a bitmap rendering scope */
	length: number;
}

export class Rectangle
{
	public top: number;
	public left: number;
	public width: number;
	public height: number;

	constructor()
	{
		this.top = 0;
		this.left = 0;
		this.width = 0;
		this.height = 0;
	}

	public containsPoint(x: number, y: number)
	{
    	return (
			x < this.left+this.width && x > this.left &&
            y < this.top+this.height && y > this.top
		);
	}
}