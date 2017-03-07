class Car {
  /**
   * Create a 3D Car
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let carWidth = 0.5;
    let carLength = 1.2;

    //
    // Tires
    //

    let tirePosX = (carLength/2.0) * .80;
    let tirePosY = (carWidth/2.0);


    this.frontRightTire = new Tire(gl);
    this.frontRightTireTranslate = mat4.create();
    mat4.translate(this.frontRightTireTranslate, this.frontRightTireTranslate, vec3.fromValues(-tirePosX,-tirePosY, 0));

    this.frontLeftTire = new Tire(gl);
    this.frontLeftTireTranslate = mat4.create();
    mat4.translate(this.frontLeftTireTranslate, this.frontLeftTireTranslate, vec3.fromValues(-tirePosX,tirePosY, 0));

    this.rearRightTire = new Tire(gl);
    this.rearRightTireTranslate = mat4.create();
    mat4.translate(this.rearRightTireTranslate, this.rearRightTireTranslate, vec3.fromValues(tirePosX,tirePosY, 0));

    this.rearLeftTire = new Tire(gl);
    this.rearLeftTireTranslate = mat4.create();
    mat4.translate(this.rearLeftTireTranslate, this.rearLeftTireTranslate, vec3.fromValues(tirePosX,-tirePosY, 0));


    //
    // Front hood
    //

    this.hood = new Hood(gl);

    let hoodTranslate = mat4.create();
    let hoodTranslateVec = vec3.fromValues(-carLength/2, 0, 0.2);

    mat4.translate(hoodTranslate, hoodTranslate, hoodTranslateVec);

    // TODO: refactor the rotate into the shape
    let hoodRotate = mat4.create();
    let hoodRotateRad = -Math.PI/10;

    mat4.rotateY(hoodRotate, hoodRotate, hoodRotateRad);


    this.hoodTransform = mat4.create();
    mat4.mul(this.hoodTransform, hoodTranslate, hoodRotate);


    //
    // Front bumper
    //

    this.frontBumper = new Bumper(gl);
    this.frontBumperTransform = mat4.create();
    this.frontBumperTranslate = mat4.create();
    mat4.translate(this.frontBumperTransform, this.frontBumperTranslate, vec3.fromValues(-carLength/2 - 0.2 + 0.02, 0, 0.05));


    //
    // Roof
    //

    this.roof = new Roof(gl);
    this.roofTransform = mat4.create();
    let roofTranslateVec = vec3.fromValues(0,0,0.5);
    mat4.translate(this.roofTransform, this.roofTransform, roofTranslateVec);


    //
    // Trunk
    //

    this.trunk = new Trunk(gl);
    this.trunkTransform = mat4.create();
    let trunkTransformVec = vec3.fromValues(0.57,0,0.24);
    mat4.translate(this.trunkTransform, this.trunkTransform, trunkTransformVec);

    //
    // Rear bumper
    //

    this.rearBumper = new Bumper(gl);
    this.rearBumperTransform = mat4.create();
    this.rearBumperTranslate = mat4.create();
    mat4.translate(this.rearBumperTransform, this.rearBumperTranslate, vec3.fromValues(carLength/2 + 0.11, 0, 0.13));

    //
    // Rear Fenders
    // 
    

    this.rearRightFender = new RearFender(gl);
    this.rearRightFenderTranslate = mat4.create();
    mat4.translate(this.rearRightFenderTranslate, this.rearRightFenderTranslate, vec3.fromValues(carLength/2 + .07, carWidth/2 - .05, .145));

    this.rearLeftFender = new RearFender(gl);
    this.rearLeftFenderTranslate = mat4.create(); 
    mat4.translate(this.rearLeftFenderTranslate, this.rearLeftFenderTranslate, vec3.fromValues(carLength/2 + .07, -carWidth/2 + .05, .145));

    

    //
    // Front Fenders
    //
    

    //
    // Rear Windshield
    //
  
    this.rearWindshield = new Windshield(gl);
    this.rearWindshieldTranslate = mat4.create(); 
    mat4.translate(this.rearWindshieldTranslate, this.rearWindshieldTranslate, vec3.fromValues(carLength/4, 0, .39));

    //
    // Front Windshield
    //
  
    this.frontWindshield = new Windshield(gl);
    this.frontWindshieldTransform = mat4.create();
    let frontWindshieldTranslate = mat4.create();
    let frontWindshieldRotate = mat4.create();
    mat4.rotateX(frontWindshieldRotate, frontWindshieldRotate, Math.PI);
    mat4.translate(frontWindshieldTranslate, frontWindshieldTranslate, vec3.fromValues(-carLength/4, 0, .39));
    mat4.mul(this.frontWindshieldTransform, frontWindshieldTranslate, frontWindshieldRotate);
    
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

    mat4.mul(this.tmp, coordFrame, this.hoodTransform);
    this.hood.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.frontBumperTransform);
    this.frontBumper.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.roofTransform);
    this.roof.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.trunkTransform);
    this.trunk.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearBumperTransform);
    this.rearBumper.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearRightFenderTranslate);
    this.rearRightFender.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearLeftFenderTranslate);
    this.rearLeftFender.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    
    mat4.mul(this.tmp, coordFrame, this.frontWindshieldTransform);
    this.frontWindshield.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.rearWindshieldTranslate);
    this.rearWindshield.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

  }
}
