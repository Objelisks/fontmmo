/*

how to make abilities work with particles and such effects
all aspects:
  generate a network packet
    implictly: input event, explictly: aspect event
  client side visual effect(s)

some aspects:

no aspects:

*/

const state = require('../state.js');
const collision = require('../interact/collision.js');
const particles = require('../particle/particles.js');

let aspect = {};

// blink
// quick teleport to nearby location
aspect.first = {
  cooldown: 1000,
  // called when ability button is pressed
  client_predict: function(actor) {
    console.log('blink start');
    // spawn starting particles
    let p = particles.teleport.create(32, actor.position);
    state.chunk.particles.add(p);
    setTimeout(() => {
      state.chunk.particles.remove(p);
    }, 1000);

    // make character invisible
    actor.visible = false;

    // disable character controls
  },
  client_finish: function(actor, data) {
    console.log('blink finish');
    // once we receive message from server, wait for a second as animation, then reappear character
    // move character to new position
    actor.position.set(data.x, actor.position.y, data.z);
    // update first particle set target
    setTimeout(() => {
      // make character visible
      actor.visible = true;

      // more particles at new location
      let p = particles.teleport.create(32, actor.position);
      state.chunk.particles.add(p);
      setTimeout(() => {
        state.chunk.particles.remove(p);
      }, 1000);
    }, 1000);
  },
  server: function(actor) {
    let dir = new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5);
    dir.setLength(10);
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
