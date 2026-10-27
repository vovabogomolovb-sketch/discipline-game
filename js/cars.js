"use strict";
// ================= CAR MODELS (voxel, ~13 voxels per metre) =================
// u = 0 rear .. 1 front (front faces +x). Body spans x 1..L-2 so bumpers/spare wheel can stick out.
function interp(arr,u){if(arr==null)return null;if(typeof arr==="number")return arr;if(u<arr[0][0]||u>arr[arr.length-1][0])return null;
 for(let i=0;i<arr.length-1;i++){const a=arr[i],b=arr[i+1];if(u>=a[0]&&u<=b[0])return a[1]+(b[1]-a[1])*((u-a[0])/((b[0]-a[0])||1))}return arr[arr.length-1][1]}
const CHROME="#dfe3e8",RUBBER="#1d1e22",GLASS="#1c2636",TIRE="#16171b",LENS="#fff3cf",RED="#c0141f",AMBER="#ff9a2e";
const ang=(dx,dz)=>Math.atan2(dz,dx);
const RIMS={
 fuchs:(dx,dz,d,R)=>d<.8?"#2a2a2e":(d>1.1&&d<2.2&&Math.cos(ang(dx,dz)*5)>.55)?"#2a2a2e":"#d6d9de",
 steel:(dx,dz,d,R)=>d<1.5?CHROME:(d>R-1.9?"#7d828b":"#9aa0a8"),
 mag:(dx,dz,d,R)=>d<.9?"#3a3c42":d>R-1.9?CHROME:(Math.cos(ang(dx,dz)*5)>.2?"#3a3c42":CHROME),
 bus:(dx,dz,d,R,M)=>d<1.5?CHROME:M.two,
 black:(dx,dz,d,R)=>d<1?"#b8bcc2":"#26272b",
 turbine:(dx,dz,d,R)=>d<.9?"#55585e":(Math.cos(ang(dx,dz)*10)>.55?"#55585e":"#cfd3d8"),
 star:(dx,dz,d,R)=>d<.9?"#c9a227":(Math.cos(ang(dx,dz)*5)>.5?"#d4d7dc":"#232428")};
function rnd(V,c,yc,zc,r,col,ring,face){ // round decal on a surface; face: (y,z,c)=>void
 for(let y=Math.floor(yc-r-1);y<=yc+r+1;y++)for(let z=Math.floor(zc-r-1);z<=zc+r+1;z++){const d=Math.hypot(y+.5-yc,z+.5-zc);if(d<=r)face(y,z,col);else if(ring&&d<=r+.85)face(y,z,ring)}}
