class TruncCone {
  /**
   * Create a 3D Truncated Cone, given the bottom radius, top radius,
   * height, and sub divisions
   *
   * @param {Object} gl             the current WebGL context
   * @param {Number} radiusBottom   radius of the cone base
   * @param {Number} radiusTop      radius of the cone top
   * @param {Number} height         height of the cone
   * @param {Number} subDiv         number of radial subdivision of the cone base
   * @param {vec3}   col1           color #1 to use
   * @param {vec3}   col2           color #2 to use
   */
  constructor (gl, radiusBottom, radiusTop, height, subDiv, stacks = 1, primitive1, primitive2, col1, col2) {
    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    let randColor = vec3.create();
    let vertices = [];
    this.vbuff = gl.createBuffer();

    /* Instead of allocating two separate JS arrays (one for position and one for color),
       in the following loop we pack both position and color
       so each tuple (x,y,z,r,g,b) describes the properties of a vertex
       */

    for(let i = 0; i <= stacks; i ++) {
      let stackHeight = height * (i/stacks);
      let stackRadius = radiusBottom - (i * ((radiusBottom - radiusTop) / stacks));
      if(i === 0 || i === stacks) {
        vertices.push(0, 0, stackHeight);
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        vertices.push(randColor[0], randColor[1], randColor[2]);
      }

      for (let k = 0; k < subDiv; k++) {
        let angle = k * 2 * Math.PI / subDiv;
        let x = stackRadius * Math.cos (angle);
        let y = stackRadius * Math.sin (angle);

        /* the first three floats are 3D (x,y,z) position */
        vertices.push (x, y, stackHeight); 
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        /* the next three floats are RGB */
        vertices.push(randColor[0], randColor[1], randColor[2]);
      }
    }

    /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    this.indices = [];

    let bottomIndex = [];
    bottomIndex.push(0);

    // Generate bottom of stack
    for(let j = subDiv; j >= 1; j--) {
      bottomIndex.push(j);
    }
    bottomIndex.push(subDiv);

    this.bottomIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bottomIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(bottomIndex), gl.STATIC_DRAW);

    this.indices.push({"primitive": primitive1, "buffer": this.bottomIdxBuff, "numPoints": bottomIndex.length});

    // Generate side of stacks
    for(let i = 0; i < stacks; i ++) {
      let sideIndex = [];
      for(let j = 1; j <= subDiv; j++) {
        let nextLevel = ((i  + 1) * subDiv) + j;
        let currentLevel = (i * subDiv) + j;

        if(i === stacks - 1) {
          nextLevel++;
        }
        sideIndex.push(nextLevel, currentLevel); 
      }

      let nextLevelLast = ((i  + 1) * subDiv) + 1;
      let currentLevelLast = (i * subDiv) + 1;

      if(i === stacks - 1) {
        nextLevelLast++;
      }

      sideIndex.push(nextLevelLast, currentLevelLast);

      this.sideIdxBuff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sideIdxBuff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(sideIndex), gl.STATIC_DRAW);
      this.indices.push({"primitive": primitive2, "buffer": this.sideIdxBuff, "numPoints": sideIndex.length});
    }


    // Generate top of stack
    let topIndex = [];
    topIndex.push((stacks * subDiv) + 1);
    for(let j = 2; j < subDiv + 2; j++) {
      topIndex.push(j + (stacks * subDiv));
    }
    topIndex.push((stacks * subDiv) + 2);

    this.topIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);

    this.indices.push({"primitive": primitive1, "buffer": this.topIdxBuff, "numPoints": topIndex.length});
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
