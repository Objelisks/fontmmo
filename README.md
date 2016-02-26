# fontmmo

Small mmo game featuring multiple font-based classes.

hello world

### game
#### actors
  Objects that have an update function which gets called every frame
#### classes
  Player class/ability implementation
#### control
  Input handling
#### network
  Network event handling
#### screens
  Menus, character creation, main gameplay
##### modes
  Different interaction schemes within game screen. Uses control api.
#### world
  Terrain, models, collision

### server
#### world
  Stores world/chunk data
#### server.js
  Handles player connections, handles stat.html connections
#### stat.html
  Shows server host information

### static
#### models
  Blender -> three.js-io exporter
#### index.html
  Client interface for playing the game, requires three.min.js, socket.io, compiled.js (output of browserify on main.js)

### main.js
  Input to clientside game, compiles to static/compiled.js using browserify/watchify.
