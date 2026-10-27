"use strict";
// ================= STREET LIFE: people, traffic, little scenes =================
// Loaded before street.js; street.js calls lifeReset() on resize, lifeLayout(h) after each static rebuild
// and lifeFrame(t,dt,h,nt) every frame. Coordinates are street pixels; y of a thing = the row its feet/wheels touch.
const LF={ents:[],cars:[],fx:[],pig:[],wp:[],seats:[],zones:[[],[],[],[]],hero:null,nt:0,ntB:-1,T:0,
 tl:{i:0,t:0,ph:"G"},dir:{t:4,q:null,last:{}},chase:null,foot:0,hold:[0,0],spawnC:[.5,2],mhT:0,laid:"",upQ:0,busQ:0};
const LANES=[3,6,9,12]; // feet rows below G: back (shop windows), middle, front (curb side), curb strip for runners
const lfY=l=>ST.G+LANES[l];
const CAR_Y=[30,42],CURB_Y=23; // car lanes (0 → right, far; 1 → left, near) and curb parking row
const lfR=(a,b)=>a+Math.random()*(b-a),lfP=a=>a[Math.random()*a.length|0];
const lfTn=c=>LF.nt>0?mix(c,"#0a0b2a",LF.nt*.5):c;

// ---------------- procedural people ----------------
const SKIN=["#f1c7a0","#e3b38c","#c99068","#a06c48","#73503a","#f6dcc4"];
const HAIRC=["#1c1618","#3a2620","#5c3c28","#8a5a34","#c8a464","#a04a2a","#2a2a30"];
const TOPC=["#8a4f4f","#4f6a86","#5f7a5c","#b0905a","#6a5a7a","#8e8e94","#3a3a44","#c4b496","#7a3f3f","#4a5a6a","#a8704f","#d8d0c0","#33505e","#8a6a86","#b8a07a","#6e7f5a"];
const PANTC=["#2f3446","#3a4a6a","#4a3a2a","#55555e","#1e1e24","#6a5a4a","#3a4436"];
const SHOEC=["#1a1418","#3a2a22","#e2dcd0","#5a3a28","#2a2a34"];
function mkLook(o={}){const age=o.age||(Math.random()<.13?"kid":Math.random()<.15?"elder":"adult"),kid=age==="kid",el=age==="elder",cold=ST.wx==="snow",wet=ST.wx==="rain",fem=Math.random()<.5;
 let style=lfP(fem?["long","long","bun","short","cap","hood"]:["short","short","short","cap","hood",el?"bald":"short"]);if(cold&&Math.random()<.6)style="beanie";
 let top=style==="hood"?"hoodie":lfP(fem&&!kid?["dress","coat","jacket","shirt","hoodie"]:["jacket","coat","shirt","hoodie","jacket"]);if(cold&&top!=="hoodie")top="coat";if(el&&top==="hoodie")top="coat";
 const L={age,fem,H:kid?10+(Math.random()*2|0):el?14+(Math.random()*2|0):15+(Math.random()*4|0),bw:kid?3:Math.random()<.35?5:4,skin:lfP(SKIN),
  hair:el?lfP(["#d8d4cc","#b8b4ac","#8a8680"]):lfP(HAIRC),style,top,topC:lfP(TOPC),legC:lfP(PANTC),shoe:lfP(SHOEC),
  accC:lfP(["#b13e53","#2a5bd7","#c99a3a","#3f8a5a","#2a2a30","#d8d0c0","#6a4a8a"]),umbC:lfP(["#a8404f","#3a5aa8","#2a2a30","#c99a3a","#5f7a5c"]),acc:null,shorts:0,cache:{},cb:-1};
 const a=Math.random();if(wet&&!kid&&a<.75)L.acc="umb";else if(el&&a<.6)L.acc="cane";else if(kid)L.acc=a<.6?"pack":null;else L.acc=a<.18?"pack":a<.4?"bag":null;
 return Object.assign(L,o)}
