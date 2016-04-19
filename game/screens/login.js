const network = require('../network/network.js');
const state = require('../state.js');
const React = require('react');
const ReactDOM = require('react-dom');

let screen = {};

let LoginBox = React.createClass({
  getInitialState: function() {
    return {username: '', password: ''};
  },
  handleUsername: function(event) {
    this.setState({ username: event.target.value });
  },
  handlePassword: function(event) {
    this.setState({ password: event.target.value });
  },
  handleLogin: function(event) {
    if(event) { event.preventDefault(); }
    console.log('logging in...');
    network.serverAction(this.state.username, this.state.password, '/authenticate')
      .then((token) => {
        console.log('login successful', token);
        state.token = token;
        // transition
        screen.transition = true;
        screen.transitionToScreen = 'game';
        screen.transitionData = {token: token};
      })
      .catch((err) => {
        console.log('login error:', err);
      });
  },
  handleRegister: function(event) {
    if(event) { event.preventDefault(); }
    console.log('registering account...');
    network.serverAction(this.state.username, this.state.password, '/register')
      .then((message) => {
        console.log('registration successful...');
        this.handleLogin();
      })
      .catch((err) => {
        console.log('register error:', err);
      });
  },
  render: function() {
    return (
      <form onSubmit={this.handleLogin}>
        <input type="text" placeholder="username" value={this.state.username} onChange={this.handleUsername}/>
        <input type="password" placeholder="password" value={this.state.password} onChange={this.handlePassword}/>
        <input type="submit" value="Login" onClick={this.handleLogin}/>
        <input type="submit" value="Register" onClick={this.handleRegister}/>
      </form>
    );
  }
});

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
  ReactDOM.render(<LoginBox />, document.getElementById('game'));
};

screen.destroy = function() {
  //TODO?
};

screen.update = function() {

};

module.exports = screen;
