let assert = require('chai').assert;

const collision = require('../game/interact/collision.js');

describe('collision tests', () => {
  it('should expose api', () => {
    expect(collision.resolveChunkWalls).to.be.a('function');
    expect(collision.intersectCircleLineSegment).to.be.a('function');
    expect(collision.pointInRectangle).to.be.a('function');
  });

  it('should collide with walls', () => {
    let walls = [];
    let movement = new THREE.Vector3(1,0,0);
    let radius = 0.5;
    //expect(collision.resolveChunkWalls(walls, movement, radius))
  })
});
