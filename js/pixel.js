"use strict";
// ================= 2D PIXEL HELPERS =================
let X=null; // current 2d context
function hexN(h){return parseInt(h.slice(1,7),16)}
function sh(c,f){const n=hexN(c),m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return"#"+((1<<24)+(m(n>>16)<<16)+(m(n>>8&255)<<8)+m(n&255)).toString(16).slice(1)}
function mix(a,b,t){const A=hexN(a),B=hexN(b),f=s=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t);return"#"+((1<<24)+(f(16)<<16)+(f(8)<<8)+f(0)).toString(16).slice(1)}
const r=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function poly(p,c){X.fillStyle=c;let a=1e9,b=-1e9;for(const q of p){a=Math.min(a,q[1]);b=Math.max(b,q[1])}
 for(let y=Math.round(a);y<Math.round(b);y++){const s=y+.5;let l=1e9,rr=-1e9;
  for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length];if((u[1]<=s&&v[1]>s)||(v[1]<=s&&u[1]>s)){const x=u[0]+(s-u[1])*(v[0]-u[0])/(v[1]-u[1]);l=Math.min(l,x);rr=Math.max(rr,x)}}
  const x0=Math.round(l),x1=Math.round(rr);if(x1>x0)X.fillRect(x0,y,x1-x0,1)}}
function disc(cx,cy,rad,c){X.fillStyle=c;for(let dy=-rad;dy<=rad;dy++){const w=Math.round(Math.sqrt(rad*rad-dy*dy));if(w>0)X.fillRect(Math.round(cx-w),Math.round(cy+dy),w*2,1)}}
function glow(x,y,rad,c,a=.14){if(rad<1)return;X.save();X.globalAlpha=a;disc(x,y,Math.round(rad),c);disc(x,y,Math.round(rad*.62),c);disc(x,y,Math.round(rad*.32),c);X.restore()}
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function layer(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
function onto(c,f){const o=X;X=c.getContext("2d");try{f()}finally{X=o}return c}
function spr(rows,map,scale=1){const c=layer(rows[0].length*scale,rows.length*scale);return onto(c,()=>rows.forEach((ln,y)=>[...ln].forEach((ch,x)=>{if(map[ch])r(x*scale,y*scale,scale,scale,map[ch])})))}
function flipped(c){const f=layer(c.width,c.height),g=f.getContext("2d");g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return f}

// tiny pixel font (signs, clock)
const GL={"А":[".#.","#.#","###","#.#","#.#"],"Л":[".##","#.#","#.#","#.#","#.#"],"В":["##.","#.#","##.","#.#","##."],"К":["#.#","#.#","##.","#.#","#.#"],
"Е":["###","#..","##.","#..","###"],"Ф":[".###.","#.#.#","#.#.#",".###.","..#.."],"Г":["###","#..","#..","#..","#.."],"Р":["##.","#.#","##.","#..","#.."],
"Ж":["#.#.#","#.#.#",".###.","#.#.#","#.#.#"],"Д":[".##..",".#.#.",".#.#.","#####","#...#"],"О":["###","#.#","#.#","#.#","###"],"М":["#...#","##.##","#.#.#","#...#","#...#"],
"Т":["###",".#.",".#.",".#.",".#."],"И":["#..#","#..#","#.##","##.#","#..#"],"Н":["#.#","#.#","###","#.#","#.#"],"С":["###","#..","#..","#..","###"],
"П":["###","#.#","#.#","#.#","#.#"],"Ч":["#.#","#.#","###","..#","..#"],"Б":["###","#..","###","#.#","###"],"У":["#.#","#.#","###","..#","###"],"Я":["###","#.#","###",".##","#.#"],"Ь":["#..","#..","###","#.#","###"],
"Ц":["#.#","#.#","#.#","###","..#"],"Ш":["#.#.#","#.#.#","#.#.#","#.#.#","#####"],"Ы":["#..#","#..#","##.#","#.##","##.#"],"0":["###","#.#","#.#","#.#","###"],"1":[".#.","##.",".#.",".#.","###"],"2":["###","..#","###","#..","###"],"3":["###","..#",".##","..#","###"],"4":["#.#","#.#","###","..#","..#"],
"5":["###","#..","###","..#","###"],"6":["###","#..","###","#.#","###"],"7":["###","..#",".#.",".#.",".#."],"8":["###","#.#","###","#.#","###"],"9":["###","#.#","###","..#","###"],
":":[".","#",".","#","."]," ":["..","..","..","..",".."],"★":[".#.","###",".#.","#.#","..."]};
function ptext(s,x,y,c){X.fillStyle=c;for(const ch of s){const g=GL[ch]||GL[" "];g.forEach((ln,j)=>[...ln].forEach((v,i)=>{if(v==="#")X.fillRect(x+i,y+j,1,1)}));x+=g[0].length+1}}
const ptw=s=>[...s].reduce((a,ch)=>a+(GL[ch]||GL[" "])[0].length+1,-1);

// ================= SKY / DAYLIGHT =================
const SKY=[[0,"#070a1f","#1a1d48"],[4.5,"#0b0f2c","#2a2552"],[6,"#2f356f","#e08a72"],[7.5,"#4f8fd6","#f6c79a"],[9,"#3f86d6","#a9d8f0"],[16.5,"#3f86d6","#b5dcef"],
 [18.3,"#4a4a96","#f59a5b"],[19.6,"#2a2560","#c9587a"],[21,"#0f1236","#33285c"],[24,"#070a1f","#1a1d48"]];
function sky(h){for(let i=0;i<SKY.length-1;i++){const a=SKY[i],b=SKY[i+1];if(h>=a[0]&&h<=b[0]){const t=(h-a[0])/(b[0]-a[0]);return[mix(a[1],b[1],t),mix(a[2],b[2],t)]}}return[SKY[0][1],SKY[0][2]]}
// 0 = full day, 1 = deep night
function night(h){if(h>=8&&h<=17.5)return 0;if(h>=21.5||h<=4.5)return 1;if(h>17.5)return (h-17.5)/4;return 1-(h-4.5)/3.5}
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function skyFill(w,h,top,bot){const id=X.createImageData(w,h),d=id.data,steps=12;
 const A=hexN(top),B=hexN(bot);
 const col=k=>{const t=k/steps;return[((A>>16)&255)*(1-t)+((B>>16)&255)*t,((A>>8)&255)*(1-t)+((B>>8)&255)*t,(A&255)*(1-t)+(B&255)*t]};
 for(let y=0;y<h;y++){const f=y/Math.max(1,h-1)*steps,k=Math.floor(f),fr=f-k;for(let x=0;x<w;x++){const th=(BAYER[(y&3)*4+(x&3)]+.5)/16,c=col(Math.min(steps,fr>th?k+1:k)),i=(y*w+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255}}
 X.putImageData(id,0,0)}
