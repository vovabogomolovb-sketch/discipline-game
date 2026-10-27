"use strict";
// ================= VOXEL GRID =================
class Vox{
 constructor(X,Y,Z){this.X=X;this.Y=Y;this.Z=Z;this.c=new Int32Array(X*Y*Z).fill(-1);this.e=new Uint8Array(X*Y*Z);this.t=new Uint8Array(X*Y*Z);this.tag=0}
 k(x,y,z){return (z*this.Y+y)*this.X+x}
 ok(x,y,z){return x>=0&&y>=0&&z>=0&&x<this.X&&y<this.Y&&z<this.Z}
 set(x,y,z,c,e=0){x=Math.round(x);y=Math.round(y);z=Math.round(z);if(!this.ok(x,y,z))return;const k=this.k(x,y,z);
  if(c===null||c===undefined||c===-1){this.c[k]=-1;this.e[k]=0;this.t[k]=0;return}if(typeof c==="string")c=hexN(c);this.c[k]=c;this.e[k]=e?1:0;this.t[k]=this.tag}
 get(x,y,z){return this.ok(x,y,z)?this.c[this.k(x,y,z)]:-1}
 s(x,y,z){return this.ok(x,y,z)&&this.c[this.k(x,y,z)]>=0}
 box(x,y,z,w,d,h,c,e=0){for(let k=z;k<z+h;k++)for(let j=y;j<y+d;j++)for(let i=x;i<x+w;i++)this.set(i,j,k,typeof c==="function"?c(i,j,k):c,e)}
 del(x,y,z,w=1,d=1,h=1){this.box(x,y,z,w,d,h,-1)}
 // ellipsoid blob
 blob(cx,cy,cz,rx,ry,rz,c,e=0){for(let z=Math.floor(cz-rz);z<=cz+rz;z++)for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){
  const q=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2+((z+.5-cz)/rz)**2;if(q<=1)this.set(x,y,z,typeof c==="function"?c(x,y,z,q):c,e)}}
 // copy another grid in (non-empty voxels only)
 stamp(o,ox,oy,oz){for(let z=0;z<o.Z;z++)for(let y=0;y<o.Y;y++)for(let x=0;x<o.X;x++){const k=o.k(x,y,z);if(o.c[k]>=0)this.set(x+ox,y+oy,z+oz,o.c[k],o.e[k])}}
 // 3x5 pixel text drawn on a vertical plane: dir "x" (text runs along +x, face +y) or "y"
 text(s,x,y,z,c,dir="x",e=1){for(const ch of s){const g=GL[ch]||GL[" "];g.forEach((ln,j)=>[...ln].forEach((v,i)=>{if(v==="#"){if(dir==="x")this.set(x+i,y,z+4-j,c,e);else this.set(x,y+i,z+4-j,c,e)}}));
  if(dir==="x")x+=g[0].length+1;else y+=g[0].length+1}}
}

