class Trunk extends BasicShape {
  /**
   * Create a Trunk
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let trunk = new Cube(gl, .4, 1, false, this.white, this.white);
    let trunkScale = mat4.create();
    mat4.scale(trunkScale, trunkScale, vec3.fromValues(0.97, 1, 0.1));

    this.addPartToList(trunk, trunkScale)
  }
}
