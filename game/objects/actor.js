/* global THREE */
const collision = require('../interact/collision.js');
const state = require('../state.js');
const aspects = require('../aspects/aspects.js');

let actorMaterial = new THREE.MeshStandardMaterial({ color: 0x6DA0A5, roughness:1.0, metalness:0.0 });
let CAMERA_FORWARD = new THREE.Vector3(-0.7071, 0, -0.7071);
let UP = new THREE.Vector3(0,1,0);
let NORTH = new THREE.Vector3(0,0,1);

let handleAspects = function(actor, aspect, stage) {

}

let actorMethods = {
  update: function(delta, input) {
    let events = [];

    // default input
    input = input || {
      'left': 0,
      'right': 0,
      'up': 0,
      'down': 0,
      'a': 0,
      'b': 0,
      'c': 0
    };

    // lerp in server authoritative position
    if(state.client && this.netActive) {
      this.netEvents.forEach((event) => {
        switch(event.type) {
          case 'move':
            let target = new THREE.Vector3(event.x, this.position.y, event.z);
            this.position.lerp(target, 0.1);
            break;
          case 'aspect':
            let aspect = event.aspect.split('/');
            aspects[aspect[0]][aspect[1]].client_finish(this, event);
            break;
        }
      });
      this.netActive = false;
    }

    if(!state.client) {
      if(input['a'] === 2) {
        events = events.concat(aspects[this.aspects.first].first.server(this));
      }
      if(input['b'] === 2) {
        events = events.concat(aspects[this.aspects.second].second.server(this));
      }
      if(input['c'] === 2) {
        events = events.concat(aspects[this.aspects.third].third.server(this));
      }
    } else {
      if(input['a'] === 2) {
        aspects[this.aspects.first].first.client_predict(this);
      }
      if(input['b'] === 2) {
        aspects[this.aspects.second].second.client_predict(this);
      }
      if(input['c'] === 2) {
        aspects[this.aspects.third].third.client_predict(this);
      }
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

    events.push({
      index: this.index,
      type: 'move',
      x: this.position.x,
      z: this.position.z
    });

    return events;
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

  actor.aspects = {
    first: 'teleport',
    second: 'teleport',
    third: 'teleport'
  };

  Object.assign(actor, actorMethods);

  return actor;
};
