/* global THREE */
const input = require('../../control/input.js');
const state = require('../../state.js');
const zones = require('../../world/zones.js');

var UP = new THREE.Vector3(0,0,1);
var NORTH = new THREE.Vector3(0,1,0);
var moveSpeed = 10.0;
var cameraOffset = new THREE.Vector3(0,-10,20);
var activeZones = [];

module.exports.update = function(delta) {
  var movement = new THREE.Vector3 (0,0,0);
  movement.x += input.isDown('left') ? -1 : (input.isDown('right') ? 1 : 0);
  movement.y += input.isDown('up') ? 1 : (input.isDown('down') ? -1 : 0);
  if(movement.length() >= 0) {
    var forward = state.camera.getWorldDirection();
    var rotateAxis = forward.projectOnPlane(UP).normalize();
    var rotation = new THREE.Quaternion().setFromUnitVectors(NORTH, rotateAxis);
    movement.applyQuaternion(rotation);
    movement.normalize();
    state.player.position.add(movement.multiplyScalar(delta * moveSpeed));
    state.player.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(UP, movement), 0.2);
  }
  
  // Check to see if player is over any zones
  var zoneChecker = new THREE.Raytracer(state.player.position, UP.clone().negate());
  var hits = zoneChecker.raycast(state.chunk.zones);
  var newActiveZones = [];
  
  hits.forEach(function(zoneHit) {
    var type = zoneHit.object.type;
    // If we were in the zone last frame stay, else enter
    if(activeZones.indexOf(zoneHit.object)) {
      zones.stay(type, zoneHit);
    } else {
      zones.enter(type, zoneHit);
    }
    
    newActiveZones.push(zoneHit.object);
  });
  
  // For each of the zones which left the active set, call exit
  activeZones.filter((zone) => newActiveZones.indexOf(zone)).forEach((zone) => {
    zones.exit(zone.type);
  });
  activeZones = newActiveZones;
  

  //gridShader.SetVector ("_GridCenter", Vector4.Lerp(gridShader.GetVector("_GridCenter"), new Vector4 (transform.position.x, 0, transform.position.z, 0), 0.1f));

  var cameraLocation = state.player.position.clone().add(cameraOffset);
  state.camera.position.lerp(cameraLocation, 0.2);
  state.camera.lookAt(state.player.position);
  state.light.shadow.camera.position.set(cameraLocation);
}
