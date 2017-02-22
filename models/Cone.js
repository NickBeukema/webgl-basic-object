class Cone {
  /**
   * Create a 3D cone with tip at the Z+ axis and base on the XY plane
   * @param {Object} gl         the current WebGL context
   * @param {Number} radius     radius of the cone base
   * @param {Number} height     height of the cone
   * @param {Number} subDiv     number of radial subdivision of the cone base
   * @param {Number} vertStacks number of vertical stacks the cone has
   * @param {vec3}   col1    color #1 to use
   * @param {vec3}   col2    color #2 to use
   */
  constructor (gl, radius, height, subDiv, vertStacks, wireframe = false, col1, col2) {

    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());

    let primitive1 = gl.TRIANGLE_STRIP;
    let primitive2 = gl.TRIANGLE_FAN;
    if(wireframe) {
      primitive1 = gl.LINE_LOOP;
      primitive2 = gl.LINE_LOOP;
    }

    let randColor = vec3.create();
    let vertices = [];
    this.vbuff = gl.createBuffer();

    vertices.push(0,0,height); /* tip of cone */
    vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
    vertices.push(randColor[0], randColor[1], randColor[2]);


    // Generate each stack's circle
    for(let i = 1; i <= vertStacks; i++) {
      let currentRadius = radius * (i/vertStacks);
      let stackHeight = height * ((vertStacks - i) / vertStacks);

      for (let k = 0; k < subDiv; k++) {
        let angle = k * 2 * Math.PI / subDiv;
        let x = currentRadius * Math.cos (angle);
        let y = currentRadius * Math.sin (angle);

        /* the first three floats are 3D (x,y,z) position */
        vertices.push (x, y, stackHeight); /* perimeter of base */
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        /* the next three floats are RGB */
        vertices.push(randColor[0], randColor[1], randColor[2]);
      }
    }

    vertices.push (0,0,0); /* center of base */
    vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
    vertices.push(randColor[0], randColor[1], randColor[2]);

    /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    // Generate index order for top of cone
    let topIndex = [];
    topIndex.push(0);
    for (let k = 1; k <= subDiv; k++)
      topIndex.push(k);
    topIndex.push(1);
    this.topIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);

    // Generate index order for each stack
    this.vertStacks = {};

    for(let i = 0; i < vertStacks - 1; i++) {
      let indexArray = [];
      let start = (subDiv * i) + 1;
      let end = start + subDiv;

      for (let k = start; k < end; k++) {
        indexArray.push(k);
        indexArray.push(subDiv + k);
      }

      indexArray.push(start);
      indexArray.push(end);

      let buff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(indexArray), gl.STATIC_DRAW);

      this.vertStacks[i] = {
        "primitive": primitive1,
        "buffer": buff,
        "numPoints": indexArray.length
      };
    }

    // Generate index order for bottom of cone
    let botIndex = [];
    let start = subDiv * vertStacks;
    let end = start - (subDiv) + 1;
    let centerPoint = start + 1;

    botIndex.push(centerPoint);

    for (let k = start; k >= end; k--) {
      botIndex.push(k);
    }

    botIndex.push(start);


    this.botIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(botIndex), gl.STATIC_DRAW);

    /* Put the indices as an array of objects. Each object has three attributes:
       primitive, buffer, and numPoints */

    this.indices = [
      {"primitive": primitive2, "buffer": this.topIdxBuff, "numPoints": topIndex.length},
      {"primitive": primitive2, "buffer": this.botIdxBuff, "numPoints": botIndex.length}
    ];

    Object.keys(this.vertStacks).forEach((k) => {
      this.indices.push(this.vertStacks[k]);
    });
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
