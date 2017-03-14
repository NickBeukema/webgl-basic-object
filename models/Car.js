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
    let tirePosXRear = tirePosX - 0.05;
    let tirePosY = (this.carWidth/2.0) - 0.05;


    this.frontRightTire = new Tire(gl);
    this.frontRightTireTranslate = mat4.create();
    mat4.translate(this.frontRightTireTranslate, this.frontRightTireTranslate, vec3.fromValues(-tirePosX,-tirePosY, 0));

    this.frontLeftTire = new Tire(gl);
    this.frontLeftTireTranslate = mat4.create();
    mat4.translate(this.frontLeftTireTranslate, this.frontLeftTireTranslate, vec3.fromValues(-tirePosX,tirePosY, 0));

    this.rearRightTire = new Tire(gl);
    this.rearRightTireTranslate = mat4.create();
    mat4.translate(this.rearRightTireTranslate, this.rearRightTireTranslate, vec3.fromValues(tirePosXRear,tirePosY, 0));

    this.rearLeftTire = new Tire(gl);
    this.rearLeftTireTranslate = mat4.create();
    mat4.translate(this.rearLeftTireTranslate, this.rearLeftTireTranslate, vec3.fromValues(tirePosXRear,-tirePosY, 0));


    this.addPartToList(this.frontRightTire, this.frontRightTireTranslate);
    this.addPartToList(this.frontLeftTire, this.frontLeftTireTranslate);
    this.addPartToList(this.rearRightTire, this.rearRightTireTranslate);
    this.addPartToList(this.rearLeftTire, this.rearLeftTireTranslate);


    //
    // Front hood
    //

    this.hood = new Hood(gl);

    let hoodTranslate = mat4.create();
    let hoodTranslateVec = vec3.fromValues(-0.675, 0, 0.24);

    mat4.translate(hoodTranslate, hoodTranslate, hoodTranslateVec);

    this.hoodTransform = hoodTranslate;

    this.addPartToList(this.hood, this.hoodTransform);


    //
    // Front bumper
    //

    this.frontBumper = new Bumper(gl);
    this.frontBumperTransform = mat4.create();
    this.frontBumperTranslate = mat4.create();
    mat4.translate(this.frontBumperTransform, this.frontBumperTranslate, vec3.fromValues(-this.carLength/2 - 0.183, 0, 0.13));

    this.addPartToList(this.frontBumper, this.frontBumperTransform);


    //
    // Trunk
    //

    this.trunk = new Trunk(gl);
    this.trunkTransform = mat4.create();
    let trunkTransformVec = vec3.fromValues(0.615,0,0.24);
    mat4.translate(this.trunkTransform, this.trunkTransform, trunkTransformVec);

    this.addPartToList(this.trunk, this.trunkTransform);

    //
    // Rear bumper
    //

    this.rearBumper = new Bumper(gl);
    this.rearBumperTransform = mat4.create();
    this.rearBumperTranslate = mat4.create();
    mat4.translate(this.rearBumperTransform, this.rearBumperTranslate, vec3.fromValues(this.carLength/2 + 0.04, 0, 0.13));

    this.addPartToList(this.rearBumper, this.rearBumperTransform);

    //
    // Rear Fenders and Wheel Wells
    //

    let rearFenderX = this.carLength/2;
    let rearFenderY = this.carWidth/2 - 0.05;
    let rearFenderZ = 0.145;


    let rearRightTranslateVector = vec3.fromValues(rearFenderX, rearFenderY, rearFenderZ);

    this.rearRightFender = new RearFender(gl);
    this.rearRightFenderTranslate = mat4.create();
    mat4.translate(this.rearRightFenderTranslate, this.rearRightFenderTranslate, rearRightTranslateVector);

    this.rearRightWheelWell = new RearWheelWell(gl);
    this.rearRightWheelWellTransform = mat4.create();
    mat4.translate(this.rearRightWheelWellTransform, this.rearRightWheelWellTransform, vec3.fromValues(rearFenderX - 0.25, rearFenderY, rearFenderZ));

    this.addPartToList(this.rearRightFender, this.rearRightFenderTranslate);
    this.addPartToList(this.rearRightWheelWell, this.rearRightWheelWellTransform);


    let rearLeftTranslateVector = vec3.fromValues(rearFenderX, -rearFenderY, rearFenderZ);


    this.rearLeftFender = new RearFender(gl);
    this.rearLeftFenderTranslate = mat4.create(); 
    mat4.translate(this.rearLeftFenderTranslate, this.rearLeftFenderTranslate, rearLeftTranslateVector);


    this.rearLeftWheelWell = new RearWheelWell(gl);
    this.rearLeftWheelWellTransform = mat4.create();

    let rearLeftWheelWellRotate = mat4.create();
    let rearLeftWheelWellTranslate = mat4.create();

    mat4.rotateZ(rearLeftWheelWellRotate, rearLeftWheelWellRotate, Math.PI);
    mat4.translate(rearLeftWheelWellTranslate, rearLeftWheelWellTranslate, vec3.fromValues(rearFenderX - 0.158, -rearFenderY, rearFenderZ));

    mat4.mul(this.rearLeftWheelWellTransform, rearLeftWheelWellTranslate, rearLeftWheelWellRotate);


    this.addPartToList(this.rearLeftFender, this.rearLeftFenderTranslate);
    this.addPartToList(this.rearLeftWheelWell, this.rearLeftWheelWellTransform);

    //
    // Front Fenders and Wheel Wells
    //

    this.frontRightFender = new FrontFender(gl);
    this.frontRightFenderTranslate = mat4.create();
    let frontRightTranslateVector = vec3.fromValues(-this.carLength/2 + .07, this.carWidth/2 - .05, .145);
    mat4.translate(this.frontRightFenderTranslate, this.frontRightFenderTranslate, frontRightTranslateVector);

    this.frontRightWheelWell = new FrontWheelWell(gl);
    this.frontRightWheelWellTransform = mat4.create();
    mat4.translate(this.frontRightWheelWellTransform, this.frontRightWheelWellTransform, frontRightTranslateVector);

    this.addPartToList(this.frontRightFender, this.frontRightFenderTranslate);
    this.addPartToList(this.frontRightWheelWell, this.frontRightWheelWellTransform);




    this.frontLeftFender = new FrontFender(gl);
    this.frontLeftFenderTranslate = mat4.create();
    let frontLeftTranslateVector = vec3.fromValues(-this.carLength/2 + .07, -this.carWidth/2 + .05, .145);
    mat4.translate(this.frontLeftFenderTranslate, this.frontLeftFenderTranslate, frontLeftTranslateVector);

    this.frontLeftWheelWell = new FrontWheelWell(gl);
    this.frontLeftWheelWellTransform = mat4.create();

    let frontLeftWheelWellRotate = mat4.create();
    let frontLeftWheelWellTranslate = mat4.create();

    mat4.rotateZ(frontLeftWheelWellRotate, frontLeftWheelWellRotate, Math.PI);
    mat4.translate(frontLeftWheelWellTranslate, frontLeftWheelWellTranslate, vec3.fromValues(-this.carLength/2 + 0.22, -this.carWidth/2 + 0.05, 0.145));

    mat4.mul(this.frontLeftWheelWellTransform, frontLeftWheelWellTranslate, frontLeftWheelWellRotate);

    this.addPartToList(this.frontLeftFender, this.frontLeftFenderTranslate);
    this.addPartToList(this.frontLeftWheelWell, this.frontLeftWheelWellTransform);


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


    this.addPartToList(this.frontRightDoor, this.frontRightDoorTransform);
    this.addPartToList(this.frontLeftDoor, this.frontLeftDoorTransform);
    this.addPartToList(this.rearRightDoor, this.rearRightDoorTransform);
    this.addPartToList(this.rearLeftDoor, this.rearLeftDoorTransform);


    //
    // Car Floor
    //

    this.floor = new Floor(gl);
    this.floorTranslate = mat4.create();

    mat4.translate(this.floorTranslate, this.floorTranslate, vec3.fromValues(-0.072,0,0.05));


    this.addPartToList(this.floor, this.floorTranslate);
    
    //
    // Roof
    //

    this.roof = new Roof(gl);
    this.roofTransform = mat4.create();
    let roofTranslateVec = vec3.fromValues(0,0,0.5);
    mat4.translate(this.roofTransform, this.roofTransform, roofTranslateVec);

    this.addPartToList(this.roof, this.roofTransform);
  }

  modify(mat4Modifier) {
    mat4.mul(this.temp, this.temp, mat4Modifier);
  }
}
