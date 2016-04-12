var aspect = {};

// blink
// quick teleport to nearby location
aspect.first = {
  // called when ability button is pressed
  client_predict: function(actor) {
    console.log('blink start');
    // call this function when button is pressed
    // starting particles
    // establish state
    // disable ability
  },
  client_finish: function(actor, data) {
    console.log('blink finish');
    actor.position.set(data.x, actor.position.y, data.z);
  },
  // called back from network update
  server: function(actor) {
    // use data
    actor.position.add(new THREE.Vector3(Math.random()*10-5, 0, Math.random()*10-5));
    // more particles at new location
    // delete state
    console.log('blink server');
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
