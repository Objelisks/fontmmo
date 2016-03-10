var actor = require('../actors/actor.js');
var input = require('../control/input.js');
var network = require('../network/network.js');
var modes = require('./modes/modes.js');
var importer = require('../world/import.js');

var state = require('../state.js');

var activeMode;
var screen = {};

var width = 1024,
    height = 768;

var initializeState = function() {
  var scene = new THREE.Scene();
  state.scene = scene;

  var camera = new THREE.PerspectiveCamera(60, width/height, 1, 1000);
  camera.position.set(0,-10,10);
  camera.lookAt(new THREE.Vector3(0,0,0));
  state.camera = camera;

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
  state.light = dirLight;

  var ambLight = new THREE.AmbientLight(0x808080);
  scene.add(ambLight);

  state.actors = [];
}

screen.addToScene = function(obj) {
  state.scene.add(obj);
  if(obj.isActor) {
    state.actors.push(obj);
  }
}

screen.removeFromScene = function(obj) {
  state.scene.remove(obj);
  if(obj.isActor) {
    state.actors.splice(state.actors.indexOf(obj), 1);
  }
}

screen.create = function(data) {
  initializeState();

  // TODO: don't like this
  network.setSceneAddCallback(screen.addToScene);
  network.setSceneRemoveCallback(screen.removeFromScene);

  var player = actor.create(data.character);
  player.addPart(network.createNetUpdate(player));
  //player.add(state.light.shadow.camera);
  screen.addToScene(player);
  state.player = player;

  activeMode = modes.explore;

  // init chunk
  /*
  var chunk = chunks.createChunk({
    'objects':[
      {'id': 'tree.json', 'x': 0, 'y': 2}
    ],
    'x': 0,
    'y': 0
  });
  screen.addToScene(chunk);
  */

  screen.enterChunk('waterfall');

}

screen.destroy = function() {
  //TODO?
}

screen.update  = function(delta) {
  state.actors.forEach((a) => a.parts.forEach(part => part.update(delta)));
  activeMode.update(delta);
  input.frameEndCallback();
  // update visible chunks

  // handle mode transition also
  // build generic state machine for screens, modes
  // might want it to handle menuing system as well?

  /*
    // want to transition:

    screen.transition = true;
    screen.transitionToScreen = 'charload';
    screen.transitionData = {};
  */
}

screen.enterChunk = function(chunkName) {
  importer.importChunk(chunkName, function(chunk) {
    screen.addToScene(chunk);
  });
}

module.exports = screen;