function lfLine(x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)r(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1,c)}
// legs: walk|run|stand|sit · arms: swing|hold|phone|sip|rest|ride|music · view: s (side, facing right) | f (front) | b (back)
function pDraw(L,legs,arms,fr,view,SH){const T=lfTn,R2=(x,y,w,h,c)=>r(x,y,w,h,T(c)),P=(x,y,c)=>r(x,y,1,1,T(c)),LN=(a,b,c,d,col)=>lfLine(a,b,c,d,T(col));
 const kid=L.age==="kid",el=L.age==="elder",H=L.H,hh=kid?4:5,lh=kid?4:Math.round(H*.36),th=H-hh-lh,foot=SH-1,sit=legs==="sit",run=legs==="run",mov=legs==="walk"||run;
 const bob=mov&&(fr&1)?1:0,base=sit?foot-4:foot-lh+1-bob,tt=base-th,ht=tt-hh,cx=7,dk="#1a1418",skin=L.skin,tc=L.topC,dress=L.top==="dress",coat=L.top==="coat";
 const lc=dress?(L.fem?"#3a2a34":skin):L.legC;
 const umb=L.acc==="umb"&&arms!=="sip"&&arms!=="rest"&&arms!=="music"&&arms!=="ride";
 const canopy=cu=>{R2(cu-1,ht-5,3,1,L.umbC);R2(cu-3,ht-4,7,1,L.umbC);R2(cu-5,ht-3,11,1,L.umbC);R2(cu-5,ht-3,11,1,L.umbC);[cu-5,cu,cu+5].forEach(x=>P(x,ht-2,sh(L.umbC,.75)));P(cu,ht-6,dk);R2(cu-4,ht-4,2,1,sh(L.umbC,1.25))};
 if(view==="s"){const lean=el?1:0,x0=cx-(L.bw===3?1:2),sl=sh(tc,.82);
  if(L.acc==="pack"||L.acc==="box"){const w=L.acc==="box"?4:2,c=L.acc==="box"?"#c99a3a":L.accC;R2(x0-w,tt+(L.acc==="box"?-1:1),w,th-(L.acc==="box"?0:1),c);P(x0-w,tt+1,sh(c,1.2))}
  if(L.style==="long"){R2(cx-3+lean,ht+1,2,hh+2,L.hair)}
  // legs
  if(!sit){const S=run?[3,0,-3,0]:[2,0,-2,0],near=mov?S[fr]:1,far=mov?-S[fr]:0,lw=kid?1:2;
   const leg=(dx,c,sc)=>{for(let y=base;y<foot;y++){const k=(y-base)/Math.max(1,foot-1-base);r(cx-1+Math.round(dx*k),y,lw,1,T(L.shorts&&k>.4?skin:c))}r(cx-1+dx,foot,lw+1,1,T(sc))};
   leg(far,sh(lc,.72),sh(L.shoe,.8));leg(near,lc,L.shoe)}
  else{R2(cx-1,base,5,2,L.legC);R2(cx+3,base+2,2,foot-base-2,sh(L.legC,.9));R2(cx+3,foot,3,1,L.shoe)}
  // torso
  R2(x0,tt,L.bw,th,tc);R2(x0,tt,1,th,sh(tc,.8));
  if(L.top==="shirt")R2(x0,base-1,L.bw,1,sh(L.legC,.8));if(L.top==="hoodie")R2(x0+1,base-2,L.bw-1,1,sh(tc,.85));if(L.top==="jacket")R2(x0+L.bw-1,tt,1,th,sh(tc,1.15));
  if(coat&&!sit){const n=Math.round(lh*.55);R2(x0,base,L.bw,n,tc);R2(x0,base,1,n,sh(tc,.8));P(x0+L.bw-1,tt+2,sh(tc,1.3));P(x0+L.bw-1,tt+4,sh(tc,1.3))}
  if(dress&&!sit){const n=Math.round(lh*.5);R2(x0-1,base,L.bw+2,n,tc);R2(x0-1,base+n-1,L.bw+2,1,sh(tc,.8))}
  if(L.acc==="bag"){LN(x0+L.bw-1,tt,cx-1,base-2,sh(L.accC,.7));R2(cx-2,base-2,3,3,L.accC)}
  // head
  const hx=cx-2+lean;R2(hx,ht,4,hh,skin);P(hx+3,ht+2,dk);if(!kid&&!L.fem&&el)P(hx+3,ht+4,sh(L.hair,.9));
  const hr=L.hair,st=L.style;
  if(st==="short"||st==="long"||st==="bun"){R2(hx,ht,4,1,hr);R2(hx,ht-1,3,1,hr);R2(hx,ht+1,1,2,hr);if(st==="bun")R2(hx-1,ht-2,2,2,hr);if(st==="long")R2(hx,ht+1,1,hh,hr)}
  if(st==="cap"){R2(hx,ht-1,4,2,L.accC);R2(hx+4,ht,2,1,sh(L.accC,.75));R2(hx,ht+1,1,2,hr)}
  if(st==="beanie"){R2(hx,ht-1,4,2,L.accC);P(hx+1,ht-2,"#e8e2d6");R2(hx,ht+1,1,1,hr)}
  if(st==="hood"){R2(hx-1,ht-1,5,2,tc);R2(hx-1,ht,2,hh+1,tc);P(hx+3,ht,sh(tc,.8))}
  if(st==="bald")R2(hx,ht+1,1,2,hr);
  // near arm and hand-held things
  const sh0=[cx,tt+1];let hand=[cx,base];
  if(arms==="swing"){hand=[cx+(run?[-2,0,2,0]:[-1,0,1,0])[fr],run?tt+th-2:base]}
  else if(arms==="hold")hand=[cx+2,base-1];else if(arms==="ride")hand=[cx+3,tt+2];
  if(L.acc==="cane"&&(arms==="swing"||arms==="hold"))hand=[cx+2,base];
  if(umb&&arms!=="phone"&&arms!=="hold")hand=[cx+1,tt+2];
  if(arms==="phone"||arms==="sip"){const el2=[cx+1,tt+th-1],hd=arms==="phone"?[cx+2,tt+2]:[cx+2,ht+hh-1];LN(sh0[0],sh0[1],el2[0],el2[1],sl);LN(el2[0],el2[1],hd[0],hd[1],sl);P(hd[0],hd[1],skin);
   if(arms==="phone"){R2(hd[0]+1,hd[1]-1,1,2,"#22222a");r(hd[0]+1,hd[1]-1,1,1,"#9fd4ff")}else R2(hd[0]+1,hd[1]-1,2,2,"#e8e2d6")}
  else if(arms==="rest"){LN(sh0[0],sh0[1],cx+3,tt+th-1,sl);P(cx+3,tt+th-1,skin)}
  else if(arms==="music"){R2(cx,base-3,4,3,"#a0602a");P(cx+1,base-2,"#3a2010");LN(cx+3,base-3,cx+6,tt,"#5a3a20");const sx=cx+1+(fr&1);LN(sh0[0],sh0[1],sx,base-2,sl);P(sx,base-2,skin)}
  else{LN(sh0[0],sh0[1],hand[0],hand[1]-1,sl);P(hand[0],hand[1],skin)}
  if(L.acc==="cane"&&(arms==="swing"||arms==="hold"))LN(cx+3,base,cx+3+(mov?[0,1,0,-1][fr]:1),foot,"#5a3a28");
  if(umb)R2(cx+1,ht-2,1,tt+2-(ht-2),"#3a3a40"),canopy(cx+1);
 }else{ // front / back
  const w=kid?3:5,x0=cx-(w>>1),back=view==="b",hw=kid?3:5,hx=cx-(hw>>1);
  // legs
  const lift2=mov?(fr===2?1:0):0,lw=kid?1:2,lx=[cx-(kid?1:2),cx+1];
  [[lx[0],mov&&fr===0?1:0],[lx[1],lift2]].forEach(([x,u])=>{R2(x,base,lw,foot-base-u,lc);if(L.shorts)R2(x,base+2,lw,foot-base-2-u,skin);R2(x,foot-u,lw,1,L.shoe)});
  R2(x0,tt,w,th,L.topC);if(L.top==="jacket"&&!back)R2(cx,tt,1,th,sh(tc,1.2));if(L.top==="shirt")R2(x0,base-1,w,1,sh(L.legC,.8));
  if(coat){const n=Math.round(lh*.55);R2(x0,base,w,n,tc)}if(dress){const n=Math.round(lh*.5);R2(x0-1,base,w+2,n,tc)}
  const sw=mov?(fr&1?0:fr===0?1:-1):0;R2(x0-1,tt+1,1,th-1+sw,sh(tc,.82));P(x0-1,base+sw,skin);if(!umb){R2(x0+w,tt+1,1,th-1-sw,sh(tc,.82));P(x0+w,base-sw,skin)}
  if(L.acc==="pack"||L.acc==="box"){if(back)R2(x0,tt+1,w,th-1,L.acc==="box"?"#c99a3a":L.accC);else{P(cx-1,tt,sh(L.accC,.7));P(cx+1,tt,sh(L.accC,.7))}}
  if(L.acc==="bag")P(back?x0:x0+w-1,tt+1,sh(L.accC,.7)),R2(back?x0+w-1:x0-1,base-2,2,3,L.accC);
  R2(hx,ht,hw,hh,skin);const hr=L.hair,st=L.style;
  if(back){if(st==="hood")R2(hx,ht-1,hw,hh+1,tc);else if(st!=="bald"){R2(hx,ht-1,hw,hh-1+(st==="long"?3:0),hr)}else R2(hx,ht+1,hw,2,hr);
   if(st==="cap"||st==="beanie")R2(hx,ht-1,hw,2,L.accC);if(st==="bun")R2(cx-1,ht-2,2,2,hr)}
  else{P(cx-1,ht+2,dk);P(cx+1,ht+2,dk);
   if(st==="hood"){R2(hx-1,ht-1,hw+2,1,tc);R2(hx-1,ht,1,hh,tc);R2(hx+hw,ht,1,hh,tc)}
   else if(st==="cap"||st==="beanie"){R2(hx,ht-1,hw,2,L.accC);if(st==="cap")R2(hx,ht+1,hw,1,sh(L.accC,.75));else P(cx,ht-2,"#e8e2d6")}
   else if(st!=="bald"){R2(hx,ht,hw,1,hr);R2(hx+1,ht-1,hw-2,1,hr);R2(hx,ht+1,1,1,hr);R2(hx+hw-1,ht+1,1,1,hr);if(st==="long"){R2(hx-1,ht+1,1,hh+1,hr);R2(hx+hw,ht+1,1,hh+1,hr)}if(st==="bun")R2(cx-1,ht-2,2,1,hr)}
   else{P(hx,ht+1,hr);P(hx+hw-1,ht+1,hr)}}
  if(umb){R2(x0+w,tt+1,1,3,sh(tc,.82));P(x0+w,tt+1,skin);R2(x0+w,ht-2,1,tt+3-ht,"#3a3a40");canopy(x0+w)}
 }}
function pSpr(L,legs,arms,fr,view,left){if(L.cb!==LF.ntB){L.cache={};L.cb=LF.ntB}if(legs!=="walk"&&legs!=="run")fr=arms==="music"?fr&1:0;
 const k=legs+arms+fr+view+(left?1:0);let c=L.cache[k];if(c)return c;
 if(left&&view==="s")c=flipped(pSpr(L,legs,arms,fr,view,false));else{c=layer(16,L.H+7);onto(c,()=>pDraw(L,legs,arms,fr,view,c.height))}
 return L.cache[k]=c}
function pPut(L,x,y,legs,arms,fr,view,dir,a=1){const c=pSpr(L,legs,arms,fr,view,dir<0&&view==="s"),X0=Math.round(x)-(dir<0&&view==="s"?8:7);
 X.globalAlpha=.22*a;r(Math.round(x)-3,Math.round(y),7,1,"#0a0a18");X.globalAlpha=a;X.drawImage(c,X0,Math.round(y)-c.height+1);X.globalAlpha=1}
// dogs and pigeons
const DOGM={a:["......ee.","t....bbbn",".bbbbbbb.",".bbbbbb..",".l.l..l.l"],b:["......ee.","t....bbbn",".bbbbbbb.",".bbbbbb..","..l.l.l.."],
 s:[".........","t.....ee.",".bbbbbbb.",".bbbbbbbn",".l.l..l.."],p:["......ee.","t....bbbn",".bbbbbbb.","lbbbbbb..","...l..l.l"]};
function dogSpr(d,k,left){if(d.cb!==LF.ntB){d.cache={};d.cb=LF.ntB}const key=k+(left?1:0);if(d.cache[key])return d.cache[key];
 const c=spr(DOGM[k],{b:lfTn(d.c),e:lfTn(sh(d.c,.7)),n:lfTn("#1a1418"),t:lfTn(d.c),l:lfTn(sh(d.c,.8))});return d.cache[key]=left?flipped(c):c}

// ---------------- entities on the sidewalk ----------------
let LEID=0;const NOLANE={cross:1,crossUp:1,in:1,board:1,sitdown:1,fromCar:1};
function mkEnt(o){const e=Object.assign({id:++LEID,k:"walk",x:0,y:0,lane:0,home:0,lanes:[0,1,2],dir:1,v0:11,v:0,f:Math.random()*4,st:"go",t:0,a:1,fr:3,bk:3,stopIn:lfR(6,18),ghost:0,stuck:0,lt:0,sn:0},o);
 if(!e.y)e.y=lfY(e.lane);LF.ents.push(e);return e}
