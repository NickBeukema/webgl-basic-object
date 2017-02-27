class Bumper {
  /**
   * Create a Bumper
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let white = vec3.fromValues(0.6,0.6,0.6);

    let bumperScale = mat4.create();
    mat4.scale(bumperScale, bumperScale, vec3.fromValues(0.1, 1, 0.5));

    this.bumper = new Cube(gl, .4, 4, false, white, white);
    this.bumperTransform = bumperScale;

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


    mat4.mul(this.tmp, coordFrame, this.bumperTransform);
    this.bumper.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
  }
}
