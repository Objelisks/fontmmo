/* global THREE */
const importer = require('./import.js');
const state = require('../state.js');
const chunkHelper = require('./chunkHelper.js');

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
      type: string,
      position: {x,y,z},
      rotation: {x,y,z}
    },
    ...
  ],
  walls: [
    [{x: number, z: number}, ...],
    ...
  ]
}
*/

let jsonLoader = new THREE.JSONLoader();
let objLoader = new THREE.ObjectLoader();

// Creates a chunk
module.exports.createChunk = function(data) {
  let chunk = new THREE.Object3D();

  chunk.name = data.name;

  let terrain = objLoader.parse(data.terrain);
  chunk.terrain = terrain;
  chunk.terrain.receiveShadow = true;
  chunk.add(chunk.terrain);

  // load all the zones, and set metadata
  chunk.zones = data.zones.map(function(zone) {
    let box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    box.position.set(zone.position.x, zone.position.y, zone.position.z);
    box.rotation.set(zone.rotation._x, zone.rotation._y, zone.rotation._z);
    box.scale.set(zone.scale.x, zone.scale.y, zone.scale.z);
    box.material.visible = false;
    box.type = 'exit';
    box.connection = zone.connection;
    chunk.add(box);
    return box;
  });

  // instantiate all the objects
  data.objects.forEach(function(obj) {
    importer.importModel(obj.id, function(mesh) {
      let clone = mesh.clone();
      clone.position.x = obj.x;
      clone.position.z = obj.z;
      chunk.add(clone);
    });
  });

  chunk.objects = {};

  chunk.walls = data.walls;

  Object.assign(chunk, chunkHelper.chunkMethods);

  return chunk;
}
