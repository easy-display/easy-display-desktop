

export enum IApiEnvironmentEnum {
    Development  = "development",
    Staging      = "staging",
    Production   = "production",
}

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
    Starting                    = "starting",
    Connecting                  = "connecting",
    ConnectingPrevious          = "connecting-previous",
    Connected                   = "connected",
    Disconnected                = "disconnected",
    Reconnecting                = "reconnecting",
    Reconnected                 = "reconnected",
    PairingRequired             = "pairing-required",
    PairingInProgress           = "pairing-in-progress",
    PairingSuccess              = "pairing-success",
    Failed                      = "failed",
    DesktopConnectionLost       = "desktop-connection-lost",
    DesktopConnectionSuccessIpadPairingRequired    = "desktop-connection-success-ipad-pairing-required",
    DesktopConnectionSuccessIpadPaired    = "desktop-connection-success-ipad-paired",
    MobileConnectionLost        = "mobile-connection-lost",
    MobileToBackground          = "mobile-to-background",
    MobileIsForeground          = "mobile-is-foreground",
}



