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
 const g=practice();g.gambleNet=4;g.settleBet(true);assert.equal(g.mode,'ending');assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);tick(g,ROBBERY.hit-.1);assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);tick(g,.2);assert.equal(g.drainEvents().filter(e=>e.type==='headStrike').length,1);tick(g,ROBBERY.home);const events=g.drainEvents();assert.equal(events.filter(e=>e.type==='headStrike').length,0);assert.equal(events.filter(e=>e.type==='bodyStrike').length,5);assert.equal(g.coins,0);
});
test('the robbery remains skippable, with restart available at the actual 19-second ending length',()=>{const g=practice();g.ending='robbed';g.mode='ending';assert.equal(g.endingDuration,19);g.skipEnding();assert.equal(g.endingTime,19);tick(g,.1);assert.equal(g.drainEvents().some(e=>e.type==='headStrike'),false);});
test('attackers reach the centrally placed body from both sides at impact',()=>{for(let i=0;i<ROBBERY.kicks.length;i++){const side=i%2,reach=kickReach(ROBBERY.kicks[i],side);const foot=side===0?656+reach+10:784-reach-10;assert.ok(foot>=675&&foot<=766);}});
test('five coins remain distinct from three dinner portions',()=>{const g=practice();g.add('coin',5);assert.equal(g.coins,5);assert.equal(g.food,0);assert.equal(RULES.coinCap,5);g.add('coin',1);assert.equal(g.coins,5);});
test('the UI has valid bindings and matching bilingual keys',async()=>{const html=await readFile(new URL('../games/robberfather/index.html',import.meta.url),'utf8'),app=await readFile(new URL('../games/robberfather/app.js',import.meta.url),'utf8');for(const [,id]of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${id}"`)||app.includes(`.id='${id}'`),id);assert.deepEqual(Object.keys(MESSAGES.en).sort(),Object.keys(MESSAGES.ko).sort());assert.match(MESSAGES.ko.coinCount,/\{max\}/);});

test('custom controls swap duplicates, reject reserved keys and survive reload',async()=>{const {Settings}=await import('../games/robberfather/settings.js');const s=new Settings();assert.equal(s.bind('steal','KeyR'),true);assert.equal(s.action('KeyE'),null);assert.equal(s.action('KeyR'),'steal');s.bind('left','KeyD');assert.equal(s.action('KeyD'),'left');assert.equal(s.action('KeyA'),'right');assert.equal(s.bind('home','Escape'),false);assert.equal(s.bind('home','F2'),false);const restored=new Settings(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.bindings,s.bindings);assert.equal(new Settings({volume:-3}).volume,0);assert.equal(new Settings({volume:8}).volume,1);});
 test('volume controls both master sound gain and spoken shouts',async()=>{const {Soundscape}=await import('../games/robberfather/audio.js');const s=new Soundscape();let actual;s.master={gain:{setTargetAtTime:v=>actual=v}};s.context={currentTime:2};s.running=true;s.setVolume(.25);assert.equal(actual,.2);s.setVolume(0);assert.equal(actual,0);});

test('every pictured street door is centred on its actual entry trigger',async()=>{const {SHOPS}=await import('../games/robberfather/engine.js');const {Backgrounds}=await import('../games/robberfather/themes/backgrounds.js');const {ARCHITECTURE}=await import('../games/robberfather/themes/config.js');for(const shop of SHOPS){const calls=[],c={drawImage:(...args)=>calls.push(args)},bg={ready:true,theme:{compact:true},panels:{street:{},alley:{}},wall(){},floor(){}};Backgrounds.prototype.street.call(bg,c,shop.door-720,[shop]);const [,sx,,sw,,dx,,dw]=calls[0];const door=shop.kind===5?ARCHITECTURE.alleyDoor:ARCHITECTURE.streetDoor;assert.ok(Math.abs(dx+(door-sx)*dw/sw-720)<.001);const g=practice();g.tutorial=TUTORIAL.done;g.player.x=shop.door;assert.equal(g.nearbyDoor().shop.id,shop.id);g.useDoor();assert.equal(g.nearbyDoor().exit,true);g.useDoor();assert.equal(g.player.x,shop.door);}});

test('loaded carts stay clear of doors and accept cover from their visible edge',async()=>{const {BOXES,SHOPS,Game,TUTORIAL,RULES}=await import('../games/robberfather/engine.js');for(const cart of BOXES.filter(b=>!b.inside)){for(const door of SHOPS)assert.ok(Math.abs(cart.x-door.door)>RULES.coverWidth/2+45);const g=new Game();g.start();g.mode='day';g.tutorial=TUTORIAL.done;g.player.x=cart.x+90;assert.equal(g.nearbyBox().id,cart.id);g.toggleHide();assert.equal(g.player.hidden,true);assert.equal(g.player.x,cart.x);const copy=new Game(g.save());copy.start();assert.equal(copy.player.hidden,true);assert.equal(copy.player.boxId,cart.id);copy.update(.02,{hide:true});assert.equal(copy.player.hidden,false);}});

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
 const auto=new Game();auto.start({prologue:true});tick(auto,10.1);assert.equal(auto.mode,'morning');assert.equal(auto.drainEvents().filter(e=>e.type==='prologueEnd').length,1);
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
 const g=practice();reachWarning(g);g.dodge();tick(g,1.6);g.update(.02,{pick:true,trace:1});const before=g.player.x;tick(g,2,{right:true});assert.equal(g.player.x,before);assert.equal(g.caughtCount,1);g.advanceTutorial();tick(g,3.6,{right:true});assert.equal(g.tutorial,TUTORIAL.escape);assert.equal(g.mode,'day');assert.equal(g.tutorialDone,false);assert.ok(g.nearbyBox());g.update(.02,{hide:true});tick(g,1.3);assert.equal(g.player.hidden,true);assert.equal(g.chasers.length,0);assert.equal(g.tutorial,TUTORIAL.memory);assert.equal(g.tutorialDone,false);assert.equal(g.npcs[0].knows,true);g.advanceTutorial();assert.equal(g.tutorialDone,true);assert.equal(g.caughtCount,1);assert.equal(g.timeLeft,RULES.daySeconds);g.toggleHide();g.npcs[0].calm=0;g.npcs[0].x=g.player.x-60;g.npcs[0].face=1;tick(g,2);assert.ok(g.chasers.includes(0));assert.equal(g.caughtCount,1);
});
test('each unfinished lesson saves and resumes without losing QTE credit, pursuit or face memory',()=>{
 const g=practice();reachWarning(g);g.dodge();tick(g,1.6);g.update(.02,{pick:true,trace:1});let copy=new Game(g.save());copy.start();assert.equal(copy.tutorial,TUTORIAL.caught);assert.equal(copy.tutorialQte,true);assert.equal(copy.npcs[0].knows,true);assert.equal(copy.caughtCount,1);copy.advanceTutorial();copy.player.x=1240;copy.update(.02,{hide:true});tick(copy,1.3);copy=new Game(copy.save());copy.start();assert.equal(copy.tutorial,TUTORIAL.memory);assert.equal(copy.player.hidden,true);copy.advanceTutorial();assert.equal(copy.tutorialDone,true);
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
 for(const type of ['eat','turnWarn','turnLook','frontOnly','stolen','bought','medicine','noMoney','notSick','betPlaced','betWon','betLost','save','night','start'])s.play(type);assert.equal(tones,0);assert.ok(noises>0);s.play({type:'heartbeat',tension:.5});assert.equal(tones,2);
});
