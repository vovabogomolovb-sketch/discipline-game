"use strict";
// ================= SCENES =================
const cv=$("cv"),vx=$("vx");
const ICON={street:'<path d="M1 14h14v1H1zM2 6h4v8H2zM7 3h5v11H7zM13 8h2v6h-2zM3 7h1v1H3zM8 4h1v1H8zM10 4h1v1h-1zM8 7h1v1H8zM10 7h1v1h-1z"/>',
 room:'<path d="M8 1l7 6h-2v8H3V7H1zM6 10h4v5H6z"/>',garage:'<path d="M1 6l7-4 7 4v9h-2V8H3v7H1zM4 9h8v2H4zM4 12h8v1H4z"/>',
 week:'<path d="M2 3h12v12H2zM4 6v2h2V6zm3 0v2h2V6zm3 0v2h2V6zM4 10v2h2v-2zm3 0v2h2v-2z"/><path d="M4 1h2v3H4zM10 1h2v3h-2z"/>',
 shop:'<path d="M2 5h12l-1 10H3zM5 5a3 3 0 016 0h-1a2 2 0 00-4 0z"/>',up:'<path d="M8 2l5 5h-3v6H6V7H3z"/>',car:'<path d="M3 7l2-4h6l2 4h1v5h-2v2h-2v-2H6v2H4v-2H2V7zm2 0h6l-1-3H6zM4 9v1h2V9zm6 0v1h2V9z"/>',
 sofa:'<path d="M1 7h2v4h10V7h2v6h-1v2h-2v-2H4v2H2v-2H1zM4 4h8v6H4z"/>'};
const CHECK='<svg viewBox="0 0 16 16"><path d="M2 8l2-2 3 3 5-6 2 2-7 8z"/></svg>';
const svg=p=>`<svg viewBox="0 0 16 16">${p}</svg>`;
const NAMES={street:"Моя улица",room:"Квартира",garage:"Гараж"};
function go(sc){if(S.scene===sc)return;SFX.door();VX.heroScene="";if(sc!=="garage")engStop();$("fade").classList.add("on");setTimeout(()=>{S.scene=sc;save();VX.key="";ui();$("fade").classList.remove("on")},280)}

// ---- voxel scene presenter ----
const VX={key:"",mkey:"",model:null,bg:null,shadow:null,res:null,off:[0,0],center:[0,0],dpr:1,motes:[]};
// the scene fills the screen; the iso box has empty top corners, so the glass panels may overlap them
function voxArea(){const ir=$("info").getBoundingClientRect(),dr=$("dock").getBoundingClientRect(),w=innerWidth;
 const top=ir.bottom*.6,bottom=dr.top;
 return{x:0,y:top,w,h:Math.max(80,bottom-top)}}
const VS=3; // projection slope: 3 = low "viewer in the corner" camera
function voxPrepare(){const sc=S.scene,h=hourNow(),d=new Date();
 const ctx={nl:neglect(),sleep:closedNow(),preview:PREVIEW,engine:sc==="garage"&&ENG.on};
 const mkey=sc+"|"+ver+"|"+(sc==="room"?d.getHours()+":"+d.getMinutes():"")+"|"+Math.floor(h*4)+"|"+JSON.stringify(ctx)+JSON.stringify(S.tg);
 if(mkey!==VX.mkey){VX.mkey=mkey;VX.model=sc==="room"?buildRoom(h,ctx):buildGarage(h,ctx);VX.key="";VX.ctx=ctx;buildGrid(VX.model.V);
  if(VX.heroScene!==sc){VX.heroScene=sc;const st=VX.model.stations.door;heroPlace(st);if(PENDING&&VX.model.stations[PENDING]){heroAct(PENDING)}PENDING=null}}
 const dpr=Math.min(2.5,devicePixelRatio||1),A=voxArea(),V=VX.model.V,ar=A.w*dpr/(V.X+V.Y)*(sc==='garage'?1.4:1.15),br=A.h*dpr/((V.X+V.Y)/VS+V.Z*1.25)*1.12;
 const a=Math.max(VS,Math.round(Math.min(ar,br)/VS)*VS),key=mkey+"|"+a+"|"+innerWidth+"x"+innerHeight;
 if(key===VX.key)return;VX.key=key;VX.dpr=dpr;
 const m=VX.model,res=voxRender(V,{a,s:VS,lights:m.lights,amb:m.amb,beam:m.beam,beamC:m.beamC,glows:m.glows,buf:true});VX.res=res;
 vx.width=innerWidth*dpr|0;vx.height=innerHeight*dpr|0;
 const bg=layer(vx.width,vx.height),g=bg.getContext("2d"),nt=night(h);
 const bgA=sc==="garage"?["#2b2e3d","#11121a"]:nt>.5?["#23264a","#0c0d1c"]:nt>.15?["#5a4a6e","#241d33"]:["#e7dccd","#b9a690"];
 const gr=g.createRadialGradient(bg.width/2,bg.height*.45,10,bg.width/2,bg.height*.5,Math.max(bg.width,bg.height)*.75);gr.addColorStop(0,bgA[0]);gr.addColorStop(1,bgA[1]);g.fillStyle=gr;g.fillRect(0,0,bg.width,bg.height);VX.bg=bg;
 VX.center=[(A.x+A.w/2)*dpr,(A.y+A.h/2)*dpr];voxOff();
 VX.motes=[];if(m.beam)for(let i=0;i<26;i++)VX.motes.push([3+Math.random()*12,6+Math.random()*12,3+Math.random()*16,Math.random()*6.28]);
 placeSpots()}
