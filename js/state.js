"use strict";
// ================= STATE =================
// ?slot=name keeps a separate save (handy for testing without touching the real one)
const KEY="discipline-pixel-v1"+((new URLSearchParams(location.search).get("slot")||"").replace(/[^a-z0-9]/gi,"")?"-"+new URLSearchParams(location.search).get("slot").replace(/[^a-z0-9]/gi,""):"");
const DAYS=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const fresh=()=>({v:3,name:"Герой",bal:0,earned:0,week:1,wk:"",streak:0,best:0,last:"",sound:true,scene:"street",fold:false,cnt:{},lastDone:"",closed:{},tg:{lamp:1,curtain:0,monitor:1,night:1,neon:1,tube:1},
 cfg:{d:2,b7:5,b30:40},
 habits:[{id:"pray",n:"Молитва + писание",goal:6,p:1,obj:"candle"},{id:"read",n:"10 стр. читать",goal:6,p:1,obj:"books"},{id:"sport",n:"Спорт",goal:5,p:1,obj:"gym"},
  {id:"pdd",n:"Билет ПДД",goal:5,p:1,obj:"road"},{id:"eng",n:"Английский 30 мин",goal:3,p:1,obj:"cards"},{id:"mem",n:"20 мин заучивания",goal:5,p:1,obj:"notes"}],
 rew:[{id:"fast",n:"Сходить в Мак или KFC",c:50},{id:"ps",n:"Плойка",c:50},{id:"cin",n:"Сходить в кино",c:50},{id:"trip",n:"Путешествие на неделю",c:500}],
 grid:{},own:{},hide:{},car:"",log:[]});
let S=fresh();
const save=()=>{if(S.__loadFailed)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const dkey=(d=new Date())=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const tIdx=()=>(new Date().getDay()+6)%7;
const monday=()=>{const d=new Date();d.setDate(d.getDate()-tIdx());return dkey(d)};
const row=h=>S.grid[h.id]||(S.grid[h.id]=[0,0,0,0,0,0,0]);
const done=h=>row(h).filter(Boolean).length;
// ---- habit objects, growth, neglect ----
const OBJS={books:"Книжный шкаф",gym:"Спортуголок",candle:"Молитвенный уголок",cards:"Английский: карточки и глобус",notes:"Доска с заметками",road:"Стенд ПДД (гараж)",plant:"Растение, которое растёт"};
const OBJ_DEF={pray:"candle",read:"books",sport:"gym",pdd:"road",eng:"cards",mem:"notes"};
const STAGES=[1,5,15,30,60,100];
const stageOf=n=>STAGES.filter(t=>n>=t).length;
const habitByObj=o=>S.habits.find(h=>h.obj===o);
// several habits may share a type: their completions add up
const objCount=o=>S.habits.filter(h=>h.obj===o).reduce((t,h)=>t+(S.cnt[h.id]||0),0);
const objStage=o=>S.habits.some(h=>h.obj===o)?stageOf(objCount(o)):0;
const dayDate=i=>{const d=new Date(monday()+"T12:00:00");d.setDate(d.getDate()+i);return dkey(d)};
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);
function neglect(){const q=QS.get("skip");if(q!==null)return Math.min(3,+q||0);if(!S.lastDone)return 0;const d=daysBetween(S.lastDone,dkey());return d<=1?0:Math.min(3,d-1)}
const closedNow=()=>{const h=hourNow();if(S.closed[dkey()]&&h>=17)return true;const y=new Date();y.setDate(y.getDate()-1);return !!S.closed[dkey(y)]&&h<6};
function migrate(o){if((o.v||2)<3){if(typeof o.cb==="number")o.bal=Math.max(0,o.bal+o.cb-(o.earned||0));delete o.cb;
  o.cnt=o.cnt||{};let ld="";for(const h of o.habits||[]){if(!h.obj)h.obj=OBJ_DEF[h.id]||"plant";const g=(o.grid||{})[h.id]||[];o.cnt[h.id]=(o.cnt[h.id]||0)+g.filter(Boolean).length;g.forEach((v,i)=>{if(v){const d=dayDate(i);if(d>ld)ld=d}})}
  if(o.last&&o.last>ld)ld=o.last;o.lastDone=o.lastDone||ld;o.v=3}
 (o.habits||[]).forEach(h=>{if(!h.obj)h.obj="plant"});o.cnt=o.cnt||{};o.closed=o.closed||{};o.tg=Object.assign({lamp:1,curtain:0,monitor:1,night:1,neon:1,tube:1},o.tg||{});return o}
// load after every helper above exists
try{const r=localStorage.getItem(KEY);if(r)S=migrate(Object.assign(fresh(),JSON.parse(r)))}catch(e){console.error("load failed",e);S.__loadFailed=true}
function weekRoll(){const m=monday();if(!S.wk){S.wk=m;return}if(S.wk!==m){S.wk=m;S.week++;S.grid={};logIt("Началась неделя "+S.week,0)}}
function logIt(t,n){S.log.unshift({t,n});S.log=S.log.slice(0,20)}
let ver=1; // bumps whenever the world must be rebuilt
function earn(n,why){S.bal+=n;S.earned+=n;logIt(why,n);save();ui()}

