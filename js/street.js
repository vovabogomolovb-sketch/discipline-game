"use strict";
// ================= STREET (pixel, loficities-like) =================
// Static scenery lives in ST.cityC (rebuilt once a minute); everything that moves is in js/life.js.
const ST={W:0,H:0,scale:3,G:0,key:"",skyC:null,cityC:null,spots:{},lamps:[],twinkle:[],tvs:[],blinks:[],neon:null,park:null,clouds:[],stars:[],flakes:[],wx:"",
 doors:[],props:[],wires:[],puddles:[],zebra:null,tl:null,busStop:null,cafeT:[],musicX:null,sniff:[],manhole:null,house:null};

function streetSize(cssW,cssH,dockTop){
 const sc=Math.max(2,Math.min(6,Math.round(Math.min(cssW*1.05,cssH)/215)));
 const W=Math.ceil(cssW/sc),H=Math.ceil(cssH/sc),G=Math.round(Math.min(H-26,dockTop/sc-23));
 if(W!==ST.W||H!==ST.H||G!==ST.G||sc!==ST.scale){Object.assign(ST,{W,H,G,scale:sc,key:""});const R=rng(9);
  ST.clouds=[];for(let i=0;i<Math.max(4,W/45);i++)ST.clouds.push({x:R()*W,y:6+R()*G*.35,w:16+R()*40,v:1+R()*2.5,s:i+1});
  ST.stars=[];for(let i=0;i<W*G/90;i++)ST.stars.push([R()*W|0,R()*G*.7|0,R()*6]);
  ST.flakes=[];lifeReset()}
}
// --- drawing helpers for facades ---
function tex(x,y,w,h,c,R,n=.04){r(x,y,w,h,c);for(let i=0;i<w*h/26;i++)r(x+R()*w|0,y+R()*h|0,1+R()*3|0,1,sh(c,1-n-R()*n))}
const LIT=["#ffd27a","#ffe3a3","#ffc56b","#fff1c9"];
function fwin(x,y,w,h,R,nt,o={}){ // framed window; returns lit info
 r(x-1,y-1,w+2,h+2,o.frame||"#6e5a46");
 const lit=nt>.25&&R()<(o.p??.55),glass=nt>.25?"#1b2138":"#7fa8c9";r(x,y,w,h,glass);
 if(nt<=.25){r(x,y,Math.max(1,w/3|0),1,"#c6e2f2");r(x,y,1,Math.max(1,h/3|0),"#c6e2f2")}
 if(w>=8){r(x+w/2|0,y,1,h,o.frame||"#6e5a46");}if(h>=10)r(x,y+h/2|0,w,1,o.frame||"#6e5a46");
 if(o.curtain){r(x,y,2,h,o.curtain);r(x+w-2,y,2,h,o.curtain)}
 r(x-2,y+h+1,w+4,1,o.sill||"#cbb79c");
 if(o.plant){for(let i=0;i<w;i+=3){r(x+i,y+h-2,2,2,"#c86a4a");r(x+i,y+h-4,2,2,i%2?"#4f9a58":"#6fbf6a")}}
 return lit?{x,y,w,h,c:LIT[(R()*4)|0],tv:R()<.12}:null}
// pull colours ~k towards grey (facades and signs were too loud)
function desat(k,y0,y1){const w=X.canvas.width;y0=Math.max(0,y0|0);y1=Math.min(X.canvas.height,y1|0);if(y1<=y0)return;
 const id=X.getImageData(0,y0,w,y1-y0),d=id.data;for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const l=d[i]*.3+d[i+1]*.59+d[i+2]*.11;d[i]+=(l-d[i])*k;d[i+1]+=(l-d[i+1])*k;d[i+2]+=(l-d[i+2])*k}
 X.putImageData(id,0,y0)}
// small sidewalk object sorted by depth with people; drawn bottom-anchored at (x, y)
function mkProp(x,y,w,h,nt,fn,dx=0){const c=onto(layer(w,h),()=>{fn();if(nt>0){X.globalCompositeOperation="source-atop";X.globalAlpha=nt*.62;r(0,0,w,h,"#0a0b2a");X.globalAlpha=1;X.globalCompositeOperation="source-over"}});
 ST.props.push({x:x-dx,y,c});return c}
function graffiti(x,y,w,h,R){const cs=["#d9599a","#59c2d9","#e8d05a","#8ad95a","#f4f4f4"];for(let k=0;k<2;k++){const c=cs[(R()*cs.length)|0];let px=x+1,py=y+h/2+(R()-.5)*h*.5;
 for(let i=0;i<w-2;i++){py+=(R()-.5)*2.4;py=Math.max(y+1,Math.min(y+h-2,py));r(px+i,py,1,2,c)}}}
