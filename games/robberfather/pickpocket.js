import {drawPocketBack} from './characters.js?v=city-v4';
// The pocket window, seen over the victim's back. Draw the wallet out along a line with the mouse while keeping the Space gauge in time.
// The street keeps moving underneath, so suspicion and witnesses still count while you play.
// When the victim starts to turn (look, set by app.js) press E to leave the pocket; reopening the same pocket picks up where you stopped.
import {TYPES} from './engine.js?v=city-v4';
import {Trace} from './pick-trace.js?v=city-v4';
import {Timing} from './pick-timing.js?v=city-v4';
// The Space gauge runs alongside the line everywhere but the tutorial. Set to false to go back to the mouse alone.
const GAUGE=true;
const RUSH=.7,W=640,H=400,START={x:206,y:252},HEAD={x:104,y:74};
// How each victim looks from behind, and how much suspicion a mistake adds.
const LOOK={civilian:{coat:'#6d5440',lining:'#3a2b20',hair:'#3b2a1e',slip:.3},wealthy:{coat:'#2c3550',lining:'#151a2a',hair:'#8d8a84',slip:.36},police:{coat:'#1d2c4a',lining:'#0d1526',hair:'#2a2420',slip:.45}};
export class Pickpocket{
 constructor(root,t){this.root=root;this.t=t;this.canvas=root.querySelector('canvas');this.c=this.canvas.getContext('2d');this.active=false;this.coachKey=null;
  const pos=e=>{const r=this.canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};};
  this.canvas.addEventListener('pointerdown',e=>{if(!this.active||this.paused)return;e.preventDefault();this.canvas.setPointerCapture(e.pointerId);this.game.down(pos(e));});
  this.canvas.addEventListener('pointermove',e=>{if(this.active&&!this.paused)this.game.move(pos(e));});
  const up=()=>{if(this.active)this.game.up();};this.canvas.addEventListener('pointerup',up);this.canvas.addEventListener('pointercancel',up);}
 open(target,seed,tutorial=false){const type=target.type,memo=this.memo?.id===target.id?this.memo:null;this.memo=null;this.type=type;this.targetId=target.id;this.look='wait';this.lastLook='wait';this.shake=0;
  if(memo){this.game=memo.game;this.gauge=memo.gauge;this.game.resume();}else{const s=Math.floor(seed*7919)%2147483646+1;this.game=new Trace({type,hold:TYPES[type].hold,seed:s,start:START,W,H});this.gauge=GAUGE&&!tutorial?new Timing({type,seed:s}):null;}
  this.active=true;this.paused=false;this.root.hidden=false;this.root.querySelector('[data-pick-title]').textContent=this.t('pickTitle',{name:this.t(type)});this.root.querySelector('[data-pick-hint]').textContent=this.t(this.gauge?'pickHintDual':'pickHintTrace');this.render();}
 close(keep=false){this.memo=keep&&this.active?{id:this.targetId,game:this.game,gauge:this.gauge}:null;this.active=false;this.root.hidden=true;}
 get fraction(){return this.active?this.game.fraction:0;}
 get touching(){return this.active&&this.game.touching;}
 tap(){if(this.active)this.gauge?.tap();}
 // Tutorial line shown at the top of the window, or null.
 coach(key){this.coachKey=key;}
 // Returns the suspicion added by a mistake this frame, or 0. risk: extra suspicion from pulling too fast (the wallet turns red).
 update(dt,paused=false){this.risk=0;this.paused=paused;if(!this.active)return 0;if(paused){this.render();return 0;}this.shake=Math.max(0,this.shake-dt);let slip=this.game.update(dt);if(this.gauge?.update(dt,this.game.touching)&&!slip){slip=true;this.game.note='noteMiss';}if(this.game.warn)this.risk=dt*RUSH;if(slip)this.shake=.35;this.render();return slip?LOOK[this.type].slip:0;}
 render(){const c=this.c,s=LOOK[this.type],look=this.look;c.save();c.clearRect(0,0,W,H);if(this.shake>0)c.translate(Math.sin(this.shake*90)*6*this.shake/.35,0);
  // The street behind them, then their back filling the left of the view.
  c.fillStyle='#18211f';c.fillRect(0,0,W,H);c.fillStyle='#ffffff07';for(let x=20;x<W;x+=56)c.fillRect(x,0,3,H);
  if(!drawPocketBack(c,this.type,look,performance.now()/1000)){
  const wobble=look==='warn'?Math.sin(performance.now()/45)*.09:0;
  c.fillStyle='#b98d6c';c.fillRect(HEAD.x-20,HEAD.y+20,40,44);
  c.save();c.beginPath();c.moveTo(-40,H);c.lineTo(-40,170);c.quadraticCurveTo(-30,124,40,116);c.lineTo(172,116);c.quadraticCurveTo(244,124,252,182);c.lineTo(246,H);c.closePath();c.fillStyle=s.coat;c.fill();c.clip();
  c.globalAlpha=.08;c.fillStyle='#000';for(let y=0;y<H;y+=4)c.fillRect(0,y,W,1);if(this.type==='wealthy'){c.globalAlpha=.16;c.fillStyle='#c9c3a6';for(let x=8;x<260;x+=26)c.fillRect(x,0,1,H);}c.globalAlpha=1;
  c.fillStyle='#00000040';c.fillRect(-40,116,300,16);c.fillRect(HEAD.x-2,132,4,H);c.fillStyle='#ffffff10';c.fillRect(-40,132,300,3);if(this.type==='police'){c.fillStyle='#0c1424';c.fillRect(-40,330,300,16);c.fillStyle='#c9a64f';c.fillRect(HEAD.x-9,332,18,12);}
  c.restore();
  // Their head, from behind. It twitches before they turn and shows a face when they look.
  c.save();c.translate(HEAD.x,HEAD.y+30);c.rotate(wobble+(look==='look'?.28:0));c.translate(0,-30);
  c.fillStyle='#b98d6c';c.beginPath();c.ellipse(-40,6,9,13,0,0,Math.PI*2);c.ellipse(40,6,9,13,0,0,Math.PI*2);c.fill();
  c.fillStyle=s.hair;c.beginPath();c.arc(0,0,42,0,Math.PI*2);c.fill();
  if(look==='look'){c.fillStyle='#c99a76';c.beginPath();c.ellipse(20,8,24,34,0,0,Math.PI*2);c.fill();c.fillStyle=s.hair;c.fillRect(-4,-36,40,18);c.fillStyle='#fbe9df';c.fillRect(24,-2,14,8);c.fillStyle='#d8302a';c.fillRect(30,-2,6,8);c.fillStyle='#2a1512';c.fillRect(22,-10,18,4);c.fillStyle='#c99a76';c.beginPath();c.moveTo(42,4);c.lineTo(52,18);c.lineTo(40,20);c.fill();}
  if(this.type==='police'){c.fillStyle='#16233d';c.fillRect(-46,-40,92,26);c.fillStyle='#0c1424';c.fillRect(-50,-18,100,8);}
  else if(this.type==='wealthy'){c.fillStyle='#1b1d24';c.beginPath();c.ellipse(0,-26,48,9,0,0,Math.PI*2);c.fill();c.fillRect(-30,-62,60,38);c.fillStyle='#7a2d2d';c.fillRect(-30,-34,60,6);}
  c.restore();
  }
  if(look==='warn'){const on=Math.sin(performance.now()/70)>0;c.fillStyle=on?'#ffcf6a':'#f08a6c';c.font='bold 44px sans-serif';c.textAlign='center';c.fillText('?',HEAD.x+74,HEAD.y+18);}
  // Pocket opening around the wallet.
  c.fillStyle=s.lining;c.beginPath();c.ellipse(START.x-6,START.y,40,56,0,0,Math.PI*2);c.fill();c.strokeStyle='#00000066';c.lineWidth=5;c.stroke();c.strokeStyle='#ffffff22';c.lineWidth=2;c.setLineDash([6,6]);c.beginPath();c.ellipse(START.x-6,START.y,46,62,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
  // The minigame draws its own guide and says where the wallet is.
  const w=this.game.draw(c,this.shake>0);this.gauge?.draw(c);
  c.save();c.translate(w.x,w.y);c.fillStyle=w.danger?'#a8432f':'#4a2e1e';c.fillRect(-24,-16,48,32);c.fillStyle=w.danger?'#d2654a':'#6e4630';c.fillRect(-24,-16,48,9);c.fillStyle='#e7c27a';c.fillRect(14,-3,6,6);
  if(w.ring){c.strokeStyle=w.grabbing?'#f4dc9e':'#f4dc9e88';c.lineWidth=w.grabbing?4:2;if(!w.grabbing){c.setLineDash([4,5]);c.lineDashOffset=-performance.now()/40;}c.beginPath();c.arc(0,0,38,0,Math.PI*2);c.stroke();c.setLineDash([]);}c.restore();
  c.restore();
  if(look==='look'){c.fillStyle='rgba(190,30,24,.2)';c.fillRect(0,0,W,H);c.fillStyle='#ff5a45';c.font='bold 64px sans-serif';c.textAlign='center';c.fillText('!',HEAD.x+86,HEAD.y+44);}
  if(look==='wait'&&this.lastLook==='look')this.game.note='noteBack';this.lastLook=look;
  const note=look==='warn'?'noteTurn':look==='look'?'noteLooking':this.game.note,el=this.root.querySelector('[data-pick-note]');
  el.textContent=this.t(note);el.classList.toggle('bad',['noteOff','noteFast','noteMiss','noteTurn','noteLooking'].includes(note));this.root.querySelector('[data-pick-bar]').style.width=`${this.fraction*100}%`;
  const coach=this.root.querySelector('[data-pick-coach]');coach.hidden=!this.coachKey;if(this.coachKey)coach.textContent=this.t(this.coachKey);}
}
