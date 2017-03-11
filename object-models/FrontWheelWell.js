class FrontWheelWell extends BasicShape {
  /**
   * Create a Front Wheel Well
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let white = vec3.fromValues(0.6,0.6,0.6);
    let col = vec3.fromValues(0.9,0.2,0.2);

    let grey = vec3.fromValues(0.3,0.3,0.3);



    // Well Backing

    let wheelWellBack = new Cube(gl, 0.4, 4, false, grey, grey);
    let wheelWellBackTransform = mat4.create();

    let wheelWellBackScale = mat4.create();
    let wheelWellBackTranslate = mat4.create();

    mat4.scale(wheelWellBackScale, wheelWellBackScale, vec3.fromValues(1, 0.01, 0.24));
    mat4.translate(wheelWellBackTranslate, wheelWellBackTranslate, vec3.fromValues(0.08, -0.03, -0.057));

    mat4.mul(wheelWellBackTransform, wheelWellBackTranslate, wheelWellBackScale);

    this.addPartToList(wheelWellBack, wheelWellBackTransform);


    // Well Front

    let wheelWellFront = new Cube(gl, 0.4, 4, false, grey, grey);
    let wheelWellFrontTransform = mat4.create();

    let wheelWellFrontScale = mat4.create();
    let wheelWellFrontTranslate = mat4.create();

    mat4.scale(wheelWellFrontScale, wheelWellFrontScale, vec3.fromValues(0.01, 0.07, 0.24));
    mat4.translate(wheelWellFrontTranslate, wheelWellFrontTranslate, vec3.fromValues(-0.122, -0.014, -0.057));

    mat4.mul(wheelWellFrontTransform, wheelWellFrontTranslate, wheelWellFrontScale);

    this.addPartToList(wheelWellFront, wheelWellFrontTransform);

    // Well Rear

    let wheelWellRear = new Cube(gl, 0.4, 4, false, grey, grey);
    let wheelWellRearTransform = mat4.create();

    let wheelWellRearScale = mat4.create();
    let wheelWellRearTranslate = mat4.create();

    mat4.scale(wheelWellRearScale, wheelWellRearScale, vec3.fromValues(0.01, 0.07, 0.24));
    mat4.translate(wheelWellRearTranslate, wheelWellRearTranslate, vec3.fromValues(0.276, -0.014, -0.057));

    mat4.mul(wheelWellRearTransform, wheelWellRearTranslate, wheelWellRearScale);

    this.addPartToList(wheelWellRear, wheelWellRearTransform);

    // Well Top

    let wheelWellTop = new Cube(gl, 0.4, 4, false, grey, grey);
    let wheelWellTopTransform = mat4.create();

    let wheelWellTopScale = mat4.create();
    let wheelWellTopTranslate = mat4.create();

    mat4.scale(wheelWellTopScale, wheelWellTopScale, vec3.fromValues(1, 0.07, 0.01));
    mat4.translate(wheelWellTopTranslate, wheelWellTopTranslate, vec3.fromValues(0.08, -0.014, -0.01));

    mat4.mul(wheelWellTopTransform, wheelWellTopTranslate, wheelWellTopScale);

    this.addPartToList(wheelWellTop, wheelWellTopTransform);


    this.tmp = mat4.create();
  }
}
