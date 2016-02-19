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
var activeScreen = "game";
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

/*

screens
  press start
  chargen
  charselect
  game

controls
  arrow keys
  qwer menus
    (Q)uick-strike / (U)pset
    (W)itchcraft / (I)nvocate
    (E)mpathy / (O)ral
    (R)eceptacles / (P)ockets

Pugilist
  Like a cleric, but fists
Occultist
  Symbols, summon demons
Alchemist
  Craft potions
Artificier
  Craft tools
Psychopomp
  Sees dead people
Runner
  Hack into servers, reprogram things
Cryomancer
  Deploy ice, defend servers
Gemwarden
  Destroy gems, remove them from seats of power
Gemwarrior
  Defend gems bring them to seats of power
Telemancer
  Teleportation and transportation magicks
Gunslinger
  Guns, grit
Runeomancer
  Writs runes, lays traps

*/
