class Car {
  /**
   * Create a 3D Car
   * @param {Object} gl         the current WebGL context
   * @param {vec3}   col1    color #1 to use
   * @param {vec3}   col2    color #2 to use
   */
  constructor (gl) {
    this.cone = new Cone(gl, 0.3, 0.5, 30, 20, false);
    this.cone2 = new Cone(gl, 0.3, 0.8, 30, 20, false);
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
    this.cone.draw(vertexAttr, colorAttr, modelUniform, coordFrame);
    this.cone2.draw(vertexAttr, colorAttr, modelUniform, coordFrame);
  }
}
