import { app, BrowserWindow } from "electron";
import { Menu, nativeImage , Tray} from "electron";
import * as os from "os";
import * as path from "path";
let tray: Electron.Tray;
let mainWindow: Electron.BrowserWindow;
import * as Storage from "electron-json-storage";
import {Promise} from "es6-promise";
import { Base64Icon as Base64Icon } from "./icons";



const dataPath = Storage.getDataPath();
console.log(`electron-json-storage data-path: ${dataPath}`);

const showWindow = () => {
    const trayPos = tray.getBounds();
    const windowPos = mainWindow.getBounds();
    let x = 0;
    let y = 0;
    console.log(`process.platform: ${process.platform}`) ;
    if (process.platform === "darwin") {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        y = Math.round(trayPos.y + trayPos.height);
    } else {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        y = Math.round(trayPos.y + trayPos.height * 10);
    }

    mainWindow.setPosition(x, y, false);
    mainWindow.show();
    mainWindow.focus();
};


const toggleWindow = () => {
    console.log(`mainWindow.isVisible(): ${mainWindow.isVisible()}`);
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        showWindow();
    }
};

function createTray() {
    const icon = nativeImage.createFromDataURL(Base64Icon);
    tray = new Tray(icon);

    // Add a click handler so that when the user clicks on the menubar icon, it shows
    // our popup window
    tray.on("click", (event) => {
        toggleWindow();
        console.log(`event.metaKey: ${event.metaKey}`);
        // Show devtools when command clicked
        // if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
        //     mainWindow.webContents.openDevTools({mode: "undocked"});
        // }
    });

}

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
    height: 300,
    resizable: false,
    show: false,
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));


  // Open the DevTools.
  console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === "development")  {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });



  const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: "Edit",
            submenu: [
                {role: "undo"},
                {role: "redo"},
                {type: "separator"},
                {role: "cut"},
                {role: "copy"},
                {role: "paste"},
                {role: "pasteandmatchstyle"},
                {role: "delete"},
                {role: "selectall"},
            ],
        },
        {
            label: "View",
            submenu: [
                {role: "reload"},
                {role: "forcereload"},
                {role: "toggledevtools"},
                {type: "separator"},
                {role: "resetzoom"},
                {role: "zoomin"},
                {role: "zoomout"},
                {type: "separator"},
                {role: "togglefullscreen"},
            ],
        },
        {
            role: "window",
            submenu: [
                {role: "minimize"},
                {role: "close"},
            ],
        },
        {
            role: "help",
            submenu: [
                {
                    label: "Learn More",
                    click() { require("electron").shell.openExternal("https://electronjs.org"); },
                },
            ],
        },
    ];

  if (process.platform === "darwin") {
        template.unshift({
            label: app.getName(),
            submenu: [
                {role: "about"},
                {type: "separator"},
                {role: "services", submenu: []},
                {type: "separator"},
                {role: "hide"},
                {role: "hideothers"},
                {role: "unhide"},
                {type: "separator"},
                {role: "quit"},
            ],
        });

        // Edit menu
        const editSubmenu = template[1].submenu;
        if ( editSubmenu instanceof Array ) {
            editSubmenu.push(
                {type: "separator"},
                {
                    label: "Speech",
                    submenu: [
                        {role: "startspeaking"},
                        {role: "stopspeaking"},
                    ],
                },
            );
        }

        // Window menu
        template[3].submenu = [
            {role: "close"},
            {role: "minimize"},
            {role: "zoom"},
            {type: "separator"},
            {role: "front"},
        ];
    }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createTray();
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q

  if (os.platform() !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();

  }
});


// menu setup



// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.



import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;

import {ipcMain} from "electron";
import {
    APP_CONNECTION_STATUS, DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRED,
    DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRING_REQUIRED,
    EVENT_CONNECTION_FAILURE,
    EVENT_DESKTOP_TO_MOBILE,
    EVENT_INIT_CONNECTION,
    EVENT_MOBILE_TO_DESKTOP,
    EVENT_OPEN_QR_CODE,
    EVENT_SERVER_TO_DESKTOP,
    INVALID_TOKEN,
    MOBILE_CONNECTION_LOST,
    MOBILE_CONNECTION_SUCCESS,
    MOBILE_IS_FOREGROUND,
    MOBILE_TO_BACKGROUND,
} from "./constants";

