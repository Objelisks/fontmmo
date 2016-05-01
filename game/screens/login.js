const network = require('../network/network.js');
const state = require('../state.js');
const React = require('react');
const ReactDOM = require('react-dom');

let screen = {};

let switchToGame = function(token) {
  // transition
  screen.transition = true;
  screen.transitionToScreen = 'game';
  screen.transitionData = {token: token};
};

let LoginBox = React.createClass({
  getInitialState: function() {
    return {username: localStorage.getItem('username') || '', password: ''};
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
    network.serverAction('/authenticate', this.state.username, this.state.password)
      .then((token) => {
        console.log('login successful', token);
        state.token = token;
        localStorage.setItem('username', this.state.username);
        localStorage.setItem('token', token);
        switchToGame(token);
      })
      .catch((err) => {
        console.log('login error:', err);
      });
  },
  handleRegister: function(event) {
    if(event) { event.preventDefault(); }
    console.log('registering account...');
    network.serverAction('/register', this.state.username, this.state.password)
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

screen.create = function() {
  let token = localStorage.getItem('token');
  if(token) {
    network.serverAction('/authenticate', token)
      .then((message) => {
        switchToGame(message);
      })
      .catch((err) => {
        localStorage.setItem('token', undefined);
        ReactDOM.render(<LoginBox />, document.getElementById('game'));
      });
  } else {
    ReactDOM.render(<LoginBox />, document.getElementById('game'));
  }
};

screen.destroy = function() {
  ReactDOM.unmountComponentAtNode(document.getElementById('game'));
};

screen.update = function() {

};

module.exports = screen;
