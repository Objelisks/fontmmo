const state = require('../state.js');

var zones = {
  "exit": {
    "enter": function(zone) {
      if(zone.justEntered) {
        return [];
      }
      //state.screen.enterChunk(zone.connection, zone.offsetPosition, zone.offsetRotation);
      return {
        type: 'exit',
        connection: zone.connection
      };
    },
    "exit": function(zone) {
      zone.justEntered = false;
      return [];
    }
  }
}

// convenience function so each zone doesn't have to have all ops
var handle = function(op) {
  return function(type, hit) {
    if(zones[type][op]) {
      return zones[type][op](hit);
    } else {
      return [];
    }
  }
}

module.exports = ['enter', 'stay', 'exit'].reduce((mod, op) => { mod[op] = handle(op); return mod; }, {});
