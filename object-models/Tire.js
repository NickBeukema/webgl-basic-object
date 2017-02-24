class Tire {
  /**
   * Create a Tire
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let grey = vec3.fromValues(0.1,0.1,0.1);
    let lighterGrey = vec3.fromValues(0.2,0.2,0.2);
    let white = vec3.fromValues(0.6,0.6,0.6);

    let tireRotate = mat4.create();
    mat4.rotateX(tireRotate, tireRotate, Math.PI/2);

    this.rubber = new Torus(gl, 0.1, 0.02, 100, 100, false, grey, lighterGrey);
    this.rubberTransform = tireRotate;

    this.hubCap = new Sphere(gl, 0.1, 10, 10, false, white, white);

    let hubCapScale = mat4.create();
    mat4.scale(hubCapScale, hubCapScale, vec3.fromValues(1,1,0.2));

    this.hubCapTransform = mat4.create();
    mat4.mul(this.hubCapTransform, tireRotate, hubCapScale);


    this.tireCenter = new Sphere(gl, 0.03, 10, 10, false, grey, grey)

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


    mat4.mul(this.tmp, coordFrame, this.rubberTransform);
    this.rubber.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.hubCapTransform);
    this.hubCap.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    this.tireCenter.draw(vertexAttr, colorAttr, modelUniform, coordFrame);
  }
}
