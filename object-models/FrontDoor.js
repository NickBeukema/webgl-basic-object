class FrontDoor {
  /**
   * Create a Roof
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let white = vec3.fromValues(0.6,0.6,0.6);

    this.bottomDoorPanel = new Cube(gl, 0.40, 4, false, white, white);

    let bottomDoorPanelScale = mat4.create();
    mat4.scale(bottomDoorPanelScale, bottomDoorPanelScale, vec3.fromValues(1, 0.7, 0.1));

    let bottomDoorPanelRotate = mat4.create();
    mat4.rotateX(bottomDoorPanelRotate, bottomDoorPanelRotate, Math.PI/2);

    this.bottomDoorPanelTransform = mat4.create();
    mat4.mul(this.bottomDoorPanelTransform, bottomDoorPanelRotate, bottomDoorPanelScale);



    this.rearDoorFrame = new Cube(gl, 0.28, 4, false, white, white);
    let rearDoorFrameScale = mat4.create();
    mat4.scale(rearDoorFrameScale, rearDoorFrameScale, vec3.fromValues(0.1, 0.1, 1));

    let rearDoorFrameTranslate = mat4.create();
    mat4.translate(rearDoorFrameTranslate, rearDoorFrameTranslate, vec3.fromValues(0.187,0,0.24));


    this.rearDoorFrameTransform = mat4.create();
    mat4.mul(this.rearDoorFrameTransform, rearDoorFrameTranslate, rearDoorFrameScale);


    this.topDoorFrame = new Cube(gl, 0.28, 4, false, white, white);
    let topDoorFrameScale = mat4.create();
    mat4.scale(topDoorFrameScale, topDoorFrameScale, vec3.fromValues(0.6, 0.1, 0.1));

    let topDoorFrameTranslate = mat4.create();
    mat4.translate(topDoorFrameTranslate, topDoorFrameTranslate, vec3.fromValues(0.1,0,0.366));

    this.topDoorFrameTransform = mat4.create();
    mat4.mul(this.topDoorFrameTransform, topDoorFrameTranslate, topDoorFrameScale);


    this.frontDoorFrame = new Cube(gl, 0.3, 4, false, white, white);

    let frontDoorFrameScale = mat4.create();
    mat4.scale(frontDoorFrameScale, frontDoorFrameScale, vec3.fromValues(0.1, 0.1, 1));

    let frontDoorFrameTranslate = mat4.create();
    mat4.translate(frontDoorFrameTranslate, frontDoorFrameTranslate, vec3.fromValues(-0.08,0,0.27));

    let frontDoorFrameRotate = mat4.create();
    mat4.rotateY(frontDoorFrameRotate, frontDoorFrameRotate, Math.PI/4.3);

    this.frontDoorFrameTransform = mat4.create();
    mat4.mul(this.frontDoorFrameTransform, frontDoorFrameTranslate, frontDoorFrameRotate);
    mat4.mul(this.frontDoorFrameTransform, this.frontDoorFrameTransform, frontDoorFrameScale);

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


    mat4.mul(this.tmp, coordFrame, this.bottomDoorPanelTransform);
    this.bottomDoorPanel.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearDoorFrameTransform);
    this.rearDoorFrame.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.topDoorFrameTransform);
    this.topDoorFrame.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.frontDoorFrameTransform);
    this.frontDoorFrame.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
  }
}
