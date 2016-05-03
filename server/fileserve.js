const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const database = require('./database.js');
const secret = require('./secret.js');

let httpsOpt = {
  key: fs.readFileSync('./server/ssl/https.key'),
  cert: fs.readFileSync('./server/ssl/https.crt')
};

module.exports.start = function() {
  let app = express();

  app.use(express.static('./static'));
  app.use(bodyParser.json());

  // TODO: captcha?
  app.post('/register', function(req, res) {
    console.log('received register message');
    if(!database.db) { return res.json({message: 'database not ready, try again', tryagain: true}); }
    if(!req.body) { return res.json({message: 'invalid message'}); }

    // validate correct format
    // TODO: use lgtm module to validate objects
    let user = req.body;
    if(!user.username || !user.password) { return res.json({message: 'invalid message'}); }
    if(typeof user.username !== 'string' || user.username.length < 4) { return res.json({message: 'invalid username'}); }
    if(typeof user.password !== 'string' || user.password.length < 6) { return res.json({message: 'invalid password'}); }

    // check to see if user already exists
    database.db.collection('users').findOne({"username" : user.username}, (err, result) => {
      if(result) { return res.json({message: 'user already exists'}); }
      console.log('user does not exist');

      // TODO: email link/validation?
      // generate hash + salt
      let salt = crypto.randomBytes(512).toString('hex');
      crypto.pbkdf2(user.password, salt, 99999, 512, (err, hash) => {
        if(err) { return res.json({message: 'server error'}); }
        console.log('finished generating hash');

        // store new user record
        database.db.collection('users').insertOne({
          username: user.username,
          password: hash.toString('hex'),
          salt: salt,
          characters: [
            {
              name: 'bippo',
              location: {
                chunk: 'waterfall',
                x: 0,
                z: 0
              }
            }
          ]
        }, (err, result) => {
          if(err) { return res.json({message: 'server error'}); }
          console.log('inserted user');

          // all done, log in the user
          let token = jwt.sign(user, secret, { expiresIn: '12h' });
          res.json({token: token});
          console.log('user logged in');
        });
      });
    });
  });

  app.post('/authenticate', function(req, res) {
    if(!database.db) { return res.json({message: 'database not ready, try again', tryagain: true}); }
    if(!req.body) { return res.json({message: 'invalid message'}); }

    // validate correct format
    let user = req.body;

    if(user.token) {
      if(typeof user.token !== 'string') {
        return res.json({message: 'invalid login'});
      }
      jwt.verify(user.token, secret, (err, decoded) => {
        if(err) {
          return res.json({message: err});
        } else {
          return res.json({token: user.token});
        }
      });
      return;
    }

    if(!user.username || !user.password || typeof user.username !== 'string' || typeof user.password !== 'string') {
      return res.json({message: 'invalid login'});
    }

    // check username
    database.db.collection('users').findOne({"username" : user.username}, (err, result) => {
      if(!err && result) {
        // check password
        crypto.pbkdf2(user.password, result.salt, 99999, 512, (err, hash) => {
          if(hash.toString('hex') === result.password) {
            let token = jwt.sign(user, secret, {});
            res.json({token: token});
          } else {
            res.json({message: 'invalid login'});
          }
        });
      } else {
        res.json({message: 'invalid username'});
      }
    });
  });

  console.log('fileserver:', 'starting');

  module.exports.server = https.createServer(httpsOpt, app)
    .on('error', (err) => {
      console.log('fileserver:', err);
    })
    .listen(8080, () => {
      console.log('fileserver:', 'success');
    });
}
