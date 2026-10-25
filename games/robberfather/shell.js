// The shell game on the crate in a dark alley. Bet one coin, watch the ball go under a cup, follow the cups, click the right one.
// The more you have won so far, the more swaps and the faster the hands. hooks: bet() -> bool, settle(win), sound(name).
const W=640,H=360,SLOTS=[170,320,470],CUP_Y=270;
export function shellDifficulty(net){const level=Math.max(-4,Math.min(4,net));return{swaps:Math.max(3,5+level),duration:.44-level*.045,show:1.4-level*.12};}
const ease=k=>k<.5?2*k*k:1-2*(1-k)*(1-k);
export class Shell{
 constructor(root,t,hooks){this.root=root;this.t=t;this.hooks=hooks;this.canvas=root.querySelector('canvas');this.c=this.canvas.getContext('2d');this.active=false;this.state='idle';this.hover=-1;this.slot=[0,1,2];this.ball=1;this.net=0;
  const pos=e=>{const r=this.canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};};
  this.canvas.addEventListener('pointermove',e=>{this.hover=this.cupAt(pos(e));});
  this.canvas.addEventListener('pointerdown',e=>{if(!this.active)return;e.preventDefault();if(this.state==='idle')this.bet();else if(this.state==='pick'){const cup=this.cupAt(pos(e));if(cup>=0)this.choose(cup);}});
  root.querySelector('[data-shell-bet]').addEventListener('click',()=>this.bet());}
 open(net){this.active=true;this.root.hidden=false;this.state='idle';this.net=net;this.result=null;this.slot=[0,1,2];this.render();}
 close(){this.active=false;this.root.hidden=true;this.state='idle';}
 // A round is under way: the coin is already on the table.
 get busy(){return this.active&&this.state!=='idle';}
 bet(){if(!this.active||this.state!=='idle'||!this.hooks.bet())return;const difficulty=shellDifficulty(this.net);this.showSeconds=difficulty.show;this.ball=Math.floor(Math.random()*3);this.swaps=Array.from({length:difficulty.swaps},()=>{const a=Math.floor(Math.random()*3);return[a,(a+1+Math.floor(Math.random()*2))%3];});this.dur=difficulty.duration;this.step=0;this.state='show';this.time=0;this.result=null;}
 choose(cup){this.chosen=cup;this.win=cup===this.ball;this.state='reveal';this.time=0;this.hooks.sound('cupMove');}
 update(dt){if(!this.active)return;this.time+=dt;
  if(this.state==='show'&&this.time>this.showSeconds){this.state='shuffle';this.time=0;}
  else if(this.state==='shuffle'&&this.time>=this.dur){const [a,b]=this.swaps[this.step],ca=this.slot.indexOf(a),cb=this.slot.indexOf(b);this.slot[ca]=b;this.slot[cb]=a;this.step++;this.time=0;this.hooks.sound('cupMove');if(this.step>=this.swaps.length)this.state='pick';}
  else if(this.state==='reveal'&&this.time>1.5){this.state='idle';this.result=this.win;this.net+=this.win?1:-1;this.hooks.settle(this.win);}
  this.render();}
 cupX(cup){const base=SLOTS[this.slot[cup]];if(this.state!=='shuffle')return{x:base,y:0};const [a,b]=this.swaps[this.step],s=this.slot[cup];if(s!==a&&s!==b)return{x:base,y:0};const k=ease(Math.min(1,this.time/this.dur)),to=SLOTS[s===a?b:a];return{x:base+(to-base)*k,y:(s===a?-1:1)*Math.sin(k*Math.PI)*24};}
 lift(cup){const k=Math.min(1,this.time/.35);if(this.state==='show'&&cup===this.ball)return 70*(this.time<this.showSeconds-.3?k:Math.max(0,1-(this.time-(this.showSeconds-.3))/.3));if(this.state==='reveal'&&(cup===this.chosen||cup===this.ball&&this.time>.5))return 70*(cup===this.chosen?k:Math.min(1,(this.time-.5)/.35));return 0;}
 cupAt(p){for(let cup=0;cup<3;cup++){const {x}=this.cupX(cup);if(Math.abs(p.x-x)<50&&p.y>CUP_Y-110&&p.y<CUP_Y+20)return cup;}return-1;}
 note(){if(this.state==='idle')return this.result===null?'shellIdle':this.result?'shellWin':'shellLose';return{show:'shellShow',shuffle:'shellShuffle',pick:'shellPick',reveal:this.win?'shellWin':'shellLose'}[this.state];}
 render(){this.root.querySelector('[data-shell-exit-note]').hidden=!this.busy;const c=this.c;c.fillStyle='#1d2b22';c.fillRect(0,0,W,H);const glow=c.createRadialGradient(W/2,40,10,W/2,120,380);glow.addColorStop(0,'#f0c9703a');glow.addColorStop(1,'#f0c97000');c.fillStyle=glow;c.fillRect(0,0,W,H);
  c.fillStyle='#5b4630';c.fillRect(40,CUP_Y-6,W-80,H-CUP_Y);c.fillStyle='#7a6040';c.fillRect(40,CUP_Y-6,W-80,10);
  const order=[0,1,2].sort((a,b)=>this.cupX(a).y-this.cupX(b).y);
  const bx=this.cupX(this.ball).x;c.fillStyle='#d8d0b8';c.beginPath();c.arc(bx,CUP_Y-14,11,0,Math.PI*2);c.fill();c.fillStyle='#ffffff80';c.fillRect(bx-5,CUP_Y-21,4,4);
  for(const cup of order){const {x,y}=this.cupX(cup),up=this.lift(cup),top=CUP_Y-100-up+y,bottom=CUP_Y-up+y;c.fillStyle='#00000055';c.beginPath();c.ellipse(x,CUP_Y+2,46,7,0,0,Math.PI*2);c.fill();
   c.fillStyle=this.state==='pick'&&this.hover===cup?'#b57a44':'#8a5a32';c.beginPath();c.moveTo(x-46,bottom);c.lineTo(x+46,bottom);c.lineTo(x+30,top);c.lineTo(x-30,top);c.closePath();c.fill();c.fillStyle='#6a4426';c.fillRect(x-46,bottom-10,92,10);c.fillStyle='#a8754a';c.fillRect(x-24,top+8,8,bottom-top-24);
   if(this.state==='pick'&&this.hover===cup){c.strokeStyle='#e7c27a';c.lineWidth=3;c.strokeRect(x-52,top-6,104,bottom-top+12);}}
  this.root.querySelector('[data-shell-note]').textContent=this.t(this.note());this.root.querySelector('[data-shell-note]').classList.toggle('bad',this.state==='reveal'&&!this.win||this.state==='idle'&&this.result===false);
  this.root.querySelector('[data-shell-net]').textContent=this.t('shellNet',{net:this.net>0?`+${this.net}`:this.net});this.root.querySelector('[data-shell-bet]').disabled=this.state!=='idle';this.canvas.style.cursor=this.state==='pick'||this.state==='idle'?'pointer':'default';}
}
