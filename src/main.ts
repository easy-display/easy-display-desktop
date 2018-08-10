import { app, BrowserWindow } from "electron";
import * as os from "os";
import * as path from "path";

import { Menu } from "electron";

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
    APP_CONNECTION_STATUS,
    EVENT_DESKTOP_TO_MOBILE,
    EVENT_MOBILE_TO_DESKTOP,
    EVENT_SERVER_TO_DESKTOP,
    MOBILE_CONNECTION_LOST,
    MOBILE_CONNECTION_SUCCESS,
    SOCKET_CONNECTION_REQUEST,
} from "./constants";

import {IConnection, IConnectionStatus, IMessage} from "./types";

let socket: Socket;
ipcMain.on(EVENT_DESKTOP_TO_MOBILE, (event: Electron.Event, msgs: [IMessage] ) => {
    console.debug("main event_desktop_to_mobile msgs:", msgs);
    socket.emit(EVENT_DESKTOP_TO_MOBILE, msgs );
    event.returnValue = true;
});

ipcMain.on( SOCKET_CONNECTION_REQUEST, (event: Electron.Event, c: IConnection) => {
    console.debug(`main message ${SOCKET_CONNECTION_REQUEST}:${c}`);
    const uri = `${c.scheme}://${c.host}/desktop/${c.version}?client_type=desktop&token=${c.token}`;
    socket = io.connect(uri);

    socket.on("connect", () => {
        console.debug(`main socket connect to server: SUCCESS, socket.connected: ${socket.connected}`);
        mainWindow.webContents.send(APP_CONNECTION_STATUS, IConnectionStatus.Connected );
        // win.webContents.send('targetPriceVal', arg)
        // event.sender.send("socket-status", IConnectionStatus.Connected );

        socket.on(EVENT_SERVER_TO_DESKTOP, (data: any) => {
            console.log(`${EVENT_SERVER_TO_DESKTOP}`, data);
            if (data[0].name === MOBILE_CONNECTION_LOST ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.MobileConnectionLost );
            }
            // s.emit("event_to_client", { hello: "world" });
        });
        socket.on(EVENT_MOBILE_TO_DESKTOP, (data: any) => {
            console.log(` • ${EVENT_MOBILE_TO_DESKTOP} : `, data);
            if ( data[0].name === MOBILE_CONNECTION_SUCCESS ) {
                mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.PairingSuccess );
                // myObservable.next(IConnectionStatus.PairingSuccess);
                console.log(`${EVENT_MOBILE_TO_DESKTOP} > connection_success,  time to dismiss qr code`);
            }
            // s.emit("event_to_client", { hello: "world" });
        });
        socket.on("reconnect", () => {
            console.log("reconnect fired!");
            mainWindow.webContents.send( APP_CONNECTION_STATUS, IConnectionStatus.Reconnected );
        });
        socket.on("disconnect", () => {
            console.log("disconnect");
            mainWindow.webContents.send(APP_CONNECTION_STATUS, IConnectionStatus.Disconnected );
        });
    });



});