function lfExt(e){return e.dir>0?[e.x-e.bk,e.x+e.fr]:[e.x-e.fr,e.x+e.bk]}
function lfAhead(p,L){let best=1e9,bq=null;const pf=p.x+p.dir*p.fr,[plo,phi]=lfExt(p);
 for(const q of LF.ents){if(q===p||q.lane!==L||NOLANE[q.st]||q.ghost>0)continue;const [lo,hi]=lfExt(q);let g;
  if(p.dir>0){if(hi<plo)continue;g=lo-pf}else{if(lo>phi)continue;g=pf-hi}if(g<best){best=g;bq=q}}
 for(const [a,b] of LF.zones[L]){let g;if(p.dir>0){if(b<plo)continue;g=a-pf}else{if(a>phi)continue;g=pf-b}if(g<best){best=g;bq=null}}
 return{gap:best,q:bq}}
function lfLaneOK(p,L){const [plo,phi]=lfExt(p);for(const q of LF.ents){if(q===p||q.lane!==L||NOLANE[q.st])continue;const [lo,hi]=lfExt(q);if(hi>plo-4&&lo<phi+4)return false}
 for(const [a,b] of LF.zones[L])if(b>plo-2&&a<phi+2)return false;
 const g=lfAhead(p,L);return g.gap>14||(g.q&&g.q.dir===p.dir&&g.q.v>=p.v0*.9&&g.gap>6)}
function lfFree(L,x,rad){for(const q of LF.ents){if(q.lane!==L||NOLANE[q.st])continue;const [lo,hi]=lfExt(q);if(hi>x-rad&&lo<x+rad)return false}
 for(const [a,b] of LF.zones[L])if(b>x-rad&&a<x+rad)return false;return true}
function spawnWalker(o={}){const dir=o.dir||(Math.random()<.5?1:-1),L=o.L||mkLook(o.look||{}),slow=L.acc==="cane";
 const home=o.home??(slow?1:dir>0?0:2),x=o.x??(dir>0?-10:ST.W+10);if(!lfFree(home,x,14))return null;
 const v0=o.v0||(slow?lfR(5,7):L.age==="kid"?lfR(12,15):lfR(9,13.5));
 const e=mkEnt(Object.assign({L,dir,lane:home,home,x,v0,v:v0},o.e||{}));
 if(e.k==="walk"&&!e.z&&!e.seat&&!e.bus&&Math.random()<.3){const ds=ST.doors.filter(d=>d>8&&d<ST.W-8&&dir*(d-x)>30);if(ds.length)e.door=lfP(ds)}
 return e}
function pedsOnRoad(){return LF.ents.some(e=>(e.st==="cross"||e.st==="crossUp")&&e.y>ST.G+11&&e.y<ST.G+54)}
function zebraClear(){const z=ST.zebra;return !LF.cars.some(c=>c.st!=="parked"&&c.x<z.x+z.w+4&&c.x+c.w>z.x-4)}
const lfPedGreen=()=>LF.tl.ph==="R"&&LF.tl.t<7.5;
function lfChaseX(){const c=LF.cars.find(c=>c.chase);if(c)return c.x+c.w/2;const e=LF.ents.find(e=>e.k==="chase");return e?e.x:null}
function watchAll(){LF.ents.forEach(e=>{if((e.k==="walk"||e.k==="couple"||e.k==="dog")&&(e.st==="go"||e.st==="stop")&&e.x>0&&e.x<ST.W&&Math.random()<.85){e.d0=e.dir;e.st="watch";e.t=lfR(3.5,6);e.v=0}})}

function entUpdate(p,dt){const {G,W,H}=ST;p.lt-=dt;p.ghost-=dt;p.sn-=dt;
 if(!NOLANE[p.st]&&p.st!=="out"){const ty=lfY(p.lane);p.y+=Math.max(-9*dt,Math.min(9*dt,ty-p.y))}
 const st=p.st;
 if(st==="go"){
  let g=lfAhead(p,p.lane);const slowLead=q=>!q||q.dir!==p.dir||q.v<p.v0*.85||q.st!=="go";
  if(g.gap<14&&slowLead(g.q)&&p.lt<=0&&p.ghost<=0){for(const L of [p.lane-1,p.lane+1].sort(()=>Math.random()-.5)){if(!p.lanes.includes(L))continue;if(lfLaneOK(p,L)){p.lane=L;p.lt=1;g=lfAhead(p,L);break}}}
  let want=p.v0;
  if(p.ghost<=0&&g.gap<14){if(g.q&&g.q.dir===p.dir)want=g.gap>3?Math.min(want,g.q.v+(g.gap-3)*.6):0;else want=g.gap>3?want*(g.gap-3)/11:0}
  if(want<.5&&p.ghost<=0&&(!g.q||g.q.dir!==p.dir)){p.stuck+=dt;if(p.stuck>2.6){p.ghost=1.8;p.stuck=0}}else p.stuck=Math.max(0,p.stuck-dt);
  p.v+=Math.max(-40*dt,Math.min(30*dt,want-p.v));if(p.v<0)p.v=0;p.x+=p.dir*p.v*dt;
  // heading somewhere: home lane, door, zebra, café seat, bus stop
  let tl=p.home,tx=null;if(p.door!=null){tl=0;tx=p.door}if(p.z){tl=2;tx=ST.zebra.x+ST.zebra.w/2+p.zo}if(p.seat){tl=1;tx=p.seat.x}if(p.bus){tl=2;tx=p.bx}
  if(p.lane!==tl&&p.lt<=0&&p.ghost<=0){const L=p.lane+Math.sign(tl-p.lane);if(p.lanes.includes(L)&&lfLaneOK(p,L)&&lfAhead(p,L).gap>(tx!=null?8:18)){p.lane=L;p.lt=1}}
  if(tx!=null){const d=p.dir*(tx-p.x);if(d<=.6){if(p.lane!==tl||d<-6){p.door=null;p.z=0;if(p.seat){p.seat.res=false;p.seat=null}p.bus=0}
    else if(p.door!=null){p.st="in";p.x=tx}else if(p.z){p.st="waitZ";p.x=tx;p.t=0}else if(p.seat){p.st="sitdown";p.x=tx}else if(p.bus){p.st="busWait";p.x=tx;p.dir=-1}}}
  // occasional stops: shop window, phone
  if(p.k==="walk"&&tx==null&&(p.stopIn-=dt)<=0){p.stopIn=lfR(10,25);if(p.x>12&&p.x<W-12&&Math.random()<.6){if(p.lane===0){p.st="stop";p.pose="window";p.t=lfR(2,4.5)}else if(p.L.age!=="kid"){p.st="stop";p.pose="phone";p.t=lfR(2,4)}if(p.st==="stop")p.v=0}}
  // dogs sniff at hydrants, trees and lamp posts
  if(p.k==="dog"&&p.sn<=0)for(const s of ST.sniff){const d=p.dir*(s-(p.x+p.dir*11));if(d>=0&&d<1.2&&Math.random()<.75){p.st="sniff";p.t=lfR(2,3.5);p.v=0;p.sn=5;break}}
  if(p.k==="couple"&&!p.kid&&(p.hT=(p.hT??lfR(2,5))-dt)<=0){p.hT=lfR(4,8);lfFx({k:"heart",x:p.x-p.dir*3,y:p.y-p.L.H-4,vx:0,vy:-6,life:1.8})}
 }
 else if(st==="stop"||st==="sniff"){p.t-=dt;if(p.t<=0)p.st="go"}
 else if(st==="watch"){const cx=lfChaseX();if(cx!=null)p.dir=cx>p.x?1:-1;p.t-=dt;if(p.t<=0){p.st="go";p.dir=p.d0||p.dir}}
 else if(st==="waitZ"){p.t+=dt;if(lfPedGreen()&&!LF.chase&&!LF.foot&&LF.tl.t<5.5&&zebraClear()){p.st="cross";p.v=lfR(8,10)}if(p.t>45){p.st="go";p.z=0}}
 else if(st==="cross"){p.y+=p.v*dt;p.f+=dt*p.v/2.2;if(p.y>Math.min(H+14,G+62))p.dead=1}
 else if(st==="crossUp"){p.y-=p.v*dt;p.f+=dt*p.v/2.2;if(p.y<=lfY(2)){p.st="go";p.lane=2;p.home=p.dir>0?0:2;p.v=p.v0}}
 else if(st==="in"){p.y-=4*dt;p.a-=dt/.8;p.f+=dt*2;if(p.a<=0)p.dead=1}
 else if(st==="out"){p.a=Math.min(1,p.a+dt/.8);p.y=Math.min(lfY(0),p.y+4*dt);p.f+=dt*2;if(p.a>=1&&p.y>=lfY(0)){p.st="go";p.v=0}}
 else if(st==="fromCar"){p.a=Math.min(1,p.a+dt/.6);p.y-=6*dt;p.f+=dt*2.6;if(p.y<=lfY(2)){p.y=lfY(2);p.st="go";p.lane=2;p.v=0}}
 else if(st==="sitdown"){p.y-=5*dt;if(p.y<=G+4){const s=p.seat;s.who={L:p.L,sipT:lfR(1,4),sip:0,leave:lfR(60,170)};s.res=false;p.dead=1}}
 else if(st==="busWait"){p.dir=-1}
 else if(st==="board"){const d=p.bx-p.x;if(Math.abs(d)>.6){p.dir=Math.sign(d);p.x+=p.dir*Math.min(Math.abs(d),10*dt);p.v=10}else{p.v=0;p.a-=dt/.5;if(p.a<=0)p.dead=1}p.f+=dt*p.v/2.2}
 else if(st==="music"){p.t-=dt;p.f+=dt*3;if((p.nT=(p.nT||0)-dt)<=0){p.nT=lfR(.8,1.6);lfFx({k:"note",x:p.x+4,y:p.y-12,vx:lfR(-2,4),vy:-7,life:2.2})}
  if(p.t<=0){p.st="go";p.k="walk";p.v0=10;p.home=p.dir>0?0:2}}
 if(st==="go"||st==="cross"||st==="crossUp")p.f+=dt*p.v/2.2;
 if(st==="go"&&(p.x<-34||p.x>W+34))p.dead=1}

