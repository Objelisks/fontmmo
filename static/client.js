/* global THREE */
const state = require('../game/state.js');
const screens = require('../game/screens/screens.js');

let stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

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

  stats.begin();

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

  stats.end();

  requestAnimationFrame(render);
}
render();
