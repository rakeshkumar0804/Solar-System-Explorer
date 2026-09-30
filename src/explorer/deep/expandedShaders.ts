export const volumeFragment = /* glsl */ `
precision highp sampler3D;
varying vec2 vUv;
uniform vec3 uCamera;
uniform mat3 uCameraBasis;
uniform float uAspect;
uniform float uTanFov;
uniform float uTime;
uniform int uSteps;
uniform int uMode;
uniform sampler3D uNoise;

float n3(vec3 p) { return texture(uNoise, (p + 0.5) / 32.0).r; }
float cloudNoise(vec3 p) {
  return n3(p)*0.53 + n3(p*2.03+5.7)*0.27 + n3(p*4.11+11.3)*0.14 + n3(p*8.13+1.7)*0.06;
}
float gaussian(vec3 p, vec3 scale) { vec3 q=p/scale; return exp(-dot(q,q)); }
float hash21(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
vec3 background(vec3 ray) {
  vec2 uv=vec2(atan(ray.z,ray.x),asin(clamp(ray.y,-1.0,1.0)))*200.0;
  vec2 cell=floor(uv), local=fract(uv)-0.5;
  float star=smoothstep(0.986,1.0,hash21(cell))*exp(-dot(local,local)*180.0);
  return vec3(0.25,0.34,0.49)*star;
}

vec4 sampleCloud(vec3 p) {
  if (uMode == 2) {
    // The ion tail is straight along +X, away from the off-screen Sun.
    vec3 q=p-vec3(-4.1,0.0,0.0);
    float along=max(q.x,0.0);
    float start=smoothstep(-0.35,0.7,q.x), end=1.0-smoothstep(6.0,14.0,along);
    float ionWidth=0.08+along*0.030;
    float ion=exp(-dot(q.yz,q.yz)/(ionWidth*ionWidth))*start*end*2.1/(1.0+along*0.22);
    vec2 dustOffset=q.yz-vec2(-along*along*0.025,along*0.045);
    float dustWidth=0.15+along*0.105;
    float dust=exp(-dot(dustOffset,dustOffset)/(dustWidth*dustWidth))*start*end;
    dust *= (0.12+pow(cloudNoise(q*vec3(0.6,4.0,4.0)),1.7)*1.1) / (1.0+along*0.15);
    float coma=exp(-dot(q,q)*2.0)*0.65;
    vec3 emission=vec3(0.10,0.35,0.9)*ion + vec3(0.92,0.75,0.56)*dust*0.8 + vec3(0.22,0.72,0.57)*coma;
    return vec4(emission, (ion+dust+coma)*0.17);
  }
  if (uMode == 1) {
    vec3 q=p/vec3(6.8,5.0,4.7);
    float r=length(q);
    float turbulence=cloudNoise(p*0.92);
    float shell=exp(-pow((r-0.88+(turbulence-0.5)*0.36)*7.0,2.0));
    float filament=pow(1.0-abs(n3(p*3.4)-0.5)*2.0,7.0);
    float core=exp(-dot(q,q)*3.2)*(0.4+turbulence);
    vec3 emission=vec3(0.06,0.26,0.43)*core*0.17 + mix(vec3(0.85,0.15,0.08),vec3(1.0,0.45,0.17),filament)*shell*(0.018+filament*0.15);
    return vec4(emission,(shell*0.08+core*0.025));
  }
  vec3 warp=vec3(n3(p*0.4),n3(p*0.4+11.2),n3(p*0.4+23.7))-0.5;
  vec3 q=p+warp*1.3;
  float left=gaussian(q-vec3(-3.3,0.5,-0.3),vec3(4.5,3.3,2.4));
  float right=gaussian(q-vec3(3.4,-0.4,0.0),vec3(4.5,3.4,2.8));
  float lower=gaussian(q-vec3(0.0,-2.7,-0.4),vec3(5.0,1.7,2.2));
  float structure=max(max(left,right),lower);
  float noise=cloudNoise(q*1.15);
  float density=pow(smoothstep(0.34,0.67,noise),1.4)*structure*1.8;
  float cavity=gaussian(q-vec3(0.3,0.3,1.7),vec3(2.5,1.8,2.0));
  density *= 1.0-cavity*0.91;
  float darkLane=gaussian(q-vec3(1.0,1.55,1.9),vec3(4.0,0.7,1.3))*smoothstep(0.35,0.63,noise);
  float warm=smoothstep(1.4,7.8,length(q.xy));
  vec3 colour=mix(vec3(0.10,0.57,0.69),vec3(0.86,0.15,0.28),warm);
  colour=mix(colour,vec3(0.9,0.48,0.32),smoothstep(0.55,0.77,noise)*0.8);
  vec3 emission=colour*density*(0.14+cavity*0.65)*(1.0-darkLane*0.85);
  return vec4(emission,density*0.12+darkLane*0.65);
}

vec3 pointLightGlow(vec3 origin, vec3 direction, vec3 location, vec3 tint) {
  vec3 offset=location-origin;
  float along=dot(offset,direction);
  float d2=dot(offset,offset)-along*along;
  if(along<0.0) return vec3(0.0);
  return tint*(exp(-max(d2,0.0)*190.0)*2.6+exp(-max(d2,0.0)*4.0)*0.15);
}

void main() {
  vec2 screen=(vUv*2.0-1.0)*vec2(uAspect,1.0);
  vec3 direction=normalize(uCameraBasis*vec3(screen*uTanFov,-1.0));
  // Tight model-specific bounds concentrate samples inside the visible gas.
  vec3 bounds=uMode==2 ? vec3(14.0,8.0,4.0) : uMode==1 ? vec3(8.5,6.5,6.5) : vec3(12.0,7.5,6.0);
  vec3 rayOrigin=uCamera/bounds, rayDirection=direction/bounds;
  float a=dot(rayDirection,rayDirection), b=dot(rayOrigin,rayDirection), c=dot(rayOrigin,rayOrigin)-1.0;
  float discriminant=b*b-a*c;
  vec3 colour=vec3(0.0);
  float transmission=1.0;
  if(discriminant>0.0) {
    float entry=max(0.0,(-b-sqrt(discriminant))/a);
    float exitPoint=(-b+sqrt(discriminant))/a;
    if(exitPoint>entry) {
      float stepSize=(exitPoint-entry)/float(uSteps);
      // Stable spatial jitter avoids visible slices without temporal shimmer.
      float jitter=hash21(gl_FragCoord.xy);
      for(int i=0;i<88;i++) {
        if(i>=uSteps || transmission<0.02) break;
        vec3 p=uCamera+direction*(entry+(float(i)+jitter)*stepSize);
        vec4 sampleValue=sampleCloud(p);
        float absorb=exp(-sampleValue.a*stepSize);
        colour+=transmission*sampleValue.rgb*stepSize;
        transmission*=absorb;
      }
    }
  }
  colour+=background(direction)*transmission;
  if(uMode==0) {
    colour+=pointLightGlow(uCamera,direction,vec3(-0.28,0.15,2.1),vec3(0.73,0.88,1.0));
    colour+=pointLightGlow(uCamera,direction,vec3(0.2,-0.1,2.3),vec3(0.73,0.88,1.0));
    colour+=pointLightGlow(uCamera,direction,vec3(0.12,0.49,2.0),vec3(0.73,0.88,1.0));
    colour+=pointLightGlow(uCamera,direction,vec3(-0.56,0.55,2.3),vec3(0.73,0.88,1.0));
  }
  if(uMode==1) colour+=pointLightGlow(uCamera,direction,vec3(0.0),vec3(0.35,0.73,1.0))*0.75;
  gl_FragColor=vec4(colour,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb=max(gl_FragColor.rgb,vec3(2.0,4.0,7.0)/255.0);
}`;

