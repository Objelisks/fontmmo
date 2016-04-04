let chunk = {};

chunk.update = function(delta, inputMap) {
  let events = [];
  inputMap = inputMap || {};

  Object.keys(this.objects).forEach((objIndex) => {
    let obj = this.objects[objIndex];
    let oldPos = obj.position.clone();
    obj.update(delta, inputMap[objIndex]);
    if(oldPos.sub(obj.position).length() > 0) {
      events.push({
        index: obj.index,
        x: obj.position.x,
        z: obj.position.z
      });
    }
  });

  return events;
};

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
