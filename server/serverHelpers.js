module.exports.switchChunk = function(chunks, socket, chunkName) {
  if(!isValidChunk(chunkName)) {
    return;
  }

  if(socket.currentChunk) {
    socket.broadcast.in(socket.currentChunk).emit('leave', {id: socket.meta.id});
    socket.leave(socket.currentChunk);
    chunks[socket.currentChunk].remove(socket.player);
  }

  if(chunks[chunkName]) === undefined) {
    chunks[chunkName] = loadChunk(msg);
  }
  chunks[chunkName].add(socket.player);

  socket.join(chunkName);
  socket.currentChunk = chunkName;
  socket.broadcast.in(socket.currentChunk).emit('new', {type: 'player', id: socket.meta.id});

  return chunks;
}
