// dynamic particle system, simulated positions, velocity

// size: (power of 2)
module.exports = {
  create: function(size, target) {
    let geometry = new THREE.BufferGeometry();

    // set uv positions, draws a vertex for each entry here
    // but these positions are actually map indices into the positions texture
    let positions = new Float32Array(size*size*3);
    for ( let i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3 ) {
      // since this is a line renderer, set both vertices to the same position (second point uses velocity)
      let a = i - i % 2;
      // these are normalized coordinates (0, 1), z coordinate is unused, but THREE.js uses a vec3
      // positions texture needs to be (size, size)
      positions[ j + 0 ] = ( a % size ) / size;
      positions[ j + 1 ] = Math.floor( a / size ) / size;
      positions[ j + 2 ] = i % 2;
    }
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    // TODO: initialize particles, origins
    let posvelTarget = new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });

    let material = new THREE.ShaderMaterial({
      uniforms: {
        map: {type: 't', value: null},
        time: {type: 'f', value: 0},
        size: {type: 'f', value: size}
      },
      vertexShader: `
      uniform sampler2D map;
      uniform float time;
      uniform float size;
      varying vec3 vPosition;
      varying vec3 vVelocity;
      varying float opacity;
      void main() {
        vec2 delta = vec2(1.0 / size);
        vec2 uv = position.xy;
        vec4 pos = texture2D(map, uv);
        vec4 vel = texture2D(map, uv + delta * vec2(1.0, 0.0));
        vPosition = pos.xyz;
        vVelocity = vel.xyz;
        opacity = pos.w;

        vec3 outputPos = vPosition;
        if(position.z == 1.0) {
          outputPos -= vVelocity;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4( outputPos, 1.0 );
      }
      `,
      fragmentShader: `
      varying vec3 vPosition;
      varying float opacity;
      void main() {
        if ( opacity <= 0.0 ) discard;
        gl_FragColor = vec4( vec3(0.8) + vec3(0,1.0,0)*opacity, opacity );
      }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    let system = new THREE.LineSegments(geometry, material);
    system.frustumCulled = false;

    system.positions = posvelTarget;
    system.positionsFlip = posvelTarget.clone();

    let origins = new Float32Array(size*size*4);
    for (var i = 0; i < origins.length; i+=8) {
      // position
      origins[i] = Math.random()*1-0.5 + target.x;
      origins[i+1] = Math.random()*1-0.5 + target.y;
      origins[i+2] = Math.random()*1-0.5 + target.z;
      origins[i+3] = Math.random();

      // velocity
      origins[i+4] = Math.random()*1-0.5;
      origins[i+5] = Math.random()*1-0.5;
      origins[i+6] = Math.random()*1-0.5;
      origins[i+7] = 1.0;
    }
    let originsTexture = new THREE.DataTexture(origins, size, size, THREE.RGBAFormat, THREE.FloatType);
    originsTexture.minFilter = THREE.NearestFilter;
    originsTexture.magFilter = THREE.NearestFilter;
    originsTexture.needsUpdate = true;

    posvelTarget.texture = originsTexture;

    system.simulateShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: {type: 't', value: posvelTarget},
        target: {type:'v3', value: target},
        time: {type:'f', value: 0},
        size: {type: 'f', value: size}
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
      uniform float time;
      uniform float size;
      uniform vec3 target;
      varying vec2 vUv;

      void main() {
        vec2 delta = vec2(1.0 / size);
        vec4 pos = texture2D(positions, vUv);
        vec4 vel = texture2D(positions, vUv + delta * vec2(1.0, 0.0));
        if(mod((gl_FragCoord.x-0.5), 2.0) == 1.0) {
          pos = texture2D(positions, vUv + delta * vec2(-1.0, 0.0));
          vel = texture2D(positions, vUv);

          // velocity update
          vec4 acc = vec4(vec3(target - pos.xyz), 0.0);
          vel += vec4(acc.xyz * 10.0 / 60.0, 0.0);
          vel *= 0.99;
          // end velocity update

          gl_FragColor = vel;
          return;
        }

        // position update
        pos += vec4(vel.xyz, 0.0) / 60.0;
        pos.w -= 1.0/60.0;
        // end position update

        gl_FragColor = pos;
      }
      `
    });

    return system;
  }
};