// bottom-anchored: the front floor corner sits just above the dock, walls may go under the top panel
function voxOff(){const res=VX.res;if(!res)return;const A=voxArea(),d=VX.dpr;
 VX.off=[Math.round(VX.center[0]-res.W/2),Math.round(Math.min(A.y*d+(A.h*d-res.H)/2,(A.y+A.h)*d-res.H+res.a))]}
function drawVox(t,dt){voxPrepare();const g=vx.getContext("2d");g.drawImage(VX.bg,0,0);g.drawImage(VX.res.cv,VX.off[0],VX.off[1]);
 const res=VX.res,[ox,oy]=VX.off,m=VX.model;
 engTick(dt);
 if(!(S.scene==="room"&&VX.ctx.sleep)&&!(S.scene==="garage"&&ENG.on)){heroTick(dt,m.idle);const amb=m.amb.map(v=>Math.round(Math.min(1,v*1.08)*20)/20),sp=heroSprite(HERO.pose,heroFrame(),HERO.face,res.a,amb,res.s);
  let hz=2;if(HERO.pose==="pullup")hz=heroFrame()?7:5;drawHeroVox(g,res,VX.off,sp,HERO.x-sp.X/2,HERO.y-sp.Y/2,hz)}
 if(S.scene==="room"&&m.beam){g.fillStyle="#fff6d8";VX.motes.forEach(([x,y,z,p])=>{const q=res.proj(x+Math.sin(t/3000+p)*1.5,y,z+Math.sin(t/2200+p*2)*2);g.globalAlpha=.35+.35*Math.sin(t/700+p*5);g.fillRect(ox+q[0],oy+q[1],Math.max(1,res.a/4),Math.max(1,res.a/4))});g.globalAlpha=1}
 if(S.scene==="garage")drawSmoke(g,res,ox,oy,dt);
 if(S.scene==="room"&&m.glows.length){g.globalCompositeOperation="lighter";m.glows.forEach(([x,y,z,c],i)=>{const k=Math.sin(t/500+i*1.7);if(k<.4)return;const q=res.proj(x,y,z),R=res.a*1.6;g.globalAlpha=(k-.4)*.5;g.fillStyle="#ffd27a";g.beginPath();g.arc(ox+q[0],oy+q[1],R,0,7);g.fill()});g.globalAlpha=1;g.globalCompositeOperation="source-over"}}

// ---- hotspots ----
function placeSpots(){const box=$("spots"),sc=S.scene;let L=[];
 if(sc==="street"){const k=ST.scale,sp=ST.spots;
  if(sp.lavka)L.push({r:sp.lavka.map(v=>v*k),l:"Лавка наград",a:dlgShop});
  if(sp.door)L.push({r:sp.door.map(v=>v*k),l:"Домой",a:()=>go("room")});
  if(sp.garage)L.push({r:sp.garage.map(v=>v*k),l:"Гараж",a:()=>go("garage")})}
 else if(VX.res&&VX.model&&VX.model.spots.door){const [x,y,z]=VX.model.spots.door,q=VX.res.proj(x,y,z),d=VX.dpr,cx=(VX.off[0]+q[0])/d,cy=(VX.off[1]+q[1])/d,s=VX.res.a*5/d;
  L.push({r:[cx-s,cy-s*1.4,s*2,s*2.8],l:"На улицу",a:()=>go("street")})}
 box.innerHTML="";L.forEach(s=>{const b=document.createElement("button");b.className="spot";b.style.cssText=`left:${s.r[0]}px;top:${s.r[1]}px;width:${s.r[2]}px;height:${s.r[3]}px`;b.innerHTML=`<span>${s.l}</span>`;b.setAttribute("aria-label",s.l);b.onclick=s.a;box.appendChild(b)})}

