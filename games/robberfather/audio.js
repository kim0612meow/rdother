import {SampleMixer,ambienceMix} from './audio-samples.js?v=opening-endings-v46';
// Three times the previous default gain; category sliders keep their saved values.
export const MASTER_GAIN=2.4;
// Sound timing is separate from synthesis so pauses and story states stay silent.
export class SoundDirector {
 constructor(){this.x=null;this.mode=null;this.steps=0;this.beat=0;this.rustle=0;this.progress=0;this.bite=0;}
 update(g,dt,active=true){
  if(!active){this.x=null;this.beat=0;this.rustle=0;return [];}
  const out=[],p=g.player,changed=this.mode!==g.mode;
  if(changed){this.x=null;this.steps=0;this.bite=.8;this.beat=0;this.mode=g.mode;}
  const distance=this.x===null?0:Math.abs(p.x-this.x);this.x=p.x;
  if(['day','return'].includes(g.mode)&&!p.hidden&&distance>0&&distance<40){
   this.steps+=distance;
   const running=distance/Math.max(dt,.001)>180;
   const stride=running?52:44;if(this.steps>=stride){this.steps%=stride;out.push({type:'step',running,surface:g.shop&&g.shop.kind!==5?'wood':'concrete'});}
  }
  const holding=g.mode==='day'&&g.activeTarget!==null;
  if(holding||g.chasers.length&&g.mode==='day'){
   const tension=holding?Math.max(g.suspicion,Math.min(1,g.progress/3.3)):.65;
   this.beat-=dt;if(this.beat<=0){out.push({type:'heartbeat',tension});this.beat=.92-.43*tension;}
  }else this.beat=0;
  const moved=holding&&g.progress>this.progress+.001;this.progress=holding?g.progress:0;this.rustle=Math.max(0,this.rustle-dt);if(moved&&this.rustle===0){out.push({type:'rustle'});this.rustle=.4;}
  if(g.mode==='night'&&(g.fed||g.ateRotten)){this.bite-=dt;if(this.bite<=0){out.push({type:'eat'});this.bite=2.35;}}
  return out;
 }
}

