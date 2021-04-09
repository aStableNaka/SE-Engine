var scene = new THREE.Scene();

const instances = Math.pow(32,3);
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, instances);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
var instancedGeometry = new THREE.InstancedBufferGeometry();

const rowSize = 32;

// BufferGeometry -> InstancedBufferGeometry conversion
Object.keys(geometry.attributes).map((key) => {
	instancedGeometry.attributes[key] = geometry.attributes[key];
})

// fixes wrong face issue
instancedGeometry.index = geometry.index;

const len = geometry.attributes.position.array.length;

let n = new Float32Array(len * instances);

for (let w = 0; w < instances; w++) {
	geometry.attributes.position.array.map((t, i) => {
		let p = Math.floor(i/len); // Determines the instance no.
		let index = i + w * len;
		let vert = ['x', 'y', 'z'][index % 3];
		let coefficient1 = Math.pow(rowSize,2);
		// What the fuck is going on im too drink to figure
		// this out
		// help.
		switch (vert) {
			case 'x':
				n[ index ] = index%(coefficient1)-(coefficient1/2);
				break;
			case 'y':
				n[ index ] = 0;
				break;
			case 'z':
				n[ index ] = Math.floor(index/coefficient1*5)/2-(coefficient1/2);
				break;
			default:
				n[ index ] = 0;
				break;
		}
		
	});
}

const vertexShader = document.getElementById('vertex-shader').textContent;
const fragmentShader = document.getElementById('fragment-shader').textContent;

instancedGeometry.addAttribute('displacement', new THREE.InstancedBufferAttribute(n, 3))
var material = new THREE.ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
});

var cube = new THREE.Mesh(instancedGeometry, material);
scene.add(cube);

camera.position.z = 1000;

var animate = function () {
	requestAnimationFrame(animate);
	cube.rotation.y += 0.0025;
	cube.rotation.x += 0.001;
	renderer.render(scene, camera);
};

animate();