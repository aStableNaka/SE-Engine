import { Grid } from "./Spaces";

test(" [Spaces] make sure Grid<T> works like T[][], rows", ()=>{
	let grid = new Grid<number>(2, (row,col)=>{return row;});
	let r = grid.getRow(0);
	expect(r.length).toBe(2);
});

test(" [Spaces] make sure Grid<T> works like T[][], cols", ()=>{
	let grid = new Grid<number>(2, (row,col)=>{return row;});
	let e = grid.get(0,0);
	expect(e).toBe(0);
});