import { app, BrowserWindow } from "electron";
import * as os from "os";
import * as path from "path";

import { Menu, nativeImage , Tray} from "electron";

let tray: Electron.Tray;
let mainWindow: Electron.BrowserWindow;


const showWindow = () => {
    const trayPos = tray.getBounds();
    const windowPos = mainWindow.getBounds();
    let x = 0;
    let y = 0;
    console.log(`process.platform: ${process.platform}`) ;
    if (process.platform === "darwin") {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        y = Math.round(trayPos.y + trayPos.height);
    } else {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        y = Math.round(trayPos.y + trayPos.height * 10);
    }

    mainWindow.setPosition(x, y, false);
    mainWindow.show();
    mainWindow.focus();
};


const toggleWindow = () => {
    console.log(`mainWindow.isVisible(): ${mainWindow.isVisible()}`);
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        showWindow();
    }
};

function createTray() {
    const icon = nativeImage.createFromDataURL(base64Icon);
    tray = new Tray(icon);

    // Add a click handler so that when the user clicks on the menubar icon, it shows
    // our popup window
    tray.on("click", (event) => {
        toggleWindow();
        console.log(`event.metaKey: ${event.metaKey}`);
        // Show devtools when command clicked
        // if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
        //     mainWindow.webContents.openDevTools({mode: "undocked"});
        // }
    });

}

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
    height: 300,
    resizable: false,
    show: false,
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
    console.debug(`main message ${SOCKET_CONNECTION_REQUEST}:`, c);
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

// Tray Icon as Base64 so tutorial has less overhead
const base64Icon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw
7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkZCg87wZW7ewA
AAp1JREFUOMuV1U2IVlUcx/HPnbc0MWwEF40hRWRQmWhEUi4KorlTQ0zQKgqSxKinRYuWrdq0iIp8DAy
CFmYUUVTYY0Qw0SsYVDQRlFlQU4o4VDMUY9NzWtz/45znzo3yv7n/l3O+53fOPS+F/7R9G0l34Vlap/x
PG+gPby76471jpJdxI4p/x5QrakPVZ3yI4lLSLH4LpetIT5N24AWKpZXAW4boXogFnGxQXEzhdQYHl0v
pbtJkBIOkBqXpVhzAWIPi8hocxCyH5qp0e10oHY6BNy3P7szULyc9hzkGTjat8WPRqctkD3QORrJ211J
srPV7CKP4i7S6CXxF+GtY2lG5D5yg+D6bckHaRXs463dV+OtJVzeBj4Q/inuy2uf4NYPvyVR38Vn4GzD
ZAC5ezHbITsqtEU8HvGcjpFblDncpDma16yhvqit+c3mLuQj3Vm7rJ4r3kW+z+6sD80aKQWcivwm318B
pHk9mA11PuSXil/B1thyrSA9HMI8nMtYNlDszcKdbHVcLkduCO0L1VxTv1VTv5plR3lrCuzga+c2YqB2
QNEfqjV7EWl8c8X78kKleTTfWeuA49maDjlNuz8CHFykOYDEabKvg0Jqh+AB/Z4D7qs+h03gbxyK/FVf
WL6FfsC/8tdGoZ0/hRKZ6A+2pUP1jdZecse01cGcBr2YNzqdcG6q/oDgS+7e3XLeF6j/wTvzM6Lfi2nQ
KP8e0P6Ezn9X2488MvLnW75vwP2wCr8J5eD4upsxaHZzOwNNZcU2c3FfwWg1cDuISfIxH6fzedE8G90s
8nuXH8B0eoXNc/6tQjsQfXaQz0/BEXUD3W4oF0hQPflTlJwZIl+FcOp86e2vvoj1Le6I/P974ZA2dBXk
97qQ13Z8+3PS0+AdjKa1R95YOZgAAAABJRU5ErkJggg==`;


