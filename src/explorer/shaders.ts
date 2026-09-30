export const planetVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const earthFragment = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uOcean;
  uniform sampler2D uNormal;
  uniform sampler2D uClouds;
  uniform vec3 uSun;
  uniform float uCloudOffset;
  uniform float uCloudsEnabled;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 q1 = dFdx(vWorldPosition);
    vec3 q2 = dFdy(vWorldPosition);
    vec2 st1 = dFdx(vUv);
    vec2 st2 = dFdy(vUv);
    vec3 tangent = q1 * st2.y - q2 * st1.y;
    if (dot(tangent, tangent) > 0.0000001) {
      tangent = normalize(tangent);
      vec3 bitangent = normalize(-q1 * st2.x + q2 * st1.x);
      vec3 bump = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
      bump.xy *= 0.24;
      n = normalize(mat3(tangent, bitangent, n) * normalize(bump));
    }
    vec3 sun = normalize(uSun);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float daylight = dot(n, sun);
    float diffuse = max(daylight, 0.0);
    vec3 albedo = texture2D(uDay, vUv).rgb;
    float shadow = texture2D(uClouds, vec2(vUv.x + uCloudOffset + 0.0016, vUv.y)).r;
    albedo *= 1.0 - shadow * 0.18 * uCloudsEnabled;
    albedo = mix(vec3(dot(albedo, vec3(0.2126, 0.7152, 0.0722))), albedo, 0.91);
    vec3 colour = albedo * (0.018 + diffuse * 1.5);
    float night = 1.0 - smoothstep(-0.16, 0.13, daylight);
    vec3 lights = texture2D(uNight, vUv).rgb;
    colour += lights * night * 1.25;
    float ocean = texture2D(uOcean, vUv).r;
    float specular = pow(max(dot(n, normalize(sun + viewDirection)), 0.0), 70.0);
    colour += vec3(0.72, 0.80, 0.87) * specular * ocean * diffuse * 0.48;
    float rim = pow(1.0 - max(dot(n, viewDirection), 0.0), 3.8);
    colour += vec3(0.06, 0.18, 0.35) * rim * smoothstep(-0.2, 0.45, daylight) * 0.38;
    gl_FragColor = vec4(colour, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const cloudFragment = /* glsl */ `
  uniform sampler2D uClouds;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  void main() {
    float density = texture2D(uClouds, vUv).r;
    float daylight = max(dot(normalize(vWorldNormal), normalize(uSun)), 0.0);
    gl_FragColor = vec4(vec3(0.94, 0.96, 1.0) * (0.045 + daylight * 1.8), pow(density, 1.1) * 0.86);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const atmosphereFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uColour;
  uniform float uStrength;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 direction = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - max(dot(n, direction), 0.0), 4.5);
    float sunlight = smoothstep(-0.2, 0.65, dot(n, normalize(uSun)));
    gl_FragColor = vec4(uColour * 1.3, rim * sunlight * uStrength);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const ringVertex = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSunLocal;
  uniform float uInner;
  uniform float uOuter;
  varying vec3 vLocal;
  void main() {
    float radius = length(vLocal.xy);
    float uvRadius = clamp((radius - uInner) / (uOuter - uInner), 0.0, 1.0);
    vec4 colour = texture2D(uMap, vec2(uvRadius, 0.5));
    vec3 sun = normalize(uSunLocal);
    // Ray/sphere intersection: the planet casts a real geometric shadow on its rings.
    float alongRay = dot(vLocal, sun);
    float discriminant = alongRay * alongRay - (dot(vLocal, vLocal) - 1.0);
    float shadow = 1.0;
    if (discriminant > 0.0 && -alongRay - sqrt(discriminant) > 0.0) shadow = 0.14;
    gl_FragColor = vec4(colour.rgb * (0.38 + abs(sun.z) * 1.25) * shadow, colour.a * 0.92);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const saturnVertex = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vSurface;
  varying vec3 vSunLocal;
  ${planetVertex.replace('vUv = uv;', 'vUv = uv; vSurface = position; vSunLocal = normalize(inverse(mat3(modelMatrix)) * uSun);')}
`;

export const saturnFragment = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uRings;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vSurface;
  varying vec3 vSunLocal;
  void main() {
    vec3 sun = normalize(vSunLocal);
    float transmission = 1.0;
    // Trace toward the light and intersect the equatorial ring plane.
    if (abs(sun.y) > 0.0001) {
      float distanceToPlane = -vSurface.y / sun.y;
      if (distanceToPlane > 0.0) {
        vec3 intersection = vSurface + sun * distanceToPlane;
        float radius = length(intersection.xz);
        if (radius > 1.22 && radius < 2.32) {
          float opacity = texture2D(uRings, vec2((radius - 1.22) / 1.1, 0.5)).a;
          transmission = 1.0 - opacity * 0.86;
        }
      }
    }
    float diffuse = max(dot(normalize(vWorldNormal), normalize(uSun)), 0.0);
    vec3 colour = texture2D(uDay, vUv).rgb * (0.018 + diffuse * transmission * 1.5);
    gl_FragColor = vec4(colour, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
