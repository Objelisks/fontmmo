let state = require('../state.js');
const gpgpu = require('./gpgpu.js');
const blurShader = require('../shaders/blurShader.js')();
const copyShader = require('../shaders/copyShader.js')();

let systems = {};
let scene = new THREE.Scene();
let systemIndicies = 0;

module.exports.addSystem = function(system) {
  system.index = systemIndicies;
  systemIndicies += 1;
  systems[system.index] = system;
  scene.add(system);
};

module.exports.simulateSystems = function() {
  Object.keys(systems).forEach((systemKey) => {
    let system = systems[systemKey];
    system.simulateShader.uniforms.time.value += 0.016;
    gpgpu.pass(system.simulateShader, system.positionsFlip);
    system.material.uniforms.map.value = system.positionsFlip;

    let temp = system.simulateShader.uniforms.positions.value;
    system.simulateShader.uniforms.positions.value = system.positionsFlip;
    system.positionsFlip = temp;
  });
};

let particlesTarget = new THREE.WebGLRenderTarget(state.width, state.height);
let blurHorizontalTarget = new THREE.WebGLRenderTarget(state.width / 8, state.height / 8, {minFilter: THREE.LinearFilter});
let blurVerticalTarget = new THREE.WebGLRenderTarget(state.width / 8, state.height / 8, {minFilter: THREE.LinearFilter});
let blurDepth = 1;

module.exports.renderParticles = function(worldTarget) {
  //gpgpu.clear(particlesTarget);

  // particle render to texture with depth test
  Object.keys(systems).forEach((systemKey) => {
    let system = systems[systemKey];
    //system.renderShader.setDepthTexture(worldTarget);
    gpgpu.render(scene, state.camera, particlesTarget);
  });
/*
  gpgpu.pass(copyShader.setTexture(particlesTarget).material, blurVerticalTarget);

  // blur texture
  for(let i=0; i<blurDepth; i++) {
    blurShader.setTexture(blurVerticalTarget);
    blurShader.setDelta(1/state.width, 0);
    gpgpu.pass(blurShader.material, blurHorizontalTarget);
    blurShader.setTexture(blurHorizontalTarget);
    blurShader.setDelta(0, 1/state.height);
    gpgpu.pass(blurShader.material, blurVerticalTarget);
  }
*/
  return particlesTarget;
};
