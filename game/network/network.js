/* global THREE */
const io = require('socket.io-client');
const objects = require('../objects/objects.js');
const state = require('../state.js');

let socket = io(window.location.hostname + ':8081');
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

socket.on('new', function(data) {
  create(data);
});

socket.on('objects', function(datas) {
  datas.forEach(create);
});

socket.on('leave', function(data) {
  leave(data);
});

socket.on('chunk', function(data) {
  module.exports.playerIndex = null;
  state.screen.enterChunk(data.connection).then(() => {
    socket.emit('chunkReady', undefined, setIndex);
  });
});

socket.on('update', function(datas) {
  if(localOnly) { return; }

  datas.forEach((data) => {
    if(data.type === 'exit') {
      leave(data);
      return;
    }

    let obj = state.chunk.objects[data.index];
    if(!obj) {
      return;
    }
    obj.netTarget = data;
    obj.netFrames = 0;
  });

});

module.exports.login = function() {
  let authentication = {
    username: 'objelisks',
    password: 'its a secret to everyone'
  };
  socket.emit('hello', authentication, function(playerData, chunkName) {
    // TODO: customize player based on data
    state.screen.enterChunk(chunkName).then(() => {
      socket.emit('chunkReady', undefined, setIndex);
    });
  });
}

module.exports.sendInputDelta = function(inputDelta) {
  socket.emit('input', inputDelta);
};
