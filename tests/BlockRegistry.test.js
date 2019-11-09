const baseRegistry = require( '../out/environment/blocks/Blocks' ).baseRegistry;

test("[ BlockRegistry ] base:BlockEmpty should be defined", ()=>{
	expect(typeof baseRegistry.get("base:BlockEmpty")).toBe("object");
})

test("[ Block Registry ] storageObject to recursive to string", ()=>{
	let blockRegistryEntry = baseRegistry.get("base:BlockEmpty");
	console.log(blockRegistryEntry.baseClass.toStorageObject());
})

test("[ BlockRegistry ] base:BlockEmpty toStorageObject", ()=>{
	let blockData = baseRegistry.get("base:BlockEmpty").baseClass.createBlockData(); 
	console.log(blockData.toString())
	expect(typeof blockData).toBe("object");
})