var keyboard = require('./keyboard.js');

var inputMethods = [keyboard];
// TODO: gamepad input method
// TODO: touch input method


// generic input names
/*

directions are normalized 2d unit vector separated into axes
'left'
'right'
'up'
'down'

buttons are 0: off, 1: pressed, 2: just pressed
'a'
'b'
'c'

*/

var inputTypes = [
  'left',
  'right',
  'up',
  'down',
  'a',
  'b',
  'c'
]

module.exports.isDown = function(key) {
    return inputMethods.some((method) => method.isDown(key));
}

module.exports.justPressed = function(key) {
    return inputMethods.some((method) => method.justPressed(key));
}


// return an input delta, which can be consumed by network and clientside prediction
module.exports.update = function(delta) {
  inputMethods.forEach((method) => method.update(delta));

  var inputDelta = {};
  inputTypes.forEach((type) => inputDelta[type] = module.exports.isDown(type) ? 1:0);
  return inputDelta;
}