function sunPos(h){const {W,G}=ST,isDay=h>=6&&h<19.5,ph=isDay?(h-6)/13.5:((h+24-19.5)%24)/10.5;return{isDay,ph,x:W*.08+ph*W*.84,y:G*.55-Math.sin(ph*Math.PI)*G*.45,el:Math.sin(ph*Math.PI)}}
function drawStreetCity(h){
 const {W,H,G}=ST,R=rng(7),nt=night(h),wx=ST.wx,snow=wx==="snow",rain=wx==="rain";
 ST.spots={};ST.lamps=[];ST.twinkle=[];ST.tvs=[];ST.blinks=[];ST.doors=[];ST.props=[];ST.wires=[];ST.puddles=[];ST.cafeT=[];ST.sniff=[];ST.busStop=null;
 const lit=[],litFar=[];const [skT,skB]=sky(h);const D=c=>mix(c,"#0a0b2a",nt*.55);
 // ---- far skyline ----
 const far=D(mix(nt>.5?"#151937":"#36406e",skB,nt>.5?.15:.45));
 let x=-6;while(x<W){const w=10+R()*22|0,hh=(.34+R()*.5)*G*.92|0,top=G-hh;r(x,top,w,hh,far);
  const st=R();if(st<.18){r(x+w/2|0,top-hh*.18,1,hh*.18,far);ST.blinks.push([x+w/2|0,top-hh*.18-1])}
  else if(st<.34){r(x+2,top-4,w-4,4,far);r(x+4,top-8,w-8,4,far)}else if(st<.42){r(x+w/2-3,top-5,6,5,mix(far,"#ffffff",.08))}
  for(let yy=top+3;yy<G-2;yy+=3)for(let xx=x+2;xx<x+w-1;xx+=2){if(nt>.3){if(R()<.42){const c=R()<.75?"#ffd27a":R()<.5?"#fff1c9":"#9fd4ff";litFar.push([xx,yy,1,1,c,.85]);if(R()<.04)ST.twinkle.push([xx,yy,c])}}else if(R()<.25)r(xx,yy,1,1,mix(far,"#ffffff",.18))}
  x+=w+(R()<.3?2:0)}
 // haze
 for(let i=0;i<24;i++){X.globalAlpha=.025*(wx==="fog"?2:1);r(0,G-i*4,W,4,D(skB))}X.globalAlpha=1;
 // ---- mid layer ----
 const midC=["#5a4a6e","#6a4f5a","#4f566e","#6e5a50"];
 x=-4;while(x<W){const w=24+R()*30|0,hh=(.2+R()*.28)*G|0,top=G-hh,c=mix(midC[(R()*4)|0],skB,nt>.5?.08:.3);r(x,top,w,hh,c);r(x,top,w,2,sh(c,1.15));
  if(R()<.5){r(x+w*.3|0,top-6,6,6,D(mix("#d9d9e3",skB,.4)));r(x+w*.3|0,top-7,6,1,D(mix("#ffffff",skB,.4)))}
  for(let yy=top+5;yy<G-4;yy+=7)for(let xx=x+3;xx<x+w-4;xx+=5){if(nt>.3&&R()<.38)litFar.push([xx,yy,3,4,LIT[(R()*4)|0],.9]);else r(xx,yy,3,4,sh(c,.78))}
  if(R()<.35){for(let yy=top+8;yy<G-6;yy+=7){r(x+w-9,yy+4,7,1,"#2a2a33");r(x+w-9,yy,1,5,"#2a2a33")}}
  x+=w+1}
 desat(.25,0,G+2);
 const lkF=Math.min(1,nt*1.6);litFar.forEach(([x0,y0,w,hh,c,a])=>{X.globalAlpha=lkF*a;r(x0,y0,w,hh,c);X.globalAlpha=1});
 for(let i=0;i<14;i++){X.globalAlpha=.03*(wx==="fog"?2.5:1);r(0,G-i*3,W,3,D(skB))}X.globalAlpha=1;
 const cityX=X,FL=layer(W,H);X=FL.getContext("2d");
 // ---- front row ----
 const houseW=Math.max(96,Math.min(124,W*.5|0)),hx=Math.round((W-houseW)/2);
 const blds=[{t:"house",x:hx,w:houseW},{t:"lavka",x:hx-50,w:48},{t:"cafe",x:hx+houseW+2,w:50}];
 let lx=hx-52;while(lx>-60){const w=36+R()*30|0;lx-=w+2;blds.push({t:"fill",x:lx+2,w})}
 let rx=hx+houseW+54;while(rx<W+10){const w=36+R()*30|0;blds.push({t:"fill",x:rx,w});rx+=w+2}
 const roofs=[],awn=[];
 blds.forEach(b=>{
  if(b.t==="fill"){const floors=2+(R()*3|0),fh=26,top=G-floors*fh-6,cs=["#9b5a46","#7d8aa3","#c47f5a","#b89a76","#8a6e8a"],c=cs[(R()*cs.length)|0];b.top=top;
   tex(b.x,top,b.w,G-top,c,R);r(b.x,top,b.w,3,sh(c,1.18));r(b.x,top+3,b.w,1,sh(c,.75));roofs.push([b.x,top,b.w]);
   for(let f=1;f<floors;f++)for(let i=0;i<Math.max(1,(b.w-8)/16|0);i++){const L=fwin(b.x+6+i*16,top+8+(f-1)*fh,9,12,R,nt,{frame:sh(c,.7),curtain:R()<.3?"#c96f6f":null,plant:R()<.25});if(L)lit.push([L.x,L.y,L.w,L.h,L.c,1]);if(L&&L.tv)ST.tvs.push([L.x,L.y,L.w,L.h])}
   const sy=G-26;r(b.x+2,sy-8,b.w-4,7,["#2f8f4e","#2a5bd7","#b13e53","#e0a030"][(R()*4)|0]);for(let i=b.x+5;i<b.x+b.w-6;i+=3)r(i,sy-6+(R()*3|0),2,1,"#f4f0e0");
   r(b.x+4,sy+2,b.w-20,22,"#1d1a2c");r(b.x+b.w-14,sy+2,10,24,"#3a2f2a");r(b.x+b.w-13,sy+4,8,9,nt>.25?"#2a2436":"#5a6a80");r(b.x+b.w-6,sy+14,1,2,"#c9a65a");ST.doors.push(b.x+b.w-9);
   if(R()<.3){ // closed shop: rolling shutter with tags and posters
    r(b.x+5,sy+3,b.w-22,20,"#7a7f8c");for(let yy=sy+4;yy<sy+23;yy+=2)r(b.x+5,yy,b.w-22,1,"#646a76");graffiti(b.x+6,sy+10,b.w-24,10,R);
    if(R()<.7){const px=b.x+7+(R()*(b.w-32)|0);r(px,sy+4,7,9,"#e8dcc0");r(px+1,sy+5,5,3,["#b13e53","#2a5bd7","#38b764"][(R()*3)|0]);r(px+1,sy+9,5,1,"#555");r(px+1,sy+11,3,1,"#555")}}
   else{if(nt>.25)lit.push([b.x+5,sy+3,b.w-22,20,"#ffd58a",.9]);else r(b.x+5,sy+3,b.w-22,20,"#3b4a66")}
   if(R()<.5){for(let yy=top+14;yy<G-30;yy+=fh){r(b.x+b.w-16,yy+10,12,1,"#2a2a33");for(let k=0;k<12;k+=3)r(b.x+b.w-16+k,yy+4,1,7,"#2a2a33")}}
   if(R()<.6){r(b.x+b.w-10,top-9,8,9,"#e3e3ea");r(b.x+b.w-10,top-9,8,1,"#ffffff");r(b.x+b.w-11,top-1,10,1,"#9aa3b5")}
  }
  if(b.t==="lavka"){const top=G-62;b.top=top;tex(b.x,top,b.w,G-top,"#d9b88f",R);r(b.x,top,b.w,3,"#ead1a8");roofs.push([b.x,top,b.w]);
   const L1=fwin(b.x+7,top+8,10,12,R,nt,{curtain:"#d96f5f"}),L2=fwin(b.x+29,top+8,10,12,R,nt,{plant:1});[L1,L2].forEach(L=>L&&lit.push([L.x,L.y,L.w,L.h,L.c,1]));
   r(b.x+6,top-12,12,12,"#e3e3ea");r(b.x+6,top-12,12,1,"#fff");r(b.x+5,top-1,14,1,"#9aa3b5");r(b.x+30,top-8,1,8,"#555");r(b.x+26,top-8,9,1,"#555");
   r(b.x+1,G-38,b.w-2,9,"#b13e53");ptext("ЛАВКА",b.x+b.w/2-ptw("ЛАВКА")/2|0,G-36,"#ffe9a8");
   for(let i=0;i<b.w-2;i+=6)r(b.x+1+i,G-29,3,5,(i/6)%2?"#f4f4f4":"#d9344f");r(b.x+1,G-24,b.w-2,1,"#7a2030");awn.push([b.x+1,b.w-2]);
   r(b.x+3,G-22,28,22,"#1d1a2c");for(let s=0;s<3;s++){r(b.x+4,G-15+s*5,26,1,"#5a4a6a");for(let k=0;k<7;k++)r(b.x+5+k*3.6,G-19+s*5,2,3,["#ef7d57","#ffcd75","#38b764","#41a6f6","#b13e53","#f4f4f4"][(R()*6)|0])}
   if(nt>.25)lit.push([b.x+4,G-21,26,20,"#ffd58a",.35]);
   r(b.x+34,G-22,11,22,"#4a3a5c");r(b.x+36,G-20,7,10,nt>.25?"#ffd58a":"#7fa8c9");r(b.x+42,G-11,1,2,"#ffcd75");ST.doors.push(b.x+39);
   ST.spots.lavka=[b.x,G-40,b.w,40];ST.musicX=b.x+17}
  if(b.t==="cafe"){const top=G-60;b.top=top;tex(b.x,top,b.w,G-top,"#c9a27a",R);r(b.x,top,b.w,3,"#dcb98f");roofs.push([b.x,top,b.w]);
   [[6],[22],[38]].forEach(([dx])=>{const L=fwin(b.x+dx,top+9,8,11,R,nt,{plant:1,sill:"#a9835e"});if(L)lit.push([L.x,L.y,L.w,L.h,L.c,1])});
   r(b.x+2,G-36,b.w-4,9,"#2f8f4e");ptext("КАФЕ",b.x+b.w/2-ptw("КАФЕ")/2|0,G-34,"#f4f4f4");
   r(b.x+3,G-25,b.w-18,25,"#2a2033");if(nt>.25)lit.push([b.x+4,G-24,b.w-20,23,"#ffcf8a",.95]);else r(b.x+4,G-24,b.w-20,23,"#6e86a8");
   for(let i=0;i<3;i++){r(b.x+8+i*9,G-23,1,4,"#555");r(b.x+6+i*9,G-19,5,2,"#ffcd75")}
   r(b.x+b.w-13,G-25,10,25,"#5c4838");r(b.x+b.w-11,G-23,6,10,nt>.25?"#ffcf8a":"#7fa8c9");ST.doors.push(b.x+b.w-8);
   // striped awning over the terrace
   r(b.x,G-27,b.w,1,"#1f5a34");for(let i=0;i<b.w;i+=4)r(b.x+i,G-26,2,4,"#2f8f4e"),r(b.x+i+2,G-26,2,4,"#e8e2d6");for(let i=0;i<b.w;i+=2)r(b.x+i,G-22,1,1,(i/2)%2?"#e8e2d6":"#2f8f4e");awn.push([b.x,b.w]);
   // menu board by the door
   r(b.x+b.w-17,G-9,5,8,"#2a2420");r(b.x+b.w-16,G-8,3,5,"#3a3a36");r(b.x+b.w-16,G-7,2,1,"#d8d4c4");r(b.x+b.w-16,G-5,3,1,"#d8d4c4");
   ST.spots.cafe=[b.x,G-36,b.w,36];
   [b.x+9,b.x+27].forEach(tx=>ST.cafeT.push(tx));if(b.x+b.w+16<W&&W>260)ST.cafeT.push(b.x+b.w+9)}
  if(b.t==="house"){const fl=has("st_floor")?3:2,top=G-36-28*(fl-1),w=b.w;b.top=top-4;
   tex(b.x,top,w,G-top,"#e3c9a0",R,.035);r(b.x,top,w,3,"#f1dcb7");r(b.x,G-37,w,3,"#c9ab80");r(b.x,top-4,w,4,"#b89a76");roofs.push([b.x,top-4,w]);
   // roof props
   [[b.x+10],[b.x+26]].forEach(([tx])=>{r(tx,top-18,13,14,"#e6e7ee");r(tx,top-18,13,2,"#ffffff");r(tx+1,top-12,11,1,"#c9cbd6");r(tx-1,top-5,15,1,"#8a8f9c");r(tx+1,top-4,1,4,"#666");r(tx+11,top-4,1,4,"#666")});
   r(b.x+w-24,top-12,12,8,"#9aa3b5");r(b.x+w-23,top-11,10,6,"#c0cbdc");disc(b.x+w-8,top-10,3,"#d9dde3");r(b.x+w-8,top-7,1,3,"#666");
   r(b.x+w/2|0,top-26,1,22,"#555");r(b.x+w/2-4|0,top-22,9,1,"#555");ST.blinks.push([b.x+w/2|0,top-27]);
   if(has("st_roof"))for(let i=0;i<5;i++){const px=b.x+44+i*10;if(px>b.x+w-28)break;r(px,top-7,8,3,"#8b5a2b");disc(px+4,top-10,3,i%2?"#38b764":"#257179");r(px+3,top-12,2,1,"#a7f070")}
   // upper floors
   const k=Math.max(3,Math.floor((w-10)/22)),gap=(w-10)/k;
   for(let f=0;f<fl-1;f++){const fy=top+6+f*28;for(let i=0;i<k;i++){const wx0=b.x+5+i*gap+gap/2-6|0,mid=i===Math.floor(k/2);
     const L=fwin(wx0,fy,12,15,R,nt,{curtain:["#d96f5f","#6f9fd9","#e8c96a"][(i+f)%3],plant:!mid&&(i+f)%2===0,frame:"#7a6248"});if(L){lit.push([L.x,L.y,L.w,L.h,L.c,1]);if(L.tv)ST.tvs.push([L.x,L.y,L.w,L.h])}
     if(mid){r(wx0-5,fy+14,22,2,"#8a7158");for(let q=0;q<11;q++)r(wx0-4+q*2,fy+16,1,6,"#3a2f2a");r(wx0-5,fy+16,22,1,"#3a2f2a");r(wx0-5,fy+22,22,2,"#8a7158");
      if(has("st_cat")&&f===fl-2){const cx=wx0+12,cy=fy+9;r(cx,cy+3,6,4,"#1a1020");r(cx+1,cy,4,3,"#1a1020");r(cx+1,cy-1,1,1,"#1a1020");r(cx+4,cy-1,1,1,"#1a1020");r(cx+2,cy+1,1,1,"#ffcd75");r(cx+4,cy+1,1,1,"#ffcd75");r(cx+6,cy+5,2,1,"#1a1020")}}
     else if((i+f)%2){r(wx0+1,fy+19,10,6,"#c0cbdc");r(wx0+2,fy+20,8,4,"#e3e3ea");r(wx0+4,fy+22,4,1,"#888")}}}
   // ground floor: door, window, garage
   const dx=b.x+6;r(dx-2,G-30,18,3,"#8a7158");r(dx,G-27,14,27,"#5c3a2a");r(dx+1,G-26,12,26,"#7a4a32");r(dx+7,G-26,1,26,"#5c3a2a");r(dx+2,G-25,4,8,nt>.25?"#ffd58a":"#7fa8c9");r(dx+8,G-25,4,8,nt>.25?"#ffd58a":"#7fa8c9");r(dx+10,G-13,1,2,"#ffcd75");
   r(dx-3,G-1,20,1,"#9aa3b5");ST.spots.door=[dx-2,G-30,18,30];
   r(dx+16,G-20,3,5,"#3a5a8a");r(dx+16,G-20,3,1,"#5a7aaa");r(dx+17,G-18,1,1,"#1a1a24"); // mailbox
   const gw=Math.round(w*.46),gx=b.x+w-gw-6;r(gx-2,G-30,gw+4,30,"#3a3f52");r(gx,G-28,gw,28,"#8b93a5");for(let yy=G-26;yy<G;yy+=3)r(gx,yy,gw,1,"#6b7285");r(gx,G-28,gw,2,"#c0cbdc");r(gx+gw/2-6|0,G-4,12,2,"#3a3f52");
   ptext("ГАРАЖ",gx+gw/2-ptw("ГАРАЖ")/2|0,G-36,"#6e5642");ST.spots.garage=[gx,G-30,gw,30];ST.park=gx+gw/2|0;
   const sw=gx-(dx+16);if(sw>16){const L=fwin(dx+19,G-25,Math.min(12,sw-8),12,R,nt,{plant:1});if(L)lit.push([L.x,L.y,L.w,L.h,L.c,1])}
   if(has("st_plants"))[dx-6,dx+15].forEach(px=>{r(px,G-7,6,7,"#b13e53");r(px,G-7,6,1,"#ef7d57");disc(px+3,G-10,3,"#38b764");r(px+2,G-13,1,1,"#ef4a5f");r(px+4,G-12,1,1,"#ffcd75")});
   ST.neon=has("st_neon")?[dx-1,G-41]:null;
   ST.house=[b.x,top,w]}
 });
 const lav=blds.find(b=>b.t==="lavka"),cafe=blds.find(b=>b.t==="cafe"),hs=blds.find(b=>b.t==="house");
 // cables between roofs (pigeons sit on them)
 roofs.sort((a,b)=>a[0]-b[0]);for(let i=0;i<roofs.length-1;i++){const a=roofs[i],b=roofs[i+1];const x0=a[0]+a[2]-3,y0=a[1]+6,x1=b[0]+3,y1=b[1]+6;
  for(let t=0;t<=1;t+=1/Math.max(8,(x1-x0))){const yy=y0+(y1-y0)*t+Math.sin(Math.PI*t)*6,xx=x0+(x1-x0)*t;r(xx,yy,1,1,"#2a2730");if(t>.12&&t<.88&&xx>2&&xx<W-2)ST.wires.push([Math.round(xx),Math.round(yy)])}}
 // snow caps
 if(snow){roofs.forEach(([x0,y0,w])=>r(x0,y0-1,w,2,"#f2f6fb"))}
 // ---- ground: sidewalk (3 walking lanes), curb, road ----
 const sw=snow?"#dfe6ee":rain?"#a8957a":"#c4ad8c",swJ=snow?"#c8d2de":sh(sw,.84);
 tex(0,G,W,12,sw,R,.03);for(let xx=0;xx<W;xx+=12)r(xx,G,1,12,swJ);r(0,G,W,1,swJ);r(0,G+6,W,1,mix(sw,swJ,.5));
 for(let xx=0;xx<W;xx+=10)r(xx,G+12,10,2,(xx/10)%2?"#2a2633":"#c9a85a");r(0,G+12,W,1,sh(sw,.7));
 const road=rain?"#2f3140":snow?"#4a4b56":"#43434f";r(0,G+14,W,H-G-14,road);for(let i=0;i<W*(H-G)/40;i++)r(R()*W|0,G+15+R()*(H-G-15)|0,2,1,sh(road,1.12));
 // zebra crossing + traffic light: left of the shop when there is room, otherwise in front of the house
 const zw=14;let zx=lav.x-26;if(zx<6){const d0=ST.spots.door[0]+18,g0=ST.spots.garage[0];zx=Math.round((d0+g0)/2-zw/2)}
 ST.zebra={x:zx,w:zw};const zb=Math.min(H,G+50),paint=snow?"#e8eef4":"#d2ccb8";
 for(let yy=G+16;yy<zb;yy+=4)r(zx,yy,zw,2,paint);r(zx-4,G+15,1,16,paint);r(zx+zw+3,G+33,1,Math.max(0,zb-G-33),paint);
 const mid=G+14+Math.round((Math.min(H,G+50)-G-14)/2);for(let xx=4;xx<W;xx+=24)if(xx+12<zx-6||xx>zx+zw+6)r(xx,mid,12,1,"#cfc8b0");
 const tlx=zx-3;r(tlx,G-16,1,28,"#2a2a33");r(tlx-1,G-25,3,10,"#1e1f26");[[G-24,"#4a2424"],[G-21,"#4a4224"],[G-18,"#244a2c"]].forEach(([yy,c])=>r(tlx,yy,1,2,c));
 r(tlx+1,G-11,3,6,"#1e1f26");r(tlx+2,G-10,1,2,"#4a2424");r(tlx+2,G-7,1,2,"#244a2c");r(tlx-2,G-32,5,5,"#2a5bd7");r(tlx-1,G-29,3,1,"#f4f4f4");r(tlx,G-31,1,2,"#f4f4f4");
 ST.tl={x:tlx,y:G-24,px:tlx+2,py:G-10};
 // manhole with steam
 let mhx=Math.round(W*.7);if(Math.abs(mhx-zx)<26)mhx=Math.round(W*.3);r(mhx-4,G+22,9,2,"#2a2a33");r(mhx-3,G+21,7,1,"#34343e");r(mhx-3,G+24,7,1,"#34343e");r(mhx-2,G+22,1,2,"#4a4a56");r(mhx+2,G+22,1,2,"#4a4a56");ST.manhole=[mhx,G+22];
 // bus stop to the right of the café
 const bsx=cafe.x+cafe.w+20;if(bsx+28<W-4){ST.busStop=bsx+12;
  r(bsx-1,G-18,28,2,"#3a3f52");r(bsx,G-16,1,18,"#3a3f52");r(bsx+25,G-16,1,18,"#3a3f52");X.globalAlpha=.35;r(bsx+1,G-16,24,14,"#9fc4d8");X.globalAlpha=1;
  r(bsx+18,G-15,6,11,"#e8d8a8");r(bsx+19,G-14,4,4,"#d96f5f");r(bsx+19,G-9,4,1,"#555");if(nt>.25)lit.push([bsx+18,G-15,6,11,"#fff1c9",.9]);
  r(bsx+3,G-5,13,1,"#6a4a32");r(bsx+3,G-4,13,1,"#4a3424");r(bsx+4,G-3,1,4,"#2a2a33");r(bsx+14,G-3,1,4,"#2a2a33");
  r(bsx-5,G-16,1,27,"#2a2a33");r(bsx-7,G-20,5,5,"#e8e8ec");r(bsx-6,G-19,3,2,"#2f8f4e");r(bsx-6,G-17,1,1,"#2a2a33");r(bsx-4,G-17,1,1,"#2a2a33")}
 // newsstand on the nearest left building
 const lf=blds.filter(b=>b.t==="fill"&&b.x<lav.x).sort((a,b)=>b.x-a.x)[0];
 if(lf&&lf.x+6>2&&lf.x+26<zx-4){const kx=lf.x+6;r(kx-1,G-21,20,2,"#2f4a3e");r(kx,G-19,18,20,"#4a6a5a");r(kx+2,G-16,14,8,nt>.25?"#ffe3a3":"#9ab8c8");
  for(let i=0;i<4;i++)r(kx+3+i*3,G-14,2,5,["#d96f5f","#e8d05a","#6f9fd9","#f4f4f4"][i]);r(kx+1,G-8,16,1,"#2f4a3e");r(kx+2,G-6,6,6,"#3a5448");if(nt>.25)lit.push([kx+2,G-16,14,8,"#ffe3a3",.6])}
 // speed sign
 const sgx=ST.busStop?Math.min(W-6,ST.busStop+24):W-14;if(sgx>zx+30){r(sgx,G-13,1,24,"#2a2a33");disc(sgx,G-17,5,"#b13e53");disc(sgx,G-17,4,"#f4f4f4");ptext("40",sgx-3,G-19,"#1a1a24")}
 // sun shadows of buildings, awnings and posts (cast towards the viewer, away from the sun)
 const sun=sunPos(h),shA=(1-nt)*(wx==="clear"?.3:.13);
 if(shA>.02){const SM=onto(layer(W,H),()=>{const el=Math.max(.16,sun.el);
   blds.forEach(b=>{if(b.top==null)return;const d=Math.min(36,Math.max(3,(G-b.top)*.11/el)),sk=((b.x+b.w/2)-sun.x)/W*d*1.8;poly([[b.x,G],[b.x+b.w,G],[b.x+b.w+sk,G+d],[b.x+sk,G+d]],"#1c1830")});
   awn.forEach(([ax,aw])=>r(ax+1,G,aw-2,3,"#1c1830"))});
  X.globalAlpha=shA;X.drawImage(SM,0,0);X.globalAlpha=1}
 // lamps (decor, light at night)
 if(has("st_tree")&&ST.house){const tx=ST.house[0]-4;r(tx,G-30,3,30,"#5a3a2a");disc(tx+1,G-38,11,"#257179");disc(tx-5,G-42,7,"#38b764");disc(tx+7,G-41,7,"#38b764");disc(tx+1,G-48,6,"#38b764");disc(tx-2,G-46,2,"#a7f070");if(snow){r(tx-8,G-52,16,2,"#f2f6fb")}ST.sniff.push(tx+1)}
 let bikeDone=false;
 for(let lxp=18;lxp<W;lxp+=72){if(ST.spots.door&&Math.abs(lxp-ST.spots.door[0]-8)<14)continue;if(Math.abs(lxp-tlx)<8||(ST.busStop&&Math.abs(lxp-ST.busStop)<20))continue;
  r(lxp,G-30,1,42,"#23232b");r(lxp,G-30,6,1,"#23232b");r(lxp+4,G-29,4,2,"#3a3f52");r(lxp-1,G+10,3,2,"#23232b");ST.lamps.push([lxp+6,G-27]);ST.sniff.push(lxp);
  if(!bikeDone&&!ST.cafeT.some(t=>Math.abs(t-lxp)<16)&&Math.abs(lxp-ST.park)>26){bikeDone=true; // bicycle leaning on a lamp post
   mkProp(lxp+1,G+11,13,8,nt,()=>{const wc="#2a2a30";[[3,4],[10,4]].forEach(([cx,cy])=>{for(let a=0;a<12;a++){const q=a/12*Math.PI*2;r(cx+Math.cos(q)*2.6,cy+Math.sin(q)*2.6,1,1,wc)}});
    r(3,4,4,1,"#b13e53");r(6,2,5,1,"#b13e53");r(6,2,1,3,"#b13e53");r(9,2,1,3,"#b13e53");r(5,1,3,1,"#1a1a20");r(10,0,2,1,"#555");r(10,4,1,1,"#888")})}}
 // curb props sorted with people: hydrant, bins
 const hyx=hs.x-7;mkProp(hyx,G+11,5,7,nt,()=>{r(1,1,3,6,"#a83a3a");r(0,3,5,1,"#a83a3a");r(1,0,3,1,"#c85a5a");r(2,2,1,1,"#e88a8a");r(1,6,3,1,"#6a2424")},2);ST.sniff.push(hyx);
 const bin=(bx)=>mkProp(bx,G+11,5,7,nt,()=>{r(0,0,5,2,"#2f4a3e");r(0,2,5,5,"#3a5a4a");r(1,3,1,3,"#2f4a3e");r(3,3,1,3,"#2f4a3e");r(1,0,3,1,"#5a7a6a")},2);
 bin(cafe.x+cafe.w-4);if(lav.x+4>0)bin(lav.x+4);
 // rain: puddles (reflections are drawn live)
 if(rain){const P=ST.puddles;for(let i=0;i<Math.max(4,W/60);i++){const onRoad=i%2===1,w=8+R()*(onRoad?18:12)|0;P.push({x:R()*(W-w)|0,y:onRoad?G+17+(R()*12|0):G+3+(R()*7|0),w,h:onRoad?3:2,s:R()*9})}
  P.forEach(p=>{r(p.x+1,p.y,p.w-2,p.h,"#2a2c3a")})}
 // night: darken everything drawn so far, then lights
 desat(.25,0,H);
 if(nt>0){X.save();X.globalCompositeOperation="source-atop";X.globalAlpha=nt*.62;r(0,0,W,H,"#0a0b2a");X.restore()}
 if(wx==="fog"){X.save();X.globalCompositeOperation="source-atop";X.globalAlpha=.18;r(0,0,W,H,skB);X.restore()}
 const lk=Math.min(1,nt*1.6);
 lit.forEach(([x0,y0,w,hh,c,a])=>{X.globalAlpha=lk*a;r(x0,y0,w,hh,c);if(w>2&&hh>2){r(x0,y0+hh-1,w,1,"#e89a4a")}X.globalAlpha=1});
 if(nt>.25){lit.forEach(([x0,y0,w,hh,c])=>{if(w>2)glow(x0+w/2,y0+hh/2,w*.9,c,.05*nt)});
  ST.lamps.forEach(([lx2,ly])=>{r(lx2-2,ly,4,1,"#fff3b0");glow(lx2,ly+2,16,"#ffcd75",.1*nt);X.save();X.globalAlpha=.1*nt;poly([[lx2-2,ly+1],[lx2+2,ly+1],[lx2+16,G+12],[lx2-16,G+12]],"#ffd58a");X.restore();
   X.save();X.globalAlpha=.08*nt;disc(lx2,G+7,7,"#ffd58a");X.restore();
   if(rain){X.save();X.globalAlpha=.18*nt;for(let yy=G+15;yy<Math.min(H,G+50);yy+=2)r(lx2-1+((yy*7)%3)-1,yy,2,1,"#ffd58a");X.restore()}})}
 if(has("st_lights")&&ST.house){const [hx0,ht,hw]=ST.house,y0=ht+30;for(let t=0;t<=1;t+=1/hw){const xx=hx0+t*hw,yy=y0+Math.sin(Math.PI*t)*8|0;r(xx,yy,1,1,"#2a2730");if((xx|0)%4===0){r(xx,yy+1,1,1,["#ffd27a","#ff6b8a","#7fd4ff","#a7f070"][(xx/4|0)%4]);if(nt>.2)glow(xx,yy+1,3,"#ffd27a",.12)}}}
 X=cityX;X.drawImage(FL,0,0);
}
function buildStreet(h){ST.wx=weather();
 ST.skyC=onto(layer(ST.W,ST.G+2),()=>{const [a,b]=sky(h);skyFill(ST.W,ST.G+2,a,b)});
 ST.cityC=onto(layer(ST.W,ST.H),()=>drawStreetCity(h));lifeLayout(h);decorLayout(h)}
