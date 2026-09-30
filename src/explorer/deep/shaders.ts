export const starVertex = /* glsl */ `
attribute float aSize;
attribute float aLuminosity;
attribute vec3 aColour;
uniform float uScale;
varying vec3 vColour;
varying float vLuminosity;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aSize * uScale / max(0.1, -mv.z), 1.25, 30.0);
  vColour = aColour;
  vLuminosity = aLuminosity;
}`;
export const starFragment = /* glsl */ `
varying vec3 vColour;
varying float vLuminosity;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r2 = dot(p, p);
  if (r2 > 0.25) discard;
  float alpha = exp(-r2 * 38.0) * 0.86 + exp(-r2 * 10.0) * 0.09;
  gl_FragColor = vec4(vColour * vLuminosity, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export const planeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const noise = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float valueNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) { return valueNoise(p)*0.53 + valueNoise(p*2.07)*0.27 + valueNoise(p*4.17)*0.13 + valueNoise(p*8.31)*0.07; }
`;
export const galaxyDustFragment = /* glsl */ `
varying vec2 vUv;
${noise}
void main() {
  vec2 p = (vUv - 0.5) * 23.0;
  p.y = -p.y; // PlaneGeometry rotated into XZ: texture V runs opposite world Z.
  float r = length(p);
  float angle = atan(p.y, p.x);
  float curve = angle - log(r+0.8) * 2.65;
  float arms = pow(0.5 + 0.5*cos(curve*4.0), 5.0);
  float cloud = fbm(p*2.4);
  float grain = fbm(p*9.0);
  float fade = 1.0-smoothstep(7.0,11.0,r);
  float central = exp(-dot(p / vec2(2.1,1.05), p / vec2(2.1,1.05)));
  float armLight = arms * (0.15 + cloud*0.85) * smoothstep(0.7,2.2,r) * fade;
  vec3 colour = vec3(0.30,0.45,0.66) * armLight * 0.70;
  colour += vec3(0.91,0.70,0.43) * central * 0.65;
  colour *= mix(0.28,1.0,smoothstep(0.25,0.7,grain));
  gl_FragColor = vec4(colour, min(0.65, central*0.55 + armLight*0.65));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// Screen-covering mesh; rays use the actual orbit-controlled camera orientation.
export const blackHoleVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const blackHoleFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 uCamera;
uniform mat3 uCameraBasis;
uniform float uAspect;
uniform float uTanFov;
uniform float uTime;
uniform int uSteps;
${noise}
vec3 diskEmission(vec3 p, vec3 direction) {
  float r = length(p.xz);
  float angle = atan(p.z,p.x);
  float drift = uTime * 0.22 / sqrt(max(r,1.0));
  float fine = fbm(vec2(r*5.5, (angle-drift)*7.0));
  float rings = 0.58 + 0.22*sin(r*29.0 + fine*8.0) + 0.20*fine;
  float envelope = smoothstep(2.65,3.25,r) * (1.0-smoothstep(6.3,9.0,r));
  float temperature = pow(3.0/max(r,3.0), 0.75);
  vec3 heat = mix(vec3(0.68,0.13,0.025),vec3(1.0,0.79,0.43),temperature);
  vec3 tangent = normalize(vec3(-p.z,0.0,p.x));
  float beaming = clamp(1.0 + dot(-direction,tangent) * 0.65, 0.32,1.7);
  return heat * rings * envelope * beaming * (2.6 + 3.1*temperature);
}
void main() {
  vec2 screen = (vUv*2.0-1.0) * vec2(uAspect,1.0);
  vec3 direction = normalize(uCameraBasis * vec3(screen*uTanFov,-1.0));
  vec3 p = uCamera;
  float h2 = dot(cross(p,direction),cross(p,direction));
  vec3 colour = vec3(0.0);
  float throughput = 1.0;
  bool captured = false;
  // Qualitative light deflection in horizon-radius units; bounded numerical model.
  for (int i=0;i<112;i++) {
    if (i >= uSteps) break;
    float r = length(p);
    if (r < 1.02) { captured = true; break; }
    if (r > 55.0) break;
    float stepSize = clamp(r*0.13, 0.10, 2.6);
    vec3 previous = p;
    vec3 acceleration = -1.5 * h2 * p / pow(r,5.0);
    direction += acceleration*stepSize;
    p += direction*stepSize;
    if (previous.y*p.y < 0.0) {
      vec3 crossing = mix(previous,p,abs(previous.y)/(abs(previous.y)+abs(p.y)));
      float radius = length(crossing.xz);
      if (radius>2.65 && radius<9.0) {
        colour += diskEmission(crossing,normalize(direction)) * throughput;
        throughput *= 0.2;
      }
    }
    if (throughput < 0.02) break;
  }
  if (!captured) {
    vec3 ray = normalize(direction);
    vec2 sky = vec2(atan(ray.z,ray.x),asin(clamp(ray.y,-1.0,1.0))) * vec2(160.0,160.0);
    vec2 cell=floor(sky), local=fract(sky)-0.5;
    float light = smoothstep(0.986,1.0,hash(cell)) * exp(-dot(local,local)*140.0);
    colour += vec3(0.48,0.59,0.72) * light * throughput * 0.6;
  }
  gl_FragColor = vec4(colour,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = max(gl_FragColor.rgb, vec3(2.0,4.0,7.0)/255.0);
}`;
