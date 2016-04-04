var aspect = {};


aspect.blink = {
  initiate: function(actor) {
    network.send('act', 'blink');
  },
  action: function(data) {
    actor.position.set(data.x, actor.position.y, data.z);
  },
  effect: function() {
    // spawn particles
  }
}

// name a place and go there
aspect.teleport = {

}

// actors near primary actor are sped up
aspect.warp = {

}
