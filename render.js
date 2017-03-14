/**
 * Created by Nick Beukema and Kevin Anderson
 */
var gl;
let canvas;
var textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, carCF, sideViewMat, frontViewMat;
var axisBuff, tmpMat;
var globalAxes;

var parkingLot;

let posAttr, colAttr, modelUnif;
var projUnif, viewUnif;

const IDENTITY = mat4.create();
let obj;
let currentView = 0;

var coneSpinAngle;
var shaderProg;

let addCarButton, carSelectionMenu;
let cars = [];

function main() {
  canvas = document.getElementById("gl-canvas");

  addCarButton = document.getElementById('addCar');
  addCarButton.addEventListener('click', addCar);

  carSelectionMenu = document.getElementById('carSelectionMenu');
  carSelectionMenu.addEventListener('change', selectCar);

  gl = WebGLUtils.create3DContext(canvas, null);


  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousewheel', handleScroll);


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
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


    posAttr = gl.getAttribLocation(prog, "vertexPos");
    colAttr = gl.getAttribLocation(prog, "vertexCol");
    projUnif = gl.getUniformLocation(prog, "projection");
    viewUnif = gl.getUniformLocation(prog, "view");
    modelUnif = gl.getUniformLocation(prog, "modelCF");

    gl.enableVertexAttribArray(posAttr);
    gl.enableVertexAttribArray(colAttr);

    orthoProjMat = mat4.create();
    persProjMat = mat4.create();
    viewMat = mat4.create();
    topViewMat = mat4.create();
    sideViewMat = mat4.create();
    frontViewMat = mat4.create();
    carCF = mat4.create();
    tmpMat = mat4.create();

    mat4.lookAt(viewMat,
        vec3.fromValues(10, 10, 7), /* eye */
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */

    mat4.lookAt(topViewMat,
        vec3.fromValues(0,0,2),
        vec3.fromValues(0,0,0),
        vec3.fromValues(0,1,0));

    mat4.lookAt(sideViewMat,
        vec3.fromValues(0,2,0),
        vec3.fromValues(0,0,0),
        vec3.fromValues(0,0,1));

    mat4.lookAt(frontViewMat,
        vec3.fromValues(2,0,0),
        vec3.fromValues(0,0,0),
        vec3.fromValues(0,0,1));

    globalAxes = new Axes(gl);


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

function handleScroll(evt) {
  let direction = evt.wheelDelta < 0 ? -1 : 1;

  viewRadius += direction/10;
  if(viewRadius < 2) {
    viewRadius = 2;
  } else {
    viewRangeMultiplier += direction;
  }


  renderViewCoords(evt.pageX, evt.pageY, viewRadius);
}

isDragging = false;

function handleMouseDown(evt) {
  isDragging = true;
}

function handleMouseUp() {
  isDragging = false;
}

function handleMouseMove(evt) {
  if(!isDragging) { return; }

  renderViewCoords(evt.pageX, evt.pageY, viewRadius);
}

function renderViewCoords(pageX, pageY, radius) {
  x = -(pageX / document.body.getBoundingClientRect().width - 0.5) * viewRangeMultiplier;
  y = (pageY / document.body.getBoundingClientRect().height - 0.5) * viewRangeMultiplier;
  let longitude = x/radius;
  let latitude = 2 * Math.atan(Math.exp(y/radius)) - Math.PI/2;

  let pX = radius * Math.cos(latitude) * Math.cos(longitude);
  let pY = radius * Math.cos(latitude) * Math.sin(longitude);
  let pZ = radius * Math.sin(latitude);

  mat4.lookAt(viewMat,
      vec3.fromValues(pX, pY, pZ), /* eye */
      vec3.fromValues(0, 0, 0), /* focal point */
      vec3.fromValues(0, 0, 1)); /* up */
}

function drawScene() {
  //globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);
  parkingLot.draw(posAttr, colAttr, modelUnif, IDENTITY);


  for (var i = cars.length - 1; i >= 0; i--) {
    gl.uniformMatrix4fv(modelUnif, false, cars[i].coordFrame);
    cars[i].draw(posAttr, colAttr, modelUnif, cars[i].temp);
  }
}

function render() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  switch(currentView) {
    case 0:
      draw3D();
      break;
    case 1:
      drawTopView();
      break;
    case 2:
      drawSideView();
      break;
    case 3:
      drawFrontView();
      break;
  }

  requestAnimationFrame(render);
}

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

function draw3D() {
  gl.uniformMatrix4fv(projUnif, false, persProjMat);
  gl.uniformMatrix4fv(viewUnif, false, viewMat)
  gl.viewport(0, 0, canvas.width, canvas.height);
  drawScene();
}

function drawSideView() {
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, sideViewMat);
  gl.viewport(0, 0, canvas.width, canvas.height);
  drawScene();
}

function drawFrontView() {
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, frontViewMat);
  gl.viewport(0, 0, canvas.width, canvas.height);
  drawScene();
}

function drawTopView() {
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, topViewMat);
  gl.viewport(0, 0, canvas.width, canvas.height);
  drawScene();
}

function addCar() {
  cars.push(new Car(gl));
  if(cars.length === 1) {
    currentCar = cars[0];
  }
  updateList();
}

function selectCar(ev) {
  let sel = ev.currentTarget.selectedIndex;
  currentCar = cars[sel];
}

function updateList() {
  carSelectionMenu.options.length=0;
  for (var i = 0; i < cars.length; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    carSelectionMenu.appendChild(opt);
  }
}

function code(e) {
    e = e || window.event;
    return(e.keyCode || e.which);
}

document.addEventListener("keypress", function(event) {
  console.log(event.keyCode);
  //w
  if (event.keyCode == 119) {
    let negXTranslate = mat4.create();
    let negXTranslateVec = vec3.fromValues(-.1, 0, 0);
    mat4.translate(negXTranslate, negXTranslate, negXTranslateVec);

    currentCar.modify(negXTranslate);
  }
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

  //l rotate z
  if (event.keyCode == 106) {
    let zRotate = mat4.create();
    mat4.rotateZ(zRotate, zRotate, Math.PI / 90);

    currentCar.modify(zRotate);
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
})
