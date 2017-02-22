attribute vec3 vertexPos;
attribute vec3 vertexCol;

//uniform mat4 projection;
//uniform mat4 view;
uniform mat4 modelCF;

varying vec4 varColor;

void main() {
    gl_Position = modelCF * vec4(vertexPos, 1);
    gl_PointSize = 4.0;
    varColor = vec4 (vertexCol, 1.0);
}
