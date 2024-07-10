import EventEmitter from "events";

export const websocketEventTopic = ["order", "position"] as const;
export type WebsocketEventTopic = typeof websocketEventTopic[number];

export const orderType = ["Market", "Limit", "Stop"] as const;
export type OrderType = typeof orderType[number];

export const orderSide = ["Buy", "Sell"] as const;
export type OrderSide = typeof orderSide[number];

export const orderStatus = ["New", "Pending", "Execute", "Executed", "Failed"] as const;
export type OrderStatus = typeof orderStatus[number];

export const positionSide = ["None", "Long", "Short"] as const;
export type PositionSide = typeof positionSide[number];

export interface OrderEventData
{
    id: string;
    ownerId: string;
    status: OrderStatus;
    type: OrderType;
    side: OrderSide;
    symbol1: string;
    symbol2: string;
    symbol1BaseQty: string;
    symbol2BaseQty: string;
    quoteQty?: string;
    symbol1EntryPrice?: string;
    symbol2EntryPrice?: string;
    regressionSlope: string;
    takeProfit?: string;
    stopLoss?: string;
}

export interface PositionEventData
{
    id: string;
    ownerId: string;
    side: PositionSide;
    symbol1: string;
    symbol2: string;
    symbol1EntryPrice: string;
    symbol2EntryPrice: string;
    symbol1BaseQty: string;
    symbol2BaseQty: string;
    lastPnl: string;
    regressionSlope: string;
    takeProfit?: string;
    stopLoss?: string;
    open: boolean;
}

export interface WebsocketEvent<DataType>
{
    topic: WebsocketEventTopic;
    data: DataType;
}

export class WSDataFeed extends EventEmitter<{
    order: [WebsocketEvent<OrderEventData>],
    position: [WebsocketEvent<PositionEventData>],
}>
{
    private host: string;
    private token: string;
    private socket?: WebSocket;

    private isShuttingDown: boolean;
    private reconnectTimeoutMs: number;

    constructor(token: string)
    {
        super();
        this.host = "ws://localhost:4000/v1/ws";
        this.token = token;
        this.isShuttingDown = false;
        this.reconnectTimeoutMs = 5000;

        this.connect();
    }

    public shutdown()
    {
        this.isShuttingDown = true;
        this.removeAllListeners();
        this.socket?.close();
    }

    private connect()
    {
        this.socket = new WebSocket(this.host + `?token=${this.token}`);
        this.socket.addEventListener("open", this.onOpen.bind(this));
        this.socket.addEventListener("close", this.onClose.bind(this));
        this.socket.addEventListener("error", this.onError.bind(this));
        this.socket.addEventListener("message", this.onMessage.bind(this));
    }

    private onOpen()
    {
        this.subscribeToAll();
    }

    private onClose(ev: CloseEvent)
    {
        ev; // ignore unused

        this.socket?.removeEventListener("open", this.onOpen.bind(this));
        this.socket?.removeEventListener("close", this.onClose.bind(this));
        this.socket?.removeEventListener("error", this.onError.bind(this));
        this.socket?.removeEventListener("message", this.onMessage.bind(this));

        if(this.isShuttingDown)
            return;

        console.log(`Websocket is closed. Reconnect will be attempted in ${this.reconnectTimeoutMs / 1000} second(s).`);
        setTimeout(this.connect.bind(this), this.reconnectTimeoutMs);
    }

    private onError()
    {
        this.socket?.close();
    }

    private onMessage(ev: MessageEvent<any>)
    {
        const data = ev.data;
        try
        {
            const message = JSON.parse(data) as WebsocketEvent<any>;
            if(message.topic === "order")
                this.emit("order", message);
            else if(message.topic === "position")
                this.emit("position", message);
        }
        catch(error)
        {
            console.error(error);
        }
    }

    private subscribeToAll()
    {
        const subscribeMessage = {
            op: "subscribe",
            args: ["order", "position"],
        };

        this.socket?.send(JSON.stringify(subscribeMessage));
    }
}