// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import {IConnection, IConnectionStatus, IMessage} from "./types";

import axios, {AxiosResponse} from "axios";
import electron = require("electron");
import {Promise} from "es6-promise";
import * as path from "path";
import {Subject} from "rxjs";
import {APP_CONNECTION_STATUS, EVENT_DESKTOP_TO_MOBILE, SOCKET_CONNECTION_REQUEST} from "./constants";
import BrowserWindow = electron.BrowserWindow;
import ipcRenderer = electron.ipcRenderer;


let appConnection: IConnection;

const connectSocket = (conn: IConnection): void => {
    appConnection = conn;
    ipcRenderer.send( SOCKET_CONNECTION_REQUEST, conn);
};

ipcRenderer.on(APP_CONNECTION_STATUS, (event: Electron.Event, connectionStatus: IConnectionStatus) => {
    console.log(`"${APP_CONNECTION_STATUS}: ${connectionStatus}`);
    myObservable.next(connectionStatus);
});


const ElectronBrowserWindow = electron.remote.BrowserWindow;


const isDevel = (): boolean => {
    return process.env.NODE_ENV === "development";
};


const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const myObservable = new Subject();
const alertInfoToDiv = ((div: HTMLElement) => {

    const resetClasses = (() => {
        const allClasses: string[] = ["alert-primary", "alert-secondary", "alert-success", "alert-danger",
        "alert-warning", "alert-info", "alert-light", "alert-dark"];
        allClasses.forEach((c) => {
            div.classList.remove(c);
        });
    });

    const clearAllInfosClasses = (() => {
        delay(3000).then(() => {
            resetClasses();
            div.innerText = "";
        });
    });

    myObservable.subscribe((value: IConnectionStatus) => {
        console.log(`myObservable: ${value}`);
        resetClasses();
        switch (value) {
            case IConnectionStatus.MobileConnectionLost:
                div.innerText = "iPad lost";
                div.classList.add("alert-danger");
                openQrCodeDialogue(appConnection);
                break;
            case IConnectionStatus.Connected:
                div.innerText = "Connected";
                div.classList.add("alert-primary");
                openQrCodeDialogue(appConnection);
                break;
            case IConnectionStatus.Disconnected:
                div.innerText = "Disconnected ! Trying to reconnect ...";
                div.classList.add("alert-danger");
                break;
            case IConnectionStatus.Connecting:
                div.innerText = "Connecting ...";
                div.classList.add("alert-info");
                break;
            case IConnectionStatus.Starting:
                div.innerText = "Welcome, warming up";
                div.classList.add("alert-light");
                break;
            case IConnectionStatus.Reconnecting:
                div.innerText = "Reconnecting ...";
                div.classList.add("alert-info");
                break;
            case IConnectionStatus.Reconnected:
                div.innerText = "Reconnected";
                div.classList.add("alert-secondary");
                break;
            case IConnectionStatus.PairingInProgress:
                div.innerText = "Awaiting iPad ...";
                div.classList.add("alert-info");
                break;
            case IConnectionStatus.PairingSuccess:
                div.innerText = "Ready to use";
                div.classList.add("alert-success");
                clearAllInfosClasses();
                if (qrWin) {
                    qrWin.close();
                    qrWin = null;
                }
                break;
            case IConnectionStatus.Failed:
                div.innerText = "Connected Failed, please check your internet, reconnecting in a few ...";
                div.classList.add("alert-danger");
                break;
        }
    });
});

myObservable.next(IConnectionStatus.Starting);

/*
ipcRenderer.on("message", (event: Electron.Event, arg: string) => {
    console.log("ipcRenderer.on message ....."); // prints "ping"
    console.log(arg); // prints "ping"
    event.returnValue = "pong";
});
*/


