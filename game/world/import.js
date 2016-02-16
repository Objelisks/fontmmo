
var convertToStandard = function(materials) {
  return materials.map(function(mat) {
    return new THREE.MeshStandardMaterial({color: mat.color, roughness: 1.0, metalness: 0.0});
  });
}

var loader = new THREE.JSONLoader();

module.exports.importModel = function(path, cb) {
  loader.load('../models/' + path, function(geometry, materials) {
    geometry.rotateX(Math.PI/2);
    var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(convertToStandard(materials)));
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    cb(mesh);
  });
}
