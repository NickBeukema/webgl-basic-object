class BasicShape {
  constructor(gl) {
    this.parts = [];
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