// ================= TIME / WEATHER =================
const QS=new URLSearchParams(location.search);
const QH=QS.get("hour");
const hourNow=()=>{if(QH!==null)return +QH;const d=new Date();return d.getHours()+d.getMinutes()/60};
function weather(){const q=QS.get("weather");if(q)return q;
 const d=new Date(),m=d.getMonth(),R=rng(d.getFullYear()*400+m*32+d.getDate()),v=R();
 if(m>=10||m<=2)return v<.45?"snow":v<.6?"fog":"clear";
 return v<.3?"rain":v<.38?"fog":"clear"}

// ================= SOUND (8-bit) =================
let AC=null;
function snd(seq){if(!S.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();let t=AC.currentTime;
 seq.forEach(([f,d,w="square",v=.07])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d);t+=d*.9})}catch(e){}}
const SFX={coin:()=>snd([[988,.07],[1319,.18]]),undo:()=>snd([[660,.07],[440,.14]]),buy:()=>snd([[523,.07],[659,.07],[784,.07],[1047,.22]]),
 no:()=>snd([[180,.18,"sawtooth",.05]]),door:()=>snd([[220,.05,"triangle",.12],[165,.09,"triangle",.12]]),
 fan:()=>snd([[523,.1],[523,.1],[523,.1],[698,.3],[880,.4]]),tick:()=>snd([[1200,.03,"square",.03]])};

// ================= SHOP ITEMS (hero budget) =================
const ITEMS=[
 {id:"st_tree",s:"street",n:"Дерево у дома",c:30},{id:"st_plants",s:"street",n:"Цветы в кадках",c:25},{id:"st_lights",s:"street",n:"Гирлянда над улицей",c:40},
 {id:"st_neon",s:"street",n:"Неоновая вывеска «ДОМ»",c:45},{id:"st_cat",s:"street",n:"Кот на балконе",c:20},{id:"st_roof",s:"street",n:"Сад на крыше",c:60},{id:"st_floor",s:"street",n:"Надстроить 3-й этаж",c:150},
 {id:"r_desk",s:"room",n:"Стол с большим монитором",c:70},{id:"r_chair",s:"room",n:"Компьютерное кресло",c:30},{id:"r_lamp",s:"room",n:"Настольная лампа (тёплый свет)",c:20},
 {id:"r_bed",s:"room",n:"Кровать с пледом",c:60},{id:"r_night",s:"room",n:"Тумбочка с ночником",c:25},{id:"r_ward",s:"room",n:"Белый шкаф",c:50},
 {id:"r_shelf",s:"room",n:"Полки с книгами и фигурками",c:35},{id:"r_sakura",s:"room",n:"Декоративная сакура",c:25},{id:"r_rug",s:"room",n:"Коврик-котик",c:20},
 {id:"r_poster",s:"room",n:"Постеры на стене",c:15},{id:"r_lights",s:"room",n:"Гирлянда",c:25},{id:"r_plant",s:"room",n:"Монстера",c:30},
 {id:"r_guitar",s:"room",n:"Гитара",c:40},{id:"r_bean",s:"room",n:"Кресло-мешок",c:35},{id:"r_ac",s:"room",n:"Кондиционер",c:20},
 {id:"r_records",s:"room",n:"Пластинки на стене",c:20},{id:"r_cat",s:"room",n:"Рыжий кот",c:30},
 {id:"g_tires",s:"garage",n:"Стеллаж с шинами",c:25},{id:"g_chest",s:"garage",n:"Красный ящик с инструментами",c:35},{id:"g_bench",s:"garage",n:"Верстак и стена с инструментами",c:40},
 {id:"g_neon",s:"garage",n:"Неон «ГАРАЖ»",c:40},{id:"g_lift",s:"garage",n:"Подъёмник",c:80},{id:"g_posters",s:"garage",n:"Постеры с машинами",c:20}];
const has=id=>!!S.own[id]&&!S.hide[id];

function importSave(o){if(!o||typeof o!=="object"||typeof o.bal!=="number")throw 0;
 if(o.v>=2)return migrate(Object.assign(fresh(),o));
 // old prototype save (Sunday-first week, separate shop/prem lists)
 const n=fresh();n.name=o.name||n.name;n.bal=o.bal;n.earned=o.earned||o.bal;n.week=o.week||1;n.streak=o.streak||0;n.best=o.best||0;n.last=o.last||"";
 if(o.cfg)n.cfg={d:o.cfg.d??2,b7:o.cfg.b7??5,b30:o.cfg.b30??40};
 if(Array.isArray(o.habits)&&o.habits.length)n.habits=o.habits.map(h=>({id:String(h.id),n:String(h.n),goal:h.goal||5,p:h.p??1}));
 const rw=[].concat(o.shop||[],o.prem||[]).filter(x=>x&&x.n);if(rw.length)n.rew=rw.map(x=>({id:String(x.id),n:String(x.n),c:x.c||0}));
 n.grid={};if(o.grid)for(const k in o.grid){const a=o.grid[k];if(Array.isArray(a)&&a.length===7)n.grid[k]=a.map((v,i)=>a[(i+1)%7])}
 n.log=Array.isArray(o.log)?o.log.slice(0,20):[];n.wk=monday();n.log.unshift({t:"Загружено из старой версии",n:0});n.v=2;n.cb=typeof o.cb==="number"?o.cb:o.bal;n.habits.forEach(h=>delete h.obj);return migrate(n)}
