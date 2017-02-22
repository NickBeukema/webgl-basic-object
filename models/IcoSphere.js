class Icosphere {
  /**
   * Create a 3D Recursive Sphere with a given amount of sub divides through recursion
   * @param {Object} gl             the current WebGL context
   * @param {Number} recursionLevel amount of times to recursively subdivide
   * @param {vec3}   col1           color #1 to use
   * @param {vec3}   col2           color #2 to use
   */
  constructor (gl, recursionLevel = 1, wireframe = false, col1, col2) {
    /* if colors are undefined, generate random colors */
    if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());

    let primitive1 = gl.TRIANGLES;
    if(wireframe) {
      primitive1 = gl.LINE_LOOP;
    }

    let randColor = vec3.create();
    let vertices = [];
    this.vbuff = gl.createBuffer();

    /* Instead of allocating two separate JS arrays (one for position and one for color),
       in the following loop we pack both position and color
       so each tuple (x,y,z,r,g,b) describes the properties of a vertex
       */

    let t = (1 + Math.sqrt(5)) / 2;
    vertices.push([-1, t, 0]);
    vertices.push([1, t, 0]);
    vertices.push([-1, -t, 0]);
    vertices.push([1, -t, 0]);
    vertices.push([0, -1, t]);
    vertices.push([0, 1, t]);
    vertices.push([0, -1, -t]);
    vertices.push([0, 1, -t]);
    vertices.push([t, 0, -1]);
    vertices.push([t, 0, 1]);
    vertices.push([-t, 0, -1]);
    vertices.push([-t, 0, 1]);

    let faces = [];

    faces.push([0, 11, 5]);
    faces.push([0, 5, 1]);
    faces.push([0, 1, 7]);
    faces.push([0, 7, 10]);
    faces.push([0, 10, 11]);

    faces.push([1, 5, 9]);
    faces.push([5, 11, 4]);
    faces.push([11, 10, 2]);
    faces.push([10, 7, 6]);
    faces.push([7, 1, 8]);

    faces.push([3, 9, 4]);
    faces.push([3, 4, 2]);
    faces.push([3, 2, 6]);
    faces.push([3, 6, 8]);
    faces.push([3, 8, 9]);

    faces.push([4, 9, 5]);
    faces.push([2, 4, 11]);
    faces.push([6, 2, 10]);
    faces.push([8, 6, 7]);
    faces.push([9, 8, 1]);

    let model = {
      faces: faces,
      vertices: vertices
    };

    model = this.subDivide(model, recursionLevel);

    let newVertices = model.vertices;
    vertices = [];
    for (var i = 0; i < newVertices.length; i++) {
      vec3.normalize(newVertices[i], newVertices[i]);
      vertices.push(newVertices[i][0], newVertices[i][1], newVertices[i][2]);
      vec3.lerp (randColor, col1, col2, Math.random());
      vertices.push(randColor[0], randColor[1], randColor[2]);
    }
    /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    this.indices = [];
    let newFaces = model.faces;
    for (var i = 0; i < newFaces.length; i++) {
      let indexData = [];
      indexData.push(newFaces[i][0], newFaces[i][1], newFaces[i][2]);
      this.idxBuff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(indexData), gl.STATIC_DRAW);
      this.indices.push({"primitive": primitive1, "buffer": this.idxBuff, "numPoints": indexData.length});
    }
  }

  subDivide(model, recursionLevel) {
    if(recursionLevel === 0) {
      return model;
    }
    
    let vertices = model.vertices;
    let faces = model.faces;

    let newFaces = [];
    let newVertices = [];
    let midPoints = {};
    let f = [0, 1, 2];
    let l = 0;

    for(let i = 0; i < faces.length; i++) {
      let cell = faces[i];
      let c0 = cell[0];
      let c1 = cell[1];
      let c2 = cell[2];
      let v0 = vertices[c0];
      let v1 = vertices[c1];
      let v2 = vertices[c2];

      let a = this.getMidPoint(v0, v1, midPoints);
      let b = this.getMidPoint(v1, v2, midPoints);
      let c = this.getMidPoint(v2, v0, midPoints);

      let ai = newVertices.indexOf(a);
      if(ai === -1) {
        ai = l++;
        newVertices.push(a);
      }

      let bi = newVertices.indexOf(b);
      if(bi === -1) {
        bi = l++;
        newVertices.push(b);
      }

      let ci = newVertices.indexOf(c);
      if(ci === -1) {
        ci = l++;
        newVertices.push(c);
      }

      let v0i = newVertices.indexOf(v0);
      if(v0i === -1) {
        v0i = l++;
        newVertices.push(v0);
      }

      let v1i = newVertices.indexOf(v1);
      if(v1i === -1) {
        v1i = l++;
        newVertices.push(v1);
      }

      let v2i = newVertices.indexOf(v2);
      if(v2i === -1) {
        v2i = l++;
        newVertices.push(v2);
      }

      newFaces.push([v0i, ai, ci])
      newFaces.push([v1i, bi, ai])
      newFaces.push([v2i, ci, bi])
      newFaces.push([ai, bi, ci])
    }
    
    recursionLevel--;
    let newModel = {
      faces: newFaces,
      vertices: newVertices
    };

    return this.subDivide(newModel, recursionLevel);
  }

  getMidPoint(a, b, midPoints) {
    let point = this.midPoint(a, b)
      let pointKey = this.pointToKey(point)
      let cachedPoint = midPoints[pointKey]
      if (cachedPoint) {
        return cachedPoint
      } else {
        return midPoints[pointKey] = point
      }
  }

  pointToKey(point) {
    return point[0].toPrecision(6) + ',' + point[1].toPrecision(6) + ',' + point[2].toPrecision(6);
  }

  midPoint(a, b) {
    return [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      (a[2] + b[2]) / 2
    ]
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
