const {app, BrowserWindow} = require("electron");

app.commandLine.appendSwitch("--disable-frame-rate-limit");
app.commandLine.appendSwitch("--disable-gpu-vsync");


const clientID = "824257680213803018"
const drpc = require('discord-rpc');

//drpc.register(clientID);

const rpc = new drpc.Client({ transport: 'ipc' });

function setActivity(){
    console.log("[DISCORD-RPC] Setting activity")
    rpc.setActivity({
        details: "Baking Spaghetti",
        state: "In the oven at 625 degrees F"
    })
}

function createWindow(){
	const window = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences:{
			nodeIntegration:true
		},
		kiosk: true,
		frame:false /** Enable for distribution */
	})
	
	window.loadFile("index.html");

	window.webContents.openDevTools();

	window.maximize();

	rpc.on("ready", ()=>{
		console.log("discord rpc ready");
		setActivity();
	})
	
	rpc.login( {clientId: clientID } ).catch( console.error );
}

app.on('ready', createWindow);


