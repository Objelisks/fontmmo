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
        y = 0.3;
      }

      positions[j] = pos.x;
      positions[j+1] = y;
      positions[j+2] = pos.y;
		}
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    let material = new THREE.ShaderMaterial({
      uniforms: {
        time: {type: 'f', value: 0},
        collider: {type: '2f', value: [0,0]}
      },
      vertexShader: `
      uniform float time;
      uniform vec2 collider;
			varying vec3 vPosition;
      varying vec3 colorOffset;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

			void main() {
				vPosition = position;

        vPosition.x += vPosition.y * sin(time/5.0) * 0.4 + vPosition.y * cos(vPosition.z + time/3.0) * 0.5;
        //vPosition.y -= clamp(vPosition.y * (1.0 / (distance(collider, vPosition.xz)/0.5)), 0.0, 0.3);

        colorOffset = vec3(rand(position.xz*3.0), rand(position.xz*5.0), rand(position.xz*7.0));

				gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
			}
      `,
      fragmentShader: `
      uniform float time;
			varying vec3 vPosition;
      varying vec3 colorOffset;

			void main() {
				gl_FragColor = vec4( vec3(0.5, 0.8, 0.5)+colorOffset/10.0, 0.8 );
			}
      `
    });
    let system = new THREE.LineSegments(geometry, material);

    /*
    let originsTexture = new THREE.DataTexture(origins, size, size, THREE.RGBFormat, THREE.FloatType);
    originsTexture.minFilter = THREE.NearestFilter;
		originsTexture.magFilter = THREE.NearestFilter;
    originsTexture.needsUpdate = true;

    system.simulateShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: {type: 't', value: positionsTarget},
        origins: {type:'t', value: originsTexture},
        time: {type:'f', value: 0}
      },
      vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = vec2(uv.x, 1.0 - uv.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `,
      fragmentShader: `
      uniform sampler2D positions;
      uniform sampler2D origins;
      uniform float time;
      varying vec2 vUv;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 pos = texture2D(positions, vUv);
        pos.xyz = texture2D(origins, vUv).xyz;
        pos.w = rand(vUv);
        if(pos.w <= 0.0) {
          pos.w = rand(vUv);
        }
        gl_FragColor = pos;
      }
      `
    });
    */
    return system;
  }
};
