/**
 * @author mrdoob / http://www.mrdoob.com
 */

var GPGPU = function ( renderer ) {

  this.renderer = renderer;

	var camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );

	var scene = new THREE.Scene();

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ) );
	scene.add( mesh );

	this.render = function ( _scene, _camera, target ) {

		this.renderer.render( _scene, _camera, target, false );

	};

	this.pass = function ( shader, target ) {

		mesh.material = shader.material;
		this.renderer.render( scene, camera, target, false );

	};

	this.out = function ( shader ) {

		mesh.material = shader.material;
		this.renderer.render( scene, camera );

	};

  this.setRenderer = function ( renderer ) {

    this.renderer = renderer;

  };

};

module.exports = new GPGPU();