// ---- main loop ----
let last=performance.now(),acc=0,lastSpots="";
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.1,(t-last)/1000);acc+=dt;if(acc<1/30)return;last=t;const d=acc;acc=0;
 const sc=S.scene;cv.hidden=sc!=="street";vx.hidden=sc==="street";
 if(sc==="street"){const dr=$("dock").getBoundingClientRect();streetSize(innerWidth,innerHeight,dr.top);if(cv.width!==ST.W||cv.height!==ST.H){cv.width=ST.W;cv.height=ST.H}
  X=cv.getContext("2d");X.imageSmoothingEnabled=false;drawStreet(t,d);const sk=JSON.stringify(ST.spots)+ST.scale;if(sk!==lastSpots){lastSpots=sk;placeSpots()}}
 else{lastSpots="";drawVox(t,d)}
 sparks(d)}
// purchase sparkles (DOM)
function burst(n=24){for(let i=0;i<n;i++){const e=document.createElement("i");e.className="fly";e.style.background=["#ffd23f","#73eff7","#7be38a","#fff"][i%4];e.style.left=innerWidth/2+"px";e.style.top=innerHeight*.4+"px";document.body.appendChild(e);
 requestAnimationFrame(()=>{e.style.transform=`translate(${(Math.random()-.5)*innerWidth*.6}px,${(Math.random()-.7)*innerHeight*.5}px) rotate(${Math.random()*360}deg)`;e.style.opacity="0"});setTimeout(()=>e.remove(),700)}}
function sparks(){}

// ================= UI =================
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),2600)}
function arm(btn,fn){if(btn.dataset.arm){clearTimeout(btn._tm);delete btn.dataset.arm;btn.textContent=btn.dataset.t;fn();return}
 btn.dataset.arm=1;btn.dataset.t=btn.textContent;btn.textContent="Точно?";btn._tm=setTimeout(()=>{delete btn.dataset.arm;btn.textContent=btn.dataset.t},3000)}
function fly(from,toId,col,n=3){const a=from.getBoundingClientRect(),b=$(toId).getBoundingClientRect();
 for(let i=0;i<n;i++){const e=document.createElement("i");e.className="fly";e.style.background=col;e.style.left=(a.left+a.width/2-6+i*5)+"px";e.style.top=(a.top+a.height/2-6)+"px";document.body.appendChild(e);
  setTimeout(()=>{e.style.transform=`translate(${b.left+14-a.left-a.width/2-i*5}px,${b.top+10-a.top-a.height/2}px)`;e.style.opacity=".3"},20+i*70);
  setTimeout(()=>{e.remove();const p=$(toId);p.classList.remove("bump");void p.offsetWidth;p.classList.add("bump")},680+i*70)}}
function ui(){
 $("vBal").textContent=S.bal;$("vSt").textContent=S.streak;
 $("snd").classList.toggle("off",!S.sound);$("ttl").textContent=NAMES[S.scene];$("info").classList.toggle("compact",S.scene!=="street");
 const sc=S.scene,C=(id,ic,t,on)=>`<button class="chip ${on?"on":""}" id="${id}">${svg(ICON[ic])}${t}</button>`;
 $("chips").innerHTML=C("cS","street","Улица",sc==="street")+C("cR","room","Квартира",sc==="room")+C("cG","garage","Гараж",sc==="garage")+`<span class="chip sep"></span>`+
  C("cW","week","Неделя")+C("cL","shop","Лавка")+(sc==="street"?C("cU","up","Улучшить"):sc==="room"?C("cF","sofa","Обставить"):C("cE","car",ENG.on?"Заглушить":"Завести",ENG.on)+(ENG.on?C("cGas","up","Газ"):"")+C("cA","car","Автосалон")+C("cD","up","Обустроить"));
 const on=(id,f)=>{const e=$(id);if(e)e.onclick=f};
 on("cS",()=>go("street"));on("cR",()=>go("room"));on("cG",()=>go("garage"));on("cW",dlgWeek);on("cL",dlgShop);
 on("cU",()=>dlgItems("street"));on("cE",()=>engToggle());
 const gb=$("cGas");if(gb){const dn=e=>{e.preventDefault();ENG.gas=true;gb.classList.add("on")},up=()=>{ENG.gas=false;gb.classList.remove("on")};gb.onpointerdown=dn;gb.onpointerup=up;gb.onpointerleave=up;gb.onpointercancel=up}on("cF",()=>dlgItems("room"));on("cA",dlgCars);on("cD",()=>dlgItems("garage"));
 renderToday();tickInfo()}
function tickInfo(){const d=new Date(),h=hourNow(),hh=QH!==null?Math.floor(h):d.getHours(),mm=QH!==null?Math.round((h%1)*60):d.getMinutes();
 $("clock").textContent=pad(hh)+":"+pad(mm)+" местное время";
 $("sub").textContent=S.scene==="street"?wxText():S.scene==="room"?(night(h)>.5?"Тёплый свет ламп, ночь за окном":"Солнце светит в окно"):(S.car&&S.own["car_"+S.car]?carById(S.car).n:"Пока без машины — загляни в автосалон")}
