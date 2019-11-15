const Layer = require('../out/environment/Layer').Layer;
const layer1 = new Layer(16, 0);
let compressedData = "";

test('[ Layer:Storable ] Make sure compression works', () => {
	let dataString = layer1.toString(true);
	compressedData = JSON.parse(dataString);
	console.log(dataString);
	expect(compressedData.grid.contents[0][0]).toBe(0);
})


test('[ Layer:Storable ] Make sure decompression works', () => {
	compressedData = {
		"compressed": true,
		"map": [
			["fc91e747a0a2ccf82f15e5a8d140fedb", {
				"blockData": {
					"type": "BlockData",
					"baseClass": {
						"blockId": "base:BlockEmpty"
					}
				},
				"index": 0
			}],["f15e5a8d140fedb", {
				"blockData": {
					"type": "BlockData",
					"baseClass": {
						"blockId": "base:BlockNull"
					}
				},
				"index": 1
			}]
		],
		"grid": {
			"contents": [
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			]
		},
		"location": 0
	}
	let layer2 = new Layer(16, 0);
	layer2.decompress(compressedData);
	
	//console.log(layer2.grid.contents[0][0]);
	expect(layer2.grid.contents[0][0].baseClass.blockId).toBe("base:BlockNull");
})