export class Soundscape {
 constructor(createContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)()){this.createContext=createContext;this.volume=1;this.volumes={background:1,effects:1,voice:1};this.enabled=true;this.running=false;this.context=null;this.sources=new Set();this.director=new SoundDirector();this.voice=null;this.pendingVoice=null;this.foot=0;}
 unlock(){
  if(!this.enabled)return;
  try{
   if(!this.context){
    this.context=this.createContext();const c=this.context;
    this.master=c.createGain();this.master.gain.value=MASTER_GAIN*this.volume;
    const limiter=c.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=5;
    this.master.connect(limiter).connect(c.destination);
    for(const key of ['background','effects','voice']){const bus=c.createGain();bus.gain.value=key==='voice'&&this.indoors?0:this.volumes[key];bus.connect(this.master);this[key+'Bus']=bus;}
    this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);
    let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.04)/1.02;data[i]=brown*3;}
    this.ambient=c.createBufferSource();this.ambient.buffer=this.noise;this.ambient.loop=true;
    const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;
    this.air=c.createGain();this.air.gain.value=0;this.ambient.connect(filter).connect(this.air).connect(this.backgroundBus);this.ambient.start();this.samples=new SampleMixer(c,this.effectsBus,undefined,{background:this.backgroundBus,voice:this.voiceBus});
   }
   this.context.resume().catch(()=>{});
  }catch{this.enabled=false;}
 }
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(this.master&&this.running)this.master.gain.setTargetAtTime(MASTER_GAIN*this.volume,this.context.currentTime,.025);if(this.volume===0){this.stopVoice();}}
 setVolumes(values){for(const key of ['background','effects','voice']){const value=Number(values?.[key]);this.volumes[key]=Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;const bus=this[key+'Bus'];if(bus)bus.gain.setTargetAtTime(key==='voice'&&this.indoors?0:this.volumes[key],this.context.currentTime,.025);}if(this.volumes.voice===0){this.stopVoice();}}
 setLocation(g){const indoors=!!g.shop&&g.shop.kind!==5;if(this.indoors===indoors)return;this.indoors=indoors;if(this.voiceBus)this.voiceBus.gain.setTargetAtTime(indoors?0:this.volumes.voice,this.context.currentTime,.015);if(indoors){this.stopVoice();}}
 setEnabled(value){this.enabled=value;if(value)this.unlock();else this.quiet();}
 quiet(){
  this.running=false;this.pendingVoice=null;
  if(this.master)this.master.gain.setTargetAtTime(0,this.context.currentTime,.015);
  for(const source of this.sources){try{source.stop();}catch{}}
  this.sources.clear();
  if(this.voice){this.stopVoice();}
 }
 track(source){this.sources.add(source);const ended=source.onended;source.onended=()=>{ended?.();this.sources.delete(source);source.disconnect();};return source;}
 tone(frequency,duration,volume,delay=0,endFrequency=frequency,type='sine',filter=null,channel='effects'){
  const c=this.context,at=c.currentTime+delay,osc=this.track(c.createOscillator()),gain=c.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,at);osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  if(filter){const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=filter;f.Q.value=4;osc.connect(f).connect(gain);}else osc.connect(gain);
  gain.connect(this[channel+'Bus']||this.master);osc.start(at);osc.stop(at+duration+.015);
 }
 noiseHit(duration,volume,frequency,delay=0,channel='effects'){
  const c=this.context,at=c.currentTime+delay,source=this.track(c.createBufferSource()),gain=c.createGain(),filter=c.createBiquadFilter();
  source.buffer=this.noise;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.65;
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter).connect(gain).connect(this[channel+'Bus']||this.master);source.start(at,Math.random()*.8,duration);source.stop(at+duration+.01);
 }
 stopVoice(){const source=this.voice;this.voice=null;this.pendingVoice=null;if(source){try{source.stop();}catch{}}}
 shout(kind='detected'){
  if(this.indoors||this.volumes.voice===0||!this.running||!this.enabled)return;
  const key=kind==='witnessed'?'voiceWitness':'voiceCaught';
  if(!this.samples?.has(key)){this.pendingVoice=kind;return;}
  this.stopVoice();const source=this.samples.voice(key);if(!source)return;this.voice=this.track(source);const ended=source.onended;source.onended=()=>{ended?.();if(this.voice===source)this.voice=null;};
 }
 play(event){
  if(!this.context||!this.enabled||!this.running)return;
  const e=typeof event==='string'?{type:event}:event;
  switch(e.type){
   case'binOpened':case'binClosed':{const source=this.samples?.lid(e.type==='binOpened');if(source)this.track(source);break;}
   case'heartbeat':{
    if(this.inPocket&&this.samples?.has('heartbeat'))break;
    const v=.13+e.tension*.06;this.tone(76,.115,v,0,39,'sine',null,'background');this.noiseHit(.04,.025,180,0,'background');
    this.tone(65,.14,v*.65,.16,34,'sine',null,'background');break;
   }
   case'step':{const source=this.samples?.step(e.surface,e.running);if(source){this.track(source);break;}}this.foot++;this.noiseHit(e.running?.12:.16,e.running?.19:.115,650+(this.foot%2)*260);this.tone(100+(this.foot%2)*15,.075,e.running?.07:.04,0,45);break;
   case'slip':this.noiseHit(.34,.14,620);this.tone(150,.14,.06,0,80);break;
   case'turnWarn':this.noiseHit(.1,.055,700);this.noiseHit(.14,.04,950,.13);break; // A dry throat-clear, without an electronic warning tone.
   case'turnLook':this.noiseHit(.2,.10,1100);break;
   case'frontOnly':case'noMoney':case'notSick':case'foodFull':case'shopBarred':case'doorBlocked':case'blocked':case'coinFullBet':case'foodOnly':{const now=this.context.currentTime||0;if(now<(this.blockedUntil||0))break;this.blockedUntil=now+.22;this.tone(260,.11,.07,0,210,'sine');break;}
   case'dialogueTick':if(this.volumes.voice>0){const now=this.context.currentTime;if(now>=(this.dialogueTickAt||0)){this.dialogueTickAt=now+.065;this.noiseHit(.025,.018,650,0,'voice');this.tone(210+((this.dialogueTickIndex=(this.dialogueTickIndex||0)+1)%3)*28,.032,.019,0,170,'triangle',650,'voice');}}break;
   case'qteSuccess':{const source=this.samples?.effect('qte');if(source)this.track(source);break;}
   case'rustle':if(this.samples?.has('pocket')){this.track(this.samples.effect('pocket'));break;}this.noiseHit(.22,.07,1700);this.noiseHit(.13,.035,2400,.13);break;
   case'stolen':this.noiseHit(.34,.19,1350);this.noiseHit(.18,.1,2400,.18);break;
   case'detected':case'witnessed':case'recognized':this.shout(e.type);this.noiseHit(.23,.16,900);break;
   case'eat':if(this.samples?.has('cutlery')){this.track(this.samples.effect('cutlery'));break;}this.noiseHit(.18,.07,700,.2);this.noiseHit(.16,.055,500,.48);this.noiseHit(.18,.04,650,.77);break;
   case'enterShop':case'exitShop':{const source=this.samples?.effect('door');if(source)this.track(source);break;}
   case'pocketOpened':{const source=this.samples?.effect('pocketOpen');if(source)this.track(source);break;}
   case'hidden':case'unhidden':this.noiseHit(.38,.2,530);this.tone(110,.16,.045,.03,50);break;
   case'bought':case'medicine':{const source=this.samples?.effect('buy');if(source)this.track(source);break;}case'scavenged':if(!this.samples?.has('bin'))this.noiseHit(.42,.18,1100);break;case'discarded':{const source=this.samples?.effect('discard');if(source)this.track(source);this.noiseHit(.09,.025,150,.08);break;}
   case'caught':this.noiseHit(.3,.22,470);break;
   case'betPlaced':this.noiseHit(.09,.07,1800);break;
   case'cupMove':this.noiseHit(.09,.07,900);break;
   case'betWon':this.noiseHit(.1,.09,1800);this.noiseHit(.12,.07,2200,.12);break;
   case'betLost':this.noiseHit(.18,.06,600);break;
   case'headStrike':this.noiseHit(.075,.25,1300);this.tone(930,.6,.16,0,420,'triangle');this.tone(1480,.4,.075,.008,750,'sine');this.tone(80,.18,.12,0,35);break;
   case'bodyStrike':this.noiseHit(.18,.22,290);this.tone(75,.15,.1,0,38);break;
  }
 }
 update(g,dt,active,locale,focus=0){
  this.setLocation(g);
  const audible=active&&this.enabled&&!!this.context;
  if(!audible){this.director.update(g,dt,false);if(this.running)this.quiet();return;}
  if(!this.running){this.running=true;this.master.gain.setTargetAtTime(MASTER_GAIN*this.volume,this.context.currentTime,.025);}
  this.inPocket=g.mode==='day'&&g.activeTarget!==null;this.samples?.update(ambienceMix(g,focus));
  this.air.gain.setTargetAtTime(this.samples?.has('street')?0:g.mode==='day'?.013:.008,this.context.currentTime,.6);
  if(this.pendingVoice){const kind=this.pendingVoice;if(g.mode==='day'&&g.chasers.length&&!g.player.hidden)this.shout(kind);else this.pendingVoice=null;}
  for(const event of this.director.update(g,dt))this.play(event);
 }
}
