const importer = require('../world/import.js');

THREE.ShaderLib['standard'].vertexShader = `
#ifdef USE_INSTANCED_OFFSET
attribute vec3 offset;
#endif
` + THREE.ShaderLib['standard'].vertexShader;

/* // NOTE: modification made in three.js file
THREE.ShaderChunk['begin_vertex'] = `
vec3 transformed = vec3( position );
#ifdef USE_INSTANCED_OFFSET
transformed += offset;
#endif
`;
*/

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

module.exports.create = function(polygon) {
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

  let count = 3000;
  let obj = new THREE.Object3D();

  let fromGeo = importer.importModel('grassblade.json', (model) => {
      model.geometry.rotateX(-Math.PI);
      let geometry = new THREE.InstancedBufferGeometry();
      geometry.setFromObject(model);

      let offsets = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3, 1);
      for(let i=0; i<count; i++) {
        let pt = randomPointInTriangle(getRandomTriangleByArea(triangles));
        offsets.setXYZ(i, pt.x, 0, pt.y);
      }
      geometry.addAttribute('offset', offsets);
      geometry.normalizeNormals();

      let material = new THREE.MeshStandardMaterial({color: 0xB7E7B1, roughness: 1.0, metalness: 0.0, side:THREE.DoubleSide});
      material.defines = {'USE_INSTANCED_OFFSET': '1'};

      let mesh = new THREE.Mesh(geometry, material);
      //mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      obj.add(mesh);
  });

  return obj;
};
