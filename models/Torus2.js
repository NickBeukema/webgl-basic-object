/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Torus2 {
  /**
   * Create a torus around the Z+ axis
   * @param {Object} gl      the current WebGL context
   * @param {Number} majRadius  major radius of the torus
   * @param {Number} minRadius  minor radius of the torus
   * @param {Number} majDiv  number of subdivisions of the major circle
   * @param {Number} minDiv  number of subdivisions of the minor circle
   */
  constructor (gl, majRadius, minRadius, majDiv, minDiv) {
    this.NORMAL_SCALE = 0.3;

    this.vertices = [];
    let normalLines = [];
    let n1 = vec3.create();
    let n2 = vec3.create();
    let norm = vec3.create();
    for (let s = 0; s < minDiv; s++) {
      let minAngle = s * 2 * Math.PI / minDiv;
      let h = minRadius * Math.sin(minAngle);
      let radius = majRadius + minRadius * Math.cos(minAngle);
      let b = radius * Math.cos(minAngle);
      for (let k = 0; k < majDiv; k++) {
        let majAngle = k * 2 * Math.PI / majDiv;
        let x = radius * Math.cos(majAngle);
        let y = radius * Math.sin(majAngle);

        /* the first three floats are 3D (x,y,z) position */
        this.vertices.push(x, y, h);
        /* calculate the tangent vectors */
        vec3.set (n1, -Math.sin(majAngle), Math.cos(majAngle), 0);
        vec3.set (n2, -Math.sin(minAngle) * Math.cos(majAngle),
                      -Math.sin(minAngle) * Math.sin(majAngle),
                       Math.cos(minAngle));
        /* n1 is tangent along major circle, n2 is tangent along the minor circle */
        vec3.cross (norm, n1, n2);
        vec3.normalize(norm, norm);
        /* the next three floats are vertex normal */
        this.vertices.push (norm[0], norm[1], norm[2]);

        /* Use normalLines for rendering the normal vectors using LINES (useful for debugging) */
        normalLines.push(x, y, h, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
        normalLines.push (
          x + this.NORMAL_SCALE * norm[0],
          y + this.NORMAL_SCALE * norm[1],
          h + this.NORMAL_SCALE * norm[2], 1, 1, 1);
      }
    }
    this.normalCount = 2 * majDiv * minDiv;

    this.vbuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

    this.nbuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);

    this.indices = [];
    var startIndex = 0;
    for (let s = 0; s < minDiv - 1; s++) {
      let index = [];
      for (let k = 0; k < majDiv; k++) {
        index.push (startIndex + k + majDiv);
        index.push (startIndex + k);
      }
      index.push (startIndex + majDiv);
      index.push (startIndex);
      let iBuff = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuff);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
      this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: iBuff, numPoints: index.length});
      startIndex += majDiv;
    }
    let index = [];
    let NPOINTS = majDiv * minDiv;
    for (let k = 0; k < majDiv; k++) {
      index.push (k, NPOINTS - majDiv + k);
    }
    index.push (0, NPOINTS - majDiv);
    let iBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
    this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: iBuff, numPoints: index.length});
  }


  draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
    /* copy the coordinate frame matrix to the uniform memory in shader */
    gl.uniformMatrix4fv(modelUniform, false, coordFrame);

    /* binder the (vertex+color) buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

    /* with the "packed layout"  (x,y,z,r,g,b),
     the stride distance between one group to the next is 24 bytes */
    gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);

    for (let k = 0; k < this.indices.length; k++) {
      let obj = this.indices[k];
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
      gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
    }
  }
}
