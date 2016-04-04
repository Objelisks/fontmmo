const THREE = require('../static/three.min.js');
global.THREE = THREE;

const io = require('socket.io')();
const StaticServer = require('static-server');
const os = require('os');
const fs = require('fs');
const actor = require('../game/objects/actor.js');
const createChunk = require('../game/world/chunk.js').createChunk;
const importer = require('../game/world/import.js');

// deploy file server
let server = new StaticServer({
  rootPath:'./static/',
  port: 8080
});
server.start();

/*
// deploy statistics server
const statServer = require('socket.io')();
let staticStats = ['arch', 'cpus', 'endianness', 'homedir', 'hostname', 'networkInterfaces', 'platform', 'release', 'tmpdir', 'totalmem', 'type'];
let dynamicStats = ['freemem', 'loadavg', 'uptime'];

statServer.on('connection', function(socket) {
  socket.emit('spec', staticStats.reduce(function(obj, stat) { obj[stat] = os[stat](); return obj;}, {}));
  // one second updates
  setInterval(() => socket.emit('stat', dynamicStats.reduce(function(obj, stat) { obj[stat] = os[stat](); return obj;}, {})), 1000)
});
statServer.listen(8082);
*/

let loadChunk = function(name) {
  let content = JSON.parse(fs.readFileSync(`./static/models/chunks/${name}.json`));
  let chunk = createChunk(content);
  chunk.sockets = [];
  return chunk;
};
let playerData = JSON.parse(fs.readFileSync('./server/playerData.json'));
let chunks = {};

// deploy game server
io.on('connection', function(socket) {
  // store per-client info here
  socket.meta = {
    index: null,
    history: []
  };

  // sent to server on connect
  socket.on('hello', function(authentication, fn) {
    console.log('hello', authentication.username);
    // TODO: validate authentication
    let playerName = 'objelisks';
    let data = playerData[playerName];

    // TODO: default playerData if non-existant

    // generate player model from stored customization parameters
    socket.meta.player = actor.create(data.player);

    // load stored player location
    socket.meta.currentChunk = data.chunk || "waterfall";
    socket.meta.player.position.x = data.location.x;
    socket.meta.player.position.z = data.location.z;

    // load chunk if needed
    if(chunks[socket.meta.currentChunk] === undefined) {
      chunks[socket.meta.currentChunk] = loadChunk(socket.meta.currentChunk);
    }
    let activeChunk = chunks[socket.meta.currentChunk];
    activeChunk.sockets.push(socket);

    // generate player id
    let index = activeChunk.addObject(socket.meta.player);
    socket.meta.index = index;

    fn(data.player, index); // ack

    // join chunk room, tell everyone else we're here
    socket.join(socket.meta.currentChunk);
    socket.broadcast.in(socket.meta.currentChunk).emit('new', {type: 'actor', index: index, playerData: playerData[playerName].player});

    // tell socket player about actors in the current chunk
    let chunkObjects = activeChunk.getObjectsMessage();
    socket.emit('objects', chunkObjects);
  });

  // validate movement
  socket.on('input', function(msg) {
    socket.meta.input = msg;
  });

  socket.on('disconnect', function() {
    socket.broadcast.emit('leave', {id: socket.meta.index});

    // TODO: cleanup chunk references
  });
});

io.listen(8081);

setInterval(function() {
  Object.keys(chunks).forEach(function(chunkName) {
    let chunk = chunks[chunkName];
    let inputs = {};
    chunk.sockets.forEach((socket) => inputs[socket.meta.index] = socket.meta.input);

    let events = chunk.update(1/15, inputs);
    // TODO: figure out chunk transition
    // TODO: zone check

    chunk.sockets.forEach(function(socket) {
      socket.emit('update', events);
    });
  });
}, 66); // 1000/10

console.log('running');
