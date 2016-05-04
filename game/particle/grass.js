// size: (power of 2)
module.exports = {
  create: function(size, distFunc) {
    let geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(size*size*3);
    let pos = null, y = 0;
    for ( let i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3 ) {
      if(i%2==0) {
        pos = distFunc();
        y = 0;
      } else {
        y = 0.4;
      }

      positions[j] = pos.x;
      positions[j+1] = y;
      positions[j+2] = pos.y;
		}
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    let material = new THREE.ShaderMaterial({
      uniforms: {
          time: {type: 'f', value: 0}
      },
      vertexShader: `
      uniform float time;
			varying vec3 vPosition;
      varying vec3 colorOffset;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

			void main() {
				vPosition = position;

        vPosition.x += vPosition.y * sin(time/2.0) * 0.2 + vPosition.y * cos(vPosition.z + time/2.0) * 0.1;

        colorOffset = vec3(rand(position.xz*3.0), rand(position.xz*5.0), rand(position.xz*7.0));

				gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
			}
      `,
      fragmentShader: `
      uniform float time;
			varying vec3 vPosition;
      varying vec3 colorOffset;

			void main() {
				gl_FragColor = vec4( (vec3(0.5, 0.8, 0.5)+colorOffset/5.0), 0.5 );
			}
      `
    });
    let system = new THREE.LineSegments(geometry, material);
    system.blur = false;
    return system;
  }
};
