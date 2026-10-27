"use strict";
// ================= VOXEL HERO =================
// Model faces +y (towards the viewer's left). Width along x (0..4), body depth y 0..1, props may reach y 3.
const HC={hair:"#4a2a22",skin:"#efbf98",eye:"#1a1020",shirt:"#41a6f6",shirt2:"#2f86d6",pants:"#333c57",shoe:"#1a1a20",book:"#c0392b",page:"#f4efe2",iron:"#4a4d55",can:"#3f9a55"};
function heroModel(pose,f){
 const V=new Vox(5,4,18),b=(x,y,z,c)=>V.set(x,y,z,c);
 const head=(z0,lookUp)=>{for(let x=1;x<=3;x++)for(let y=0;y<=1;y++)for(let z=z0;z<z0+4;z++)b(x,y,z,HC.skin);
  for(let x=0;x<=4;x++)for(let y=0;y<=1;y++)b(x,y,z0+4,HC.hair);for(let x=1;x<=3;x++)for(let z=z0+1;z<=z0+3;z++)b(x,0,z,HC.hair);
  [0,4].forEach(x=>{b(x,0,z0+3,HC.hair);b(x,1,z0+3,HC.hair);b(x,0,z0+2,HC.hair)});b(1,1,z0+2,HC.eye);b(3,1,z0+2,HC.eye)};
 if(pose==="pray"){ // kneeling
  [1,3].forEach(x=>{for(let y=0;y<=2;y++)b(x,y,0,HC.pants);b(x,0,1,HC.pants);b(x,1,1,HC.pants)});[1,3].forEach(x=>b(x,0,0,HC.shoe));
  for(let x=1;x<=3;x++)for(let y=0;y<=1;y++)for(let z=2;z<=5;z++)b(x,y,z,HC.shirt);
  [0,4].forEach(x=>{for(let z=3;z<=5;z++)b(x,0,z,HC.shirt2)});b(1,2,5,HC.skin);b(2,2,5,HC.skin);b(3,2,5,HC.skin);b(2,2,6,HC.skin);
  b(2,1,6,HC.skin);head(7);return V}
 // legs
 const walk=pose==="walk"?f:0;
 [[1,walk?1:0],[3,walk?0:1]].forEach(([x,fw])=>{const y0=pose==="walk"?fw:0;for(let z=1;z<=5;z++){b(x,y0,z,HC.pants);b(x,y0+1,z,HC.pants)}b(x,y0,0,HC.shoe);b(x,y0+1,0,HC.shoe);b(x,y0+2,0,HC.shoe)});
 b(2,0,5,HC.pants);b(2,1,5,HC.pants);
 // torso
 for(let x=1;x<=3;x++)for(let y=0;y<=1;y++)for(let z=6;z<=10;z++)b(x,y,z,z===6?HC.shirt2:HC.shirt);
 head(12);
 // arms
 const armDown=x=>{for(let z=7;z<=10;z++){b(x,0,z,HC.shirt2);b(x,1,z,HC.shirt2)}b(x,1,6,HC.skin)};
 const armFwd=(x,z)=>{for(let y=0;y<=2;y++)b(x,y,z,y<2?HC.shirt2:HC.skin);b(x,0,z+1,HC.shirt2)};
 const armUp=x=>{for(let z=10;z<=14;z++)b(x,1,z,HC.shirt2);b(x,1,15,HC.skin);b(x,1,16,HC.skin)};
 if(pose==="read"){armFwd(0,8);armFwd(4,8);for(let x=1;x<=3;x++){b(x,3,8,HC.book);b(x,3,9,f?HC.page:HC.book);b(x,3,10,HC.book)}b(2,3,9,HC.page)}
 else if(pose==="study"){armDown(0);if(f)armUp(4);else armFwd(4,9);b(4,f?1:3,f?17:10,"#f2d06b")}
 else if(pose==="gym"){if(f){armFwd(0,9);armFwd(4,9);b(0,3,9,HC.iron);b(4,3,9,HC.iron);b(0,3,10,HC.iron);b(4,3,10,HC.iron)}else{armDown(0);armDown(4);b(0,1,5,HC.iron);b(4,1,5,HC.iron);b(0,2,5,HC.iron);b(4,2,5,HC.iron)}}
 else if(pose==="pullup"){armUp(0);armUp(4)}
 else if(pose==="water"){armDown(0);armFwd(4,8);b(4,3,7,HC.can);b(4,3,8,HC.can);b(3,3,8,HC.can);b(4,3,9,HC.can)}
 else{armDown(0);armDown(4)}
 return V}
