var io = require('socket.io')(80);

// generate increasing ids
// might need to store this in a file later if persistence is needed
var ids = {};
var genId = function(type) {
  if(ids[type] === undefined) {
    ids[type] = 0;
  }
  ids[type] += 1;
  return ids[type];
}

io.on('connection', function(socket) {
  // store per-client info here
  socket.meta = {};

  // sent to server on connect
  socket.on('hello', function(playerName, fn) {
    // generate player id
    var id = genId('player');
    socket.meta.id = id;
    console.log('HELLO', 'generated player', id, playerName);
    fn(id); // ack

    // send list of connected ids to new client
    // send new client id to existing clients
    var connected = io.sockets.connected;
    var existingIds = Object.keys(connected).map((key) => connected[key].meta.id);
    socket.emit('new', {ids: existingIds});
    socket.broadcast.emit('new', {ids: [id]});
  });

  // validate movement
  socket.on('move', function(msg, fn) {
    // send update to each other client
    socket.broadcast.emit('move', {id: msg.id, x: msg.x, y: msg.y, f: msg.f});
    // TODO: collision check / movement validation
    //fn(true);
  });

  socket.on('disconnect', function() {
    console.log('GOODBYE', 'player leave', socket.meta.id);
    // cope with abandonment
    socket.broadcast.emit('leave', {ids: [socket.meta.id]});
  });
});
