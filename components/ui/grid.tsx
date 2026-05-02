'use client';

import * as faceapi from 'face-api.js';
import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from 'postprocessing';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GridScanProps = {
  enableWebcam?: boolean;
  showPreview?: boolean;
  modelsPath?: string;
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineJitter?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  scanColor?: string;
  scanOpacity?: number;
  scanDirection?: 'forward' | 'backward' | 'pingpong';
  scanSoftness?: number;
  scanGlow?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  enableGyro?: boolean;
  scanOnClick?: boolean;
  snapBackDelay?: number;
  className?: string;
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// GLSL
// ---------------------------------------------------------------------------

const vert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;
uniform vec3  iResolution;
uniform float iTime;
uniform vec2  uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3  uLinesColor;
uniform vec3  uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uScanStarts[8];
uniform float uScanCount;
varying vec2 vUv;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x){
  float t = clamp((x-a)/max(1e-5,b-a),0.0,1.0);
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 p=(2.0*fragCoord-iResolution.xy)/iResolution.y;
  vec3 ro=vec3(0.0);
  vec3 rd=normalize(vec3(p,2.0));

  float cR=cos(uTilt),sR=sin(uTilt);
  rd.xy=mat2(cR,-sR,sR,cR)*rd.xy;
  float cY=cos(uYaw),sY=sin(uYaw);
  rd.xz=mat2(cY,-sY,sY,cY)*rd.xz;

  vec2 skew=clamp(uSkew,vec2(-0.7),vec2(0.7));
  rd.xy+=skew*rd.z;

  vec3  color=vec3(0.0);
  float minT=1e20;
  float gridScale=max(1e-5,uGridScale);
  float fadeStrength=2.0;
  vec2  gridUV=vec2(0.0);
  float hitIsY=1.0;

  for(int i=0;i<4;i++){
    float isY=float(i<2);
    float pos=mix(-0.2,0.2,float(i))*isY+mix(-0.5,0.5,float(i-2))*(1.0-isY);
    float num=pos-(isY*ro.y+(1.0-isY)*ro.x);
    float den=isY*rd.y+(1.0-isY)*rd.x;
    float t=num/den;
    vec3 h=ro+rd*t;
    float depthBoost=smoothstep(0.0,3.0,h.z);
    h.xy+=skew*0.15*depthBoost;
    bool use=t>0.0&&t<minT;
    gridUV=use?mix(h.zy,h.xz,isY)/gridScale:gridUV;
    minT=use?t:minT;
    hitIsY=use?isY:hitIsY;
  }

  vec3  hit=ro+rd*minT;
  float dist=length(hit-ro);
  float jitterAmt=clamp(uLineJitter,0.0,1.0);
  if(jitterAmt>0.0){
    vec2 j=vec2(sin(gridUV.y*2.7+iTime*1.8),cos(gridUV.x*2.3-iTime*1.6))*(0.15*jitterAmt);
    gridUV+=j;
  }

  float fx=fract(gridUV.x),fy=fract(gridUV.y);
  float ax=min(fx,1.0-fx),ay=min(fy,1.0-fy);
  float wx=fwidth(gridUV.x),wy=fwidth(gridUV.y);
  float halfPx=max(0.0,uLineThickness)*0.5;
  float tx=halfPx*wx,ty=halfPx*wy;
  float lineX=1.0-smoothstep(tx,tx+wx,ax);
  float lineY=1.0-smoothstep(ty,ty+wy,ay);

  if(uLineStyle>0.5){
    float vy=fract(gridUV.y*4.0),vx=fract(gridUV.x*4.0);
    if(uLineStyle<1.5){lineX*=step(vy,0.5);lineY*=step(vx,0.5);}
    else{
      float cy=abs(fract(gridUV.y*6.0)-0.5),cx=abs(fract(gridUV.x*6.0)-0.5);
      lineX*=1.0-smoothstep(0.18,0.18+fwidth(gridUV.y*6.0),cy);
      lineY*=1.0-smoothstep(0.18,0.18+fwidth(gridUV.x*6.0),cx);
    }
  }
  float primaryMask=max(lineX,lineY);

  vec2  gridUV2=(hitIsY>0.5?hit.xz:hit.zy)/gridScale;
  if(jitterAmt>0.0){
    vec2 j2=vec2(cos(gridUV2.y*2.1-iTime*1.4),sin(gridUV2.x*2.5+iTime*1.7))*(0.15*jitterAmt);
    gridUV2+=j2;
  }
  float fx2=fract(gridUV2.x),fy2=fract(gridUV2.y);
  float ax2=min(fx2,1.0-fx2),ay2=min(fy2,1.0-fy2);
  float wx2=fwidth(gridUV2.x),wy2=fwidth(gridUV2.y);
  float tx2=halfPx*wx2,ty2=halfPx*wy2;
  float lX2=1.0-smoothstep(tx2,tx2+wx2,ax2);
  float lY2=1.0-smoothstep(ty2,ty2+wy2,ay2);
  if(uLineStyle>0.5){
    float vy2=fract(gridUV2.y*4.0),vx2=fract(gridUV2.x*4.0);
    if(uLineStyle<1.5){lX2*=step(vy2,0.5);lY2*=step(vx2,0.5);}
    else{
      float cy2=abs(fract(gridUV2.y*6.0)-0.5),cx2=abs(fract(gridUV2.x*6.0)-0.5);
      lX2*=1.0-smoothstep(0.18,0.18+fwidth(gridUV2.y*6.0),cy2);
      lY2*=1.0-smoothstep(0.18,0.18+fwidth(gridUV2.x*6.0),cx2);
    }
  }
  float altMask=max(lX2,lY2);
  float edgeDistX=min(abs(hit.x-(-0.5)),abs(hit.x-0.5));
  float edgeDistY=min(abs(hit.y-(-0.2)),abs(hit.y-0.2));
  altMask*=1.0-smoothstep(gridScale*0.5,gridScale*2.0,mix(edgeDistY,edgeDistX,hitIsY));

  float lineMask=max(primaryMask,altMask);
  float fade=exp(-dist*fadeStrength);

  float dur=max(0.05,uScanDuration);
  float del=max(0.0,uScanDelay);
  float scanZMax=2.0;
  float sigma=max(0.001,0.18*max(0.1,uScanGlow)*uScanSoftness);
  float sigmaA=sigma*2.0;
  float taper=clamp(uPhaseTaper,0.0,0.49);
  float combinedPulse=0.0,combinedAura=0.0;

  {
    float tCycle=mod(iTime,dur+del);
    float phase=clamp((tCycle-del)/dur,0.0,1.0);
    if(uScanDirection>0.5&&uScanDirection<1.5)phase=1.0-phase;
    else if(uScanDirection>1.5){float t2=mod(max(0.0,iTime-del),2.0*dur);phase=t2<dur?t2/dur:1.0-(t2-dur)/dur;}
    float scanZ=phase*scanZMax;
    float dz=abs(hit.z-scanZ);
    float lb=exp(-0.5*(dz*dz)/(sigma*sigma));
    float pw=smoother01(0.0,taper,phase)*(1.0-smoother01(1.0-taper,1.0,phase));
    combinedPulse+=lb*pw*clamp(uScanOpacity,0.0,1.0);
    combinedAura+=(exp(-0.5*(dz*dz)/(sigmaA*sigmaA))*0.25)*pw*clamp(uScanOpacity,0.0,1.0);
  }

  for(int i=0;i<MAX_SCANS;i++){
    if(float(i)>=uScanCount)break;
    float tA=iTime-uScanStarts[i];
    float ph=clamp(tA/dur,0.0,1.0);
    if(uScanDirection>0.5&&uScanDirection<1.5)ph=1.0-ph;
    else if(uScanDirection>1.5)ph=ph<0.5?ph*2.0:1.0-(ph-0.5)*2.0;
    float scanZ=ph*scanZMax;
    float dz=abs(hit.z-scanZ);
    float lb=exp(-0.5*(dz*dz)/(sigma*sigma));
    float pw=smoother01(0.0,taper,ph)*(1.0-smoother01(1.0-taper,1.0,ph));
    combinedPulse+=lb*pw*clamp(uScanOpacity,0.0,1.0);
    combinedAura+=(exp(-0.5*(dz*dz)/(sigmaA*sigmaA))*0.25)*pw*clamp(uScanOpacity,0.0,1.0);
  }

  color=uLinesColor*lineMask*fade+uScanColor*combinedPulse+uScanColor*combinedAura;
  float n=fract(sin(dot(gl_FragCoord.xy+vec2(iTime*123.4),vec2(12.9898,78.233)))*43758.5453123);
  color=clamp(color+(n-0.5)*uNoise,0.0,1.0);

  float alpha=clamp(max(lineMask,combinedPulse),0.0,1.0);
  float gx=1.0-smoothstep(tx*2.0,tx*2.0+wx*2.0,ax);
  float gy=1.0-smoothstep(ty*2.0,ty*2.0+wy*2.0,ay);
  alpha=max(alpha,max(gx,gy)*fade*clamp(uBloomOpacity,0.0,1.0));
  fragColor=vec4(color,alpha);
}

