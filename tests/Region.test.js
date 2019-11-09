const Region = require( '../out/environment/region/Region' ).Region;
const World = require( '../out/environment/world' ).World;
const baseRegistry = require( '../out/environment/blocks/Blocks' ).baseRegistry;

const world = new World()
const region = new Region(16, world);



test('Region contents should not be null', ()=>{
	
})