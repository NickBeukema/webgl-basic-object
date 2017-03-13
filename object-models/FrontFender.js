class FrontFender extends BasicShape {
  /**
   * Create a Front Fender
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    // Top portion of fender

    let topFender = new Cube(gl, 0.4, 4, false, this.white, this.white);
    let topFenderTransform = mat4.create();

    let topFenderScale = mat4.create();
    let topFenderTranslate = mat4.create();

    mat4.scale(topFenderScale, topFenderScale, vec3.fromValues(1, 0.01, 0.3));
    mat4.translate(topFenderTranslate, topFenderTranslate, vec3.fromValues(0.08, 0, 0.05));

    mat4.mul(topFenderTransform, topFenderTranslate, topFenderScale);

    this.addPartToList(topFender, topFenderTransform);


    // Side portion of fender

    let sideFender = new Cube(gl, 0.4, 4, false, this.white, this.white);
    let sideFenderTransform = mat4.create();

    let sideFenderScale = mat4.create();
    let sideFenderTranslate = mat4.create();

    mat4.scale(sideFenderScale, sideFenderScale, vec3.fromValues(0.3, 0.01, 0.54));
    mat4.translate(sideFenderTranslate, sideFenderTranslate, vec3.fromValues(-0.18, 0, 0.003));

    mat4.mul(sideFenderTransform, sideFenderTranslate, sideFenderScale);

    this.addPartToList(sideFender, sideFenderTransform);
  }
}
