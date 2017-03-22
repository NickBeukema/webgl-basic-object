/**
 * Created by Nick Beukema and Kevin Anderson
 */
let gl;
let canvas;
let orthoProjMat, persProjMat, viewMat, topViewMat, carCF, sideViewMat, frontViewMat;
let normalMat;
let axisBuff, tmpMat;
let globalAxes;


// Vertex shader attributes
let posAttr, colAttr, normalAttr;


// Shader uniform variables
let modelUnif, projUnif, viewUnif, lightPosUnif;
let objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
let lightPos, useLightingUnif;

const IDENTITY = mat4.create();
let obj, parkingLot;
let lineBuff, normalBuff, objTint, pointLight
let shaderProg, redrawNeeded, showNormal;
let lightingComponentEnabled = [true, true, true];


// View application variables
let currentView = 0;

let addCarButton, carSelectionMenu;
let currentCar = null

let startingY = -4.6;
let startingX = 4.2;
let offset = .83;

function main() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.create3DContext(canvas, null);
  addCar();



  axisBuff = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);

  /* setup window resize listener */
  window.addEventListener('resize', resizeHandler);

  ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
  .then (prog => {
    shaderProg = prog;
    /* put all one-time initialization logic here */
    gl.useProgram (prog);
    gl.clearColor (0, 0, 0, 1);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable (gl.DEPTH_TEST);


    posAttr = gl.getAttribLocation(prog, "vertexPos");
    colAttr = gl.getAttribLocation(prog, "vertexCol");
    normalAttr = gl.getAttribLocation(prog, "vertexNormal");

    projUnif = gl.getUniformLocation(prog, "projection");
    viewUnif = gl.getUniformLocation(prog, "view");
    modelUnif = gl.getUniformLocation(prog, "modelCF");

    lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
    normalUnif = gl.getUniformLocation(prog, "normalMat");
    useLightingUnif = gl.getUniformLocation (prog, "useLighting");

    objTintUnif = gl.getUniformLocation(prog, "objectTint");
    ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
    diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
    specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
    shininessUnif = gl.getUniformLocation(prog, "shininess");
    isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");

    gl.enableVertexAttribArray(posAttr);

    orthoProjMat = mat4.create();
    persProjMat = mat4.create();

    normalMat = mat3.create();

    lightCF = mat4.create();
    tmpMat = mat4.create();

    mat4.lookAt(currentCar.camera,
        vec3.fromValues(2, 0, 1), /* eye */
        vec3.fromValues(1, 0, .5), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */


    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    lightPos = vec3.fromValues(2, 2, 2);
    mat4.fromTranslation(lightCF, lightPos);
    gl.uniform3fv(lightPosUnif, lightPos);

    objTint = vec3.fromValues(0.9, 0.9, 0.9);
    gl.uniform3fv(objTintUnif, objTint);
    console.log(objTint);

    let ambCoeffSlider = Math.random() * 0.2;
    gl.uniform1f(ambCoeffUnif, ambCoeffSlider);

    let diffCoeffSlider = 0.5 + 0.5 * Math.random();  // random in [0.5, 1.0]
    gl.uniform1f(diffCoeffUnif, diffCoeffSlider);

    let specCoeffSlider = Math.random();
    gl.uniform1f(specCoeffUnif, specCoeffSlider);

    let shinySlider = Math.floor(1 + Math.random() * 128);
    gl.uniform1f(shininessUnif, shinySlider);


    gl.uniform3iv (isEnabledUnif, [true, true, true]);

    let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
    pointLight = new Sphere(gl, 0.02, 30, 30, false, yellow, yellow);

    addCar();
    //globalAxes = new Axes(gl);
    parkingLot = new ParkingLot(gl);


    /* calculate viewport */
    resizeHandler();
    /* initiate the render loop */
    render();
  });
}

let viewRadius = 3;
let currentViewPosX = -0.5;
let currentViewPosY = 0;
let viewRangeMultiplier = 20;


function drawScene() {
  //globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);
  parkingLot.draw(posAttr, colAttr, modelUnif, IDENTITY);

  gl.uniform1i (useLightingUnif, false);
  gl.disableVertexAttribArray(normalAttr);
  gl.enableVertexAttribArray(colAttr);

  pointLight.draw(posAttr, colAttr, modelUnif, lightCF);


  gl.uniform1i (useLightingUnif, true);
  gl.disableVertexAttribArray(colAttr);
  gl.enableVertexAttribArray(normalAttr);

  //currentCar.animate();
  //gl.uniformMatrix4fv(modelUnif, false, currentCar.coordFrame);
  //currentCar.draw(posAttr, colAttr, modelUnif, currentCar.temp);

  //for (var i = cars.length - 1; i >= 0; i--) {
    //mat4.mul (tmpMat, viewMat, cars[i].temp);
    //mat3.normalFromMat4 (normalMat, tmpMat);
    //gl.uniformMatrix3fv (normalUnif, false, normalMat);

    //gl.uniformMatrix4fv(modelUnif, false, cars[i].coordFrame);
    //cars[i].draw(posAttr, normalAttr, modelUnif, cars[i].temp);

    ////gl.uniform1i (useLightingUnif, false);
    ////gl.disableVertexAttribArray(normalAttr);
    ////gl.enableVertexAttribArray(colAttr);

    ////cars[i].drawNormal(posAttr, colAttr, modelUnif, cars[i].temp);
  //}
}