function entDraw(p){const L=p.L,mov=p.v>.6,fr=Math.floor(p.f)&3,st=p.st,y=p.y;let legs=mov?"walk":"stand",arms="swing",view="s";
 if(p.k==="run"||p.k==="chase")legs=mov?"run":"stand";
 if(p.k==="ride"){legs="stand";arms="ride"}
 if(p.k==="dog"||(p.k==="couple"&&p.dir!==0))arms="hold";
 if(st==="stop"&&p.pose==="phone")arms="phone";
 if(st==="stop"&&p.pose==="window"){view="b";legs="stand"}
 if(st==="waitZ"||st==="cross"||st==="out"||(st==="board"&&p.v<.6)){view="f";legs=st==="cross"||(st==="out"&&p.a<1)?"walk":"stand"}
 if(st==="crossUp"||st==="in"||st==="fromCar"){view="b";legs="walk"}
 if(st==="busWait")legs="stand";
 if(st==="music"){arms="music";legs="stand"}
 const f=legs==="walk"||legs==="run"?fr:(arms==="music"?Math.floor(p.f):0);
 if(p.k==="ride"){const sx=Math.round(p.x),sy=Math.round(y);X.globalAlpha=.22;r(sx-6,sy+1,13,1,"#0a0a18");X.globalAlpha=1;
  r(sx-5,sy,10,1,lfTn("#3a3f52"));r(sx+p.dir*5,sy-9,1,9,lfTn("#5a5f6a"));r(sx+p.dir*5-(p.dir>0?1:0),sy-9,2,1,lfTn("#2a2a30"));r(sx-6,sy,2,2,lfTn("#16171b"));r(sx+5,sy,2,2,lfTn("#16171b"));
  if(LF.nt>.3)r(sx+p.dir*6,sy-8,1,1,"#fff6d5");pPut(L,p.x,y-2,legs,arms,0,"s",p.dir,p.a);return}
 if(p.k==="dog"){const dx=p.x+p.dir*9,dk=st==="sniff"?(Math.floor(p.t*2)%3===0?"p":"s"):mov?(fr&1?"b":"a"):"a",c=dogSpr(p.dog,dk,p.dir<0),ox=Math.round(dx)-(p.dir>0?4:4);
  X.globalAlpha=.2;r(ox,Math.round(y)+1,9,1,"#0a0a18");X.globalAlpha=1;X.drawImage(c,ox,Math.round(y)+1-c.height+1);
  pPut(L,p.x,y,legs,arms,f,view,p.dir,p.a);const hx=p.x+p.dir*2,hy=y-(L.age==="kid"?4:Math.round(L.H*.36))-1,cxl=dx+p.dir*1,cyl=y-3;
  for(let i=1;i<6;i++){const k=i/6;r(hx+(cxl-hx)*k,hy+(cyl-hy)*k+Math.sin(k*Math.PI)*1.5,1,1,lfTn("#2a2430"))}return}
 if(p.k==="couple"){const px=p.x-p.dir*7,lh=L2=>L2.age==="kid"?4:Math.round(L2.H*.36);pPut(p.L2,px,y+1,legs,"hold",(f+2)&3,view,p.dir,p.a);pPut(L,p.x,y,legs,"swing",f,view,p.dir,p.a);
  const ax=p.x-p.dir*1,ay=y-lh(L)+1,bx=px+p.dir*2,by=y+1-lh(p.L2);lfLine(Math.round(ax),Math.round(ay),Math.round(bx),Math.round(by),lfTn(L.skin));return}
 pPut(L,p.x,y,legs,arms,f,view,view==="s"?p.dir:1,p.a);
 if(st==="music"){r(Math.round(p.x)+4,Math.round(y)-1,4,2,lfTn("#2a2420"));if(Math.sin(LF.T*3)>.6)r(Math.round(p.x)+5,Math.round(y)-1,1,1,"#ffe9a8")}}

// ---------------- traffic ----------------
const TL_PH=[["G",13],["Y",2.5],["R",9],["RY",1.3]];
const TINT=new WeakMap();
function lfTint(c,k){if(LF.nt<=0)return c;let m=TINT.get(c);if(m&&m.b===LF.ntB)return m.c;const o=layer(c.width,c.height);onto(o,()=>{X.drawImage(c,0,0);X.globalCompositeOperation="source-atop";X.globalAlpha=LF.nt*k;r(0,0,c.width,c.height,"#0a0b2a")});
 TINT.set(c,{b:LF.ntB,c:o});return o}
function roofOf(c){const g=c.getContext("2d"),w=c.width,h=c.height,d=g.getImageData(0,0,w,h).data;for(let y=0;y<h;y++)for(let x=w*.35|0;x<w*.65;x++)if(d[(y*w+x)*4+3]>0)return y;return 0}
const DECO={};
function busSprite(dir){const k="bus"+dir;if(DECO[k])return DECO[k];const c=onto(layer(72,24),()=>{const b="#c9a64a",d=sh(b,.72),gl="#2a3446";
 r(1,2,70,16,b);r(1,2,70,2,sh(b,1.15));r(1,15,70,3,d);r(2,1,68,1,sh(b,1.1));
 for(let x=6;x<62;x+=8)if(!(x>16&&x<26)&&!(x>46&&x<56))r(x,6,7,7,gl),r(x,6,7,1,"#4a5a70");
 r(64,4,6,11,gl);r(64,4,6,1,"#4a5a70");[[19],[49]].forEach(([dx])=>{r(dx,6,6,12,"#3a4456");r(dx+3,6,1,12,d);r(dx,6,6,1,d)});
 r(56,3,7,2,"#1a1a20");r(57,3,1,1,"#ffb35c");r(59,3,1,1,"#ffb35c");r(61,3,1,1,"#ffb35c");r(0,12,1,3,"#8a1a1a");r(71,13,1,2,"#fff3cf");r(0,18,72,1,"#2a2a30");
 [13,58].forEach(wx=>{disc(wx,20,3,"#16171b");disc(wx,20,1,"#9aa0a8")})});
 return DECO[k]=dir<0?flipped(c):c}
function carBase(kind,dir){let m,col;
 if(kind==="bus")return{s:busSprite(dir),m:null,roof:1};
 if(kind==="police"){m=CARS.find(c=>c.id==="vaz")||CARS[0];col="#dfe2e6"}
 else if(kind==="taxi"){m=CARS.find(c=>c.id===lfP(["vaz","delorean","mustang"]))||CARS[0];col="#d4a637"}
 else if(kind==="flee"){m=CARS.find(c=>c.id===lfP(["p911","f40","mustang"]))||CARS[0];col=lfP(["#7a1a22","#1a1a20","#2a3a5a"])}
 else{m=lfP(CARS);col=lfP([null,"#3a5a8a","#3f6f4f","#d8d2c4","#1c1d22","#5a3a5a","#a08040","#6a6e78","#7a2a2a","#8a8f98"])}
 const s0=carSide(m,col,dir<0);if(kind!=="police"&&kind!=="taxi")return{s:s0,m,roof:roofOf(s0)};
 const k=kind+m.id+dir;if(DECO[k])return DECO[k];const w=s0.width,h=s0.height,rf=roofOf(s0),c=layer(w,h+3);
 onto(c,()=>{X.drawImage(s0,0,3);X.globalCompositeOperation="source-atop";
  if(kind==="police"){r(w*.08,h-5,w*.84,2,"#2a4a9a")}else for(let x=w*.12|0;x<w*.88;x+=2)r(x,h-5+((x>>1)&1),2,1,"#1a1a20");
  X.globalCompositeOperation="source-over";const cx=w/2|0;
  if(kind==="police"){r(cx-4,rf+1,8,2,"#2a2a33");r(cx-4,rf+1,4,1,"#6a2a2a");r(cx,rf+1,4,1,"#2a3a6a")}else{r(cx-3,rf,6,3,"#e8d070");r(cx-2,rf+1,1,1,"#1a1a20");r(cx,rf+1,1,1,"#1a1a20");r(cx+2,rf+1,1,1,"#1a1a20")}});
 return DECO[k]={s:c,m,roof:rf+1}}
