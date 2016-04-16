/* global THREE */
/* client only */
const io = require('socket.io-client');
const objects = require('../objects/objects.js');
const state = require('../state.js');

const request = require('request');


let socket = null;
let localOnly = false;

let create = function(data) {
  let obj = objects[data.type].create(data);
  state.chunk.addObject(obj, data.index);
};

let leave = function(data) {
  state.chunk.removeIndex(data.index);
}

let setIndex = function(index) {
  console.log('local index', index);
  module.exports.playerIndex = index;
}

module.exports.connect = function(token) {


  console.log('token received, attempting to connect web socket');
  socket = io.connect('wss://' + window.location.hostname + ':8080', {
    query: 'token=' + token
  });

  socket.emit('hello', token, function(playerData, chunkName) {
    // TODO: customize player based on data
    state.screen.enterChunk(chunkName).then(() => {
      socket.emit('chunkReady', chunkName, setIndex);
    });
  });

  socket.on('new', function(data) {
    create(data);
  });

  socket.on('objects', function(data) {
    if(data.chunk !== state.chunk.name) { return; }
    data.objects.forEach(create);
  });

  socket.on('leave', function(data) {
    leave(data);
  });

  socket.on('chunk', function(data) {
    module.exports.playerIndex = null;
    state.screen.enterChunk(data.connection).then(() => {
      socket.emit('chunkReady', data.connection, function(index, pos) {
        setIndex(index);
        module.exports.playerRelocate = pos;
      });
    });
  });

  socket.on('update', function(data) {
    if(localOnly) { return; }
    if(data.chunk !== state.chunk.name) { return; }

    Object.keys(state.chunk.objects).forEach((objKey) => {
      let obj = state.chunk.objects[objKey];
      obj.netEvents = [];
    });

    data.events.forEach((data) => {
      let obj = state.chunk.objects[data.index];
      if(!obj) {
        return;
      }
      obj.netEvents.push(data);
      obj.netActive = true;
    });
  });

  socket.on('disconnect', function(arg) {
    console.log('disconnected', arg);
  });
  socket.on('error', function(arg) {
    console.log('error', arg);
  });
};

module.exports.authenticate = function(username, password) {
  let origin = window.location.origin;
  let promise = new Promise((resolve, reject) => {
    request.post({
      url: origin + '/authenticate',
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
  socket.emit('input', inputDelta);
};
