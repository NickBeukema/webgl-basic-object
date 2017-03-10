class Car extends BasicShape {
  /**
   * Create a 3D Car
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);

    this.carWidth = 0.5;
    this.carLength = 1.5;

    //
    // Tires
    //

    let tirePosX = (this.carLength/2.0) * .8;
    let tirePosY = (this.carWidth/2.0);


    this.frontRightTire = new Tire(gl);
    this.frontRightTireTranslate = mat4.create();
    mat4.translate(this.frontRightTireTranslate, this.frontRightTireTranslate, vec3.fromValues(-tirePosX,-tirePosY, 0));

    this.frontLeftTire = new Tire(gl);
    this.frontLeftTireTranslate = mat4.create();
    mat4.translate(this.frontLeftTireTranslate, this.frontLeftTireTranslate, vec3.fromValues(-tirePosX,tirePosY, 0));

    this.rearRightTire = new Tire(gl);
    this.rearRightTireTranslate = mat4.create();
    mat4.translate(this.rearRightTireTranslate, this.rearRightTireTranslate, vec3.fromValues(tirePosX,tirePosY, 0));

    this.rearLeftTire = new Tire(gl);
    this.rearLeftTireTranslate = mat4.create();
    mat4.translate(this.rearLeftTireTranslate, this.rearLeftTireTranslate, vec3.fromValues(tirePosX,-tirePosY, 0));


    this.addPartToList(this.parts, this.frontRightTire, this.frontRightTireTranslate);
    this.addPartToList(this.parts, this.frontLeftTire, this.frontLeftTireTranslate);
    this.addPartToList(this.parts, this.rearRightTire, this.rearRightTireTranslate);
    this.addPartToList(this.parts, this.rearLeftTire, this.rearLeftTireTranslate);


    //
    // Front hood
    //

    this.hood = new Hood(gl);

    let hoodTranslate = mat4.create();
    let hoodTranslateVec = vec3.fromValues(-0.675, 0, 0.24);

    mat4.translate(hoodTranslate, hoodTranslate, hoodTranslateVec);

    this.hoodTransform = hoodTranslate;

    this.addPartToList(this.parts, this.hood, this.hoodTransform);


    //
    // Front bumper
    //

    this.frontBumper = new Bumper(gl);
    this.frontBumperTransform = mat4.create();
    this.frontBumperTranslate = mat4.create();
    mat4.translate(this.frontBumperTransform, this.frontBumperTranslate, vec3.fromValues(-this.carLength/2 - 0.183, 0, 0.13));

    this.addPartToList(this.parts, this.frontBumper, this.frontBumperTransform);

    //
    // Roof
    //

    this.roof = new Roof(gl);
    this.roofTransform = mat4.create();
    let roofTranslateVec = vec3.fromValues(0,0,0.5);
    mat4.translate(this.roofTransform, this.roofTransform, roofTranslateVec);

    this.addPartToList(this.parts, this.roof, this.roofTransform);

    //
    // Trunk
    //

    this.trunk = new Trunk(gl);
    this.trunkTransform = mat4.create();
    let trunkTransformVec = vec3.fromValues(0.64,0,0.24);
    mat4.translate(this.trunkTransform, this.trunkTransform, trunkTransformVec);

    this.addPartToList(this.parts, this.trunk, this.trunkTransform);

    //
    // Rear bumper
    //

    this.rearBumper = new Bumper(gl);
    this.rearBumperTransform = mat4.create();
    this.rearBumperTranslate = mat4.create();
    mat4.translate(this.rearBumperTransform, this.rearBumperTranslate, vec3.fromValues(this.carLength/2 + 0.11, 0, 0.13));

    this.addPartToList(this.parts, this.rearBumper, this.rearBumperTransform);

    //
    // Rear Fenders
    //

    this.rearRightFender = new RearFender(gl);
    this.rearRightFenderTranslate = mat4.create();
    mat4.translate(this.rearRightFenderTranslate, this.rearRightFenderTranslate, vec3.fromValues(this.carLength/2 + .07, this.carWidth/2 - .05, .145));

    this.rearLeftFender = new RearFender(gl);
    this.rearLeftFenderTranslate = mat4.create(); 
    mat4.translate(this.rearLeftFenderTranslate, this.rearLeftFenderTranslate, vec3.fromValues(this.carLength/2 + .07, -this.carWidth/2 + .05, .145));

    this.addPartToList(this.parts, this.rearRightFender, this.rearRightFenderTranslate);
    this.addPartToList(this.parts, this.rearLeftFender, this.rearLeftFenderTranslate);


    //
    // Front Fenders
    //

    this.frontRightFender = new FrontFender(gl);
    this.frontRightFenderTranslate = mat4.create();
    mat4.translate(this.frontRightFenderTranslate, this.frontRightFenderTranslate, vec3.fromValues(-this.carLength/2 + .07, this.carWidth/2 - .05, .145));

    this.frontLeftFender = new FrontFender(gl);
    this.frontLeftFenderTranslate = mat4.create();
    mat4.translate(this.frontLeftFenderTranslate, this.frontLeftFenderTranslate, vec3.fromValues(-this.carLength/2 + .07, -this.carWidth/2 + .05, .145));

    this.addPartToList(this.parts, this.frontRightFender, this.frontRightFenderTranslate);
    this.addPartToList(this.parts, this.frontLeftFender, this.frontLeftFenderTranslate);

    //
    // Doors
    //

    this.frontRightDoor = new FrontDoor(gl);
    this.frontRightDoorTransform = mat4.create();

    let frontRightDoorTranslate = mat4.create();
    mat4.translate(frontRightDoorTranslate, frontRightDoorTranslate, vec3.fromValues(-0.2, +this.carWidth/2.0 - 0.07, 0.1));

    mat4.mul(this.frontRightDoorTransform, this.frontRightDoorTransform, frontRightDoorTranslate);



    this.frontLeftDoor = new FrontDoor(gl);
    this.frontLeftDoorTransform = mat4.create();

    let frontLeftDoorTranslate = mat4.create();
    mat4.translate(frontLeftDoorTranslate, frontLeftDoorTranslate, vec3.fromValues(-0.2, -this.carWidth/2.0 + 0.07, 0.1));

    mat4.mul(this.frontLeftDoorTransform, this.frontLeftDoorTransform, frontLeftDoorTranslate);



    this.rearLeftDoor = new FrontDoor(gl);
    this.rearLeftDoorTransform = mat4.create();


    let rearLeftDoorRotate = mat4.create();
    mat4.rotateZ(rearLeftDoorRotate, rearLeftDoorRotate, Math.PI);

    let rearLeftDoorTranslate = mat4.create();
    mat4.translate(rearLeftDoorTranslate, rearLeftDoorTranslate, vec3.fromValues(0.2, -this.carWidth/2.0 + 0.07, 0.1));

    mat4.mul(this.rearLeftDoorTransform, rearLeftDoorTranslate, rearLeftDoorRotate);



    this.rearRightDoor = new FrontDoor(gl);
    this.rearRightDoorTransform = mat4.create();

    let rearRightDoorRotate = mat4.create();
    mat4.rotateZ(rearRightDoorRotate, rearRightDoorRotate, Math.PI);

    let rearRightDoorTranslate = mat4.create();
    mat4.translate(rearRightDoorTranslate, rearRightDoorTranslate, vec3.fromValues(0.2, this.carWidth/2.0 - 0.07, 0.1));

    mat4.mul(this.rearRightDoorTransform, rearRightDoorTranslate, rearRightDoorRotate);


    this.addPartToList(this.parts, this.frontRightDoor, this.frontRightDoorTransform);
    this.addPartToList(this.parts, this.frontLeftDoor, this.frontLeftDoorTransform);
    this.addPartToList(this.parts, this.rearRightDoor, this.rearRightDoorTransform);
    this.addPartToList(this.parts, this.rearLeftDoor, this.rearLeftDoorTransform);


    // Car Floor

    this.floor = new Floor(gl);
    this.floorTranslate = mat4.create();

    mat4.translate(this.floorTranslate, this.floorTranslate, vec3.fromValues(0,0,0.05));


    this.addPartToList(this.parts, this.floor, this.floorTranslate);

    this.tmp = mat4.create();


  }
}
