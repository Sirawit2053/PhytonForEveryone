// Camera for the Fastwork fly-over. Pure functions of time. Shared by film.html and node checks.
(function(root){
"use strict";
const W=1440,H=1152,F=1880,PAGE_W=1440,PAGE_H=6330,CRUISE=770;
const TILT=56*Math.PI/180;
const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const ss=u=>u*u*(3-2*u);                    // smoothstep
const sss=u=>u*u*u*(u*(u*6-15)+10);         // smootherstep
const lerp=(a,b,u)=>a+(b-a)*u;
const quadIO=u=>u<.5?2*u*u:1-2*(1-u)*(1-u);

// targets (page px): second-section title centre at 1.6s, last title centre at 8.0s
const T_SECOND=1022,T_LAST=5994;
let C=1.04,LY0=446;
// speed as a share of cruise
function share(t){
  if(t<=0)return 0;
  if(t<0.6)return 0.5*ss(t/0.6);
  if(t<1.25)return 0.5;
  if(t<1.6)return lerp(0.5,C,ss(seg(t,1.25,1.6)));
  if(t<7.3)return C;
  if(t<8.3)return lerp(C,0.12,ss(seg(t,7.3,8.3)));
  return 0.12;
}
const DT=1/2400,NT=Math.ceil(15/DT)+2;let TAB=new Float64Array(NT);
function build(){TAB[0]=0;let prev=share(0);for(let i=1;i<NT;i++){const s=share(i*DT);TAB[i]=TAB[i-1]+(prev+s)/2*DT*CRUISE;prev=s;}}
function dist(t){const x=clamp(t,0,14.99)/DT,i=Math.floor(x),u=x-i;return TAB[i]+(TAB[i+1]-TAB[i])*u;}
// solve cruise + start so the two titles cross the frame centre on time
for(let it=0;it<30;it++){build();LY0=T_SECOND-dist(1.6);const err=(LY0+dist(8.0))-T_LAST;C-=err/(CRUISE*6.35);}
build();LY0=T_SECOND-dist(1.6);
const lyGlide=t=>LY0+dist(t);

// distance: eases out 1360 -> 1700 over the flight, never back in
const D0=1360,D1=1700,D_STRIP=F*PAGE_H/1068,D_CARD=F*PAGE_W/1018;
function dFlight(t){const u=seg(t,0,7.75);return D0+(D1-D0)*(1-(1-u)*(1-u));}
// rise: log-scale zoom with a smooth trapezoid speed 7.75-8.35 up, 8.35-8.95 even, 8.95-9.25 down
const LN_RISE=Math.log(D_STRIP/D1);const VMAX=LN_RISE/1.05;
function riseArea(t){ // integral of the trapezoid velocity from 7.75 to t (in units of VMAX*s)
  const a=7.75,b=8.35,c=8.95,e=9.25;
  if(t<=a)return 0;
  const ramp=(x,T)=>{ // integral of smootherstep-shaped ramp 0->1 over duration T, up to x
    const u=clamp(x/T);return T*(u*u*u*u*(u*(u*1-3)+2.5));};
  if(t<b)return ramp(t-a,b-a);
  let A=ramp(b-a,b-a);
  if(t<c)return A+(t-b);
  A+=c-b;
  const T=e-c,x=Math.min(t,e)-c;return A+x-ramp(x,T)*1; // ramp down: integral of (1-r)
}
function tilt(t){return TILT*(1-ss(seg(t,8.15,8.95)));}
const K=(H-42-H/2)/F;                        // page bottom held 42px above frame bottom
function lyPinBottom(d,phi){const s=Math.sin(phi),c=Math.cos(phi);return PAGE_H-K*d/(c+K*s);}
const D_OVER=D_STRIP/1.035;
function cam(t){
  t=clamp(t,0,14.5);
  let d,phi=tilt(t),Ly;
  if(t<7.75){d=dFlight(t);}
  else if(t<9.25){d=D1*Math.exp(VMAX*riseArea(t));}
  else if(t<9.47){d=D_STRIP/(1+0.035*ss(seg(t,9.25,9.47)));}
  else if(t<9.97){const u=quadIO(seg(t,9.47,9.97));d=Math.exp(lerp(Math.log(D_OVER),Math.log(D_CARD),u));}
  else{d=D_CARD/(1+0.02*ss(seg(t,9.97,14.5)));}
  if(t<8.3)Ly=lyGlide(t);
  else if(t<9.25){const w=ss(seg(t,8.3,8.65));Ly=lerp(lyGlide(t),lyPinBottom(d,phi),w);}
  else if(t<9.47){Ly=PAGE_H/2;}
  else if(t<9.97){const yTop0=H/2-F*(PAGE_H/2)/D_OVER;const yTop=lerp(yTop0,283,ss(seg(t,9.70,9.97)));Ly=(H/2-yTop)*d/F;}
  else{Ly=450-(601-H/2)*d/F;}
  return {Lx:PAGE_W/2,Ly,d,phi};
}
// projection helpers
function basis(c){const s=Math.sin(c.phi),co=Math.cos(c.phi);
  return {C:[c.Lx,c.Ly+c.d*s,c.d*co],f:[0,-s,-co],u:[0,-co,s],r:[1,0,0]};}
function project(c,P){const b=basis(c);const v=[P[0]-b.C[0],P[1]-b.C[1],P[2]-b.C[2]];
  const z=v[0]*b.f[0]+v[1]*b.f[1]+v[2]*b.f[2];const x=v[0]*b.r[0]+v[1]*b.r[1]+v[2]*b.r[2];const y=v[0]*b.u[0]+v[1]*b.u[1]+v[2]*b.u[2];
  return [W/2+F*x/z,H/2-F*y/z,z];}
root.CAM={W,H,F,PAGE_W,PAGE_H,CRUISE,cam,basis,project,lyGlide,share,get C(){return C;},get LY0(){return LY0;},D_CARD,D_STRIP,clamp,seg,ss,sss,lerp,quadIO};
})(typeof window!=='undefined'?window:module.exports);
