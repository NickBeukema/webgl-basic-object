class BasicShape {
  constructor(gl) {
    this.parts = [];
    this.tmp = mat4.create();
    let randomWhite = (Math.random() * 0.2) + 0.6;
    let randomGrey = (Math.random() * 0.2) + 0.2;

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

  draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
    gl.uniformMatrix4fv(modelUniform, false, coordFrame);

    this.parts.forEach(part => {
      mat4.mul(this.tmp, coordFrame, part.transform);
      part.object.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    });

  }
}
