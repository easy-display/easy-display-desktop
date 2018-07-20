// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;


let socket: Socket;

module.exports = {
    connectSocket: () => {
        console.log("connectSocket ...");
        const userId = 99;
        const token = "Az_678987";
        const host = "localhost:8999";
        const protocol = "http";
        const uri = `${protocol}://${host}/desktop/0.1?client_type=desktop&user_id=${userId}&token=${token}`;
        socket = io.connect(uri);
        socket.on("connect", () => {
            console.log(`connect to server: ${uri} SUCCESS, socket.connected: ${socket.connected}`);
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
    },
    doit: () => {
        console.log("doit ");
    },
    evaluateJavaScript: (js: string) => {
        console.log(`evaluateJavaScript: ${js}`);
        const msgs = [{
            data: js ,
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
