class ParkingLot extends BasicShape {
  /**
   * Create a ParkingLot
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);
    this.carWidth = 0.5;
    this.carLength = 1.5;

    let parkingLotSize = 10;
    let parkingLotZScale = parkingLotSize/10000;
    //let parkingLotZTranslate = (-parkingLotSize/1) ;
    let parkingLotZTranslate = 0;

    let parkingLotBase = new Cube(gl, parkingLotSize, 1, false, this.grey, this.grey);
    let parkingLotBaseScale = mat4.create();
    let parkingLotBaseTranslate = mat4.create();

    mat4.scale(parkingLotBaseScale, parkingLotBaseScale, vec3.fromValues(1,1,parkingLotZScale));
    mat4.translate(parkingLotBaseTranslate, parkingLotBaseTranslate, vec3.fromValues(0,0, parkingLotZTranslate));

    let parkingLotBaseTransform = mat4.create();

    mat4.mul(parkingLotBaseTransform, parkingLotBaseScale, parkingLotBaseTranslate);

    this.addPartToList(parkingLotBase, parkingLotBaseTransform);



    let lineX = 4.3;
    let lineY = -124;
    let lineZ = 0;

    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 13; j++) {
        let line = new Cube(gl, 1.4, 1, false, this.white9, this.white9);

        let lineScale = mat4.create();
        mat4.scale(lineScale, lineScale, vec3.fromValues(1, 0.04, 0.01));

        let lineTranslate = mat4.create();
        mat4.translate(lineTranslate, lineTranslate, vec3.fromValues(lineX, lineY, lineZ));

        let lineTransform = mat4.create();
        mat4.mul(lineTransform, lineScale, lineTranslate);

        this.addPartToList(line, lineTransform);

        lineY += 20.7;
      }

      lineY = -124;
      lineX -= 2.9;
    }

  }
}
