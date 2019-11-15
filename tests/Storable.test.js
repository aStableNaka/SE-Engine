const Region = require( '../out/environment/region/Region' ).Region;
const World = require( '../out/environment/world' ).World;
const baseRegistry = require( '../out/environment/blocks/Blocks' ).baseRegistry;
const Stopwatch = require( '../out/utils/Stopwatch' ).Stopwatch;
let stopwatch = new Stopwatch("stopwatch");
const world = new World()
const region = new Region(16, world);
stopwatch.sample();


test('[ Storable ] There should be no information loss in conversion toString', ()=>{
	stopwatch.reset();
	let data = JSON.parse(region.toString());
	console.log(data.layers[0].grid.contents[0][0]);
	expect(data.layers[0].grid.contents[0][0].baseClass.blockId).toBe('base:BlockEmpty');
	stopwatch.sample();
})

test('[ Storable ] Make sure compression works', ()=>{
	stopwatch.reset();
	let data = JSON.parse(region.toString(true));
	console.log(data);
	expect(data.layers[0].grid.contents[0][0]).toBe(0);
	stopwatch.sample();
})