function lfParkSpot(w){const {W}=ST,z=ST.zebra,bad=[];if(z)bad.push([z.x-w-12,z.x+z.w+8]);if(ST.busStop)bad.push([ST.busStop-36-w-8,ST.busStop+44]);
 if(ST.park)bad.push([ST.park-w-26,ST.park+26]);LF.cars.forEach(c=>{const px=c.st==="parked"?c.x:c.parkAt;if(px!=null)bad.push([px-w-6,px+c.w+6])});
 for(let i=0;i<10;i++){const x=Math.round(lfR(12,W-w-12));if(!bad.some(([a,b])=>x>a&&x<b))return x}return null}
function spawnCar(lane,o={}){const dir=lane?-1:1,kind=o.kind||"car",B=carBase(kind,dir),s=B.s,w=s.width,x=dir>0?-w-4:ST.W+4;
 if(!o.force)for(const c of LF.cars)if(c.lane===lane&&c.st!=="parked"&&(dir>0?c.x<x+w+12:c.x+c.w>x-12))return null;
 const v0=o.v0||(kind==="bus"?20:kind==="taxi"?lfR(28,38):lfR(18,40));
 const c=Object.assign({kind,base:s,m:B.m,roof:B.roof,w,h:s.height,dir,lane,x:o.x??x,y:ST.G+CAR_Y[lane],v:v0,v0,st:"drive",parkAt:null,tP:0,tO:0,ind:0,brake:false,sm:lfR(0,.4),chase:false,lights:false},o.c||{});
 if(o.park!=null&&lane===0){const px=o.park===true?lfParkSpot(w):o.park;if(px!=null){c.parkAt=px;c.tP=o.tP||lfR(10,25)}}
 LF.cars.push(c);return c}
function onParked(c){const G=ST.G;
 if(c.kind==="taxi"&&c.drop){c.drop=0;c.tP=2.6;mkEnt({L:mkLook({age:Math.random()<.2?"elder":"adult"}),x:c.x+c.w/2,y:G+15,lane:2,dir:Math.random()<.5?1:-1,st:"fromCar",a:0,v0:lfR(9,12)}).home=1}
 if(c.kind==="bus"){const door=c.x+(c.dir>0?52:20);let n=0;LF.ents.forEach(e=>{if(e.st==="busWait"){e.st="board";e.bx=door;n++}});c.tP=3.5+n*.8;
  for(let i=0;i<(Math.random()*3|0);i++){const e=mkEnt({L:mkLook(),x:door-6+i*8,y:G+16+i,lane:2,dir:Math.random()<.5?1:-1,st:"fromCar",a:0,v0:lfR(9,13)});e.home=e.dir>0?0:2}}}
function carsUpdate(dt){const {W,G}=ST,z=ST.zebra,peds=pedsOnRoad(),ph=LF.tl.ph,cold=ST.wx==="snow"||LF.nt>.5||hourNow()<9;
 for(const lane of [0,1]){const dir=lane?-1:1,laneY=G+CAR_Y[lane],curbY=G+CURB_Y,Ls=LF.cars.filter(c=>c.lane===lane&&c.st!=="parked").sort((a,b)=>dir*(b.x-a.x));let lead=null;
  for(const c of Ls){const front=dir>0?c.x+c.w:c.x;let vt=c.v0;
   if(lead){const gap=dir>0?lead.x-(c.x+c.w):c.x-(lead.x+lead.w);vt=gap<5?0:Math.min(vt,(gap-5)*1.7+lead.v*.5)}
   if(z&&!c.chase){const line=dir>0?z.x-4:z.x+z.w+3,d=dir*(line-front);if((peds||ph==="R"||ph==="RY"||(ph==="Y"&&d>9))&&d>=-1)vt=Math.min(vt,Math.max(0,(d-.5)*1.8))}
   if(c.parkAt!=null&&(c.st==="drive"||c.st==="pullin")){const d=dir*(c.parkAt-c.x);if(d<70)c.ind=1;if(d<28)c.st="pullin";
    if(c.st==="pullin"){vt=Math.min(vt,Math.max(0,d*1.5));const k=Math.max(0,Math.min(1,1-d/28));c.y=laneY+(curbY-laneY)*k*k;
     if(d<.8&&c.v<1.2){c.st="parked";c.x=c.parkAt;c.y=curbY;c.v=0;c.ind=0;c.parkAt=null;onParked(c)}}}
   if(c.st==="pullout"){c.y+=Math.max(-8*dt,Math.min(8*dt,laneY-c.y));if(Math.abs(c.y-laneY)<.2){c.y=laneY;c.st="drive";c.ind=0}}
   const acc=c.kind==="bus"?16:c.chase?60:28;c.brake=vt<c.v-.4||(c.v<.6&&vt<.6);
   c.v=vt>c.v?Math.min(vt,c.v+acc*dt):Math.max(vt,c.v-95*dt);c.x+=dir*c.v*dt;
   if(lead){const gap=dir>0?lead.x-(c.x+c.w):c.x-(lead.x+lead.w);if(gap<2){c.x=dir>0?lead.x-c.w-2:lead.x+lead.w+2;c.v=Math.min(c.v,lead.v)}}
   if((c.sm-=dt*(c.v>c.v0*.6||c.v<1?1:1.8))<=0){c.sm=lfR(.22,.45)*(c.v<1?1.6:1);const rx=dir>0?c.x-1:c.x+c.w+1;if(rx>-4&&rx<W+4)lfFx({k:"puff",x:rx,y:c.y-1.5,vx:-dir*lfR(3,8),vy:-lfR(2,5),r0:.5,r1:lfR(1.8,3.4),life:lfR(1,1.6),c:"#b8b8c4",a0:cold?.34:.16})}
   lead=c}}
 LF.cars.forEach(c=>{if(c.st!=="parked")return;c.tP-=dt;if(c.tP>0)return;c.ind=1;c.tO+=dt;
  if(c.tO>1.3&&!LF.cars.some(o=>o!==c&&o.lane===c.lane&&o.st!=="parked"&&o.x+o.w>c.x-50&&o.x<c.x+c.w+10)){c.st="pullout";c.tO=0;c.v=0;c.v0=c.kind==="bus"?20:lfR(20,32)}});
 for(let i=LF.cars.length-1;i>=0;i--){const c=LF.cars[i];if(c.x<-c.w-70||c.x>W+70)LF.cars.splice(i,1)}}
function carDraw(c,t){const nt=LF.nt,s=lfTint(c.base,.55),x=Math.round(c.x),by=Math.round(c.y),top=by-s.height+1,w=s.width;
 X.globalAlpha=.32;r(x+2,by+1,w-4,1,"#05050c");r(x+4,by,w-8,1,"#05050c");X.globalAlpha=1;X.drawImage(s,x,top);
 const ly=by-(c.kind==="bus"?10:6),rear=c.dir>0?x:x+w-1,front=c.dir>0?x+w-1:x;
 if(c.brake){r(rear,ly,1,2,"#ff2a2a");glow(rear,ly+1,4,"#ff3030",.22)}else if(nt>.25)r(rear,ly,1,2,"#c0181f");
 if(nt>.25){r(front,ly,1,2,"#fff6d5");const fx=front+c.dir;X.save();X.globalAlpha=.15*nt;poly(c.dir>0?[[fx,ly-1],[fx+40,ly-6],[fx+40,ly+10]]:[[fx,ly-1],[fx-40,ly-6],[fx-40,ly+10]],"#fff3b0");X.restore();
  if(ST.wx==="rain"){X.save();X.globalAlpha=.2*nt;for(let yy=by+2;yy<by+12;yy+=2)r(fx-1,yy,2,1,"#fff3b0");X.restore()}}
 if(c.ind&&(LF.T*2.6|0)%2){r(front,ly+2,1,1,"#ffa22e");r(rear,ly-1,1,1,"#ffa22e");glow(front,ly+2,3,"#ffa22e",.2)}
 const cx=x+(w/2|0),ry=top+c.roof;
 if(c.lights){const on=(LF.T*7|0)%2;r(cx-4,ry,4,1,on?"#ff3a3a":"#5a1a1a");r(cx,ry,4,1,on?"#1a1a5a":"#4a7aff");if(on)glow(cx-2,ry,9,"#ff3030",.3);else glow(cx+2,ry,9,"#3a5aff",.3)}
 if(c.kind==="taxi"&&nt>.3){r(cx-3,ry-1,6,1,"#ffe9a0");glow(cx,ry,5,"#ffe9a0",.12)}}

