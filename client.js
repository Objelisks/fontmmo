/* global THREE */
const state = require('./game/state.js');
const screens = require('./game/screens/screens.js');

let width = 1024,
    height = 768;

let renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
state.renderer = renderer;

document.body.appendChild(renderer.domElement);

// set starting screen and initialize
state.screen = screens.game;
state.screen.create({character: {}});

// main render, update loop
let clock = new THREE.Clock(true);
let render = function() {
  let screen = state.screen;
  requestAnimationFrame(render);

  renderer.render(state.scene, state.camera);

  // TODO: decouple update from rendering
  let delta = clock.getDelta();
  screen.update(delta);
  // switch screens if needed
  if(screen.transition) {
    screen.destroy();
    state.screen = screens[screen.transitionToScreen];
    state.screen.create(screen.transitionData);
  }
}
render();
