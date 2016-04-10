var aspect = {};

// blink
// quick teleport to nearby location
aspect.first = {
  // called when ability button is pressed
  start: function(actor) {
    // call this function when button is pressed
    // starting particles
    // establish state
    // disable ability
  },
  // called back from network update
  finish: function(data) {
    // use data
    actor.position.set(data.location.x, actor.position.y, data.location.z);
    // more particles at new location
    // delete state
  }
}

// teleport
// name a place and go there (chunk change)
aspect.second = {
  start: function(actor) {

  },
  finish: function(data) {

  }
}

// warp
// actors near primary actor are sped up
aspect.third = {
  start: function(actor) {

  },
  finish: function(data) {

  }
}

return aspect;