import axios, {AxiosResponse} from "axios";
import {IApiEnvironmentEnum, IConnection, IConnectionStatus, IMessage} from "./types";

let socket: Socket;
ipcMain.on(EVENT_DESKTOP_TO_MOBILE, (event: Electron.Event, msgs: [IMessage] ) => {
    console.debug("main event_desktop_to_mobile msgs:", msgs);
    socket.emit(EVENT_DESKTOP_TO_MOBILE, msgs );
    event.returnValue = true;
});


const isEmptyObject = (obj: any): boolean => {
    return Object.keys(obj).length === 0;
};

const storageKey = () => {
    return `connection-${appVersion()}`;
};


ipcMain.on(EVENT_INIT_CONNECTION, (event: Electron.Event ) => {

    const k = storageKey();
    Storage.get(k, (error, data) => {
        if (error) {
            throw error;
        }
        if (data != null && !isEmptyObject(data)) {
            mainWindow.webContents.send(APP_CONNECTION_STATUS, IConnectionStatus.ConnectingPrevious );
            setupSocketForConnection(data as IConnection);
        } else {
            initializeConnectionProcess();
        }
        console.log(data);
    });

});

const saveConnection = (conn: IConnection, cb: (error: any) => void)  => {
    Storage.set(storageKey(), conn, cb);
};

const removeSavedConnection = (cb: (error: any) => void) => {
    Storage.remove(storageKey(), cb);
};

/*
ipcMain.on(EVENT_CLOSE_QR_CODE, (event: Electron.Event ) => {
    console.debug("main ${EVENT_CLOSE_QR_CODE}");
    dismissQrCode();
    event.returnValue = true;
});
*/

const dismissQrCode = () => {
    console.log(`dismissQrCode`);
    if (qrWin) {
        qrWin.close();
        qrWin = null;
    }
};


/*
ipcMain.on( SOCKET_CONNECTION_REQUEST, (event: Electron.Event, c: IConnection) => {
    console.debug(`main message SOCKET_CONNECTION_REQUEST: ${SOCKET_CONNECTION_REQUEST}:`, c);
    connectSocketRequest(event, c);
});
*/
const setupSocketForConnection = (c: IConnection) => {
    console.debug(" • setupSocketForConnection: ", c);
    const uri = `${c.scheme}://${c.host}/desktop/${c.version}?client_type=desktop&token=${c.token}`;
    socket = io.connect(uri);
    appConnection = c;

    socket.on("error", (error) => {
        console.log(error);
    });

    socket.on("connect_timeout", (timeout: number) => {
        console.log(`connect_timeout: ${timeout}`);
        failAndInitializeConnectionProcess();
    });

    socket.on("connect", () => {
        console.debug(`main socket connect to server: SUCCESS, socket.connected: ${socket.connected}`);
        mainWindow.webContents.send(APP_CONNECTION_STATUS, IConnectionStatus.Connected );

        socket.on(EVENT_SERVER_TO_DESKTOP, (msgs: IMessage[]) => {
            const msg = msgs[0];
            console.log(`${EVENT_SERVER_TO_DESKTOP}`, msg.name);
            if (msg.name === EVENT_CONNECTION_FAILURE ) {
                if (msgs[0].dataString === INVALID_TOKEN) {
                    mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.Connecting);
                    removeSavedConnection(() => {
                        initializeConnectionProcess();
                    });
                } else {
                    mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.DesktopConnectionLost);
                }
            }

            if (msgs[0].name === MOBILE_CONNECTION_LOST ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.MobileConnectionLost );
                openQrCodeDialogue(appConnection);
            }

            if (msgs[0].name === DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRING_REQUIRED ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.DesktopConnectionSuccessIpadPairingRequired );
                openQrCodeDialogue(appConnection);
            }

            if (msgs[0].name === DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRED ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.DesktopConnectionSuccessIpadPaired );
            }

        });

        socket.on(EVENT_MOBILE_TO_DESKTOP, (data: any) => {
            console.log(` •EVENT_MOBILE_TO_DESKTOP: ${EVENT_MOBILE_TO_DESKTOP} : `, data);
            // console.log(`${EVENT_MOBILE_TO_DESKTOP} > connection_success,  time to dismiss qr code`);

            if ( data[0].name === MOBILE_TO_BACKGROUND ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.MobileToBackground );
            }
            if ( data[0].name === MOBILE_IS_FOREGROUND ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.MobileIsForeground );
            }
            if ( data[0].name === MOBILE_CONNECTION_SUCCESS ) {
                console.log(` • EVENT_MOBILE_TO_DESKTOP MOBILE_CONNECTION_SUCCESS , time to: dismissQrCode()`);
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.PairingSuccess );
                dismissQrCode();
            }
        });

        socket.on("reconnect", () => {
            console.log("reconnect fired!");
            mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.Reconnected );
        });

        socket.on("disconnect", (reason: string) => {
            console.log("disconnect, reason: ", reason);
            mainWindow.webContents.send(APP_CONNECTION_STATUS, IConnectionStatus.Disconnected );
        });

    });

};


