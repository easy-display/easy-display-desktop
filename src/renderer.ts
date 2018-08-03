// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;
import {IMessage} from "./types";

import axios, {AxiosResponse} from "axios";
import electron = require("electron");
const ElectronBrowserWindow = electron.remote.BrowserWindow;
import * as path from "path";
import BrowserWindow = Electron.BrowserWindow;

const isDevel = (): boolean => {
    return process.env.NODE_ENV === "development";
};

let qrWin: BrowserWindow;
const openQrCodeDialogue = (scheme: string, host: string , version: string, token: string ): void => {
    const params = `scheme=${scheme}&version=${version}&host=${host}&token=${token}`;
    const modalPath = path.join(`file://${__dirname}/qr.html?${params}`);
    console.log(`modalPath: ${modalPath}`);
    qrWin = new ElectronBrowserWindow({
        alwaysOnTop: true,
        height: 300 ,
        width: 300,
    });
    qrWin.on("close", () => { qrWin = null; });
    qrWin.loadURL(modalPath);
    qrWin.show();
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


const connectionUrl = (): string => {
    if (isDevel()) {
        return  "http://localhost:8999/api/v1/connection";
    } else {
        return  "https://.....:443/";
    }
};

let socket: Socket;

const connectSocket = (scheme: string, host: string, version: string , token: string ): void => {
    console.log("connectSocket ...");
    const uri = `${scheme}://${host}/desktop/${version}?client_type=desktop&token=${token}`;
    socket = io.connect(uri);
    socket.on("connect", () => {
        console.log(`connect to server: ${uri} SUCCESS, socket.connected: ${socket.connected}`);
        openQrCodeDialogue(scheme, host , version, token);
        // s.emit("event_to_client", { hello: "world" });
        socket.on("event_server_to_desktop", (data: any) => {
            console.log(`event_server_to_desktop: ${data}`);
            // s.emit("event_to_client", { hello: "world" });
        });
        socket.on("event_mobile_to_desktop", (data: any) => {
            console.log(`event_mobile_to_desktop: ${data}`);
            if (data.name === "connection_success" ) {
                console.log("event_mobile_to_desktop > connection_success,  time to dismiss qr code");
                qrWin.close();
            }
            // s.emit("event_to_client", { hello: "world" });
        });
    });
};

const appVersion = (): string => {
    const pjson = require("../package.json");
    return pjson.version;
};


module.exports = {

    about: () => {
        openAboutDialogue();
    },

    appVersion: () => {
        return appVersion();
    },

    createNewConnection: () => {
        axios.post(connectionUrl(), { version: appVersion() }).then((response: AxiosResponse) => {
            console.log(response.data);
            connectSocket(response.data.scheme, response.data.host, response.data.version , response.data.token);
        });
    },

    doit: () => {
        console.log("doit ");
    },

    openExecJs: () => {
        openExecJsDialogue();
    },

    evaluateJavaScript: (js: string) => {
        console.log(`evaluateJavaScript: ${js}`);
        const msgs: [IMessage] = [{
            dataNumber: 0 ,
            dataString: js,
            name: "evaluate_js",
        }];
        socket.emit("event_desktop_to_mobile", { messages: msgs } );
    },

    openUrl: (url: string) => {
        console.log(`openUrl: ${url}`);
        const msgs = [{
            dataNumber: 0,
            dataString: url ,
            name: "open_url",
        }];
        socket.emit("event_desktop_to_mobile", { messages: msgs } );
    },
    reload: () => {
        const msgs = [{
            dataNumber: 0,
            dataString: "",
            name: "reload",
        }];
        socket.emit("event_desktop_to_mobile", { messages: msgs });
    },

    scroll: (degree: number) => {
        console.log(`scroll: ${degree}`);
        const msgs = [{
            dataNumber: degree,
            dataString: "" ,
            name: "scroll",
        }];
        socket.emit("event_desktop_to_mobile", { messages: msgs } );
    },
    sendMessage: () => {
        socket.emit("event_desktop_to_mobile", { hello: "world" });
    },


};
