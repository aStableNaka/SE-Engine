const Region = require( '../out/environment/region/Region' ).Region;
const World = require( '../out/environment/world' ).World;
const baseRegistry = require( '../out/environment/blocks/Blocks' ).baseRegistry;

const world = new World()
const region = new Region(16, world);



test('[ Storable ] There should be no information loss in conversion toString', ()=>{
	let data = JSON.parse(region.toString());
	expect(data.layers[0].contents[0][0].blockId).toBe('base:BlockEmpty');
})