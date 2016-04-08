const collision = require('../interact/collision.js');
const zones = require('./zones.js');
const state = require('../state.js');

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
        type: 'move',
        x: obj.position.x,
        z: obj.position.z
      });
    }
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

// TODO: currently global, index per chunk instead?
let genIndex = (function() {
  let index = 0;
  return function() {
    index += 1;
    return index;
  }
})();

chunk.getZoneEvents = function() {
  return Object.keys(this.objects).reduce((events, objIndex) => {
    let obj = this.objects[objIndex];
    // Check to see if player is over any zones
    this.activeZones = this.activeZones || [];
    let newActiveZones = [];

    this.zones.forEach((zone) => {
      let a = {x: zone.a.x, y: zone.a.z}; // red
      let b = {x: zone.b.x, y: zone.b.z}; // green
      let c = {x: zone.c.x, y: zone.c.z}; // blue
      if(collision.pointInRectangle(obj.position.x, obj.position.z, a, b, c)) {
        let type = zone.type;
        // If we weren't in the zone last frame: enter, else stay
        if(this.activeZones.indexOf(zone) === -1) {
          events = events.concat(zones.enter(type, zone));
        } else {
          events = events.concat(zones.stay(type, zone));
        }

        newActiveZones.push(zone);
      }
    });
    // For each of the zones which left the active set, call exit
    this.activeZones.filter((zone) => newActiveZones.indexOf(zone)).forEach((zone) => {
      events = events.concat(zones.exit(zone.type, zone));
    });
    this.activeZones = newActiveZones;

    events = events.map(e => Object.assign(e, {index: obj.index}));
    return events;
  }, []);
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
