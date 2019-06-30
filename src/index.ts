import {Region} from './environment/Region'

class Main{
	constructor(){
		let n = new Region( 2 );
		console.log(n.contents);
		document.write(JSON.stringify(n));
	}
}

const a = new Main();