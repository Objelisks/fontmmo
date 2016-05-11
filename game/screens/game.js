/* global THREE, TWEEN */
const state = require('../state.js');
const actor = require('../objects/actor.js');
const input = require('../control/input.js');
const network = require('../network/network.js');
const importer = require('../world/import.js');
const gpgpu = require('../particle/gpgpu.js');
const ps = require('../particle/ps.js');
const particles = require('../particle/particles.js');
const copyShader = require('../shaders/copyShader.js')();

let screen = {};

let fadeObject = new THREE.Mesh(new THREE.SphereGeometry(2),
  new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite:false}));
let cameraOffset = new THREE.Vector3(10,20,10);
let worldTarget = new THREE.WebGLRenderTarget(state.width, state.height);

let stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

screen.create = function(data) {
  document.body.appendChild(stats.domElement);

  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(state.width, state.height);
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  state.renderer = renderer;
  gpgpu.setRenderer(renderer);

  document.body.appendChild(renderer.domElement);

  let scene = new THREE.Scene();
  state.scene = scene;

  let camera = new THREE.PerspectiveCamera(60, state.width/state.height, 1, 50);
  camera.position.set(0,10,-10);
  camera.lookAt(new THREE.Vector3(0,0,0));
  state.camera = camera;

  let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5,10,-5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 100;
  dirLight.shadow.camera.left = -16;
  dirLight.shadow.camera.right = 16;
  dirLight.shadow.camera.top = 16;
  dirLight.shadow.camera.bottom = -16;
  dirLight.shadow.mapSize.set(1024, 1024);
  scene.add(dirLight);
  state.light = dirLight;

  let ambLight = new THREE.AmbientLight(0x808080);
  scene.add(ambLight);

  state.scene.add(fadeObject);

  network.connect(data.token);
}

screen.destroy = function() {
  document.body.removeChild(stats.domElement);
  document.body.removeChild(renderer.domElement);
  network.disconnect();
  // TODO: destroy some more stuff
}

screen.update  = function(delta) {
  stats.begin();

  // render game world to target, force clear
  gpgpu.clear(worldTarget);
  //state.renderer.render(state.scene, state.camera, undefined, true);
  gpgpu.render(state.scene, state.camera, worldTarget);
  if(state.chunk) {
    // update all particles on gpu
    state.chunk.particles.simulate();

    // render particle systems with glow
    state.chunk.particles.render(state.camera, worldTarget);
  }
  // copy output to screen
  copyShader.setTexture(worldTarget);
  gpgpu.out(copyShader.material);

  TWEEN.update();

  let inputDelta = input.update(delta);

  // NOTE: currently only updating if we have a chunk and player (this might not be true later)
  if(network.playerIndex && state.chunk && state.chunk.objects[network.playerIndex]) {
    let player = state.chunk.objects[network.playerIndex];

    network.sendInputDelta(inputDelta);

    if(network.playerRelocate) {
      state.chunk.objects[network.playerIndex].position.copy(network.playerRelocate);
      network.playerRelocate = null;
    }

    var inputMap = {};
    inputMap[network.playerIndex] = inputDelta;
    state.chunk.update(delta, inputMap);

    // update main camera and shadow camera
    let cameraLocation = player.position.clone().add(cameraOffset);
    let otherCameraLocation = player.position.clone().add(new THREE.Vector3(5,10,-5));
    state.camera.position.lerp(cameraLocation, 0.1);
    state.camera.lookAt(player.position);
    // TODO: figure out shadow camera
    // state.light.position.copy(otherCameraLocation);
  }

  fadeObject.position.copy(state.camera.position);

  stats.end();

}

screen.fadeOut = function(time) {
  let tween = new TWEEN.Tween(fadeObject.material)
    .to({opacity: 1.0}, time)
    .start();
  return new Promise(function(resolve, reject) {
    tween.onComplete(resolve);
  });
}

screen.fadeIn = function(time) {
  let tween = new TWEEN.Tween(fadeObject.material)
    .to({opacity: 0.0}, time)
    .start();
  return new Promise(function(resolve, reject) {
    tween.onComplete(resolve);
  });
}

// load the chunk, when done loading fade out and replace chunks, then fade back in
screen.enterChunk = function(chunkName) {
  return new Promise(function(resolve, reject) {
    importer.importChunk(chunkName, function(chunk) {
      screen.fadeOut(100).then(function() {
        if(state.chunk) {
          // remove the old chunk
          state.scene.remove(state.chunk);
          state.chunk = null;
        }

        // add the new chunk
        state.chunk = chunk;
        state.scene.add(state.chunk);
        resolve();

        // fade back in
        screen.fadeIn(100);
      });
    });
  });
}

module.exports = screen;
