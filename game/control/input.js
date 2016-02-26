var keyboard = require('./keyboard.js');

var inputMethods = [keyboard];
// TODO: gamepad input method
// TODO: touch input method

module.exports.isDown = function(key) {
    return inputMethods.some((method) => method.isDown(key));
}

module.exports.justPressed = function(key) {
    return inputMethods.some((method) => method.justPressed(key));
}

module.exports.frameEndCallback = function() {
  inputMethods.forEach((method) => method.frameEndCallback());
}
