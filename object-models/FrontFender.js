class FrontFender {
  /**
   * Create a Bumper
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let white = vec3.fromValues(0.6,0.6,0.6);

    let fender1Scale = mat4.create();
    mat4.scale(fender1Scale, fender1Scale, vec3.fromValues(0.3, .1, 0.6));

    this.fender1 = new Cube(gl, .4, 4, false, white, white);
    this.fender1Transform = fender1Scale;

    let fender2Scale = mat4.create();
    mat4.scale(fender2Scale, fender2Scale, vec3.fromValues(0.9, .1, 0.3));
    let fender2Translate = mat4.create();
    mat4.translate(fender2Translate, fender2Translate, vec3.fromValues(-.2, 0,.3));

    this.fender2 = new Cube(gl, .4, 4, false, white, white);
    this.fender2Transform = mat4.mul(mat4.create(), fender2Scale, fender2Translate);

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


    mat4.mul(this.tmp, coordFrame, this.fender1Transform);
    this.fender1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    mat4.mul(this.tmp, coordFrame, this.fender2Transform);
    this.fender2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
  }
}
