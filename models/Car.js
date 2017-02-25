class Car {
  /**
   * Create a 3D Car
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let carWidth = 0.5;
    let carLength = 0.8;

    this.frontRightTire = new Tire(gl);
    this.frontRightTireTranslate = mat4.create();
    mat4.translate(this.frontRightTireTranslate, this.frontRightTireTranslate, vec3.fromValues(-carLength/2,-carWidth/2,0));

    this.frontLeftTire = new Tire(gl);
    this.frontLeftTireTranslate = mat4.create();
    mat4.translate(this.frontLeftTireTranslate, this.frontLeftTireTranslate, vec3.fromValues(-carLength/2,carWidth/2,0));

    this.rearRightTire = new Tire(gl);
    this.rearRightTireTranslate = mat4.create();
    mat4.translate(this.rearRightTireTranslate, this.rearRightTireTranslate, vec3.fromValues(carLength/2,carWidth/2,0));

    this.rearLeftTire = new Tire(gl);
    this.rearLeftTireTranslate = mat4.create();
    mat4.translate(this.rearLeftTireTranslate, this.rearLeftTireTranslate, vec3.fromValues(carLength/2,-carWidth/2,0));

    this.hood = new Hood(gl);
    this.hoodTranslate = mat4.create();
    mat4.translate(this.hoodTranslate, this.hoodTranslate, vec3.fromValues(-carLength/1.85,0 ,.2));

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


    mat4.mul(this.tmp, coordFrame, this.frontRightTireTranslate);
    this.frontRightTire.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.frontLeftTireTranslate);
    this.frontLeftTire.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearRightTireTranslate);
    this.rearRightTire.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearLeftTireTranslate);
    this.rearLeftTire.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.hoodTranslate);
    this.hood.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    //this.cone2.draw(vertexAttr, colorAttr, modelUniform, coordFrame);
  }
}
