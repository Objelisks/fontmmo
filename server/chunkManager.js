/* server only */
const fs = require('fs');
const createChunk = require('../game/world/chunk.js').createChunk;

module.exports = {};
module.exports.chunks = {};

module.exports.loadChunk = function(name) {
  if(module.exports.chunks[name] === undefined) {
    let content = JSON.parse(fs.readFileSync(`./static/models/chunks/${name}.json`));
    let chunk = createChunk(content);
    chunk.sockets = {};
    module.exports.chunks[name] = chunk;
  }
  return module.exports.chunks[name];
};

module.exports.enterChunk = function(chunk, socket) {
  // generate player id
  let index = chunk.addObject(socket.meta.player);
  chunk.sockets[index] = socket;
  socket.meta.index = index;
  socket.meta.currentChunk = chunk.name;

  socket.meta.ready = false;

  // join chunk room, tell everyone else we're here
  socket.join(socket.meta.currentChunk);
  // TODO: fix player data
  socket.broadcast.in(socket.meta.currentChunk).emit('new', {type: 'actor', index: index, playerData: {}});

  if(socket.meta.player.justEnteredFrom) {
    // assume for now that connections are always two way
    // find the corresponding connection zone and get a random point from it
    let zone = chunk.zones.filter((zone) => zone.connection === socket.meta.player.justEnteredFrom).pop();
    if(zone) {
      let outputPoint = new THREE.Vector3(zone.a.x, 0.5, zone.a.z);
      outputPoint.add(new THREE.Vector3((zone.c.x - zone.a.x) * Math.random(), 0, (zone.c.z - zone.a.z) * Math.random()));
      socket.meta.player.position.copy(outputPoint);
    }
  }
}

module.exports.leaveChunk = function(chunk, socket) {
  if(!socket.meta) { return; }
  let oldIndex = socket.meta.index;

  // remove references in chunk object
  if(chunk) {
    chunk.removeIndex(oldIndex);
    delete chunk.sockets[oldIndex];

    // TODO: cleanup empty chunk references
  }

  // leave room
  socket.broadcast.in(socket.meta.currentChunk).emit('leave', {index: oldIndex});
  socket.leave(socket.meta.currentChunk);

  // null out other data
  socket.meta.player.justEnteredFrom = socket.meta.currentChunk;
  socket.meta.player.activeZones = [];
  socket.meta.currentChunk = null;
  socket.meta.index = null;
  socket.meta.ready = false;
}