let qrWin: BrowserWindow = null;
const openQrCodeDialogue = (conn: IConnection): void => {

    if (qrWin) {
        console.log(`qrWin: ${qrWin} && qrWin.isFocused(): ${qrWin.isFocused()}`);
        // return;
    }
    const params = `scheme=${conn.scheme}&version=${conn.version}&host=${conn.host}&token=${conn.token}`;
    const modalPath = path.join(`file://${__dirname}/qr.html?${params}`);
    console.log(`modalPath: ${modalPath}`);
    qrWin = new ElectronBrowserWindow({
        alwaysOnTop: true,
        frame: false,
        height: 300 ,
        resizable: false,
        show: false,
        width: 300,
    });
    qrWin.on("close", () => { qrWin = null; });
    qrWin.loadURL(modalPath);
    qrWin.show();
    myObservable.next(IConnectionStatus.PairingInProgress);
};

const openExecJsDialogue = () => {
    const execPath = path.join(`file://${__dirname}/exec-js.html`);
    let execWin = new ElectronBrowserWindow({
        alwaysOnTop: true,
        height: 300 ,
        width: 500,
    });
    execWin.on("close", () => { execWin = null; });
    execWin.loadURL(execPath);
    execWin.show();
};

const openAboutDialogue = () => {
    const aboutPath = path.join(`file://${__dirname}/about.html`);
    let aboutWin = new ElectronBrowserWindow({
        alwaysOnTop: true,
        height: 300 ,
        width: 300,
    });
    aboutWin.on("close", () => { aboutWin = null; });
    aboutWin.loadURL(aboutPath);
    aboutWin.show();
};

const initializeConnection = () => {
    console.log(`Renderer initializeConnection: connectionUrl: ${connectionUrl()}`);
    myObservable.next(IConnectionStatus.Connecting);
    delay(1000).then(() => {
        axios.post(connectionUrl(), { version: appVersion() })
            .then((response: AxiosResponse<IConnection>) => {
                console.info(`Renderer initializeConnection success:`, response.data);
                console.log(`Renderer initializeConnection response.headers:`, response.headers);
                connectSocket(response.data);
            }).catch((reason) => {
                console.error(reason);
                myObservable.next(IConnectionStatus.Failed);
                delay(3000).then(() => {
                    myObservable.next(IConnectionStatus.Reconnecting);
                    initializeConnection();
                });
            });
    });
};

const connectionUrl = (): string => {
    if (isDevel()) {
        // return  "http://localhost:8999/api/v1/connection";
        return  "https://api-staging.easydisplay.info/api/v1/connection";
    } else {
        return  "https://api-production.easydisplay.info/api/v1/connection";
    }
};


const appVersion = (): string => {
    const pjson = require("../package.json");
    return pjson.version;
};


module.exports = {

    bindHtmlElementToConnectionStatus: (div: HTMLElement) => {
        alertInfoToDiv(div);
    },

    about: () => {
        openAboutDialogue();
    },

    appVersion: () => {
        return appVersion();
    },

    createNewConnection: () => {
        initializeConnection();
    },

    doit: () => {
        console.log("doit ");
    },

    openExecJs: () => {
        openExecJsDialogue();
    },
    openUrl: (url: string) => {
        console.log(`openUrl: ${url}`);
        const msgs: [IMessage] = [{
            dataNumber: 0,
            dataString: url ,
            name: "open_url",
        }];
        ipcRenderer.sendSync(EVENT_DESKTOP_TO_MOBILE, msgs);
    },
    reload: () => {
        const msgs: [IMessage]  = [{
            dataNumber: 0,
            dataString: "",
            name: "reload",
        }];
        ipcRenderer.sendSync(EVENT_DESKTOP_TO_MOBILE, msgs);
    },

    scroll: (degree: number) => {
        console.log(`scroll: ${degree}`);
        const msgs: [IMessage]  = [{
            dataNumber: degree,
            dataString: "" ,
            name: "scroll",
        }];
        // SocketManager.socket.emit("event_desktop_to_mobile", { messages: msgs } );
        ipcRenderer.sendSync(EVENT_DESKTOP_TO_MOBILE, msgs);
    },


};
