// Sound timing is separate from synthesis so pauses and story states stay silent.
export class SoundDirector {
 constructor(){this.x=null;this.mode=null;this.steps=0;this.beat=0;this.rustle=0;this.bite=0;this.shout=0;}
 update(g,dt,active=true){
  if(!active){this.x=null;this.beat=0;this.rustle=0;return [];}
  const out=[],p=g.player,changed=this.mode!==g.mode;
  if(changed){this.x=null;this.steps=0;this.bite=.8;this.beat=0;this.mode=g.mode;}
  this.shout=Math.max(0,this.shout-dt);
  const distance=this.x===null?0:Math.abs(p.x-this.x);this.x=p.x;
  if(['day','return'].includes(g.mode)&&!p.hidden&&distance>0&&distance<40){
   this.steps+=distance;
   const running=distance/Math.max(dt,.001)>180;
   if(this.steps>=(running?43:36)){this.steps=0;out.push({type:'step',running});}
  }
  const holding=g.mode==='day'&&g.activeTarget!==null;
  if(holding||g.chasers.length&&g.mode==='day'){
   const tension=holding?Math.max(g.suspicion,Math.min(1,g.progress/3.3)):.65;
   this.beat-=dt;if(this.beat<=0){out.push({type:'heartbeat',tension});this.beat=.92-.43*tension;}
  }else this.beat=0;
  if(holding){this.rustle-=dt;if(this.rustle<=0){out.push({type:'rustle'});this.rustle=.43;}}else this.rustle=0;
  if(g.mode==='day'&&g.chasers.length&&this.shout===0){out.push({type:'shout'});this.shout=4.8;}
  if(g.mode==='night'&&(g.fed||g.ateRotten)){this.bite-=dt;if(this.bite<=0){out.push({type:'eat',spoiled:g.ateRotten});this.bite=2.35;}}
  return out;
 }
 alert(){this.shout=4.8;}
}

