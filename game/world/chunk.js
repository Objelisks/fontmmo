var grassMaterial = new THREE.MeshStandardMaterial({ color: 0x63B76D, roughness:1.0, metalness:0.0 });

module.exports.createChunk = function(opt) {
  var chunk = new THREE.Object3D();

  chunk.terrain = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), grassMaterial);
  chunk.terrain.receiveShadow = true;
  chunk.add(chunk.terrain);

  return chunk;
}
