


module.exports.create = function(model) {
  let vertexShader = `
  attribute vec3 position;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  void main(void) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;
  
  let fragmentShader = `
  void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {

    },
    attributes: {

    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  });
}
