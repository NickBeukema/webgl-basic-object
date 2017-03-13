/**
 * Created by Nick Beukema and Kevin Anderson
 */
var gl;
let canvas;
var textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, carCF, sideViewMat, frontViewMat;
var axisBuff, tmpMat;
var globalAxes;

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
  canvas.addEventListener("click", changeView);

  addCarButton = document.getElementById('addCar');
  addCarButton.addEventListener('click', addCar);

  carSelectionMenu = document.getElementById('carSelectionMenu');
  carSelectionMenu.addEventListener('change', selectCar);
  
  gl = WebGLUtils.create3DContext(canvas, null);



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
        vec3.fromValues(2, 2, 2), /* eye */
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

    gl.uniformMatrix4fv(modelUnif, false, carCF);

    globalAxes = new Axes(gl);
    coneSpinAngle = 0;

    obj = new Car(gl);

    /* calculate viewport */
    resizeHandler();

    /* initiate the render loop */
    render();
  });
}

function drawScene() {
  globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);

  if (typeof obj !== 'undefined') {
    for (var i = cars.length - 1; i >= 0; i--) {
      cars[i].draw(posAttr, colAttr, modelUnif, tmpMat);
    }
    obj.draw(posAttr, colAttr, modelUnif, tmpMat);
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

function changeView() {
  currentView++;

  if(currentView > 3) {
    currentView = 0;
  }
}

function addCar() {
  cars.push(new Car(gl));
  updateList();
}

function selectCar() {
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
