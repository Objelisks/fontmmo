const state = require('../state.js');

var zones = {
    "exit": {
        "enter": function(hit) {
            var zone = hit.object;
            state.screen.enterChunk(zone.connection, zone.offsetPosition, zone.offsetRotation);
        }
    }
}

var handle = function(op) {
    return function(type, hit) {
        if(zones[type][op]) {
            zones[type][op](hit);
        }
    }
}

module.exports = ['enter', 'stay', 'exit'].reduce((mod, op) => { mod[op] = handle(op); return mod; }, {});
