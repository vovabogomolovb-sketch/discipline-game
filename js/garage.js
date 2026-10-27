"use strict";
// ================= GARAGE (voxel) =================
const GTAG=["","car","door","neon","road","tube"];
const GST={road:[46,6.5,2,"study"],door:[8,6.5,1,"idle"]};
const GIDLE=[[30,6.5],[20,6.5],[54,7],[12,6.5]];
function buildGarage(h,ctx={}){
 const NX=66,NY=40,Z=32,V=new Vox(NX,NY,Z),R=rng(23);
 const lights=[],glows=[],spots={},T=n=>{V.tag=GTAG.indexOf(n)};
 // checkered floor
 for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){V.set(x,y,0,"#3a3c42");const w=((x>>2)+(y>>2))%2;V.set(x,y,1,w?"#ecebe7":"#1f2024")}
 // oil stain
 for(let i=0;i<14;i++){const x=30+R()*8|0,y=20+R()*5|0;V.set(x,y,1,"#141418")}
 // left wall: concrete with roller door; right wall: brick
 for(let z=2;z<Z;z++){for(let y=0;y<NY;y++){V.set(0,y,z,"#7d8188");V.set(1,y,z,sh("#a2a6ad",.95+R()*.08))}
  for(let x=0;x<NX;x++){V.set(x,0,z,"#6b2a1e");const row=(z-2)>>1,off=row%2?2:0,mort=((z-2)%2===1)||((x+off)%5===0);
   V.set(x,1,z,mort?"#cfc4b4":["#a2442f","#8f3a28","#b04d35","#9b4030"][(x*7+row*3)%4])}}
 for(let x=0;x<NX;x++)V.set(x,1,2,"#5c5f66");for(let y=0;y<NY;y++)V.set(1,y,2,"#5c5f66");
 // roller door (exit to the street)
 const dy0=14,dy1=30;for(let y=dy0;y<=dy1;y++)for(let z=2;z<=19;z++)V.set(2,y,z,z%2?"#b9bdc4":"#a5a9b0");
 for(let z=2;z<=21;z++){V.set(2,dy0-1,z,"#4b4e55");V.set(2,dy1+1,z,"#4b4e55")}for(let y=dy0-1;y<=dy1+1;y++){V.set(2,y,20,"#4b4e55");V.set(2,y,21,"#4b4e55")}
 T("door");for(let y=dy0;y<=dy1;y++)for(let z=2;z<=19;z++)V.set(2,y,z,z%2?"#b9bdc4":"#a5a9b0");V.box(3,dy0+6,4,1,5,1,"#5c5f66");spots.door=[3,(dy0+dy1)/2,10];T("");
 // fluorescent tubes
 T("tube");const tube=S.tg.tube!==0;
 [[4,16],[44,60]].forEach(([a,b])=>{V.box(a,2,28,b-a,1,1,"#3a3c42");V.box(a,3,28,b-a,1,1,tube?"#f4f8ff":"#9aa0a8",tube?1:0);if(tube)lights.push({x:(a+b)/2,y:6,z:27,c:[.85,.92,1],r:26,i:.9,glow:8})});
 for(let y=6;y<36;y+=14){V.box(2,y,28,1,8,1,"#3a3c42");V.box(3,y,28,1,8,1,tube?"#f4f8ff":"#9aa0a8",tube?1:0);if(tube)lights.push({x:6,y:y+4,z:27,c:[.85,.92,1],r:22,i:.6,glow:6})}
 T("");
 // ---- items ----
 if(has("g_tires")){V.box(2,2,2,1,6,18,"#2b2d33");V.box(10,2,2,1,6,18,"#2b2d33");[2,8,14].forEach(z=>V.box(2,2,z,9,6,1,"#3a3c42"));
  [3,9,15].forEach(z0=>[4,7].forEach(cx=>{for(let x=cx-2;x<=cx+2;x++)for(let z=z0;z<=z0+5;z++){const d=Math.hypot(x+.5-(cx+.5),z+.5-(z0+2.5));if(d<=2.7)for(let y=3;y<=6;y++)V.set(x,y,z,y===6&&d<1.3?"#8b8f96":TIRE)}}))}
 if(has("g_chest")){V.box(13,2,2,7,5,12,"#c8202b");for(let z=4;z<14;z+=2)for(let x=13;x<20;x++)V.set(x,7-1,z,"#8f1520");
  for(let z=3;z<14;z+=2)V.box(15,7,z,3,1,1,"#d9dde3");V.box(13,2,14,7,5,1,"#2b2d33");V.box(14,3,15,3,1,1,"#9aa0a8");V.box(18,4,15,1,2,2,"#e0b04a");
  V.box(13,7,2,1,1,1,"#111");V.box(19,7,2,1,1,1,"#111")}
 if(has("g_bench")){V.box(22,2,9,12,6,2,"#9a6a3f");[[22,2],[33,2],[22,7],[33,7]].forEach(([x,y])=>V.box(x,y,2,1,1,7,"#3a3c42"));V.box(22,2,4,12,6,1,"#3a3c42");
  V.box(23,3,11,3,2,2,"#2e5f9e");V.box(29,4,11,2,2,3,"#c8202b");V.box(31,3,11,1,1,4,"#e0b04a");
  V.box(21,2,13,15,1,10,"#c9a675");for(let x=22;x<35;x+=2)for(let z=14;z<22;z+=2)V.set(x,2,z,"#a88a5c");
  [[23,"#9aa0a8",7],[26,"#9aa0a8",5],[29,"#c8202b",4],[31,"#e0b04a",4],[33,"#9aa0a8",6]].forEach(([x,c,len])=>{for(let z=21-len;z<=20;z++)V.set(x,3,z,c)});
  V.box(25,3,19,3,1,1,"#9aa0a8");V.set(29,3,20,"#9aa0a8");V.set(31,3,20,"#9aa0a8")}
 T("neon");
 if(has("g_neon")){const t="ГАРАЖ",on=S.tg.neon!==0;V.text(t,46-ptw(t)/2|0,2,18,on?"#5ff5ff":"#3d5a63","x",on?1:0);if(on)lights.push({x:46,y:5,z:20,c:[.35,.95,1],r:16,i:.9,glow:4})}
 if(has("g_posters")){[[32,10,"#d9711c"],[32,17,"#d0161e"]].forEach(([y0,z0,c])=>{for(let y=y0;y<y0+6;y++)for(let z=z0;z<z0+5;z++){const ed=y===y0||y===y0+5||z===z0||z===z0+4;V.set(2,y,z,ed?"#1d1d21":(z===z0+2&&y>y0&&y<y0+5)?c:(z===z0+1?"#555":"#e9e2d6"))}})}
 T("road");{const s2=objStage("road");
  if(s2>=1)[[40,10],[43,11]].forEach(([x,z])=>{V.box(x,2,z,2,1,3,"#f4f4f4");V.set(x,2,z+2,"#c0141f");V.set(x+1,2,z+1,"#555")});
  if(s2>=2){for(let x=46;x<=49;x++)for(let z=11;z<=14;z++){const d=Math.hypot(x+.5-48,z+.5-12.5);if(d<=2)V.set(x,2,z,d<1.2?(z===12||z===13)&&x>46&&x<49?"#f4f4f4":"#c0141f":"#c0141f")}}
  if(s2>=3){V.box(51,2,9,4,1,3,"#f4b8c8");V.set(51,2,10,"#3f6fb5");V.set(53,2,11,"#555");V.set(54,2,10,"#555")}
  if(s2>=4){V.box(55,4,2,3,3,1,"#e8701c");V.box(56,5,3,1,1,4,(x,y,z)=>z===5?"#f4f4f4":"#e8701c")}
  if(s2>=5){for(let x=40;x<=44;x++)for(let z=15;z<=17;z++)if(Math.abs(x-42)<=z-15)V.set(x,2,z,z===15||Math.abs(x-42)===z-15?"#c0141f":"#f4f4f4")}
  if(s2>=6){V.box(44,4,2,2,2,1,"#2b2d33");V.box(44,4,3,2,2,1,"#c9a227");V.blob(45,5,5.2,1.3,1.3,1.4,"#e0c050")}}
 T("");
 // decor: oil drum, cone, wrench on the floor
 V.blob(62,6,6,2.6,2.6,5,(x,y,z)=>z%4===0?"#234b80":"#2e5f9e");V.box(60,36,2,3,3,1,"#e8701c");V.box(61,37,3,1,1,4,(x,y,z)=>z===4?"#f4f4f4":"#e8701c");
 V.box(52,37,2,5,1,1,"#9aa0a8");V.set(57,37,2,"#9aa0a8");V.set(57,36,2,"#9aa0a8");
 // car
 const lift=has("g_lift"),lz=lift?6:0;
 const M=S.car&&S.own["car_"+S.car]?carById(S.car):null,C=M?buildCar(M):null,cx=C?Math.round((NX-C.X)/2):8,cyy=12,cw=C?C.Y:24,cl=C?C.X:58;
 if(lift){[[cx,cyy-3],[cx,cyy+cw+1],[cx+cl-2,cyy-3],[cx+cl-2,cyy+cw+1]].forEach(([x,y])=>V.box(x,y,2,2,2,lz+3,"#2b5fb3"));V.box(cx+2,cyy-1,lz+1,cl-4,2,1,"#2b5fb3");V.box(cx+2,cyy+cw-1,lz+1,cl-4,2,1,"#2b5fb3")}
 T("car");if(C)V.stamp(C,cx,cyy,lz);T("");
 spots.car=C?{x0:cx,y0:cyy,z0:lz,L:C.X,W:C.Y}:null;
 if(C&&ctx.engine){[3.5,C.Y-3.5].forEach(yy=>{lights.push({x:cx+C.X+1,y:cyy+yy,z:lz+8,c:[1,.95,.8],r:16,i:1.3,glow:4});glows.push([cx+C.X,cyy+yy,lz+8,[1,.95,.8],3,.5])});
  lights.push({x:cx-1,y:cyy+C.Y/2,z:lz+7,c:[1,.15,.1],r:9,i:.9,glow:3})}
 const nt=night(h);
 const amb=S.tg.tube!==0?[.62,.64,.7]:[.3,.31,.38];
 return{V,lights,glows,amb,spots,hasCar:!!M,stations:GST,idle:GIDLE}}
