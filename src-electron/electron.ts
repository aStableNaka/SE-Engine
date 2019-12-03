const {app, BrowserWindow} = require("electron");

function createWindow(){
	const window = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences:{
			nodeIntegration:true
		},
		//frame:false /** Enable for distribution */
	})
	
	window.loadFile("index.html");

	window.webContents.openDevTools();

	window.maximize();
}

app.on('ready', createWindow);