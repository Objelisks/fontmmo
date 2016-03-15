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
var objLoader = new THREE.ObjectLoader();

// Creates a chunk and inserts it into the current scene
var createChunk = module.exports.createChunk = function(data) {
  var chunk = new THREE.Object3D();

  //chunk.position.x = data.x;
  //chunk.position.y = data.y;

  var terrain = objLoader.parse(data.terrain);
  chunk.terrain = terrain;
  chunk.add(chunk.terrain);

  chunk.zones = data.zones.map(function(zone) {
    var box = new THREE.Mesh(new THREE.BoxGeometry(zone.scale.x, zone.scale.y, zone.scale.z), new THREE.MeshBasicMaterial());
    box.position.set(zone.position.x, zone.position.y, zone.position.z);
    box.rotation.set(zone.rotation._x, zone.rotation._y, zone.rotation._z);
    //box.visible = false;
    box.type = 'exit';
    box.connection = zone.connection;
    box.offsetPosition = zone.offsetPosition;
    box.offsetRotation = zone.offsetRotation;
    chunk.add(box);
    return box;
  });

  data.objects.forEach(function(obj) {
    importer.importModel(obj.id, function(mesh) {
      var clone = mesh.clone();
      clone.position.x = obj.x;
      clone.position.z = obj.z;
      chunk.add(clone);
    });
  });

  return chunk;
}

network.on('chunk', createChunk);

module.exports.createChunk = createChunk;
