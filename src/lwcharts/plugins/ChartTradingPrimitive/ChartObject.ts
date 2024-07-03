import { Rectangle } from "../../helpers/dimensions/common";

export const chartObjectOwnerType = ["order", "position"] as const;
export type ChartObjectOwnerType = typeof chartObjectOwnerType[number];

export const chartObjectType = ["close", "move", "tp-close", "tp-move", "sl-close", "sl-move"] as const;
export type ChartObjectType = typeof chartObjectType[number];

export class ChartObject
{
    private ownerType: ChartObjectOwnerType;
    private ownerId: string;
    private id: string;
    private type: ChartObjectType;
    private rect: Rectangle;

    constructor(ownerType: ChartObjectOwnerType, ownerId: string, objectType: ChartObjectType, rect?: Rectangle)
    {
        this.ownerType = ownerType;
        this.ownerId = ownerId;
        this.id = crypto.randomUUID();
        this.type = objectType;
        this.rect = rect ?? new Rectangle();
    }

    public get OwnerType()
    {
        return this.ownerType;
    }

    public get OwnerId()
    {
        return this.ownerId;
    }

    public get Id()
    {
        return this.id;
    }

    public get Type()
    {
        return this.type;
    }

    public get Rect()
    {
        return this.rect;
    }

    public set Rect(rect: Rectangle)
    {
        this.rect = rect;
    }
}