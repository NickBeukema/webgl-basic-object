class Axes {
  constructor (gl) {
    let xcolor = vec3.fromValues(1, 71/255, 0.0);
    let ycolor = vec3.fromValues(0x38/255, 0x8e/255, 0x3c/255);
    let zcolor = vec3.fromValues(0x4f/255, 0xc3/255, 0xf7/255);
    this.xaxis = new TruncCone(gl, 0.03, 0.03, 0.9, 20, xcolor, xcolor);
    this.yaxis = new TruncCone(gl, 0.03, 0.03, 0.9, 20, ycolor, ycolor);
    this.zaxis = new TruncCone(gl, 0.03, 0.03, 0.9, 20, zcolor, zcolor);
    let rotypos90 = quat.setAxisAngle(quat.create(), vec3.fromValues(0,1,0), Math.PI/2);
    let rotxneg90 = quat.setAxisAngle(quat.create(), vec3.fromValues(1,0,0), -Math.PI/2);
    let transx = vec3.fromValues(0.45, 0, 0);
    let transy = vec3.fromValues(0, 0.45, 0);
    let transz = vec3.fromValues(0, 0, 0.45);
    this.cyltrans = mat4.fromTranslation(mat4.create(), transz);
    this.xmat = mat4.fromRotationTranslation(mat4.create(), rotypos90, transx);
    this.ymat = mat4.fromRotationTranslation(mat4.create(), rotxneg90, transy);
    this.tmp = mat4.create();
  }

  draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
    mat4.multiply(this.tmp, coordFrame, this.xmat);
    this.xaxis.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    mat4.multiply(this.tmp, coordFrame, this.ymat);
    this.yaxis.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    mat4.multiply(this.tmp, coordFrame, this.cyltrans);
    this.zaxis.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
  }
}