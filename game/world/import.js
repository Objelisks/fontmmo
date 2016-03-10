/* global THREE */
const chunks = require('./chunk.js');

var convertToStandard = function(materials) {
  return materials.map(function(mat) {
    return new THREE.MeshStandardMaterial({color: mat.color, roughness: 1.0, metalness: 0.0});
  });
}

var ajaxGet = function(filename, cb) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => cb(xhr.responseText));
  xhr.open('GET', filename);
  xhr.send();
}

var loader = new THREE.JSONLoader();

// cache
var meshes = {};

module.exports.importChunk = function(chunkName, cb) {
  ajaxGet(`/models/chunks/${chunkName}.json`, function(data) {
    var jsonData = JSON.parse(data);
    var chunk = chunks.createChunk(jsonData);
    cb(chunk);
  });
}

module.exports.importModel = function(path, cb) {
  // TODO: preemptively cache instead of waiting until loaded to put into cache
  if(meshes[path]) {
    cb(meshes[path]);
  } else {
    loader.load(`/models/${path}`, function(geometry, materials) {
      geometry.rotateX(Math.PI/2);
      var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(convertToStandard(materials)));
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      meshes[path] = mesh;
      cb(mesh);
    });
  }
}


module.exports.importObj = function(path, file, cb) {
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath(`/models/${path}/`);
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setBaseUrl(`/models/${path}/`);
  mtlLoader.setPath(`/models/${path}/`);
  mtlLoader.load(`${file}.mtl`, function(materials) {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load(`${file}.obj`, function(obj) {
      obj.scale.set(0.05, 0.05, 0.05);
      obj.rotateX(Math.PI / 2);
      cb(obj);
    })
  })
}
