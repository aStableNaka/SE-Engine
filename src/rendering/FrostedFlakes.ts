import * as THREE from 'three';

/**
 * Basic boilerplate for a simple
 * threejs scene setup
 */
export class FrostedFlakes extends THREE.Scene{
	width:number = window.innerWidth;
	height:number = window.innerHeight;
	viewAngle:number = 45;
	near:number = 0.1;
	far:number = 10000;
	aspect:number = this.width/this.height;

	container:HTMLElement|null = null;
	renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer();
	camera:THREE.Camera|null=null;
	
	constructor( container:HTMLElement|null ){
		super();
		const camera = new THREE.PerspectiveCamera(
			this.viewAngle,
			this.aspect,
			this.near,
			this.far
		);
		this.add(camera);
		this.renderer.setSize( this.width, this.height );
		if( !container ){ container = document.body; }
		this.container = container;
		container.appendChild( this.renderer.domElement );
	}
}