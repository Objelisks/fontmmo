const THREE = require('../static/three.min.js');
global.THREE = THREE;

const chunkMan = require('./chunkManager.js');
const zoneHelper = require('./zoneHelper.js');

const database = require('./database.js');
const fileserve = require('./fileserve.js');
const sockets = require('./sockets.js');

console.time('startup');
database.start().then(() => {
  fileserve.start();
  sockets.start();

  process.on('unexpectedException', (err) => {
    // TODO: save to database and close
    database.db.close();

    fileserve.server.close();

    // TODO: tell clients we're leaving
    sockets.io.close();

    // actually crash
    throw err;
  });

  // main server update loop
  setInterval(function() {
    Object.keys(chunkMan.chunks).forEach(function(chunkName) {
      let chunk = chunkMan.chunks[chunkName];

      // grab latest input
      let inputs = {};
      Object.keys(chunk.sockets).forEach((key) => {
        let socket = chunk.sockets[key];
        inputs[key] = socket.meta.input;
      });

      // update with input
      let actionEvents = chunk.update(1/15, inputs);
      Object.keys(chunk.objects).forEach((objKey) => {
        zoneHelper.processZones(chunk, chunk.objects[objKey]);
      });

      // send updates
      Object.keys(chunk.sockets).forEach(function(key, i, arr) {
        let socket = chunk.sockets[key];
        if(socket.meta.ready) {
          socket.emit('update', {chunk: chunk.name, events: actionEvents});
        }

        // clear inputs
        socket.meta.input = undefined;
      });
    });
  }, 66); // 1000/15
  console.timeEnd('startup');
});
