// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;


let socket: Socket;

module.exports = {
    connectSocket: () => {
        console.log("connectSocket");
        const userId = 99;
        const token = "Az_678987";
        const host = "localhost:8999";
        const protocol = "http";
        socket = io(`${protocol}://${host}/desktop/0.1?client_type=desktop&user_id=${userId}&token=${token}`);
        socket.on("connection", (s: Socket) => {
            console.log("connection to server SUCCESS.");
            // s.emit("event_to_client", { hello: "world" });
            s.on("event_server_to_desktop", (data: any) => {
                console.log(`event_server_to_desktop: ${data}`);
                // s.emit("event_to_client", { hello: "world" });
            });
            s.on("event_mobile_to_desktop", (data: any) => {
                console.log(`event_mobile_to_desktop: ${data}`);
                // s.emit("event_to_client", { hello: "world" });
            });
        });
    },
    doit: () => {
        console.log("process ");
    },
    sendMessage: () => {
        socket.emit("event_desktop_to_mobile", { hello: "world" });
    },
};
