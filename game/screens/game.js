var actor = require('../actors/actor.js');
var chunks = require('../world/chunk.js');
var controls = require('../control/keyboard.js');
var network = require('../network/network.js');

var screen = {};

var width = 1024,
    height = 768;

var initializeScene = function(screen) {
  var scene = new THREE.Scene();
  screen.scene = scene;

  var camera = new THREE.PerspectiveCamera(60, width/height, 1, 1000);
  camera.position.set(0,-10,10);
  camera.lookAt(new THREE.Vector3(0,0,0));
  screen.camera = camera;

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5,-5,10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 1000;
  dirLight.shadow.camera.left = -25;
  dirLight.shadow.camera.right = 25;
  dirLight.shadow.camera.top = 25;
  dirLight.shadow.camera.bottom = -25;
  dirLight.shadow.mapSize.set(1024, 1024);
  scene.add(dirLight);
  screen.light = dirLight;

  var ambLight = new THREE.AmbientLight(0x808080);
  scene.add(ambLight);

  screen.actors = [];
}

var addToScene = function(obj) {
  screen.scene.add(obj);
  if(obj.isActor) {
    screen.actors.push(obj);
  }
}

var removeFromScene = function(obj) {
  screen.scene.remove(obj);
  if(obj.isActor) {
    screen.actors.splice(screen.actors.indexOf(obj), 1);
  }
}

screen.create = function(data) {
  initializeScene(screen);
  network.setSceneAddCallback(addToScene);
  network.setSceneRemoveCallback(removeFromScene);

  var player = actor.create(data.character);
  player.addPart(controls.createMainController(player, screen.camera));
  player.addPart(network.createNetUpdate(player));
  player.add(screen.light.shadow.camera);
  addToScene(player);

  var chunk = chunks.createChunk({});
  screen.scene.add(chunk);
}

screen.destroy = function() {
  //TODO?
}

screen.update  = function(delta) {
  screen.actors.forEach((a) => a.parts.forEach(part => part.update(delta)));

  // update visible chunks
  // update other actors
}

module.exports = screen;
