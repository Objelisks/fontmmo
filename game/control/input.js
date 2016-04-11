const keyboard = require('./keyboard.js');

let inputMethods = [keyboard];
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

let axes = [
  'left',
  'right',
  'up',
  'down'
];
let buttons = [
  'a',
  'b',
  'c'
];

module.exports.isDown = function(key) {
    return inputMethods.some((method) => method.isDown(key));
}

module.exports.justPressed = function(key) {
    return inputMethods.some((method) => method.justPressed(key));
}

// return an input delta, which can be consumed by network and clientside prediction
module.exports.update = function(delta) {
  let inputDelta = {};
  axes.forEach((type) => inputDelta[type] = module.exports.isDown(type) ? 1:0);
  buttons.forEach((type) => inputDelta[type] = module.exports.justPressed(type) ? 2 : (module.exports.isDown(type) ? 1 : 0));
  inputMethods.forEach((method) => method.update(delta));
  return inputDelta;
}
