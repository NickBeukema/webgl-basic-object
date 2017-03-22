class BasicShape {
  constructor(gl) {
    this.parts = [];
    this.normals = [];
    this.tmp = mat4.create();
    this.coordFrame = mat4.create();
    this.temp = mat4.create();
    this.NORMAL_SCALE = 0.3;

    let randomWhite = (Math.random() * 0.2) + 0.6;
    let randomGrey = (Math.random() * 0.2) + 0.2;

    this.red = vec3.fromValues(randomWhite, randomGrey, randomGrey);

    this.white = this.greyFromPercent(randomWhite);
    this.grey = this.greyFromPercent(randomGrey);

    this.white6 = this.greyFromPercent(0.6);
    this.white7 = this.greyFromPercent(0.7);
    this.white8 = this.greyFromPercent(0.8);
    this.white9 = this.greyFromPercent(0.9);

    this.grey3 = this.greyFromPercent(0.3);
  }

  greyFromPercent(percent) {
    return vec3.fromValues(percent, percent, percent);
  }

  addPartToList(object, transform) {
    this.parts.push({
      object: object,
      transform: transform
    });
  }

  draw(vertexAttr, colorAttr, modelUniform, coordFrame, tintUnif) {
    this.parts.forEach(part => {
      //if(part.tint) {
        //gl.uniform3fv(tintUnif, part.tint);
      //}

      mat4.mul(this.tmp, coordFrame, part.transform);
      part.object.draw(vertexAttr, colorAttr, modelUniform, this.tmp, tintUnif);

      //if(part.object.drawNormal) {
        //this.normals.push(part.object);
      //}
    });
  }

  drawNormal (vertexAttr, colorAttr, modelUniform, coordFrame) {
    if(this.normals.length > 0) {
      this.normals.forEach(o => o.drawNormal(vertexAttr, colorAttr, modelUniform, coordFrame));
    } else if (this.normalCount > 0) {
      gl.uniformMatrix4fv(modelUniform, false, coordFrame);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
      gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);
      gl.drawArrays(gl.LINES, 0, this.normalCount/2);
    }
  }
}
