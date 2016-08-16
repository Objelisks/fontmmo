const fs = require('fs');
const spawn = require('child_process').spawn;

try {
  fs.accessSync('./server/data/', fs.R_OK | fs.W_OK);
} catch(err) {
  fs.mkdirSync('./server/data/');
}

let mongoInstance = spawn('mongod', ['--dbpath=./server/data']); // port 27017
mongoInstance.on('error', (err) => {
  console.log('failed to start mongo');
});

const mongoUrl = 'mongodb://localhost:27017/font';
const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;

setTimeout(() => {
  mongoClient.connect(mongoUrl, (err, db) => {
    if(err !== null) {
      console.log('mongo error', err);
    }
    console.log('connected to mongo db');
    doThing(db);
  });
}, 5000);

function doThing(db) {
  db.createCollection('users', (err, result) => {
    result.createIndex({username: 1});
    console.log('done');
  });
};
