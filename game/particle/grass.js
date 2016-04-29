module.exports = {
  vertexShader: `
  varying vec4 vColor;

  void main() {
    vColor = color;
    gl_Position = vec4(position);
  }
  `,
  fragmentShader: `
  varying vec4 vColor;

  void main() {
    gl_FragColor = vec4(vColor);
  }
  `
};