function renderToday(){const i=tIdx(),d=new Date(),MON=["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
 const dn=S.habits.filter(h=>row(h)[i]).length,tot=S.habits.length,pts=S.habits.reduce((a,h)=>a+(row(h)[i]||0),0)+(S.last===dkey()?S.cfg.d:0);
 const hl=S.habits.map(h=>{const v=row(h)[i],n=done(h);return `<button class="hb ${v?"on":""} ${n>=h.goal?"goal":""}" data-h="${h.id}" aria-pressed="${!!v}"><span class="ck">${CHECK}</span><span class="hn">${esc(h.n)}<small>${n}/${h.goal} нед · +${h.p}</small></span></button>`}).join("")||`<div class="mute">Привычек нет — добавь в меню</div>`;
 const cl=S.last===dkey(),st=S.streak,n7=7-st%7;
 const T=$("today"),fk=S.scene==="street"?"fold":"foldV";if(S[fk]===undefined)S[fk]=fk==="foldV";const folded=!!S[fk];T.classList.toggle("fold",folded);
 T.innerHTML=`<div class="th"><button class="play" id="fold" aria-label="${folded?"Развернуть":"Свернуть"} список">${folded?svg('<path d="M4 2l10 6-10 6z"/>'):svg('<path d="M3 3h4v10H3zM9 3h4v10H9z"/>')}</button>
  <div class="tt"><b>Сегодня · ${DAYS[i].toLowerCase()} ${d.getDate()} ${MON[d.getMonth()]}</b><small>${dn}/${tot} привычек · +${pts} сегодня${cl?" · без срыва ✓":""}</small><div class="bar"><i style="width:${tot?dn/tot*100:0}%"></i></div></div></div>
  <div class="hl">${hl}</div>
  <div class="abs"><div class="grow"><b>${st}</b> <span class="mute">дн. без срыва</span><small>рекорд ${Math.max(S.best||0,st)} · бонус +${S.cfg.b7} через ${n7} дн.</small></div>
  <button class="b ${cl?"g":"ok"} sm" id="clean" ${cl?"disabled":""}>${cl?"Отмечено":"Без срыва +"+S.cfg.d}</button><button class="b r sm" id="slip">Срыв</button></div>${(!S.closed[dkey()]&&(hourNow()>=18||dn===tot&&tot>0))?`<button class="b" id="closeDay" style="width:100%;margin-top:10px">Закрыть день</button>`:""}`;
 if($("closeDay"))$("closeDay").onclick=dlgClose;
 $("fold").onclick=()=>{S[fk]=!S[fk];save();renderToday();VX.key=""};
 T.querySelectorAll(".hb").forEach(b=>b.onclick=()=>toggle(b.dataset.h,i,b));
 $("clean").onclick=e=>{if(S.last===dkey())return;S.last=dkey();S.streak++;S.best=Math.max(S.best||0,S.streak);let g=S.cfg.d,why="День без срыва ("+S.streak+")";
  if(S.streak%30===0){g+=S.cfg.b30;why+=" + бонус 30 дней"}else if(S.streak%7===0){g+=S.cfg.b7;why+=" + бонус 7 дней"}
  fly(e.currentTarget,"pBal","#ffd23f");const n0=neglect();S.lastDone=dkey();earn(g,why);recovered(n0);if(g>S.cfg.d){SFX.fan();burst(40);toast("Серия "+S.streak+" дней! Бонус +"+(g-S.cfg.d))}else SFX.coin()};
 $("slip").onclick=e=>arm(e.target,()=>{logIt("Срыв. Серия была "+S.streak+" дн.",0);S.streak=0;S.last="";save();SFX.no();ui();toast("Ничего. Начинаем заново — с сегодняшнего дня.")})}
function toggle(id,i,btn){const h=S.habits.find(x=>x.id===id);if(!h)return;const rw=row(h),s0=objStage(h.obj),n0=neglect();
 if(rw[i]){const g=rw[i];rw[i]=0;S.cnt[id]=Math.max(0,(S.cnt[id]||0)-1);ver++;earn(-g,"Отмена: "+h.n+" ("+DAYS[i]+")");SFX.undo()}
 else{rw[i]=h.p;S.cnt[id]=(S.cnt[id]||0)+1;const dd=dayDate(i);if(dd>S.lastDone)S.lastDone=dd;ver++;if(btn)fly(btn,"pBal","#ffd23f",3);earn(h.p,h.n+" ("+DAYS[i]+")");SFX.coin();
  const s1=objStage(h.obj);
  if(s1>s0){setTimeout(()=>{toast(OBJS[h.obj]+": уровень "+s1+"!");SFX.fan();burst(36)},900)}
  else if(done(h)===h.goal){toast("Цель недели: "+h.n+"!");SFX.fan();burst(30)}
  recovered(n0);if(i===tIdx())heroDo(h.obj)}
 if($("dlg").classList.contains("on")&&dlgWeek.open)dlgWeek()}

// ================= HERO GLUE / DAY RITUAL =================
let PENDING=null,PREVIEW=null;
function heroAct(obj){const st=VX.model&&VX.model.stations[obj];if(!st)return;let pose=st[3];if(obj==="gym"&&objStage("gym")>=4)pose="pullup";
 heroGo(st[0],st[1],{pose,face:st[2],t:3.6,done:()=>burst(14)})}
function heroDo(obj){const where=obj==="road"?"garage":"room";if(S.scene===where&&VX.model)heroAct(obj);else{PENDING=obj;toast("Герой займётся этим, когда зайдёшь "+(where==="room"?"в квартиру":"в гараж"))}}
function recovered(n0){if(n0>0&&neglect()===0){ver++;setTimeout(()=>{toast("Порядок наведён! Дом снова живой");burst(30)},500)}}
function dlgClose(){const i=tIdx(),dn=S.habits.filter(h=>row(h)[i]).length,tot=S.habits.length,pts=S.habits.reduce((a,h)=>a+(row(h)[i]||0),0)+(S.last===dkey()?S.cfg.d:0);
 const msg=dn===tot?"Идеальный день. Так и строится дисциплина.":dn>0?"Хороший день. Завтра — ещё на шаг дальше.":"День без отметок бывает. Главное — завтра вернуться.";
 openDlg(`<h2>Итоги дня</h2><p class="mute">${msg}</p><div class="it"><span class="nm">Привычки</span><span class="pr">${dn}/${tot}</span></div><div class="it"><span class="nm">Баллы за день</span><span class="pr">+${pts}</span></div><div class="it"><span class="nm">Без срыва</span><span class="pr">${S.streak} дн.</span></div>
  <div class="row" style="margin-top:14px"><button class="b" id="sleep">Закрыть день · +1</button></div>`);
 $("sleep").onclick=()=>{S.closed[dkey()]=1;earn(1,"День закрыт");SFX.fan();closeDlg();ver++;toast("Спокойной ночи, "+S.name+"!");if(S.scene!=="room")go("room")}}

// ================= TAPS ON THE SCENE =================
function engToggle(){const M=S.car&&S.own["car_"+S.car]?carById(S.car):null;if(!M){toast("Сначала купи машину в автосалоне");return}
 if(ENG.on){engStop();toast("Мотор заглушен")}else{engStart(M);toast(M.n+": завёлся!")}ui()}
function hitTag(e){const res=VX.res;if(!res||!res.ids)return"";const d=VX.dpr,rx=Math.round(e.clientX*d-VX.off[0]),ry=Math.round(e.clientY*d-VX.off[1]);
 if(rx<0||ry<0||rx>=res.W||ry>=res.H)return"";const id=res.ids[ry*res.W+rx];return(S.scene==="room"?RTAG:GTAG)[id]||""}
function markObj(obj){const hs=S.habits.filter(h=>h.obj===obj),i=tIdx();if(!hs.length){toast("Привяжи к этому предмету привычку в меню");return}
 const h=hs.find(x=>!row(x)[i]);if(h){toggle(h.id,i,null);toast("Отмечено: "+h.n)}else{heroAct(obj);toast("Сегодня уже сделано — красавчик")}}
function flip(k,snd2,msg){S.tg[k]=S.tg[k]?0:1;save();snd2&&snd2();if(msg)toast(msg(S.tg[k]))}
vx.addEventListener("click",e=>{const t=hitTag(e);if(!t)return;
 if(S.scene==="room"){
  if(t==="lamp")flip("lamp",SND.click,v=>v?"Лампа включена":"Лампа выключена");
  else if(t==="curtain"||t==="window")flip("curtain",SND.swish,v=>v?"Шторы задёрнуты":"Шторы открыты");
  else if(t==="monitor")flip("monitor",SND.beep,v=>v?"Монитор включён":"Монитор выключен");
  else if(t==="night")flip("night",SND.click,v=>v?"Ночник включён":"Ночник выключен");
  else if(t==="cat"){SND.purr();hearts(e.clientX,e.clientY);toast("Мрр…")}
  else if(t==="records"){SND.record();toast("Играет пластинка")}
  else if(t==="guitar"){SND.guitar()}
  else if(t==="bed"){if(hourNow()>=18&&!S.closed[dkey()])dlgClose();else toast(closedNow()?"Герой спит":"Спать ещё рано")}
  else if(t==="door")go("street");
  else if(["books","gym","candle","cards","notes","plant"].includes(t))markObj(t);
  else if(t==="ward"){SND.click();toast("В шкафу порядок")}
  else if(t==="bean"){noiseHit(.3,400,.5,.15);toast("Плюх!")}}
 else if(S.scene==="garage"){
  if(t==="car")engToggle();else if(t==="neon"){flip("neon",SND.neon)}else if(t==="tube")flip("tube",SND.click,v=>v?"Свет включён":"Свет выключен");
  else if(t==="road")markObj("road");else if(t==="door")go("street")}});
vx.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;vx.style.cursor=hitTag(e)?"pointer":"default"});
function hearts(x,y){for(let i=0;i<6;i++){const e=document.createElement("i");e.className="fly";e.textContent="";e.style.cssText+=`left:${x}px;top:${y}px;background:#ff6b8a;border-radius:50%`;document.body.appendChild(e);
 requestAnimationFrame(()=>{e.style.transform=`translate(${(Math.random()-.5)*60}px,${-40-Math.random()*50}px)`;e.style.opacity="0"});setTimeout(()=>e.remove(),700)}}
