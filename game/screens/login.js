const network = require('../network/network.js');
const state = require('../state.js');

let screen = {};

let beginOAuthLogin = function() {
  let username = 'objelisks';
  let password = 'secret password';
  network.authenticate(username, password)
    .then((token) => {
      console.log('good', token);
      state.token = token;
      // transition
      screen.transition = true;
      screen.transitionToScreen = 'game';
      screen.transitionData = {token: token};
    })
    .catch((err) => {
      console.log('error', err);
    });
}

let width = 1024,
    height = 768;

screen.create = function() {
  let scene = new THREE.Scene();
  state.scene = scene;

  let camera = new THREE.PerspectiveCamera(60, width/height, 1, 1000);
  camera.position.set(0,10,-10);
  camera.lookAt(new THREE.Vector3(0,0,0));
  state.camera = camera;


  // add login buttons
  window.addEventListener('click', beginOAuthLogin);
};

screen.destroy = function() {
  //TODO?
};

screen.update = function() {

};

module.exports = screen;