// ---------------- particles: smoke, steam, hearts, notes, ripples ----------------
function lfFx(o){if(LF.fx.length>200)LF.fx.shift();LF.fx.push(Object.assign({t:0,vx:0,vy:0,r0:1,r1:1,a0:1,c:"#fff"},o))}
const HEART=[".#.#.","#####",".###.","..#.."],NOTE=[".##",".#.",".#.","##."];
function fxDraw(dt){const F=LF.fx;for(let i=F.length-1;i>=0;i--){const p=F[i];p.t+=dt;if(p.t>=p.life){F.splice(i,1);continue}const q=p.t/p.life;p.x+=p.vx*dt;p.y+=p.vy*dt;
 if(p.k==="puff"){p.vx*=1-dt*.8;const rad=p.r0+(p.r1-p.r0)*q;X.globalAlpha=p.a0*(1-q)*(1-LF.nt*.4);if(rad<1)r(p.x,p.y,1,1,p.c);else disc(p.x,p.y,Math.round(rad),p.c)}
 else if(p.k==="heart"||p.k==="note"){const m=p.k==="heart"?HEART:NOTE,c=p.k==="heart"?"#e8506a":"#ffe3a3";X.globalAlpha=Math.min(1,(1-q)*2);m.forEach((ln,y)=>[...ln].forEach((v,x)=>{if(v==="#")r(p.x+x+Math.sin(p.t*4)*.8,p.y+y,1,1,c)}))}
 else if(p.k==="ring"){const rad=1+q*4;X.globalAlpha=.5*(1-q);r(p.x-rad,p.y,1,1,"#c9d8ff");r(p.x+rad,p.y,1,1,"#c9d8ff")}}X.globalAlpha=1}

// ---------------- pigeons ----------------
function pigeonFlock(){const {W,G}=ST;let x=0;for(let i=0;i<8;i++){x=lfR(16,W-16);if(!LF.zones[0].some(([a,b])=>x>a-8&&x<b+8))break}
 const n=3+(Math.random()*3|0);for(let i=0;i<n;i++)LF.pig.push({x:x+lfR(-8,8),y:G+lfR(4,11),st:"g",f:lfR(0,6),dir:Math.random()<.5?1:-1,c:lfP(["#8a8f9c","#9a9aa4","#6e7280","#b8b4ac"])})}
function pigUpdate(dt){const P=LF.pig,{W,G}=ST;
 for(const p of P){p.f+=dt;
  if(p.st==="g"){if(Math.random()<dt*.4)p.dir*=-1;if(Math.random()<dt*.5)p.x+=p.dir;
   if(LF.ents.some(e=>Math.abs(e.x-p.x)<10&&Math.abs(e.y-p.y)<5&&e.v>2)||LF.cars.some(c=>c.st==="pullin"&&Math.abs(c.x+c.w/2-p.x)<30)){
    P.forEach(q=>{if(q.st==="g"&&Math.abs(q.x-p.x)<22){q.st="fly";const wp=ST.wires.length&&Math.random()<.8?lfP(ST.wires.filter(w=>Math.abs(w[0]-q.x)<90)||[]):null;
     q.tx=wp?wp[0]:q.x+lfR(-60,60);q.ty=wp?wp[1]:-20;q.wire=!!wp;q.vy=-lfR(18,26)}})}}
  else if(p.st==="fly"){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy)||1,sp=34;p.x+=dx/d*sp*dt;p.y+=Math.min(dy/d*sp,p.vy)*dt;p.vy+=40*dt;p.dir=dx>0?1:-1;
   if(d<2){if(p.wire){LF.wp.push({x:p.tx,y:p.ty,c:p.c,dir:p.dir,f:lfR(0,9)})}p.dead=1}if(p.y<-20)p.dead=1}
  else if(p.st==="land"){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy)||1;p.x+=dx/d*26*dt;p.y+=dy/d*26*dt;p.dir=dx>0?1:-1;if(d<1.5){p.st="g";p.y=p.ty}}}
 for(let i=P.length-1;i>=0;i--)if(P[i].dead)P.splice(i,1);
 if(LF.wp.length&&Math.random()<dt*.025&&LF.nt<.6&&P.length<10){const w=LF.wp.splice(Math.random()*LF.wp.length|0,1)[0];let tx=lfR(14,W-14);P.push({x:w.x,y:w.y,st:"land",tx,ty:G+lfR(4,11),f:0,dir:1,c:w.c})}}
function pigDraw(p){const x=Math.round(p.x),y=Math.round(p.y),c=lfTn(p.c),hd=lfTn(sh(p.c,.75));
 if(p.st==="g"){const peck=Math.sin(p.f*5+x)>.7;r(x-1,y-2,3,2,c);r(x+(p.dir>0?2:-2),y-(peck?1:3),1,1,hd);r(x,y,1,1,lfTn("#c86a4a"))}
 else{const up=(p.f*14|0)%2;r(x-1,y-1,3,1,c);r(x-2,y-1-(up?1:-1),2,1,c);r(x+1,y-1-(up?1:-1),2,1,c);r(x+(p.dir>0?2:-2),y-2,1,1,hd)}}

// ---------------- café terrace ----------------
function seatsDraw(D){const G=ST.G,nt=LF.nt;
 const tbls=[...new Set(LF.seats.map(s=>s.tbl))];
 LF.seats.forEach(s=>{const d=s.dir,bx=s.x-d*3;D.push([G+3.9,()=>{r(bx,G-3,1,8,lfTn("#3a3f52"));r(Math.min(bx,s.x+d),G+2,5,1,lfTn("#4a5062"));r(s.x+d,G+3,1,2,lfTn("#3a3f52"))}]);
  if(s.who){const w=s.who;D.push([G+4,()=>pPut(w.L,s.x,G+4,"sit",w.sip>0?"sip":"rest",0,"s",d)])}});
 tbls.forEach(tx=>D.push([G+5,()=>{r(tx-4,G-1,8,1,lfTn("#d8d0c0"));r(tx-4,G,8,1,lfTn("#a89e8c"));r(tx,G+1,1,4,lfTn("#3a3a40"));r(tx-2,G+5,5,1,lfTn("#3a3a40"));
  LF.seats.forEach(s=>{if(s.tbl===tx&&s.who&&s.who.sip<=0)r(s.x+s.dir*3,G-3,2,2,lfTn("#e8e2d6"))});
  if(nt>.3&&LF.seats.some(s=>s.tbl===tx&&s.who)){r(tx,G-4,1,3,"#efe6d4");r(tx,G-5,1,1,Math.sin(LF.T*13+tx)>0?"#ffd27a":"#ffb35c");glow(tx,G-5,5,"#ffcd75",.16*nt)}}]))}
function seatsUpdate(dt){const G=ST.G;LF.seats.forEach(s=>{const w=s.who;if(!w)return;
 if(w.sip>0)w.sip-=dt;else if((w.sipT-=dt)<=0){w.sip=1.3;w.sipT=lfR(3,8)}
 if(w.sip<=0&&(w.stT=(w.stT||0)-dt)<=0){w.stT=lfR(.5,.9);lfFx({k:"puff",x:s.x+s.dir*3+.5,y:G-4,vx:lfR(-1,1),vy:-lfR(3,5),r0:.3,r1:1.2,life:1.3,c:"#f4f4f4",a0:.35})}
 if((w.leave-=dt)<=0&&!LF.chase){s.who=null;const e=mkEnt({L:w.L,x:s.x,y:G+4,lane:1,dir:Math.random()<.5?1:-1,v0:lfR(9,12),v:0});e.home=e.dir>0?0:2;if(ST.wx==="rain"&&e.L.age!=="kid")e.L.acc="umb",e.L.cache={}}})}