const CARS=[
{id:"vaz",n:"ВАЗ-2107 «Семёрка»",c:80,col:"#7d1828",L:54,W:21,R:3.8,axle:[.22,.8],inset:2,pillars:[.47],rim:"steel",mirror:.67,
 belt:[[0,11],[.03,11.5],[.97,11.5],[1,11]],roof:[[.25,11.5],[.31,18.5],[.62,18.5],[.69,11.5]],
 deco(V,M){const {W,cy}=M;
  for(let y=Math.round(cy-4);y<=Math.round(cy+4);y++)for(let z=6;z<=10;z++)M.front(y,z,z===6||z===10?CHROME:(y%2?CHROME:"#202125"));
  [[2,6],[W-7,W-3]].forEach(([a,b])=>{for(let y=a;y<=b;y++)for(let z=6;z<=10;z++)M.front(y,z,(z===6||z===10||y===a||y===b)?CHROME:LENS)});
  for(let y=1;y<W-1;y++){M.bump(y,4,CHROME,1);M.bump(y,4,CHROME,-1);M.front(y,3,"#2a2b30")}
  for(let y=Math.round(cy-3);y<=Math.round(cy+3);y++){M.out(M.L-1,y,3,y%2?"#f2f2f2":"#2a2b30");M.back(y,6,"#f2f2f2")}
  [[1,6],[W-7,W-2]].forEach(([a,b])=>{for(let y=a;y<=b;y++)for(let z=7;z<=9;z++)M.back(y,z,[RED,AMBER,"#eeeeee"][(y-a)%3])});
  for(let x=4;x<M.L-4;x++)M.side(x,8,CHROME);M.handle(.52,10);M.handle(.33,10)}},
{id:"mustang",n:"Ford Mustang ’67",c:180,col:"#d9711c",L:60,W:22,R:4,axle:[.21,.8],inset:2.4,pillars:[.43],rim:"mag",mirror:.62,
 belt:[[0,10.2],[.06,10.8],[.95,10.8],[1,9.6]],roof:[[.11,10.8],[.25,15],[.4,17],[.52,17],[.63,10.8]],
 deco(V,M){const {W,cy,L}=M;
  for(let y=Math.round(cy-7);y<=Math.round(cy+7);y++)for(let z=5;z<=9;z++){const ed=z===5||z===9||y===Math.round(cy-7)||y===Math.round(cy+7);M.front(y,z,ed?CHROME:"#121315")}
  [cy-5,cy+5].forEach(yc=>rnd(V,0,yc+.5,7.5,1.2,LENS,CHROME,(y,z,c)=>M.front(y,z,c)));
  for(let y=1;y<W-1;y++){M.bump(y,4,CHROME,1);M.bump(y,4,CHROME,-1)}
  for(let x=1;x<L-1;x++)[cy-3,cy-2,cy+2,cy+3].forEach(y=>M.top(x,Math.round(y),"#f4f4f4",true));
  [[2,8],[W-9,W-3]].forEach(([a,b])=>{for(let y=a;y<=b;y++)for(let z=7;z<=9;z++)M.back(y,z,((y-a)%2===1)?RED:"#141416")});M.back(Math.round(cy),8,CHROME);
  const sx=Math.round(.35*L);for(let z=6;z<=9;z++)M.side(sx,z,"#141416");M.side(sx+1,6,"#141416");M.side(sx+1,9,"#141416");
  M.handle(.5,9)}},
{id:"bus",n:"Volkswagen T1 «Хиппи-бас»",c:220,col:"#c8323c",two:"#f1ebe0",L:56,W:23,R:3.9,axle:[.21,.8],inset:.6,pillars:[],rim:"bus",flatGlass:1,
 belt:[[0,13],[1,13]],roof:[[0,13],[.02,24],[.98,24],[1,13]],
 deco(V,M){const {W,cy,L}=M,wh=M.two;
  for(let x=0;x<L;x++)for(let y=0;y<W;y++)for(let z=14;z<V.Z;z++)if(V.get(x,y,z)===hexN(M.body))V.set(x,y,z,wh);
  for(let y=0;y<W;y++)for(let z=6;z<=13;z++)if(Math.abs(y+.5-(cy+.5))<(z-5.5)*1.5)M.front(y,z,wh);
  rnd(V,0,cy+.5,10.5,1.4,M.body,wh,(y,z,c)=>M.front(y,z,c));M.front(Math.round(cy),10,wh);
  [3.5,W-3.5].forEach(yc=>rnd(V,0,yc,8,1.4,LENS,CHROME,(y,z,c)=>M.front(y,z,c)));[3,W-4].forEach(y=>M.front(y,12,AMBER));
  for(let y=1;y<W-1;y++){M.bump(y,4,CHROME,1);M.bump(y,4,CHROME,-1)}
  for(let y=2;y<W-2;y++)for(let z=16;z<=21;z++)M.front(y,z,y===Math.round(cy)?wh:GLASS);
  for(let x=5;x<L-5;x++){const k=(x-5)%7;if(k===6)continue;for(let z=16;z<=20;z++)M.side(x,z,GLASS)}
  for(let x=8;x<L-8;x+=7)[3,W-4].forEach(y=>M.top(x,y,"#a9cbe6"));
  for(let y=4;y<W-4;y++)for(let z=17;z<=20;z++)M.back(y,z,GLASS);
  for(let x=2;x<7;x++)[14,16].forEach(z=>M.side(x,z,"#3a3a3a"));
  [3,W-4].forEach(y=>M.back(y,8,RED));for(let x=Math.round(.45*L);x<Math.round(.7*L);x++)M.side(x,13,"#9b2730")}},
{id:"gclass",n:"Mercedes G-Class",c:300,col:"#1b1c21",L:60,W:24,R:4.6,axle:[.21,.82],inset:1,pillars:[],rim:"black",flatGlass:1,boxy:1,mirror:.7,
 belt:[[0,13],[1,13]],roof:[[.08,13],[.1,24.5],[.69,24.5],[.72,13]],hood:{from:.72,dz:.8,inner:8},
 deco(V,M){const {W,cy,L}=M;
  for(let y=3;y<W-3;y++)for(let z=15;z<=22;z++)M.front(y,z,GLASS);
  for(let x=Math.round(.12*L);x<Math.round(.69*L);x++){const u=(x+.5)/L;if([.29,.47,.6].some(p=>Math.abs(u-p)<.012))continue;for(let z=15;z<=22;z++)M.side(x,z,GLASS)}
  for(let y=4;y<W-4;y++)for(let z=16;z<=22;z++)M.back(y,z,GLASS);
  [3.5,W-3.5].forEach(yc=>rnd(V,0,yc,10.5,1.6,LENS,CHROME,(y,z,c)=>M.front(y,z,c)));
  for(let y=7;y<W-7;y++)for(let z=7;z<=11;z++)M.front(y,z,(z===8||z===10)?CHROME:"#0e0f12");
  [1,W-2].forEach(y=>M.top(L-4,y,AMBER));
  for(let y=0;y<W;y++){M.bump(y,4,RUBBER,1);M.bump(y,5,RUBBER,1);M.bump(y,4,RUBBER,-1)}
  for(let y=0;y<W;y++)for(let z=8;z<=20;z++){const d=Math.hypot(y+.5-(cy+.5),z+.5-14);if(d<=5)M.out(0,y,z,d<2.4?"#2a2b30":d<3.1?CHROME:TIRE)}
  M.axle.forEach(au=>{const cx=au*L;for(let x=Math.floor(cx-M.R-2);x<=cx+M.R+2;x++)for(let z=0;z<=2*M.R+2;z++){const d=Math.hypot(x+.5-cx,z+.5-M.R);if(d>M.R+.7&&d<=M.R+1.9)M.side(x,z,"#0e0f12")}});
  for(let x=Math.round(.28*L);x<Math.round(.72*L);x++)M.side(x,3,"#0e0f12");
  M.handle(.38,15);M.handle(.55,15)}},
{id:"delorean",n:"DeLorean DMC-12",c:350,col:"#b7bcc2",L:56,W:24,R:4,axle:[.23,.8],inset:3,pillars:[],rim:"turbine",mirror:.6,
 belt:[[0,10.5],[.25,10.5],[.62,9.6],[.86,8.4],[1,7.4]],roof:[[.24,10.5],[.36,14.6],[.5,14.9],[.56,14.4],[.63,9.6]],
 paint:(x,y,z)=>z%2?"#b9bec4":"#a8adb3",
 deco(V,M){const {W,cy,L}=M;
  for(let x=0;x<L;x++)for(let y=0;y<W;y++)for(let z=2;z<=5;z++)if(V.s(x,y,z)&&!M.isTire(x,y,z))V.set(x,y,z,"#2a2b30");
  for(let y=1;y<W-1;y++)for(let z=6;z<=7;z++)M.front(y,z,"#232428");
  [[2,7],[W-8,W-3]].forEach(([a,b])=>{for(let y=a;y<=b;y++)for(let z=6;z<=7;z++)M.front(y,z,(y===a+2||y===b-2)?"#232428":LENS)});
  for(let y=1;y<W-1;y++)for(let z=6;z<=9;z++)M.back(y,z,(z===7||z===8)&&y%3?RED:"#1d1e22");
  for(let x=Math.round(.18*L);x<Math.round(.34*L);x++)for(let y=3;y<W-3;y++)M.top(x,y,(x%2)?"#17181b":"#3a3c42",false);
  [.4,.62].forEach(u=>{const x=Math.round(u*L);for(let z=6;z<=10;z++)M.side(x,z,"#8d9298")});[2,W-3].forEach(y=>M.front(y,8,AMBER))}},
{id:"p911",n:"Porsche 911 Turbo",c:420,col:"#ece0c4",L:56,W:23,R:4,axle:[.25,.78],inset:[[0,3.4],[.4,3],[.7,3]],pillars:[.47],rim:"fuchs",mirror:.66,
 belt:[[0,9.4],[.08,10.6],[.2,11.2],[.4,11.2],[.62,11],[.72,10.6],[.88,9.6],[.97,8.8],[1,8]],hood:{from:.64,dz:1.3,inner:6.2},
 roof:[[.17,11.2],[.24,12.8],[.34,15.6],[.43,17.2],[.54,17.2],[.6,15.8],[.67,11]],
 hw:[[0,10.6],[.05,11.4],[.14,11.5],[.36,11.5],[.42,10.6],[.62,10.6],[.7,11],[.93,11],[1,10.4]],
 deco(V,M){const {W,cy,L}=M;
  // raised wings with round headlights
  [4,W-5].forEach(yc=>{for(let x=L-8;x<=L-3;x++)for(let y=yc-2;y<=yc+2;y++)for(let z=7;z<=11;z++)if(Math.hypot(y-yc,(z-9.2)*1.1)<=2.4||z<=9)V.set(x,y,z,M.body);
   rnd(V,0,yc+.5,9.5,1.5,LENS,CHROME,(y,z,c)=>M.front(y,z,c))});
  for(let y=1;y<W-1;y++){M.bump(y,5,RUBBER,1);M.front(y,4,"#2a2b30");M.bump(y,5,RUBBER,-1)}
  [2,W-3].forEach(y=>M.front(y,6,AMBER));
  // whale-tail spoiler
  for(let x=1;x<=7;x++)for(let y=1;y<W-1;y++){V.set(x,y,12,M.body);V.set(x,y,13,M.body)}
  for(let y=1;y<W-1;y++){V.set(1,y,13,RUBBER);V.set(1,y,14,RUBBER);V.set(2,y,14,M.body);V.set(3,y,14,M.body)}
  for(let x=4;x<=6;x++)for(let y=4;y<W-4;y+=3)V.set(x,y,13,"#3a3a3e");
  for(let y=1;y<W-1;y++){M.back(y,9,y===Math.round(cy)?"#222":RED);M.back(y,8,"#7a0d16")}
  for(let y=Math.round(cy-3);y<=Math.round(cy+3);y++)M.back(y,6,"#f2f2f2");
  [.42,.62].forEach(u=>{const x=Math.round(u*L);for(let z=4;z<=10;z++)M.side(x,z,sh(M.body,.86))});M.handle(.58,10)}},
{id:"f40",n:"Ferrari F40",c:600,col:"#d0161e",L:57,W:25,R:4.2,axle:[.22,.78],inset:[[0,4],[.5,3.4],[1,3.6]],pillars:[],rim:"star",mirror:.6,
 belt:[[0,10.6],[.1,10.8],[.3,10.4],[.5,9.6],[.68,8.6],[.84,7.4],[.95,6.4],[1,5.6]],roof:[[.3,10.4],[.38,13.6],[.5,14.2],[.56,13.4],[.62,9.4]],
 hw:[[0,12],[.95,12],[1,11.2]],
 deco(V,M){const {W,cy,L}=M;
  for(let x=1;x<=6;x++)for(let y=0;y<W;y++)V.set(x,y,15,x>1?M.body:RUBBER);
  for(let x=1;x<=6;x++)[0,W-1].forEach(y=>{for(let z=13;z<=16;z++)V.set(x,y,z,M.body)});
  [5,W-6].forEach(y=>{for(let z=11;z<=14;z++)V.set(4,y,z,"#1b1c20")});
  for(let x=8;x<17;x+=2)for(let y=3;y<W-3;y++)M.top(x,y,"#151619",false);
  for(let y=1;y<W-1;y++)for(let z=3;z<=10;z++)M.back(y,z,"#1b1c20");
  [3.5,7.5,W-3.5,W-7.5].forEach(yc=>rnd(V,0,yc,8,1.3,RED,"#3a3c42",(y,z,c)=>M.back(y,z,c)));
  for(let y=2;y<W-2;y++){M.front(y,3,"#1b1c20");M.front(y,4,y%3?"#1b1c20":"#3a3c42")}[2,W-3].forEach(y=>M.front(y,5,"#ffb02e"));
  const ix=Math.round(.36*L);for(let x=ix;x<ix+4;x++)for(let z=6;z<=9;z++)M.side(x,z,"#151619");
  [cy-4,cy+4].forEach(y=>{for(let x=Math.round(.78*L);x<Math.round(.84*L);x++)M.top(x,Math.round(y),"#151619",false)})}}];
