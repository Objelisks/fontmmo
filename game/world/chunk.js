/* global THREE */
const importer = require('./import.js');
const state = require('../state.js');
const chunkHelper = require('./chunkHelper.js');
const decor = require('../decor/decor.js');
const particles = require('../particle/particles.js');
const ps = require('../particle/ps.js');
const poly = require('../utils/polygon.js');

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

  chunk.zones = data.zones;

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

  chunk.particles = ps.create();
  let grass = particles.grass.create(256, poly.randomPointInPolygon(chunk.walls[0]));
  chunk.particles.add(grass);

  Object.assign(chunk, chunkHelper.chunkMethods);

  return chunk;
}
