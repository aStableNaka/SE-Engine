const Region = require( '../out/src/environment/Region' ).Region;

test('Region contents should not be null', ()=>{
	let n = new Region( 2 );
	console.log(n.contents);
	expect(Array.isArray( n.contents[0] )).toBe( true );
})