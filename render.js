/**
 * Created by Nick Beukema and Kevin Anderson
 */
let modelMat = mat4.create();
let canvas;
var currRotationAxis = "rotx";
var rotate = true;
var wireframe = false;
let posAttr, colAttr, modelUnif;
var gl;
let obj;

function main() {
  canvas = document.getElementById("gl-canvas");

  /* setup window resize listener */
  window.addEventListener('resize', resizeWindow);

  gl = WebGLUtils.create3DContext(canvas, null);
  ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
  .then (prog => {

    /* put all one-time initialization logic here */
    gl.useProgram (prog);
    gl.clearColor (0, 0, 0, 1);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable (gl.DEPTH_TEST);

    primitive1 = gl.POINTS;
    primitive2 = gl.POINTS;

    /* the vertex shader defines TWO attribute vars and ONE uniform var */
    posAttr = gl.getAttribLocation (prog, "vertexPos");
    colAttr = gl.getAttribLocation (prog, "vertexCol");
    modelUnif = gl.getUniformLocation (prog, "modelCF");
    gl.enableVertexAttribArray (posAttr);
    gl.enableVertexAttribArray (colAttr);

    currSelection = 0;
    createObject();

    /* calculate viewport */
    resizeWindow();

    /* initiate the render loop */
    render();
  });
}

function drawScene() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  /* in the following three cases we rotate the coordinate frame by 1 degree */
  if(rotate) {
    switch (currRotationAxis) {
      case "rotx":
        mat4.rotateX(modelMat, modelMat, Math.PI / 180);
        break;
      case "roty":
        mat4.rotateY(modelMat, modelMat, Math.PI / 180);
        break;
      case "rotz":
        mat4.rotateZ(modelMat, modelMat, Math.PI / 180);
    }
  }

  if (obj) {
    obj.draw(posAttr, colAttr, modelUnif, modelMat);
  }
}

function render() {
  drawScene();
  requestAnimationFrame(render);
}

function createObject() {
  mat4.identity(modelMat);
  obj = new Car(gl);
}

function resizeWindow() {
  let w = 0.98 * window.innerWidth;
  let h = 0.6 * window.innerHeight;
  let size = Math.min(0.98 * window.innerWidth, 0.65 * window.innerHeight);
  /* keep a square viewport */
  canvas.width = size;
  canvas.height = size;
  gl.viewport(0, 0, size, size);
}
