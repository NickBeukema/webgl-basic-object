class Floor extends BasicShape {
  /**
   * Create a Floor
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    this.floor = new Cube(gl, .4, 1, false, this.grey3, this.grey3);
    this.floorTransform = mat4.create();
    mat4.scale(this.floorTransform, this.floorTransform, vec3.fromValues(4.4, 0.8, 0.01));

    this.addPartToList(this.floor, this.floorTransform);
  }
}
