const fs = require('fs');
const socketioJwt = require('socketio-jwt');
const actor = require('../game/objects/actor.js');
const chunkMan = require('./chunkManager.js');
const database = require('./database.js');
const fileserve = require('./fileserve.js');
const secret = require('./secret.js');

module.exports.start = function() {
  let io = require('socket.io')(fileserve.server, {origins:"http://localhost:* http://fontmmo-objelisks.c9users.io:* https://localhost:* https://fontmmo-objelisks.c9users.io:*"});

  module.exports.io = io;

  // deploy game server
  io.on('connection', socketioJwt.authorize({
    secret: secret,
    timeout: 5000
  })).on('authenticated', function(socket) {
    // store per-client info here
    socket.meta = {
      index: null,
      player: null,
      currentChunk: null,
    };

    // sent to server on connect
    socket.on('hello', function(fn) {
      let token = socket.decoded_token;
      socket.meta.token = token;
      socket.meta.activeCharacter = 0;

      console.log('hello', socket.meta.token.username);

      database.db.collection('users').findOne({username: token.username}, (err, data) => {
        let character = data.characters[socket.meta.activeCharacter];

        // generate player model from stored customization parameters
        socket.meta.player = actor.create(character);
        socket.meta.player.socket = socket;

        // load stored player location
        let chunkName = character.location.chunk || "waterfall";
        socket.meta.player.position.x = character.location.x;
        socket.meta.player.position.z = character.location.z;
        socket.meta.player.justEnteredFrom = character.location.justEnteredFrom;

        // load chunk if needed
        let activeChunk = chunkMan.loadChunk(chunkName);

        chunkMan.enterChunk(activeChunk, socket);

        fn(chunkName); // ack
      });
    });

    socket.on('chunkReady', function(data, fn) {
      socket.meta.ready = true;
      // TODO: handle rando data

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
      console.log('goodbye', socket.meta.token.username);
      //database.autosaveUser(socket);?
      chunkMan.leaveChunk(chunkMan.chunks[socket.meta.currentChunk], socket);
    });
  });

  console.log('sockets:', 'success');
};
