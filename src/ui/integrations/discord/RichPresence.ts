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

rpc.on("ready", ()=>{
    setActivity();
})

rpc.login( {clientID } ).catch( console.error );