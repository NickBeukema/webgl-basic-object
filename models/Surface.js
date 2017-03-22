class Surface {
  /**
   * Create a flat surface with a width/depth of the size given
   * and subdivided into equal parts
   *
   * @param {Object} gl     the current WebGL context
   * @param {Number} width   width of the surface
   * @param {Number} length   length of the surface
   * @param {Number} subDiv number of subdivisions each face has
   * @param {vec4}   col1   color #1 to use
   * @param {vec4}   col2   color #2 to use
   */
  constructor (gl, size, subDiv) {

    this.temp = mat4.create();
    this.coordFrame = mat4.create();
    this.NORMAL_SCALE = 0.2;
    this.normalCount = 0;


    /* if colors are undefined, generate random colors */

    let primitive1 = gl.TRIANGLE_STRIP;

    let vertices = [];
    let normalLines = [];

    this.vbuff = gl.createBuffer();


    let halfSize = size/2;
    let vertsPerFace = (subDiv + 1) * (subDiv + 1);
    let segmentLength = size / subDiv;
    let normalVector = vec3.fromValues(0,0,1);

    let faceTable = [];

    // Generate points for the face
    let firstFaceVertices = [];
    let faceVertices = [];
    for(let j = 0; j <= subDiv; j++) {
      for(let k = 0; k <= subDiv; k++) {
        let x = (segmentLength * k) - halfSize;
        let y = (segmentLength * (subDiv - j)) - halfSize;

        faceVertices.push(x, y, 0);
        faceVertices.push(normalVector[0], normalVector[1], normalVector[2]);

      }
    }



    // Copy the (x,y,z,Nx,Ny,Nz) sixtuplet into GPU buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(faceVertices), gl.STATIC_DRAW);


    this.indices = [];

    // Push the points to build the face with
    // triangle strip

    let startIndex = 0;

    for(let j = 0; j < subDiv; j++) {
      let rowOffset = (j * subDiv) + (1*j);
      for(let k = 0; k < subDiv; k++) {
        let index = startIndex + rowOffset + k;
        let nextRowIndex = index + subDiv + 1;

        let faceSquareIndex = [];

        faceSquareIndex.push(index);
        faceSquareIndex.push(nextRowIndex);
        faceSquareIndex.push(index + 1);
        faceSquareIndex.push(nextRowIndex + 1);

        let faceIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(faceSquareIndex), gl.STATIC_DRAW);

        this.indices.push({
          "primitive": primitive1,
          "buffer": faceIdxBuff,
          "numPoints": faceSquareIndex.length
        });
      }
    }


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

    /* binder the (vertex+color) buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

    /* with the "packed layout"  (x,y,z,r,g,b),
       the stride distance between one group to the next is 24 bytes */
    gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
    gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */

    for (let k = 0; k < this.indices.length; k++) {
      let obj = this.indices[k];
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
      gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
    }
  }

}
