
var pressed = {};

// 0: not pressed, 1: held, 2: pressed this frame
window.addEventListener('keydown', function(e) {
  pressed[e.keyCode] = e.repeat ? 1 : 2;
  e.preventDefault();
});

window.addEventListener('keyup', function(e) {
  pressed[e.keyCode] = 0;
  e.preventDefault();
});

window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

module.exports.update = function(delta) {
  Object.keys(pressed).forEach(function (keyCode) {
    if(pressed[keyCode] === 2) {
      pressed[keyCode] = 1;
    }
  });
}

var input = {
  'left': [65, 37],
  'right': [68, 39],
  'up': [87, 38],
  'down': [83, 40],
  'a': [13],
  'b': [],
  'c': []
}

module.exports.isDown = function(key) {
    return input[key].some((code) => (pressed[code] || 0) > 0);
}

module.exports.justPressed = function(key) {
    return input[key].some((code) => pressed[code] === 2);
}
