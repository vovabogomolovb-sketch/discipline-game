"use strict";
// ================= AUDIO: engines and small interaction sounds =================
function actx(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();return AC}catch(e){return null}}
let NOISE=null;function noiseBuf(a){if(NOISE)return NOISE;const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return NOISE=b}
function noiseHit(dur,f,q=1,v=.15,type="bandpass"){if(!S.sound)return;const a=actx();if(!a)return;const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;
 s.buffer=noiseBuf(a);fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl).connect(g).connect(a.destination);s.start(t);s.stop(t+dur)}
const SND={
 click:()=>{snd([[1800,.025,"square",.05]]);noiseHit(.04,3000,2,.08)},
 swish:()=>noiseHit(.45,1400,.7,.12),
 beep:()=>snd([[880,.06,"square",.04],[1320,.08,"square",.04]]),
 purr:()=>{if(!S.sound)return;const a=actx();if(!a)return;const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain(),t=a.currentTime;
  s.buffer=noiseBuf(a);fl.type="lowpass";fl.frequency.value=220;lfo.frequency.value=24;lg.gain.value=.12;g.gain.value=.0;lfo.connect(lg).connect(g.gain);
  const env=a.createGain();env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(.9,t+.2);env.gain.linearRampToValueAtTime(0,t+1.8);
  s.connect(fl).connect(g).connect(env).connect(a.destination);s.start(t);lfo.start(t);s.stop(t+1.9);lfo.stop(t+1.9)},
 guitar:()=>snd([[196,.18,"triangle",.1],[247,.18,"triangle",.1],[294,.18,"triangle",.1],[392,.5,"triangle",.1]]),
 record:()=>snd([[523,.18,"triangle",.07],[659,.18,"triangle",.07],[784,.18,"triangle",.07],[659,.18,"triangle",.07],[587,.18,"triangle",.07],[698,.18,"triangle",.07],[880,.3,"triangle",.07],[784,.5,"triangle",.07]]),
 neon:()=>{snd([[120,.05,"sawtooth",.05],[120,.05,"sawtooth",.02]]);noiseHit(.08,4000,3,.05)}};

// engine character per car: cyl, idle rpm, oscillator mix, filter, roughness, noise, turbo whistle
const ENG_P={
 vaz:{cyl:4,idle:850,max:5200,wave:"sawtooth",sub:.35,lp:950,rough:.45,noise:.16,bp:1300,turbo:0},
 mustang:{cyl:8,idle:700,max:5600,wave:"sawtooth",sub:.8,lp:520,rough:.7,noise:.12,bp:600,turbo:0,lope:.5},
 bus:{cyl:4,idle:900,max:4400,wave:"square",sub:.4,lp:1500,rough:.5,noise:.28,bp:2600,turbo:0},
 gclass:{cyl:8,idle:650,max:5200,wave:"sawtooth",sub:.6,lp:430,rough:.25,noise:.08,bp:500,turbo:0},
 delorean:{cyl:6,idle:800,max:5500,wave:"sawtooth",sub:.45,lp:720,rough:.35,noise:.12,bp:900,turbo:0},
 p911:{cyl:6,idle:950,max:6800,wave:"square",sub:.35,lp:1700,rough:.4,noise:.24,bp:1900,turbo:.04,pops:1},
 f40:{cyl:8,idle:1000,max:7600,wave:"sawtooth",sub:.5,lp:1300,rough:.35,noise:.18,bp:1400,turbo:.07,pops:1}};
