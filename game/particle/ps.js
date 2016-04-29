const gpgpu = require('./gpgpu.js');

// size: (power of 2)
module.exports.create = function(size, simCode) {
  let geometry = new THREE.Geometry();
  let material = new THREE.LineBasicMaterial({color: 0xffffff});
  let ps = new THREE.LineSegments(geometry, material);

  // TODO: initialize particles, origins

  ps.simulateShader = new THREE.ShaderMaterial({
    uniforms: {
      particles: {type: 't', value: null},
      origins: {type:'t', value: null},
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
    uniform sampler2D particles;
    uniform sampler2D origins;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec4 pos = texture2D(positions, vUv);
      if(pos.w <= 0.0) {
        pos.xyz = texture2D(origins, vUv).xyz;
        pos.w = 1.0;
      } else {
        if(pos.w <= 0.0) discard;
        // simulate
        // insert glsl for simulation here
      }
      gl_FragColor = pos;
    }
    `
  });

  return ps;
};

module.exports.simulateSystem = function(system) {
  system.simulateShader.uniforms.time += 0.016;
  gpgpu.pass(system.simulateShader, system.uniforms.positions);
};

let particlesTarget = new THREE.WebGLRenderTarget(state.width, state.height);
let blurDepth = 4;

module.exports.renderParticles = function(worldTarget) {
  particlesTarget.clear();
  // particle render to texture with depth test
  systems.forEach((system) => {
    system.renderShader.setDepthTexture(worldTarget);
    gpgpu.pass(system.renderShader, particlesTarget);
  });

  // blur texture
  for(let i=0; i<blurDepth; i++) {
    blurShader.setSource(particlesTarget);
    gpgpu.pass(blurShader, blurredTarget);
  }

  return blurredTarget;
};
