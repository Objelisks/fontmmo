/* global THREE */
const state = require('../game/state.js');
const screens = require('../game/screens/screens.js');

// set starting screen and initialize
state.client = true;
state.screen = screens.login;
state.screen.create();

// main render, update loop
let clock = new THREE.Clock(true);
let render = function() {
  let screen = state.screen;

  // TODO: decouple update from rendering
  let delta = clock.getDelta();

  screen.update(delta);
  // switch screens if needed
  if(screen.transition) {
    screen.destroy();
    state.screen = screens[screen.transitionToScreen];
    state.screen.create(screen.transitionData);
  }
  
  requestAnimationFrame(render);
}
render();
