// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;
import {IMessage} from "./types";

import axios, {AxiosResponse} from "axios";
import electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
import * as path from "path";

const isDevel = (): boolean => {
    return process.env.NODE_ENV === "development";
};

const openQrCodeDialogue = (proto: string, host: string, token: string ): void => {
    const modalPath = path.join(`file://${__dirname}/qr.html?protocol=${proto}&host=${host}&token=${token}`);
    console.log(`modalPath: ${modalPath}`);
    let win = new BrowserWindow({
        alwaysOnTop: true,
        height: 200 ,
        width: 300,
    });
    win.on("close", () => { win = null; });
    win.loadURL(modalPath);
    win.show();
};

const connectionUrl = (): string => {
    if (isDevel()) {
        return  "http://localhost:8999/api/v1/connection";
    } else {
        return  "https://.....:443/";
    }
};

let socket: Socket;

const connectSocket = (protocol: string, host: string, token: string ): void => {
    console.log("connectSocket ...");
    // const token = "Az_678987";
    // const host = "localhost:8999";
    // const protocol = "http";
    const uri = `${protocol}://${host}/desktop/0.1?client_type=desktop&token=${token}`;
    socket = io.connect(uri);
    socket.on("connect", () => {
        console.log(`connect to server: ${uri} SUCCESS, socket.connected: ${socket.connected}`);
        openQrCodeDialogue(protocol, host, token);
        // s.emit("event_to_client", { hello: "world" });
        socket.on("event_server_to_desktop", (data: any) => {
            console.log(`event_server_to_desktop: ${data}`);
            // s.emit("event_to_client", { hello: "world" });
        });
        socket.on("event_mobile_to_desktop", (data: any) => {
            console.log(`event_mobile_to_desktop: ${data}`);
            // s.emit("event_to_client", { hello: "world" });
        });
    });
};

module.exports = {

    createNewConnection: () => {
        axios.post(connectionUrl()).then((response: AxiosResponse) => {
            console.log(response.data);
            connectSocket(response.data.protocol, response.data.host, response.data.token);
        });
    },

    doit: () => {
        console.log("doit ");
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
                    data: url ,
                    name: "open_url",
                }];
        socket.emit("event_desktop_to_mobile", { messages: msgs } );
    },
    scroll: () => {
        console.log(`scroll`);
        const msgs = [{
            data: "0",
            name: "scroll",
        }];
        socket.emit("event_desktop_to_mobile", { messages: msgs } );
    },
    sendMessage: () => {
        socket.emit("event_desktop_to_mobile", { hello: "world" });
    },

};