void main(){
  vec4 c;
  mainImage(c,vUv*iResolution.xy);
  gl_FragColor=c;
}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function srgbColor(hex: string) {
  return new THREE.Color(hex).convertSRGBToLinear();
}

function smoothDampFloat(
  current: number, target: number,
  velRef: { v: number },
  smoothTime: number, maxSpeed: number, dt: number,
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48*x*x + 0.235*x*x*x);
  let change = current - target;
  const maxChange = maxSpeed * smoothTime;
  change = Math.max(-maxChange, Math.min(maxChange, change));
  const orig = target;
  target = current - change;
  const temp = (velRef.v + omega*change)*dt;
  velRef.v = (velRef.v - omega*temp)*exp;
  let out = target + (change+temp)*exp;
  if ((orig - current)*(out - orig) > 0) { out = orig; velRef.v = 0; }
  return out;
}

function smoothDampVec2(
  current: THREE.Vector2, target: THREE.Vector2,
  vel: THREE.Vector2,
  smoothTime: number, maxSpeed: number, dt: number,
  out: THREE.Vector2,
) {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48*x*x + 0.235*x*x*x);
  const cx = current.x - target.x, cy = current.y - target.y;
  const len = Math.sqrt(cx*cx + cy*cy);
  const maxChange = maxSpeed * smoothTime;
  const sc = len > maxChange && len > 0 ? maxChange/len : 1;
  const chx = cx*sc, chy = cy*sc;
  const tx = current.x - chx, ty = current.y - chy;
  const tempX = (vel.x + omega*chx)*dt, tempY = (vel.y + omega*chy)*dt;
  vel.x = (vel.x - omega*tempX)*exp;
  vel.y = (vel.y - omega*tempY)*exp;
  out.x = tx + (chx+tempX)*exp;
  out.y = ty + (chy+tempY)*exp;
  if ((target.x-current.x)*(out.x-target.x)+(target.y-current.y)*(out.y-target.y)>0) {
    out.x=target.x; out.y=target.y; vel.x=0; vel.y=0;
  }
}

