import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,RULES,TUTORIAL,SHOPS,BOXES,BINS,COUNTER,INSIDE_DOOR} from '../games/robberfather/engine.js';
import {UseInput} from '../games/robberfather/use-input.js';
import {PocketInput} from '../games/robberfather/pocket-input.js';
import {Timing} from '../games/robberfather/pick-timing.js';
import {Trace} from '../games/robberfather/pick-trace.js';
import {Shell} from '../games/robberfather/shell.js';
const fresh=()=>{const g=new Game({version:3,day:1,tutorialDone:true,mode:'day',inventory:[]});g.start();return g;};
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function invariant(g,label){
 for(const n of [g.player.x,g.player.stamina,g.timeLeft,g.progress,g.suspicion,g.day,g.gambleNet])assert.ok(Number.isFinite(n),label+' finite state');
 assert.ok(g.coins>=0&&g.coins<=5&&g.food>=0&&g.food<=5,label+' inventory bounds');
 assert.ok(g.player.stamina>=0&&g.player.stamina<=RULES.stamina,label+' stamina');
 assert.ok(g.timeLeft>=0&&g.timeLeft<=RULES.daySeconds,label+' clock');
 assert.ok(g.inventory.every(x=>['coin','fresh','rotten'].includes(x)),label+' items');
 assert.equal(new Set(g.chasers).size,g.chasers.length,label+' unique pursuers');
 assert.ok(g.chasers.every(id=>g.npcs.some(n=>n.id===id)),label+' valid pursuers');
 if(g.player.hidden)assert.ok(BOXES.some(b=>b.id===g.player.boxId),label+' cover');
 for(const n of g.npcs)assert.ok(Number.isFinite(n.x)&&Number.isFinite(n.witness),label+' npc');
}
test('200,000 seeded chaotic input frames, with 5,500 save/reload cycles',()=>{
 const actions=['left','right','run','hide','enter','steal','leave','discard','skipTutorial'];
 for(let seed=1;seed<=100;seed++){
  const random=rng(seed);let g=fresh();g.inventory=['coin','coin','coin','rotten'];
  if(seed%4===0)g.player.x=SHOPS[1].x0+COUNTER;
  else if(seed%4===1)g.player.x=BOXES[0].x;
  else if(seed%4===2)g.player.x=BINS[0].x;
  else{g.tutorialDone=false;g.tutorial=TUTORIAL.approach;g.player.x=760;}
  for(let frame=0;frame<2000;frame++){
   const input=Object.fromEntries(actions.map(a=>[a,random()<.38]));
   input.pick=random()<.4;input.grab=random()<.4;input.trace=random();input.risk=random()<.1?.15:0;input.slip=random()<.1?.1:0;input.qteHit=random()<.2;
   g.update([0,.001,.016,.05,.5][Math.floor(random()*5)],input);
   if(random()<.1)g.buyMax();
   if(g.mode==='caught')g.recover();
   if(g.mode==='return')g.beginNight();
   if(g.mode==='night')g.nextDay();
   if(g.mode==='morning')g.advanceMorning();
   if(frame%37===0){g=new Game(JSON.parse(JSON.stringify(g.save())));g.start();}
   if(frame%10===0)invariant(g,`seed ${seed} frame ${frame}`);
   if(frame%25===0)g.drainEvents();
  }
 }
});
test('5,000 purchase and bulk-purchase presses cannot duplicate food or overdraw coins',()=>{
 for(const kind of [0,1,4]){const g=fresh(),shop=SHOPS.find(s=>s.kind===kind);g.player.x=shop.x0+COUNTER;g.inventory=Array(5).fill('coin');g.rottenStreak=1;
  for(let i=0;i<5000;i++){g.buy(i%2===0);invariant(g,'buy');}
  assert.equal(g.drainEvents().filter(e=>e.type==='bought').reduce((n,e)=>n+e.spent,0),kind===4?0:kind===0?4:5);
 }
});
test('5,000 bin take/leave and discard presses never duplicate a bin item',()=>{
 const g=fresh();g.player.x=BINS[0].x;
 for(let i=0;i<5000;i++){g.inspectBin();g.finishBin(i%2===0);g.finishBin(true);g.discardRotten();}
 assert.equal(g.drainEvents().filter(e=>e.type==='scavenged').length,1);assert.equal(g.food,0);
});
test('5,000 cover and door presses preserve lockout and valid locations',()=>{
 const g=fresh();g.player.x=BOXES[0].x;g.toggleHide();for(let i=0;i<5000;i++)g.toggleHide();assert.equal(g.player.hidden,true);
 g.update(.05,{});assert.ok(g.player.hideLock>0);
 const d=fresh();d.player.x=SHOPS[1].door;for(let i=0;i<5000;i++){d.useDoor();invariant(d,'door');}assert.ok([SHOPS[1].door,SHOPS[1].x0+INSIDE_DOOR].includes(d.player.x));
});
test('5,000 scene buttons cannot advance multiple days or consume dinner twice',()=>{
 const g=fresh();g.inventory=['fresh','fresh','fresh','coin'];for(let i=0;i<5000;i++)g.goHome();for(let i=0;i<5000;i++)g.beginNight();assert.equal(g.stats.meals,1);assert.deepEqual(g.inventory,['coin']);for(let i=0;i<5000;i++)g.nextDay();assert.equal(g.day,2);
 const p=new Game();p.start({prologue:true});for(let i=0;i<5000;i++)p.advancePrologue();assert.equal(p.mode,'morning');assert.equal(p.drainEvents().filter(e=>e.type==='prologueEnd').length,1);
 for(let i=0;i<5000;i++)p.advanceMorning();assert.equal(p.mode,'day');assert.equal(p.drainEvents().filter(e=>e.type==='dayStart').length,1);
});
test('10,000 rapid E/Space and held-buy gestures fire no delayed or duplicate actions',()=>{
 const use=new UseInput(),pocket=new PocketInput();let buys=0;
 for(let i=0;i<10000;i++){const t=i*1000;use.press(t,1);for(let j=0;j<5;j++)if(use.update(t+700,1)==='buy')buys++;assert.equal(use.release(t+710,1),null);pocket.request(t);pocket.exit(t+1);assert.equal(pocket.consume(t+100),false);assert.equal(pocket.request(t+100),false);}
 assert.equal(buys,10000);
});
test('10,000 random mouse/QTE taps retain finite progress and bounded hit rate',()=>{
 const random=rng(491);for(const type of ['civilian','wealthy','police']){
 const gauge=new Timing({type,seed:123,day:100}),trace=new Trace({type,hold:3,seed:132,start:{x:206,y:252},W:640,H:400});let hits=0;
 for(let i=0;i<10000;i++){trace.down({x:random()*640,y:random()*400});trace.move({x:random()*640,y:random()*400});trace.update(.016);gauge.update(.016,true);for(let j=0;j<20;j++)if(gauge.tap())hits++;assert.ok(trace.fraction>=0&&trace.fraction<=1);assert.ok(gauge.pos>=0&&gauge.pos<=1);}
 assert.ok(hits<800,'button spam cannot produce unlimited hits');
 }
});
test('a shell round cannot be paid twice or chosen again after revealing',()=>{
 let stakes=0,payouts=0;const shell=Object.create(Shell.prototype);Object.assign(shell,{active:true,state:'idle',net:0,hooks:{bet:()=>{stakes++;return true;},settle:()=>payouts++,sound(){}},render(){}});
 for(let i=0;i<5000;i++)shell.bet();assert.equal(stakes,1);
 shell.state='pick';shell.choose(shell.ball);for(let i=0;i<5000;i++)shell.choose((shell.ball+1)%3);assert.equal(shell.win,true);
 for(let i=0;i<5000;i++)shell.update(.05);assert.equal(payouts,1);
});

test('5,000 duplicate wager calls cannot create free payouts or overwrite an active stake',()=>{
 const g=fresh();g.player.x=SHOPS.find(s=>s.kind===5).x0+COUNTER;g.inventory=['coin','coin'];
 for(let i=0;i<5000;i++)g.settleBet(true);assert.equal(g.coins,2);assert.equal(g.gambleNet,0);
 assert.equal(g.placeBet(),true);for(let i=0;i<5000;i++)assert.equal(g.placeBet(),false);assert.equal(g.coins,1);
 g.settleBet(true);for(let i=0;i<5000;i++)g.settleBet(true);assert.equal(g.coins,3);assert.equal(g.gambleNet,1);
 assert.equal(g.drainEvents().filter(e=>e.type==='betWon').length,1);
 g.placeBet();const restored=new Game(JSON.parse(JSON.stringify(g.save())));restored.start();const coins=restored.coins;restored.settleBet(true);assert.equal(restored.coins,coins,'reloading cannot replay an unsaved round');
});
