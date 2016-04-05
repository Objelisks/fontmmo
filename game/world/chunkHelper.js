const collision = require('../interact/collision.js');

let chunk = {};

// update all children
// returns a list of changes to active objects
chunk.update = function(delta, inputMap) {
  let events = [];
  inputMap = inputMap || {};

  Object.keys(this.objects).forEach((objIndex) => {
    let obj = this.objects[objIndex];
    let oldPos = obj.position.clone();
    obj.update(delta, inputMap[objIndex]);
    if(oldPos.sub(obj.position).length() > 0) {
      // movement events
      events.push({
        index: obj.index,
        x: obj.position.x,
        z: obj.position.z
      });
    }
    // test zones, zone events
    let zones = this.getZoneEvents(obj);
    events.concat(zones);
  });

  return events;
};

// used for server sending initial data
chunk.getObjectsMessage = function() {
  return Object.keys(this.objects).map((objIndex) => {
    let obj = this.objects[objIndex];
    return {
      index: obj.index,
      type: obj.type,
      x: obj.position.x,
      z: obj.position.z
    };
  });
};

let genIndex = (function() {
  let index = 0;
  return function() {
    index += 1;
    return index;
  }
})();

chunk.getZoneEvents = function(obj) {
  // TODO: real zone checking
  /*

    // Check to see if player is over any zones
    var zoneChecker = new THREE.Raycaster(state.player.position.clone().add(UP), UP.clone().negate());
    var hits = zoneChecker.intersectObjects(state.chunk.zones);
    var newActiveZones = [];

    hits.forEach(function(zoneHit) {
      var type = zoneHit.object.type;
      // If we weren't in the zone last frame: enter, else stay
      if(activeZones.indexOf(zoneHit.object) === -1) {
        zones.enter(type, zoneHit);
      } else {
        zones.stay(type, zoneHit);
      }

      newActiveZones.push(zoneHit.object);
    });

    // For each of the zones which left the active set, call exit
    activeZones.filter((zone) => newActiveZones.indexOf(zone)).forEach((zone) => {
      zones.exit(zone.type, zone);
    });
    activeZones = newActiveZones;
  */

  let events = [];
  this.zones.forEach(function(zone) {
    let a = {x: 0, z: 0};
    let b = {x: 0, z: 0};
    let d = {x: 0, z: 0};
    if(collision.pointInRectangle(obj.position.x, obj.position.z, a, b, d)) {
      events.push({
        index: obj.index,
        type: 'exit',
        connection: zone.connection
      });
    }
  });
  return events;
};

chunk.addObject = function(obj, existingIndex) {
  let index = existingIndex || genIndex();
  obj.index = index;
  obj.chunk = this;
  this.add(obj);
  this.objects[index] = obj;
  return index;
};

chunk.removeIndex = function(index) {
  this.remove(this.objects[index]);
  delete this.objects[index];
}

chunk.removeObject = function(obj) {
  this.remove(obj);
  delete this.objects[obj.index];
}

module.exports.chunkMethods = chunk;
