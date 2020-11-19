const {app, BrowserWindow} = require("electron");

app.commandLine.appendSwitch("--disable-frame-rate-limit");
app.commandLine.appendSwitch("--disable-gpu-vsync");
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
}

app.on('ready', createWindow);