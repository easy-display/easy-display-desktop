// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;


let socket: Socket;

module.exports = {
    connectSocket: () => {
        console.log("connectSocket");
        socket = io("http://localhost:8999");
        socket.on("connection",  (s: Socket) => {
            console.log("connected ...");
            s.emit("event_to_client", { hello: "world" });
            s.on("event_to_server", (data: any) => {
                console.log(data);
                s.emit("event_to_client", { hello: "world" });
            });
        });
    },
    doit: () => {
        console.log("process ");
    },
    sendMessage: () => {
        socket.emit("event_to_server", { hello: "world" });
    },
};
