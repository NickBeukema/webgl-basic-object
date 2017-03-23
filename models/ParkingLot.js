class ParkingLot extends BasicShape {
  /**
   * Create a ParkingLot
   * @param {Object} gl         the current WebGL context
   */
  constructor (gl) {
    super(gl);
    this.carWidth = 0.5;
    this.carLength = 1.5;

    let parkingLotSize = 100;

    let parkingLotBase = new Surface(gl, parkingLotSize, 30);
    let parkingLotBaseScale = mat4.create();
    let parkingLotBaseTranslate = mat4.create();

    let pavementTint = vec3.fromValues(0.3, 0.3, 0.3);
    let pavementShinyness = 10;

    this.addPartToList(parkingLotBase, mat4.create(), {
      tint: pavementTint,
      shinyness: pavementShinyness,
      specCoeff: 0.05
    });


    let lineX = 4.3;
    let lineY = -124;
    let lineZ = 0.01;
    let lineTint = vec3.fromValues(0.8, 0.8, 0.8);

    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 13; j++) {
        //let line = new Cube(gl, 1.4, 1, false, this.white9, this.white9);
        let line = new Surface(gl, 1.4, 1);

        let lineScale = mat4.create();
        mat4.scale(lineScale, lineScale, vec3.fromValues(1, 0.04, 1));

        let lineTranslate = mat4.create();
        mat4.translate(lineTranslate, lineTranslate, vec3.fromValues(lineX, lineY, lineZ));

        let lineTransform = mat4.create();
        mat4.mul(lineTransform, lineScale, lineTranslate);

        this.addPartToList(line, lineTransform, {
          tint: lineTint
        });

        lineY += 20.7;
      }

      lineY = -124;
      lineX -= 2.9;
    }

  }
}
