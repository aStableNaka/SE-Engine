export class Stopwatch{
	label:string;
	creation: number;
	stop:number=0;
	delta:number=0;
	constructor(label:string){
		this.creation = new Date().getTime();
		this.label = label;
	}

	reset(){
		this.creation = new Date().getTime();
	}

	sample(){
		this.stop = new Date().getTime();
		this.delta = this.stop - this.creation;
		console.log(`[ Stopwatch:${this.label} ] delta ${this.delta}`);
		return this.delta;
	}
}