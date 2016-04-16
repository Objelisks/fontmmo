let particles = {};

particles.group = new THREE.Object3D();
let groups = {};

let textureLoader = new THREE.TextureLoader();
let particleTextures = ['spark'];

particles.addEmitter = function(type, emitter) {
  if(!groups[type]) {
    textureLoader.load(`./models/particles/${type}.png`, (tex) => {
      groups[type] = new SPE.Group({
        texture: {
          value: tex
        },
        maxParticleCount: 20000,
        depthTest: false,
        depthWrite: false
      });
      particles.group.add(groups[type].mesh);
      groups[type].addEmitter(emitter);
    });
  } else {
    groups[type].addEmitter(emitter);
  }
}

particles.update = function() {
  Object.keys(groups).forEach((groupKey) => groups[groupKey].tick());
}

module.exports = particles;
