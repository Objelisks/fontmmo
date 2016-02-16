var UP = new THREE.Vector3(0,0,1);
var FORWARD = new THREE.Vector3(0,1,0);
var moveSpeed = 10.0;
var cameraOffset = new THREE.Vector3(0,-10,20);

var keyboard = {};

window.addEventListener('keydown', function(e) {
  keyboard[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
  keyboard[e.keyCode] = false;
});

var input = {
  'left': [65, 37],
  'right': [68, 39],
  'up': [87, 38],
  'down': [83, 40]
}

var isDown = function(key) {
    return input[key].some((code) => keyboard[code]);
}

module.exports.createMainController = function(player, camera) {
  var controller = {};
  controller.update = function(delta) {
    var movement = new THREE.Vector3 (0,0,0);
    movement.x += isDown('left') ? -1 : (isDown('right') ? 1 : 0);
    movement.y += isDown('up') ? 1 : (isDown('down') ? -1 : 0);
    if(movement.length() >= 0) {
      var forward = camera.getWorldDirection();
      var rotation = forward.projectOnPlane(UP).normalize();
      movement.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(FORWARD, rotation));
      movement.normalize();
      player.position.add(movement.multiplyScalar(delta * moveSpeed));
    }

    //gridShader.SetVector ("_GridCenter", Vector4.Lerp(gridShader.GetVector("_GridCenter"), new Vector4 (transform.position.x, 0, transform.position.z, 0), 0.1f));

    camera.position.lerp(player.position.clone().add(cameraOffset), 0.2);
    camera.lookAt (player.position);
  };
  return controller;
}
