//var classes = require('./classes/classes.js');
//var world = require('./world/world.js');
//var network = require('./net.js');

var players = require('./game/actors/player.js');
var chunks = require('./game/world/chunk.js');
var controls = require('./game/control/keyboard.js');

var world = {};

var width = 1024,
    height = 768;

world.scene = new THREE.Scene();
world.camera = new THREE.PerspectiveCamera(60, width/height, 1, 1000);
world.camera.position.set(0,-10,10);
world.camera.lookAt(new THREE.Vector3(0,0,0));

var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5,-5,10);
dirLight.castShadow = true;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 1000;
dirLight.shadow.camera.left = -25;
dirLight.shadow.camera.right = 25;
dirLight.shadow.camera.top = 25;
dirLight.shadow.camera.bottom = -25;
dirLight.shadow.radius = 2;
dirLight.shadow.mapSize.set(1024, 1024);
world.scene.add(dirLight);
var ambLight = new THREE.AmbientLight(0x808080);
world.scene.add(ambLight);

world.renderer = new THREE.WebGLRenderer({
  antialias: true
});
world.renderer.setSize(width, height);
world.renderer.shadowMap.enabled = true;
world.renderer.shadowMap.type = THREE.PCFShadowMap;

document.body.appendChild(world.renderer.domElement);

var player = players.createPlayer();
player.addPart(controls.createMainController(player, world.camera));
player.add(dirLight.shadow.camera);
world.scene.add(player);

var chunk = chunks.createChunk({});
world.scene.add(chunk);

var clock = new THREE.Clock(true);
var render = function() {
  requestAnimationFrame(render);
  world.renderer.render(world.scene, world.camera);
  var delta = clock.getDelta();
  player.parts.forEach(part => part.update(delta));
}
render();

// get canvas
// start render loop
// run create character
// handle input async
// handle net async


/*

standard font - quirk.ttf

screens
  press start
  chargen
  main screen

controls
  arrow keys
  qwer menus
    quick
    wield
    evoke
    relate

*/
