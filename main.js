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

/*

TODO LIST
---------
chunk loading, saving
server serving chunks based on position
client sending input delta instead of abs
movement mechanics / collision
chunk editor
admin mode
character creator
character classes
abilities
ability effects / affects
vaporwave



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

----combat (mostly offensive) choose up to two (0, 1, 2)
Pugilist
  Like a cleric, but fists, and not a cleric
Occultist
  Symbols, summon demons
Alchemist
  Craft potions

----magicks (mostly utility)
Telemancer
  Teleportation and transportation magicks
Runeomancer
  Writs runes, lays traps

----idk
Astronomer
Psychopomp
Artificier

----ancient feud (choose one, no right answer)
Gemwarden
  Defend gems bring them to seats of power
Gemwarrior
  Destroy gems, remove them from seats of power


Wanderer, Cartographer
  - explore the world, find useful information and trade it with those who seek it
    -- find gem, sell location to gemwarden,warrior without getting involved
    -- find mob cavern, trade location with levellers
    -- create maps, trade maps


world building
--------------
villages
npcs
neutral mobs
chunky soft rocks
goals:




*/
