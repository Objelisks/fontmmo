/* global THREE */
const input = require('../../control/input.js');
const state = require('../../state.js');
const zones = require('../../world/zones.js');
const collision = require('../../interact/collision.js');

var UP = new THREE.Vector3(0,1,0);
var NORTH = new THREE.Vector3(0,0,1);
var moveSpeed = 10.0;
var cameraOffset = new THREE.Vector3(10,20,10);
var activeZones = [];
const fixedDelta = 1/60;

module.exports.update = function(delta) {

  // stop here if chunk is not loaded yet
  if(state.chunk === undefined) {
    return;
  }

  // handle input and move player based on camera direction
  var movement = new THREE.Vector3 (0,0,0);
  movement.x += input.isDown('left') ? 1 : (input.isDown('right') ? -1 : 0);
  movement.z += input.isDown('up') ? 1 : (input.isDown('down') ? -1 : 0);
  if(movement.length() >= 0) {
    var forward = state.camera.getWorldDirection();
    var rotateAxis = forward.projectOnPlane(UP).normalize();
    var rotation = new THREE.Quaternion().setFromUnitVectors(NORTH, rotateAxis);
    movement.applyQuaternion(rotation);
    movement.normalize();
    movement.multiplyScalar(fixedDelta * moveSpeed);

    var actualMovement = collision.resolveChunkWalls(state.player.position, movement, 0.5)

    state.player.position.add(actualMovement);
    state.player.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(UP, actualMovement), 0.2);
  }

  //gridShader.SetVector ("_GridCenter", Vector4.Lerp(gridShader.GetVector("_GridCenter"), new Vector4 (transform.position.x, 0, transform.position.z, 0), 0.1f));

  // update main camera and shadow camera
  var cameraLocation = state.player.position.clone().add(cameraOffset);
  state.camera.position.lerp(cameraLocation, 0.2);
  state.camera.lookAt(state.player.position);
  state.light.shadow.camera.position.set(cameraLocation);

  // Check to see if player is over any zones
  var zoneChecker = new THREE.Raycaster(state.player.position.clone().add(UP), UP.clone().negate());
  var hits = zoneChecker.intersectObjects(state.chunk.zones);
  var newActiveZones = [];

  hits.forEach(function(zoneHit) {
    var type = zoneHit.object.type;
    // If we weren't in the zone last frame: enter, else stay
    if(activeZones.indexOf(zoneHit.object) === -1) {
      zones.enter(type, zoneHit);
    } else {
      zones.stay(type, zoneHit);
    }

    newActiveZones.push(zoneHit.object);
  });

  // For each of the zones which left the active set, call exit
  activeZones.filter((zone) => newActiveZones.indexOf(zone)).forEach((zone) => {
    zones.exit(zone.type, zone);
  });
  activeZones = newActiveZones;
}