// ---------------- scene director ----------------
function lfDens(){const h=hourNow();return (h<6||h>=23?.3:h<8?.7:h<10?1.2:h<17?1:h<21?1.3:.7)*(ST.wx==="rain"?.65:ST.wx==="snow"?.8:1)}
function lane3Free(dir){return LF.ents.every(e=>e.lane!==3||(e.dir===dir&&(dir>0?e.x>30:e.x<ST.W-30)))}
const SCN={
 crossing(){const z=ST.zebra;if(!z)return false;const zc=z.x+z.w/2,dir=zc>ST.W/2?1:-1;const e=spawnWalker({dir:Math.random()<.7?dir:-dir,home:2,e:{z:1,zo:lfR(-4,4)}});if(!e)return false;e.door=null;if(Math.random()<.5)LF.upQ++;return true},
 dog(){const e=spawnWalker({home:1,e:{k:"dog",fr:13,dog:{c:lfP(["#c8a070","#3a2a22","#e8e2d6","#8a5a32","#1a1418","#b8b4ac"]),cache:{},cb:-1},v0:lfR(9,11)}});return !!e},
 couple(){const L=mkLook({age:"adult"}),L2=mkLook({age:"adult"});if(L.acc==="umb")L2.acc=null;else if(L.acc==="cane")L.acc=null;if(L2.acc==="cane")L2.acc=null;
  return !!spawnWalker({L,home:1,v0:lfR(7.5,9.5),e:{k:"couple",L2,bk:10}})},
 family(){const L=mkLook({age:"adult"}),L2=mkLook({age:"kid",acc:null});if(L.acc==="cane")L.acc=null;return !!spawnWalker({L,home:1,v0:lfR(7,8.5),e:{k:"couple",L2,bk:10,kid:1}})},
 chase(){if(LF.chase||LF.foot)return false;const n=l=>LF.cars.filter(c=>c.lane===l&&c.st!=="parked").length,lane=n(0)<n(1)?0:n(1)<n(0)?1:Math.random()<.6?0:1;LF.chase={lane,st:"wait",t:0};LF.hold[lane]=1;return true},
 footchase(){if(LF.chase||LF.foot||!lane3Free(1)||!lane3Free(-1))return false;const dir=Math.random()<.5?1:-1,x=dir>0?-12:ST.W+12;
  mkEnt({k:"chase",L:mkLook({age:"adult",style:"hood",top:"hoodie",topC:"#2e2e36",legC:"#1e1e24",acc:"bag",accC:"#8a6a3a"}),x,lane:3,home:3,lanes:[3],dir,v0:44,v:44,ghost:99});
  mkEnt({k:"chase",L:mkLook({age:"adult",style:"cap",top:"jacket",topC:"#2a3a5a",accC:"#2a3a5a",legC:"#232838",shoe:"#1a1418",acc:null}),x:x-dir*22,lane:3,home:3,lanes:[3],dir,v0:40,v:40,ghost:99});
  LF.foot=1;watchAll();if(S.sound&&S.scene==="street")snd([[2600,.07,"square",.02],[2600,.3,"square",.02]]);return true},
 cafe(){const free=LF.seats.filter(s=>!s.who&&!s.res&&s.x>4&&s.x<ST.W-4);if(!free.length)return false;const s=lfP(free),e=spawnWalker({home:1,e:{seat:s,lanes:[1,2]}});if(!e)return false;e.L.acc=e.L.acc==="cane"?"cane":null;s.res=true;return true},
 taxi(){return !!spawnCar(0,{kind:"taxi",park:true,tP:9,c:{drop:1}})},
 park(){return !!spawnCar(0,{park:true})},
 bus(){if(!ST.busStop){return !!spawnCar(Math.random()<.5?0:1,{kind:"bus"})}const n=1+(Math.random()*2|0);for(let i=0;i<n;i++)spawnWalker({home:2,e:{bus:1,bx:ST.busStop-6+i*7}});LF.busQ=6;return true},
 courier(){const dir=Math.random()<.5?1:-1;if(!lane3Free(dir))return false;mkEnt({k:"ride",L:mkLook({age:"adult",acc:"box",style:Math.random()<.5?"cap":"short",topC:lfP(["#3f8a5a","#c99a3a","#a8404f"])}),x:dir>0?-12:ST.W+12,lane:3,home:3,lanes:[3],dir,v0:lfR(26,32),v:28,fr:7,bk:6});return true},
 jogger(){const dir=Math.random()<.5?1:-1;if(!lane3Free(dir))return false;const L=mkLook({age:"adult",top:"shirt",topC:lfP(["#c95a5a","#5a8ac9","#e0c050","#5ac98a"]),shorts:1,acc:null,style:lfP(["short","bun","cap"])});
  mkEnt({k:"run",L,x:dir>0?-12:ST.W+12,lane:3,home:3,lanes:[3],dir,v0:lfR(24,30),v:26});return true},
 elder(){return !!spawnWalker({look:{age:"elder",acc:ST.wx==="rain"?"umb":"cane"},home:1})},
 pigeons(){if(LF.pig.length>8)return false;pigeonFlock();return true},
 musician(){const mx=ST.musicX;if(mx==null||mx<4||mx>ST.W-4||LF.ents.some(e=>e.k==="music")||!lfFree(0,mx,8))return false;
  mkEnt({k:"music",st:"music",L:mkLook({age:"adult",acc:null,style:lfP(["cap","long","short","beanie"])}),x:mx,lane:0,home:0,dir:1,fr:5,bk:4,t:lfR(40,80),v:0});return true}};
function directorWeights(){const h=hourNow(),wet=ST.wx==="rain"||ST.wx==="snow",day=h>=7&&h<21,late=h>=22||h<6;
 return{crossing:3,dog:day?2:.6,couple:h>=10?2:.4,family:h>=9&&h<20?1:0,chase:late?1.6:.9,footchase:day?.7:.3,cafe:h>=8&&h<23?2:0,taxi:late?2:1,park:1,
  bus:h>=6?1.4:0,courier:1,jogger:(h>=6&&h<10||h>=17&&h<21)&&!wet?1.5:.2,elder:h>=8&&h<19?1.2:0,pigeons:day&&!wet?1.3:0,musician:h>=10&&h<22&&!wet?1:0}}
function directorTick(dt){const D=LF.dir;
 if(!D.q){const f=QS.get("scene");D.q=["crossing","dog","couple","chase","cafe","taxi","musician","pigeons","bus","footchase","courier","jogger","elder","family"];if(f&&SCN[f])D.q.unshift(f);
  const h=hourNow();if(h<10||h>=22)D.q=D.q.filter(n=>n!=="musician"||f==="musician")}
 if((D.t-=dt)>0)return;let name;
 if(D.q.length)name=D.q.shift();else{const Wt=directorWeights();let sum=0;const ks=Object.keys(Wt).filter(k=>Wt[k]>0&&!(LF.T-(D.last[k]||-99)<20));ks.forEach(k=>sum+=Wt[k]);let x=Math.random()*sum;name=ks.find(k=>(x-=Wt[k])<0)||"crossing"}
 const ok=SCN[name]&&SCN[name]();if(ok){D.last[name]=LF.T;D.t=D.q.length?lfR(7,13):lfR(8,25)}else D.t=2}
function chaseTick(dt){const ch=LF.chase;if(!ch)return;ch.t+=dt;const {W}=ST;
 if(ch.st==="wait"){const busy=LF.cars.some(c=>c.lane===ch.lane&&c.st!=="parked");LF.cars.forEach(c=>{if(c.lane===ch.lane&&c.st!=="parked")c.v0=Math.max(c.v0,44)});
  if(!busy&&!pedsOnRoad()){const dir=ch.lane?-1:1,f=spawnCar(ch.lane,{kind:"flee",v0:86,force:1,c:{chase:true}});
   const p=spawnCar(ch.lane,{kind:"police",v0:84,force:1,c:{chase:true,lights:true}});p.x=dir>0?f.x-p.w-34:f.x+f.w+34;p.v=84;f.v=86;ch.st="run";watchAll();siren((W+160)/84+1.5)}
  else if(ch.t>30){LF.hold[ch.lane]=0;LF.chase=null;LF.dir.q.splice(1,0,"chase")}}
 else if(!LF.cars.some(c=>c.chase)){LF.hold[ch.lane]=0;LF.chase=null}}
function siren(dur){if(!S.sound||S.scene!=="street"||typeof actx!=="function")return;const a=actx();if(!a)return;
 try{const o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;o.type="square";f.type="lowpass";f.frequency.value=1300;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.016,t+1.2);g.gain.setValueAtTime(.016,t+Math.max(1.3,dur-1.5));g.gain.linearRampToValueAtTime(0,t+dur);
  for(let k=0;k<dur/.45;k++)o.frequency.setValueAtTime(k%2?640:840,t+k*.45);o.connect(f).connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.1)}catch(e){}}

// ---------------- public hooks ----------------
function lifeReset(){LF.ents=[];LF.cars=[];LF.fx=[];LF.pig=[];LF.wp=[];LF.seats=[];LF.laid="";LF.chase=null;LF.foot=0;LF.hold=[0,0];LF.hero={x:0,dir:1,wait:2,f:0}}
function lifeLayout(h){const {W,G}=ST,nt=night(h);
 const cz=ST.cafeT.length?[[Math.min(...ST.cafeT)-11,Math.max(...ST.cafeT)+11]]:[];LF.zones=[cz,[],[],[]];
 LF.heroL=LF.heroL||{age:"adult",fem:false,H:16,bw:4,skin:"#f2c39a",hair:"#4a2a22",style:"short",top:"shirt",topC:"#41a6f6",legC:"#333c57",shoe:"#1a1418",accC:"#333c57",umbC:"#2a2a30",shorts:0,cache:{},cb:-1};
 const ua=ST.wx==="rain"?"umb":null;if(LF.heroL.acc!==ua){LF.heroL.acc=ua;LF.heroL.cache={}}
 const key=W+"|"+G+"|"+ST.cafeT.join(",");if(key===LF.laid)return;LF.laid=key;
 LF.seats=[];ST.cafeT.forEach(tx=>{LF.seats.push({x:tx-5,dir:1,tbl:tx,who:null,res:false},{x:tx+5,dir:-1,tbl:tx,who:null,res:false})});
 const nS=h>=8&&h<23?1+(Math.random()*3|0):h>=23||h<1?(Math.random()<.5?1:0):0;
 [...LF.seats].sort(()=>Math.random()-.5).slice(0,nS).forEach(s=>{const L=mkLook({age:Math.random()<.15?"elder":"adult"});L.acc=null;s.who={L,sipT:lfR(.5,4),sip:0,leave:lfR(60,170)}});
 const want=Math.max(2,Math.round(W/38*lfDens()));for(let i=0;i<want*.7;i++){const x=lfR(10,W-10),e=spawnWalker({x});if(e)e.x=x}
 if(nt<.7&&ST.wires.length)for(let i=0;i<3+(Math.random()*5|0);i++){const w=lfP(ST.wires);LF.wp.push({x:w[0],y:w[1],c:lfP(["#8a8f9c","#9a9aa4","#6e7280"]),dir:Math.random()<.5?1:-1,f:lfR(0,9)})}
 for(let i=0;i<2;i++){const c=spawnCar(i,{});if(c)c.x=lfR(20,W-60)}}