const delay = (ms: number) => {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
};


const appVersion = (): string => {
    const pjson = require("../package.json");
    return pjson.version;
};

let appConnection: IConnection;

const initializeConnectionProcess = () => {
    initializeConnection((conn: IConnection) => {
        saveConnection(conn, () => {
            setupSocketForConnection(conn);
        });
    });
};

const initializeConnection = (success: (con: IConnection) => void ) => {
    console.log(`Renderer initializeConnection: connectionUrl: ${connectionUrl()}`);
    mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.Connecting );
    delay(1000).then(() => {
        axios.post(connectionUrl(), { version: appVersion() })
            .then((response: AxiosResponse<IConnection>) => {
                console.info(`Renderer initializeConnection success:`, response.data);
                console.log(`Renderer initializeConnection response.headers:`, response.headers);
                // connectSocket(response.data as IConnection);
                success(response.data as IConnection);
            }).catch((reason) => {
            console.error(reason);
            failAndInitializeConnectionProcess();
        });
    });
};

const failAndInitializeConnectionProcess = () => {
    mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.Failed );
    delay(3000).then(() => {
        mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.Reconnecting );
        initializeConnectionProcess();
    });
};

// import electron = require("electron");
// import { BrowserWindow } from "electron";

let qrWin: BrowserWindow = null;

const openQrCodeDialogue = (conn: IConnection): void => {
    console.log(`openQrCodeDialogue` , conn);
    if (qrWin) {
        console.log(`qrWin: ${qrWin} && qrWin.isFocused(): ${qrWin.isFocused()}`);
        return;
    }
    const params = `scheme=${conn.scheme}&version=${conn.version}&host=${conn.host}&token=${conn.token}`;
    const modalPath = path.join(`file://${__dirname}/qr.html?${params}`);
    console.log(`modalPath: ${modalPath}`);
    // const ElectronBrowserWindow = electron.BrowserWindow;
    qrWin = new BrowserWindow({
        alwaysOnTop: true,
        frame: true,
        height: 300 ,
        resizable: false,
        show: false,
        width: 300,
    });
    qrWin.on("close", () => { qrWin = null; });
    qrWin.loadURL(modalPath);
    qrWin.show();
    // myObservable.next(IConnectionStatus.PairingInProgress);
    mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.PairingInProgress );
};


const environmeent = (): IApiEnvironmentEnum =>  {
    if (process.env.NODE_ENV === "production") {
        return IApiEnvironmentEnum.Production;
    } else if (process.env.NODE_ENV === "staging") {
        return IApiEnvironmentEnum.Staging;
    } else {
        // return IApiEnvironmentEnum.Staging;
        return IApiEnvironmentEnum.Development;
    }
};


const connectionUrl = (): string => {
    switch (environmeent()) {
        case IApiEnvironmentEnum.Production:
            return "https://api-production.easydisplay.info/api/v1/connection";
        case IApiEnvironmentEnum.Staging:
            return "https://api-staging.easydisplay.info/api/v1/connection";
        case IApiEnvironmentEnum.Development:
            return "http://macbook-air.duckdns.org:9000/api/v1/connection";
    }
};