function cloudShape(c,col){const R=rng(c.s*31);X.fillStyle=col;const n=Math.max(3,c.w/8|0);
 for(let i=0;i<n;i++){const cx=c.x+i*c.w/n+4,rad=3+R()*6;disc(cx,c.y-rad/2+((i===0||i===n-1)?2:0),Math.round(rad),col)}r(c.x,c.y,c.w+2,3,col)}
function drawStreet(t,dt){
 const h=hourNow(),nt=night(h),{W,H,G}=ST;
 const key=W+"x"+H+"|"+G+"|"+Math.floor(h*60)+"|"+ver;if(key!==ST.key){ST.key=key;buildStreet(h)}
 X.drawImage(ST.skyC,0,0);
 if(nt>.3)ST.stars.forEach(([x,y,p])=>{if(Math.sin(t/700+p*3)>-.4){X.globalAlpha=nt*(.5+.5*Math.sin(t/400+p));r(x,y,1,1,p>4?"#ffcd75":"#ffffff");X.globalAlpha=1}});
 const sun=sunPos(h),sx=sun.x,sy=sun.y;
 if(sun.isDay){glow(sx,sy,18,"#fff3b0",.12);disc(sx,sy,7,h>17||h<7.5?"#ffb35c":"#fff6d5")}else{glow(sx,sy,14,"#dfe6ff",.06);disc(sx,sy,6,"#eef0e2");disc(sx+3,sy-2,5,sky(h)[0])}
 const ccol=mix(nt>.6?"#3b3f6e":h>16.5&&h<20?"#ffc9b0":"#ffffff",sky(h)[1],.3);
 ST.clouds.forEach(c=>{c.x+=c.v*dt;if(c.x>W+10)c.x=-c.w-12;cloudShape(c,ccol)});
 X.drawImage(ST.cityC,0,0);
 // living details
 if(nt>.3){ST.twinkle.forEach(([x,y,c],i)=>{if(Math.sin(t/1300+i*7.1)>.6)r(x,y,1,1,"#151937")});
  ST.tvs.forEach(([x,y,w,hh],i)=>{const k=Math.sin(t/180+i)*Math.sin(t/77+i*2);X.globalAlpha=.55;r(x+1,y+1,w-2,hh-2,k>0?"#7fb2ff":"#c9e0ff");X.globalAlpha=1})}
 ST.blinks.forEach(([x,y],i)=>{if((t/900+i*.37)%1<.45){r(x,y,1,1,"#ff3b3b");if(nt>.3)glow(x,y,3,"#ff3b3b",.25)}});
 if(ST.neon){const [nx,ny]=ST.neon,on=Math.sin(t/90)>-.93&&!(Math.sin(t/1700)>.97);r(nx,ny,18,9,"#2b1a2e");X.globalAlpha=on?1:.3;ptext("ДОМ",nx+9-ptw("ДОМ")/2|0,ny+2,"#ff6bd5");X.globalAlpha=1;if(on)glow(nx+9,ny+4,12,"#ff6bd5",.08+.12*nt)}
 decorBack(t,nt);
 // people, cars, scenes, smoke, puddle reflections
 lifeFrame(t,dt,h,nt);
 decorFront(t,dt,nt);
 // weather
 const F=ST.flakes,wx=ST.wx;
 if(wx==="snow"||wx==="rain"){const want=wx==="snow"?W*H/80:W*H/55;while(F.length<want)F.push({x:Math.random()*W,y:Math.random()*H,v:wx==="snow"?8+Math.random()*12:110+Math.random()*60,s:Math.random()});
  X.fillStyle=wx==="snow"?"#ffffff":"#a9c4ff";F.forEach(p=>{p.y+=p.v*dt;p.x+=(wx==="snow"?Math.sin(t/900+p.s*9)*6:-28)*dt;if(p.y>H){p.y=-3;p.x=Math.random()*W}if(p.x<-3)p.x=W;if(p.x>W+3)p.x=0;
   if(wx==="snow"){X.globalAlpha=.6+p.s*.4;X.fillRect(p.x|0,p.y|0,p.s>.8?2:1,p.s>.8?2:1)}else{X.globalAlpha=.45;X.fillRect(p.x|0,p.y|0,1,3)}});X.globalAlpha=1}
 if(wx==="fog"){X.globalAlpha=.12+.04*Math.sin(t/3000);r(0,G*.4,W,H,sky(h)[1]);X.globalAlpha=1}
}
const WX_TXT={clear:["Ясно","Ясный вечер","Звёздная ночь","Ясное утро"],rain:["Дождь","Дождливый вечер","Дождь ночью","Дождливое утро"],snow:["Снег","Снегопад вечером","Снег ночью","Снежное утро"],fog:["Туман","Туманный вечер","Туман ночью","Туманное утро"]};
function wxText(){const h=hourNow(),k=h>=17&&h<21?1:(h>=21||h<5)?2:h<10?3:0;return WX_TXT[ST.wx||weather()][k]+" над районом"}

