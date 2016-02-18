var io = require('socket.io')(80);

var ids = {};
var genId = function(type) {
  if(ids[type] === undefined) {
    ids[type] = 0;
  }
  ids[type] += 1;
  return ids[type];
}

io.on('connection', function(socket) {
  socket.on('hello', function(playerName, fn) {
    var id = genId('player');
    console.log('HELLO', 'generated player', id, playerName);
    socket.broadcast.emit('new', {id: id, name: playerName});
    fn(id);
  });

  socket.on('move', function(msg, fn) {
    console.log('MOVE', msg);
    socket.broadcast.emit('move', {id: msg.id, x: msg.x, y: msg.y, f: msg.f});
    // TODO: collision check / movement validation
    //fn(true);
  });

  socket.on('disconnect', function() {
    // cope with abandonment
  });
});
