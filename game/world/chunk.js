"use strict"
var importer = require('./import.js');
var grassMaterial = new THREE.MeshStandardMaterial({ color: 0x63B76D, roughness:1.0, metalness:0.0 });

module.exports.createChunk = function(opt) {
  var chunk = new THREE.Object3D();

  chunk.terrain = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), grassMaterial);
  chunk.terrain.receiveShadow = true;
  chunk.add(chunk.terrain);

  importer.importModel('tree.json', function(mesh) {
    for(let i=0; i<20; i++) {
      var clone = mesh.clone();
      clone.position.x = Math.random() * 50 - 25;
      clone.position.y = Math.random() * 50 - 25;
      chunk.add(clone);
    }
  });

  return chunk;
}
