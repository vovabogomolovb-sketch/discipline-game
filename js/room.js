"use strict";
// ================= ROOM (voxel) =================
// 46 (x, along the right wall) × 40 (y, along the left wall) × 32. Zones: work (right wall), sleep (left wall), gym (front), chill (right front).
const WARM=[1,.74,.42],WARM2=[1,.82,.55],COOL=[.62,.7,1];
// tags let a tap on the picture know which thing was hit (see voxRender buf)
const RTAG=["","lamp","curtain","monitor","night","cat","window","door","books","gym","candle","cards","notes","plant","records","bed","guitar","ward","bean","desk"];
const TG=n=>RTAG.indexOf(n);
// where the hero stands for each activity: [x, y, face, pose]
const RST={candle:[4.5,6.8,2,"pray"],books:[8,21,0,"read"],cards:[14,17,2,"study"],notes:[9,12,2,"study"],gym:[30,36.6,0,"gym"],plant:[37.5,31.5,1,"water"],door:[28,7,2,"idle"]};
const RIDLE=[[24,12],[20,28],[34,23],[28,14],[11,20],[24,33]];
const DX=6; // desk origin along x
function buildRoom(h,ctx={}){
 const NX=46,NY=40,Z=32,V=new Vox(NX,NY,Z),R=rng(17),nt=night(h),nl=ctx.nl||0,sleep=!!ctx.sleep,tg=S.tg;
 const own=id=>has(id)||ctx.preview===id;
 const lights=[],glows=[],spots={};
 const wilt=c=>nl?mix(c,"#a8904a",Math.min(.75,.2+.2*nl)):c;
 const T=n=>{V.tag=TG(n)};
 // floor slab + planks
 const PL=["#b98b5c","#ad7f52","#c29364","#b3865a"];
 for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){V.set(x,y,0,"#5e4330");const p=Math.floor(y/3),seam=((x+p*7)%13)===0;
  V.set(x,y,1,seam?"#8d643f":sh(PL[p%4],.96+R()*.08))}
 // walls (left x=0..1, right y=0..1)
 for(let z=2;z<Z;z++){for(let i=0;i<NY;i++){const lw=(i%5===2&&z%5===2)?"#d8cfc1":"#ebe4d8";V.set(0,i,z,"#cfc6b8");V.set(1,i,z,z<4?"#f7f4ef":lw)}
  for(let i=0;i<NX;i++){const rw=(i%6===3&&z%6===3)?"#d3c9ba":"#e3dbce";V.set(i,0,z,"#cfc6b8");V.set(i,1,z,z<4?"#f7f4ef":rw)}}
 // ---- window (left wall) with sky ----
 T("window");const [sa,sb]=sky(h),wy0=7,wy1=15,wz0=12,wz1=23;
 for(let y=wy0;y<=wy1;y++)for(let z=wz0;z<=wz1;z++){V.set(1,y,z,-1);const t=(z-wz0)/(wz1-wz0);let c=mix(sb,sa,t);
  if(nt>.5&&((y*7+z*3)%11===0))c="#fff6d6";
  if(nt<=.5&&z>=wz0+5&&z<=wz0+6&&y>=wy0+2&&y<=wy0+5)c="#ffffff";
  if(z<=wz0+2)c=nt>.5?"#151a33":"#5f8f6a";
  V.set(0,y,z,c,1)}
 if(nt>.5){V.set(0,wy0+5,wz1-3,"#f4efd8",1);V.set(0,wy0+6,wz1-3,"#f4efd8",1);V.set(0,wy0+5,wz1-2,"#f4efd8",1)}
 for(let y=wy0-1;y<=wy1+1;y++){V.set(2,y,wz0-1,"#ffffff");V.set(3,y,wz0-1,"#f2efe9");V.set(2,y,wz1+1,"#ffffff")}
 for(let z=wz0;z<=wz1;z++){V.set(2,wy0-1,z,"#ffffff");V.set(2,wy1+1,z,"#ffffff");V.set(1,Math.round((wy0+wy1)/2),z,"#ffffff")}
 for(let y=wy0;y<=wy1;y++)V.set(1,y,Math.round((wz0+wz1)/2),"#ffffff");
 V.set(4,wy0+1,wz0-1,"#c86a4a");V.set(4,wy0+1,wz0,wilt("#4f9a58"));V.set(4,wy0+1,wz0+1,wilt("#6fbf6a"));V.set(4,wy0+2,wz0,wilt("#4f9a58"));
 // curtains (tap to open/close)
 T("curtain");const closed=!!tg.curtain;for(let y=wy0-3;y<=wy1+3;y++)V.set(3,y,wz1+3,"#3a3330");
 const cur=(y,z)=>{V.set(2,y,z,(y+z)%3?"#d9c3a3":"#cbb393");V.set(3,y,z,y%2?"#d9c3a3":"#c4ab8a")};
 if(closed){for(let y=wy0-2;y<=wy1+2;y++)for(let z=wz0-2;z<=wz1+2;z++)cur(y,z)}
 else[[wy0-2,wy0-1],[wy1+1,wy1+2]].forEach(([a,b])=>{for(let y=a;y<=b;y++)for(let z=wz0-2;z<=wz1+2;z++)cur(y,z)});
 // daylight beam through the window
 let beam=null,beamC=[1,.9,.7];
 if(nt<.7&&!closed){const k=(1-nt)*.55,warm=h<8||h>16.5;beamC=warm?[1,.72,.42]:[1,.95,.85];
  beam=(x,y,z,f)=>{if(x<2)return 0;const t=(x-1.5),yw=y-.25*t,zw=z+.85*t;return(yw>=wy0&&yw<=wy1+1&&zw>=wz0&&zw<=wz1+1)?k:0}}
 // ---- door (right wall, to the street) ----
 T("door");const dx0=26,dx1=30;for(let x=dx0;x<=dx1;x++)for(let z=2;z<=19;z++)V.set(x,1,z,(z===10||z===16)?"#7a4e33":"#8d5c3d");
 for(let z=2;z<=20;z++){V.set(dx0-1,2,z,"#f6f3ee");V.set(dx1+1,2,z,"#f6f3ee")}for(let x=dx0-1;x<=dx1+1;x++)V.set(x,2,20,"#f6f3ee");
 V.set(dx1-1,2,11,"#d9b26b");spots.door=[(dx0+dx1)/2,2,11];
 T("");V.box(dx0-1,3,2,7,3,1,(x,y)=>(x+y)%2?"#8a6e52":"#7a5f45");
 // ================= HABIT OBJECTS (grow with completions) =================
 const st=o=>objStage(o);
 // prayer corner (left-back corner)
 T("candle");{const s=st("candle");if(s>=1){V.box(2,2,13,3,2,1,"#8a5a3c");V.box(3,2,14,1,1,2,"#f4efe2");V.set(3,2,16,"#ffb347",1);lights.push({x:3.5,y:3,z:16,c:[1,.7,.35],r:7+s*1.5,i:.55+.08*s,glow:2+s*.4})}
  if(s>=2){for(let y=2;y<=3;y++)for(let z=18;z<=22;z++)V.set(2,y,z,(z===18||z===22)?"#c9a227":(z===20&&y===2)?"#f0c9a0":"#6b3a1e")}
  if(s>=3){V.box(4,2,14,1,1,1,"#f4efe2");V.set(4,2,15,"#ffb347",1);V.set(2,3,24,"#d4243a",1);V.set(2,3,25,"#c9a227")}
  if(s>=4){V.box(2,2,2,3,2,7,"#7a4e33");V.box(2,2,9,3,2,1,"#f4efe2")}
  if(s>=5){V.box(3,2,10,2,2,1,"#3a2212");V.set(3,3,11,"#c9a227")}
  if(s>=6){V.set(4,3,10,"#ffb347",1);glows.push([3.5,3,19,[1,.8,.4],3,.25])}}
 // bookshelf (left wall)
 T("books");{const s=st("books"),y0=19,y1=23;if(s>=1){for(let z=2;z<=22;z++){[y0,y1].forEach(y=>{V.set(2,y,z,"#8a5a3c");V.set(3,y,z,"#8a5a3c");V.set(4,y,z,"#9a6a46")})}
   [2,7,12,17,22].forEach(z=>V.box(2,y0,z,3,y1-y0+1,1,"#9a6a46"));V.box(2,y0+1,3,1,y1-y0-1,19,"#6e4630");
   const fill=[0,2,4,6,8,10,12][s],bk=["#b84a4a","#3f6fb5","#e0b04a","#4a8a5c","#8a5ab5","#e8e2d6","#d9711c","#2f4a7a"];let n=0;
   for(const z of [3,8,13,18])for(let y=y0+1;y<y1;y++){if(n>=fill)break;V.box(3,y,z,2,1,3+((y+z)%2),bk[(n*3+z)%8]);n++}
   if(s>=6){V.box(3,y0+1,23,1,1,2,"#c9a227");V.set(3,y0+1,25,"#e0c050");V.blob(3.5,y1-1,24.5,1.2,1.2,1.3,wilt("#4fa35c"))}}}
 // English: cards, globe, map
 const desk=own("r_desk");
 T("cards");{const s=st("cards");if(s>=1&&desk){V.box(DX,4,12,2,2,1,"#f4f4f4");V.set(DX,4,12,"#4a7ac9")}
  if(s>=2&&desk){V.box(DX,4,13,2,2,1,"#f4f4f4");V.box(DX+2,6,12,1,2,1,"#f2d06b");V.set(DX,3,24,"#f2d06b");V.set(DX+16,3,24,"#7be38a")}
  if(s>=3&&desk){V.box(DX+2,3,12,1,1,1,"#2b2d33");V.set(DX+2,3,13,"#2b2d33");V.blob(DX+2.5,3.5,15.2,1.4,1.4,1.4,(x,y,z)=>(x+z)%3?"#3f86d6":"#4fa35c")}
  if(s>=4){for(let y=19;y<=23;y++)for(let z=24;z<=30;z++){const ed=y===19||y===23||z===24||z===30;V.set(2,y,z,ed?"#e9e2d6":((y*3+z*5)%7<3?"#4fa35c":"#3f6fb5"))}}
  if(s>=5&&desk){V.box(DX+3,7,12,3,1,1,"#2b2d33");V.set(DX+3,7,13,"#2b2d33");V.set(DX+5,7,13,"#2b2d33")}
  if(s>=6){V.set(2,21,31,"#3a3330");for(let y=20;y<=22;y++)V.set(2,y,30,y===21?"#c0141f":"#f4f4f4")}}
 // notes board above the desk
 T("notes");{const s=st("notes");if(s>=1){for(let x=DX;x<=DX+7;x++)for(let z=25;z<=31;z++){const ed=x===DX||x===DX+7||z===25||z===31;V.set(x,2,z,ed?"#8a5a3c":"#c9a675")}
   const cnt=[0,2,4,6,9,12,15][s],nc=["#f2d06b","#7fd4ff","#ff9a9a","#a7f070","#ffffff"],sp2=[[1,26],[3,29],[5,27],[1,29],[4,26],[6,29],[2,27],[5,30],[3,26],[6,26],[1,30],[2,29],[4,28],[5,28],[6,27]];
   for(let i=0;i<cnt;i++){const [x,z]=sp2[i];V.set(DX+x,2,z,nc[i%5])}
   if(s>=5)[[2,27],[3,28],[4,27]].forEach(([x,z])=>V.set(DX+x,2,z,"#c0141f"))}}
 // gym zone (front)
 T("gym");{const s=st("gym");if(s>=1)V.box(27,31,2,7,3,1,(x,y)=>(x+y)%2?"#7b5ab5":"#6e4fa6");
  if(s>=2){[[27,35],[30,35]].forEach(([x,y])=>{V.box(x,y,2,1,1,1,"#2b2d33");V.box(x+1,y,2,1,1,1,"#9aa0a8");V.box(x+2,y,2,1,1,1,"#2b2d33")})}
  if(s>=3){V.blob(35,33,3.4,1.3,1.3,1.3,"#2b2d33");V.set(35,33,5,"#2b2d33")}
  if(s>=4){[27,33].forEach(x=>V.box(x,38,2,1,1,20,"#3a3c42"));V.box(27,38,22,7,1,1,"#9aa0a8");V.box(27,37,2,1,3,1,"#3a3c42");V.box(33,37,2,1,3,1,"#3a3c42")}
  if(s>=5){V.box(28,31,4,5,2,1,"#2b2d33");[28,32].forEach(x=>V.box(x,31,2,1,2,2,"#55585f"))}
  if(s>=6){V.box(37,29,2,2,2,13,"#b13e53");V.box(37,29,15,2,2,1,"#2b2d33");V.set(37,29,16,"#9aa0a8")}}
 // growing plant (generic habit object)
 T("plant");{const s=st("plant");if(s>=1){V.box(40,31,2,2,2,3,"#c86a4a");for(let z=5;z<5+s*2;z++)V.set(40,31,z,wilt("#3f7a3c"));
  V.blob(40.5,31.5,4.5+s*2,.9+s*.35,.9+s*.35,.8+s*.25,wilt("#4fa35c"));if(s>=5){V.set(41,31,5+s*2,"#ff6b8a");V.set(39,32,4+s*2,"#ffd27a")}}}
 // ================= BOUGHT FURNITURE =================
 if(desk){T("desk");V.box(DX,2,11,18,7,1,"#f3f0ea");V.box(DX,2,2,4,7,9,"#f1eee8");
  [5,8].forEach(z=>{for(let x=DX;x<=DX+3;x++)V.set(x,8,z,"#d6d0c6")});[4,7,10].forEach(z=>V.set(DX+2,8,z-1,"#9aa0a8"));
  [[DX+17,2],[DX+17,8]].forEach(([x,y])=>V.box(x,y,2,1,1,9,"#d6d0c6"));
  T("monitor");V.box(DX+7,3,12,3,2,1,"#c9cdd3");V.box(DX+8,2,13,1,1,3,"#c9cdd3");
  V.box(DX,2,15,17,1,9,"#d5d8dd");V.box(DX,3,15,17,1,2,"#e8eaee");
  const on=tg.monitor&&!sleep;
  for(let x=DX;x<=DX+16;x++)for(let z=17;z<=23;z++){if(!on){V.set(x,3,z,"#11131a");continue}const t=(z-17)/6;let c=mix("#f08a5d","#5b3fa0",t);if(z<=18&&(x*3+z)%7<4)c="#3b2a6b";V.set(x,3,z,c,1)}
  if(on){const d=new Date(),ts=pad(d.getHours())+":"+pad(d.getMinutes());let tx=DX+1;
   for(const ch of ts){const g=GL[ch];g.forEach((ln,j)=>[...ln].forEach((v,i)=>{if(v==="#")V.set(tx+i,3,22-j,"#ffffff",1)}));tx+=g[0].length+(ch===":"?0:1)}
   lights.push({x:DX+8,y:4.5,z:20,c:[.75,.55,1],r:12,i:.55,glow:6})}
  T("desk");V.box(DX+5,5,12,8,2,1,(x,y)=>(x+y)%2?"#f6f6f6":"#e4e4e4");V.set(DX+13,6,12,"#f6f6f6");
  V.box(DX+15,3,12,2,2,3,"#f4f4f4");V.set(DX+15,3,14,"#5a3a22");V.set(DX+16,4,14,"#5a3a22")}
 if(own("r_lamp")){T("lamp");const on=tg.lamp&&!sleep,lx=desk?DX+15:41,ly=desk?6:24,lz=desk?12:2;
  V.box(lx,ly,lz,3,2,1,"#2b2d33");V.box(lx+1,ly,lz+1,1,1,6,"#2b2d33");V.box(lx-2,ly-1,lz+6,4,3,2,"#2b2d33");V.set(lx-1,ly,lz+5,on?"#ffd99a":"#b8a98a",on?1:0);V.set(lx,ly,lz+5,on?"#ffd99a":"#b8a98a",on?1:0);
  if(on)lights.push({x:lx-.5,y:ly+1,z:lz+4,c:WARM,r:17,i:nl>=3?.8:1.45,glow:7})}
 if(own("r_chair")){T("desk");const cx=DX+8;V.box(cx,12,2,1,1,4,"#55585f");V.box(cx-2,12,2,5,1,1,"#2b2d33");V.box(cx,10,2,1,5,1,"#2b2d33");
  V.box(cx-2,10,6,5,5,2,"#3a3d48");V.box(cx-2,14,8,5,1,7,"#3a3d48");V.box(cx-1,14,15,3,1,1,"#3a3d48");V.box(cx-3,11,9,1,3,1,"#2b2d33");V.box(cx+3,11,9,1,3,1,"#2b2d33");V.box(cx-1,13,8,3,1,1,"#c94a4a")}
 if(own("r_shelf")){T("");const sx=DX+9;V.box(sx,2,24,8,3,1,"#c79a6e");V.box(sx,2,22,1,1,2,"#2b2d33");V.box(sx+7,2,22,1,1,2,"#2b2d33");
  const bk=["#b84a4a","#3f6fb5","#e0b04a","#4a8a5c"];for(let x=sx;x<=sx+2;x++)V.box(x,2,25,1,2,3+(x%2),bk[x%4]);
  V.box(sx+3,3,25,1,1,2,"#f2d06b");V.set(sx+3,3,27,"#f6c9a0");V.box(sx+4,3,25,1,1,2,"#4a7ac9");V.set(sx+4,3,27,"#f6c9a0")}
 if(own("r_sakura")){T("plant");const sx=DX+14;V.box(sx,2,25,3,3,2,"#2b2b30");V.box(sx+1,3,27,1,1,2,"#6b4228");V.set(sx+2,3,28,"#6b4228");
  V.blob(sx+1.5,3.5,29.6,2.4,2.1,1.7,(x,y,z,q)=>nl>=1?wilt("#f4a7c3"):q>.7?"#f7c6d8":(x+y+z)%3?"#f4a7c3":"#e98bb0");if(nl<1){V.set(sx-1,4,25,"#f4a7c3");V.set(sx+3,4,25,"#f7c6d8")}}
 if(own("r_ward")){T("ward");const wx=38;V.box(wx,2,2,6,7,23,"#f4f2ed");for(let z=2;z<25;z++)V.set(wx+2,8,z,"#dcd8d0");V.box(wx,2,25,6,7,1,"#e8e5de");
  [wx+2,wx+3].forEach(x=>{V.set(x,8,13,"#b8bcc2");V.set(x,8,14,"#b8bcc2")});V.box(wx,8,2,6,1,1,"#e1ddd5");
  V.box(wx+1,3,26,3,4,3,"#c9a36b");V.box(wx+1,5,29,2,2,1,"#d9b47b");V.box(wx+4,3,26,2,2,2,"#efece6");V.blob(wx+5,4,29,1.3,1.3,1.6,wilt("#5aa05f"))}
 if(own("r_bed")){T("bed");const y0=26;V.box(2,y0,2,14,10,3,"#b07f55");V.box(2,y0,5,14,10,2,"#f4f1ea");
  const bl=(x,y)=>((x+y)%4<2)?"#6f8fc9":"#7d9bd2";
  if(nl>=2&&!sleep){V.box(9,y0,7,7,6,1,bl);V.blob(17.5,y0+5,3,1.8,3,1.5,"#6f8fc9")}
  else{V.box(7,y0,7,9,10,1,bl);for(let z=4;z<=7;z++)for(let y=y0;y<y0+10;y++)V.set(16,y,z,(y+z)%4<2?"#6f8fc9":"#7d9bd2");for(let z=4;z<=7;z++)for(let x=7;x<=16;x++)V.set(x,y0+10,z,(x+z)%4<2?"#6f8fc9":"#7d9bd2")}
  V.box(2,y0,2,1,10,11,"#9c6d47");V.box(3,y0+1,7,4,4,2,"#ffffff");V.box(3,y0+5,7,4,4,2,"#f1ede6");
  if(sleep){V.box(4,y0+3,9,2,2,2,HC.skin);V.box(3,y0+3,9,1,2,2,HC.hair);V.box(4,y0+3,11,2,2,1,HC.hair);V.box(6,y0+2,8,8,4,1,"#7d9bd2");V.box(7,y0+2,9,5,4,1,"#6f8fc9")}}
 if(own("r_cat")){T("cat");const c=nl>=3?"#c9844a":"#e58a3a";if(own("r_bed")&&!sleep){V.box(12,30,8,3,2,1,c);V.box(14,30,8,2,2,2,c);V.set(14,30,10,c);V.set(15,31,10,c);V.set(15,30,9,"#222");V.box(10,31,8,2,1,1,c)}
  else{V.box(33,24,2,3,2,1,c);V.box(35,24,2,2,2,2,c);V.set(35,24,4,c);V.set(36,25,4,c)}}
 if(own("r_night")){T("night");const on=tg.night||sleep;V.box(2,24,2,4,2,6,"#f1eee8");V.set(5,25,5,"#9aa0a8");V.box(3,24,8,1,1,2,"#c9b28a");V.box(2,24,10,3,2,3,on?"#ffe2ad":"#d9ccb0",on?1:0);
  if(on)lights.push({x:4.5,y:25.5,z:11,c:WARM2,r:14,i:(sleep?.6:1.1)*(nl>=3?.6:1),glow:6})}
 if(own("r_poster")){T("");
  const frame=(y0,z0,w,hh,art)=>{for(let y=y0;y<y0+w;y++)for(let z=z0;z<z0+hh;z++){const ed=y===y0||y===y0+w-1||z===z0||z===z0+hh-1;V.set(2,y,z,ed?"#1d1d21":art(y-y0,z-z0))}};
  frame(26,16,6,8,(y,z)=>z<3?"#2f4a7a":z<5?"#f08a5d":(y===3&&z===5)?"#ffd27a":"#5b3fa0");
  frame(33,18,4,7,(y,z)=>z<3?"#e9e2d6":(y+z)%2?"#3a6fb0":"#73a9e0");
  frame(33,12,4,5,(y,z)=>(y===1||y===2)&&z>=1&&z<=3?"#c94a4a":"#f2efe9")}
 if(own("r_lights")){T("");const bulbs=["#ffd27a","#ffe9b0","#ffc56b"],on=!sleep&&nl<3;
  for(let y=3;y<NY;y++){const z=28-Math.round(1.6*Math.sin(Math.PI*((y-3)%8)/8));V.set(2,y,z,"#3a3330");if(y%2===0){V.set(3,y,z-1,on?bulbs[y%3]:"#8a7a5a",on?1:0);if(on)glows.push([3.5,y+.5,z-.5,WARM,1.6,.16])}}
  for(let x=3;x<NX;x++){const z=28-Math.round(1.6*Math.sin(Math.PI*((x-3)%8)/8));if(x>=37&&own("r_ward")&&z<27)continue;V.set(x,2,z,"#3a3330");if(x%2===0){V.set(x,3,z-1,on?bulbs[x%3]:"#8a7a5a",on?1:0);if(on)glows.push([x+.5,3.5,z-.5,WARM,1.6,.16])}}
  if(on)lights.push({x:4,y:12,z:26,c:WARM,r:15,i:.45},{x:4,y:30,z:26,c:WARM,r:15,i:.45},{x:18,y:4,z:26,c:WARM,r:15,i:.4},{x:34,y:4,z:26,c:WARM,r:15,i:.4})}
 if(own("r_rug")){T("");const cat=["..#.......#..",".##.......##.",".###########.","#############","###.o###o.###","######p######","#############",".###########.","..#########..","..##.....##.."];
  cat.forEach((ln,j)=>[...ln].forEach((v,i)=>{if(v===".")return;V.set(19+i,25-j,2,v==="o"?"#2b2b30":v==="p"?"#f4a7c3":((i+j)%2?"#f6f3ee":"#ece7de"))}))}
 if(own("r_plant")){T("plant");const px=41,py=12;V.box(px,py,2,3,3,4,"#efece6");V.box(px,py,6,3,3,1,"#6b4a30");
  [[1,1,9,2.4],[-.5,2.5,11,2.2],[2.5,.5,12,2.2],[1,2,14,2],[0,0,13,1.8]].forEach(([x,y,z,rr])=>V.blob(px+x,py+y,z-(nl>=1?1:0),rr,rr,1.2,(xx,yy,zz,q)=>wilt(q>.75?"#3f8f4e":((xx+yy)%3?"#2f7a40":"#4fa35c"))));
  for(let z=6;z<10;z++)V.set(px+1,py+1,z,wilt("#3f7a3c"))}
 if(own("r_guitar")){T("guitar");const gx=43,gy=22;[[5,2],[8,1.6]].forEach(([z,rr])=>{for(let y=gy-3;y<gy+3;y++)for(let zz=z-3;zz<=z+3;zz++)if(Math.hypot(y+.5-gy,zz+.5-z)<=rr){V.set(gx,y,zz,"#c8823a");V.set(gx+1,y,zz,"#c8823a")}});
  V.set(gx+1,gy-1,6,"#2a1a10");for(let z=10;z<=18;z++)V.set(gx+1,gy-1,z,"#5a3a22");V.box(gx+1,gy-1,19,1,1,2,"#3a2412");V.box(gx,gy-1,2,2,2,1,"#2b2d33")}
 if(own("r_bean")){T("bean");V.blob(38,18,4.2,3.4,3.2,2.6,(x,y,z,q)=>z>=6&&q<.45?"#d39248":"#e2a65a")}
 if(own("r_ac")){T("");V.box(2,wy0,26,3,wy1-wy0+1,4,"#f3f2ef");for(let y=wy0;y<=wy1;y++)V.set(4,y,26,"#cfcfcf");V.set(4,wy1-1,28,"#5fe08a",1)}
 if(own("r_records")){T("records");[[27,26,2.2,"#e05a4a"],[30.8,25.5,1.9,"#4a8ad9"]].forEach(([x0,z0,rr,lab])=>{for(let x=Math.floor(x0-rr);x<=x0+rr;x++)for(let z=Math.floor(z0-rr);z<=z0+rr;z++){const d=Math.hypot(x+.5-x0,z+.5-z0);if(d<=rr)V.set(x,2,z,d<.9?lab:"#16161a")}})}
 // ================= NEGLECT =================
 T("");
 if(nl>=2){V.blob(24,12,2.6,1.6,1.2,.9,"#b13e53");V.blob(20,29,2.6,1.4,1.6,.8,"#3f6fb5");V.box(31,25,2,3,3,1,"#d9b47b");V.box(31,25,3,3,3,1,"#c9a36b");V.box(17,21,2,1,1,2,"#f4f4f4");V.set(17,21,3,"#5a3a22")}
 if(nl>=3){[[10,17],[33,14],[16,34],[26,23]].forEach(([x,y])=>V.blob(x,y,2.4,.9,.9,.6,"#9a9488"));for(let i=0;i<4;i++){V.set(2,2+i,31-i,"#d8d8d8");V.set(2+i,2,31-i,"#d8d8d8")}}
 // ambient: bright day, warm dusk, deep blue night; dimmer when neglected or asleep
 let amb=nt<.05?[1,.99,.96]:nt<.6?[.92-.3*nt,.86-.3*nt,.86-.2*nt]:[.36,.38,.52];
 if(closed&&nt<.6)amb=amb.map(v=>v*.62);if(nl>=3)amb=amb.map((v,i)=>v*(i===2?.86:.8));if(sleep)amb=amb.map(v=>v*.7);
 return{V,lights,glows,beam,beamC,amb,spots,stations:RST,idle:RIDLE}}
