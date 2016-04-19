# fontmmo

mmo

## Installation (for hosting server)
`npm install`

Install an appropriate version of mongodb, and make sure mongod is on yr path.

## Running server
`npm run initdb` generate database if not done already

`npm run dev` (run at least once, and then needed only if edits to clientside files are made)

`npm run start`

open `https://localhost:8080`

## Controls

keyboard:

* wasd or arrow keys: movement
* h,j,k or z,x,c: abilities (1,2,3)

gamepad:

* left stick: movement
* X, A, B: abilities (1,2,3)

## Production Preparation

* change secret to something else  (server/secret)
* generate https certificate/key and sign with lets encrypt (server/ssl/)
* run servers as above

## Handy Docs

https://nodejs.org/dist/latest-v4.x/docs/api/index.html

http://mongodb.github.io/node-mongodb-native/2.0/api/index.html

https://facebook.github.io/react/docs/forms.html

http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene

https://github.com/socketio/socket.io
