/**
 * Created by Nick Beukema and Kevin Anderson
 */
let gl;
let canvas;
let orthoProjMat, persProjMat, viewMat, topViewMat, carCF, sideViewMat, frontViewMat;
let normalMat;
let axisBuff, tmpMat;
let globalAxes;

let views = {
  followView: 1,
  draggableView: -1
}


// Vertex shader attributes
let posAttr, colAttr, normalAttr;


// Shader uniform variables
let modelUnif, projUnif, viewUnif, lightPosUnif;
let objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
let lightingUnifs;
let lightPos, useLightingUnif;
let lightPos2;

const IDENTITY = mat4.create();
let currentCar, parkingLot;
let lineBuff, normalBuff, objTint, pointLight
let shaderProg, redrawNeeded, showNormal;
let lightingComponentEnabled;
let showAmbient = showDiffuse = showSpecular = true;


// View application variables
let currentView = 1;

let startingY = -4.6;
let startingX = 4.2;
let offset = .83;

function main() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.create3DContext(canvas, null);

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousewheel', handleScroll);

  let ambientCheckbox = document.getElementById("amb-check");
  let diffuseCheckbox = document.getElementById("diff-check");
  let specularCheckbox = document.getElementById("spec-check");

  ambientCheckbox.addEventListener('change', ev => {
    showAmbient = ev.target.checked;
    document.activeElement.blur();
  });

  diffuseCheckbox.addEventListener('change', ev => {
    showDiffuse = ev.target.checked;
    document.activeElement.blur();
  });

  specularCheckbox.addEventListener('change', ev => {
    showSpecular = ev.target.checked;
    document.activeElement.blur();
  });


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


    lightingUnifs = {
      tintUnif: objTintUnif,
      ambCoeffUnif: ambCoeffUnif,
      diffCoeffUnif: diffCoeffUnif,
      specCoeffUnif: specCoeffUnif,
      shininessUnif: shininessUnif
    };

    posUnifs = {
      normalUnif: normalUnif
    };


    gl.enableVertexAttribArray(posAttr);

    persProjMat = mat4.create();
    viewMat = mat4.create();

    carCF = mat4.create();


    normalMat = mat3.create();

    lightCF = mat4.create();
    lightCF2 = mat4.create();
    tmpMat = mat4.create();

    mat4.lookAt(viewMat,
        vec3.fromValues(4, 0, 2), /* eye */
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */

    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);

    lightPos = vec3.fromValues(2, 2, 2);
    lightPos2 = vec3.fromValues(-2, -2, 2);

    gl.uniform3fv(lightPosUnif, [...lightPos, ...lightPos2]);

    gl.uniform1f(ambCoeffUnif, 0.1);
    gl.uniform1f(diffCoeffUnif, 0.8);


    //globalAxes = new Axes(gl);

    gl.uniform3iv (isEnabledUnif, [showAmbient, showDiffuse, showSpecular]);

    parkingLot = new ParkingLot(gl);
    currentCar = new Car(gl);
    let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
    pointLight = new Sphere(gl, 0.02, 30, 30, false, yellow, yellow);


    /* calculate viewport */
    resizeHandler();
    /* initiate the render loop */
    render();
  });
}


function drawScene() {
  //globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);

  // Enable manual coloring and disable lighting
  gl.uniform1i (useLightingUnif, false);
  gl.disableVertexAttribArray(normalAttr);
  gl.enableVertexAttribArray(colAttr);

  mat4.fromTranslation(lightCF, lightPos);
  mat4.fromTranslation(lightCF2, lightPos2);

  pointLight.draw(posAttr, colAttr, modelUnif, lightCF);
  pointLight.draw(posAttr, colAttr, modelUnif, lightCF2);
  gl.uniform3fv(lightPosUnif, [...lightPos, ...lightPos2]);

  gl.uniform3iv (isEnabledUnif, [showAmbient, showDiffuse, showSpecular]);

  // Enable lighting and disable manual coloring
  gl.uniform1i (useLightingUnif, true);
  gl.disableVertexAttribArray(colAttr);
  gl.enableVertexAttribArray(normalAttr);


  parkingLot.draw(posAttr, normalAttr, modelUnif, IDENTITY, lightingUnifs, posUnifs, viewMat);


  // Car defaults -- Move to car
  objTint = vec3.fromValues(0.9, 0.9, 0.9);
  gl.uniform3fv(objTintUnif, objTint);

  gl.uniform1f(shininessUnif, 60);
  gl.uniform1f(specCoeffUnif, 0.6);

  gl.uniformMatrix4fv(modelUnif, false, currentCar.coordFrame);
  currentCar.draw(posAttr, normalAttr, modelUnif, currentCar.temp, lightingUnifs, posUnifs, viewMat);
}

function render() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  gl.uniformMatrix4fv(projUnif, false, persProjMat);
  gl.uniformMatrix4fv(viewUnif, false, viewMat);

  gl.viewport(0, 0, canvas.width, canvas.height);
  drawScene();

  requestAnimationFrame(render);
}




function resizeHandler() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let perspectiveRatio = canvas.width / canvas.height;
  let perspectiveRad = Math.PI/5; // 60 degrees vertical field of view

  // Set perspective 3D view
  mat4.perspective(persProjMat,
    perspectiveRad,    // Angle to view at
    perspectiveRatio,  // Aspect Ratio
    1,                 // near plane at Z=1
    20);               // far plane at Z=20
}



// Keypress Functions

document.addEventListener("keydown", onkeydown);
document.addEventListener("keyup", onkeyup);


let keys = {
  w: 87, s: 83, j: 74, l: 76,
  i: 73, k: 75, a: 65, d: 68,
  left: 37, right: 39,
  up: 38, down: 40
}