// exhaust smoke from the tailpipe while the engine runs
const SMOKE=[];
function drawSmoke(g,res,ox,oy,dt){const sp=VX.model.spots.car;
 if(ENG.on&&sp){const n=ENG.gas?4:1;for(let i=0;i<n;i++)if(Math.random()<.5){const p=res.proj(sp.x0,sp.y0+sp.W-5,sp.z0+3);SMOKE.push({x:ox+p[0],y:oy+p[1],vx:-(8+Math.random()*14)*res.a/10,vy:-(6+Math.random()*10)*res.a/10,r:res.a*(.5+Math.random()*.4),l:1.4+Math.random(),dark:ENG.gas})}}
 for(let i=SMOKE.length-1;i>=0;i--){const q=SMOKE[i];q.l-=dt;if(q.l<=0){SMOKE.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.r+=res.a*.6*dt;
  g.globalAlpha=Math.min(.45,q.l*.3);g.fillStyle=q.dark?"#5a5c63":"#b9bcc2";g.beginPath();g.arc(q.x,q.y,q.r,0,7);g.fill()}g.globalAlpha=1}

// ================= DIALOGS =================
function openDlg(html){$("dc").innerHTML=html;$("dlg").classList.add("on");dlgWeek.open=false}
function closeDlg(){$("dlg").classList.remove("on");dlgWeek.open=false;ui()}
$("dx").onclick=closeDlg;$("dlg").addEventListener("click",e=>{if(e.target.id==="dlg")closeDlg()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&$("dlg").classList.contains("on"))closeDlg()});
function dlgWeek(){const ti=tIdx();
 let h=`<h2>Неделя ${S.week}</h2><p class="mute">Можно отметить и прошлый день, если забыл. Новая неделя начнётся сама в понедельник.</p><div class="wrap"><table><tr><th></th>${DAYS.map((d,i)=>`<th class="${i===ti?"t":""}">${d}</th>`).join("")}<th></th></tr>`;
 S.habits.forEach(x=>{const rw=row(x),n=done(x);h+=`<tr><td class="n">${esc(x.n)}</td>${rw.map((v,i)=>`<td><button class="cell ${v?"on":""} ${i===ti?"t":""}" data-h="${x.id}" data-i="${i}" aria-label="${esc(x.n)}, ${DAYS[i]}" aria-pressed="${!!v}">${v?svg('<path d="M2 8l2-2 3 3 5-6 2 2-7 8z"/>'):""}</button></td>`).join("")}<td class="gl ${n>=x.goal?"ok":""}">${n}/${x.goal}</td></tr>`});
 const all=S.habits.reduce((a,x)=>a+done(x),0),goal=S.habits.reduce((a,x)=>a+x.goal,0);
 h+=`</table></div><p class="mute">Выполнено ${all} из ${goal}.</p>`;
 openDlg(h);dlgWeek.open=true;document.querySelectorAll("#dc .cell").forEach(b=>b.onclick=()=>toggle(b.dataset.h,+b.dataset.i,null))}
