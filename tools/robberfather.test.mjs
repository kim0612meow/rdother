import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Game,TUTORIAL,RULES,SHOPS} from '../games/robberfather/engine.js';
import {ROBBERY,kickReach} from '../games/robberfather/cinematics.js';
import {PocketInput} from '../games/robberfather/pocket-input.js';
import {shellDifficulty} from '../games/robberfather/shell.js';
import {Pickpocket} from '../games/robberfather/pickpocket.js';
import {Trace} from '../games/robberfather/pick-trace.js';
import {Timing} from '../games/robberfather/pick-timing.js';
import {MESSAGES} from '../games/robberfather/i18n.js';
const tick=(g,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds*60);i++)g.update(1/60,input);};
function practice(){const g=new Game();g.start();for(let i=0;i<3;i++)g.advanceMorning();g.tutorial=TUTORIAL.approach;g.player.x=748;g.npcs=[{...g.npcs[0],x:790,face:1,pause:999}];return g;}
function completeShopping(g){g.advanceTutorial();assert.equal(g.tutorial,TUTORIAL.shop);g.player.x=1006;assert.equal(g.useDoor(),true);assert.equal(g.tutorial,TUTORIAL.counter);g.player.x=g.shop.x0+1110;g.update(.02);assert.equal(g.tutorial,TUTORIAL.purchase);assert.equal(g.buy(),true);assert.equal(g.tutorial,TUTORIAL.meal);g.advanceTutorial();}
function reachWarning(g){g.update(.02,{pick:true,trace:1});assert.equal(g.tutorial,TUTORIAL.qte);g.update(.02,{pick:true,trace:1,qteHit:true});g.update(.02,{pick:true,trace:1});}
test('the tutorial freezes at the turn warning even if the wallet reports 100%',()=>{
 const g=practice();reachWarning(g);assert.equal(g.tutorial,TUTORIAL.dodge);
 tick(g,3,{pick:true,trace:1,grab:true});assert.equal(g.coins,0);assert.equal(g.tutorialDone,false);assert.equal(g.progress,.4*3);
});
test('closing or reopening without E cannot bypass the tutorial dodge lesson',()=>{
 const g=practice();reachWarning(g);g.clearHold();g.update(.02,{pick:true,trace:1});assert.equal(g.tutorial,TUTORIAL.dodge);assert.equal(g.turn.phase,'warn');assert.equal(g.coins,0);
});
test('the warning pause freezes both the actual wallet path and the timing gauge',()=>{
 const p=Object.create(Pickpocket.prototype);Object.assign(p,{active:true,type:'civilian',shake:0,render(){},game:new Trace({type:'civilian',hold:3,seed:72,start:{x:206,y:252},W:640,H:400}),gauge:new Timing({type:'civilian',seed:72})});
 p.game.index=30;p.game.grabbing=true;p.game.pointer=p.game.path[40];const index=p.game.index;
 for(let i=0;i<60;i++)p.update(1/60,true);
 assert.equal(p.game.index,index);assert.equal(p.gauge.pos,0);p.update(.05,false);assert.ok(p.game.index>index);assert.ok(p.gauge.pos>0);
});
test('E withdrawal and a successful theft lead to a real detection, not premature completion',()=>{
 const g=practice();reachWarning(g);g.dodge();assert.equal(g.tutorial,TUTORIAL.resume);tick(g,1.6);g.update(.02,{pick:true,trace:1});assert.equal(g.coins,1);assert.equal(g.tutorialDone,false);assert.equal(g.tutorial,TUTORIAL.caught);assert.equal(g.caughtCount,1);assert.ok(g.chasers.includes(0));assert.equal(g.npcs[0].knows,true);
});
test('E cancels a Space that arrived first, within the arbitration window',()=>{const k=new PocketInput();k.request(1000);assert.equal(k.consume(1040),false);k.exit(1050);assert.equal(k.consume(1200),false);});
test('Space after E is ignored, while a later independent Space is delivered once',()=>{const k=new PocketInput();k.exit(1000);assert.equal(k.request(1075),false);assert.equal(k.request(1190),true);assert.equal(k.consume(1269),false);assert.equal(k.consume(1270),true);assert.equal(k.consume(1500),false);});
test('a higher net win makes cups faster and more numerous; losses make them easier again',()=>{
 const easy=shellDifficulty(-3),base=shellDifficulty(0),hard=shellDifficulty(4);
 assert.ok(easy.duration>base.duration&&base.duration>hard.duration);assert.ok(easy.swaps<base.swaps&&base.swaps<hard.swaps);assert.ok(easy.show>hard.show);assert.ok(shellDifficulty(2).duration>shellDifficulty(3).duration);
});
test('the robbery starts with a silent approach, then one head strike and five timed body strikes',()=>{
 const g=practice();g.gambleNet=4;g.player.x=SHOPS.find(s=>s.kind===5).x0+1110;g.add('coin',1);g.placeBet();g.settleBet(true);assert.equal(g.mode,'ending');assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);tick(g,ROBBERY.hit-.1);assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);tick(g,.2);assert.equal(g.drainEvents().filter(e=>e.type==='headStrike').length,1);tick(g,ROBBERY.home);const events=g.drainEvents();assert.equal(events.filter(e=>e.type==='headStrike').length,0);assert.equal(events.filter(e=>e.type==='bodyStrike').length,5);assert.equal(g.coins,0);
});
test('the robbery remains skippable, with restart available at the actual 19-second ending length',()=>{const g=practice();g.ending='robbed';g.mode='ending';assert.equal(g.endingDuration,19);g.skipEnding();assert.equal(g.endingTime,19);tick(g,.1);assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);});
test('attackers reach the centrally placed body from both sides at impact',()=>{for(let i=0;i<ROBBERY.kicks.length;i++){const side=i%2,reach=kickReach(ROBBERY.kicks[i],side);const foot=side===0?656+reach+10:784-reach-10;assert.ok(foot>=675&&foot<=766);}});
test('five coins remain distinct from three dinner portions',()=>{const g=practice();g.add('coin',5);assert.equal(g.coins,5);assert.equal(g.food,0);assert.equal(RULES.coinCap,5);g.add('coin',1);assert.equal(g.coins,5);});
test('the UI has valid bindings and matching bilingual keys',async()=>{const html=await readFile(new URL('../games/robberfather/index.html',import.meta.url),'utf8'),app=await readFile(new URL('../games/robberfather/app.js',import.meta.url),'utf8');for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${id}"`)||app.includes(`.id='${id}'`),id);assert.deepEqual(Object.keys(MESSAGES.en).sort(),Object.keys(MESSAGES.ko).sort());assert.match(MESSAGES.ko.coinCount,/\{max\}/);});

test('custom controls swap duplicates, reject reserved keys and survive reload',async()=>{const {Settings}=await import('../games/robberfather/settings.js');const s=new Settings();assert.equal(s.bind('steal','KeyR'),true);assert.equal(s.action('KeyE'),'buyMax');assert.equal(s.action('KeyR'),'steal');s.bind('left','KeyD');assert.equal(s.action('KeyD'),'left');assert.equal(s.action('KeyA'),'right');assert.equal(s.bind('home','Escape'),false);assert.equal(s.bind('home','F2'),false);const restored=new Settings(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.bindings,s.bindings);assert.equal(new Settings({volume:-3}).volume,0);assert.equal(new Settings({volume:8}).volume,1);});
 test('volume controls both master sound gain and spoken shouts',async()=>{const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape();let actual;s.master={gain:{setTargetAtTime:v=>actual=v}};s.context={currentTime:2};s.running=true;s.setVolume(.25);assert.equal(actual,.6);s.setVolume(0);assert.equal(actual,0);});

test('every pictured street door is centred on its actual entry trigger',async()=>{const {SHOPS}=await import('../games/robberfather/engine.js');const {Backgrounds}=await import('../games/robberfather/themes/backgrounds.js');const {ARCHITECTURE}=await import('../games/robberfather/themes/config.js');for(const shop of SHOPS){const calls=[],c={drawImage:(...args)=>calls.push(args)},bg={ready:true,theme:{compact:true},panels:{street:{},alley:{}},wall(){},floor(){}};Backgrounds.prototype.street.call(bg,c,shop.door-720,[shop]);const [,sx,,sw,,dx,,dw]=calls[0];const door=shop.kind===5?ARCHITECTURE.alleyDoor:ARCHITECTURE.streetDoor;assert.ok(Math.abs(dx+(door-sx)*dw/sw-720)<.001);const g=practice();g.tutorial=TUTORIAL.done;g.player.x=shop.door;assert.equal(g.nearbyDoor().shop.id,shop.id);g.useDoor();assert.equal(g.nearbyDoor().exit,true);g.useDoor();assert.equal(g.player.x,shop.door);}});

test('loaded carts stay clear of doors and accept cover from their visible edge',async()=>{const {BOXES,SHOPS,Game,TUTORIAL,RULES}=await import('../games/robberfather/engine.js');for(const cart of BOXES.filter(b=>!b.inside)){for(const door of SHOPS)assert.ok(Math.abs(cart.x-door.door)>RULES.coverWidth/2+45);const g=new Game();g.start();g.mode='day';g.tutorial=TUTORIAL.done;g.player.x=cart.x+90;assert.equal(g.nearbyBox().id,cart.id);g.toggleHide();assert.equal(g.player.hidden,true);assert.equal(g.player.x,cart.x);const copy=new Game(g.save());copy.start();assert.equal(copy.player.hidden,true);assert.equal(copy.player.boxId,cart.id);copy.update(.02,{hide:true});assert.equal(copy.player.hidden,true);tick(copy,.6);copy.update(.02,{hide:true});assert.equal(copy.player.hidden,false);}});

test('every room lets you walk left to exit once, without immediately bouncing on entry',async()=>{const {SHOPS,areaAt}=await import('../games/robberfather/engine.js');for(const shop of SHOPS){const g=new Game();g.start();g.mode='day';g.tutorial=TUTORIAL.done;g.npcs=[];g.player.x=shop.door;g.useDoor();g.drainEvents();tick(g,.15,{left:true});assert.equal(g.shop?.id,shop.id);tick(g,.5,{left:true});assert.equal(areaAt(g.player.x),null);assert.equal(g.drainEvents().filter(e=>e.type==='exitShop').length,1);tick(g,.2,{left:true});assert.equal(g.shop,null);assert.equal(g.drainEvents().filter(e=>e.type==='enterShop').length,0);}});
 test('whole facade bays exactly cover the street, with no overlapping patches or clipped doorway centres',async()=>{const {SHOPS,WORLD}=await import('../games/robberfather/engine.js');const {streetBays,facadeSlices}=await import('../games/robberfather/themes/layout.js');const {ARCHITECTURE}=await import('../games/robberfather/themes/config.js');const bays=streetBays(SHOPS,WORLD);assert.equal(bays[0].left,0);assert.equal(bays.at(-1).right,WORLD);for(let i=0;i<bays.length;i++){const bay=bays[i];if(i)assert.equal(bay.left,bays[i-1].right);const u=ARCHITECTURE.moduleDoor[bay.kind===5?1:0],parts=facadeSlices(bay,888,u);assert.equal(parts[0].dx,bay.left);assert.equal(parts.at(-1).dx+parts.at(-1).dw,bay.right);for(const p of parts){assert.ok(p.sw>0&&p.dw>0);}const centre=parts[1];assert.ok(Math.abs(centre.dx+(888*u-centre.sx)*centre.dw/centre.sw-bay.door)<.001);}});
 test('flat paving stays below the foot line and scrolls with the world',async()=>{const {Backgrounds}=await import('../games/robberfather/themes/backgrounds.js');const {GROUND}=await import('../games/robberfather/engine.js');const render=cam=>{const calls=[],c={save(){},beginPath(){},rect(){},clip(){},restore(){},drawImage:(...args)=>calls.push(args)};Backgrounds.prototype.floor.call({theme:{flatFloor:true},paving:{}},c,{},cam);return calls;};const first=render(123),second=render(133);assert.ok(first.every(call=>call.length===3&&call[2]>=GROUND));assert.equal(first[0][1]-second[0][1],10);});


test('the Korean guide stays below half the 1,528-character original, including its price table',()=>{
 const m=MESSAGES.ko,copy=Array.from({length:6},(_,i)=>m['helpShort'+(i+1)]).join('')+['shopLabel','itemLabel','priceLabel','bakery','market','pharmacy','breadItem','potatoItem','medicineItem'].map(k=>m[k]).join('')+'214';
 assert.ok(copy.length<=764,copy.length+' characters');
 assert.match(m.pickHintDual,/Space/i);assert.match(m.pickHintDual,/E 사용/);assert.equal(m.dialogueNext,'다음');
});
test('rebinding movement updates both compact and spaced key labels',async()=>{
 const {settings,controlText}=await import('../games/robberfather/settings.js');const original={...settings.bindings};
 try{settings.bind('left','KeyJ');settings.bind('right','KeyL');settings.bind('steal','KeyR');assert.equal(controlText('A/D 이동 · A / D 이동 · E 사용'),'J/L 이동 · J / L 이동 · R 사용');}finally{settings.bindings=original;}
});


test('the walking camera leaves only 15 percent foreground at street and room zooms',async()=>{
 const {streetFocusY,cameraWindow,FOOT_LINE}=await import('../games/robberfather/framing.js');
 for(const zoom of [1.5,2,2.8]){const view=cameraWindow(zoom,720,streetFocusY(zoom));const feet=(650-view.sy)*zoom/840;assert.ok(Math.abs(feet-FOOT_LINE)<.00001);assert.ok(feet>=.84&&feet<=.87);}
});
test('indoor legacy cover ids draw cupboards while outdoor poses stay behind the load',async()=>{
 const {BOXES}=await import('../games/robberfather/engine.js');const {coverPlacement}=await import('../games/robberfather/framing.js');
 for(const cover of BOXES){const p=coverPlacement(cover,.5);assert.equal(p.prop,cover.inside?'storage':'cover');if(!cover.inside)assert.ok(p.poseX+40<=cover.x);const g=practice();g.tutorial=TUTORIAL.done;g.player.x=cover.x;g.toggleHide();assert.equal(g.player.hidden,true);const loaded=new Game(g.save());loaded.start();assert.equal(loaded.player.boxId,cover.id);assert.equal(loaded.player.hidden,true);}
});
test('the new alley facade fills to the top and keeps the real door on its exit marker',async()=>{
 const {Backgrounds}=await import('../games/robberfather/themes/backgrounds.js');const img={width:1536,height:1024};let args;Backgrounds.prototype.completeAlley.call({alleyWall:img,wholeWall(...a){args=a;}});
 const calls=[],ctx={fillRect(){},drawImage(...a){calls.push(a);}};Backgrounds.prototype.wholeWall.call({panels:{street:{}},floor(){}},ctx,...args.slice(1));
 assert.equal(calls.length,3);for(const a of calls){assert.equal(a[6],0);assert.equal(a[8],650);}
 const a=calls[1],centre=280;assert.ok(Math.abs(a[5]+(centre-a[1])*a[7]/a[3]-150)<.001);assert.ok(180*a[7]/a[3]>=100);
});


test('different window ratios fill the display with square pixels and a bounded camera',async()=>{
 const {viewportSize,fitZoom,cameraWindow,streetFocusY}=await import('../games/robberfather/framing.js');
 for(const [w,h]of [[1090,870],[1280,720],[1920,1080],[2560,1080],[3440,1080],[800,900]]){const v=viewportSize(w,h),z=fitZoom(1.5,v.width,v.height),r=cameraWindow(z,720,streetFocusY(z),v.width,v.height);assert.ok(Math.abs(w/v.width-h/v.height)<.002);assert.ok(r.sx>=0&&r.sy>=0);assert.ok(r.sx+r.w<=1440+.001&&r.sy+r.h<=840+.001);assert.ok(Math.abs((650-r.sy)*z/v.height-.85)<.001);}
});
test('mouse and world positions round-trip correctly after changing aspect ratio',async()=>{
 const {viewportSize,fitZoom,cameraWindow,worldToCanvas,canvasToWorld}=await import('../games/robberfather/framing.js');
 for(const [w,h]of [[1090,870],[1280,720],[2560,1080]]){const size=viewportSize(w,h),zoom=fitZoom(1.5,size.width,size.height),r=cameraWindow(zoom,720,430,size.width,size.height),v={...r,zoom,cam:900};for(const p of [{x:1200,y:650},{x:1600,y:590}]){const c=worldToCanvas(v,p.x,p.y),back=canvasToWorld(v,c.x,c.y);assert.ok(Math.abs(back.x-p.x)<.001&&Math.abs(back.y-p.y)<.001);}}
});
test('whole window storeys cover the top of the street at every camera position',async()=>{
 const {Backgrounds}=await import('../games/robberfather/themes/backgrounds.js');const {SHOPS}=await import('../games/robberfather/engine.js');
 for(const cam of [0,900,2100,2960]){const calls=[],ctx={fillRect(){},drawImage(...a){calls.push(a);}},bg={modules:{width:1774,height:887},panels:{street:{}},floor(){}};Backgrounds.prototype.moduleStreet.call(bg,ctx,cam,SHOPS);const top=calls.filter(a=>a[6]<=0&&a[6]+a[8]>0).sort((a,b)=>a[5]-b[5]);let covered=0;for(const a of top){if(a[5]+a[7]<0)continue;assert.ok(a[5]<=covered+.001,'gap above building');assert.ok(a[4]>300,'whole upper windows');covered=Math.max(covered,a[5]+a[7]);}assert.ok(covered>=1440);}
});
test('every indoor hiding place is central and old hidden saves move with the same cover id',async()=>{
 const {Game,SHOPS,BOXES}=await import('../games/robberfather/engine.js');for(const b of BOXES.filter(b=>b.inside)){const shop=SHOPS.find(s=>b.x>=s.x0&&b.x<=s.x1);assert.equal(b.x,(shop.x0+shop.x1)/2);const g=practice();g.inventory=['coin','fresh'];g.player.x=shop.x0+1240;g.player.hidden=true;g.player.boxId=b.id;const copy=new Game(g.save());copy.start();assert.equal(copy.player.x,b.x);assert.equal(copy.player.boxId,b.id);assert.equal(copy.player.hidden,true);assert.equal(copy.coins,1);assert.equal(copy.food,1);}
});

test('home/title framing leaves eight percent paving at tall, desktop and wide ratios',async()=>{
 const {HOME_ZOOM,HOME_FOOT_LINE,homeFocusY,fitZoom,viewportSize,cameraWindow}=await import('../games/robberfather/framing.js');
 for(const [w,h]of [[1090,870],[1280,720],[2100,900]]){const size=viewportSize(w,h),zoom=fitZoom(HOME_ZOOM,size.width,size.height),v=cameraWindow(zoom,720,homeFocusY(zoom),size.width,size.height);assert.ok(Math.abs((650-v.sy)*zoom/840-HOME_FOOT_LINE)<.001);for(const x of [925,1040])assert.ok((x-v.sx)*zoom>0&&(x-v.sx)*zoom<size.width);assert.ok((638-v.sy)*zoom<840-35);}
});
test('a new story has a timed, skippable prologue while continuing preserves its saved scene',()=>{
 const g=new Game();g.start({prologue:true});assert.equal(g.mode,'prologue');tick(g,4);assert.equal(g.mode,'prologue');g.skipPrologue();assert.equal(g.mode,'morning');assert.equal(g.morningIndex,0);assert.equal(g.timeLeft,RULES.daySeconds);
 const auto=new Game();auto.start({prologue:true});tick(auto,24.1);assert.equal(auto.mode,'morning');assert.equal(auto.drainEvents().filter(e=>e.type==='prologueEnd').length,1);
 const saved=practice();saved.tutorialDone=true;saved.tutorial=TUTORIAL.done;saved.inventory=['fresh','coin'];const copy=new Game(saved.save());copy.start();assert.equal(copy.mode,'day');assert.deepEqual(copy.inventory,['fresh','coin']);
});
test('the QTE lesson cannot be passed by mouse progress or a missed Space press',()=>{
 const g=practice();g.update(.02,{pick:true,trace:1});assert.equal(g.tutorial,TUTORIAL.qte);tick(g,5,{pick:true,trace:1,qteHit:false,slip:.3});assert.equal(g.tutorial,TUTORIAL.qte);assert.equal(g.coins,0);assert.equal(g.tutorialDone,false);assert.equal(g.timeLeft,RULES.daySeconds);g.update(.02,{pick:true,trace:1,qteHit:true});assert.equal(g.tutorialQte,true);assert.equal(g.tutorial,TUTORIAL.pull);
 const gauge=new Timing({type:'civilian',seed:72});gauge.running=true;gauge.pos=0;assert.equal(gauge.tap(),false);gauge.flash=0;gauge.pos=(gauge.zone[0]+gauge.zone[1])/2;assert.equal(gauge.tap(),true);
});
test('Space practice freezes the wallet while its gauge continues moving without a mouse hold',()=>{
 const p=Object.create(Pickpocket.prototype);Object.assign(p,{active:true,type:'civilian',shake:0,render(){},game:new Trace({type:'civilian',hold:3,seed:72,start:{x:206,y:252},W:640,H:400}),gauge:new Timing({type:'civilian',seed:72})});p.game.index=20;for(let i=0;i<20;i++)p.update(1/60,false,true);assert.equal(p.game.index,20);assert.ok(p.gauge.pos>0);assert.equal(p.gauge.running,true);
});
test('the hiding lesson requires actual F cover, then explains memory before completion',()=>{
 const g=practice();reachWarning(g);g.dodge();tick(g,1.6);g.update(.02,{pick:true,trace:1});const before=g.player.x;tick(g,2,{right:true});assert.equal(g.player.x,before);assert.equal(g.caughtCount,1);g.advanceTutorial();tick(g,3.6,{right:true});assert.equal(g.tutorial,TUTORIAL.escape);assert.equal(g.mode,'day');assert.equal(g.tutorialDone,false);assert.ok(g.nearbyBox());g.update(.02,{hide:true});tick(g,1.3);assert.equal(g.player.hidden,true);assert.equal(g.chasers.length,0);assert.equal(g.tutorial,TUTORIAL.memory);assert.equal(g.tutorialDone,false);assert.equal(g.npcs[0].knows,true);g.advanceTutorial();assert.equal(g.tutorial,TUTORIAL.buyIntro);completeShopping(g);assert.equal(g.tutorialDone,true);assert.equal(g.caughtCount,1);assert.equal(g.timeLeft,RULES.daySeconds);g.player.x=1050;g.npcs[0].calm=0;g.npcs[0].x=g.player.x-60;g.npcs[0].face=1;tick(g,2);assert.ok(g.chasers.includes(0));assert.equal(g.caughtCount,1);
});
test('each unfinished lesson saves and resumes without losing QTE credit, pursuit or face memory',()=>{
 const g=practice();reachWarning(g);g.dodge();tick(g,1.6);g.update(.02,{pick:true,trace:1});let copy=new Game(g.save());copy.start();assert.equal(copy.tutorial,TUTORIAL.caught);assert.equal(copy.tutorialQte,true);assert.equal(copy.npcs[0].knows,true);assert.equal(copy.caughtCount,1);copy.advanceTutorial();copy.player.x=1240;copy.update(.02,{hide:true});tick(copy,1.3);copy=new Game(copy.save());copy.start();assert.equal(copy.tutorial,TUTORIAL.memory);assert.equal(copy.player.hidden,true);copy.advanceTutorial();completeShopping(copy);assert.equal(copy.tutorialDone,true);
});

test('daily pressure persists through saving and grows beyond the within-day cap',async()=>{
 const {dayDifficulty}=await import('../games/robberfather/difficulty.js');
 let previous=0;for(const day of [1,2,7,14,30,100]){const d=dayDifficulty(day);assert.ok(d.alert>previous);previous=d.alert;assert.ok(d.warning>0&&d.warning<=1);}
 const g=practice();g.tutorialDone=true;g.tutorial=TUTORIAL.done;const first=g.wary;g.day=14;assert.ok(g.wary>first*1.9);const restored=new Game(g.save());restored.start();assert.equal(restored.wary,g.wary);assert.equal(restored.day,14);
 assert.deepEqual(dayDifficulty(NaN),dayDifficulty(1));
});
test('Space zones narrow by day and actual success uses the narrower boundary',()=>{
 for(const type of ['civilian','wealthy','police']){let previous=1;for(const day of [1,2,7,14,30,100]){const g=new Timing({type,seed:72,day});const width=g.zone[1]-g.zone[0];assert.ok(width<previous);assert.ok(width>.035);previous=width;g.running=true;g.pos=g.zone[1]+.001;assert.equal(g.tap(),false);g.flash=0;g.pos=(g.zone[0]+g.zone[1])/2;assert.equal(g.tap(),true);}}
});
test('a later day produces an earlier detection and shorter turn warning for the same input',()=>{
 const make=day=>{const g=practice();g.day=day;g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.npcs[0].type='police';g.activeTarget=0;g.turn={phase:'wait',t:Infinity,face:1};return g;};
 const early=make(1),late=make(20);tick(early,3,{pick:true,trace:0,grab:true});tick(late,3,{pick:true,trace:0,grab:true});assert.equal(early.caughtCount,0);assert.equal(late.caughtCount,1);
 const a=make(1),b=make(20);a.update(.02,{pick:true,slip:.01});b.update(.02,{pick:true,slip:.01});assert.equal(a.turn.phase,'warn');assert.equal(b.turn.phase,'warn');assert.ok(b.turn.t<a.turn.t);
});
test('reopening a pocket preserves that day but never reuses an earlier day gauge',()=>{
 const root={hidden:true,querySelector:()=>({})},p=Object.create(Pickpocket.prototype);Object.assign(p,{root,t:key=>key,render(){}});const target={type:'civilian',id:0};p.open(target,72,{day:1});p.game.index=20;const gauge=p.gauge;p.close(true);p.open(target,72,{day:1});assert.equal(p.gauge,gauge);assert.equal(p.game.index,20);p.close(true);p.open(target,72,{day:14});assert.notEqual(p.gauge,gauge);assert.ok(p.gauge.s.zone<gauge.s.zone);assert.equal(p.game.index,0);p.close();p.open(target,72,{day:14,practice:true});assert.equal(p.gauge.s.zone,gauge.s.zone);
});
test('meal characters stay together in the horizontal centre at every supported ratio',async()=>{
 const {MEAL_LAYOUT,HOME_ZOOM,homeFocusY,viewportSize,fitZoom,cameraWindow}=await import('../games/robberfather/framing.js');const layout=MEAL_LAYOUT;
 for(const [w,h]of [[1028,883],[1280,720],[2100,900]]){const size=viewportSize(w,h),zoom=fitZoom(HOME_ZOOM,size.width,size.height),v=cameraWindow(zoom,720,homeFocusY(zoom),size.width,size.height);const xs=[925,1040].map(x=>(layout.center+(x-layout.sourceCenter)*layout.scale-v.sx)*zoom/size.width);assert.ok(Math.abs((xs[0]+xs[1])/2-.5)<.001);assert.ok(xs[0]>.35&&xs[1]<.65);}
});
test('eating and notifications have no electronic beeps, while heartbeat remains',async()=>{
 const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape();s.context={};s.running=true;let tones=0,noises=0;s.tone=()=>tones++;s.noiseHit=()=>noises++;
 for(const type of ['eat','turnWarn','turnLook','stolen','bought','medicine','betPlaced','betWon','betLost','save','night','start'])s.play(type);assert.equal(tones,0);assert.ok(noises>0);s.play({type:'heartbeat',tension:.5});assert.equal(tones,2);
});

test('a full purse explains the block only behind an eligible nearby NPC and never permits another theft',()=>{
 const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.inventory=Array(5).fill('coin');assert.equal(g.nearest(),null);assert.equal(g.fullPocketsTarget?.id,0);tick(g,.2,{pick:true,trace:1});assert.equal(g.activeTarget,null);assert.equal(g.coins,5);
 g.npcs[0].face=-1;assert.equal(g.fullPocketsTarget,null);g.npcs[0].face=1;g.player.x=600;assert.equal(g.fullPocketsTarget,null);g.player.x=748;g.chasers=[0];assert.equal(g.fullPocketsTarget,null);g.chasers=[];const copy=new Game(g.save());copy.start();assert.equal(copy.fullPocketsTarget?.id,0);g.inventory.pop();assert.equal(g.fullPocketsTarget,null);assert.equal(g.nearest()?.id,0);
});
test('the arrest holds the capture and keeps child and officer visible through the final escort',async()=>{
 const {ARREST,arrestScene,endingDuration,endingPart}=await import('../games/robberfather/cinematics.js');const {viewportSize,fitZoom,cameraWindow,streetFocusY}=await import('../games/robberfather/framing.js');
 assert.equal(endingDuration('arrest'),14);assert.equal(endingDuration('collapse'),8);assert.equal(endingPart('arrest',6.5),2);assert.equal(endingPart('arrest',9),3);const a=arrestScene(ARREST.caught),b=arrestScene(ARREST.escort-.01);assert.equal(a.childX,b.childX);assert.equal(a.policeX,b.policeX);
 for(const [w,h]of [[1028,883],[1280,720],[2100,900]])for(const time of [3.5,6.2,7.8,8.5,11,12,14]){const s=arrestScene(time),v=viewportSize(w,h),zoom=fitZoom(s.zoom,v.width,v.height),cam=cameraWindow(zoom,s.focusX,streetFocusY(zoom),v.width,v.height);for(const x of [s.childX,...time>=6.2?[s.policeX]:[]]){const ratio=(x-cam.sx)*zoom/v.width;assert.ok(ratio>.15&&ratio<.85,`${w} at ${time}: ${ratio}`);}assert.ok(zoom>=2.3);}
 const g=practice();g.mode='ending';g.ending='arrest';g.skipEnding();assert.equal(g.endingTime,ARREST.end);
});

test('tap and hold E are mutually exclusive, buy once, and cancel when the counter changes',async()=>{
 const {UseInput}=await import('../games/robberfather/use-input.js');const key=new UseInput();key.press(0,1);assert.equal(key.release(200,1),'tap');key.press(0,1);assert.equal(key.release(400,1),null);key.press(0,1);assert.equal(key.update(649,1),null);assert.equal(key.update(650,1),'buy');assert.equal(key.update(900,1),null);assert.equal(key.release(1000,1),null);key.press(0,1);assert.equal(key.release(650,1),'buy');key.press(0,1);assert.equal(key.update(700,2),null);assert.equal(key.release(750,2),null);key.press(0,1);key.cancel();assert.equal(key.release(100,1),null);
});
test('F opens a bin, Q closes without taking food, and E later collects it once',async()=>{
 const {BINS}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.npcs=[];g.player.x=BINS[0].x;
 g.update(.02,{steal:true});assert.equal(g.rottenCount,0);assert.equal(g.inspectedBin,null);g.update(.02,{});g.update(.02,{hide:true});assert.ok(g.inspectedBin);assert.equal(g.player.hidden,false);assert.equal(g.drainEvents().filter(e=>e.type==='binOpened').length,1);
 g.update(.02,{hide:true});assert.equal(g.drainEvents().filter(e=>e.type==='binOpened').length,0);g.update(.02,{leave:true});assert.equal(g.inspectedBin,null);assert.equal(g.nearbyBin().searched,false);assert.equal(g.rottenCount,0);assert.equal(g.drainEvents().filter(e=>e.type==='binClosed').length,1);
 const copy=new Game(g.save());copy.start();copy.player.x=BINS[0].x;copy.update(.02,{hide:true});copy.update(.02,{steal:true});assert.equal(copy.rottenCount,1);assert.equal(copy.inspectedBin,null);assert.equal(copy.nearbyBin().searched,true);assert.equal(copy.takeBin(copy.nearbyBin()),false);assert.equal(copy.rottenCount,1);
});
test('bin inspection blocks movement and cover, closes with E even when full, and preserves the food',async()=>{
 const {BINS}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.npcs=[];g.player.x=BINS[0].x;g.add('fresh',5);g.update(.02,{hide:true});const x=g.player.x;g.update(.02,{right:true,run:true,hide:true});assert.equal(g.player.x,x);assert.ok(g.inspectedBin);g.update(.02,{steal:true});assert.equal(g.inspectedBin,null);assert.equal(g.nearbyBin().searched,false);assert.equal(g.food,5);assert.ok(g.drainEvents().some(e=>e.type==='foodFull'));
});
test('nightfall closes an inspected bin and an open lid never survives a save reload',async()=>{
 const {BINS}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.npcs=[];g.player.x=BINS[0].x;g.inspectBin();const copy=new Game(g.save());copy.start();assert.equal(copy.inspectedBin,null);g.timeLeft=.01;g.update(.02);assert.equal(g.inspectedBin,null);assert.ok(g.drainEvents().some(e=>e.type==='binClosed'));
});
test('the ambience follows zoom continuously and quiet nights never play street chatter',async()=>{
 const {ambienceMix}=await import('../games/robberfather/audio-samples.js');let priorStreet=1,priorHeart=-1;for(const f of [0,.1,.3,.5,.8,1]){const m=ambienceMix({mode:'day'},f);assert.ok(m.street<=priorStreet);assert.ok(m.heartbeat>=priorHeart);assert.ok(m.night<=.002);priorStreet=m.street;priorHeart=m.heartbeat;}const night=ambienceMix({mode:'night'},1);assert.ok(night.night>0&&night.night<.04);assert.equal(night.street,0);assert.equal(night.heartbeat,0);
});
test('lid playback separates the opening and closing around their recorded quiet gap',async()=>{
 const {binLidRanges}=await import('../games/robberfather/audio-samples.js');const data=new Float32Array(5000);for(let i=200;i<1000;i++)data[i]=.5;for(let i=3500;i<4300;i++)data[i]=.5;const r=binLidRanges({duration:5,sampleRate:1000,getChannelData:()=>data});assert.ok(r.open[1]>=1&&r.open[1]<1.1);assert.ok(r.close[0]>3.4&&r.close[0]<3.6);assert.ok(r.open[1]<r.close[0]);assert.equal(r.close[0]+r.close[1],5);
});

test('new cover ignores already-held movement and F, including through the safety delay',async()=>{
 const {BOXES}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.player.x=BOXES[0].x;g.update(.02,{right:true,hide:true});assert.equal(g.player.hidden,true);assert.equal(g.toggleHide(),false);tick(g,1,{right:true,hide:true});assert.equal(g.player.hidden,true);g.update(.02,{});g.update(.02,{right:true});assert.equal(g.player.hidden,false);
});
test('the tutorial requires an actual paid food purchase and preserves its intermediate lesson',()=>{
 const g=practice();g.tutorial=TUTORIAL.memory;g.add('coin',1);g.advanceTutorial();assert.equal(g.tutorial,TUTORIAL.buyIntro);assert.equal(g.tutorialDone,false);g.advanceTutorial();g.player.x=1006;g.useDoor();g.player.x=g.shop.x0+1110;g.update(.02);assert.equal(g.tutorial,TUTORIAL.purchase);const copy=new Game(g.save());copy.start();assert.equal(copy.tutorial,TUTORIAL.purchase);assert.equal(copy.buy(),true);assert.equal(copy.coins,0);assert.equal(copy.food,1);assert.equal(copy.tutorial,TUTORIAL.meal);assert.equal(copy.tutorialDone,false);assert.equal(copy.timeLeft,RULES.daySeconds);copy.advanceTutorial();assert.equal(copy.tutorialDone,true);
});
test('prologue clicks advance all four captions, while Skip exits immediately',()=>{
 const g=new Game();g.start({prologue:true});g.advancePrologue();assert.equal(g.mode,'prologue');assert.equal(g.prologueIndex,1);g.advancePrologue();assert.equal(g.prologueIndex,2);g.advancePrologue();assert.equal(g.prologueIndex,3);assert.equal(g.mode,'prologue');g.advancePrologue();assert.equal(g.mode,'morning');const skip=new Game();skip.start({prologue:true});skip.skipPrologue();assert.equal(skip.mode,'morning');
});
test('street bins and loaded carts leave actual doorway openings clear',async()=>{
 const {SHOPS,BINS,BOXES}=await import('../games/robberfather/engine.js');for(const object of [...BINS,...BOXES.filter(b=>!b.inside)]){const half=BINS.includes(object)?26.5:RULES.coverWidth/2;for(const shop of SHOPS)assert.ok(Math.abs(object.x-shop.door)>=half+53+18,`blocked doorway: ${object.id} at ${shop.door}`);}
});
test('collapse framing centres the father and child in tall and wide windows',async()=>{
 const {COLLAPSE_LAYOUT,HOME_ZOOM,homeFocusY,viewportSize,fitZoom,cameraWindow}=await import('../games/robberfather/framing.js');const l=COLLAPSE_LAYOUT;for(const [w,h]of [[1028,883],[1280,720],[1920,1080]]){const size=viewportSize(w,h),z=fitZoom(HOME_ZOOM,size.width,size.height),cam=cameraWindow(z,720,homeFocusY(z),size.width,size.height),positions=[967,1054].map(x=>(l.center+(x-l.sourceCenter)*l.scale-cam.sx)*z/size.width);assert.ok(Math.abs((positions[0]+positions[1])/2-.5)<.001);}
});
function survivalDay(){const g=new Game();g.start();g.mode='day';g.tutorialDone=true;g.tutorial=TUTORIAL.done;return g;}
function afterHungryNight(){const g=survivalDay();g.goHome();g.beginNight();assert.equal(g.nextDay(),true);for(let i=0;i<3;i++)g.advanceMorning();g.drainEvents();return g;}

test('a hungry night requires five portions the next day, while sickness alone still requires three',()=>{
 const g=afterHungryNight();assert.equal(g.hungerStreak,1);assert.equal(g.mealRequired,5);assert.equal(g.theftMultiplier,1.5);g.add('fresh',3);assert.equal(g.quotaMet,false);g.add('fresh',2);assert.equal(g.quotaMet,true);
 const sick=survivalDay();sick.rottenStreak=1;assert.equal(sick.mealRequired,3);assert.equal(sick.theftMultiplier,1);
});

test('three portions cannot clear hunger on recovery day and lead to the consecutive-hunger ending',()=>{
 const g=afterHungryNight();g.add('fresh',3);g.goHome();g.beginNight();assert.equal(g.eaten,3);assert.equal(g.fed,false);assert.equal(g.hungerStreak,2);assert.equal(g.food,0);assert.equal(g.mealRequired,5);assert.equal(g.nextDay(),false);assert.equal(g.ending,'arrest');
});

test('a full recovery consumes five actual portions, preserves coins, and restores the next normal day',()=>{
 const g=afterHungryNight();g.add('fresh',5);g.add('coin',2);g.goHome();g.beginNight();assert.equal(g.eaten,5);assert.equal(g.fed,true);assert.equal(g.food,0);assert.equal(g.coins,2);assert.equal(g.hungerStreak,0);assert.equal(g.mealRequired,5);assert.equal(g.theftMultiplier,1.5);
 g.nextDay();assert.equal(g.mealRequired,3);assert.equal(g.theftMultiplier,1);assert.equal(g.coins,2);
 const normal=survivalDay();normal.add('fresh',5);normal.goHome();normal.beginNight();assert.equal(normal.eaten,3);assert.equal(normal.food,2);
});

test('recovery quota and five eaten portions survive saves during day, dinner and morning',()=>{
 let g=afterHungryNight();g.add('fresh',5);g=new Game(g.save());g.start();assert.equal(g.mealRequired,5);assert.equal(g.theftMultiplier,1.5);g.goHome();g.beginNight();g=new Game(g.save());g.start();assert.equal(g.eaten,5);assert.equal(g.mealRequired,5);assert.equal(g.fed,true);assert.equal(g.hungerStreak,0);g.nextDay();g=new Game(g.save());g.start();assert.equal(g.mealRequired,3);assert.equal(g.theftMultiplier,1);
});

test('old hungry daytime saves acquire recovery rules but completed old dinners remain intact',()=>{
 const old=afterHungryNight().save();delete old.recoveryDay;const g=new Game(old);g.start();assert.equal(g.mealRequired,5);assert.equal(g.theftMultiplier,1.5);
 old.mode='night';old.hungerStreak=0;old.fed=true;old.eaten=3;const night=new Game(old);night.start();assert.equal(night.mealRequired,3);assert.equal(night.eaten,3);assert.equal(night.fed,true);
});

test('food goals fire at five on recovery day for shopping and scavenging, never at three',async()=>{
 const {SHOPS}=await import('../games/robberfather/engine.js');const g=afterHungryNight();g.player.x=SHOPS[1].x0+1110;g.add('fresh',2);g.add('coin',3);
 for(let i=0;i<3;i++){g.buy();const goals=g.drainEvents().filter(e=>e.type==='goal');assert.equal(goals.length,i===2?1:0);}
 const bin=afterHungryNight();bin.add('fresh',2);for(let i=0;i<3;i++){bin.takeBin(bin.bins[i]);assert.equal(bin.drainEvents().filter(e=>e.type==='goal').length,i===2?1:0);}
});

test('medicine treats illness without cancelling recovery requirements; rotten recovery food still causes illness',async()=>{
 const {SHOPS}=await import('../games/robberfather/engine.js');const g=afterHungryNight();g.rottenStreak=1;g.player.x=SHOPS.find(s=>s.kind===4).x0+1110;g.add('coin',4);assert.equal(g.buy(),true);assert.equal(g.rottenStreak,0);assert.equal(g.mealRequired,5);assert.equal(g.theftMultiplier,1.5);
 g.add('fresh',4);g.add('rotten',1);g.goHome();g.beginNight();assert.equal(g.fed,true);assert.equal(g.hungerStreak,0);assert.equal(g.rottenStreak,1);assert.equal(g.eaten,5);
});

test('hunger multiplies actual suspicion by 1.5 and narrows the same-day Space target by 1.5',()=>{
 const hungry=afterHungryNight(),normal=survivalDay();normal.day=hungry.day;assert.ok(Math.abs(hungry.wary-normal.wary*1.5)<1e-10);assert.ok(Math.abs(hungry.difficulty.warning*1.5-normal.difficulty.warning)<1e-10);
 for(const g of [hungry,normal]){g.player.x=748;g.npcs=[{...g.npcs[0],x:790,face:1,pause:999,type:'police'}];g.activeTarget=0;g.turn={phase:'wait',t:Infinity,face:1};g.update(.02,{pick:true,trace:0,grab:true});}
 assert.ok(Math.abs(hungry.suspicion-normal.suspicion*1.5)<1e-10);
 for(const day of [2,14,100])for(const type of ['civilian','wealthy','police']){const a=new Timing({type,seed:72,day}),b=new Timing({type,seed:72,day,multiplier:1.5});assert.ok(Math.abs(b.s.zone*1.5-a.s.zone)<1e-10);b.running=true;b.pos=b.zone[1]+.001;assert.equal(b.tap(),false);}
});

test('the real pocket uses recovery pressure, preserves it on reopen, and leaves practice forgiving',()=>{
 const root={hidden:true,querySelector:()=>({})},p=Object.create(Pickpocket.prototype);Object.assign(p,{root,t:key=>key,render(){}});const target={type:'civilian',id:0};p.open(target,72,{day:2});const normal=p.gauge.s.zone;p.close();p.open(target,72,{day:2,multiplier:1.5});assert.ok(Math.abs(p.gauge.s.zone*1.5-normal)<1e-10);p.game.index=20;const gauge=p.gauge;p.close(true);p.open(target,72,{day:2,multiplier:1.5});assert.equal(p.gauge,gauge);assert.equal(p.game.index,20);p.close(true);p.open(target,72,{day:2,multiplier:1.5,practice:true});assert.ok(p.gauge.s.zone>normal);
});

test('nightfall uses the recovery quota and partial rotten food increments hunger and sickness together',()=>{
 for(const count of [3,4,5]){const g=afterHungryNight();g.add('fresh',count-1);g.add('rotten',1);g.timeLeft=.01;g.update(.02);assert.equal(g.mode,'return');assert.equal(g.returnReason,'timeout');g.beginNight();assert.equal(g.eaten,count);assert.equal(g.fed,count===5);assert.equal(g.hungerStreak,count===5?0:2);assert.equal(g.rottenStreak,1);}
});

test('the chase lesson points at the real cart until F hides the player, including after reload',()=>{
 const g=practice();reachWarning(g);g.dodge();tick(g,1.6);g.update(.02,{pick:true,trace:1});const cart=g.tutorialCover;assert.equal(cart?.id,1);assert.equal(g.player.hidden,false);g.advanceTutorial();assert.equal(g.tutorialCover,cart);const copy=new Game(g.save());copy.start();assert.equal(copy.tutorialCover?.id,cart.id);copy.player.x=cart.x;copy.update(.02,{hide:true});assert.equal(copy.player.hidden,true);assert.equal(copy.tutorialCover,null);tick(copy,1.3);assert.equal(copy.tutorial,TUTORIAL.memory);assert.equal(copy.tutorialCover,null);
});

test('normal gameplay and other lessons never mark the tutorial cart',()=>{
 const g=practice();assert.equal(g.tutorialCover,null);g.tutorial=TUTORIAL.done;assert.equal(g.tutorialCover,null);g.tutorial=TUTORIAL.escape;g.mode='night';assert.equal(g.tutorialCover,null);
});

test('the shop guide points at an actual available market doorway and switches to its real counter',async()=>{
 const {SHOPS,COUNTER}=await import('../games/robberfather/engine.js');const g=survivalDay();g.tutorialDone=false;g.tutorial=TUTORIAL.shop;g.player.x=SHOPS[1].door+100;assert.equal(g.tutorialWaypoint.kind,'door');assert.equal(g.tutorialWaypoint.x,SHOPS[1].door);assert.equal(g.tutorialWaypoint.ready,false);g.player.x=SHOPS[1].door;assert.equal(g.tutorialWaypoint.ready,true);g.useDoor();assert.equal(g.tutorialWaypoint.kind,'counter');assert.equal(g.tutorialWaypoint.x,SHOPS[1].x0+COUNTER);assert.equal(g.tutorialWaypoint.ready,false);g.player.x=SHOPS[1].x0+COUNTER;g.add('coin',1);g.update(.02);assert.equal(g.tutorial,TUTORIAL.purchase);assert.equal(g.tutorialWaypoint.ready,true);const restored=new Game(g.save());restored.start();assert.deepEqual(restored.tutorialWaypoint,g.tutorialWaypoint);g.buy();assert.equal(g.tutorial,TUTORIAL.meal);assert.equal(g.tutorialWaypoint,null);
});

test('door guidance skips barred shops and remains absent outside shopping lessons',async()=>{
 const {SHOPS}=await import('../games/robberfather/engine.js');const g=survivalDay();assert.equal(g.tutorialWaypoint,null);g.tutorial=TUTORIAL.shop;g.closedShops=[SHOPS[1].id];g.player.x=SHOPS[1].door;assert.equal(g.tutorialWaypoint.shopId,SHOPS.find(s=>s.kind===1&&s.id!==SHOPS[1].id).id);g.mode='night';assert.equal(g.tutorialWaypoint,null);
});

test('civilian, wealthy and police reward 1, 2 and 1 actual coins while respecting purse capacity',async()=>{
 const {TYPES}=await import('../games/robberfather/engine.js');for(const [type,amount,level]of [['civilian',1,'easy'],['wealthy',2,'normal'],['police',1,'hard']]){assert.equal(TYPES[type].difficulty,level);const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.npcs[0].type=type;g.update(.02,{pick:true,trace:1});assert.equal(g.coins,amount);assert.equal(g.drainEvents().find(e=>e.type==='stolen').amount,amount);assert.equal(g.earned,amount);}
 const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.add('coin',4);g.npcs[0].type='wealthy';g.update(.02,{pick:true,trace:1});assert.equal(g.coins,5);assert.equal(g.drainEvents().find(e=>e.type==='stolen').amount,1);
});

test('the pocket title shows the same nominal reward and difficulty as the street for every NPC type',async()=>{
 const {TYPES}=await import('../games/robberfather/engine.js');for(const type of ['civilian','wealthy','police']){const title={},hint={},root={hidden:true,querySelector:s=>s==='[data-pick-title]'?title:hint},p=Object.create(Pickpocket.prototype);Object.assign(p,{root,t:(key,vars)=>key==='pickTitle'?JSON.stringify(vars):key,render(){}});p.open({type,id:0},72,{day:1});const vars=JSON.parse(title.textContent);assert.equal(vars.coins,TYPES[type].slots);assert.equal(vars.difficulty,'difficulty_'+TYPES[type].difficulty);}
});

test('an emptied bin remains inspectable without blocking pickpocket targets beside it',async()=>{const {BINS}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.player.x=BINS[0].x;g.bins[0].searched=true;g.npcs[0].x=g.player.x+42;g.npcs[0].face=1;g.update(.02);assert.ok(g.nearbyBin());assert.equal(g.target?.id,g.npcs[0].id);});

test('pocket foley only follows actual wallet movement and dinner clinks only accompany eating',async()=>{const {SoundDirector}=await import('../games/robberfather/audio.js');const d=new SoundDirector(),g=new Game();g.mode='day';g.activeTarget=0;g.progress=0;assert.equal(d.update(g,.05).some(e=>e.type==='rustle'),false);g.progress=.2;assert.ok(d.update(g,.05).some(e=>e.type==='rustle'));assert.equal(d.update(g,1).some(e=>e.type==='rustle'),false);g.mode='night';g.fed=false;g.ateRotten=false;assert.equal(d.update(g,2).some(e=>e.type==='eat'),false);g.fed=true;assert.ok(d.update(g,2).some(e=>e.type==='eat'));});
test('night ambience is audible while chase music only plays during a real pursuit',async()=>{const {ambienceMix}=await import('../games/robberfather/audio-samples.js');assert.ok(ambienceMix({mode:'day',chasers:[]},0).street<.02);assert.ok(ambienceMix({mode:'night'},0).night>.004&&ambienceMix({mode:'night'},0).night<.04);assert.equal(ambienceMix({mode:'day',chasers:[]},0).chase,0);assert.ok(ambienceMix({mode:'day',chasers:[0]},0).chase>0);assert.equal(ambienceMix({mode:'night',chasers:[0]},0).chase,0);});
test('QTE, moving pockets and dinner dispatch their selected recordings',async()=>{const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape(),played=[];s.context={};s.enabled=true;s.running=true;s.samples={has:()=>true,effect:key=>{played.push(key);return{disconnect(){},stop(){}}}};for(const type of ['qteSuccess','rustle','eat'])s.play(type);assert.deepEqual(played,['qte','pocket','cutlery']);});

test('the bin hint is only introduced once, survives another day and save, and resets with a new story',async()=>{const {BINS}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.player.x=BINS[0].x;assert.equal(g.binIntroduced,false);assert.equal(g.inspectBin(),true);assert.equal(g.binIntroduced,true);g.finishBin(false);const copy=new Game(g.save());copy.start();assert.equal(copy.binIntroduced,true);copy.resetDay();assert.equal(copy.binIntroduced,true);assert.equal(new Game().binIntroduced,false);assert.equal(new Game({...g.save(),binIntroduced:undefined,searchedBins:[1]}).binIntroduced,true);});
test('real purchases, medicines, doors, pocket entry and steps dispatch distinct recordings',async()=>{const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape(),played=[];s.context={};s.running=true;s.samples={effect:key=>{played.push(key);return{disconnect(){},stop(){}}},step:(surface,run)=>{played.push(surface+(run?'-run':'-walk'));return{disconnect(){},stop(){}}}};for(const type of ['bought','medicine','enterShop','exitShop','pocketOpened'])s.play(type);s.play({type:'step',surface:'concrete',running:false});s.play({type:'step',surface:'wood',running:true});assert.deepEqual(played,['buy','buy','door','door','pocketOpen','concrete-walk','wood-run']);});
test('invalid interactions play one short denial per press burst and respect mute',async()=>{const {Soundscape}=await import('../games/robberfather/audio.js');for(const type of ['noMoney','foodFull','notSick','shopBarred','doorBlocked','blocked','frontOnly']){const s=new Soundscape();s.context={currentTime:1};s.running=true;let tones=0;s.tone=()=>tones++;s.play(type);s.play(type);assert.equal(tones,1);s.context.currentTime=2;s.play(type);assert.equal(tones,2);s.enabled=false;s.play(type);assert.equal(tones,2);}});
test('footfalls follow actual travel, stop at rest and select the current floor',async()=>{const {SoundDirector}=await import('../games/robberfather/audio.js');const {SHOPS}=await import('../games/robberfather/engine.js');const g=new Game();g.mode='day';const d=new SoundDirector();d.update(g,.05);let e=[];for(let i=0;i<2;i++){g.player.x+=22;e.push(...d.update(g,.2));}assert.equal(e.filter(x=>x.type==='step').length,1);assert.equal(e.find(x=>x.type==='step').surface,'concrete');assert.equal(d.update(g,1).filter(x=>x.type==='step').length,0);g.player.x=SHOPS[1].x0+200;d.update(g,.05);e=[];for(let i=0;i<3;i++){g.player.x+=20;e.push(...d.update(g,.05));}assert.ok(e.some(x=>x.type==='step'&&x.surface==='wood'&&x.running));});

test('a shop rejects missing coins and a full meal bag without spending, but a full purse may buy normally',async()=>{const {SHOPS}=await import('../games/robberfather/engine.js');const g=practice();g.tutorial=TUTORIAL.done;g.tutorialDone=true;g.player.x=SHOPS[1].x0+1110;g.inventory=[];assert.equal(g.buy(),false);assert.ok(g.drainEvents().some(e=>e.type==='noMoney'));assert.deepEqual(g.inventory,[]);g.add('coin',5);g.add('fresh',5);assert.equal(g.buy(),false);assert.ok(g.drainEvents().some(e=>e.type==='foodFull'));assert.equal(g.coins,5);assert.equal(g.food,5);g.inventory=g.inventory.filter(x=>x==='coin');assert.equal(g.buy(),true);assert.equal(g.coins,4);assert.equal(g.food,1);assert.ok(g.drainEvents().some(e=>e.type==='bought'));});
test('turn warning blocks both movement directions and door or cover actions through E withdrawal',()=>{
 const g=practice();g.update(.02,{pick:true,trace:1});g.update(.02,{pick:true,trace:1,qteHit:true});g.update(.02,{pick:true,trace:1});assert.equal(g.tutorial,TUTORIAL.dodge);const x=g.player.x,stamina=g.player.stamina;
 for(const input of [{left:true,run:true},{right:true,run:true},{enter:true},{hide:true}]){tick(g,.4,{...input,pick:true,trace:1});g.update(.02,{pick:true,trace:1});assert.equal(g.player.x,x);assert.equal(g.player.hidden,false);assert.equal(g.shop,null);assert.equal(g.tutorial,TUTORIAL.dodge);}
 assert.ok(g.player.stamina>=stamina);g.dodge();assert.equal(g.tutorial,TUTORIAL.resume);g.player.x=690;tick(g,.3,{left:true});assert.equal(g.player.x,690);
});
test('three sound categories migrate old preferences and persist independently',async()=>{
 const {Settings,SETTINGS_KEY}=await import('../games/robberfather/settings.js');const old=new Settings({volume:.4});assert.deepEqual(old.volumes,{background:.4,effects:.4,voice:.4});const s=new Settings({volumes:{background:.2,effects:.7,voice:0}});let stored;const prior=globalThis.localStorage;try{globalThis.localStorage={setItem(k,v){assert.equal(k,SETTINGS_KEY);stored=JSON.parse(v);}};s.save();assert.deepEqual(new Settings(stored).volumes,s.volumes);}finally{globalThis.localStorage=prior;}s.reset();assert.deepEqual(s.volumes,{background:1,effects:1,voice:1});
});
test('background, effects and voice gains change independently without unmuting the master',async()=>{
 const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape(),gain=()=>({gain:{value:1,setTargetAtTime(v){this.value=v;}}});s.context={currentTime:0};s.master=gain();for(const key of ['background','effects','voice'])s[key+'Bus']=gain();s.running=true;s.setVolumes({background:.2,effects:.7,voice:.4});assert.equal(s.backgroundBus.gain.value,.2);assert.equal(s.effectsBus.gain.value,.7);assert.equal(s.voiceBus.gain.value,.4);s.quiet();s.setVolumes({background:.9,effects:0,voice:0});assert.equal(s.master.gain.value,0);assert.equal(s.backgroundBus.gain.value,.9);assert.equal(s.effectsBus.gain.value,0);s.noiseHit=()=>assert.fail('muted dialogue must not synthesize a shout');s.shout();
});
test('door playback excludes the closing gesture and a purchase plays only the first short clink',async()=>{
 const {SampleMixer,firstSoundCue,binLidRanges}=await import('../games/robberfather/audio-samples.js');const data=new Float32Array(4000);data.fill(.4,100,500);data.fill(.6,3100,3600);const buffer={sampleRate:1000,duration:4,getChannelData:()=>data},started=[];let source;const gain={gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){return this;},disconnect(){}};const m=Object.create(SampleMixer.prototype);Object.assign(m,{buffers:{buy:buffer,door:buffer},master:{},c:{currentTime:0,createGain:()=>gain,createBufferSource:()=>source={connect(){return gain;},start(...args){started.push(args);}}}});m.effect('buy');assert.equal(source.loop,false);assert.ok(started[0][1]<.2);assert.ok(started[0][2]<=.300001);m.effect('door');const range=binLidRanges(buffer).open;assert.deepEqual(started[1].slice(1),range);assert.ok(range[1]<3);assert.ok(firstSoundCue(buffer)[1]<=.300001);
});
test('leaving any pocket lesson keeps movement locked and the same victim pinned across reloads',()=>{
 for(const stage of [TUTORIAL.pull,TUTORIAL.qte,TUTORIAL.dodge,TUTORIAL.resume]){const g=practice();g.update(.02,{pick:true,trace:.01});assert.equal(g.tutorialVictim,0);g.tutorial=stage;if(stage===TUTORIAL.dodge){g.turn.phase='warn';g.turn.t=Infinity;}g.dodge();const x=g.player.x;tick(g,2,{left:true,run:true,enter:true,hide:true});tick(g,2,{right:true});assert.equal(g.player.x,x);assert.equal(g.player.hidden,false);assert.equal(g.tutorialPocketLocked,true);g.npcs.push({...g.npcs[0],id:50,x:x+1});assert.equal(g.nearest()?.id,0);const loaded=new Game(g.save());loaded.start();tick(loaded,1,{right:true,run:true});assert.equal(loaded.player.x,x);assert.equal(loaded.nearest()?.id,0);}
 const g=practice();reachWarning(g);g.dodge();tick(g,1.6);g.update(.02,{pick:true,trace:1});assert.equal(g.tutorial,TUTORIAL.caught);g.advanceTutorial();assert.equal(g.tutorial,TUTORIAL.escape);const x=g.player.x;tick(g,.1,{right:true});assert.ok(g.player.x>x);
});
test('dialogue types progressively, pauses without updates and reveals fully on demand',async()=>{
 const {DialogueTyper}=await import('../games/robberfather/dialogue.js');const d=new DialogueTyper();d.start('아빠, 조심해요.');assert.equal(d.visible,'');assert.equal(d.done,false);let sounds=0;for(let i=0;i<8;i++)sounds+=Number(d.update(.02));assert.ok(d.visible.length>0&&d.visible.length<d.letters.length);assert.ok(sounds>0&&sounds<8);const prefix=d.visible;assert.equal(d.visible,prefix);d.finish();assert.equal(d.visible,'아빠, 조심해요.');assert.equal(d.update(1),false);d.start('Dad, wait.');assert.equal(d.index,0);assert.equal(d.visible+d.remaining,'Dad, wait.');
});
test('new son dialogue stays bilingual and delivers complete groups of three for each condition',async()=>{
 const {MORNING_LINES,getMorningLines}=await import('../games/robberfather/story.js');for(const pool of Object.values(MORNING_LINES)){assert.equal(pool.length%3,0);assert.ok(pool.every(line=>line.en&&line.ko&&line.ko.length<65));}for(const meal of ['fresh','hungry','rotten','both'])for(let day=1;day<50;day++)assert.equal(getMorningLines(day,meal).length,3);
});
test('discard uses muffled cloth and a soft impact, while typing sounds route to dialogue volume',async()=>{
 const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape(),samples=[],noise=[],tones=[];s.context={currentTime:1};s.enabled=true;s.running=true;s.samples={effect(key){samples.push(key);return{disconnect(){}};}};s.noiseHit=(...a)=>noise.push(a);s.tone=(...a)=>tones.push(a);s.play('discarded');assert.deepEqual(samples,['discard']);assert.equal(tones.length,0);assert.ok(noise.every(a=>a[2]<200));noise.length=0;s.play('dialogueTick');assert.equal(tones[0].at(-1),'voice');assert.equal(noise[0].at(-1),'voice');s.play('dialogueTick');assert.equal(tones.length,1);s.volumes.voice=0;s.context.currentTime=2;s.play('dialogueTick');assert.equal(tones.length,1);
});
test('a missed Space tap or unpressed zone rolls the wallet back once and releases it for regrabbing',()=>{
 const make=()=>{const p=Object.create(Pickpocket.prototype);Object.assign(p,{active:true,type:'civilian',shake:0,render(){},game:new Trace({type:'civilian',hold:3,seed:72,start:{x:206,y:252},W:640,H:400}),gauge:new Timing({type:'civilian',seed:72})});p.game.index=Math.floor((p.game.path.length-1)*.75);p.game.carry=.9;p.game.grabbing=true;p.game.pointer=p.game.path[p.game.index];p.gauge.running=true;return p;};
 for(const method of ['tap','missedZone']){const p=make(),before=p.game.index;if(method==='tap'){p.gauge.pos=0;assert.equal(p.tap(),false);}else{p.gauge.inside=true;p.gauge.pos=p.gauge.zone[1]+.01;}assert.ok(p.update(.01)>0);assert.equal(p.game.index,before-Math.round((p.game.path.length-1)*.22));assert.equal(p.game.grabbing,false);assert.equal(p.game.carry,0);const after=p.game.index;p.update(.01);assert.equal(p.game.index,after);p.game.down(p.game.path[after]);assert.equal(p.game.grabbing,true);}
 const p=make(),before=p.game.index;p.gauge.pos=(p.gauge.zone[0]+p.gauge.zone[1])/2;assert.equal(p.tap(),true);p.update(.001);assert.equal(p.game.index,before);
});
test('Space practice also rolls back on a miss, clamps at the pocket and cannot double-charge simultaneous errors',()=>{
 const p=Object.create(Pickpocket.prototype);Object.assign(p,{active:true,type:'civilian',shake:0,render(){},game:new Trace({type:'civilian',hold:3,seed:72,start:{x:206,y:252},W:640,H:400}),gauge:new Timing({type:'civilian',seed:72})});p.game.index=5;p.gauge.running=true;p.gauge.pos=0;p.tap();assert.ok(p.update(.01,false,true)>0);assert.equal(p.game.index,0);
 p.game.index=70;p.game.grabbing=true;p.game.pointer={x:0,y:0};p.gauge.flash=0;p.gauge.running=true;p.gauge.pos=0;p.tap();p.update(.01);assert.equal(p.game.index,Math.max(0,70-Math.round((p.game.path.length-1)*.22)));
});
test('finishing the lesson separates familiar faces from the shop exit without erasing memory or the spotted count',async()=>{
 const {SHOPS,COUNTER}=await import('../games/robberfather/engine.js');const g=practice(),shop=SHOPS[1];g.tutorial=TUTORIAL.meal;g.player.x=shop.x0+COUNTER;g.attempts=['success','caught'];g.inventory=['fresh'];g.npcs[0].x=shop.door+10;g.npcs[0].knows=true;g.npcs[0].witness=.95;const unfamiliar=g.npcs.find(n=>!n.knows&&n.id!==0),unfamiliarX=unfamiliar?.x;g.finishTutorial();assert.equal(g.caughtCount,1);assert.equal(g.npcs[0].knows,true);assert.ok(Math.abs(g.npcs[0].x-shop.door)>=650);if(unfamiliar)assert.equal(unfamiliar.x,unfamiliarX);g.player.x=shop.door;tick(g,5);assert.equal(g.chasers.length,0);const copy=new Game(g.save());copy.start();assert.equal(copy.npcs[0].knows,true);assert.ok(Math.abs(copy.npcs[0].x-copy.player.x)>280);copy.player.x=copy.npcs[0].x-40;copy.npcs[0].face=-1;tick(copy,7);assert.ok(copy.chasers.includes(0));
});
test('UI layout imports allow only known elements and safe bounded visual properties',async()=>{
 const {cleanLayout}=await import('../games/robberfather/ui-editor/model.js');assert.throws(()=>cleanLayout({version:2,items:{}}));assert.throws(()=>cleanLayout({version:1,items:[]}));const layout=cleanLayout({version:1,items:{resources:{x:999,y:-200,width:80,fontSize:999,opacity:0,color:'#AaBBcc',background:'url(https://bad)',font:'evil;display:none',onclick:'bad'},game:{opacity:0},clock:{height:NaN}}});assert.deepEqual(layout.items.resources,{x:100,y:-100,width:80,fontSize:72,opacity:.1,color:'#aabbcc'});assert.equal(layout.items.game,undefined);assert.equal(layout.items.clock,undefined);
});
test('UI layout offsets and dimensions scale with the viewport without replacing existing transforms',async()=>{
 const {cleanLayout,layoutCSS}=await import('../games/robberfather/ui-editor/model.js');const layout=cleanLayout({version:1,items:{clock:{x:10,y:-5,width:20,color:'#ffffff',background:'#223344',backgroundAlpha:.5,font:'mono'}}});const a=layoutCSS(layout,1280,720),b=layoutCSS(layout,640,360);assert.match(a,/translate:128px -36px/);assert.match(b,/translate:64px -18px/);assert.match(a,/width:256px/);assert.match(b,/width:128px/);assert.match(a,/#22334480/);assert.doesNotMatch(a,/transform:/);assert.equal(layoutCSS({version:1,items:{}},1280,720),'');assert.deepEqual(cleanLayout(JSON.parse(JSON.stringify(layout))),layout);
});
test('UI text presets keep bilingual edits and placeholders while rejecting unknown keys and oversized values',async()=>{
 const {cleanLayout}=await import('../games/robberfather/ui-editor/model.js');const raw={version:1,items:{},texts:{ko:{coinTitle:'소지금',mealTarget:'오늘 식사 {required}칸',unknown:'bad',home:42},en:{coinTitle:'Pocket coins',introOneLine:'x'.repeat(2500)},xx:{coinTitle:'bad'}}};const clean=cleanLayout(raw);assert.deepEqual(clean.texts.ko,{coinTitle:'소지금',mealTarget:'오늘 식사 {required}칸'});assert.equal(clean.texts.en.introOneLine.length,2000);assert.equal(clean.texts.xx,undefined);assert.deepEqual(cleanLayout(JSON.parse(JSON.stringify(clean))),clean);assert.deepEqual(cleanLayout({version:1,items:{},texts:{ko:{unknown:'x'}}}),{version:1,items:{}});
});
test('edited UI text uses live game values and preserves original translations and the other language',async()=>{
 const {setUIText}=await import('../games/robberfather/ui-editor/text-overrides.js');const {getLocale,setLocale,t,MESSAGES}=await import('../games/robberfather/i18n.js');const before=getLocale(),original=MESSAGES.ko.coinTitle;try{setUIText({ko:{coinTitle:'소지금',mealTarget:'오늘 식사 {required}칸'}});setLocale('ko');assert.equal(t('coinTitle'),'소지금');assert.equal(t('mealTarget',{required:5}),'오늘 식사 5칸');assert.equal(MESSAGES.ko.coinTitle,original);setLocale('en');assert.equal(t('coinTitle'),MESSAGES.en.coinTitle);setUIText();setLocale('ko');assert.equal(t('coinTitle'),original);}finally{setUIText();setLocale(before);}
});
test('added labels and arrows validate ids, scope, bilingual text and independent styling',async()=>{
 const {cleanLayout,newAddition,layoutTargets,layoutCSS}=await import('../games/robberfather/ui-editor/model.js');const text=newAddition('text','street'),arrow=newAddition('arrow','dialogue',[text]);assert.equal(text.id,'added-1');assert.equal(arrow.id,'added-2');assert.equal(arrow.texts.en,'↓');text.texts.ko='이쪽으로 →';const result=cleanLayout({version:1,items:{'added-1':{x:12,y:-5,fontSize:30},'added-3':{x:22}},additions:[text,arrow,{...text},{id:'bad"]{}',kind:'text'},{id:'added-3',kind:'script'}]});assert.equal(result.additions.length,2);assert.equal(result.items['added-3'],undefined);assert.ok(layoutTargets(result).some(t=>t[1]==='#uie-added-1'));assert.match(layoutCSS(result,1000,600),/#stage #uie-added-1\{translate:120px -30px/);assert.deepEqual(cleanLayout(JSON.parse(JSON.stringify(result))),result);
});
test('extra UI elements have a bounded import size and retain harmless literal text',async()=>{
 const {cleanLayout}=await import('../games/robberfather/ui-editor/model.js');const additions=Array.from({length:80},(_,i)=>({id:'added-'+(i+1),kind:'text',scene:'bad',texts:{ko:'<b>→</b>',en:'x'.repeat(3000)}}));const out=cleanLayout({version:1,items:{},additions});assert.equal(out.additions.length,50);assert.equal(out.additions[0].scene,'street');assert.equal(out.additions[0].texts.ko,'<b>→</b>');assert.equal(out.additions[0].texts.en.length,2000);assert.equal(cleanLayout({version:1,items:{}}).additions,undefined);
});
test('buy max purchases all affordable food that fits, with only one purchase event and correct change',async()=>{
 const {SHOPS,COUNTER}=await import('../games/robberfather/engine.js');for(const [kind,coins,bag,expectedFood,change,quantity]of [[1,5,[],5,0,5],[0,5,[],4,1,2],[1,4,['rotten','fresh','fresh'],5,2,2],[0,5,['rotten'],5,1,2]]){const g=survivalDay(),shop=SHOPS.find(s=>s.kind===kind);g.player.x=shop.x0+COUNTER;g.inventory=[...bag,...Array(coins).fill('coin')];g.drainEvents();assert.equal(g.buyMax(),true);assert.equal(g.food,expectedFood);assert.equal(g.coins,change);const events=g.drainEvents(),bought=events.filter(e=>e.type==='bought');assert.equal(bought.length,1);assert.equal(bought[0].quantity,quantity);assert.ok(events.filter(e=>e.type==='goal').length<=1);}
});
test('buy max rejects unaffordable, full, remote, closed and medicine interactions without spending',async()=>{
 const {SHOPS,COUNTER}=await import('../games/robberfather/engine.js');const g=survivalDay();g.player.x=SHOPS.find(s=>s.kind===0).x0+COUNTER;g.inventory=['coin'];assert.equal(g.buyMax(),false);assert.equal(g.coins,1);g.inventory=['coin','coin','fresh','fresh','fresh','fresh'];assert.equal(g.buyMax(),false);assert.equal(g.food,4);assert.equal(g.coins,2);g.player.x=SHOPS.find(s=>s.kind===4).x0+COUNTER;g.inventory=Array(5).fill('coin');g.rottenStreak=1;assert.equal(g.buyMax(),false);assert.equal(g.rottenStreak,1);assert.equal(g.coins,5);g.player.x=100;assert.equal(g.buyMax(),false);g.player.x=SHOPS[1].x0+COUNTER;g.mode='night';assert.equal(g.buyMax(),false);assert.equal(g.coins,5);g.mode='day';g.player.hidden=true;assert.equal(g.buyMax(),false);
});
test('older control mappings survive the new R action including an existing R reassignment',async()=>{
 const {Settings,DEFAULT_BINDINGS}=await import('../games/robberfather/settings.js');const bindings={...DEFAULT_BINDINGS};delete bindings.buyMax;bindings.left='KeyJ';const a=new Settings({bindings});assert.equal(a.bindings.left,'KeyJ');assert.equal(a.bindings.buyMax,'KeyR');bindings.steal='KeyR';const b=new Settings({bindings});assert.equal(b.bindings.steal,'KeyR');assert.equal(b.bindings.left,'KeyJ');assert.equal(b.bindings.buyMax,'KeyB');assert.equal(new Set(Object.values(b.bindings)).size,Object.keys(DEFAULT_BINDINGS).length);
});
test('the small recognition dot only draws for faces that actually remember the player',async()=>{
 const {drawRecognitionDot}=await import('../games/robberfather/scene.js');const arcs=[],c={save(){},restore(){},beginPath(){},arc(...a){arcs.push(a);},fill(){},stroke(){}};drawRecognitionDot(c,{x:100,y:650,knows:false});assert.equal(arcs.length,0);drawRecognitionDot(c,{x:100,y:650,knows:true,calm:3,alert:false});assert.deepEqual(arcs[0].slice(0,3),[114,479,3.3]);assert.equal(c.fillStyle,'#f24740');drawRecognitionDot(c,{x:200,y:650,knows:true,alert:true});assert.equal(arcs.length,2);
});
test('generated translation keys for controls, volume, guide and all ending captions remain available',async()=>{
 const {DEFAULT_BINDINGS}=await import('../games/robberfather/settings.js');const needed=[...Object.keys(DEFAULT_BINDINGS).map(key=>'bind_'+key),...['background','effects','voice'].map(key=>'volume_'+key),...Array.from({length:6},(_,i)=>'helpShort'+(i+1)),...['arrest','collapse','robbed'].flatMap(key=>[key+'Title',...Array.from({length:3},(_,i)=>key+'Caption'+(i+1))])];for(const locale of ['ko','en'])for(const key of needed)assert.ok(typeof MESSAGES[locale][key]==='string'&&MESSAGES[locale][key].length>0,locale+': '+key);
});
test('two portions require four tomorrow, zero or one require five, and a full dinner resets the requirement',()=>{
 for(const [eaten,required]of [[0,5],[1,5],[2,4],[3,3]]){let g=survivalDay();g.add('fresh',eaten);g.goHome();g.beginNight();assert.equal(g.nextMealRequired,required);g=new Game(g.save());g.start();g.nextDay();assert.equal(g.mealRequired,required);g=new Game(g.save());g.start();assert.equal(g.mealRequired,required);for(let i=0;i<3;i++)g.advanceMorning();g.add('fresh',5);g.goHome();g.beginNight();assert.equal(g.eaten,required);assert.equal(g.food,5-required);assert.equal(g.fed,true);g.nextDay();assert.equal(g.mealRequired,3);}
});
test('four-portion recovery preserves hunger difficulty, illness and the second hungry-night ending',()=>{
 const make=()=>{const g=survivalDay();g.add('rotten',2);g.goHome();g.beginNight();g.nextDay();for(let i=0;i<3;i++)g.advanceMorning();return g;};const g=make();assert.equal(g.mealRequired,4);assert.equal(g.theftMultiplier,1.5);assert.equal(g.rottenStreak,1);g.add('fresh',3);g.goHome();g.beginNight();assert.equal(g.fed,false);assert.equal(g.hungerStreak,2);g.nextDay();assert.equal(g.ending,'arrest');const full=make();full.add('fresh',4);full.goHome();full.beginNight();assert.equal(full.hungerStreak,0);assert.equal(full.rottenStreak,1);
});
test('old partial dinner saves calculate four portions while legacy hungry daytime saves retain five',()=>{
 const g=survivalDay();g.add('fresh',2);g.goHome();g.beginNight();const old=g.save();delete old.nextMealRequired;delete old.recoveryRequirement;const loaded=new Game(old);loaded.start();loaded.nextDay();assert.equal(loaded.mealRequired,4);const day=afterHungryNight().save();delete day.nextMealRequired;delete day.recoveryRequirement;const legacy=new Game(day);legacy.start();assert.equal(legacy.mealRequired,5);
});
test('holding T can skip every practical tutorial phase, cancelling practice pursuit but preserving the bag',()=>{
 for(const stage of [TUTORIAL.move,TUTORIAL.pull,TUTORIAL.qte,TUTORIAL.dodge,TUTORIAL.caught,TUTORIAL.escape,TUTORIAL.memory,TUTORIAL.purchase,TUTORIAL.meal]){const g=practice();g.tutorial=stage;g.inventory=['coin','rotten'];tick(g,.6,{skipTutorial:true});assert.ok(g.tutorial<TUTORIAL.done);g.update(.01,{});assert.equal(g.tutorialSkipProgress,0);g.attempts=['caught'];g.npcs[0].knows=true;g.chasers=[0];tick(g,1.4,{skipTutorial:true});assert.equal(g.tutorialDone,false);tick(g,.2,{skipTutorial:true});assert.equal(g.tutorialDone,true);assert.equal(g.tutorialPocketLocked,false);assert.equal(g.caughtCount,0);assert.equal(g.chasers.length,0);assert.equal(g.npcs[0].knows,false);assert.deepEqual(g.inventory,['coin','rotten']);assert.equal(g.skipTutorial(),false);}
});
test('skip hold progress never survives release or a save reload, and a skipped tutorial stays skipped',()=>{
 let g=practice();tick(g,.7,{skipTutorial:true});g=new Game(g.save());g.start();assert.equal(g.tutorialSkipProgress,0);tick(g,1.4,{skipTutorial:true});assert.equal(g.tutorialDone,false);tick(g,.2,{skipTutorial:true});const loaded=new Game(g.save());loaded.start();assert.equal(loaded.tutorial,TUTORIAL.done);assert.equal(loaded.tutorialDone,true);
});
test('the waiting child and speech anchor share a position clear of the home doorway',async()=>{
 const {WAITING_CHILD}=await import('../games/robberfather/framing.js');assert.equal(WAITING_CHILD.x,180);assert.ok(WAITING_CHILD.x+45<250);const scene=await readFile(new URL('../games/robberfather/scene.js',import.meta.url),'utf8'),app=await readFile(new URL('../games/robberfather/app.js',import.meta.url),'utf8');assert.match(scene,/this.child\(c,WAITING_CHILD.x,WAITING_CHILD.y/);assert.match(app,/screenPoint\(WAITING_CHILD.x,WAITING_CHILD.speechY\)/);
});
test('day-opening notices end on a pocket or popup interruption and cannot restart the same day',async()=>{
 const {DayNotice}=await import('../games/robberfather/day-notice.js');const n=new DayNotice(),spec={title:'dayHungryTitle'};n.start(2,spec);assert.equal(n.update(1,true),true);assert.equal(n.remaining,7);assert.equal(n.update(.05,false,true),false);assert.equal(n.update(.05,true),false);n.start(2,spec);assert.equal(n.update(.05,true),false);n.start(3,spec);assert.equal(n.update(.05,true),true);n.dismiss();assert.equal(n.update(.05,true),false);
});
test('a day notice expires once, and resuming a saved day starts without a new notice',async()=>{
 const {DayNotice}=await import('../games/robberfather/day-notice.js');const n=new DayNotice();assert.equal(n.update(.05,true),false);n.start(2,{title:'x'});assert.equal(n.update(8,true),false);assert.equal(n.update(1,true),false);n.reset();assert.equal(n.update(.1,true),false);
});
test('returning with three portions warns against both four- and five-portion recovery quotas',()=>{
 for(const [previous,required]of [[0,5],[2,4]]){let g=survivalDay();g.add('fresh',previous);g.goHome();g.beginNight();g.nextDay();for(let i=0;i<3;i++)g.advanceMorning();g.add('fresh',3);const bag=[...g.inventory];assert.deepEqual(g.homeWarning,{have:3,required,missing:required-3,finalNight:true});assert.deepEqual(g.inventory,bag);assert.equal(g.mode,'day');g=new Game(g.save());g.start();assert.equal(g.homeWarning.required,required);g.add('fresh',required-3);assert.equal(g.homeWarning,null);}
});
test('normal-day partial food also warns, while a full meal does not',()=>{
 const g=survivalDay();assert.deepEqual(g.homeWarning,{have:0,required:3,missing:3,finalNight:false});g.add('fresh',2);assert.deepEqual(g.homeWarning,{have:2,required:3,missing:1,finalNight:false});g.add('rotten',1);assert.equal(g.homeWarning,null);
});


// Custom annotations must follow live lessons rather than every pocket panel.
import {activeDetail,baseScene,scopeVisible,DETAIL_SCENES} from '../games/robberfather/ui-editor/scopes.js';
test('annotations follow each tutorial stage, stop on completion and hide under pause',()=>{
 const g=practice();
 for(const [name,step] of Object.entries(TUTORIAL)){
  g.tutorial=step;const detail=activeDetail(g);
  if(name==='done'){assert.equal(detail,'');continue;}
  assert.equal(detail,'tutorial:'+name);
  assert.equal(scopeVisible(detail,baseScene(detail),detail),true);
  assert.equal(scopeVisible(detail,'pause',detail),false);
  assert.equal(scopeVisible('tutorial:dodge',baseScene(detail),detail),name==='dodge');
 }
 g.tutorialDone=true;assert.equal(activeDetail(g),'');
 assert.equal(scopeVisible('tutorial:qte','street','tutorial:qte'),false);
});
test('specific opening, dialogue, dinner and ending annotations do not leak into other scenes',()=>{
 for(const [context,want] of [[{mode:'prologue',prologueIndex:1},'prologue:1'],[{mode:'morning',morningIndex:2},'dialogue:2'],[{mode:'night',fed:false},'night:hungry'],[{mode:'ending',ending:'robbed'},'ending:robbed']]){
  assert.equal(activeDetail(context),want);
  assert.equal(scopeVisible(want,baseScene(want),want),true);
  assert.equal(scopeVisible(want,'street',''),false);
 }
 assert.equal(scopeVisible('pocket','pocket','tutorial:qte'),true);
 assert.equal(scopeVisible('all','street',''),true);
 assert.equal(scopeVisible('tutorial:qte','tutorial:pull','','tutorial:pull'),false);
 assert.equal(scopeVisible('tutorial:qte','tutorial:qte','','tutorial:qte'),true);
 assert.equal(scopeVisible('pocket','tutorial:qte','','tutorial:qte'),true);
});
test('scope catalog follows engine tutorial order and roundtrips with old UI layouts',async()=>{
 const {cleanLayout}=await import('../games/robberfather/ui-editor/model.js');
 for(const [key,value] of Object.entries(DETAIL_SCENES))if(key.startsWith('tutorial:'))assert.equal(value[3],TUTORIAL[key.split(':')[1]]);
 for(const scene of ['street','pocket','tutorial:escape','ending:robbed']){
  const layout={version:1,items:{'added-1':{x:12}},additions:[{id:'added-1',kind:'arrow',scene,texts:{ko:'↓',en:'↓'}}]};
  assert.deepEqual(cleanLayout(JSON.parse(JSON.stringify(layout))),layout);
 }
});


test('indoor ambience drops the crowd recording while retaining pocket and chase sounds',async()=>{
 const {ambienceMix}=await import('../games/robberfather/audio-samples.js');
 for(const kind of [0,1,2,3,4])for(const focus of [0,.5,1]){
  const mix=ambienceMix({mode:'day',shop:{kind},chasers:[1]},focus);
  assert.equal(mix.street,0);assert.equal(mix.night,0);assert.ok(mix.chase>0);
  if(focus>0)assert.ok(mix.heartbeat>0);
 }
 assert.ok(ambienceMix({mode:'day',shop:null},0).street>0);
 assert.ok(ambienceMix({mode:'day',shop:{kind:5}},0).street>0);
});
test('entering shops stops recorded voice, keeps it muted, and restores its preference on exit',async()=>{
 const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape();let stopped=0;s.context={currentTime:1};s.voiceBus={gain:{setTargetAtTime(value){this.value=value;}}};s.voice={stop(){stopped++;}};s.pendingVoice='witnessed';
 s.volumes.voice=.4;s.setLocation({shop:{kind:0}});assert.equal(stopped,1);assert.equal(s.voice,null);assert.equal(s.pendingVoice,null);assert.equal(s.voiceBus.gain.value,0);s.shout();
 s.setVolumes({voice:.7,effects:1,background:1});assert.equal(s.voiceBus.gain.value,0);assert.equal(s.volumes.voice,.7);s.setLocation({shop:{kind:5}});assert.equal(s.voiceBus.gain.value,.7);
});
test('ongoing pursuit does not repeat detection dialogue periodically',async()=>{
 const {SoundDirector}=await import('../games/robberfather/audio.js');const g={...practice(),shop:null,chasers:[1]};const director=new SoundDirector();for(let i=0;i<600;i++)assert.equal(director.update(g,.05).some(e=>['shout','detected','witnessed'].includes(e.type)),false);
});

test('approved music follows outdoor and indoor locations and ducks through pocket focus and pursuit',async()=>{
 const {ambienceMix}=await import('../games/robberfather/audio-samples.js');
 for(const kind of [null,0,1,2,3,4,5]){
  const g={mode:'day',shop:kind===null?null:{kind},chasers:[]};const normal=ambienceMix(g),focused=ambienceMix(g,1);const indoors=kind!==null&&kind!==5;
  assert.equal(normal[indoors?'musicStreet':'musicShop'],0);assert.ok(normal[indoors?'musicShop':'musicStreet']>0);
  for(const key of ['musicStreet','musicShop']){assert.ok(focused[key]<=normal[key]);assert.equal(ambienceMix({...g,chasers:[1]})[key],0);}
  assert.ok(focused.heartbeat>normal.heartbeat);if(indoors)assert.equal(normal.street,0);
 }
 for(const mode of ['intro','prologue','night','ending']){const mix=ambienceMix({mode});assert.equal(mix.musicStreet,0);assert.equal(mix.musicShop,0);}
});
test('selected local music files and in-game attribution stay packaged together',async()=>{
 const {AUDIO_FILES}=await import('../games/robberfather/audio-samples.js');const sources=JSON.parse(await readFile(new URL('../games/robberfather/assets/audio-v37/SOURCES.json',import.meta.url),'utf8'));
 const {createHash}=await import('node:crypto');for(const [i,key] of ['musicStreet','musicShop'].entries()){
  const bytes=await readFile(new URL(AUDIO_FILES[key]));assert.ok(bytes.length>100000);assert.equal(createHash('sha256').update(bytes).digest('hex'),sources[i].sha256);
 }
 const {AUDIO_CREDITS}=await import('../games/robberfather/audio-credits.js');for(const source of sources)assert.ok(AUDIO_CREDITS.some(item=>item.title===source.title&&item.author===source.author&&item.url===source.url&&item.licenseUrl===source.licenseUrl));
});


test('pursuit immediately silences both scene music gains and restores exclusive scene music afterwards',async()=>{
 const {SampleMixer,ambienceMix}=await import('../games/robberfather/audio-samples.js');
 const calls={};const mixer=Object.create(SampleMixer.prototype);mixer.c={currentTime:2};mixer.buffers={};mixer.targets={};mixer.loops={};
 for(const key of ['musicStreet','musicShop','chase']){calls[key]=[];mixer.loops[key]={gain:{gain:{cancelScheduledValues:t=>calls[key].push(['cancel',t]),setValueAtTime:(v,t)=>calls[key].push(['now',v,t]),setTargetAtTime:(v,t,s)=>calls[key].push(['fade',v,t,s])}}};}
 const street={mode:'day',shop:null,chasers:[]};mixer.update(ambienceMix({...street,chasers:[1]}));
 for(const key of ['musicStreet','musicShop'])assert.deepEqual(calls[key],[['cancel',2],['now',0,2]]);
 assert.ok(calls.chase.some(([kind,v])=>kind==='fade'&&v>0));
 for(const key of Object.keys(calls))calls[key].length=0;mixer.update(ambienceMix(street));
 assert.deepEqual(calls.chase,[['cancel',2],['now',0,2]]);assert.ok(calls.musicStreet.some(([kind,v])=>kind==='fade'&&v>0));assert.ok(calls.musicShop.every(([,v])=>v===0));
});


test('all installed recordings have direct author, source and license credits, with exactly two attribution-required tracks',async()=>{
 const {AUDIO_CREDITS}=await import('../games/robberfather/audio-credits.js');const {AUDIO_FILES}=await import('../games/robberfather/audio-samples.js');
 const required=AUDIO_CREDITS.filter(item=>item.license==='CC BY 4.0');assert.deepEqual(required.map(item=>item.title).sort(),['Chase Pulse Faster','Despair and Triumph']);
 for(const url of Object.values(AUDIO_FILES)){const suffix=new URL(url).pathname.split('/').slice(-3).join('/');const credits=AUDIO_CREDITS.filter(item=>item.files.includes(suffix));assert.equal(credits.length,1,suffix);assert.ok(credits[0].author);if(credits[0].license==='Project recording'){assert.equal(credits[0].licenseUrl,'./assets/audio-v41/CREDITS.md');}else{assert.ok(credits[0].url.startsWith('https://'));assert.ok(credits[0].licenseUrl.startsWith('https://creativecommons.org/'));}}
 assert.ok(AUDIO_CREDITS.every(item=>['CC0 1.0','CC BY 4.0','Project recording'].includes(item.license)));
});


test('victim detection and bystander witnessing choose different owner recordings without overlap',async()=>{
 const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape(),played=[],stopped=[];s.context={currentTime:1};s.running=true;s.noiseHit=()=>{};s.samples={has:()=>true,voice:key=>{played.push(key);return{stop(){stopped.push(key);this.onended?.();},disconnect(){}};}};
 s.play('detected');s.play('witnessed');assert.deepEqual(played,['voiceCaught','voiceWitness']);assert.deepEqual(stopped,['voiceCaught']);s.play('recognized');assert.equal(played.at(-1),'voiceCaught');assert.equal(stopped.at(-1),'voiceWitness');
 s.volumes.voice=0;s.play('detected');assert.equal(played.length,3);s.volumes.voice=1;s.indoors=true;s.play('witnessed');assert.equal(played.length,3);
});
test('late-loading voice plays only while its detection chase remains active, and pause discards pending speech',async()=>{
 const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape(),played=[];let ready=false;s.context={currentTime:1};s.running=true;s.master={gain:{setTargetAtTime(){}}};s.air={gain:{setTargetAtTime(){}}};s.noiseHit=()=>{};s.director={update:()=>[]};s.samples={has:()=>ready,update(){},voice:key=>{played.push(key);return{stop(){},disconnect(){}};}};
 const g={mode:'day',shop:null,chasers:[1],player:{hidden:false},activeTarget:null};s.play('witnessed');assert.equal(s.pendingVoice,'witnessed');assert.equal(played.length,0);ready=true;s.update(g,.02,true,'en');assert.deepEqual(played,['voiceWitness']);assert.equal(s.pendingVoice,null);
 ready=false;s.play('detected');s.update({...g,chasers:[]},.02,true,'en');assert.equal(s.pendingVoice,null);ready=true;s.update(g,.02,true,'en');assert.equal(played.length,1);
 ready=false;s.play('detected');s.quiet();assert.equal(s.pendingVoice,null);
});
test('recorded voices use their own volume bus as single playback sources',async()=>{
 const {SampleMixer}=await import('../games/robberfather/audio-samples.js');const routed=[],started=[];let source;const voiceBus={},effectsBus={};const gain={gain:{value:0},connect(to){routed.push(to);return this;},disconnect(){}};const mixer=Object.create(SampleMixer.prototype);Object.assign(mixer,{buffers:{voiceCaught:{duration:1.18},voiceWitness:{duration:.97}},voiceBus,master:effectsBus,c:{createGain:()=>gain,createBufferSource:()=>source={connect(){return gain;},start(){started.push(this.buffer);}}}});
 mixer.voice('voiceWitness');assert.equal(source.loop,false);assert.equal(started[0],mixer.buffers.voiceWitness);assert.equal(routed[0],voiceBus);assert.equal(gain.gain.value,.40);
});

test('legacy version links redirect to the permanent URL without touching saves or other parameters',async()=>{
 const {runInNewContext}=await import('node:vm');const html=await readFile(new URL('../games/robberfather/index.html',import.meta.url),'utf8');const code=html.match(/<script id="canonical-entry">([\s\S]*?)<\/script>/)[1];
 for(const [href,want] of [
  ['https://kim0612meow.github.io/rdother/games/robberfather/?v=1','https://kim0612meow.github.io/rdother/games/robberfather/'],
  ['https://kim0612meow.github.io/rdother/games/robberfather/?v=old&lang=en#game','https://kim0612meow.github.io/rdother/games/robberfather/?lang=en#game'],
  ['https://kim0612meow.github.io/rdother/games/robberfather/',null],
  ['file:///C:/game.html?v=1',null]
 ]){let redirected=null;runInNewContext(code,{URL,location:{href,protocol:new URL(href).protocol,replace:value=>redirected=value}});assert.equal(redirected,want);}
});