// ================= RENDERER =================
// 2:1 isometric; viewer sees +x (right), +y (left) and +z (top) faces.
// o: {a (even px), lights:[{x,y,z,c:[r,g,b],r,i,glow}], amb:[r,g,b], beam:(x,y,z,face)=>0..1, beamC:[r,g,b], glows:[[x,y,z,c,rad]], buf:true -> depth (x+y+z) and tag per pixel}
function voxRender(V,o){
 const sl=o.s||2,a=Math.max(sl,Math.round(o.a/sl)*sl),half=a/sl,hz=o.hz||Math.round(a*(sl>2?1.25:1.2));
 const W=(V.X+V.Y)*a+2,H=(V.X+V.Y)*half+V.Z*hz+2,ox=V.Y*a+1,oy=V.Z*hz+1;
 const cv=layer(W,H),g=cv.getContext("2d");
 const proj=(x,y,z)=>[ox+(x-y)*a,oy+(x+y)*half-z*hz];
 const L=o.lights||[],amb=o.amb||[1,1,1],beam=o.beam,bc=o.beamC||[1,.9,.7];
 const n=V.X+V.Y+V.Z,B=Array.from({length:n},()=>[]);
 const XX=V.X,YY=V.Y,ZZ=V.Z,C=V.c,E=V.e,T=V.t;
 const dep=o.buf?new Float32Array(W*H).fill(-1e9):null,ids=o.buf?new Uint8Array(W*H):null;
 const mark=(x0,y0,w,h,key,id)=>{for(let j=y0;j<y0+h;j++){const p=j*W+x0;dep.fill(key,p,p+w);ids.fill(id,p,p+w)}};
 const S_=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<XX&&y<YY&&z<ZZ&&C[(z*YY+y)*XX+x]>=0;
 for(let z=0;z<ZZ;z++)for(let y=0;y<YY;y++)for(let x=0;x<XX;x++){const k=(z*YY+y)*XX+x;if(C[k]<0)continue;
  const f=(S_(x,y,z+1)?0:1)|(S_(x+1,y,z)?0:2)|(S_(x,y+1,z)?0:4);if(f)B[x+y+z].push(x,y,z,f)}
 function light(x,y,z,nx,ny,nz,col,em){
  const br=(col>>16&255)/255,bg=(col>>8&255)/255,bb=(col&255)/255;
  if(em){const k=nz?1.06:ny?.96:.9;return`rgb(${Math.min(255,br*255*k)|0},${Math.min(255,bg*255*k)|0},${Math.min(255,bb*255*k)|0})`}
  const fs=nz?1:ny?.84:.7;
  // ambient occlusion from neighbours in the face plane
  const px=x+nx,py=y+ny,pz=z+nz;let cnt=0;
  if(nz){cnt=S_(px+1,py,pz)+S_(px-1,py,pz)+S_(px,py+1,pz)+S_(px,py-1,pz)+.5*(S_(px+1,py+1,pz)+S_(px-1,py-1,pz)+S_(px+1,py-1,pz)+S_(px-1,py+1,pz))}
  else if(nx){cnt=S_(px,py+1,pz)+S_(px,py-1,pz)+S_(px,py,pz+1)+S_(px,py,pz-1)+.5*(S_(px,py+1,pz+1)+S_(px,py-1,pz-1)+S_(px,py+1,pz-1)+S_(px,py-1,pz+1))}
  else{cnt=S_(px+1,py,pz)+S_(px-1,py,pz)+S_(px,py,pz+1)+S_(px,py,pz-1)+.5*(S_(px+1,py,pz+1)+S_(px-1,py,pz-1)+S_(px+1,py,pz-1)+S_(px-1,py,pz+1))}
  let ao=Math.max(.5,1-.075*cnt);
  // contact shadow: something hanging above this top face
  if(nz){for(let d=2;d<10;d++)if(S_(x,y,z+d)){ao*=.62+.035*d;break}}
  else{let d2=0;for(let d=1;d<6;d++)if(S_(px,py,pz+d)){d2=d;break}if(d2)ao*=.8+.03*d2}
  let lr=amb[0]*fs*ao,lg=amb[1]*fs*ao,lb=amb[2]*fs*ao,ar=0,ag=0,ab=0;
  if(beam){const b=beam(x+.5+nx*.5,y+.5+ny*.5,z+.5+nz*.5,nz?2:ny?1:0);if(b>0){const k=b*(nz?1:.7);lr+=bc[0]*k;lg+=bc[1]*k;lb+=bc[2]*k}}
  const cx=x+.5+nx*.5,cy=y+.5+ny*.5,cz=z+.5+nz*.5;
  for(const l of L){const dx=l.x-cx,dy=l.y-cy,dz=l.z-cz,d=Math.hypot(dx,dy,dz);if(d>=l.r)continue;
   const t=1-d/l.r,att=t*t*l.i,nd=d>0?(dx*nx+dy*ny+dz*nz)/d:1;if(nd<-.2)continue;const k=att*(.3+.7*Math.max(0,nd));
   lr+=l.c[0]*k;lg+=l.c[1]*k;lb+=l.c[2]*k;ar+=l.c[0]*k;ag+=l.c[1]*k;ab+=l.c[2]*k}
  const R=Math.min(255,(br*lr+ar*.06)*255),G=Math.min(255,(bg*lg+ag*.06)*255),Bb=Math.min(255,(bb*lb+ab*.06)*255);
  return`rgb(${R|0},${G|0},${Bb|0})`}
 for(let s=0;s<n;s++){const q=B[s];for(let i=0;i<q.length;i+=4){const x=q[i],y=q[i+1],z=q[i+2],f=q[i+3],k=(z*YY+y)*XX+x,col=C[k],em=E[k];
  const Q0=ox+(x-y)*a,Q1=oy+(x+y)*half-z*hz,T1=Q1-hz;
  const key=x+y+z,tg=T[k];
  const H2=2*half;
  if(f&1){g.fillStyle=light(x,y,z,0,0,1,col,em);for(let rr=0;rr<H2;rr++){const w=rr<half?sl*(rr+1):sl*(H2-rr);g.fillRect(Q0-w,T1+rr,w*2,1);if(dep)mark(Q0-w,T1+rr,w*2,1,key,tg)}}
  if(f&2){g.fillStyle=light(x,y,z,1,0,0,col,em);for(let k2=0;k2<half;k2++){g.fillRect(Q0+sl*k2,T1+H2-k2,sl,hz);if(dep)mark(Q0+sl*k2,T1+H2-k2,sl,hz,key,tg)}}
  if(f&4){g.fillStyle=light(x,y,z,0,1,0,col,em);for(let k2=0;k2<half;k2++){g.fillRect(Q0-sl*(k2+1),T1+H2-k2,sl,hz);if(dep)mark(Q0-sl*(k2+1),T1+H2-k2,sl,hz,key,tg)}}}}
 // bloom
 g.globalCompositeOperation="lighter";
 const bloom=(x,y,z,c,rad,al)=>{const p=proj(x,y,z),R=rad*a,gr=g.createRadialGradient(p[0],p[1],0,p[0],p[1],R);
  gr.addColorStop(0,`rgba(${c[0]*255|0},${c[1]*255|0},${c[2]*255|0},${al})`);gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(p[0]-R,p[1]-R,R*2,R*2)};
 L.forEach(l=>{if(l.glow)bloom(l.x,l.y,l.z,l.c,l.glow,.16*Math.min(1.4,l.i))});
 (o.glows||[]).forEach(([x,y,z,c,rad,al])=>bloom(x,y,z,c,rad,al||.25));
 g.globalCompositeOperation="source-over";
 return{cv,proj,a,hz,W,H,dep,ids,s:sl}}
const rgb1=h=>{const n=hexN(h);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