function render(now) {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  draw3D(now);

  setTimeout(function() {
    requestAnimationFrame(render);
  }, 200);
}

function draw3D(now) {
  gl.uniformMatrix4fv(projUnif, false, persProjMat);
  gl.uniformMatrix4fv(viewUnif, false, currentCar.camera);
  gl.viewport(0, 0, canvas.width, canvas.height);
  drawScene(now);
}

//function drawScene() {
  //globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);
  //parkingLot.draw(posAttr, colAttr, modelUnif, IDENTITY);

  //currentCar.animate();
  //gl.uniformMatrix4fv(modelUnif, false, currentCar.coordFrame);
  //currentCar.draw(posAttr, colAttr, modelUnif, currentCar.temp);
  ////currentCar.moveCamera();
//}

function resizeHandler() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let orthoRatio = canvas.height / canvas.width;
  let perspectiveRatio = 1/orthoRatio; // must be width/height ratio
  let perspectiveRad = Math.PI/5; // 60 degrees vertical field of view

  // Set orthographic view (for front, top, and side view)
  mat4.ortho(orthoProjMat, -1, 1, -1 * orthoRatio, 1 * orthoRatio, -3, 3);

  // Set perspective 3D view
  mat4.perspective(persProjMat,
    perspectiveRad,    // Angle to view at
    perspectiveRatio,  // Aspect Ratio
    1,                 // near plane at Z=1
    20);               // far plane at Z=20


}

function addCar() {
  currentCar = new Car(gl);
  //currentCar = new Cube(gl, 0.3, 4);
}

function code(e) {
    e = e || window.event;
    return(e.keyCode || e.which);
}

let keyMap = {}
onkeydown = onkeyup = function(e){
  //console.log(e.type, e.keyCode);

  e = e || event; // to deal with IE
  keyMap[e.keyCode] = e.type == 'keydown';

  if(keyMap[87]) {
    let negXTranslate = mat4.create();
    let negXTranslateVec = vec3.fromValues(-.1, 0, 0);
    mat4.translate(negXTranslate, negXTranslate, negXTranslateVec);
    
    currentCar.modify(negXTranslate);
  }

  //l rotate z
  if(keyMap[74]) {
    let zRotate = mat4.create();
    mat4.rotateZ(zRotate, zRotate, Math.PI / 90);

    currentCar.modify(zRotate);
  }
}

document.addEventListener("keydown", onkeydown);
document.addEventListener("keyup", onkeyup);


document.addEventListener("keypress", function(event) {
  // console.log(event.keyCode);
  //w
  //if (event.keyCode == 119) {
    //let negXTranslate = mat4.create();
    //let negXTranslateVec = vec3.fromValues(-.1, 0, 0);
    //mat4.translate(negXTranslate, negXTranslate, negXTranslateVec);

    //currentCar.modify(negXTranslate);
  //}
  //s
  if (event.keyCode == 115) {
      let xTranslate = mat4.create();
      let xTranslateVec = vec3.fromValues(.1, 0, 0);
      mat4.translate(xTranslate, xTranslate, xTranslateVec);

      currentCar.modify(xTranslate);
  }

  //a
  if (event.keyCode == 100) {
      let yTranslate = mat4.create();
      let yTranslateVec = vec3.fromValues(0, .1, 0);
      mat4.translate(yTranslate, yTranslate, yTranslateVec);

      currentCar.modify(yTranslate);
  }

  //d
  if (event.keyCode == 97) {
      let negYTranslate = mat4.create();
      let negYTranslateVec = vec3.fromValues(0, -.1, 0);
      mat4.translate(negYTranslate, negYTranslate, negYTranslateVec);

      currentCar.modify(negYTranslate);
  }

  //q
  if (event.keyCode == 113) {
      let zTranslate = mat4.create();
      let zTranslateVec = vec3.fromValues(0, 0, .1);
      mat4.translate(zTranslate, zTranslate, zTranslateVec);

      currentCar.modify(zTranslate);
  }

  //e
  if (event.keyCode == 101) {
      let negZTranslate = mat4.create();
      let negZTranslateVec = vec3.fromValues(0, 0, -.1);
      mat4.translate(negZTranslate, negZTranslate, negZTranslateVec);

      currentCar.modify(negZTranslate);
  }

  //i rotate y
  if (event.keyCode == 105) {
    let yRotate = mat4.create();
    mat4.rotateY(yRotate, yRotate, Math.PI / 90);

    currentCar.modify(yRotate);
  }

  //k rotate -y
  if (event.keyCode == 107) {
    let negYRotate = mat4.create();
    mat4.rotateY(negYRotate, negYRotate, -Math.PI / 90);

    currentCar.modify(negYRotate);
  }

  //j rotate -z
  if (event.keyCode == 108) {
    let negZRotate = mat4.create();
    mat4.rotateZ(negZRotate, negZRotate, -Math.PI / 90);

    currentCar.modify(negZRotate);
  }


  //o rotate x
  if (event.keyCode == 111) {
    let xRotate = mat4.create();
    mat4.rotateX(xRotate, xRotate, Math.PI / 90);

    currentCar.modify(xRotate);
  }

  //u rotate -x
  if (event.keyCode == 117) {
    let negXRotate = mat4.create();
    mat4.rotateX(negXRotate, negXRotate, -Math.PI / 90);

    currentCar.modify(negXRotate);
  }
  
  // Space
  if (event.keyCode == 32) {
    currentView++;

    if(currentView > 3) {
      currentView = 0;
    }
  }
});
