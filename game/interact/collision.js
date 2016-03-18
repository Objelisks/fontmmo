var state = require('../state.js');

var Collision = {};

var project = function(a, b) {
  var bp = b.clone().normalize();
  return bp.multiplyScalar(a.dot(bp));
}

Collision.resolveChunkWalls = function(position, movement, radius) {
  var tempLocation = position.clone().add(movement);
  var newMovement = movement.clone();

  state.chunk.walls.forEach(function(wall) {
    var count = wall.length;
    for(let i=0; i<count; i++) {
      var pt1 = wall[i];
      var pt2 = wall[(i+1)%count];
      var intersect = Collision.getIntersection(tempLocation, radius, pt1.x, pt1.z, pt2.x, pt2.z);
      if(intersect !== null) {
        var normal = new THREE.Vector2(-(pt1.z-pt2.z), pt1.x-pt2.x);
        var amount = radius - intersect;
        var adjustment = normal.normalize().multiplyScalar(amount);
        newMovement.add(new THREE.Vector3(adjustment.x, 0, adjustment.y));
/*
        var move2d = new THREE.Vector2(newMovement.x, newMovement.z);
        var projection = project(move2d, new THREE.Vector2(pt2.x-pt1.x, pt2.y-pt1.y));
        var rejection = move2d.sub(projection).normalize().multiplyScalar(intersect*0.9);
        newMovement.add(new THREE.Vector3(-rejection.x, 0, -rejection.y));
        */
        console.log('intersect', newMovement);
      }
    }
  });
  return newMovement;
}

Collision.getIntersection = function(position, radius, x1, y1, x2, y2) {
  var line = new THREE.Line3(new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0));
  var pt = new THREE.Vector3(position.x, position.z, 0);
  var closePoint = line.closestPointToPoint(pt, true);
  var dist = closePoint.distanceTo(pt);
  if(dist <= radius) {
    // intersection
    return dist;
  } else {
    return null;
  }
}

var test = function() {
  var player = new THREE.Vector3(2, 0, 1);
  var wall = [{x:1, z:0}, {x:1, z:2}];
  var velocity = new THREE.Vector3(1, 0, 0);
  var intersection = Collision.getIntersection(player.add(velocity), 0.5, wall[0].x, wall[0].z, wall[1].x, wall[1].z);
  console.log(intersection);

  console.log(project(new THREE.Vector2(2, 1), new THREE.Vector2(1, 0)))
}

test();

module.exports = Collision;
