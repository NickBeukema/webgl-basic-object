class Torus {
  /**
   * Create a 3D Torus with specified radius of the torus, a tube radius,
   * vertical stacks going longitudinally, and then sub divides going
   * latitudinally
   *
   * @param {Object} gl           the current WebGL context
   * @param {Number} innerRadius  inner radius of the ring
   * @param {Number} outerRadius  outer radius of the ring
   * @param {Number} height       height of the ring
   * @param {Number} vertStacks   number of vertical stacks the ring has
   * @param {Number} subDiv       number of sub divisions the ring has
   * @param {vec3}   col1         color #1 to use
   * @param {vec3}   col2         color #2 to use
   */
  constructor (gl, radius, tubeRadius, vertStacks, subDiv, wireframe = false, col1, col2) {
    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());

    let primitive1 = gl.TRIANGLE_STRIP;
    let primitive2 = gl.TRIANGLE_STRIP;
    if(wireframe) {
      primitive1 = gl.LINE_LOOP;
      primitive2 = gl.LINE_LOOP;
    }

    let randColor = vec3.create();
    let vertices = [];
    this.vbuff = gl.createBuffer();

    // Generate one of the tube's circles by rotating one point
    // around the center of the tube

    let centerPoint = vec3.fromValues(radius, 0, 0);
    let firstOuterRingPoint = vec3.fromValues(radius + tubeRadius, 0, 0);

    for(let i = 0; i < vertStacks; i++) {
      let angle = (2 * Math.PI * i) / vertStacks;

      let point = vec3.rotateY(vec3.create(), firstOuterRingPoint, centerPoint, angle);

      vertices.push(point[0], point[1], point[2]);
      vec3.lerp (randColor, col1, col2, Math.random());
      vertices.push(randColor[0], randColor[1], randColor[2]);
    }

    // Rotate the first circle around to make the torus

    for(let i = 1; i < subDiv; i++) {
      let angle = (2 * Math.PI * i) / subDiv;

      for(let j = 0; j < vertStacks; j++) {
        let index = j * 6;
        let pointToRotate = vec3.fromValues(vertices[index], vertices[index+1], vertices[index+2]);

        let point = vec3.rotateZ(vec3.create(), pointToRotate, vec3.create(), angle);

        vertices.push(point[0], point[1], point[2]);
        vec3.lerp (randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
      }
    }


    /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


    // Generate each column of the torus
    this.vertStacks = {};

    for(let i = 0; i < subDiv-1; i++) {
      let index = [];
      let start = (vertStacks * i);
      let end = start + vertStacks;

      for(let j = start; j < end; j++) {
        index.push(j);
        index.push(j + (vertStacks));
      }

      index.push(start);
      index.push(start + vertStacks);


      let buff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);



      this.vertStacks[i] = {
        "primitive": primitive1,
        "buffer": buff,
        "numPoints": index.length
      };
    }

    // Insert last segment, filling in the end to the beginning
    let index = [];
    let end = vertStacks * subDiv;

    for(let i = 0; i < vertStacks; i++) {
      index.push(end - vertStacks + i);
      index.push(i);
    }

    index.push(end - vertStacks);
    index.push(0);

    let buff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);



    this.vertStacks[subDiv] = {
      "primitive": primitive2,
      "buffer": buff,
      "numPoints": index.length
    };


    /* Put the indices as an array of objects. Each object has three attributes:
       primitive, buffer, and numPoints */

    this.indices = [];

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
