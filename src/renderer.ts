// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import electron = require("electron");
import * as Logger from "electron-log";
import {Promise} from "es6-promise";
import * as path from "path";
import {Subject} from "rxjs";
import {
    APP_CONNECTION_STATUS,
    EVENT_DESKTOP_TO_MOBILE,
    EVENT_INIT_CONNECTION,
} from "./constants";
import {IConnectionStatus, IMessage} from "./types";
// import BrowserWindow = electron.BrowserWindow;
import ipcRenderer = electron.ipcRenderer;

Logger.silly("silly EasyDislay Renderer");
Logger.verbose("verbose EasyDislay Renderer");
Logger.debug("debug EasyDislay Renderer");
Logger.info("info EasyDislay Renderer");
Logger.warn("warn EasyDislay Renderer");
Logger.error("error EasyDislay Renderer");


ipcRenderer.on(APP_CONNECTION_STATUS, (event: Electron.Event, connectionStatus: IConnectionStatus) => {
    console.log(`"ipcRenderer.on(APP_CONNECTION_STATUS: (${connectionStatus})`);
    myObservable.next(connectionStatus);
});


const ElectronBrowserWindow = electron.remote.BrowserWindow;


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
        console.log(`Renderer new connection-status: ${value}`);
        resetClasses();
        switch (value) {
            case IConnectionStatus.ConnectingPrevious:
                div.innerText = "Connecting previous connection ...";
                div.classList.add("alert-info");
                break;
            case IConnectionStatus.MobileToBackground:
                div.innerText = "iPad is in background";
                div.classList.add("alert-warning");
                break;
            case IConnectionStatus.MobileIsForeground:
                div.innerText = "iPad is back";
                div.classList.add("alert-success");
                clearAllInfosClasses();
                break;
            case IConnectionStatus.MobileConnectionLost:
                div.innerText = "iPad lost";
                div.classList.add("alert-danger");
                break;
            case IConnectionStatus.DesktopConnectionLost:
                div.innerText = "Desktop lost";
                div.classList.add("alert-danger");
                break;
            case IConnectionStatus.DesktopConnectionSuccessIpadPairingRequired:
                div.innerText = "Connected, time to sync iPad";
                div.classList.add("alert-primary");
                break;
            case IConnectionStatus.DesktopConnectionSuccessIpadPaired:
                div.innerText = "Ready to use!";
                div.classList.add("alert-primary");
                clearAllInfosClasses();
                break;
            case IConnectionStatus.Connected:
                div.innerText = "Connected to server";
                div.classList.add("alert-primary");
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
                // ipcRenderer.sendSync(EVENT_CLOSE_QR_CODE);
                break;
            case IConnectionStatus.Failed:
                div.innerText = "Connected Failed, please check your internet, reconnecting in a few ...";
                div.classList.add("alert-danger");
                break;
        }
    });
});

myObservable.next(IConnectionStatus.Starting);


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



module.exports = {

    bindHtmlElementToConnectionStatus: (div: HTMLElement) => {
        alertInfoToDiv(div);
    },

    about: () => {
        openAboutDialogue();
    },
    //
    // appVersion: () => {
    //     return appVersion();
    // },
    //
    createNewConnection: () => {
        // initializeConnection();
        ipcRenderer.send(EVENT_INIT_CONNECTION);
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
