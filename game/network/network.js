/* global THREE */
/* client only */
const io = require('socket.io-client');
const request = require('request');
const objects = require('../objects/objects.js');
const state = require('../state.js');

let socket = null;

let create = function(data) {
  let obj = objects[data.type].create(data);
  state.chunk.addObject(obj, data.index);
};

let leave = function(data) {
  state.chunk.removeIndex(data.index);
}

let handleChunkReady = function(index, pos) {
  console.log('local index', index);
  module.exports.playerIndex = index;
  module.exports.playerRelocate = pos;
}

module.exports.connect = function(token) {
  console.log('token received, attempting to connect web socket');
  socket = io.connect('wss://' + window.location.host); // includes port

  socket.on('connect', () => {
    socket.emit('authenticate', {token: token});
  });

  socket.on('authenticated', () => {
    socket.emit('hello', (chunkName) => {
      state.screen.enterChunk(chunkName).then(() => {
        socket.emit('chunkReady', chunkName, handleChunkReady);
      });
    });
  });

  socket.on('new', (data) => {
    create(data);
  });

  socket.on('objects', (data) => {
    if(data.chunk !== state.chunk.name) { return; }
    data.objects.forEach(create);
  });

  socket.on('leave', (data) => {
    leave(data);
  });

  socket.on('chunk', (data) => {
    module.exports.playerIndex = null;
    state.screen.enterChunk(data.connection).then(() => {
      socket.emit('chunkReady', data.connection, handleChunkReady);
    });
  });

  socket.on('update', (data) => {
    if(data.chunk !== state.chunk.name) { return; }

    Object.keys(state.chunk.objects).forEach((objKey) => {
      let obj = state.chunk.objects[objKey];
      obj.netEvents = [];
    });

    data.events.forEach((data) => {
      let obj = state.chunk.objects[data.index];
      if(!obj) { return; }
      obj.netEvents.push(data);
      obj.netActive = true;
    });
  });

  socket.on('disconnect', (arg) => {
    console.log('net disconnected', arg);
  });
  socket.on('error', (arg) => {
    console.log('net error', arg);
  });
};

module.exports.disconnect = function() {
  if(socket) {
    socket.disconnect();
    delete module.exports.playerIndex;
    socket = null;
  }
};

module.exports.serverAction = function(username, password, action) {
  let origin = window.location.origin;
  let promise = new Promise((resolve, reject) => {
    request.post({
      url: origin + action,
      json: {
        username: username,
        password: password
      }},
      (err, res) => {
        if(err) { return reject(err); }
        if(res.body.token) {
          resolve(res.body.token);
        } else {
          reject(res.body.message);
        }
      });
  });
  return promise;
};

module.exports.sendInputDelta = function(inputDelta) {
  if(socket) {
    socket.emit('input', inputDelta);
  }
};
