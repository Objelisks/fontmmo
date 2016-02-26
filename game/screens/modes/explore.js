var input = require('../../control/input.js');
var state = require('../../state.js');

var UP = new THREE.Vector3(0,0,1);
var FORWARD = new THREE.Vector3(0,1,0);
var moveSpeed = 10.0;
var cameraOffset = new THREE.Vector3(0,-10,20);

module.exports.update = function(delta) {
  var movement = new THREE.Vector3 (0,0,0);
  movement.x += input.isDown('left') ? -1 : (input.isDown('right') ? 1 : 0);
  movement.y += input.isDown('up') ? 1 : (input.isDown('down') ? -1 : 0);
  if(movement.length() >= 0) {
    var forward = state.camera.getWorldDirection();
    var rotation = forward.projectOnPlane(UP).normalize();
    movement.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(FORWARD, rotation));
    movement.normalize();
    state.player.position.add(movement.multiplyScalar(delta * moveSpeed));
  }

  //gridShader.SetVector ("_GridCenter", Vector4.Lerp(gridShader.GetVector("_GridCenter"), new Vector4 (transform.position.x, 0, transform.position.z, 0), 0.1f));

  state.camera.position.lerp(state.player.position.clone().add(cameraOffset), 0.2);
  state.camera.lookAt(state.player.position);

  if(input.justPressed('editor')) {
      //editorMode = !editorMode;
  }
}
