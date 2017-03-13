class Hood extends BasicShape {
  /**
   * Create a Hood
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let hoodScale = mat4.create();
    mat4.scale(hoodScale, hoodScale, vec3.fromValues(1.39, 1, 0.1));

    this.hood = new Cube(gl, .4, 4, false, this.white, this.white);
    this.hoodTransform = hoodScale;

    this.addPartToList(this.hood, this.hoodTransform);
  }
}