export class Soundscape {
 constructor(createContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)()){this.createContext=createContext;this.volume=1;this.enabled=true;this.running=false;this.context=null;this.sources=new Set();this.director=new SoundDirector();this.locale='en';this.voice=null;this.foot=0;}
 unlock(){
  if(!this.enabled)return;
  try{
   if(!this.context){
    this.context=this.createContext();const c=this.context;
    this.master=c.createGain();this.master.gain.value=.8*this.volume;
    const limiter=c.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=5;
    this.master.connect(limiter).connect(c.destination);
    this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);
    let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.04)/1.02;data[i]=brown*3;}
    this.ambient=c.createBufferSource();this.ambient.buffer=this.noise;this.ambient.loop=true;
    const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;
    this.air=c.createGain();this.air.gain.value=0;this.ambient.connect(filter).connect(this.air).connect(this.master);this.ambient.start();
   }
   this.context.resume().catch(()=>{});
  }catch{this.enabled=false;}
 }
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(this.master&&this.running)this.master.gain.setTargetAtTime(.8*this.volume,this.context.currentTime,.025);if(this.voice&&this.volume===0){globalThis.speechSynthesis?.cancel();this.voice=null;}}
 setEnabled(value){this.enabled=value;if(value)this.unlock();else this.quiet();}
 quiet(){
  this.running=false;
  if(this.master)this.master.gain.setTargetAtTime(0,this.context.currentTime,.015);
  for(const source of this.sources){try{source.stop();}catch{}}
  this.sources.clear();
  if(this.voice){globalThis.speechSynthesis?.cancel();this.voice=null;}
 }
 track(source){this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect();};return source;}
 tone(frequency,duration,volume,delay=0,endFrequency=frequency,type='sine',filter=null){
  const c=this.context,at=c.currentTime+delay,osc=this.track(c.createOscillator()),gain=c.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,at);osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  if(filter){const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=filter;f.Q.value=4;osc.connect(f).connect(gain);}else osc.connect(gain);
  gain.connect(this.master);osc.start(at);osc.stop(at+duration+.015);
 }
 noiseHit(duration,volume,frequency,delay=0){
  const c=this.context,at=c.currentTime+delay,source=this.track(c.createBufferSource()),gain=c.createGain(),filter=c.createBiquadFilter();
  source.buffer=this.noise;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.65;
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter).connect(gain).connect(this.master);source.start(at,Math.random()*.8,duration);source.stop(at+duration+.01);
 }
 shout(){
  // Use an installed local voice when available; the voiced "hey" fallback is offline.
  const speech=globalThis.speechSynthesis,voices=speech?.getVoices()||[];
  const voice=voices.find(v=>v.localService&&v.lang.toLowerCase().startsWith(this.locale));
  if(voice&&globalThis.SpeechSynthesisUtterance&&!speech.speaking){
   const line=new SpeechSynthesisUtterance(this.locale==='ko'?'거기 서! 도둑이야!':'Hey! Stop! Thief!');
   line.voice=voice;line.lang=voice.lang;line.volume=.65*this.volume;line.rate=1.15;line.pitch=.8;this.voice=line;
   line.onend=line.onerror=()=>{if(this.voice===line)this.voice=null;};speech.speak(line);
  }else{
   this.noiseHit(.08,.12,1400);
   this.tone(165,.48,.09,.05,108,'sawtooth',730);
   this.tone(168,.4,.045,.08,112,'sawtooth',1550);
  }
 }
 play(event){
  if(!this.context||!this.enabled||!this.running)return;
  const e=typeof event==='string'?{type:event}:event;
  switch(e.type){
   case'heartbeat':{
    const v=.13+e.tension*.06;this.tone(76,.115,v,0,39);this.noiseHit(.04,.025,180);
    this.tone(65,.14,v*.65,.16,34);break;
   }
   case'step':this.foot++;this.noiseHit(e.running?.12:.16,e.running?.19:.115,650+(this.foot%2)*260);this.tone(100+(this.foot%2)*15,.075,e.running?.07:.04,0,45);break;
   case'slip':this.noiseHit(.34,.14,620);this.tone(150,.14,.06,0,80);break;
   case'turnWarn':this.tone(210,.09,.05,0,170);this.tone(230,.11,.05,.12,180);this.noiseHit(.08,.05,900,.05);break; // A throat clears.
   case'turnLook':this.noiseHit(.2,.12,1300);this.tone(520,.18,.05,0,300,'triangle');break;
   case'frontOnly':this.tone(180,.12,.04,0,150);break;
   case'rustle':this.noiseHit(.22,.07,1700);this.noiseHit(.13,.035,2400,.13);break;
   case'stolen':this.noiseHit(.34,.19,1350);this.noiseHit(.18,.1,2400,.18);this.tone(780,.1,.017,.12,480,'triangle');break;
   case'detected':case'witnessed':case'recognized':this.director.alert();this.shout();this.noiseHit(.23,.16,900);break;
   case'shout':this.shout();break;
   case'eat':this.tone(1750,.08,.027,0,1200,'triangle');this.noiseHit(.18,.07,700,.2);this.noiseHit(.16,.055,500,.48);this.noiseHit(.18,.04,650,.77);break;
   case'hidden':case'unhidden':case'enterShop':case'exitShop':this.noiseHit(.38,.2,530);this.tone(110,.16,.045,.03,50);break;
   case'bought':this.tone(660,.08,.03,0,660,'triangle');this.tone(990,.12,.025,.07,990,'triangle');break;case'medicine':this.tone(520,.14,.03,0,520);this.tone(780,.2,.025,.1,780);break;case'noMoney':case'notSick':this.tone(180,.14,.035,0,120);break;case'scavenged':case'discarded':this.noiseHit(.42,.18,1100);break;
   case'caught':this.noiseHit(.3,.22,470);break;
   case'betPlaced':this.tone(1320,.06,.03,0,1100,'triangle');this.tone(1760,.08,.02,.05,1500,'triangle');break;
   case'cupMove':this.noiseHit(.09,.07,900);break;
   case'betWon':this.tone(880,.08,.03,0,880,'triangle');this.tone(1320,.14,.025,.08,1320,'triangle');break;
   case'betLost':this.tone(160,.25,.04,0,110);break;
   case'headStrike':this.noiseHit(.075,.25,1300);this.tone(930,.6,.16,0,420,'triangle');this.tone(1480,.4,.075,.008,750,'sine');this.tone(80,.18,.12,0,35);break;
   case'bodyStrike':this.noiseHit(.18,.22,290);this.tone(75,.15,.1,0,38);break;
   case'save':this.tone(523,.16,.025);this.tone(659,.23,.02,.11);break;
   case'night':this.tone(196,1.6,.028);this.tone(294,1.8,.02,.2);break;
   case'start':this.tone(220,.8,.025);this.tone(330,1.1,.02,.2);break;
  }
 }
 update(g,dt,active,locale){
  this.locale=locale;
  const audible=active&&this.enabled&&!!this.context;
  if(!audible){this.director.update(g,dt,false);if(this.running)this.quiet();return;}
  if(!this.running){this.running=true;this.master.gain.setTargetAtTime(.8*this.volume,this.context.currentTime,.025);}
  this.air.gain.setTargetAtTime(g.mode==='day'?.013:.008,this.context.currentTime,.6);
  for(const event of this.director.update(g,dt))this.play(event);
 }
}
