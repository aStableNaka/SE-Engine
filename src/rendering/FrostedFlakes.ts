import * as THREE from 'three';
import {OrbitControls} from "../utils/THREE/jsm/controls/OrbitControls";
/**
 * Basic boilerplate for a simple
 * threejs scene setup
 */
export class FrostedFlakes extends THREE.Scene{
	width:number = window.innerWidth;
	height:number = window.innerHeight;
	viewAngle:number = 90;
	near:number = 0.1;
	far:number = 10000;
	aspect:number = this.width/this.height;

	referenceMesh:THREE.Mesh;

	container:HTMLElement|null = null;
	renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer();
	camera:THREE.Camera;
	orbitControlls: OrbitControls;
	
	constructor( container:HTMLElement|null ){
		super();
		this.camera = new THREE.PerspectiveCamera(
			this.viewAngle,
			this.aspect,
			this.near,
			this.far
		);
		this.camera.position.set(0,0,3);
		this.background = new THREE.Color(0xff66ff);
		this.add(this.camera);
		this.renderer.setSize( this.width, this.height );
		if( !container ){ container = document.body; }
		this.container = container;
		container.appendChild( this.renderer.domElement );

		// Debugging
		this.add( new THREE.AmbientLight( 0xffffff, 100 ))
		this.orbitControlls = new OrbitControls(this.camera, this.container);
		this.referenceMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(1, 1, 4, 8), new THREE.MeshLambertMaterial({color:0x0}));
		this.add(this.referenceMesh)
	}

	render(){
		//this.camera.rotateZ(0.1);
		//this.camera.rotateY(0.1);
		this.orbitControlls.update();
		this.referenceMesh.rotateY(0.1);
		this.renderer.render(this,this.camera);
	}
}