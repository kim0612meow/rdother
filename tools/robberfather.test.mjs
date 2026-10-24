import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Game,TUTORIAL,RULES} from '../games/robberfather/engine.js';
import {ROBBERY,kickReach} from '../games/robberfather/cinematics.js';
import {PocketInput} from '../games/robberfather/pocket-input.js';
import {shellDifficulty} from '../games/robberfather/shell.js';
import {Pickpocket} from '../games/robberfather/pickpocket.js';
import {Trace} from '../games/robberfather/pick-trace.js';
import {Timing} from '../games/robberfather/pick-timing.js';
import {MESSAGES} from '../games/robberfather/i18n.js';
const tick=(g,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds*60);i++)g.update(1/60,input);};
function practice(){const g=new Game();g.start();for(let i=0;i<3;i++)g.advanceMorning();g.tutorial=TUTORIAL.approach;g.player.x=748;g.npcs=[{...g.npcs[0],x:790,face:1,pause:999}];return g;}
test('the tutorial freezes at the turn warning even if the wallet reports 100%',()=>{
 const g=practice();g.update(.02,{pick:true,trace:1,grab:true});assert.equal(g.tutorial,TUTORIAL.dodge);
 tick(g,3,{pick:true,trace:1,grab:true});assert.equal(g.coins,0);assert.equal(g.tutorialDone,false);assert.equal(g.progress,.4*3);
});
test('closing or reopening without E cannot bypass the tutorial dodge lesson',()=>{
 const g=practice();g.update(.02,{pick:true,trace:1});g.clearHold();g.update(.02,{pick:true,trace:1});assert.equal(g.tutorial,TUTORIAL.dodge);assert.equal(g.turn.phase,'warn');assert.equal(g.coins,0);
});
test('the warning pause freezes both the actual wallet path and the timing gauge',()=>{
 const p=Object.create(Pickpocket.prototype);Object.assign(p,{active:true,type:'civilian',shake:0,render(){},game:new Trace({type:'civilian',hold:3,seed:72,start:{x:206,y:252},W:640,H:400}),gauge:new Timing({type:'civilian',seed:72})});
 p.game.index=30;p.game.grabbing=true;p.game.pointer=p.game.path[40];const index=p.game.index;
 for(let i=0;i<60;i++)p.update(1/60,true);
 assert.equal(p.game.index,index);assert.equal(p.gauge.pos,0);p.update(.05,false);assert.ok(p.game.index>index);assert.ok(p.gauge.pos>0);
});
test('pressing E to dodge unlocks the resumed theft and then completes practice',()=>{
 const g=practice();g.update(.02,{pick:true,trace:1});g.dodge();assert.equal(g.tutorial,TUTORIAL.resume);tick(g,1.6);g.update(.02,{pick:true,trace:1});assert.equal(g.coins,1);assert.equal(g.tutorialDone,true);
});
test('E cancels a Space that arrived first, within the arbitration window',()=>{const k=new PocketInput();k.request(1000);assert.equal(k.consume(1040),false);k.exit(1050);assert.equal(k.consume(1200),false);});
test('Space after E is ignored, while a later independent Space is delivered once',()=>{const k=new PocketInput();k.exit(1000);assert.equal(k.request(1075),false);assert.equal(k.request(1190),true);assert.equal(k.consume(1269),false);assert.equal(k.consume(1270),true);assert.equal(k.consume(1500),false);});
test('a higher net win makes cups faster and more numerous; losses make them easier again',()=>{
 const easy=shellDifficulty(-3),base=shellDifficulty(0),hard=shellDifficulty(4);
 assert.ok(easy.duration>base.duration&&base.duration>hard.duration);assert.ok(easy.swaps<base.swaps&&base.swaps<hard.swaps);assert.ok(easy.show>hard.show);assert.ok(shellDifficulty(2).duration>shellDifficulty(3).duration);
});
test('the robbery starts with a silent approach, then one head strike and five timed body strikes',()=>{
 const g=practice();g.gambleNet=4;g.settleBet(true);assert.equal(g.mode,'ending');assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);tick(g,ROBBERY.hit-.1);assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);tick(g,.2);assert.equal(g.drainEvents().filter(e=>e.type==='headStrike').length,1);tick(g,ROBBERY.home);const events=g.drainEvents();assert.equal(events.filter(e=>e.type==='headStrike').length,0);assert.equal(events.filter(e=>e.type==='bodyStrike').length,5);assert.equal(g.coins,0);
});
test('the robbery remains skippable, with restart available at the actual 19-second ending length',()=>{const g=practice();g.ending='robbed';g.mode='ending';assert.equal(g.endingDuration,19);g.skipEnding();assert.equal(g.endingTime,19);tick(g,.1);assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);});
test('attackers reach the centrally placed body from both sides at impact',()=>{for(let i=0;i<ROBBERY.kicks.length;i++){const side=i%2,reach=kickReach(ROBBERY.kicks[i],side);const foot=side===0?656+reach+10:784-reach-10;assert.ok(foot>=675&&foot<=766);}});
test('five coins remain distinct from three dinner portions',()=>{const g=practice();g.add('coin',5);assert.equal(g.coins,5);assert.equal(g.food,0);assert.equal(RULES.coinCap,5);g.add('coin',1);assert.equal(g.coins,5);});
test('the UI has valid bindings and matching bilingual keys',async()=>{const html=await readFile(new URL('../games/robberfather/index.html',import.meta.url),'utf8'),app=await readFile(new URL('../games/robberfather/app.js',import.meta.url),'utf8');for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${id}"`)||app.includes(`.id='${id}'`),id);assert.deepEqual(Object.keys(MESSAGES.en).sort(),Object.keys(MESSAGES.ko).sort());assert.match(MESSAGES.ko.coinCount,/\{max\}/);});

test('custom controls swap duplicates, reject reserved keys and survive reload',async()=>{const {Settings}=await import('../games/robberfather/settings.js');const s=new Settings();assert.equal(s.bind('steal','KeyR'),true);assert.equal(s.action('KeyE'),null);assert.equal(s.action('KeyR'),'steal');s.bind('left','KeyD');assert.equal(s.action('KeyD'),'left');assert.equal(s.action('KeyA'),'right');assert.equal(s.bind('home','Escape'),false);assert.equal(s.bind('home','F2'),false);const restored=new Settings(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.bindings,s.bindings);assert.equal(new Settings({volume:-3}).volume,0);assert.equal(new Settings({volume:8}).volume,1);});
 test('volume controls both master sound gain and spoken shouts',async()=>{const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape();let actual;s.master={gain:{setTargetAtTime:v=>actual=v}};s.context={currentTime:2};s.running=true;s.setVolume(.25);assert.equal(actual,.2);s.setVolume(0);assert.equal(actual,0);});

test('every pictured street door is centred on its actual entry trigger',async()=>{const {SHOPS}=await import('../games/robberfather/engine.js');const {Backgrounds}=await import('../games/robberfather/themes/backgrounds.js');const {ARCHITECTURE}=await import('../games/robberfather/themes/config.js');for(const shop of SHOPS){const calls=[],c={drawImage:(...args)=>calls.push(args)},bg={ready:true,theme:{compact:true},panels:{street:{},alley:{}},wall(){},floor(){}};Backgrounds.prototype.street.call(bg,c,shop.door-720,[shop]);const [,sx,,sw,,dx,,dw]=calls[0];const door=shop.kind===5?ARCHITECTURE.alleyDoor:ARCHITECTURE.streetDoor;assert.ok(Math.abs(dx+(door-sx)*dw/sw-720)<.001);const g=practice();g.tutorial=TUTORIAL.done;g.player.x=shop.door;assert.equal(g.nearbyDoor().shop.id,shop.id);g.useDoor();assert.equal(g.nearbyDoor().exit,true);g.useDoor();assert.equal(g.player.x,shop.door);}});

test('loaded carts stay clear of doors and accept cover from their visible edge',async()=>{const {BOXES,SHOPS,Game,TUTORIAL,RULES}=await import('../games/robberfather/engine.js');for(const cart of BOXES.filter(b=>!b.inside)){for(const door of SHOPS)assert.ok(Math.abs(cart.x-door.door)>98+45);const g=new Game();g.start();g.mode='day';g.tutorial=TUTORIAL.done;g.player.x=cart.x+90;assert.equal(g.nearbyBox().id,cart.id);g.toggleHide();assert.equal(g.player.hidden,true);assert.equal(g.player.x,cart.x);const copy=new Game(g.save());copy.start();assert.equal(copy.player.hidden,true);assert.equal(copy.player.boxId,cart.id);copy.update(.02,{hide:true});assert.equal(copy.player.hidden,false);}});
