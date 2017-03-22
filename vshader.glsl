attribute vec3 vertexPos;
attribute vec3 vertexCol;
attribute vec3 vertexNormal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 modelCF;
uniform mat3 normalMat;

uniform vec3 lightPosWorld[2];

uniform float diffuseCoeff;
uniform float ambientCoeff;
uniform float specularCoeff;
uniform float shininess;
uniform vec3 objectTint;
uniform bool useLighting;
uniform bvec3 isEnabled;

varying vec4 varColor;

void main() {

  gl_PointSize = 4.0;

  // Calculate vertex and light position in relation to eye and camera CF
  vec4 vertexPosInEye = view * modelCF * vec4(vertexPos, 1);
  gl_Position = projection * vertexPosInEye;

  if (useLighting) {

    /*int lightCount = 2;*/

    vec3 color = vec3(0,0,0);
    for(int i = 0; i < 2; i++) {
      vec4 lightPosInEye = view * vec4(lightPosWorld[i], 1);

      // Calculate light with relation to model CF
      vec3 lightVecInEye = normalize(vec3(lightPosInEye - vertexPosInEye));
      vec3 normalInEye = normalize(normalMat * vertexNormal);

      // Ambient Light
      if (isEnabled[0]) {
        color += ambientCoeff * objectTint;
      }

      // Diffuse Light
      if (isEnabled[1]) {
        float diffuse = clamp(dot(lightVecInEye, normalInEye), 0.0, 1.0);
        color += diffuse * diffuseCoeff * objectTint;
      }

      // Specular Light
      if (isEnabled[2]) {
        vec3 viewVec = normalize(-vertexPosInEye.xyz); // Viewer is now at (0,0,0)
        vec3 reflectVec = reflect(-lightVecInEye, normalInEye);
        float specular = clamp(dot(viewVec, reflectVec), 0.0, 1.0);
        color += pow(specular, shininess) * specularCoeff * vec3(1,1,1);
      }
    }

    varColor = vec4 (color, 1);
  } else {
    varColor = vec4 (vertexCol, 1);
  }
}
