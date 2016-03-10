var ChunkTracker = {};

var chunks = {};
var activeScene = null;

ChunkTracker.setScene = function(scene) {
  if(scene !== activeScene) {
    // remove chunks from previous scene
  }

  activeScene = scene;

}

ChunkTracker.addChunk = function(chunk) {
  chunks[chunk.name] = chunk;
  activeScene.add(chunk);
}

module.exports = ChunkTracker;