// rotate a model k quarter-turns: k=0 faces +y, 1 faces +x, 2 faces -y, 3 faces -x
function rotVox(V,k){let A=V;for(let t=0;t<(k&3);t++){const B=new Vox(A.Y,A.X,A.Z);
 for(let z=0;z<A.Z;z++)for(let y=0;y<A.Y;y++)for(let x=0;x<A.X;x++){const kk=A.k(x,y,z);if(A.c[kk]>=0){B.set(y,A.X-1-x,z,A.c[kk],A.e[kk])}}A=B}return A}
// pre-rendered sprite with per-pixel depth (local x+y+z) for compositing against the scene depth buffer
const heroCache={};
function heroSprite(pose,f,face,a,amb,sl=2){const key=[pose,f,face,a,amb.join(),sl].join("|");if(heroCache[key])return heroCache[key];
 const V=rotVox(heroModel(pose,f),face),res=voxRender(V,{a,amb,lights:[],buf:true,s:sl}),g=res.cv.getContext("2d");
 const img=g.getImageData(0,0,res.W,res.H),o=res.proj(0,0,0);
 return heroCache[key]={img,dep:res.dep,W:res.W,H:res.H,ox:o[0],oy:o[1],X:V.X,Y:V.Y}}
// draw the hero into ctx g where the scene (res, placed at off) is behind it
function drawHeroVox(g,res,off,sp,hx,hy,hz){
 const p=res.proj(hx,hy,hz),sx=Math.round(off[0]+p[0]-sp.ox),sy=Math.round(off[1]+p[1]-sp.oy);
 const W=g.canvas.width,H=g.canvas.height,x0=Math.max(0,sx),y0=Math.max(0,sy),x1=Math.min(W,sx+sp.W),y1=Math.min(H,sy+sp.H);if(x1<=x0||y1<=y0)return;
 const dst=g.getImageData(x0,y0,x1-x0,y1-y0),dd=dst.data,sd=sp.img.data,base=hx+hy+hz,RW=res.W;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const si=(y-sy)*sp.W+(x-sx),ld=sp.dep[si];if(ld<-1e8)continue;
  const rx=x-off[0],ry=y-off[1];let sd2=-1e9;if(rx>=0&&ry>=0&&rx<RW&&ry<res.H)sd2=res.dep[ry*RW+rx];
  if(ld+base<sd2-.35)continue;const di=((y-y0)*(x1-x0)+(x-x0))*4,s4=si*4;dd[di]=sd[s4];dd[di+1]=sd[s4+1];dd[di+2]=sd[s4+2];dd[di+3]=255}
 g.putImageData(dst,x0,y0)}
// ---- walkable grid + A* so the hero walks around furniture ----
let GRID=null;
function buildGrid(V,r=2){const W=V.X,H=V.Y,raw=new Uint8Array(W*H),g=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let b=x<2||y<2;if(!b)for(let z=3;z<=12;z++)if(V.s(x,y,z)){b=true;break}raw[y*W+x]=b?1:0}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let b=raw[y*W+x];for(let dy=-r;dy<=r&&!b;dy++)for(let dx=-r;dx<=r&&!b;dx++){if(dx*dx+dy*dy>r*r+1)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H||raw[yy*W+xx])b=1}g[y*W+x]=b}
 return GRID={W,H,g}}
