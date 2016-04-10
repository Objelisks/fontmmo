const zones = require('./zones.js');
const collision = require('../game/interact/collision.js');

module.exports.processZones = function(chunk, obj) {
  // Check to see if player is over any zones
  obj.activeZones = obj.activeZones || [];
  let newActiveZones = [];

  chunk.zones.forEach((zone) => {
    let a = {x: zone.a.x, y: zone.a.z}; // red
    let b = {x: zone.b.x, y: zone.b.z}; // green
    let c = {x: zone.c.x, y: zone.c.z}; // blue

    if(collision.pointInRectangle(obj.position.x, obj.position.z, a, b, c)) {
      let type = zone.type;
      // If we weren't in the zone last frame: enter, else stay
      if(obj.activeZones.indexOf(zone) === -1) {
        zones.enter(type, zone, obj, chunk);
      } else {
        zones.stay(type, zone, obj, chunk);
      }

      newActiveZones.push(zone);
    }
  });

  // For each of the zones which left the active set, call exit
  obj.activeZones.filter((zone) => newActiveZones.indexOf(zone)).forEach((zone) => {
    zones.exit(zone.type, zone, obj, chunk);
  });

  obj.activeZones = newActiveZones;
};
