import { app, BrowserWindow } from "electron";
import { dialog, Menu , nativeImage, Tray} from "electron";
import * as os from "os";
import * as path from "path";
let tray: Electron.Tray;
let mainWindow: Electron.BrowserWindow;
import * as Storage from "electron-json-storage";
import * as Logger from "electron-log";
import {Promise} from "es6-promise";
import { Base64Icon as Base64Icon } from "./icons";


// hide the dock icon
app.dock.hide();


// Same as for console transport
Logger.transports.file.format = "{h}:{i}:{s}:{ms} {text}";
Logger.transports.file.maxSize = 5 * 1024 * 1024;
Logger.transports.file.level = "verbose";

Logger.silly("silly EasyDislay main");
Logger.verbose("verbose EasyDislay main");
Logger.debug("debug EasyDislay main");
Logger.info("info EasyDislay main");
Logger.warn("warn EasyDislay main");
Logger.error("error EasyDislay main");

const dataPath = Storage.getDataPath();
Logger.debug(`electron-json-storage Storage.getDataPath(): ${dataPath}`);

const showWindow = () => {
    const trayPos = tray.getBounds();
    const windowPos = mainWindow.getBounds();
    let x = 0;
    let y = 0;
    Logger.debug(`process.platform: ${process.platform}`) ;
    if (process.platform === "darwin") {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        y = Math.round(trayPos.y + trayPos.height);
    } else {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        y = Math.round(trayPos.y + trayPos.height * 10);
    }

    mainWindow.setPosition(x, y, false);
    mainWindow.setAlwaysOnTop(true, "floating");
    mainWindow.setVisibleOnAllWorkspaces(true);
    mainWindow.setFullScreenable(false);

    mainWindow.show();
    mainWindow.focus();
};


const toggleWindow = () => {
    Logger.debug(`mainWindow.isVisible(): ${mainWindow.isVisible()}`);
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        showWindow();
    }
};

let optionsWin: BrowserWindow = null;

function createTray() {
    const icon = nativeImage.createFromDataURL(Base64Icon);
    tray = new Tray(icon);

    // Add a click handler so that when the user clicks on the menubar icon, it shows
    // our popup window
    tray.on("click", (event) => {
        toggleWindow();
        Logger.debug(`Tray on click event.metaKey: ${event.metaKey}`);
        // Show devtools when command clicked
        // if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
        //     mainWindow.webContents.openDevTools({mode: "undocked"});
        // }
    });


    tray.on("right-click", (event) => {

        Logger.debug(`Tray on right-click event.metaKey: ${event.metaKey}`);

        if (optionsWin && connectionStatus !== IConnectionStatus.DesktopConnectionSuccessIpadPaired) {
            optionsWin.hide();
            return;
        }

        if (optionsWin && optionsWin.isVisible()) {
            optionsWin.hide();
            return;
        }
        const modalPath = path.join(`file://${__dirname}/options.html`);
        Logger.debug(`options.html modalPath: ${modalPath}`);

        optionsWin = new BrowserWindow({
            alwaysOnTop: true,
            frame: false,
            height: 100 ,
            resizable: false,
            show: false,
            type: "toolbar",
            width: 100,
        });

        const trayPos = tray.getBounds();
        const windowPos = optionsWin.getBounds();
        let x = 0;
        let y = 0;
        Logger.debug(`process.platform: ${process.platform}`) ;
        if (process.platform === "darwin") {
            x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
            y = Math.round(trayPos.y + trayPos.height);
        } else {
            x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
            y = Math.round(trayPos.y + trayPos.height * 10);
        }

        optionsWin.setPosition(x, y, false);

        optionsWin.on("close", () => { qrWin = null; });
        optionsWin.loadURL(modalPath);

        optionsWin.setAlwaysOnTop(true, "floating");
        optionsWin.setVisibleOnAllWorkspaces(true);
        optionsWin.setFullScreenable(false);

        optionsWin.show();

    });

}

