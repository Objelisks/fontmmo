var actorMaterial = new THREE.MeshStandardMaterial({ color: 0x6DA0A5, roughness:1.0, metalness:0.0 });

module.exports.create = function(data) {
  var geo = new THREE.SphereGeometry(1, 50, 50);
  var actor = new THREE.Mesh(geo, actorMaterial);
  actor.castShadow = true;
  actor.receiveShadow = true;
  actor.position.z = 0.5;
  actor.parts = [];
  actor.addPart = (p) => actor.parts.push(p);
  actor.isActor = true;

  return actor;
}
