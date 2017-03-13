class FrontDoor extends BasicShape {
  /**
   * Create a Door
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    this.bottomDoorPanel = new Cube(gl, 0.40, 4, false, this.white, this.white);

    let bottomDoorPanelScale = mat4.create();
    mat4.scale(bottomDoorPanelScale, bottomDoorPanelScale, vec3.fromValues(1, 0.7, 0.1));

    let bottomDoorPanelRotate = mat4.create();
    mat4.rotateX(bottomDoorPanelRotate, bottomDoorPanelRotate, Math.PI/2);

    this.bottomDoorPanelTransform = mat4.create();
    mat4.mul(this.bottomDoorPanelTransform, bottomDoorPanelRotate, bottomDoorPanelScale);

    this.addPartToList(this.bottomDoorPanel, this.bottomDoorPanelTransform);



    this.rearDoorFrame = new Cube(gl, 0.28, 4, false, this.white, this.white);
    let rearDoorFrameScale = mat4.create();
    mat4.scale(rearDoorFrameScale, rearDoorFrameScale, vec3.fromValues(0.1, 0.1, 1));

    let rearDoorFrameTranslate = mat4.create();
    mat4.translate(rearDoorFrameTranslate, rearDoorFrameTranslate, vec3.fromValues(0.186,0,0.24));


    this.rearDoorFrameTransform = mat4.create();
    mat4.mul(this.rearDoorFrameTransform, rearDoorFrameTranslate, rearDoorFrameScale);

    this.addPartToList(this.rearDoorFrame, this.rearDoorFrameTransform);


    this.topDoorFrame = new Cube(gl, 0.28, 4, false, this.white, this.white);
    let topDoorFrameScale = mat4.create();
    mat4.scale(topDoorFrameScale, topDoorFrameScale, vec3.fromValues(0.69, 0.1, 0.1));

    let topDoorFrameTranslate = mat4.create();
    mat4.translate(topDoorFrameTranslate, topDoorFrameTranslate, vec3.fromValues(0.1,0,0.366));

    this.topDoorFrameTransform = mat4.create();
    mat4.mul(this.topDoorFrameTransform, topDoorFrameTranslate, topDoorFrameScale);

    this.addPartToList(this.topDoorFrame, this.topDoorFrameTransform);


    this.frontDoorFrame = new Cube(gl, 0.3, 4, false, this.white, this.white);

    let frontDoorFrameScale = mat4.create();
    mat4.scale(frontDoorFrameScale, frontDoorFrameScale, vec3.fromValues(0.1, 0.1, 1));

    let frontDoorFrameTranslate = mat4.create();
    mat4.translate(frontDoorFrameTranslate, frontDoorFrameTranslate, vec3.fromValues(-0.089,0,0.261));

    let frontDoorFrameRotate = mat4.create();
    mat4.rotateY(frontDoorFrameRotate, frontDoorFrameRotate, Math.PI/4.3);

    this.frontDoorFrameTransform = mat4.create();
    mat4.mul(this.frontDoorFrameTransform, frontDoorFrameTranslate, frontDoorFrameRotate);
    mat4.mul(this.frontDoorFrameTransform, this.frontDoorFrameTransform, frontDoorFrameScale);

    this.addPartToList(this.frontDoorFrame, this.frontDoorFrameTransform);


    this.frontDoorFrameFill = new Cube(gl, 0.3, 4, false, this.white, this.white);
    this.frontDoorFrameFillTransform = mat4.create();

    let frontDoorFrameFillScale = mat4.create();
    mat4.scale(frontDoorFrameFillScale, frontDoorFrameFillScale, vec3.fromValues(0.1, 0.1, 0.1));

    let frontDoorFrameFillTranslate = mat4.create();
    mat4.translate(frontDoorFrameFillTranslate, frontDoorFrameFillTranslate, vec3.fromValues(-0.185, 0, 0.143));

    mat4.mul(this.frontDoorFrameFillTransform, frontDoorFrameFillTranslate, frontDoorFrameFillScale);
    this.addPartToList(this.frontDoorFrameFill, this.frontDoorFrameFillTransform);
  }
}
