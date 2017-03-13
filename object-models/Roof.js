class Roof extends BasicShape {
  /**
   * Create a Roof
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);


    this.roofTop = new Cube(gl, .4, 4, false, this.white, this.white);
    this.roofTopTransform = mat4.create();
    mat4.scale(this.roofTopTransform, this.roofTopTransform, vec3.fromValues(1, 1, 0.1));
    this.addPartToList(this.roofTop, this.roofTopTransform);


    let frontPostRotateRad = Math.PI/4.3;
    let frontPostTranslateX = -0.42;
    let frontPostTranslateY = 0.19;
    let frontPostTranslateZ = -0.25;

    // Windshield and posts -- could be refactored out into another shape
    this.rightFrontPost = new TruncCone(gl, 0.01, 0.01, 0.35, 10, 1, this.white, this.white);
    this.rightFrontPostTransform = mat4.create();

    let rightFrontPostRotate = mat4.create();
    mat4.rotateY(rightFrontPostRotate, rightFrontPostRotate, frontPostRotateRad);

    let rightFrontPostTranslate = mat4.create();
    let rightFrontPostTranslateVec = vec3.fromValues(frontPostTranslateX, -frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(rightFrontPostTranslate, rightFrontPostTranslate, rightFrontPostTranslateVec);

    mat4.mul(this.rightFrontPostTransform, rightFrontPostTranslate, rightFrontPostRotate);

    this.leftFrontPost = new TruncCone(gl, 0.01, 0.01, 0.33, 10, 1, this.white, this.white);
    this.leftFrontPostTransform = mat4.create();

    let leftFrontPostRotate = mat4.create();
    mat4.rotateY(leftFrontPostRotate, leftFrontPostRotate, frontPostRotateRad);

    let leftFrontPostTranslate = mat4.create();
    let leftFrontPostTranslateVec = vec3.fromValues(frontPostTranslateX, frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(leftFrontPostTranslate, leftFrontPostTranslate, leftFrontPostTranslateVec);

    mat4.mul(this.leftFrontPostTransform, leftFrontPostTranslate, leftFrontPostRotate);


    this.rightRearPost = new TruncCone(gl, 0.01, 0.01, 0.35, 10, 1, this.white, this.white);
    this.rightRearPostTransform = mat4.create();

    let rightRearPostRotate = mat4.create();
    mat4.rotateY(rightRearPostRotate, rightRearPostRotate, -frontPostRotateRad);

    let rightRearPostTranslate = mat4.create();
    let rightRearPostTranslateVec = vec3.fromValues(-frontPostTranslateX, -frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(rightRearPostTranslate, rightRearPostTranslate, rightRearPostTranslateVec);

    mat4.mul(this.rightRearPostTransform, rightRearPostTranslate, rightRearPostRotate);


    this.leftRearPost = new TruncCone(gl, 0.01, 0.01, 0.35, 10, 1, this.white, this.white);
    this.leftRearPostTransform = mat4.create();

    let leftRearPostRotate = mat4.create();
    mat4.rotateY(leftRearPostRotate, leftRearPostRotate, -frontPostRotateRad);

    let leftRearPostTranslate = mat4.create();
    let leftRearPostTranslateVec = vec3.fromValues(-frontPostTranslateX, frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(leftRearPostTranslate, leftRearPostTranslate, leftRearPostTranslateVec);

    mat4.mul(this.leftRearPostTransform, leftRearPostTranslate, leftRearPostRotate);


    this.addPartToList(this.rightFrontPost, this.rightFrontPostTransform);
    this.addPartToList(this.leftFrontPost, this.leftFrontPostTransform);
    this.addPartToList(this.rightRearPost, this.rightRearPostTransform);
    this.addPartToList(this.leftRearPost, this.leftRearPostTransform);


    // Front Windshield

    this.frontWindshield = new Windshield(gl);
    this.frontWindshieldTransform = mat4.create();
    let frontWindshieldTranslate = mat4.create();
    let frontWindshieldRotate = mat4.create();
    mat4.rotateX(frontWindshieldRotate, frontWindshieldRotate, Math.PI);
    mat4.translate(frontWindshieldTranslate, frontWindshieldTranslate, vec3.fromValues(frontPostTranslateX + 0.11, 0, frontPostTranslateZ/2));
    mat4.mul(this.frontWindshieldTransform, frontWindshieldTranslate, frontWindshieldRotate);

    this.addPartToList(this.frontWindshield, this.frontWindshieldTransform);



    // Rear windshield

    this.rearWindshield = new Windshield(gl);
    this.rearWindshieldTransform = mat4.create();
    mat4.translate(this.rearWindshieldTransform, this.rearWindshieldTransform, vec3.fromValues(-frontPostTranslateX - 0.11, 0, frontPostTranslateZ/2));

    this.addPartToList(this.rearWindshield, this.rearWindshieldTransform);
  }
}
