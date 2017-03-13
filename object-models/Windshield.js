class Windshield extends BasicShape {
  /**
   * Create a Windshield
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let white = vec4.fromValues(0.7,0.7,0.7,.4);

    this.windshield = new Cube(gl, .4, 4, false, white, white);

    let windshieldScale = mat4.create();
    mat4.scale(windshieldScale, windshieldScale, vec3.fromValues(0.85, 1, 0.02));

    let windshieldRotate = mat4.create();
    mat4.rotateY(windshieldRotate, windshieldRotate, Math.PI/3.75);

    this.windshieldTransform = mat4.create();
    mat4.mul(this.windshieldTransform, windshieldRotate, windshieldScale);

    this.addPartToList(this.windshield, this.windshieldTransform);
  }
}
