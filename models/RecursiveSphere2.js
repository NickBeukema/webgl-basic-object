class RecursiveSphere {
  /**
   * Create a 3D Recursive Sphere with a given amount of sub divides through recursion
   * @param {Object} gl             the current WebGL context
   * @param {Number} recursionLevel amount of times to recursively subdivide
   * @param {vec3}   col1           color #1 to use
   * @param {vec3}   col2           color #2 to use
   */
  constructor (gl, radius = .5, recursionLevel = 1, wireframe = false, col1, col2) {
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
    console.log(1, radius);

    /* Instead of allocating two separate JS arrays (one for position and one for color),
       in the following loop we pack both position and color
       so each tuple (x,y,z,r,g,b) describes the properties of a vertex
       */

    vertices.push([1, 1, 1]);
    vertices.push([-1, -1, 1]);
    vertices.push([-1, 1, -1]);
    vertices.push([1, -1, -1]);

    let faces = [];

    faces.push([0, 1, 2]);
    faces.push([0, 2, 3]);
    faces.push([0, 3, 1]);
    faces.push([1, 3, 2]);

    let model = this.subDivide(vertices, faces, recursionLevel);
    let newVertices = model.vertices;
    vertices = [];
    for (var i = 0; i < newVertices.length; i++) {
      vec3.normalize(newVertices[i], newVertices[i]);
      vertices.push(newVertices[i][0] * radius, newVertices[i][1] * radius, newVertices[i][2] * radius);
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

  subDivide(vertices, faces, recursionLevel) {
    let newFaces = [];
    let newVertices = vertices;
    let midPoints = {};
    let l = vertices.length;

    for(let i = 0; i < faces.length; i++) {
      let model = this.divideFace(faces[i], newVertices, midPoints, recursionLevel, l);
      Array.prototype.push.apply(newFaces, model.faces);
      newVertices = model.vertices;
      l = model.l;
    }

    return {vertices: newVertices, faces: newFaces};
  }

  divideFace(face, vertices, midPoints, recursionLevel, l) {
    if(recursionLevel === 0) {
      return {vertices: vertices, faces: [face], l: l};
    }

    let newFaces = [];

    let f0 = face[0];
    let f1 = face[1];
    let f2 = face[2];
    let v0 = vertices[f0];
    let v1 = vertices[f1];
    let v2 = vertices[f2];

    let a = this.getMidPoint(v0, v1, midPoints);
    let b = this.getMidPoint(v1, v2, midPoints);
    let c = this.getMidPoint(v2, v0, midPoints);

    

    let ai = this.indexOfPoint(a, vertices);
    if(ai === -1) {
      ai = l++;
      vertices.push(a);
    }

    let bi = this.indexOfPoint(b, vertices);
    if(bi === -1) {
      bi = l++;
      vertices.push(b);
    }

    let ci = this.indexOfPoint(c, vertices);
    if(ci === -1) {
      ci = l++;
      vertices.push(c);
    }

    let v0i = this.indexOfPoint(v0, vertices);
    if(v0i === -1) {
      v0i = l++;
      vertices.push(v0);
    }

    let v1i = this.indexOfPoint(v1, vertices);
    if(v1i === -1) {
      v1i = l++;
      vertices.push(v1);
    }

    let v2i = this.indexOfPoint(v2, vertices);
    if(v2i === -1) {
      v2i = l++;
      vertices.push(v2);
    }
 
    recursionLevel = recursionLevel - 1;

    let newFace = [v0i, ai, ci];
    let model1 = this.divideFace(newFace, vertices, midPoints, recursionLevel, l);
    Array.prototype.push.apply(newFaces, model1.faces);
    vertices =  model1.vertices;
    l = model1.l;

    newFace = [v1i, bi, ai];
    let model2 = this.divideFace(newFace, vertices, midPoints, recursionLevel, l);
    Array.prototype.push.apply(newFaces, model2.faces);
    vertices =  model2.vertices;
    l = model2.l;

    newFace = [v2i, ci, bi];
    let model3 = this.divideFace(newFace, vertices, midPoints, recursionLevel, l);
    Array.prototype.push.apply(newFaces, model3.faces);
    vertices =  model3.vertices;
    l = model3.l;

    newFace = [ai, bi, ci];
    let model4 = this.divideFace(newFace, vertices, midPoints, recursionLevel, l);
    Array.prototype.push.apply(newFaces, model4.faces);
    vertices =  model4.vertices;
    l = model4.l;

    return {vertices: vertices, faces: newFaces, l: l};
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

  midPoint(a, b) {
    let midX = (a[0] + b[0]) / 2;
    let midY = (a[1] + b[1]) / 2;
    let midZ = (a[2] + b[2]) / 2
    
    let midPoint = [midX, midY, midZ];
    return midPoint;
  }

  pointToKey(point) {
    return point[0].toPrecision(6) + ',' + point[1].toPrecision(6) + ',' + point[2].toPrecision(6);
  }

  indexOfPoint(point, vertices) {
    for(let i = 0; i < vertices.length; i++) {
      if(point[0] === vertices[i][0] && point[1] === vertices[i][1] && point[2] === vertices[i][2]) {
        return i;
      }
    }
    return -1;
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
