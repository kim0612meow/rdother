import {settings} from './settings.js?v=ui-text-v27';
import {dayDifficulty} from './difficulty.js?v=ui-text-v27';
// Space gauge that runs on top of the wallet line while your hand is in the pocket.
// Press Space while the white marker is in the gold zone. Pressing outside it, or letting the marker pass through untouched, is a mistake.
// Every press throws the zone far away, so hammering the key never works.
// To take it out of the game, set GAUGE to false in pickpocket.js.
// zone: gold zone width (0-1). sweep: seconds for the marker to cross once.
const STYLE={civilian:{zone:.2,sweep:1.0},wealthy:{zone:.16,sweep:.85},police:{zone:.12,sweep:.7}};
const BAR={x:300,y:16,w:300,h:24};
export class Timing{
 constructor({type,seed,day=1,multiplier=1}){const base=STYLE[type],difficulty=dayDifficulty(day,multiplier);this.s={zone:(.035+(base.zone-.035)*difficulty.zone)/difficulty.precision,sweep:base.sweep/difficulty.timing};this.r=seed;this.pos=0;this.dir=1;this.flash=0;this.hit=0;this.inside=false;this.pending=false;this.running=false;this.newZone();}
 rand(){this.r=(this.r*16807)%2147483647;return this.r/2147483647;}
 // The new zone always lands well away from the marker.
 newZone(){const w=this.s.zone;let a;do a=.04+this.rand()*(.92-w);while(Math.abs(a+w/2-this.pos)<.35);this.zone=[a,a+w];this.inside=false;}
 tap(){if(!this.running||this.hit>0||this.flash>0)return;const success=this.pos>=this.zone[0]&&this.pos<=this.zone[1];if(success)this.hit=.2;else{this.flash=.4;this.pending=true;}this.newZone();return success;}
 // running: the hand is on the wallet. Returns true on a mistake.
 update(dt,running){this.running=running;this.flash=Math.max(0,this.flash-dt);this.hit=Math.max(0,this.hit-dt);if(running){this.pos+=this.dir*dt/this.s.sweep;if(this.pos>1){this.pos=2-this.pos;this.dir=-1;}if(this.pos<0){this.pos=-this.pos;this.dir=1;}const inZone=this.pos>=this.zone[0]&&this.pos<=this.zone[1];if(this.inside&&!inZone){this.flash=.4;this.pending=true;this.newZone();}else this.inside=inZone;}
  if(this.pending){this.pending=false;return true;}return false;}
 draw(c){const b=BAR;c.save();if(!this.running)c.globalAlpha=.45;
  c.fillStyle='#e1dcc0';c.font='bold 16px sans-serif';c.textAlign='right';c.fillText(settings.label('gauge'),b.x-14,b.y+b.h-6);
  c.fillStyle='#0b1512';c.fillRect(b.x-5,b.y-5,b.w+10,b.h+10);c.fillStyle=this.flash>0?'#7a2219':'#22302b';c.fillRect(b.x,b.y,b.w,b.h);
  c.fillStyle=this.hit>0?'#fff0b8':'#e7c27a';c.fillRect(b.x+b.w*this.zone[0],b.y,b.w*(this.zone[1]-this.zone[0]),b.h);
  const mx=b.x+b.w*this.pos;c.fillStyle='#ffffff';c.fillRect(mx-3,b.y-8,6,b.h+16);c.restore();}
}