function createWindow() {

  mainWindow = new BrowserWindow({
    frame: false,
    height: 240,
    // titleBarStyle: "hidden",
    resizable: false,
    show: true,
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));


  // Open the DevTools.
  Logger.debug(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
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
    DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRING_REQUIRED, EVALUATE_JS_ERROR, EVALUATE_JS_OUTPUT,
    EVENT_CONNECTION_FAILURE,
    EVENT_DESKTOP_TO_MOBILE,
    EVENT_INIT_CONNECTION,
    EVENT_MOBILE_TO_DESKTOP,
    EVENT_SERVER_TO_DESKTOP,
    INVALID_TOKEN,
    MOBILE_CONNECTION_LOST,
    MOBILE_CONNECTION_SUCCESS,
    MOBILE_IS_FOREGROUND,
    MOBILE_TO_BACKGROUND,
} from "./constants";

import axios, {AxiosResponse} from "axios";


import {IApiEnvironmentEnum, IConnection, IConnectionStatus, IMessage} from "./types";

let connectionStatus: IConnectionStatus;

let socket: Socket;
ipcMain.on(EVENT_DESKTOP_TO_MOBILE, (event: Electron.Event, msgs: [IMessage] ) => {
    Logger.debug(" • main EVENT_DESKTOP_TO_MOBILE msgs:", msgs);
    socket.emit(EVENT_DESKTOP_TO_MOBILE, msgs );
    event.returnValue = true;
    hideIn5Seconds();
});


const isEmptyObject = (obj: any): boolean => {
    return Object.keys(obj).length === 0;
};

const storageKey = () => {
    return `connection-${appVersion()}`;
};

const updateConnectionStatus = (c: IConnectionStatus) => {
    connectionStatus = c;
    mainWindow.webContents.send(APP_CONNECTION_STATUS, connectionStatus);
};


ipcMain.on(EVENT_INIT_CONNECTION, (event: Electron.Event ) => {
    Logger.debug(`ipcMain.on: EVENT_INIT_CONNECTION`, event);
    Logger.debug(`connectionUrl for environmeent: ${environmeent()}`);
    const k = storageKey();
    Storage.get(k, (error, data) => {
        if (error) {
            throw error;
        }
        if (data != null && !isEmptyObject(data)) {
            updateConnectionStatus(IConnectionStatus.ConnectingPrevious);
            setupSocketForConnection(data as IConnection);
        } else {
            initializeConnectionProcess();
        }
        Logger.debug(data);
    });

});

const saveConnection = (conn: IConnection, cb: (error: any) => void)  => {
    Storage.set(storageKey(), conn, cb);
};

const removeSavedConnection = (cb: (error: any) => void) => {
    Storage.remove(storageKey(), cb);
};


const dismissQrCode = () => {
    Logger.info(`dismissQrCode`);
    if (qrWin) {
        qrWin.close();
        qrWin = null;
    }
};


const setupSocketForConnection = (c: IConnection) => {
    Logger.debug(" • setupSocketForConnection: ", c);
    const uri = `${c.scheme}://${c.host}/desktop/${c.version}?client_type=desktop&token=${c.token}`;
    socket = io.connect(uri);
    appConnection = c;

    socket.on("error", (error: any) => {
        Logger.error(`socket.on error:`, error);
    });

    socket.on("connect_timeout", (timeout: number) => {
        Logger.error(`connect_timeout: ${timeout}`);
        failAndInitializeConnectionProcess();
    });

    socket.on("connect", () => {
        Logger.debug(`main socket connect to server: SUCCESS, socket.connected: ${socket.connected}`);
        updateConnectionStatus(IConnectionStatus.Connected );
        socket.on(EVENT_SERVER_TO_DESKTOP, (msgs: IMessage[]) => {
            const msg = msgs[0];
            Logger.debug(`${EVENT_SERVER_TO_DESKTOP}`, msg.name);
            if (msg.name === EVENT_CONNECTION_FAILURE ) {
                if (msgs[0].dataString === INVALID_TOKEN) {
                    updateConnectionStatus(IConnectionStatus.Connecting );
                    removeSavedConnection(() => {
                        initializeConnectionProcess();
                    });
                } else {
                    updateConnectionStatus(IConnectionStatus.DesktopConnectionLost );
                }
            }

            if (msgs[0].name === MOBILE_CONNECTION_LOST ) {
                updateConnectionStatus(IConnectionStatus.MobileConnectionLost);
                openQrCodeDialogue(appConnection);
            }

            if (msgs[0].name === DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRING_REQUIRED ) {
                updateConnectionStatus(IConnectionStatus.DesktopConnectionSuccessIpadPairingRequired);
                openQrCodeDialogue(appConnection);
            }

            if (msgs[0].name === DESKTOP_CONNECTION_SUCCESS_IPAD_PAIRED ) {
                updateConnectionStatus(IConnectionStatus.DesktopConnectionSuccessIpadPaired);
                hideIn5Seconds();
            }

        });

        socket.on(EVENT_MOBILE_TO_DESKTOP, (data: any) => {
            Logger.log(` • EVENT_MOBILE_TO_DESKTOP: ${EVENT_MOBILE_TO_DESKTOP} : `, data);
            // log(`${EVENT_MOBILE_TO_DESKTOP} > connection_success,  time to dismiss qr code`);

            if ( data[0].name === EVALUATE_JS_ERROR ) {
                dialog.showMessageBox({
                    detail: data[0].dataString,
                    message: "Error:",
                    title: "Exec-JS",
                    type: "error",
                });
            }

            if ( data[0].name === EVALUATE_JS_OUTPUT ) {
                dialog.showMessageBox({
                        detail: data[0].dataString,
                        message: "Output:",
                        title: "Exec-JS",
                        type: "info",
                    });
            }
            if ( data[0].name === MOBILE_TO_BACKGROUND ) {
                updateConnectionStatus(IConnectionStatus.MobileToBackground);
            }
            if ( data[0].name === MOBILE_IS_FOREGROUND ) {
                updateConnectionStatus(IConnectionStatus.MobileIsForeground);
            }
            if ( data[0].name === MOBILE_CONNECTION_SUCCESS ) {
                Logger.debug(` • EVENT_MOBILE_TO_DESKTOP MOBILE_CONNECTION_SUCCESS , time to: dismissQrCode()`);
                updateConnectionStatus(IConnectionStatus.PairingSuccess);
                dismissQrCode();
            }
        });

        socket.on("reconnect", () => {
            Logger.debug("reconnect fired!");
            updateConnectionStatus(IConnectionStatus.Reconnected);
        });

        socket.on("disconnect", (reason: string) => {
            Logger.debug("disconnect, reason: ", reason);
            updateConnectionStatus(IConnectionStatus.Disconnected);
        });

    });

};


const hideIn5Seconds = () => {
    delay(5000).then(() => {
        mainWindow.hide();
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
    Logger.info(`Renderer initializeConnection: ${environmeent()} connectionUrl: ${connectionUrl()}`);
    updateConnectionStatus(IConnectionStatus.Connecting);
    delay(1000).then(() => {
        axios.post(connectionUrl(), { version: appVersion() })
            .then((response: AxiosResponse<IConnection>) => {
                Logger.info(`Renderer initializeConnection success:`, response.data);
                Logger.debug(`Renderer initializeConnection response.headers:`, response.headers);
                // connectSocket(response.data as IConnection);
                success(response.data as IConnection);
            }).catch((reason) => {
            Logger.error(reason);
            failAndInitializeConnectionProcess();
        });
    });
};

const failAndInitializeConnectionProcess = () => {
    updateConnectionStatus(IConnectionStatus.Failed);
    delay(3000).then(() => {
        updateConnectionStatus(IConnectionStatus.Reconnecting);
        initializeConnectionProcess();
    });
};


let qrWin: BrowserWindow = null;

const openQrCodeDialogue = (conn: IConnection): void => {
    Logger.info(`openQrCodeDialogue` , conn);
    if (qrWin) {
        Logger.debug(`qrWin: ${qrWin} && qrWin.isFocused(): ${qrWin.isFocused()}`);
        return;
    }
    const params = `scheme=${conn.scheme}&version=${conn.version}&host=${conn.host}&token=${conn.token}`;
    const modalPath = path.join(`file://${__dirname}/qr.html?${params}`);
    Logger.debug(`modalPath: ${modalPath}`);
    // const ElectronBrowserWindow = electron.BrowserWindow;
    qrWin = new BrowserWindow({
        alwaysOnTop: true,
        frame: false,
        height: 300 ,
        icon: path.join(__dirname, "assets/icons/png/64x64.png"),
        resizable: false,
        show: false,
        width: 300,
    });
    qrWin.on("close", () => { qrWin = null; });
    qrWin.loadURL(modalPath);
    qrWin.show();
    updateConnectionStatus(IConnectionStatus.PairingInProgress);
};


const environmeent = (): IApiEnvironmentEnum =>  {
    if (process.env.NODE_ENV === "development") {
        return IApiEnvironmentEnum.Development;
    } else if (process.env.NODE_ENV === "staging") {
        return IApiEnvironmentEnum.Staging;
    } else {
        return IApiEnvironmentEnum.Production;
    }
};


const connectionUrl = (): string => {
    Logger.info(`connectionUrl for environmeent: ${environmeent()}`);
    switch (environmeent()) {
        case IApiEnvironmentEnum.Production:
            return "https://api-production.easydisplay.info/api/v1/connection";
        case IApiEnvironmentEnum.Staging:
            return "https://api-staging.easydisplay.info/api/v1/connection";
        case IApiEnvironmentEnum.Development:
            return "http://macbook-air.duckdns.org:9000/api/v1/connection";
    }
};







