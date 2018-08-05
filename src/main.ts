import { app, BrowserWindow } from "electron";
import * as os from "os";
import * as path from "path";




let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.





import * as io from "socket.io-client";
import Socket = SocketIOClient.Socket;

import {ipcMain} from "electron";
import {IConnection, IConnectionStatus, IMessage} from "./types";

let socket: Socket;
ipcMain.on("event_desktop_to_mobile", (event: Electron.Event, msgs: [IMessage] ) => {
    socket.emit("event_desktop_to_mobile", { messages: msgs } );
    event.returnValue = true;
});

ipcMain.on("socket-connect-request", (event: Electron.Event, c: IConnection) => {
    console.log(`main message:${c}`); // logs out "Hello second window!"
    const uri = `${c.scheme}://${c.host}/desktop/${c.version}?client_type=desktop&token=${c.token}`;
    socket = io.connect(uri);

    socket.on("connect", () => {
        console.log("connected .");
        mainWindow.webContents.send("socket-status", IConnectionStatus.Connected );
        // win.webContents.send('targetPriceVal', arg)
        // event.sender.send("socket-status", IConnectionStatus.Connected );
        console.log(`connect to server: SUCCESS, socket.connected: ${socket.connected}`);

        socket.on("event_server_to_desktop", (data: any) => {
            console.log(`event_server_to_desktop: ${data}`);
            // s.emit("event_to_client", { hello: "world" });
        });
        socket.on("event_mobile_to_desktop", (data: any) => {
            console.log(`event_mobile_to_desktop: ${data}`);
            if (data.name === "connection_success" ) {
                mainWindow.webContents.send("socket-status", IConnectionStatus.PairingSuccess );
                // myObservable.next(IConnectionStatus.PairingSuccess);
                console.log("event_mobile_to_desktop > connection_success,  time to dismiss qr code");
            }
            // s.emit("event_to_client", { hello: "world" });
        });
        socket.on("reconnect", () => {
            console.log("reconnect fired!");
            mainWindow.webContents.send("socket-status", IConnectionStatus.Reconnected );
        });
        socket.on("disconnect", () => {
            console.log("disconnect");
            mainWindow.webContents.send("socket-status", IConnectionStatus.Disconnected );
        });
    });



});