function freeNear(G,x,y){x=Math.max(0,Math.min(G.W-1,Math.round(x)));y=Math.max(0,Math.min(G.H-1,Math.round(y)));if(!G.g[y*G.W+x])return[x,y];
 for(let r=1;r<20;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<G.W&&yy<G.H&&!G.g[yy*G.W+xx])return[xx,yy]}return[x,y]}
function los(G,a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*2);for(let i=1;i<n;i++){const x=Math.round(a[0]+(b[0]-a[0])*i/n),y=Math.round(a[1]+(b[1]-a[1])*i/n);if(G.g[y*G.W+x])return false}return true}
function findPath(G,sx,sy,tx,ty){const s=freeNear(G,sx,sy),t=freeNear(G,tx,ty),W=G.W,N=W*G.H,gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N),open=[];
 const si=s[1]*W+s[0],ti=t[1]*W+t[0],hh=i=>Math.hypot(i%W-t[0],(i/W|0)-t[1]);gs[si]=0;open.push([hh(si),si]);
 while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;const [,c]=open.splice(bi,1)[0];if(closed[c])continue;closed[c]=1;if(c===ti)break;
  const cx=c%W,cy=c/W|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=G.H)continue;const ni=ny*W+nx;if(G.g[ni]||closed[ni])continue;
   if(dx&&dy&&(G.g[cy*W+nx]||G.g[ny*W+cx]))continue;const ng=gs[c]+(dx&&dy?1.414:1);if(ng<gs[ni]){gs[ni]=ng;from[ni]=c;open.push([ng+hh(ni),ni])}}}
 if(from[ti]<0&&si!==ti)return[[tx,ty]];
 const raw=[];for(let i=ti;i!==-1;i=from[i])raw.unshift([i%W+.5,(i/W|0)+.5]);
 const out=[];let a=[sx,sy];for(let i=0;i<raw.length;i++){const nx=raw[i+1];if(!nx||!los(G,a,nx)){out.push(raw[i]);a=raw[i]}}
 out.push([tx,ty]);return out}
// ---- hero brain: walk between stations, perform actions ----
const HERO={x:20,y:12,path:[],face:0,pose:"idle",act:null,actT:0,wait:2,f:0};
function heroPlace(st){HERO.x=st[0];HERO.y=st[1];HERO.path=[];if(GRID){const p=freeNear(GRID,st[0],st[1]);HERO.x=p[0]+.5;HERO.y=p[1]+.5}}
function heroGo(x,y,act){HERO.path=GRID?findPath(GRID,HERO.x,HERO.y,x,y):[[x,y]];HERO.act=act||null;HERO.actT=0;HERO.wait=0}
function heroTick(dt,idle){HERO.f+=dt;
 if(HERO.path.length){const [tx,ty]=HERO.path[0],dx=tx-HERO.x,dy=ty-HERO.y,d=Math.hypot(dx,dy);
  if(d<.12){HERO.path.shift();if(HERO.path.length)return}else{const s=Math.min(d,7*dt);HERO.x+=dx/d*s;HERO.y+=dy/d*s;HERO.pose="walk";HERO.face=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?0:2);return}}
 if(HERO.act){if(HERO.actT===0)HERO.face=HERO.act.face;HERO.pose=HERO.act.pose;HERO.actT+=dt;if(HERO.actT>HERO.act.t){const a=HERO.act;HERO.act=null;HERO.wait=1.5;a.done&&a.done()}return}
 HERO.pose="idle";HERO.wait-=dt;if(HERO.wait<=0&&idle&&idle.length){const p=idle[Math.random()*idle.length|0];heroGo(p[0],p[1]);HERO.wait=3+Math.random()*5}}
const heroFrame=()=>{const p=HERO.pose;if(p==="walk")return(HERO.f*5|0)%2;if(p==="idle")return 0;return(HERO.f*(p==="pullup"?1.6:2)|0)%2};
