var editorChunk;
var activeObject;

module.exports.setActiveChunk = function(chunk) {
  editorChunk = chunk;
}

module.exports.addObject = function() {
  editorChunk.add(activeObject);
}

var dist = function(a, b) {
  return 0;
}

module.exports.removeObject = function(pos) {
  var removeObj = editorChunk.children.reduce((cur, next) => (dist(pos, cur.position) < dist(pos, next.position)) ? cur : next, null);
  editorChunk.remove(removeObj);
}
