//const particles = require('')
const collision = require('../interact/collision.js');
const particles = require('../client/particles.js');

let aspect = {};

// blink
// quick teleport to nearby location
aspect.first = {
  // called when ability button is pressed
  client_predict: function(actor) {
    console.log('blink start');
    // starting particles
    // disable ability
  },
  client_finish: function(actor, data) {
    console.log('blink finish');
    actor.position.set(data.x, actor.position.y, data.z);
    // more particles at new location
  },
  server: function(actor) {
    let dir = new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5);
    dir.setLength(5);
    let movement = collision.resolveChunkWalls(actor, dir, 0.5);
    actor.position.add(movement);

    return [{
      index: actor.index,
      type: 'aspect',
      aspect: 'teleport/first',
      x: actor.position.x,
      z: actor.position.z
    }];
  }
};

// teleport
// name a place and go there (chunk change)
aspect.second = {
  client_predict: function(actor) {

  },
  client_finish: function(actor, data) {

  },
  server: function(data) {

  }
};

// warp
// actors near primary actor are sped up
aspect.third = {
  client_predict: function(actor) {

  },
  client_finish: function(actor, data) {

  },
  server: function(data) {

  }
};

module.exports = aspect;
