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
  terrain: three object,
  grid: base64 bitmap,
  zones: [
    {
      type: string,
      position: {},
      rotation: {},
      scale: {},
      connection: string
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

  chunk.name = data.name;

  var terrain = objLoader.parse(data.terrain);
  chunk.terrain = terrain;
  chunk.add(chunk.terrain);

  // load all the zones, and set metadata
  chunk.zones = data.zones.map(function(zone) {
    var box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    box.position.set(zone.position.x, zone.position.y, zone.position.z);
    box.rotation.set(zone.rotation._x, zone.rotation._y, zone.rotation._z);
    box.scale.set(zone.scale.x, zone.scale.y, zone.scale.z);
    //box.visible = false;
    box.type = 'exit';
    box.connection = zone.connection;
    chunk.add(box);
    return box;
  });

  // instantiate all the objects
  data.objects.forEach(function(obj) {
    importer.importModel(obj.id, function(mesh) {
      var clone = mesh.clone();
      clone.position.x = obj.x;
      clone.position.z = obj.z;
      chunk.add(clone);
    });
  });

  chunk.walls = data.walls;

  return chunk;
}

network.on('chunk', createChunk);

module.exports.createChunk = createChunk;