function dlgShop(){const L=S.rew.slice().sort((a,b)=>a.c-b.c);
 openDlg(`<h2>Лавка наград</h2><p class="mute">Баллы: <b style="color:var(--y)">${S.bal}</b>. Те же баллы можно вложить в квартиру и гараж — выбирай, что важнее сейчас.</p>`+
  (L.map(x=>`<div class="it"><span class="nm">${esc(x.n)}</span><span class="pr">${x.c}</span><button class="b sm" data-r="${x.id}" ${S.bal<x.c?"disabled":""}>Купить</button></div>`).join("")||`<p class="mute">Наград нет — добавь в меню.</p>`));
 document.querySelectorAll("#dc [data-r]").forEach(b=>b.onclick=()=>arm(b,()=>{const x=S.rew.find(y=>y.id===b.dataset.r);if(!x||S.bal<x.c){SFX.no();return}
  S.bal-=x.c;logIt("Награда: "+x.n,-x.c);save();SFX.buy();burst(40);closeDlg();toast("Награда получена: "+x.n)}))}
const TITLES={room:"Обставить квартиру",street:"Улучшить улицу",garage:"Обустроить гараж"};
function dlgItems(s){const L=ITEMS.filter(i=>i.s===s);
 openDlg(`<h2>${TITLES[s]}</h2><p class="mute">Баллы: <b style="color:var(--y)">${S.bal}</b>. Купленное сразу появляется в сцене.</p>`+
  L.map(x=>{const own=S.own[x.id],vis=own&&!S.hide[x.id];return `<div class="it"><span class="nm">${esc(x.n)}</span>`+
   (own?`<button class="b sm g" data-v="${x.id}">${vis?"Убрать":"Поставить"}</button>`:`<span class="pr gem">${x.c}</span><button class="b sm" data-b="${x.id}" ${S.bal<x.c?"disabled":""}>Купить</button>`)+`</div>`}).join(""));
 document.querySelectorAll("#dc [data-b]").forEach(b=>b.onclick=()=>{const x=ITEMS.find(y=>y.id===b.dataset.b);if(!x||S.own[x.id]||S.bal<x.c){SFX.no();return}
  S.bal-=x.c;S.own[x.id]=1;logIt("Куплено: "+x.n,0);ver++;save();SFX.buy();closeDlg();if(S.scene!==s)go(s);setTimeout(()=>burst(36),300);toast("Новое: "+x.n)});
 document.querySelectorAll("#dc [data-v]").forEach(b=>b.onclick=()=>{const id=b.dataset.v;S.hide[id]=!S.hide[id];ver++;save();SFX.tick();dlgItems(s)})}
