class Cube {
  /**
   * Create a 3D cube with a height/width/depth of the size given
   * and subdivided into equal parts
   *
   * @param {Object} gl     the current WebGL context
   * @param {Number} size   height/width/depth of the cube
   * @param {Number} subDiv number of subdivisions each face has
   * @param {vec4}   col1   color #1 to use
   * @param {vec4}   col2   color #2 to use
   */
  constructor (gl, size, subDiv, wireframe = false, col1, col2) {

    this.temp = mat4.create();
    this.coordFrame = mat4.create();
    this.NORMAL_SCALE = 0.2;
    this.normalCount = 0;


    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec4.fromValues(Math.random(), Math.random(), Math.random(), 1);
    if (typeof col2 === "undefined") col2 = vec4.fromValues(Math.random(), Math.random(), Math.random(), 1);
    let transparency = col1[3] || 1;

    let primitive1 = gl.TRIANGLE_STRIP;
    if(wireframe) {
      primitive1 = gl.LINE_LOOP;
    }

    //let randColor = vec3.create();
    let randColor = vec3.fromValues(1,1,1);
    let vertices = [];
    let normalLines = [];

    this.vbuff = gl.createBuffer();

    /* Instead of allocating two separate JS arrays (one for position and one for color),
       in the following loop we pack both position and color
       so each tuple (x,y,z,r,g,b) describes the properties of a vertex
      */

    let halfSize = size/2;
    let vertsPerFace = (subDiv + 1) * (subDiv + 1);
    let segmentLength = size / subDiv;

    let faceTable = [];

    // Generate 3D points for the first face
    let firstFaceVertices = [];
    let faceVertices = [];
    for(let j = 0; j <= subDiv; j++) {
      for(let k = 0; k <= subDiv; k++) {
        let x = (segmentLength * k) - halfSize;
        let y = (segmentLength * (subDiv - j)) - halfSize;

        let point = vec3.fromValues(x, y, halfSize);
        firstFaceVertices.push(point);
      }
    }


    // Now create the other 5 faces with these dimensions,
    // rotated to their correct face position

    let origin = vec3.create();
    let normalVector = vec3.fromValues(0,0,1);

    // Rotate around the Y axis for the 3 latitudinal sides
    for(let i = 0; i<4; i++) {
      firstFaceVertices.forEach((vertex) => {
        let p = vec3.rotateY(vec3.create(), vertex, origin, i * (Math.PI/2));
        faceVertices.push(p[0], p[1], p[2]);

        faceVertices.push(normalVector[0], normalVector[1], normalVector[2]);

        normalLines.push(p[0], p[1], p[2], 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
          p[0] + this.NORMAL_SCALE * normalVector[0],
          p[1] + this.NORMAL_SCALE * normalVector[1],
          p[2] + this.NORMAL_SCALE * normalVector[2], 1, 1, 1);

        this.normalCount += 1;

      });
      vec3.rotateY(normalVector, normalVector, origin, Math.PI/2);
    }

    normalVector = vec3.fromValues(0,-1,0);
    // Rotate around the X axis for the remaining 2 longitudinal sides
    for(let i = 0; i<2; i++) {
      firstFaceVertices.forEach((vertex) => {
        let negativeModifier = i % 2 == 0 ? 1 : -1;
        let p = vec3.rotateX(vec3.create(), vertex, origin, negativeModifier * (Math.PI/2));
        faceVertices.push(p[0], p[1], p[2]);

        faceVertices.push(normalVector[0], normalVector[1], normalVector[2]);

        normalLines.push(p[0], p[1], p[2], 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
          p[0] + this.NORMAL_SCALE * normalVector[0],
          p[1] + this.NORMAL_SCALE * normalVector[1],
          p[2] + this.NORMAL_SCALE * normalVector[2], 1, 1, 1);

        this.normalCount += 1;

      });
      vec3.rotateX(normalVector, normalVector, origin, Math.PI);
    }

    // Copy the (x,y,z,r,g,b) sixtuplet into GPU buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(faceVertices), gl.STATIC_DRAW);

    // Copy normal vectors into a buffer
    this.nbuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);


    this.indices = [];

    // Push the points to build each face with
    // triangle strip

    for(let i = 0; i < 6; i++) {
      let startIndex = Math.pow(subDiv + 1, 2) * i;

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

  drawNormal (vertexAttr, colorAttr, modelUniform, coordFrame) {
    if (this.normalCount > 0) {
      gl.uniformMatrix4fv(modelUniform, false, coordFrame);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
      gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);
      gl.drawArrays(gl.LINES, 0, this.normalCount * 2);
    }
  }


}
