import {Region} from './environment/region/Region';
import {World} from './environment/World';

class Main{
	constructor(){
		let world = new World();
		let n = new Region( 2, world );
		console.log(n.layers);
		document.write(JSON.stringify(n));

	}
}

const a = new Main();