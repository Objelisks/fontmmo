
// from THREE.js examples, modified for THREE.Triangle
let randomPointInTriangle = function () {
  var vector = new THREE.Vector3();

  return function ( triangle ) {
    var point = new THREE.Vector3();
    var a = Math.random();
    var b = Math.random();

    if ( ( a + b ) > 1 ) {
      a = 1 - a;
      b = 1 - b;
    }

    var c = 1 - a - b;

    point.copy( triangle.a );
    point.multiplyScalar( a );

    vector.copy( triangle.b );
    vector.multiplyScalar( b );

    point.add( vector );

    vector.copy( triangle.c );
    vector.multiplyScalar( c );

    point.add( vector );

    return point;
  };
}();

module.exports.randomPointInPolygon = function(polygon) {
  let shape = polygon.map((pt) => { return {x: pt.x, y: pt.z, z: 0}; });
  let trianglesVerts = THREE.ShapeUtils.triangulateShape(shape, []);
  let triangles = trianglesVerts.map((verts) => (new THREE.Triangle()).set(shape[verts[0]], shape[verts[1]], shape[verts[2]]));
  let areas = triangles.map((tri) => tri.area());
  let totalArea = areas.reduce((pre, a) => pre + a, 0);
  let getRandomTriangleByArea = (triangles) => {
    let i = 0, percent = Math.random();
    percent -= areas[0] / totalArea;
    while(percent > 0.0 && i < areas.length-1) {
      i += 1;
      percent -= areas[i] / totalArea;
    }
    return triangles[i];
  };

  return () => {
    let pt = randomPointInTriangle(getRandomTriangleByArea(triangles));
    return pt;
  }
}
