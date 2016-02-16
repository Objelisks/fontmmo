var playerMaterial = new THREE.MeshStandardMaterial({ color: 0x6DA0A5, roughness:1.0, metalness:0.0 });

module.exports.createPlayer = function(opt) {
  var geo = new THREE.SphereGeometry(1, 50, 50);
  var player = new THREE.Mesh(geo, playerMaterial);
  player.castShadow = true;
  player.receiveShadow = true;
  player.position.z = 0.5;
  player.parts = [];
  player.addPart = (p) => player.parts.push(p);

  return player;
}
