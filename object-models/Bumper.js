class Bumper extends BasicShape {
  /**
   * Create a Bumper
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let bumperScale = mat4.create();
    mat4.scale(bumperScale, bumperScale, vec3.fromValues(0.1, 1, 0.45));

    this.bumper = new Cube(gl, .4, 1, false, this.white, this.white);
    this.bumperTransform = bumperScale;
    this.addPartToList(this.bumper, this.bumperTransform);
  }
}