function lifeFrame(t,dt,h,nt){const {W,H,G}=ST;LF.T+=dt;LF.nt=nt;const nb=Math.round(nt*10);if(nb!==LF.ntB){LF.ntB=nb;LF.nt=nb/10}
 // traffic light
 const tl=LF.tl;tl.t+=dt;if(tl.t>=TL_PH[tl.i][1]){tl.i=(tl.i+1)%4;tl.t=0;tl.ph=TL_PH[tl.i][0];
  if(tl.ph==="R"&&ST.zebra&&(LF.upQ>0||Math.random()<.3)){const n=Math.max(1,LF.upQ);LF.upQ=0;for(let i=0;i<n;i++){const L=mkLook();mkEnt({L,x:ST.zebra.x+ST.zebra.w/2+lfR(-4,4),y:Math.min(H+10,G+50)+i*5,lane:2,dir:Math.random()<.5?1:-1,st:"crossUp",v:lfR(8,10),v0:lfR(9,13)})}}}
 directorTick(dt);chaseTick(dt);
 if(LF.busQ>0&&(LF.busQ-=dt)<=0){if(!spawnCar(0,{kind:"bus",park:ST.busStop-36,tP:4}))LF.busQ=1}
 // ambient spawning
 const amb=LF.ents.filter(e=>e.k==="walk").length,want=Math.max(2,Math.round(W/38*lfDens()));
 if(amb<want&&Math.random()<dt*.9){if(Math.random()<.3&&ST.doors.length){const d=lfP(ST.doors.filter(d=>d>6&&d<W-6)||[]);if(d!=null&&lfFree(0,d,10)){const L=mkLook();mkEnt({L,x:d,y:G+1,lane:0,dir:Math.random()<.5?1:-1,st:"out",a:0,v0:L.age==="kid"?lfR(12,15):lfR(9,13)}).home=undefined}}
  else{const e=spawnWalker();if(e&&Math.random()<.08&&ST.zebra){e.z=1;e.zo=lfR(-4,4);e.door=null}}}
 LF.ents.forEach(e=>{if(e.home===undefined)e.home=e.dir>0?0:2});
 for(const lane of [0,1])if((LF.spawnC[lane]-=dt)<=0&&!LF.hold[lane]){const k=Math.random(),kind=k<.1?"taxi":k<.13?"police":"car";
  const c=spawnCar(lane,{kind,park:lane===0&&Math.random()<(kind==="taxi"?.3:.12)?true:null,c:kind==="taxi"?{drop:1}:{}});LF.spawnC[lane]=c?lfR(2.5,8)/Math.max(.35,lfDens()):.7}
 if(LF.foot&&!LF.ents.some(e=>e.k==="chase"))LF.foot=0;
 // updates
 LF.ents.forEach(e=>entUpdate(e,dt));for(let i=LF.ents.length-1;i>=0;i--)if(LF.ents[i].dead)LF.ents.splice(i,1);
 carsUpdate(dt);seatsUpdate(dt);pigUpdate(dt);
 if(ST.manhole&&(LF.mhT-=dt)<=0){const cold=ST.wx==="snow"||nt>.5||h<9;LF.mhT=lfR(.18,.4);lfFx({k:"puff",x:ST.manhole[0]+lfR(-3,3),y:ST.manhole[1],vx:lfR(-2,2)+(ST.wx==="rain"?-3:0),vy:-lfR(5,9),r0:1,r1:lfR(3.5,6),life:2.6,c:"#e8eef4",a0:cold?.24:.12})}
 const hr=LF.hero;if(ST.spots.door){const d=ST.spots.door,minX=d[0]-6,maxX=ST.spots.garage?ST.spots.garage[0]+ST.spots.garage[2]-6:d[0]+60;if(!hr.x)hr.x=d[0]+20;
  if(hr.wait>0){hr.wait-=dt;hr.v=0}else{hr.v=9;hr.x+=hr.dir*9*dt;hr.f+=dt*9/2.2;if(hr.x>maxX||hr.x<minX){hr.dir*=-1;hr.wait=2+Math.random()*4}}}
 // puddle reflections (flipped, rippling) and lamp glints
 if(ST.puddles.length){for(const p of ST.puddles){for(let k=0;k<p.h;k++){const ww=Math.max(2,Math.round(p.w*(k===0||k===p.h-1?.7:1))),xo=p.x+((p.w-ww)>>1),dx=Math.round(Math.sin(t/260+k*1.9+p.s)*1.2),sy=Math.max(0,G-3-(p.y-G)*2-k*7);
    X.globalAlpha=.6;X.drawImage(ST.cityC,Math.max(0,Math.min(W-ww,xo+dx)),sy,ww,1,xo,p.y+k,ww,1);X.globalAlpha=.3;r(xo,p.y+k,ww,1,"#1a2440");X.globalAlpha=1}
   if(nt>.25)ST.lamps.forEach(([lx])=>{if(lx>p.x+1&&lx<p.x+p.w-1){X.globalAlpha=.8*nt;r(lx-1,p.y+(p.h>>1),3,1,"#ffe3a3");X.globalAlpha=1}});
   if(Math.random()<dt*2.5)lfFx({k:"ring",x:p.x+2+Math.random()*(p.w-4),y:p.y+(p.h>>1),life:.6})}}
 // traffic light lamps
 if(ST.tl){const L=ST.tl,ph=tl.ph,on=(y,c)=>{r(L.x,y,1,2,c);glow(L.x,y+1,3,c,.1+.12*nt)};if(ph==="R"||ph==="RY")on(L.y,"#ff3a3a");if(ph==="Y"||ph==="RY")on(L.y+3,"#ffc23a");if(ph==="G")on(L.y+6,"#4aff7a");
  const pg=lfPedGreen(),bl=pg&&tl.t>5.5&&(LF.T*4|0)%2;if(pg){if(!bl){r(L.px,L.py+3,1,2,"#4aff7a");glow(L.px,L.py+4,3,"#4aff7a",.2)}}else{r(L.px,L.py,1,2,"#ff3a3a");glow(L.px,L.py+1,3,"#ff3a3a",.15)}}
 // wire pigeons
 LF.wp.forEach(p=>{const b=Math.sin(LF.T*1.3+p.f)>.95?1:0;r(p.x-1,p.y-2-b,3,2,lfTn(p.c));r(p.x+(p.dir>0?1:-1),p.y-3-b,1,1,lfTn(sh(p.c,.75)))});
 // depth-sorted sidewalk and road
 const D=[];ST.props.forEach(p=>D.push([p.y,()=>X.drawImage(p.c,p.x,p.y-p.c.height+1)]));
 seatsDraw(D);LF.ents.forEach(e=>D.push([e.y+(e.k==="couple"?1:0),()=>entDraw(e)]));LF.pig.forEach(p=>D.push([p.y,()=>pigDraw(p)]));
 if(ST.spots.door)D.push([G+2,()=>pPut(LF.heroL,hr.x,G+2,hr.v>0?"walk":"stand","swing",Math.floor(hr.f)&3,"s",hr.dir)]);
 const M=S.car&&S.own["car_"+S.car]?carById(S.car):null;
 if(M&&ST.park)D.push([G+CURB_Y,()=>{const s=lfTint(carSide(M,null,false),.55),by=G+CURB_Y;X.globalAlpha=.32;r(ST.park-s.width/2+2,by+1,s.width-4,1,"#05050c");X.globalAlpha=1;X.drawImage(s,Math.round(ST.park-s.width/2),by-s.height+1)}]);
 LF.cars.forEach(c=>D.push([c.y,()=>carDraw(c,t)]));
 D.sort((a,b)=>a[0]-b[0]);D.forEach(d=>d[1]());
 fxDraw(dt)}
