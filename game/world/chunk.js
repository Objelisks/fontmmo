/* global THREE */
var network = require('../network/network.js');
var importer = require('./import.js');
var state = require('../state.js');

// shared materials
var grassMaterial = new THREE.MeshStandardMaterial({ color: 0x63B76D, roughness:1.0, metalness:0.0 });

// Creates a chunk and inserts it into the current scene
var createChunk = module.exports.createChunk = function(data) {
  var chunk = new THREE.Object3D();

  chunk.position.x = data.x;
  chunk.position.y = data.y;

  chunk.terrain = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), grassMaterial);
  chunk.terrain.receiveShadow = true;
  chunk.add(chunk.terrain);

  data.objects.forEach(function(obj) {
    importer.importModel(obj.id, function(mesh) {
      var clone = mesh.clone();
      clone.position.x = obj.x;
      clone.position.y = obj.y;
      chunk.add(clone);
    });
  });
  
  state.screen.addToScene(chunk);
  
  return chunk;
}

network.on('chunk', createChunk);

module.exports.createChunk = createChunk;