/* server only */
const fs = require('fs');
const chunkMan = require('./chunkManager.js');

var zones = {
  "exit": {
    "enter": function(zone, obj, chunk) {
      if(obj.justEnteredFrom === zone.connection) { return; }
      if(!fs.existsSync(`./static/models/chunks/${zone.connection}.json`)) { return; }

      // for each exit zone event, perform some tasks
      let socket = chunk.sockets[obj.index];

      let newChunk = chunkMan.loadChunk(zone.connection);
      chunkMan.leaveChunk(chunk, socket);
      chunkMan.enterChunk(newChunk, socket);

      socket.emit('chunk', zone);
    },
    "exit": function(zone, obj, chunk) {
      obj.justEnteredFrom = null;
    }
  }
}

// convenience function so each zone doesn't have to have all ops
var handle = function(op) {
  return function(type, zone, obj, chunk) {
    if(zones[type][op]) {
      zones[type][op](zone, obj, chunk);
    }
  }
}

module.exports = ['enter', 'stay', 'exit'].reduce((mod, op) => { mod[op] = handle(op); return mod; }, {});
