class Roof {
  /**
   * Create a Roof
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let white = vec3.fromValues(0.6,0.6,0.6);

    this.roofTop = new Cube(gl, .4, 4, false, white, white);
    this.roofTopTransform = mat4.create();
    mat4.scale(this.roofTopTransform, this.roofTopTransform, vec3.fromValues(1, 1, 0.1));

    let frontPostRotateRad = Math.PI/4.3;
    let frontPostTranslateX = -0.42;
    let frontPostTranslateY = 0.19;
    let frontPostTranslateZ = -0.25;

    // Windshield and posts -- could be refactored out into another shape
    this.rightFrontPost = new TruncCone(gl, 0.01, 0.01, 0.35, 10, 1, white, white);
    this.rightFrontPostTransform = mat4.create();

    let rightFrontPostRotate = mat4.create();
    mat4.rotateY(rightFrontPostRotate, rightFrontPostRotate, frontPostRotateRad);

    let rightFrontPostTranslate = mat4.create();
    let rightFrontPostTranslateVec = vec3.fromValues(frontPostTranslateX, -frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(rightFrontPostTranslate, rightFrontPostTranslate, rightFrontPostTranslateVec);

    mat4.mul(this.rightFrontPostTransform, rightFrontPostTranslate, rightFrontPostRotate);

    this.leftFrontPost = new TruncCone(gl, 0.01, 0.01, 0.33, 10, 1, white, white);
    this.leftFrontPostTransform = mat4.create();

    let leftFrontPostRotate = mat4.create();
    mat4.rotateY(leftFrontPostRotate, leftFrontPostRotate, frontPostRotateRad);

    let leftFrontPostTranslate = mat4.create();
    let leftFrontPostTranslateVec = vec3.fromValues(frontPostTranslateX, frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(leftFrontPostTranslate, leftFrontPostTranslate, leftFrontPostTranslateVec);

    mat4.mul(this.leftFrontPostTransform, leftFrontPostTranslate, leftFrontPostRotate);



    // Rear windshield
    this.rightRearPost = new TruncCone(gl, 0.01, 0.01, 0.35, 10, 1, white, white);
    this.rightRearPostTransform = mat4.create();

    let rightRearPostRotate = mat4.create();
    mat4.rotateY(rightRearPostRotate, rightRearPostRotate, -frontPostRotateRad);

    let rightRearPostTranslate = mat4.create();
    let rightRearPostTranslateVec = vec3.fromValues(-frontPostTranslateX, -frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(rightRearPostTranslate, rightRearPostTranslate, rightRearPostTranslateVec);

    mat4.mul(this.rightRearPostTransform, rightRearPostTranslate, rightRearPostRotate);


    this.leftRearPost = new TruncCone(gl, 0.01, 0.01, 0.35, 10, 1, white, white);
    this.leftRearPostTransform = mat4.create();

    let leftRearPostRotate = mat4.create();
    mat4.rotateY(leftRearPostRotate, leftRearPostRotate, -frontPostRotateRad);

    let leftRearPostTranslate = mat4.create();
    let leftRearPostTranslateVec = vec3.fromValues(-frontPostTranslateX, frontPostTranslateY, frontPostTranslateZ);
    mat4.translate(leftRearPostTranslate, leftRearPostTranslate, leftRearPostTranslateVec);

    mat4.mul(this.leftRearPostTransform, leftRearPostTranslate, leftRearPostRotate);


    this.tmp = mat4.create();
  }

  /**
   * Draw the object
   * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
   * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
   * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
   * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
   */
  draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
    /* copy the coordinate frame matrix to the uniform memory in shader */
    gl.uniformMatrix4fv(modelUniform, false, coordFrame);


    mat4.mul(this.tmp, coordFrame, this.roofTopTransform);
    this.roofTop.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rightFrontPostTransform);
    this.rightFrontPost.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.leftFrontPostTransform);
    this.leftFrontPost.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rightRearPostTransform);
    this.rightRearPost.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.leftRearPostTransform);
    this.leftRearPost.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
  }
}
