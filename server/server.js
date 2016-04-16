const THREE = require('../static/three.min.js');
global.THREE = THREE;

const StaticServer = require('static-server');
const fs = require('fs');
const actor = require('../game/objects/actor.js');
const chunkMan = require('./chunkManager.js');
const zoneHelper = require('./zoneHelper.js');

// get secrets
let secret = fs.readFileSync('./server/secret');
let playerData = JSON.parse(fs.readFileSync('./server/playerData.json'));

const socketioJwt = require('socketio-jwt');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
let app = express();

app.use(express.static('./static'));
app.use(bodyParser.json());

app.post('/authenticate', function(req, res) {
  let user = req.body;
  // TODO: check username/password
  console.log('authentication', user.username, user.password);
  if(true) {
    let token = jwt.sign(user, secret, {});
    res.json({token: token});
  } else {
    res.json({message: 'invalid login'});
  }
});

let httpsOpt = {
  key: fs.readFileSync('./server/ssl/https.key'),
  cert: fs.readFileSync('./server/ssl/https.crt')
};

let server = https.createServer(httpsOpt, app).listen(8080);

let io = require('socket.io').listen(server);
io.set('authorization', socketioJwt.authorize({
  secret: secret,
  handshake: true
}));

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
    let activeChunk = chunkMan.loadChunk(chunkName);

    chunkMan.enterChunk(activeChunk, socket);

    console.log('hello', socket.meta.index, socket.handshake);
    fn(data.player, chunkName); // ack
  });

  socket.on('chunkReady', function(data, fn) {
    socket.meta.ready = true;

    // tell socket player about actors in the new chunk
    let chunkObjects = chunkMan.chunks[data].getObjectsMessage();
    socket.emit('objects', {chunk: data, objects: chunkObjects});

    fn(socket.meta.index, socket.meta.player.position);
  });

  // validate movement
  socket.on('input', function(msg) {
    if(socket.meta.input !== undefined) {
      Object.keys(msg).forEach((button) => {
        socket.meta.input[button] = Math.max(msg[button] || 0, socket.meta.input[button] || 0);
      });
    } else {
      socket.meta.input = msg;
    }
  });

  socket.on('disconnect', function() {
    console.log('goodbye', socket.meta.index);
    chunkMan.leaveChunk(chunkMan.chunks[socket.meta.currentChunk], socket);
  });
});

//io.listen(8081);

// main server update loop
setInterval(function() {
  Object.keys(chunkMan.chunks).forEach(function(chunkName) {
    let chunk = chunkMan.chunks[chunkName];

    // grab latest input
    let inputs = {};
    Object.keys(chunk.sockets).forEach((key) => {
      let socket = chunk.sockets[key];
      inputs[key] = socket.meta.input;
    });

    // update with input
    let actionEvents = chunk.update(1/15, inputs);
    Object.keys(chunk.objects).forEach((objKey) => {
      zoneHelper.processZones(chunk, chunk.objects[objKey]);
    });

    // send updates
    Object.keys(chunk.sockets).forEach(function(key, i, arr) {
      let socket = chunk.sockets[key];
      if(socket.meta.ready) {
        socket.emit('update', {chunk: chunk.name, events: actionEvents});
      }

      // clear inputs
      socket.meta.input = undefined;
    });
  });
}, 66); // 1000/15
