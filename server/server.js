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

let chunks = {};
let loadChunk = function(name) {
  if(chunks[name] === undefined) {
    let content = JSON.parse(fs.readFileSync(`./static/models/chunks/${name}.json`));
    let chunk = createChunk(content);
    chunk.sockets = {};
    chunks[name] = chunk;
  }
  return chunks[name];
};
let playerData = JSON.parse(fs.readFileSync('./server/playerData.json'));

let enterChunk = function(chunk, socket) {
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

  if(socket.meta.leftChunk) {
    // assume for now that connections are always two way
    // find the corresponding connection zone and get a random point from it
    let zone = chunk.zones.filter((zone) => zone.connection === socket.meta.leftChunk).pop();
    if(zone) {
      let outputPoint = new THREE.Vector3(zone.a.x, 0.5, zone.a.z);
      outputPoint.add(new THREE.Vector3((zone.c.x-zone.a.x)*Math.random(), 0, (zone.c.z-zone.a.z)*Math.random()));
      socket.meta.player.position.copy(outputPoint);
    }
    // deactivate zone until the zone is left
    socket.meta.justEntered = true;
  }
}

let leaveChunk = function(chunk, socket) {
  let oldIndex = socket.meta.index;

  // remove references in chunk object
  chunk.removeIndex(oldIndex);
  delete chunk.sockets[oldIndex];

  // leave room
  socket.broadcast.in(socket.meta.currentChunk).emit('leave', {index: oldIndex});
  socket.leave(socket.meta.currentChunk);

  // null out other data
  socket.meta.leftChunk = socket.meta.currentChunk;
  socket.meta.currentChunk = null;
  socket.meta.index = null;
  socket.meta.ready = false;
}

// deploy game server
io.on('connection', function(socket) {
  // store per-client info here
  socket.meta = {
    index: null,
    player: null,
    currentChunk: null,
  };

  // sent to server on connect
  socket.on('hello', function(authentication, fn) {
    //console.log('hello', authentication.username);
    // TODO: validate authentication
    let playerName = 'objelisks';
    let data = playerData[playerName];

    // TODO: default playerData if non-existant

    // generate player model from stored customization parameters
    socket.meta.player = actor.create(data.player);
    socket.meta.player.socket = socket;

    // load stored player location
    let chunkName = data.chunk || "waterfall";
    socket.meta.player.position.x = data.location.x;
    socket.meta.player.position.z = data.location.z;

    // load chunk if needed
    let activeChunk = loadChunk(chunkName);

    enterChunk(activeChunk, socket);

    console.log('hello', socket.meta.index);
    fn(data.player, chunkName); // ack
  });

  socket.on('chunkReady', function(data, fn) {
    socket.meta.ready = true;

    // tell socket player about actors in the new chunk
    let chunkObjects = chunks[socket.meta.currentChunk].getObjectsMessage();
    socket.emit('objects', chunkObjects);

    fn(socket.meta.index);
  });

  // validate movement
  socket.on('input', function(msg) {
    socket.meta.input = msg;
  });

  socket.on('disconnect', function() {
    console.log('goodbye', socket.meta.index);
    if(chunks[socket.meta.currentChunk]) {
      leaveChunk(chunks[socket.meta.currentChunk], socket);
    }

    // TODO: cleanup empty chunk references
  });
});

io.listen(8081);

setInterval(function() {
  Object.keys(chunks).forEach(function(chunkName) {
    let chunk = chunks[chunkName];
    let inputs = {};
    Object.keys(chunk.sockets).forEach((key) => {
      let socket = chunk.sockets[key];
      inputs[key] = socket.meta.input;
    });

    let actionEvents = chunk.update(1/15, inputs);

    // test zones, zone events
    let zoneEvents = [];
    zoneEvents = chunk.getZoneEvents();

    zoneEvents = zoneEvents.some(function(zone) {
      if(!fs.existsSync(`./static/models/chunks/${zone.connection}.json`)) { return false; }
      // for each exit zone event, perform some tasks
      let obj = chunk.objects[zone.index];
      let socket = chunk.sockets[zone.index];

      let newChunk = loadChunk(zone.connection);
      leaveChunk(chunk, socket);
      enterChunk(newChunk, socket);

      socket.emit('chunk', zone);
      return true;
    });

    let events = actionEvents.concat(zoneEvents);

    Object.keys(chunk.sockets).forEach(function(key, i, arr) {
      let socket = chunk.sockets[key];
      if(socket.meta.ready) {
        socket.emit('update', events);
      }
    });
  });
}, 66); // 1000/10

console.log('running');
