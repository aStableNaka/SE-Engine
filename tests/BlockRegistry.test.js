const baseRegistry = require( '../out/environment/blocks/Blocks' ).baseRegistry;

test("[ BlockRegistry ] base:BlockEmpty should be defined", ()=>{
	expect(typeof baseRegistry.get("base:BlockEmpty")).toBe("object");
})

test("[ BlockRegistry ] base:BlockEmpty toStorageObject", ()=>{
	console.log(baseRegistry.get("base:BlockEmpty"));
	let blockData = baseRegistry.get("base:BlockEmpty").blockClass.createBlockData(); 
	console.log(blockData)
	expect(typeof blockData).toBe("object");
})