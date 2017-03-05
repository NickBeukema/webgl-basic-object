class Trunk {
  /**
   * Create a Hood
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let white = vec3.fromValues(0.6,0.6,0.6);

    this.trunk = new Cube(gl, .4, 4, false, white, white);

    let trunkScale = mat4.create();
    mat4.scale(trunkScale, trunkScale, vec3.fromValues(0.8, 1, 0.1));

    let trunkRotate = mat4.create();
    this.trunkTransform = trunkScale;

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


    mat4.mul(this.tmp, coordFrame, this.trunkTransform);
    this.trunk.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
  }
}
