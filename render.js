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

function main() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.create3DContext(canvas, null);

  canvas.addEventListener("click", changeView);

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
        vec3.fromValues(0,1,0)
    );
    mat4.lookAt(sideViewMat,
        vec3.fromValues(0,2,0),
        vec3.fromValues(0,0,0),
        vec3.fromValues(0,0,1)
    );
    mat4.lookAt(frontViewMat,
        vec3.fromValues(2,0,0),
        vec3.fromValues(0,0,0),
        vec3.fromValues(0,0,1)
    );

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
      obj.draw(posAttr, colAttr, modelUnif, tmpMat);
  }
}

function render() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  draw3D();
  switch(currentView) {
    case 0:
      drawTopView();
      break;
    case 1:
      drawSideView();
      break;
    case 2:
      drawFrontView();
      break;
  }

  requestAnimationFrame(render);
}

function resizeHandler() {
  canvas.width = window.innerWidth;
  canvas.height = 0.9 * window.innerHeight;
  console.log("Width: ", canvas.width, "Height: ", canvas.height);
  if (canvas.width > canvas.height) { /* landscape */
    let ratio = 2 * canvas.height / canvas.width;
    console.log("Landscape mode, ratio is " + ratio);
    mat4.ortho(orthoProjMat, -1, 1, -1 * ratio, 1 * ratio, -3, 3);
    mat4.perspective(persProjMat,
      Math.PI/5,  /* 60 degrees vertical field of view */
      1/ratio,    /* must be width/height ratio */
      1,          /* near plane at Z=1 */
      20);        /* far plane at Z=20 */
  } else {
    alert ("Window is too narrow!");
  }
}

function draw3D() {
  /* We must update the projection and view matrices in the shader */
  gl.uniformMatrix4fv(projUnif, false, persProjMat);
  gl.uniformMatrix4fv(viewUnif, false, viewMat)
  gl.viewport(0, 0, canvas.width/2, canvas.height);
  drawScene();
}

function drawSideView() {
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, sideViewMat);
  gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
  drawScene();
}

function drawFrontView() {
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, frontViewMat);
  gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
  drawScene();
}

function drawTopView() {
  /* We must update the projection and view matrices in the shader */
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, topViewMat);
  gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
  drawScene();
}

function changeView() {
  currentView++;

  if(currentView > 2) {
    currentView = 0;
  }
}