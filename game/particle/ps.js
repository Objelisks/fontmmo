const gpgpu = require('./gpgpu.js');
const blurShader = require('../shaders/blurShader.js')();
const copyShader = require('../shaders/copyShader.js')();
const mixShader = require('../shaders/mixShader.js')();
const state = require('../state.js');

copyShader.material.transparent = true;
copyShader.material.opacity = 0.3;
copyShader.material.blending = THREE.AdditiveBlending;

let particlesTarget = new THREE.WebGLRenderTarget(state.width, state.height);
let blurHorizontalTarget = new THREE.WebGLRenderTarget(state.width / 2, state.height / 2, {minFilter: THREE.LinearFilter});
let blurVerticalTarget = new THREE.WebGLRenderTarget(state.width / 2, state.height / 2, {minFilter: THREE.LinearFilter});
let blurDepth = 2;
let particleEngine = {};

module.exports.create = function() {
  let pSystem = Object.assign(Object.create(particleEngine), {
    systems: {},
    scene: new THREE.Scene(),
    systemIndex: 0
  });
  return pSystem;
}

particleEngine.add = function(system) {
  system.index = this.systemIndex;
  this.systemIndex += 1;
  this.systems[system.index] = system;
  this.scene.add(system);
};

particleEngine.simulate = function() {
  Object.keys(this.systems).forEach((key) => {
    let system = this.systems[key];
    if(system.simulateShader) {
      system.simulateShader.uniforms.time.value += 0.016;

      gpgpu.pass(system.simulateShader, system.positionsFlip);
      system.material.uniforms.map.value = system.positionsFlip;

      let temp = system.simulateShader.uniforms.positions.value;
      system.simulateShader.uniforms.positions.value = system.positionsFlip;
      system.positionsFlip = temp;

      // TODO: check to see if particles are dead
      // use deterministic time death
      // remove from engine
    }
  });
};

particleEngine.render = function(camera, worldTarget) {
  gpgpu.clear(blurVerticalTarget);

  // update system uniforms
  Object.keys(this.systems).forEach((key) => {
    let system = this.systems[key];
    system.material.uniforms.time.value += 0.016;
  });

  // render particle scene on top of existing world scene
  gpgpu.render(this.scene, camera, worldTarget);

  Object.keys(this.systems).forEach((key) => {
    let system = this.systems[key];
    if(system.blur) {
      gpgpu.clear(blurVerticalTarget);
      gpgpu.render(system, camera, blurVerticalTarget);

      // blur texture
      for(let i=0; i<blurDepth; i++) {
        blurShader.setTexture(blurVerticalTarget);
        blurShader.setDelta(1/state.width, 0);
        this.gpgpu.pass(blurShader.material, blurHorizontalTarget);
        blurShader.setTexture(blurHorizontalTarget);
        blurShader.setDelta(0, 1/state.height);
        gpgpu.pass(blurShader.material, blurVerticalTarget);
      }

      // blend blurred texture with render
      copyShader.setTexture(blurVerticalTarget);
      gpgpu.pass(copyShader.material, worldTarget);
    }
  });

  return worldTarget;
};
