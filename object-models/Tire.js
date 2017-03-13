class Tire extends BasicShape {
  /**
   * Create a Tire
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    let grey = vec3.fromValues(0.1,0.1,0.1);
    let lighterGrey = vec3.fromValues(0.2,0.2,0.2);
    let white = vec3.fromValues(0.6,0.6,0.6);

    let tireRotate = mat4.create();
    mat4.rotateX(tireRotate, tireRotate, Math.PI/2);


    //
    // Rubber
    //

    this.rubber = new Torus(gl, 0.1, 0.02, 100, 100, false, grey, lighterGrey);
    this.rubberTransform = tireRotate;
    this.addPartToList(this.rubber, this.rubberTransform);


    //
    // Hub Cap
    //

    this.hubCap = new TruncCone(gl, 0.08, 0.08, 0.01, 100, 1, white, white);

    let hubCapScale = mat4.create();
    mat4.scale(hubCapScale, hubCapScale, vec3.fromValues(1,1,0.2));

    this.hubCapTransform = mat4.create();
    mat4.mul(this.hubCapTransform, tireRotate, hubCapScale);

    this.addPartToList(this.hubCap, this.hubCapTransform);


    //
    // Tire center (front and rear)
    //

    let tireCenterFrontTranslate = mat4.create();
    let tireCenterRearTranslate = mat4.create();

    mat4.translate(tireCenterFrontTranslate, tireCenterFrontTranslate, vec3.fromValues(0, 0.01, 0));
    mat4.translate(tireCenterRearTranslate, tireCenterRearTranslate, vec3.fromValues(0, -0.01, 0));

    this.tireCenterFrontTransform = mat4.create();
    this.tireCenterRearTransform = mat4.create();

    mat4.mul(this.tireCenterFrontTransform, tireCenterFrontTranslate, tireRotate) // Rotate, then translate
    mat4.mul(this.tireCenterRearTransform, tireCenterRearTranslate, tireRotate) // Rotate, then translate

    this.tireCenterFront = new TruncCone(gl, 0.03, 0.03, 0.01, 100, 1, grey, grey)
    this.tireCenterRear = new TruncCone(gl, 0.03, 0.03, 0.01, 100, 1, grey, grey)

    this.addPartToList(this.tireCenterFront, this.tireCenterFrontTransform);
    this.addPartToList(this.tireCenterRear, this.tireCenterRearTransform);
  }
}
