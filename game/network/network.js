/* global THREE */
const io = require('socket.io-client');
const objects = require('../objects/objects.js');
const state = require('../state.js');

let socket = io(window.location.hostname + ':8081');
let localOnly = false;

socket.on('update', function(data) {
  if(localOnly) { return; }

  data.forEach((dataPoint) => {
    let obj = state.chunk.objects[dataPoint.index];
    if(!obj) {
      return;
    }
    obj.netTarget = dataPoint;
    obj.netFrames = 0;
  });

});

let create = function(data) {
  let obj = objects[data.type].create(data);
  state.chunk.addObject(obj, data.index);
};

socket.on('new', function(data) {
  create(data);
});

socket.on('objects', function(datas) {
  datas.forEach(create);
});

socket.on('leave', function(data) {
  state.chunk.removeObj(data.index);
});

module.exports.login = function() {
  let authentication = {
    username: 'objelisks',
    password: 'its a secret to everyone'
  };
  socket.emit('hello', authentication, function(data, index) {
    console.log('local index', index, data);
    module.exports.playerIndex = index;
  });
}

module.exports.sendInputDelta = function(inputDelta) {
  socket.emit('input', inputDelta);
};