// ================= TOKYO-STYLE DECOR: vertical neon signs, paper lanterns, sakura =================
const DEC={signs:[],lanterns:[],tree:null,petals:[]};
const SIGN_SET=[["ДИС","#ff5fb0"],["ЦИП","#5ff0ff"],["ЛИ","#ffe066"],["НА","#ff5fb0"]];
function decorLayout(h){const {W,G}=ST,lav=ST.spots.lavka,nt=night(h);DEC.signs=[];DEC.lanterns=[];
 // stacked vertical signs on a pole at the right edge of the shop (they rise above the roof like in Tokyo)
 if(lav){const x=lav[0]+lav[2]-3;let y=G-38-4;const boxes=[];
  for(let i=SIGN_SET.length-1;i>=0;i--){const [txt,c]=SIGN_SET[i],hh=txt.length*6+3;y-=hh+2;boxes.unshift({x,y,w:7,h:hh,txt,c,ph:Math.random()*9})}
  DEC.signs=boxes;DEC.pole=[x+3,boxes[0].y-3,G-38]}
 // red paper lanterns hanging from the shop awning
 if(lav)[lav[0]+2,lav[0]+lav[2]-10].forEach((lx,i)=>DEC.lanterns.push({x:lx,y:G-23,ph:i*1.7}));
 // sakura framing the right edge: trunk near the screen edge, crown leaning in over the street
 const R=rng(31),cw=Math.max(40,Math.min(84,W*.24|0)),cH=Math.round(cw*1.15+44),c=layer(cw+6,cH);
 onto(c,()=>{const bx=c.width-cw*.18|0,gy=c.height;
  r(bx-2,gy-46,5,46,"#3b2420");r(bx-1,gy-46,1,46,"#55342c");
  for(let i=0;i<5;i++){const ex=bx-cw*(.2+.14*i),ey=gy-46-cw*(.1+.1*i);for(let t=0;t<=1;t+=.03)r(bx+(ex-bx)*t,gy-40-(gy-40-ey)*t+Math.sin(t*3)*2,t<.5?2:1,2,"#3b2420")}
  const pinks=["#f6a9c7","#f28fb6","#fbc7da","#ee82ad","#ffd9e6"];
  // shadowed underside first, then lit clusters on top, then sparkles
  for(let i=0;i<cw*3;i++){const px=bx-cw*.1-R()*cw*.95,py=gy-48-R()*cw*.75;disc(px,py,1+R()*2.6|0,i<cw?"#c25e8a":pinks[(R()*5)|0])}
  for(let i=0;i<cw*.9;i++){const px=bx-cw*.1-R()*cw*.9,py=gy-52-R()*cw*.7;r(px,py,1,1,R()<.5?"#fff2f7":"#ffd9e6")}});
 DEC.tree={c,x:W-c.width+2,y:G+10-c.height};
 if(nt>0)onto(c,()=>{X.globalCompositeOperation="source-atop";X.globalAlpha=nt*.55;r(0,0,c.width,c.height,"#1a0b2a");X.globalAlpha=1;X.globalCompositeOperation="source-over"});
 DEC.petals=[]}
