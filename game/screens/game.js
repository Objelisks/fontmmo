/* global THREE, TWEEN */
const actor = require('../objects/actor.js');
const input = require('../control/input.js');
const network = require('../network/network.js');
const modes = require('./modes/modes.js');
const importer = require('../world/import.js');
const state = require('../state.js');

let screen = {};

let fadeObject = new THREE.Mesh(new THREE.SphereGeometry(2),
  new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.0, side: THREE.DoubleSide}));
let cameraOffset = new THREE.Vector3(10,20,10);

let width = 1024,
    height = 768;

screen.create = function(data) {
  let scene = new THREE.Scene();
  state.scene = scene;

  let camera = new THREE.PerspectiveCamera(60, width/height, 1, 1000);
  camera.position.set(0,10,-10);
  camera.lookAt(new THREE.Vector3(0,0,0));
  state.camera = camera;

  let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5,10,-5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 100;
  dirLight.shadow.camera.left = -16;
  dirLight.shadow.camera.right = 16;
  dirLight.shadow.camera.top = 16;
  dirLight.shadow.camera.bottom = -16;
  dirLight.shadow.mapSize.set(1024, 1024);
  scene.add(dirLight);
  state.light = dirLight;

  let ambLight = new THREE.AmbientLight(0x808080);
  scene.add(ambLight);

  state.scene.add(fadeObject);

  screen.enterChunk('waterfall').then(() => network.login());
}

screen.destroy = function() {
  //TODO?
}

screen.update  = function(delta) {
  TWEEN.update();

  let inputDelta = input.update(delta);
  network.sendInputDelta(inputDelta);

  if(network.playerIndex) {
    var inputMap = {};
    inputMap[network.playerIndex] = inputDelta;
    state.chunk.update(delta, inputMap);

    // update main camera and shadow camera
    let player = state.chunk.objects[network.playerIndex];
    let cameraLocation = player.position.clone().add(cameraOffset);
    let otherCameraLocation = player.position.clone().add(new THREE.Vector3(5,10,-5));
    state.camera.position.lerp(cameraLocation, 0.1);
    state.camera.lookAt(player.position);
    // TODO: figure out shadow camera
    // state.light.position.copy(otherCameraLocation);
  }

  // TODO: zone check?

  fadeObject.position.copy(state.camera.position);
}

screen.fadeOut = function(time) {
  let tween = new TWEEN.Tween(fadeObject.material)
    .to({opacity: 1.0}, time)
    .start();
  return new Promise(function(resolve, reject) {
    tween.onComplete(resolve);
  });
}

screen.fadeIn = function(time) {
  let tween = new TWEEN.Tween(fadeObject.material)
    .to({opacity: 0.0}, time)
    .start();
  return new Promise(function(resolve, reject) {
    tween.onComplete(resolve);
  });
}

let cleanupChunk = function() {
  // remove the old chunk
  state.scene.remove(state.chunk);
  state.chunk = null;
}

// load the chunk, when done loading fade out and replace chunks, then fade back in
screen.enterChunk = function(chunkName) {
  return new Promise(function(resolve, reject) {
    importer.importChunk(chunkName, function(chunk) {
      screen.fadeOut(100).then(function() {
        let outputPoint = chunk.position;
        if(state.chunk) {
          // assume for now that connections are always two way
          // find the corresponding connection zone and get a random point from it
          let zoneConnection = chunk.zones.filter((zone) => zone.connection === state.chunk.name)[0];
          if(zoneConnection) {
            outputPoint = zoneConnection.localToWorld(zoneConnection.position.clone());
            outputPoint.add(new THREE.Vector3(zoneConnection.scale.x * (Math.random()-0.5), 0,
                                              zoneConnection.scale.z * (Math.random()-0.5)));
          }
          // deactivate zone until the zone is left
          zoneConnection.justEntered = true;

          // remove the old chunk
          cleanupChunk();
        }

        //network.send('chunk_transition', chunkName);

        // add the new chunk
        state.chunk = chunk;
        state.scene.add(state.chunk);
        resolve();

        // TODO: add player to chunk (get new chunk id from network)

        // update the player and camera position
        // TODO: do this in explore.js to consolidate camera offset
        //state.player.position.copy(outputPoint);
        //state.player.position.y = 0.5;
        //state.camera.position.copy(state.player.position.clone().add(new THREE.Vector3(0, 10, 20)));

        // fade back in
        screen.fadeIn(100);
      });

    });

  });
}

module.exports = screen;
