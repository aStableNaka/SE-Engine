
const Layer = require( '../out/environment/Layer' ).Layer;

test('[ Layer:Storable ] Make sure compression works', ()=>{
	let data = JSON.parse(region.toString(true));
	expect(data.layers[0].contents[0][0]).toBe(0);
})


test('[ Layer:Storable ] Make sure decompression works', ()=>{
	expect(1).toBe(2);
})