function decorBack(t,nt){const lit=nt>.25;
 // pole + vertical signs
 if(DEC.signs.length){const [px,py,pb]=DEC.pole;r(px,py,1,pb-py,"#2a2730");
  DEC.signs.forEach((b,i)=>{const flick=Math.sin(t/70+b.ph*7)>-.96&&!(i===2&&Math.sin(t/1900+b.ph)>.985),on=lit&&flick;
   r(b.x-1,b.y-1,b.w+2,b.h+2,"#14121c");r(b.x,b.y,b.w,b.h,on?mix(b.c,"#ffffff",.15):mix(b.c,"#3a3446",.55));
   const tc=on?"#2a0f22":"#f4f0e8";let yy=b.y+2;for(const ch of b.txt){ptext(ch,b.x+2,yy,tc);yy+=6}
   if(on)glow(b.x+b.w/2,b.y+b.h/2,b.h*.7,b.c,.07+.06*nt)})}
 // lanterns sway a little and glow at night
 DEC.lanterns.forEach(l=>{const sw=Math.sin(t/900+l.ph)*.8,x=l.x+sw|0;r(x+3,l.y-3,1,3,"#2a2730");
  const body=lit?"#ff4a3a":"#c0392b";r(x+1,l.y,5,1,"#2a2730");r(x,l.y+1,7,5,body);r(x+1,l.y+6,5,1,body);r(x+1,l.y+7,5,1,"#2a2730");
  r(x,l.y+3,7,1,lit?"#ff8a6a":"#a83224");r(x+3,l.y+2,1,3,lit?"#ffd27a":"#e8d5a0");
  if(lit)glow(x+3,l.y+3,9,"#ff6a3a",.12+.04*Math.sin(t/300+l.ph))})}
function decorFront(t,dt,nt){const T=DEC.tree;if(!T)return;
 X.drawImage(T.c,T.x,T.y);
 // falling petals drifting left
 const P=DEC.petals;if(P.length<Math.max(14,ST.W/10)&&Math.random()<dt*6)P.push({x:T.x+T.c.width*(.15+Math.random()*.8),y:T.y+T.c.height*(.15+Math.random()*.5),vx:-(6+Math.random()*10),vy:5+Math.random()*7,p:Math.random()*9});
 for(let i=P.length-1;i>=0;i--){const q=P[i];q.x+=(q.vx+Math.sin(t/500+q.p)*4)*dt;q.y+=q.vy*dt;if(q.y>ST.H||q.x<-4){P.splice(i,1);continue}
  X.globalAlpha=nt>.5?.7:.95;r(q.x,q.y,Math.sin(t/200+q.p)>0?2:1,1,"#f8b5cf");X.globalAlpha=1}}
