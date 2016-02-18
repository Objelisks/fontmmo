var io = require('socket.io-client');
var actor = require('../actors/actor.js');

var local_id = null;
var playerName = 'objelisks';

var socket = io('http://localhost');
socket.on('connect', function() {
  socket.emit('hello', playerName, function(id) {
    local_id = id;
    console.log('set local id', local_id);
  });
});

var updateSeparation = 100;

module.exports.createNetUpdate = function(player) {
  player.nextUpdate = performance.now() + updateSeparation;
  return {
    update: function(delta) {
      var now = performance.now();
      if(now > player.nextUpdate) {
        socket.emit('move', {id: local_id, x: player.position.x, y: player.position.y, f: player.rotation.z}, function(success) {

        });
        // update to send input deltas
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
        object.position.lerp(new THREE.Vector3(object.netTarget.x, object.netTarget.y, object.position.z), 0.5);
        //object.rotation.lerp(new THREE.Vector3(object.netTarget.x, object.netTarget.y, object.position.z), 0.5);
      }
    },
    remove: function() {
      delete object.netId;
      delete idMap[id];
    }
  }
}

var sceneAddCallback;

module.exports.setSceneAddCallback = function(sceneAdd) {
  sceneAddCallback = sceneAdd;
}

var createFromNetData = function(data) {
  var obj = actor.create({});
  obj.name = data.name;
  return obj;
}

// {id, name}
socket.on('new', function(data) {
  var obj = createFromNetData(data);
  obj.position.z = 0.5;
  obj.addPart(module.exports.createNetReceiver(obj, data.id));
  sceneAddCallback(obj);
});
