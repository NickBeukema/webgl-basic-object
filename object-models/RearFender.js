class RearFender extends BasicShape {
  /**
   * Create a Rear Fender
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let fender1Scale = mat4.create();
    mat4.scale(fender1Scale, fender1Scale, vec3.fromValues(0.3, .01, 0.54));

    this.fender1 = new Cube(gl, .4, 1, false, this.white, this.white);
    this.fender1Transform = fender1Scale;
    this.addPartToList(this.fender1, this.fender1Transform);


    let fender2Scale = mat4.create();
    mat4.scale(fender2Scale, fender2Scale, vec3.fromValues(0.78, .01, 0.31));
    let fender2Translate = mat4.create();
    mat4.translate(fender2Translate, fender2Translate, vec3.fromValues(-0.26, 0, .17));

    this.fender2 = new Cube(gl, .4, 1, false, this.white, this.white);
    this.fender2Transform = mat4.mul(mat4.create(), fender2Scale, fender2Translate);
    this.addPartToList(this.fender2, this.fender2Transform);


  }
}
