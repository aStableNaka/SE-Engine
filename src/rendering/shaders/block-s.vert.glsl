attribute vec3 displacement;

void main(){
      gl_Position = projectionMatrix * modelViewMatrix * ( vec4( position, 1.0 ) + vec4(displacement,1.0) );
}