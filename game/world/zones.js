const state = require('../state.js');

var zones = {
  "exit": {
    "enter": function(zone) {
      return [{
        type: 'exit',
        connection: zone.connection
      }];
    },
    "stay": function(zone) {
      return [];
    },
    "exit": function(zone) {
      //zone.justEntered = false;
      // TODO: link this to socket.meta.justEntered
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
