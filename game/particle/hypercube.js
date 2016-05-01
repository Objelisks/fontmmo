let renderMaterial = new THREE.ShaderMaterial({
    vertexShader: `
    varying vec4 vColor;

    void main() {
      vColor = color;
      gl_Position = vec4(position);
    }
    `,
    fragmentShader: `
    varying vec4 vColor;

    void main() {
      gl_FragColor = vec4(vColor);
    }
    `
});

// size: (power of 2)
module.exports = {
  create: function(size, simCode) {
    let geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(size*size*3);
    for ( var i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3 ) {
			positions[ j + 0 ] = ( i % size ) / size;
			positions[ j + 1 ] = Math.floor( i / size ) / size;
		}
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    // TODO: initialize particles, origins
    let positionsTarget = new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthBuffer: false,
			stencilBuffer: false
    });

    let material = new THREE.ShaderMaterial({
      uniforms: {
        map: {type: 't', value: positionsTarget},
        size: {type: 'f', value: 1.0}
      },
      vertexShader: `
      uniform sampler2D map;
			uniform float size;
			varying vec3 vPosition;
			varying float opacity;
			void main() {
				vec2 uv = position.xy + vec2( 0.5 / size, 0.5 / size );
				vec4 data = texture2D( map, uv );
				vPosition = data.xyz;
				opacity = data.w;
				gl_PointSize = data.w * 10.0 + 1.0;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
			}
      `,
      fragmentShader: `
      //uniform vec3 pointColor;
			varying vec3 vPosition;
			varying float opacity;
			void main() {
				if ( opacity <= 0.0 ) discard;
				gl_FragColor = vec4( vec3(vPosition), opacity );
			}
      `,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    let system = new THREE.Points(geometry, material);

    system.positionsFlip = positionsTarget.clone();

    let origins = new Float32Array(size*size*3);
    for (var i = 0; i < origins.length; i++) {
      origins[i] = Math.random()*10-5;
    }
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
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 pos = texture2D(positions, vUv);
        if(pos.w <= 0.0) {
          pos.xyz = texture2D(origins, vec2(rand(vec2(time, vUv.x)), rand(vec2(time, vUv.y)))).xyz;
          pos.w = 1.0;
        } else {
          if( rand( vUv + time ) > 0.99 || pos.w <= 0.0) discard;
          // simulate
          // insert glsl for simulation here
          float x = pos.x + time * 5.0;
					float y = pos.y;
					float z = pos.z + time * 4.0;

					pos.x += sin( y * 0.033 ) * cos( z * 0.037 ) * 0.4;
					pos.y += sin( x * 0.035 ) * cos( x * 0.035 ) * 0.4;
					pos.z += sin( x * 0.037 ) * cos( y * 0.033 ) * 0.4;
          pos.w -= 0.016;
        }
        gl_FragColor = pos;
      }
      `
    });

    return system;
  }
};
