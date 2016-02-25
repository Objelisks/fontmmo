var screens = require('./game/screens/screens.js');

var width = 1024,
    height = 768;

var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

document.body.appendChild(renderer.domElement);

// set starting screen and initialize
var activeScreen = 'game';
screens[activeScreen].create({character: {}});

// main render, update loop
var clock = new THREE.Clock(true);
var render = function() {
  var screen = screens[activeScreen];
  requestAnimationFrame(render);

  renderer.render(screen.scene, screen.camera);

  // TODO: decouple update from rendering
  var delta = clock.getDelta();
  screen.update(delta);
  // switch screens if needed
}
render();