const thumbCache={};
function carThumb(m){if(thumbCache[m.id])return thumbCache[m.id];const res=voxRender(buildCar(m),{a:4,amb:[1,1,1],lights:[]});return thumbCache[m.id]=res.cv.toDataURL()}
function dlgCars(){
 openDlg(`<h2>Автосалон</h2><p class="mute">Баллы: <b style="color:var(--y)">${S.bal}</b>. Купленная машина встанет в гараж и у дома.</p>`+
  CARS.map(m=>{const own=S.own["car_"+m.id];return `<div class="it"><img alt="${esc(m.n)}" src="${carThumb(m)}"><span class="nm">${esc(m.n)}</span>`+
   (own?(S.car===m.id?`<span class="pr">У дома</span>`:`<button class="b sm g" data-u="${m.id}">Поставить</button>`):`<span class="pr gem">${m.c}</span><button class="b sm" data-c="${m.id}" ${S.bal<m.c?"disabled":""}>Купить</button>`)+`</div>`}).join(""));
 document.querySelectorAll("#dc [data-c]").forEach(b=>b.onclick=()=>{const m=carById(b.dataset.c);if(!m||S.own["car_"+m.id]||S.bal<m.c){SFX.no();return}
  S.bal-=m.c;S.own["car_"+m.id]=1;S.car=m.id;logIt("Машина: "+m.n,0);ver++;save();SFX.fan();closeDlg();setTimeout(()=>burst(50),300);toast("Твоя новая машина: "+m.n)});
 document.querySelectorAll("#dc [data-u]").forEach(b=>b.onclick=()=>{S.car=b.dataset.u;ver++;save();SFX.tick();dlgCars()})}
