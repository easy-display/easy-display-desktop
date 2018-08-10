
export interface IMessage {
    name: string;
    dataString: string;
    dataNumber: number;
}


export interface IConnection {
    scheme: string;
    host: string;
    version: string;
    token: string;
}



export enum IConnectionStatus {
    Starting = "Starting",
    Connecting = "Connecting",
    Connected = "Connected",
    Disconnected = "Disconnected",
    Reconnecting = "Reconnecting",
    Reconnected = "Reconnected",
    PairingInProgress = "PairingInProgress",
    PairingSuccess = "PairingSuccess",
    Failed = "Failed",
    MobileConnectionLost = "mobile_connection_lost",
}