let keyMap = {}
let keysAreRunning = false;
let startingSpeed = 0;
let currentSpeed = startingSpeed;
let maxSpeed = 0.3;
let speedIncrease = 0.001;




function reactToKeys() {
  if(Object.keys(keyMap).length === 0) { keysAreRunning = false; return; }
  keysAreRunning = true;

  let rotation = (Math.PI/10) * Math.abs(currentSpeed);

  let isMoving = keyMap[keys.w] || keyMap[keys.s];

  let isTurningLeft = keyMap[keys.a];
  let isTurningRight = keyMap[keys.d];

  let turnDirection = 0;
  if(isTurningLeft) {
    turnDirection = -1;
  } else if(isTurningRight) {
    turnDirection = 1;
  }

  currentCar.triggerAnimation(currentSpeed/3, turnDirection);

  if(keyMap[keys.w]) {
    let negXTranslate = mat4.create();
    let negXTranslateVec = vec3.fromValues(currentSpeed, 0, 0);
    mat4.translate(negXTranslate, negXTranslate, negXTranslateVec);


    currentCar.changeView((vec, focalPoint, cameraPos) => {
      let { x, y } = calcPointedXY(focalPoint, cameraPos, currentSpeed);

      vec[0] = vec[0] + x;
      vec[1] = vec[1] + y;
    });



    currentCar.modify(negXTranslate);
    if(Math.abs(currentSpeed) <= maxSpeed) {
      currentSpeed -= speedIncrease;
    }

  }

  if(keyMap[keys.s]) {
    let xTranslate = mat4.create();
    let xTranslateVec = vec3.fromValues(currentSpeed, 0, 0);
    mat4.translate(xTranslate, xTranslate, xTranslateVec);


    currentCar.changeView((vec, focalPoint, cameraPos) => {
      let { x, y } = calcPointedXY(focalPoint, cameraPos, currentSpeed);

      vec[0] = vec[0] + x;
      vec[1] = vec[1] + y;
    });

    currentCar.modify(xTranslate);
    if(Math.abs(currentSpeed) <= maxSpeed) {
      currentSpeed += speedIncrease;
    }

  }

  if(!isMoving) {
    currentSpeed = startingSpeed;
  }


  //l rotate z
  if(keyMap[keys.d]) {
    if(isMoving) {
      let zRotate = mat4.create();
      mat4.rotateZ(zRotate, zRotate, -rotation);

      currentCar.changeView((vec, origin) => {
        vec3.rotateZ(vec, vec, origin, -rotation)
      });

      currentCar.modify(zRotate);
    }

  }

  if(keyMap[keys.a]) {
    if(isMoving) {
      let negZRotate = mat4.create();
      mat4.rotateZ(negZRotate, negZRotate, rotation);


      currentCar.changeView((vec, origin) => {
        vec3.rotateZ(vec, vec, origin, rotation)
      });

      currentCar.modify(negZRotate);
    }

  }

  if(keyMap[keys.i]) {
    currentCar.changeCamera((vec) => {
      vec[2] += 0.05;
    });
  }

  if(keyMap[keys.k]) {
    currentCar.changeCamera((vec) => {
      vec[2] -= 0.05;
    });
  }

  if(keyMap[keys.j]) {
    let negXRotate = mat4.create();
    mat4.rotateX(negXRotate, negXRotate, -Math.PI / 90);

    currentCar.modify(negXRotate);
  }

  if(keyMap[keys.left]) {
    lightPos[0] = lightPos[0] + 0.1;
  }

  if(keyMap[keys.right]) {
    lightPos[0] = lightPos[0] - 0.1;
  }

  if(keyMap[keys.up]) {
    lightPos2[0] = lightPos2[0] + 0.1;
  }

  if(keyMap[keys.down]) {
    lightPos2[0] = lightPos2[0] - 0.1;
  }

  updateCameraView();

  setTimeout(reactToKeys, 20);
}


onkeydown = onkeyup = function(e){
  e = e || event; // to deal with IE
  keyMap[e.keyCode] = e.type == 'keydown';

  console.log(e.keyCode);
  if(!keysAreRunning) {
    reactToKeys();
  }

  if(e.keyCode === 32 && e.type === 'keyup') {
    toggleDragView();
  }
}



function updateCameraView() {
  if(currentView === views.followView) {
    mat4.lookAt(viewMat,
        currentCar.cameraPos, // eye
        currentCar.focalPoint, // focal point
        vec3.fromValues(0, 0, 1)); // up
  }
}

function calcPointedXY(focalPoint, cameraPos, distance) {
  let viewDistanceX = focalPoint[0] - cameraPos[0];
  let viewDistanceY = focalPoint[1] - cameraPos[1];

  let viewDistance = Math.sqrt(viewDistanceX*viewDistanceX + viewDistanceY*viewDistanceY);

  let xPointTranslate = (viewDistanceX / viewDistance) * -distance;
  let yPointTranslate = (viewDistanceY / viewDistance) * -distance;

  return { x: xPointTranslate, y: yPointTranslate };
}







// Draggable View Utilities

let viewRadius = 3;
let currentViewPosX = -0.5;
let currentViewPosY = 0;
let viewRangeMultiplier = 20;

function handleScroll(evt) {
  if(currentView === 1) { return; }

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
  if(currentView === 1) { return; }
  isDragging = true;
}

function handleMouseUp() {
  if(currentView === 1) { return; }
  isDragging = false;
}

function handleMouseMove(evt) {
  if(currentView === 1) { return; }
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

function toggleDragView() {
  currentView = currentView * -1;
}




