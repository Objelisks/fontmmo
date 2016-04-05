/* global THREE */
const collision = require('../interact/collision.js');
const state = require('../state.js');

let actorMaterial = new THREE.MeshStandardMaterial({ color: 0x6DA0A5, roughness:1.0, metalness:0.0 });
let CAMERA_FORWARD = new THREE.Vector3(-0.7071, 0, -0.7071);
let UP = new THREE.Vector3(0,1,0);
let NORTH = new THREE.Vector3(0,0,1);

let actorMethods = {
  update: function(delta, input) {
    // default input
    input = input || {
      'left': 0,
      'right': 0,
      'up': 0,
      'down': 0
    };

    // lerp in server authoritative position
    if(state.client && this.netTarget) {
      this.netFrames += 1;
      let target = new THREE.Vector3(this.netTarget.x, this.position.y, this.netTarget.z);
      this.position.lerp(target, 0.1/this.netFrames);
      //return;
    }

    // handle input and move player based on camera direction
    let movement = new THREE.Vector3 (input.left - input.right, 0, input.up - input.down);
    let actualMovement = new THREE.Vector3();

    // don't do collision if we're not moving
    if(movement.length() > 0) {
      // rotate movement to camera local
      let rotation = new THREE.Quaternion().setFromUnitVectors(NORTH, CAMERA_FORWARD);
      movement.applyQuaternion(rotation);
      movement.normalize();
      movement.multiplyScalar(delta * this.moveSpeed);

      // collision
      // TODO: handle object collision (before wall collision)
      actualMovement.copy(collision.resolveChunkWalls(this, movement, 0.5));
      this.position.add(actualMovement);
    }

    // speed lines
    this.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(UP, actualMovement), 0.2);
  }
};

module.exports.create = function(data) {
  let actor = new THREE.Object3D();
  let model = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), actorMaterial);
  model.castShadow = true;
  model.receiveShadow = true;
  actor.add(model);

  actor.position.y = 0.5;
  actor.type = 'actor';
  actor.moveSpeed = 10.0;

  Object.assign(actor, actorMethods);

  return actor;
};
