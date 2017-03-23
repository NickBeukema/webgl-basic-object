class Tire extends BasicShape {
  /**
   * Create a Tire
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl, defaultLighting) {
    super(gl);

    let grey = vec3.fromValues(0.1,0.1,0.1);
    let lighterGrey = vec3.fromValues(0.2,0.2,0.2);
    let white = vec3.fromValues(0.6,0.6,0.6);

    this.radius = 0.1 + 0.01;

    let tireRotate = mat4.create();
    mat4.rotateX(tireRotate, tireRotate, Math.PI/2);

    let tireLighting = {
      tint: grey,
      shinyness: 10,
      diffCoeff: 0.01,
      specCoeff: 0.1
    }

    let hubCapLighting = {
      tint: white,
      shinyness: 90,
      diffCoeff: 0.6,
      specCoeff: 0.7
    }
    //
    // Rubber
    //

    //this.rubber = new Torus(gl, 0.1, 0.02, 10, 20, false, grey, lighterGrey);
    this.rubber = new Torus2(gl, 0.1, 0.02, 10, 20);
    this.rubberTransform = tireRotate;
    this.addPartToList(this.rubber, this.rubberTransform, tireLighting);

    //
    // Hub Cap
    //

    this.hubCap = new TruncCone(gl, 0.08, 0.08, 0.01, 20, 1, white, white);

    let hubCapScale = mat4.create();
    mat4.scale(hubCapScale, hubCapScale, vec3.fromValues(1,1,0.2));

    this.hubCapTransform = mat4.create();
    mat4.mul(this.hubCapTransform, tireRotate, hubCapScale);

    this.addPartToList(this.hubCap, this.hubCapTransform, hubCapLighting);


    //
    // Tire center (front and rear)
    //

    let tireCenterFrontTranslate = mat4.create();
    let tireCenterRearTranslate = mat4.create();

    mat4.translate(tireCenterFrontTranslate, tireCenterFrontTranslate, vec3.fromValues(0, 0.01, 0));
    mat4.translate(tireCenterRearTranslate, tireCenterRearTranslate, vec3.fromValues(0, -0.01, 0));

    this.tireCenterFrontTransform = mat4.create();
    this.tireCenterRearTransform = mat4.create();

    mat4.mul(this.tireCenterFrontTransform, tireCenterFrontTranslate, tireRotate) // Rotate, then translate
    mat4.mul(this.tireCenterRearTransform, tireCenterRearTranslate, tireRotate) // Rotate, then translate

    this.tireCenterFront = new TruncCone(gl, 0.03, 0.03, 0.01, 10, 1, grey, grey)
    this.tireCenterRear = new TruncCone(gl, 0.03, 0.03, 0.01, 10, 1, grey, grey)

    this.addPartToList(this.tireCenterFront, this.tireCenterFrontTransform, defaultLighting);
    this.addPartToList(this.tireCenterRear, this.tireCenterRearTransform, defaultLighting);

    this.currentTurn = 0;
    this.maxTurn = 0.01;
    this.turnStep = 0.005;
  }

  animate(distance, turnDirection) {
    let radians = distance/this.radius;

    //let turn = (this.maxTurn - Math.abs(this.currentTurn)) * turnDirection;

    //if(Math.abs(turn) > 0.004) {
      //this.currentTurn = turn;
    //}

    let turn = turnDirection * this.turnStep;


    //mat4.rotateZ(this.coordFrame, this.coordFrame, turn);
    mat4.rotateY(this.coordFrame, this.coordFrame, radians);
  }
}