function medianPush(buf: number[], v: number, max: number) {
  buf.push(v); if (buf.length > max) buf.shift();
}
function median(buf: number[]) {
  if (!buf.length) return 0;
  const a = [...buf].sort((x,y)=>x-y), m = Math.floor(a.length/2);
  return a.length%2 ? a[m] : (a[m-1]+a[m])*0.5;
}
function centroid(pts:{x:number;y:number}[]) {
  let x=0,y=0; for(const p of pts){x+=p.x;y+=p.y;}
  return {x:x/(pts.length||1),y:y/(pts.length||1)};
}
function dist2(a:{x:number;y:number},b:{x:number;y:number}) {
  return Math.hypot(a.x-b.x,a.y-b.y);
}
function lineStyleVal(s:'solid'|'dashed'|'dotted') { return s==='dashed'?1:s==='dotted'?2:0; }
function scanDirVal(d:'forward'|'backward'|'pingpong') { return d==='backward'?1:d==='pingpong'?2:0; }

// ---------------------------------------------------------------------------
// Component — named export so Hero can import { GridScan }
// ---------------------------------------------------------------------------

const MAX_SCANS = 8;
const MAX_SPEED = 10;

export function GridScan({
  enableWebcam    = false,
  showPreview     = false,
  modelsPath      = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights',
  sensitivity     = 0.55,
  lineThickness   = 1,
  linesColor      = '#2F293A',
  scanColor       = '#FF9FFC',
  scanOpacity     = 0.4,
  gridScale       = 0.1,
  lineStyle       = 'solid',
  lineJitter      = 0.1,
  scanDirection   = 'pingpong',
  enablePost      = true,
  bloomIntensity  = 0,
  bloomThreshold  = 0,
  bloomSmoothing  = 0,
  chromaticAberration = 0.002,
  noiseIntensity  = 0.01,
  scanGlow        = 0.5,
  scanSoftness    = 2,
  scanPhaseTaper  = 0.9,
  scanDuration    = 2.0,
  scanDelay       = 2.0,
  enableGyro      = false,
  scanOnClick     = false,
  snapBackDelay   = 250,
  className,
  style,
}: GridScanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomRef    = useRef<BloomEffect | null>(null);
  const chromaRef   = useRef<ChromaticAberrationEffect | null>(null);
  const rafRef      = useRef<number | null>(null);

  const [modelsReady, setModelsReady]   = useState(false);
  const [uiFaceActive, setUiFaceActive] = useState(false);

  const lookTarget  = useRef(new THREE.Vector2(0,0));
  const tiltTarget  = useRef(0);
  const yawTarget   = useRef(0);
  const lookCurrent = useRef(new THREE.Vector2(0,0));
  const lookVel     = useRef(new THREE.Vector2(0,0));
  const lookOut     = useRef(new THREE.Vector2(0,0));
  const tiltVel     = useRef({v:0});
  const yawVel      = useRef({v:0});
  const tiltCurrent = useRef(0);
  const yawCurrent  = useRef(0);
  const scanStartsRef = useRef<number[]>([]);

  const s             = THREE.MathUtils.clamp(sensitivity,0,1);
  const skewScale     = THREE.MathUtils.lerp(0.06,0.20,s);
  const tiltScale     = THREE.MathUtils.lerp(0.12,0.30,s);
  const yawScale      = THREE.MathUtils.lerp(0.10,0.28,s);
  const depthResponse = THREE.MathUtils.lerp(0.25,0.45,s);
  const smoothTime    = THREE.MathUtils.lerp(0.45,0.12,s);
  const yBoost        = THREE.MathUtils.lerp(1.2,1.6,s);

  const bufX=useRef<number[]>([]),bufY=useRef<number[]>([]),bufT=useRef<number[]>([]),bufYaw=useRef<number[]>([]);

  const pushScan = (t:number) => {
    const arr=[...scanStartsRef.current];
    if(arr.length>=MAX_SCANS) arr.shift();
    arr.push(t);
    scanStartsRef.current=arr;
    const m=materialRef.current;
    if(!m) return;
    const buf=new Array<number>(MAX_SCANS).fill(0);
    arr.forEach((v,i)=>{ if(i<MAX_SCANS) buf[i]=v; });
    m.uniforms.uScanStarts.value=buf;
    m.uniforms.uScanCount.value=arr.length;
  };

  // Mouse
  useEffect(()=>{
    const el=containerRef.current; if(!el) return;
    let leaveTimer:ReturnType<typeof setTimeout>|null=null;
    const onMove=(e:MouseEvent)=>{
      if(uiFaceActive) return;
      if(leaveTimer){clearTimeout(leaveTimer);leaveTimer=null;}
      const r=el.getBoundingClientRect();
      lookTarget.current.set(
        ((e.clientX-r.left)/r.width)*2-1,
        -(((e.clientY-r.top)/r.height)*2-1),
      );
    };
    const onClick=async()=>{
      if(scanOnClick) pushScan(performance.now()/1000);
      if(enableGyro&&typeof DeviceOrientationEvent!=='undefined'&&typeof(DeviceOrientationEvent as any).requestPermission==='function'){
        try{await(DeviceOrientationEvent as any).requestPermission();}catch{}
      }
    };
    const onLeave=()=>{
      if(uiFaceActive) return;
      if(leaveTimer) clearTimeout(leaveTimer);
      leaveTimer=setTimeout(()=>{
        lookTarget.current.set(0,0); tiltTarget.current=0; yawTarget.current=0;
      },Math.max(0,snapBackDelay??0));
    };
    el.addEventListener('mousemove',onMove);
    el.addEventListener('mouseleave',onLeave);
    if(scanOnClick) el.addEventListener('click',onClick);
    return()=>{
      el.removeEventListener('mousemove',onMove);
      el.removeEventListener('mouseleave',onLeave);
      if(scanOnClick) el.removeEventListener('click',onClick);
      if(leaveTimer) clearTimeout(leaveTimer);
    };
  },[uiFaceActive,snapBackDelay,scanOnClick,enableGyro]);

  // Three.js setup
  useEffect(()=>{
    const container=containerRef.current; if(!container) return;
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    rendererRef.current=renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio??1,2));
    renderer.setSize(container.clientWidth,container.clientHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.NoToneMapping;
    renderer.autoClear=false;
    renderer.setClearColor(0x000000,0);
    container.appendChild(renderer.domElement);

    const uniforms:Record<string,THREE.IUniform>={
      iResolution:   {value:new THREE.Vector3(container.clientWidth,container.clientHeight,renderer.getPixelRatio())},
      iTime:         {value:0},
      uSkew:         {value:new THREE.Vector2(0,0)},
      uTilt:         {value:0},
      uYaw:          {value:0},
      uLineThickness:{value:lineThickness},
      uLinesColor:   {value:srgbColor(linesColor)},
      uScanColor:    {value:srgbColor(scanColor)},
      uGridScale:    {value:gridScale},
      uLineStyle:    {value:lineStyleVal(lineStyle)},
      uLineJitter:   {value:Math.min(1,Math.max(0,lineJitter))},
      uScanOpacity:  {value:scanOpacity},
      uNoise:        {value:noiseIntensity},
      uBloomOpacity: {value:bloomIntensity},
      uScanGlow:     {value:scanGlow},
      uScanSoftness: {value:scanSoftness},
      uPhaseTaper:   {value:scanPhaseTaper},
      uScanDuration: {value:scanDuration},
      uScanDelay:    {value:scanDelay},
      uScanDirection:{value:scanDirVal(scanDirection)},
      uScanStarts:   {value:new Array<number>(MAX_SCANS).fill(0)},
      uScanCount:    {value:0},
    };

    const material=new THREE.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:frag,transparent:true,depthWrite:false,depthTest:false});
    materialRef.current=material;
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
    scene.add(quad);

    if(enablePost){
      const composer=new EffectComposer(renderer);
      composerRef.current=composer;
      composer.addPass(new RenderPass(scene,camera));
      const bloom=new BloomEffect({intensity:1.0,luminanceThreshold:bloomThreshold,luminanceSmoothing:bloomSmoothing});
      bloom.blendMode.opacity.value=Math.max(0,bloomIntensity);
      bloomRef.current=bloom;
      const chroma=new ChromaticAberrationEffect({offset:new THREE.Vector2(chromaticAberration,chromaticAberration),radialModulation:true,modulationOffset:0});
      chromaRef.current=chroma;
      const ep=new EffectPass(camera,bloom,chroma);
      ep.renderToScreen=true;
      composer.addPass(ep);
    }

    const ro=new ResizeObserver(()=>{
      const w=container.clientWidth,h=container.clientHeight;
      renderer.setSize(w,h);
      material.uniforms.iResolution.value.set(w,h,renderer.getPixelRatio());
      composerRef.current?.setSize(w,h);
    });
    ro.observe(container);

    let last=performance.now();
    const tick=()=>{
      const now=performance.now();
      const dt=Math.min(0.1,Math.max(0,(now-last)/1000));
      last=now;
      smoothDampVec2(lookCurrent.current,lookTarget.current,lookVel.current,smoothTime,MAX_SPEED,dt,lookOut.current);
      lookCurrent.current.copy(lookOut.current);
      tiltCurrent.current=smoothDampFloat(tiltCurrent.current,tiltTarget.current,tiltVel.current,smoothTime,MAX_SPEED,dt);
      yawCurrent.current=smoothDampFloat(yawCurrent.current,yawTarget.current,yawVel.current,smoothTime,MAX_SPEED,dt);
      const u=material.uniforms;
      u.uSkew.value.set(lookCurrent.current.x*skewScale,-lookCurrent.current.y*yBoost*skewScale);
      u.uTilt.value=tiltCurrent.current*tiltScale;
      u.uYaw.value=THREE.MathUtils.clamp(yawCurrent.current*yawScale,-0.6,0.6);
      u.iTime.value=now/1000;
      renderer.clear(true,true,true);
      composerRef.current?composerRef.current.render(dt):renderer.render(scene,camera);
      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);

    return()=>{
      if(rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      material.dispose();
      quad.geometry.dispose();
      composerRef.current?.dispose();
      composerRef.current=null;
      renderer.dispose();
      renderer.forceContextLoss();
      if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[enablePost,lineThickness,linesColor,scanColor,gridScale,lineStyle,lineJitter,scanDirection,sensitivity]);

  // Live uniform updates
  useEffect(()=>{
    const m=materialRef.current; if(!m) return;
    const u=m.uniforms;
    u.uLineThickness.value=lineThickness;
    (u.uLinesColor.value as THREE.Color).copy(srgbColor(linesColor));
    (u.uScanColor.value as THREE.Color).copy(srgbColor(scanColor));
    u.uGridScale.value=gridScale;
    u.uLineStyle.value=lineStyleVal(lineStyle);
    u.uLineJitter.value=Math.min(1,Math.max(0,lineJitter));
    u.uBloomOpacity.value=Math.max(0,bloomIntensity);
    u.uNoise.value=Math.max(0,noiseIntensity);
    u.uScanGlow.value=scanGlow;
    u.uScanOpacity.value=Math.min(1,Math.max(0,scanOpacity));
    u.uScanDirection.value=scanDirVal(scanDirection);
    u.uScanSoftness.value=scanSoftness;
    u.uPhaseTaper.value=scanPhaseTaper;
    u.uScanDuration.value=Math.max(0.05,scanDuration);
    u.uScanDelay.value=Math.max(0,scanDelay);
    if(bloomRef.current){
      bloomRef.current.blendMode.opacity.value=Math.max(0,bloomIntensity);
      (bloomRef.current as any).luminanceMaterial.threshold=bloomThreshold;
      (bloomRef.current as any).luminanceMaterial.smoothing=bloomSmoothing;
    }
    if(chromaRef.current) chromaRef.current.offset.set(chromaticAberration,chromaticAberration);
  },[lineThickness,linesColor,scanColor,gridScale,lineStyle,lineJitter,bloomIntensity,bloomThreshold,bloomSmoothing,chromaticAberration,noiseIntensity,scanGlow,scanOpacity,scanDirection,scanSoftness,scanPhaseTaper,scanDuration,scanDelay]);

  // Gyro
  useEffect(()=>{
    if(!enableGyro) return;
    const h=(e:DeviceOrientationEvent)=>{
      if(uiFaceActive) return;
      const gamma=e.gamma??0, beta=e.beta??0;
      lookTarget.current.set(THREE.MathUtils.clamp(gamma/45,-1,1),THREE.MathUtils.clamp(-beta/30,-1,1));
      tiltTarget.current=THREE.MathUtils.degToRad(gamma)*0.4;
    };
    window.addEventListener('deviceorientation',h);
    return()=>window.removeEventListener('deviceorientation',h);
  },[enableGyro,uiFaceActive]);

  // Models
  useEffect(()=>{
    if(!enableWebcam) return;
    let canceled=false;
    (async()=>{
      try{
        await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath)]);
        if(!canceled) setModelsReady(true);
      }catch{ if(!canceled) setModelsReady(false); }
    })();
    return()=>{canceled=true;};
  },[enableWebcam,modelsPath]);

  // Webcam tracking
  useEffect(()=>{
    if(!enableWebcam||!modelsReady) return;
    let stop=false,lastDetect=0;
    let ownedVideo=false;
    let video=videoRef.current;
    if(!video){
      video=document.createElement('video');
      video.style.display='none';
      document.body.appendChild(video);
      ownedVideo=true;
    }
    const cleanup=()=>{
      stop=true;
      const stream=video!.srcObject as MediaStream|null;
      stream?.getTracks().forEach(t=>t.stop());
      video!.pause(); video!.srcObject=null;
      if(ownedVideo&&video!.parentNode) video!.parentNode.removeChild(video!);
    };
    (async()=>{
      try{
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
        if(stop){stream.getTracks().forEach(t=>t.stop());return;}
        video!.srcObject=stream; await video!.play();
      }catch{return;}
      const opts=new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.5});
      const detect=async(ts:number)=>{
        if(stop) return;
        if(ts-lastDetect>=33){
          lastDetect=ts;
          try{
            const res=await faceapi.detectSingleFace(video!,opts).withFaceLandmarks(true);
            if(res?.detection){
              const{box}=res.detection;
              const vw=video!.videoWidth||1,vh=video!.videoHeight||1;
              medianPush(bufX.current,(box.x+box.width*0.5)/vw*2-1,5);
              medianPush(bufY.current,(box.y+box.height*0.5)/vh*2-1,5);
              const faceSize=Math.min(1,Math.hypot(box.width/vw,box.height/vh));
              const depthMul=1+depthResponse*(faceSize-0.25);
              lookTarget.current.set(Math.tanh(median(bufX.current))*depthMul,Math.tanh(median(bufY.current))*depthMul);
              const lc=centroid(res.landmarks.getLeftEye()),rc=centroid(res.landmarks.getRightEye());
              medianPush(bufT.current,Math.atan2(rc.y-lc.y,rc.x-lc.x),5);
              tiltTarget.current=median(bufT.current);
              const nose=res.landmarks.getNose(),tip=nose[nose.length-1]??nose[Math.floor(nose.length/2)];
              const jaw=res.landmarks.getJawOutline();
              const eyeDist=Math.hypot(rc.x-lc.x,rc.y-lc.y)+1e-6;
              const yawSignal=Math.tanh(THREE.MathUtils.clamp((dist2(tip,jaw[13]??jaw[14])-dist2(tip,jaw[3]??jaw[2]))/(eyeDist*1.6),-1,1));
              medianPush(bufYaw.current,yawSignal,5);
              yawTarget.current=median(bufYaw.current);
              setUiFaceActive(true);
            }else setUiFaceActive(false);
          }catch{setUiFaceActive(false);}
        }
        if('requestVideoFrameCallback' in HTMLVideoElement.prototype){
          (video as any).requestVideoFrameCallback(()=>detect(performance.now()));
        }else requestAnimationFrame(detect);
      };
      requestAnimationFrame(detect);
    })();
    return cleanup;
  },[enableWebcam,modelsReady,depthResponse]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden${className?` ${className}`:''}`}
      style={style}
    >
      {showPreview&&(
        <div className="absolute bottom-3 right-3 w-[220px] h-[132px] rounded-lg overflow-hidden border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-black pointer-events-none text-xs text-white">
          <video ref={videoRef} muted playsInline autoPlay className="w-full h-full object-cover -scale-x-100"/>
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-1.5 py-0.5 rounded-md">
            {enableWebcam?modelsReady?uiFaceActive?'Face: tracking':'Face: searching':'Loading models':'Webcam disabled'}
          </div>
        </div>
      )}
    </div>
  );
}

export default GridScan;