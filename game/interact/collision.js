const state = require('../state.js');

let Collision = {};

Collision.resolveChunkWalls = function(obj, movement, radius) {
  let chunk = obj.chunk;

  // we want to do continuous collision detection, so test at intervals along the movement
  // for short distances (most of them) this will only be about 1-2 steps
  // we still want this because the server simulates at larger steps than the client
  // NOTE: not sure why, but offset = r*2 does not work: passes through walls
  let testOffsets = [];
  let offset = radius;
  let remainder = movement.length();
  while(remainder > offset) {
    testOffsets.push(offset);
    remainder -= offset;
  }
  testOffsets.push(remainder);

  let newMovement = new THREE.Vector3();
  let adjustments = new THREE.Vector3();
  let step = movement.clone();

  // order of walls shouldn't matter (don't worry abt it)
  chunk.walls.forEach(function(wall) {
    let count = wall.length;
    for(let i=0; i<count; i++) {
      let pt1 = wall[i];
      let pt2 = wall[(i+1)%count];
      newMovement.set(0,0,0);

      let penetrated = false;
      testOffsets.forEach(function(offset, i) {
        step.setLength(offset);
        newMovement.add(step);

        // if we've already entered the line, negate the rest of the movement
        if(penetrated) {
          adjustments.sub(step);
          return;
        }

        let intersect = Collision.intersectCircleLineSegment(newMovement.clone().add(obj.position), radius, pt1.x, pt1.z, pt2.x, pt2.z);
        if(intersect !== null) {
          penetrated = true;
          // NOTE: moves towards inside of clockwise specified polygon (normal is always pointing inwards)
          let normal = new THREE.Vector2(-(pt1.z-pt2.z), pt1.x-pt2.x);
          let amount = radius - intersect;
          // adjustment is movement to place the circle adjacent to wall
          let adjustment = normal.setLength(amount);
          adjustments.add(new THREE.Vector3(adjustment.x, 0, adjustment.y));
        }
      }); // end offsets some
    } // end for
  }); // end walls each
  return movement.clone().add(adjustments);
}

Collision.intersectCircleLineSegment = function(position, radius, x1, y1, x2, y2) {
  let line = new THREE.Line3(new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0));
  let pt = new THREE.Vector3(position.x, position.z, 0);
  let closePoint = line.closestPointToPoint(pt, true);
  let dist = closePoint.distanceTo(pt);
  if(dist < radius) {
    // intersection
    return dist;
  } else {
    return null;
  }
}

module.exports = Collision;
