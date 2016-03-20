var io = require('socket.io')();
var statServer = require('socket.io')();
var StaticServer = require('static-server');
var os = require('os');

// deploy file server
var server = new StaticServer({
  rootPath:'./static/',
  port: 8080
});
server.start();

/*
// deploy statistics server
var staticStats = ['arch', 'cpus', 'endianness', 'homedir', 'hostname', 'networkInterfaces', 'platform', 'release', 'tmpdir', 'totalmem', 'type'];
var dynamicStats = ['freemem', 'loadavg', 'uptime'];

statServer.on('connection', function(socket) {
  socket.emit('spec', staticStats.reduce(function(obj, stat) { obj[stat] = os[stat](); return obj;}, {}));
  // one second updates
  setInterval(() => socket.emit('stat', dynamicStats.reduce(function(obj, stat) { obj[stat] = os[stat](); return obj;}, {})), 1000)
});
statServer.listen(8082);
*/


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

/* deploy game server */
io.on('connection', function(socket) {
  // store per-client info here
  socket.meta = {};
  socket.history = [];

  // sent to server on connect
  socket.on('hello', function(playerName, fn) {
    // generate player id
    var id = genId('player');
    socket.meta.id = id;

    // load stored player data
    // set up location
    // socket.join(initialchunkroom);
    // socket.currentChunk = initialchunkroom;

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

    // store packet history (data + time)
    msg.recvDate = new Date();
    socket.history.push(msg);
    if(socket.history.length > 3) {
      socket.history.shift();
    }

    // TODO: collision check / movement validation
    if(Math.random() < 0.1) {
      //cheat detection
      // check move speed
      // calc speed = pos2-pos1/time
      // do a thing if speed is greater than it should be
      // check collision
    }

    // if everything checks out
    // send update to each other client
    socket.broadcast.in(socket.currentChunk).emit('move', {id: msg.id, x: msg.x, y: msg.y, f: msg.f});

    // tell player they're good to go
    //fn(true);
  });

  socket.on('chunk_transition', function(msg) {
    console.log(msg);
    socket.broadcast.in(socket.currentChunk).emit('leave', {ids: [socket.meta.id]});
    socket.leave(socket.currentChunk);
    socket.join(msg);
    socket.currentChunk = msg;
    socket.broadcast.in(socket.currentChunk).emit('new', {ids: [socket.meta.id]});
  });

  socket.on('disconnect', function() {
    console.log('GOODBYE', 'player leave', socket.meta.id);
    // cope with abandonment
    socket.broadcast.emit('leave', {ids: [socket.meta.id]});
  });
});

io.listen(8081);