const carById=id=>CARS.find(c=>c.id===id);

const carCache={};
function buildCar(M,col){const key=M.id+(col||"");if(carCache[key])return carCache[key];
 const L=M.L,W=M.W,cy=(W-1)/2,body=col||M.col,V=new Vox(L,W,30),GZ=2,x0=1,x1=L-2;
 const bt=[],rfA=[],hwA=[],hwcA=[];let rfMax=0;
 const pc=(x,y,z)=>M.paint&&!col?M.paint(x,y,z):body;
 for(let x=x0;x<=x1;x++){const u=(x-x0+.5)/(x1-x0+1),b=interp(M.belt,u);if(b===null)continue;
  const rf=interp(M.roof,u),hw=interp(M.hw,u)??W/2,hwc=hw-(interp(M.inset,u)??2);hwA[x]=hw;hwcA[x]=hwc;bt[x]=[];
  rfA[x]=rf===null?-1:Math.round(rf);rfMax=Math.max(rfMax,rfA[x]);
  for(let y=0;y<W;y++){const dy=Math.abs(y-cy)+.5;if(dy>hw)continue;const ed=Math.min(x-x0,x1-x);
   if(ed===0&&dy>hw-2)continue;if(ed===1&&dy>hw-1)continue;
   let b2=b;if(M.hood&&u>M.hood.from&&dy<M.hood.inner)b2=b-M.hood.dz;const B=Math.round(b2);bt[x][y]=B;
   for(let z=GZ;z<=B;z++){if(!M.boxy&&((z===B&&dy>hw-1)||(z===GZ&&dy>hw-1)))continue;V.set(x,y,z,pc(x,y,z))}
   if(rf!==null&&rf>b2&&dy<=hwc){const T=Math.round(rf);for(let z=B+1;z<=T;z++){if(!M.boxy&&z===T&&dy>hwc-1)continue;V.set(x,y,z,pc(x,y,z))}}}}
 // glass
 if(!M.flatGlass)for(let x=x0;x<=x1;x++){if(!(rfA[x]>0))continue;const u=(x-x0+.5)/(x1-x0+1),hwc=hwcA[x];
  const slope=rfA[x]<rfMax-.5||Math.abs((rfA[x-1]??rfA[x])-rfA[x])>=1||Math.abs((rfA[x+1]??rfA[x])-rfA[x])>=1;
  const pil=M.pillars.some(p=>Math.abs(u-p)<.6/L);
  for(let y=0;y<W;y++){const B=bt[x][y];if(B===undefined)continue;const dy=Math.abs(y-cy)+.5,edge=dy>hwc-1.3;
   for(let z=B+1;z<=rfA[x];z++){if(!V.s(x,y,z))continue;const top=z===rfA[x]||!V.s(x,y,z+1)&&z>=rfA[x]-1;
    const side=!V.s(x,y-1,z)||!V.s(x,y+1,z),fr=!V.s(x+1,y,z),bk=!V.s(x-1,y,z);
    if(side&&!top&&!pil&&z<rfA[x])V.set(x,y,z,GLASS);
    else if((fr||bk)&&!edge&&z<rfA[x])V.set(x,y,z,GLASS);
    else if(top&&slope&&!edge)V.set(x,y,z,GLASS)}}}
 // underside, arches, wheels
 for(let x=3;x<L-3;x++)for(let y=3;y<W-3;y++)if(V.s(x,y,2))V.set(x,y,1,"#121316");
 const isT=new Set();
 M.axle.forEach(au=>{const cx=x0+au*(x1-x0+1),R=M.R,hw=interp(M.hw,au)??W/2,yo=Math.max(0,Math.round(cy-hw+.6)),yi=Math.min(W-1,Math.round(cy+hw-.6));
  for(let x=Math.floor(cx-R-2);x<=cx+R+2;x++)for(let z=0;z<=Math.ceil(2*R+2);z++){const d=Math.hypot(x+.5-cx,z+.5-R);
   if(d<=R+.75)for(let y=0;y<W;y++)if(y<yo+5||y>yi-5)V.set(x,y,z,-1);
   if(d<=R)for(let k=0;k<4;k++)[yo+k,yi-k].forEach(y=>{let c=TIRE;if(k===0){c=d<=R-1.3?RIMS[M.rim||"steel"](x+.5-cx,z+.5-R,d,R,M):(d>R-.7?"#202126":TIRE)}V.set(x,y,z,c);isT.add(x+","+y+","+z)})}});
 // surface painters for decorations
 const C={L,W,cy,body,two:M.two,axle:M.axle,R:M.R,isTire:(x,y,z)=>isT.has(x+","+y+","+z),
  out:(x,y,z,c)=>V.set(x,y,z,c),
  front:(y,z,c)=>{for(let x=L-1;x>=0;x--)if(V.s(x,y,z)){V.set(x,y,z,c);return x}return -1},
  back:(y,z,c)=>{for(let x=0;x<L;x++)if(V.s(x,y,z)){V.set(x,y,z,c);return x}return -1},
  top:(x,y,c,onlyBody)=>{for(let z=V.Z-1;z>=0;z--)if(V.s(x,y,z)){if(!onlyBody||V.get(x,y,z)===hexN(body))V.set(x,y,z,c);return z}return -1},
  side:(x,z,c)=>{for(let y=0;y<W;y++)if(V.s(x,y,z)){if(!isT.has(x+","+y+","+z))V.set(x,y,z,c);break}for(let y=W-1;y>=0;y--)if(V.s(x,y,z)){if(!isT.has(x+","+y+","+z))V.set(x,y,z,c);break}},
  bump:(y,z,c,dir)=>{if(dir>0){for(let x=L-2;x>=0;x--)if(V.s(x,y,z)){V.set(x+1,y,z,c);return}}else{for(let x=1;x<L;x++)if(V.s(x,y,z)){V.set(x-1,y,z,c);return}}},
  handle:(u,z)=>{const x=Math.round(x0+u*(x1-x0+1));C.side(x,z,CHROME);C.side(x+1,z,CHROME)}};
 C.M=M;Object.assign(C,{front:C.front});
 M.deco&&M.deco(V,C);
 if(M.mirror){const x=Math.round(x0+M.mirror*(x1-x0+1)),hw=hwcA[x]??W/2-3,z=(bt[x]&&bt[x][Math.round(cy)])+1||11;
  [Math.round(cy-hw-.5),Math.round(cy+hw+.5)].forEach(y=>{V.set(x,y,z,body);V.set(x,y,z+1,body);V.set(x-1,y,z+1,RUBBER)})}
 return carCache[key]=V}

// flat side-view sprite for the street (step = voxels per pixel)
const sideCache={};
function carSide(M,col,flip,step=1.45){const key=M.id+(col||"")+(flip?1:0)+step;if(sideCache[key])return sideCache[key];
 const V=buildCar(M,col);let top=0;for(let z=V.Z-1;z>=0&&!top;z--)for(let x=0;x<V.X&&!top;x++)for(let y=0;y<V.Y;y++)if(V.s(x,y,z)){top=z;break}
 const w=Math.ceil(V.X/step),h=Math.ceil((top+1)/step),c=layer(w,h),g=c.getContext("2d");
 for(let px=0;px<w;px++)for(let pz=0;pz<h;pz++){const x=Math.min(V.X-1,Math.floor(px*step)),z=Math.min(top,Math.floor(pz*step));
  for(let y=V.Y-1;y>=0;y--){const v=V.get(x,y,z);if(v<0)continue;const depth=V.Y-1-y,f=1-Math.min(.35,depth*.03);
   g.fillStyle=`rgb(${(v>>16&255)*f|0},${(v>>8&255)*f|0},${(v&255)*f|0})`;g.fillRect(px,h-1-pz,1,1);break}}
 const out=flip?flipped(c):c;return sideCache[key]=out}