const ENG={on:false,car:null,rpm:0,target:0,gas:false,n:null,t0:0};
function engStart(M){if(ENG.on||!M)return;const a=actx();if(!a||!S.sound){ENG.on=true;ENG.car=M.id;ENG.rpm=ENG_P[M.id].idle;ver++;return}
 const P=ENG_P[M.id]||ENG_P.vaz,t=a.currentTime;ENG.car=M.id;ENG.t0=t;
 // starter motor: whiny cranking for ~0.9s
 const so=a.createOscillator(),sg=a.createGain(),sl=a.createOscillator(),slg=a.createGain();so.type="sawtooth";so.frequency.value=180;sl.frequency.value=9;slg.gain.value=.05;sg.gain.value=.05;
 sl.connect(slg).connect(sg.gain);so.connect(sg).connect(a.destination);so.start(t);sl.start(t);sg.gain.setValueAtTime(.05,t+.85);sg.gain.linearRampToValueAtTime(0,t+.95);so.stop(t+1);sl.stop(t+1);
 // engine voice
 const master=a.createGain(),lp=a.createBiquadFilter(),shaper=a.createWaveShaper(),o1=a.createOscillator(),o2=a.createOscillator(),o3=a.createOscillator(),g1=a.createGain(),g2=a.createGain(),g3=a.createGain();
 const curve=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;curve[i]=Math.tanh(x*2.4)}shaper.curve=curve;
 o1.type=P.wave;o2.type="sine";o3.type=P.wave;g1.gain.value=.5;g2.gain.value=P.sub;g3.gain.value=.25;lp.type="lowpass";lp.frequency.value=P.lp;lp.Q.value=2;
 const am=a.createGain(),lfo=a.createOscillator(),lfoG=a.createGain();am.gain.value=1-P.rough/2;lfo.type="square";lfoG.gain.value=P.rough/2;lfo.connect(lfoG).connect(am.gain);
 const ns=a.createBufferSource(),nf=a.createBiquadFilter(),ng=a.createGain();ns.buffer=noiseBuf(a);ns.loop=true;nf.type="bandpass";nf.frequency.value=P.bp;nf.Q.value=1.2;ng.gain.value=P.noise;
 const tw=a.createOscillator(),twg=a.createGain();tw.type="sine";twg.gain.value=P.turbo*.4;
 o1.connect(g1);o2.connect(g2);o3.connect(g3);[g1,g2,g3].forEach(g=>g.connect(shaper));shaper.connect(lp);ns.connect(nf).connect(ng).connect(lp);lp.connect(am).connect(master);tw.connect(twg).connect(master);master.connect(a.destination);
 master.gain.setValueAtTime(0,t);master.gain.setValueAtTime(0,t+.85);master.gain.linearRampToValueAtTime(.2,t+.95);
 [o1,o2,o3,lfo,ns,tw].forEach(n=>n.start(t+.8));
 ENG.n={o1,o2,o3,lfo,lp,tw,master,ng,ns,P};ENG.on=true;ENG.rpm=P.idle*1.9;ENG.target=P.idle;ver++;engTune(true)}
function engTune(now){const n=ENG.n;if(!n)return;const a=AC,t=a.currentTime,P=n.P,f=ENG.rpm/60*P.cyl/2,k=now?.01:.07;
 n.o1.frequency.setTargetAtTime(f,t,k);n.o2.frequency.setTargetAtTime(f/2,t,k);n.o3.frequency.setTargetAtTime(f*1.012,t,k);
 n.lfo.frequency.setTargetAtTime(ENG.rpm/60*(P.lope||1),t,k);n.lp.frequency.setTargetAtTime(P.lp*(.7+ENG.rpm/P.idle*.35),t,k);
 n.tw.frequency.setTargetAtTime(1800+ENG.rpm*.9,t,k);n.ng.gain.setTargetAtTime(P.noise*(.7+ENG.rpm/P.max),t,k);n.master.gain.setTargetAtTime(Math.min(.32,.18+ENG.rpm/P.max*.14),t,.1)}
function engTick(dt){if(!ENG.on||!ENG.n)return;const P=ENG.n.P;ENG.target=ENG.gas?P.max:P.idle;const prev=ENG.rpm;
 ENG.rpm+=(ENG.target-ENG.rpm)*Math.min(1,dt*(ENG.gas?2.2:1.6));
 if(P.pops&&prev>P.idle*2.5&&ENG.rpm<prev-200&&!ENG.gas&&Math.random()<.25)noiseHit(.06,500,1,.18,"lowpass");
 engTune(false)}
function engStop(){if(!ENG.on)return;const n=ENG.n;ENG.on=false;ENG.gas=false;ver++;if(!n)return;const t=AC.currentTime;n.master.gain.cancelScheduledValues(t);n.master.gain.setTargetAtTime(0,t,.15);
 [n.o1,n.o2,n.o3,n.lfo,n.ns,n.tw].forEach(o=>{try{o.stop(t+.8)}catch(e){}});ENG.n=null;setTimeout(()=>snd([[90,.05,"square",.04]]),400)}