export const surfaceVertex = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vUv;
void main() {
  vUv=uv; vPosition=position;
  vec4 view=modelViewMatrix*vec4(position,1.0);
  vNormal=normalize(normalMatrix*normal); vView=-view.xyz;
  gl_Position=projectionMatrix*view;
}`;

export const beamFragment = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vUv;
uniform float uTime;
void main() {
  float along=vUv.y;
  float edges=pow(abs(dot(normalize(vNormal),normalize(vView))),1.6);
  float envelope=pow(1.0-along,1.25)*smoothstep(0.0,0.08,along);
  float threads=0.8+0.2*sin(vUv.x*100.0+along*4.0);
  vec3 colour=mix(vec3(0.48,0.83,1.0),vec3(0.10,0.44,0.85),along);
  gl_FragColor=vec4(colour*1.3,edges*envelope*threads*0.65);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const glowFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColour;
void main() {
  float d=length(vUv-0.5)*2.0;
  float light=exp(-d*d*14.0)*(1.0-smoothstep(0.7,1.0,d));
  gl_FragColor=vec4(uColour,light*0.5);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const stellarSurfaceFragment = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 uColour;
void main() {
  float mu=max(dot(normalize(vNormal),normalize(vView)),0.0);
  float granulation=0.95+0.05*sin(vPosition.x*119.0)*sin(vPosition.y*131.0)*sin(vPosition.z*107.0);
  vec3 colour=uColour*(0.24+2.5*pow(mu,0.42))*granulation;
  gl_FragColor=vec4(colour,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const rockFragment = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vUv;
uniform vec3 uColour;
uniform vec3 uLight;
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise3(vec3 p){
 vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main(){
 vec3 n=normalize(vNormal); float lighting=max(dot(n,normalize(uLight)),0.0);
 float terrain=noise3(vPosition*12.0)*0.54+noise3(vPosition*31.0)*0.29+noise3(vPosition*79.0)*0.17;
 float rough=0.28+terrain*0.95;
 vec3 colour=uColour*rough*(0.055+lighting*1.4);
 gl_FragColor=vec4(colour,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export const bridgeFragment = /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vUv;
void main(){
 vec2 grid=vUv*vec2(40.0,26.0);
 vec2 dist=abs(fract(grid-0.5)-0.5)/max(fwidth(grid),vec2(0.001));
 float line=1.0-min(min(dist.x,dist.y),1.0);
 float facing=abs(dot(normalize(vNormal),normalize(vView)));
 float rim=pow(1.0-facing,2.0);
 float edge=1.0-smoothstep(0.44,0.5,abs(vUv.y-0.5));
 vec3 colour=mix(vec3(0.50,0.28,0.76),vec3(0.12,0.54,0.77),smoothstep(0.1,0.9,vUv.y));
 gl_FragColor=vec4(colour*(0.2+line*1.5+rim*0.3),edge*(0.13+line*0.58+rim*0.18));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export const andromedaDustFragment = /* glsl */ `
varying vec2 vUv;
float dustHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float dustNoise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(dustHash(i),dustHash(i+vec2(1,0)),f.x),mix(dustHash(i+vec2(0,1)),dustHash(i+vec2(1,1)),f.x),f.y);
}
void main(){
 vec2 p=(vUv-0.5)*24.0; p.y=-p.y; float r=length(p), a=atan(p.y,p.x);
 float ring=sin(r*3.4+sin(a*2.0+r*0.5)*0.65+(dustNoise(p*2.0)-0.5)*0.9);
 float dust=mix(1.0,0.29,smoothstep(0.18,0.85,ring)*smoothstep(1.6,3.5,r));
 float disk=exp(-r*0.30)*(1.0-smoothstep(9.3,11.7,r));
 float core=exp(-r*r/1.8);
 vec3 colour=vec3(0.81,0.53,0.27)*disk*dust*0.82*(0.7+dustNoise(p*1.8)*0.3)+vec3(1.0,0.71,0.42)*core*0.55;
 gl_FragColor=vec4(colour,min(0.8,disk*0.78+core*0.4));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
