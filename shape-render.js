/**
 * Created by Hans Dulimarta.
 */
let modelMat = mat4.create();
let canvas, paramGroup;
var currSelection = 0;
var currRotationAxis = "rotx";
var primitive1 = null;
var primitive2 = null;
var rotate = true;
var wireframe = false;
let posAttr, colAttr, modelUnif;
var gl;
let obj;

function main() {
  canvas = document.getElementById("gl-canvas");

  /* setup event listener for drop-down menu */
  let menu = document.getElementById("menu");
  menu.addEventListener("change", menuSelected);

  /* setup click listener for th "insert" button */
  let button = document.getElementById("insert");
  button.addEventListener("click", createObject);

  /* setup click listener for the radio buttons (axis of rotation) */
  let radioGroup = document.getElementsByName("rotateGroup");
  for (let r of radioGroup) {
    r.addEventListener('click', rbClicked);
  }

  let wireframeButton = document.getElementById("wireframe");
  wireframeButton.addEventListener('click', wfbClicked);

  /* setup click listener for th "rotate" button */
  let rotateButton = document.getElementById("rotate");
  rotateButton.addEventListener("click", rotateControl);

  paramGroup = document.getElementsByClassName("param-group");
  paramGroup[0].hidden = false;


  let elements = document.getElementsByClassName('slider');
  for(i=0; i <elements.length; i++) {
    let element = elements[i];
    element.addEventListener("input", sliderSlid);
    setElementText(element.id + "-value", element.valueAsNumber);
  }


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
  obj = null;
  let height = null;

  let radiusBottom = null;
  let radiusTop = null;
  let radius = null;
  let tubeRadius = null;

  let subDiv = null;
  let vertStacks = null;
  let size = null;
  let latLines = null;
  let longLines = null;
  let recursion = null;
  let innerRadius = null;
  let outerRadius = null;


  mat4.identity(modelMat);
  switch (currSelection) {
    case 0:
      height = document.getElementById("cone-height").valueAsNumber;
      radiusBottom = document.getElementById("cone-radius").valueAsNumber;
      subDiv = document.getElementById("cone-subdiv").valueAsNumber;
      vertStacks = document.getElementById("vert-stacks").valueAsNumber;
      obj = new Cone(gl, radiusBottom, height, subDiv, vertStacks, wireframe);
      break;
    case 1:
      height = document.getElementById("trunc-cone-height").valueAsNumber;
      radiusBottom = document.getElementById("trunc-cone-radius-bottom").valueAsNumber;
      radiusTop = document.getElementById("trunc-cone-radius-top").valueAsNumber;
      subDiv = document.getElementById("trunc-cone-subdiv").valueAsNumber;
      vertStacks = document.getElementById("trunc-cone-stacks").valueAsNumber;
      obj = new TruncCone(gl, radiusBottom, radiusTop, height, subDiv, vertStacks, wireframe);
      break;
    case 2:
      size = document.getElementById("cube-size").valueAsNumber;
      subDiv = document.getElementById("cube-subdiv").valueAsNumber;
      obj = new Cube(gl, size, subDiv, wireframe);
      break;
    case 3:
      radiusBottom = document.getElementById("sphere-radius").valueAsNumber;
      latLines = document.getElementById("sphere-lat").valueAsNumber;
      longLines = document.getElementById("sphere-long").valueAsNumber;
      obj = new Sphere(gl, radiusBottom, latLines, longLines, wireframe);
      break;
    case 4:
      recursion = document.getElementById('sphere-recursion').valueAsNumber;
      radiusBottom = document.getElementById('recursive-sphere-radius').valueAsNumber;
      obj = new RecursiveSphere(gl, radiusBottom, recursion, wireframe);
      break;
    case 5:
      radius = document.getElementById('torus-radius').valueAsNumber;
      tubeRadius = document.getElementById('torus-tube-radius').valueAsNumber;
      vertStacks = document.getElementById('torus-longitude-lines').valueAsNumber;
      subDiv = document.getElementById('torus-subdiv').valueAsNumber;
      obj = new Torus(gl, radius, tubeRadius, vertStacks, subDiv, wireframe);
      break;
    case 6:
      innerRadius = document.getElementById('ring-inner-radius').valueAsNumber;
      outerRadius = document.getElementById('ring-outer-radius').valueAsNumber;
      height = document.getElementById('ring-height').valueAsNumber;
      vertStacks = document.getElementById('ring-vertical-stacks').valueAsNumber;
      subDiv = document.getElementById('ring-subdiv').valueAsNumber;
      obj = new Ring(gl, innerRadius, outerRadius, height, vertStacks, subDiv, wireframe);
      break;
    case 7:
      recursion = document.getElementById('icos-recursion').valueAsNumber;
      console.log(recursion);
      obj = new Icosphere(gl, recursion, wireframe);
      break;
    case 8:
      obj = new Tire(gl);
      break;
    case 9:
      obj = new Hood(gl);
      break;
    case 10:
      obj = new Bumper(gl);
      break;
  }
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

function menuSelected(ev) {
  let sel = ev.currentTarget.selectedIndex;
  paramGroup[currSelection].hidden = true;
  paramGroup[sel].hidden = false;
  currSelection = sel;
}

function rbClicked(ev) {
  currRotationAxis = ev.currentTarget.value;
}

function wfbClicked(ev) {
  wireframe = !wireframe;
  createObject();
}

function sliderSlid(ev) {
  setElementText(ev.target.id + "-value", ev.target.valueAsNumber);
}

function setElementText(id, value) {
  el = document.getElementById(id);
  if(el === null) { return; }
  el.innerHTML = value;
}

function rotateControl() {
  rotate = !rotate;
}
