var io = require('socket.io')();
var statServer = require('socket.io')();
var StaticServer = require('static-server');
var os = require('os');

/* deploy file server */
var server = new StaticServer({
  rootPath:'./static/',
  port: 8080
});
server.start();

/* deploy statistics server */
var staticStats = ['arch', 'cpus', 'endianness', 'homedir', 'hostname', 'networkInterfaces', 'platform', 'release', 'tmpdir', 'totalmem', 'type'];
var dynamicStats = ['freemem', 'loadavg', 'uptime'];

statServer.on('connection', function(socket) {
  socket.emit('spec', staticStats.reduce(function(obj, stat) { obj[stat] = os[stat](); return obj;}, {}));
  // one second updates
  setInterval(() => socket.emit('stat', dynamicStats.reduce(function(obj, stat) { obj[stat] = os[stat](); return obj;}, {})), 1000)
});
statServer.listen(8082);

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

io.listen(8081);
