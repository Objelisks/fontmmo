/* global THREE */
const io = require('socket.io-client');
const actor = require('../actors/actor.js');
const state = require('../state.js');

var local_id = null;
var playerName = 'objelisks';

var socket = io(window.location.hostname + ':8081');

socket.on('connect', function() {
  socket.emit('hello', playerName, function(id) {
    local_id = id;
    console.log('set local id', local_id);
  });
});

var updateSeparation = 100;

module.exports.createNetUpdate = function(player) {
  player.nextUpdate = window.performance.now() + updateSeparation;
  return {
    update: function(delta) {
      var now = window.performance.now();
      if(now > player.nextUpdate) {

        // TODO: update to send input deltas
        // TODO: prediction based on velocity
        socket.emit('move', {id: local_id, x: player.position.x, y: player.position.z, f: player.rotation.z}, function(success) {
          // TODO: fix prediction
        });
        player.nextUpdate = now + updateSeparation;
      }
    }
  }
};


var idMap = {};

socket.on('move', function(data) {
  if(idMap[data.id]) {
    var obj = idMap[data.id];
    obj.netTarget = data;
  }
});

module.exports.createNetReceiver = function(object, id) {
  object.netId = id;
  idMap[id] = object;
  return {
    update: function(delta) {
      if(object.netTarget) {
        object.position.lerp(new THREE.Vector3(object.netTarget.x, object.position.y, object.netTarget.y), 0.1);
        //object.rotation.lerp(new THREE.Vector3(object.netTarget.x, object.netTarget.y, object.position.z), 0.5);
      }
    },
    remove: function() {
      delete object.netId;
      delete idMap[id];
    }
  }
}

// TODO: use data to customize actor
var createFromNetData = function(data) {
  var obj = actor.create({});
  return obj;
}

// {ids}
socket.on('new', function(data) {
  data.ids.forEach(function(id) {
    if(id === local_id) return;
    var obj = createFromNetData(id);
    obj.addPart(module.exports.createNetReceiver(obj, id));
    state.scene.add(obj);
    state.networkActors.push(obj);
  });
});

// {ids}
socket.on('leave', function(data) {
  data.ids.forEach(function(id) {
    if(id === local_id) return;
    state.scene.remove(idMap[id]);
    state.networkActors.splice(state.actors.indexOf(obj), 1);
  });
});


module.exports.on = socket.on.bind(socket);
module.exports.send = socket.emit.bind(socket);
