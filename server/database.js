const spawn = require('child_process').spawn;
const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
const mongoUrl = 'mongodb://localhost:27017/font';

// MongoDB instance
// run mongod service
module.exports.start = function() {
  let mongoInstance = spawn('mongod', ['--dbpath=./server/data']); // port 27017
  mongoInstance.on('error', (err) => {
    console.log('failed to start mongo');
  });

  let promise = new Promise((resolve, reject) => {
      let connectCallback = (err, db) => {
        if(err !== null) {
          console.log('db connect: retrying...');
          setTimeout(mongoClient.connect(mongoUrl, connectCallback), 100);
        }
        console.log('db connect: success');
        module.exports.db = db;
        resolve();
      };
      setTimeout(mongoClient.connect(mongoUrl, connectCallback), 100);
  });

  return promise;
}

module.exports.autosaveUser = function(socket) {
  let location = {
    chunk: socket.meta.currentChunk,
    x: socket.meta.player.position.x,
    z: socket.meta.player.position.z,
    justEnteredFrom: socket.meta.player.justEnteredFrom
  };
  let db = module.exports.db;
  let promise = new Promise((resolve, reject) => {
    db.collection('users').updateOne(
      {"username": socket.meta.token.username},
      {$set: {["characters." + socket.meta.activeCharacter + ".location"]: location}},
      (err, res) => {
        if(!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
  return promise;
}