function dlgMenu(){
 const H=S.habits.map(x=>`<div class="ed"><input class="n" value="${esc(x.n)}" data-k="h" data-id="${x.id}" data-f="n" aria-label="Привычка"><input class="s" type="number" min="1" max="7" value="${x.goal}" data-k="h" data-id="${x.id}" data-f="goal" aria-label="Цель дней в неделю"><input class="s" type="number" min="0" value="${x.p}" data-k="h" data-id="${x.id}" data-f="p" aria-label="Баллы за день"><select data-k="h" data-id="${x.id}" data-f="obj" aria-label="Что растёт в мире">${Object.keys(OBJS).map(k=>`<option value="${k}"${k===x.obj?" selected":""}>${OBJS[k]}</option>`).join("")}</select><button class="b sm r" data-del="h" data-id="${x.id}">Удалить</button></div>`).join("");
 const Rw=S.rew.map(x=>`<div class="ed"><input class="n" value="${esc(x.n)}" data-k="r" data-id="${x.id}" data-f="n" aria-label="Награда"><input class="s" type="number" min="0" value="${x.c}" data-k="r" data-id="${x.id}" data-f="c" aria-label="Цена"><button class="b sm r" data-del="r" data-id="${x.id}">Удалить</button></div>`).join("");
 openDlg(`<h2>Меню</h2>
 <label class="l" for="nm">Имя героя</label><div class="ed"><input class="n" id="nm" maxlength="20" value="${esc(S.name)}"></div>
 <h3>Привычки · цель дней/нед · баллы · что растёт в мире</h3>${H}<button class="b sm g" data-add="h">+ Привычка</button>
 <h3>Награды · цена</h3>${Rw}<button class="b sm g" data-add="r">+ Награда</button>
 <h3>Воздержание · баллы/день · бонус 7 · бонус 30</h3><div class="ed">${["d","b7","b30"].map(f=>`<input class="s" type="number" min="0" value="${S.cfg[f]}" data-k="c" data-f="${f}" aria-label="${f}">`).join("")}</div>
 <h3>Журнал</h3><ul class="log">${S.log.length?S.log.map(l=>`<li><b>${l.n>0?"+":""}${l.n||""}</b> ${esc(l.t)}</li>`).join(""):"<li>Пока пусто.</li>"}</ul>
 <h3>Сохранение</h3><p class="mute">Прогресс хранится в этом браузере. «Получить код» — скопируй и сохрани в заметках. Чтобы перенести игру (или загрузить код из старой версии), вставь код и нажми «Загрузить».</p>
 <textarea id="code" rows="4" aria-label="Код сохранения"></textarea>
 <div class="row" style="margin-top:8px"><button class="b sm" id="exp">Получить код</button><button class="b sm g" id="cp">Копировать</button><button class="b sm r" id="imp">Загрузить</button></div>
 <h3>Прочее</h3><div class="row"><button class="b sm g" id="nw">Новая неделя</button><button class="b sm r" id="rs">Сбросить игру</button></div>`);
 $("nm").onchange=e=>{S.name=e.target.value.trim()||"Герой";save()};
 document.querySelectorAll("#dc input[data-k],#dc select[data-k]").forEach(inp=>inp.onchange=()=>{const k=inp.dataset.k,f=inp.dataset.f;let v=inp.type==="number"?Math.max(0,parseInt(inp.value)||0):inp.value.trim();if(f==="obj")ver++;
  if(k==="c"){S.cfg[f]=v}else{const L=k==="h"?S.habits:S.rew,x=L.find(y=>y.id===inp.dataset.id);if(!x)return;if(f==="goal")v=Math.min(7,Math.max(1,v));if(f==="n"&&!v)return;x[f]=v}save();ui()});
 document.querySelectorAll("#dc [data-del]").forEach(b=>b.onclick=()=>arm(b,()=>{const k=b.dataset.del;if(k==="h")S.habits=S.habits.filter(x=>x.id!==b.dataset.id);else S.rew=S.rew.filter(x=>x.id!==b.dataset.id);save();ui();dlgMenu()}));
 document.querySelectorAll("#dc [data-add]").forEach(b=>b.onclick=()=>{const id="x"+Date.now().toString(36);if(b.dataset.add==="h")S.habits.push({id,n:"Новая привычка",goal:5,p:1,obj:"plant"});else S.rew.push({id,n:"Новая награда",c:50});save();ui();dlgMenu()});
 $("exp").onclick=()=>{$("code").value=JSON.stringify(S);$("code").select()};
 $("cp").onclick=()=>{if(!$("code").value)$("code").value=JSON.stringify(S);try{navigator.clipboard.writeText($("code").value).then(()=>toast("Код скопирован"),()=>{$("code").select();toast("Выдели и скопируй вручную")})}catch(e){$("code").select()}};
 $("imp").onclick=e=>arm(e.target,()=>{try{S=importSave(JSON.parse($("code").value));ver++;save();closeDlg();toast("Игра загружена")}catch(err){SFX.no();toast("Код не подошёл")}});
 $("nw").onclick=e=>arm(e.target,()=>{S.week++;S.grid={};S.wk=monday();logIt("Началась неделя "+S.week,0);save();closeDlg();toast("Неделя "+S.week)});
 $("rs").onclick=e=>arm(e.target,()=>{S=fresh();S.wk=monday();ver++;save();closeDlg();toast("Игра сброшена")})}
$("menu").onclick=dlgMenu;
$("snd").onclick=()=>{S.sound=!S.sound;save();ui();SFX.tick()};
addEventListener("resize",()=>{VX.key="";lastSpots=""});

// ================= START =================
weekRoll();save();ui();requestAnimationFrame(frame);
setInterval(()=>{if(S.wk!==monday()){weekRoll();save();ui()}tickInfo()},20000);
