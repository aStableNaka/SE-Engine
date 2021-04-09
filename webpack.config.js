const path = require("path");
const fs = require("fs");

const exp = {
	mode:'development',
	
	resolve:{
		alias:{}
	},

	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader','css-loader'],
			},
		],
	},
};


// 😭👌 This was such a pain to setup and debug.
// Converts tsconfig path aliases to webpack resolve aliases

// require("./tsconfig.json") didn't work because the json parser broke,
// probably from the comments inside tsconfig.json

// so i tried removing the comments using regex, but for some reason
// webpack didn't like my replace regex so i ended up having to do this mess.
const tsconfigstring = fs.readFileSync("./tsconfig.json").toString().match(/\"@\w+\":\[.+/g);

const paths = tsconfigstring.map(( pathString )=>{
	const tokens = pathString.split(":");
	return {
		alias: tokens[0].match(/@\w+/g)[0],
		path:tokens[1].match(/[\.\/\w\*]+/g)[0]
	}
})

// I spent 2 hours debugging these few lines of code. just so i could
// be lazy in the future. worth (?)

paths.map(( data )=>{
	exp.resolve.alias[ data.alias ] = path.resolve( __dirname, data.path );
})

module.exports = exp;