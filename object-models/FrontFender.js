class FrontFender {
  /**
   * Create a Front Fender
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    let white = vec3.fromValues(0.6,0.6,0.6);

    this.parts = [];


    // Top portion of fender

    let topFender = new Cube(gl, 0.4, 4, false, white, white);
    let topFenderTransform = mat4.create();

    let topFenderScale = mat4.create();
    let topFenderTranslate = mat4.create();

    mat4.scale(topFenderScale, topFenderScale, vec3.fromValues(1, 0.01, 0.3));
    mat4.translate(topFenderTranslate, topFenderTranslate, vec3.fromValues(0.08, 0, 0.05));

    mat4.mul(topFenderTransform, topFenderTranslate, topFenderScale);

    this.parts.push({
      object: topFender,
      transform: topFenderTransform
    });


    // Side portion of fender

    let sideFender = new Cube(gl, 0.4, 4, false, white, white);
    let sideFenderTransform = mat4.create();

    let sideFenderScale = mat4.create();
    let sideFenderTranslate = mat4.create();

    mat4.scale(sideFenderScale, sideFenderScale, vec3.fromValues(0.3, 0.01, 0.54));
    mat4.translate(sideFenderTranslate, sideFenderTranslate, vec3.fromValues(-0.18, 0, 0.003));

    mat4.mul(sideFenderTransform, sideFenderTranslate, sideFenderScale);

    this.parts.push({
      object: sideFender,
      transform: sideFenderTransform
    });


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

    this.parts.forEach(part => {
      mat4.mul(this.tmp, coordFrame, part.transform);
      part.object.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    });
  }
}
