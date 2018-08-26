
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
    Starting                = "starting",
    Connecting              = "connecting",
    Connected               = "connected",
    Disconnected            = "disconnected",
    Reconnecting            = "reconnecting",
    Reconnected             = "reconnected",
    PairingInProgress       = "pairing-in-progress",
    PairingSuccess          = "pairing-success",
    Failed                  = "failed",
    MobileConnectionLost    = "mobile-connection-lost",
    MobileToBackground      = "mobile-to-background",
    MobileIsForeground      = "mobile-is-foreground",
}
