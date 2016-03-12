/* global THREE */
var network = require('../network/network.js');
var importer = require('./import.js');
var state = require('../state.js');

// shared materials
var grassMaterial = new THREE.MeshStandardMaterial({ color: 0x63B76D, roughness:0.7, metalness:0.0 });

/*
on enter exit zone, start loading next chunk
place chunk based on offset specified in exit
if chunk was entered not through exit zone, place at origin (remove any other chunks)
render terrain of previous chunks as ghost (max distance one)

data:
{
  name: string,
  terrain: geometry,
  grid: base64 bitmap,
  exits: [
    {
      zone: {x,y,w,h,r},
      target: string,
      offset: {x, y, r}
    },
    ...
  ],
  objects: [
    {
      id: int,
      position: {x,y,z},
      rotation: {x,y,z}
    },
    ...
  ]
}
*/

var jsonLoader = new THREE.JSONLoader();

// Creates a chunk and inserts it into the current scene
var createChunk = module.exports.createChunk = function(data) {
  var chunk = new THREE.Object3D();

  //chunk.position.x = data.x;
  //chunk.position.y = data.y;

  var terrain = jsonLoader.parse(data.terrain);
  terrain.geometry.rotateX(Math.PI/2);
  var convertedMaterials = terrain.materials.map((mat) => {
    var newMat = new THREE.MeshStandardMaterial({color: mat.color, roughness: 1.0, metalness: 0.0});
    newMat.shading = THREE.FlatShading;
    return newMat;
  });

  chunk.terrain = new THREE.Mesh(terrain.geometry, new THREE.MultiMaterial(convertedMaterials));
  chunk.terrain.material.shading = THREE.FlatShading;
  chunk.terrain.receiveShadow = true;
  chunk.add(chunk.terrain);

  chunk.zones = [];

  data.objects.forEach(function(obj) {
    importer.importModel(obj.id, function(mesh) {
      var clone = mesh.clone();
      clone.position.x = obj.x;
      clone.position.y = obj.y;
      chunk.add(clone);
    });
  });

  return chunk;
}

network.on('chunk', createChunk);

module.exports.createChunk = createChunk;
