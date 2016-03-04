/* global THREE */
var convertToStandard = function(materials) {
  return materials.map(function(mat) {
    return new THREE.MeshStandardMaterial({color: mat.color, roughness: 1.0, metalness: 0.0});
  });
}

var loader = new THREE.JSONLoader();

// cache
var meshes = {};

module.exports.importModel = function(path, cb) {
  // TODO: preemptively cache instead of waiting until loaded to put into cache
  if(meshes[path]) {
    cb(meshes[path]);
  } else {
    loader.load('../models/' + path, function(geometry, materials) {
      geometry.rotateX(Math.PI/2);
      var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(convertToStandard(materials)));
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      meshes[path] = mesh;
      cb(mesh);
    });
  }
}
