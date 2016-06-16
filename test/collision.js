let assert = require('chai').assert;

const collision = require('../game/interact/collision.js');

describe('collision tests', () => {
  it('should expose api', () => {
    assert.isTrue(collision.resolveChunkWalls).to.be.a('function');
    assert.isTrue(collision.intersectCircleLineSegment).to.be.a('function');
    assert.isTrue(collision.pointInRectangle).to.be.a('function');
  });

  it('should collide with walls', () => {
    let walls = [];
    let movement = new THREE.Vector3(1,0,0);
    let radius = 0.5;
    //assert.isTrue(collision.resolveChunkWalls(walls, movement, radius))
  });
});
