class Ring {
  /**
   * Create a 3D Ring, given inner radius and outer radius, along with height,
   * vertical stacks, and sub divisions
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
  constructor (gl, innerRadius, outerRadius, height, vertStacks, subDiv, wireframe = false, col1, col2) {

    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());

    let primitive1 = gl.TRIANGLE_STRIP;
    if(wireframe) {
      primitive1 = gl.LINE_LOOP;
    }


    let randColor = vec3.create();
    let vertices = [];
    this.vbuff = gl.createBuffer();

    let radiusScale = innerRadius/outerRadius;

    // Generate each stack's outer circle, then scale to create
    // the inner circle
    for(let i = 0; i <= vertStacks; i++) {
      let stackHeight = height * ((vertStacks - i) / vertStacks);

      for (let k = 0; k < subDiv; k++) {
        let angle = k * 2 * Math.PI / subDiv;
        let x = outerRadius * Math.cos (angle);
        let y = outerRadius * Math.sin (angle);

        // Push outer point and color
        vertices.push (x, y, stackHeight);
        vec3.lerp (randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);

        // Push inner point and color
        vertices.push(x*radiusScale, y*radiusScale, stackHeight);
        vec3.lerp (randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);

      }
    }


    /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


    // Generate top of ring
    let topIndex = [];
    for(let i = 0; i < subDiv*2; i=i+2) {
      topIndex.push(i+1,i);
    }

    topIndex.push(1,0);

    this.topIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);



    // Generate bottom of ring
    let bottomIndex = [];
    let end = (subDiv*2) * vertStacks;
    let start = end - (subDiv*2);
    for(let i = start; i < end; i=i+2) {
      bottomIndex.push(i,i+1);
    }

    bottomIndex.push(start,start+1);

    this.botIdxBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botIdxBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(bottomIndex), gl.STATIC_DRAW);



    // Generate index order for each stack
    this.vertStacks = {};

    for(let i = 0; i < vertStacks - 1; i++) {
      // Generate outer side
      let outerIndexArray = [];

      let outerStart = (2 * subDiv * i);
      let outerEnd = outerStart + (subDiv * 2);

      for (let k = outerStart; k < outerEnd-2; k=k+2) {
        outerIndexArray.push(k);
        outerIndexArray.push((subDiv*2) + k);
        outerIndexArray.push(k+2);
        outerIndexArray.push((subDiv*2) + k+2);
      }


      outerIndexArray.push(outerStart + (subDiv*2-2));
      outerIndexArray.push(outerEnd + (subDiv*2-2));
      outerIndexArray.push(outerStart);
      outerIndexArray.push(outerStart+(subDiv*2));

      let buff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(outerIndexArray), gl.STATIC_DRAW);

      this.vertStacks[i] = {
        "primitive": primitive1,
        "buffer": buff,
        "numPoints": outerIndexArray.length
      };


      // Generate inner side
      let innerIndexArray = [];

      let innerStart = (2 * subDiv * (i + 1)) - 1;
      let innerEnd = (2 * subDiv * i) + 1;

      for(let k = innerStart; k > innerEnd; k=k-2) {
        innerIndexArray.push(k);
        innerIndexArray.push((subDiv*2) + k);
        innerIndexArray.push(k-2);
        innerIndexArray.push((subDiv*2) + k-2);
      }

      innerIndexArray.push(innerEnd);
      innerIndexArray.push(innerEnd + (subDiv*2));
      innerIndexArray.push(innerStart);
      innerIndexArray.push(innerStart + (subDiv*2));

      let innerBuff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, innerBuff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(innerIndexArray), gl.STATIC_DRAW);

      this.vertStacks[i+vertStacks] = {
        "primitive": primitive1,
        "buffer": innerBuff,
        "numPoints": innerIndexArray.length
      };


    }

    /* Put the indices as an array of objects. Each object has three attributes:
       primitive, buffer, and numPoints */

    this.indices = [
      {"primitive": primitive1, "buffer": this.topIdxBuff, "numPoints": topIndex.length},
      {"primitive": primitive1, "buffer": this.botIdxBuff, "numPoints": bottomIndex.length}
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
