/* global THREE */
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
  camera.position.set(0,10,-10);
  camera.lookAt(new THREE.Vector3(0,0,0));
  state.camera = camera;

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5,10,-5);
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

var fadeObject = new THREE.Mesh(new THREE.SphereGeometry(2),
  new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.0, side: THREE.DoubleSide}));

screen.create = function(data) {
  initializeState();

  // TODO: don't like this
  network.setSceneAddCallback(screen.addToScene);
  network.setSceneRemoveCallback(screen.removeFromScene);

  var player = actor.create(data.character);
  player.addPart(network.createNetUpdate(player));
  screen.addToScene(player);
  state.player = player;

  state.scene.add(fadeObject);

  activeMode = modes.explore;

  screen.enterChunk('waterfall');

  state.scene.add(new THREE.AxisHelper(5));
}

screen.destroy = function() {
  //TODO?
}

screen.update  = function(delta) {
  state.actors.forEach((a) => a.parts.forEach(part => part.update(delta)));
  activeMode.update(delta);
  input.update(delta);
  TWEEN.update();

  fadeObject.position.copy(state.camera.position);
}

screen.fadeOut = function(time, cb) {
  var tween = new TWEEN.Tween(fadeObject.material)
    .to({opacity: 1.0}, time);
  if(cb) {
    tween.onComplete(cb);
  }
  tween.start();
}

screen.fadeIn = function(time, cb) {
  var tween = new TWEEN.Tween(fadeObject.material)
    .to({opacity: 0.0}, time);
  if(cb) {
    tween.onComplete(cb);
  }
  tween.start();
}


// load the chunk, when done loading fade out and replace chunks, then fade back in
screen.enterChunk = function(chunkName, position, rotation) {
  importer.importChunk(chunkName, function(chunk) {
    screen.fadeOut(100, function() {
      var outputPoint = chunk.position;
      if(state.chunk) {
        // assume for now that connections are always two way
        // find the corresponding connection zone and get a random point from it
        var zoneConnection = chunk.zones.filter((zone) => zone.connection === state.chunk.name)[0];
        if(zoneConnection) {
          outputPoint = zoneConnection.localToWorld(zoneConnection.position.clone());
          outputPoint.add(new THREE.Vector3(
            zoneConnection.scale.x * (Math.random()-0.5),
            zoneConnection.scale.y * (Math.random()-0.5),
            zoneConnection.scale.z * (Math.random()-0.5)));
        }
        // deactivate zone until the zone is left
        zoneConnection.justEntered = true;

        // remove the old chunk
        screen.removeFromScene(state.chunk);
      }

      // add the new chunk
      state.chunk = chunk;
      screen.addToScene(state.chunk);

      // update the player and camera position
      // TODO: do this in explore.js to consolidate camera offset
      state.player.position.copy(outputPoint);
      state.player.position.y = 0.5;
      state.camera.position.copy(state.player.position.clone().add(new THREE.Vector3(0, 10, 20)));

      // fade back in
      screen.fadeIn(100);
    });

  });
}

module.exports = screen;
