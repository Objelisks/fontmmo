const state = require('../state.js');

let Collision = {};

let project = function(a, b) {
  let bp = b.clone().normalize();
  return bp.multiplyScalar(a.dot(bp));
}

Collision.resolveChunkWalls = function(obj, movement, radius) {
  let chunk = obj.chunk;
  let tempLocation = obj.position.clone().add(movement);
  let newMovement = movement.clone();

  chunk.walls.forEach(function(wall) {
    let count = wall.length;
    for(let i=0; i<count; i++) {
      let pt1 = wall[i];
      let pt2 = wall[(i+1)%count];
      let intersect = Collision.getIntersection(tempLocation, radius, pt1.x, pt1.z, pt2.x, pt2.z);
      if(intersect !== null) {
        // TODO: add something to keep object on same side it started
        let normal = new THREE.Vector2(-(pt1.z-pt2.z), pt1.x-pt2.x);
        let amount = radius - intersect;
        let adjustment = normal.normalize().multiplyScalar(amount);
        newMovement.add(new THREE.Vector3(adjustment.x, 0, adjustment.y));
      }
    }
  });
  return newMovement;
}

Collision.getIntersection = function(position, radius, x1, y1, x2, y2) {
  let line = new THREE.Line3(new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0));
  let pt = new THREE.Vector3(position.x, position.z, 0);
  let closePoint = line.closestPointToPoint(pt, true);
  let dist = closePoint.distanceTo(pt);
  if(dist <= radius) {
    // intersection
    return dist;
  } else {
    return null;
  }
}

let test = function() {
  let player = new THREE.Vector3(2, 0, 1);
  let wall = [{x:1, z:0}, {x:1, z:2}];
  let velocity = new THREE.Vector3(1, 0, 0);
  let intersection = Collision.getIntersection(player.add(velocity), 0.5, wall[0].x, wall[0].z, wall[1].x, wall[1].z);
  console.log(intersection);

  console.log(project(new THREE.Vector2(2, 1), new THREE.Vector2(1, 0)))
}

module.exports = Collision;
