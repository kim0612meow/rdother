import {WAITING_CHILD,COLLAPSE_LAYOUT,MEAL_LAYOUT,homeFocusY,HOME_ZOOM,robberyFocusY,streetFocusY,cameraWindow,coverPlacement,viewportSize,fitZoom,worldToCanvas,canvasToWorld} from './framing.js?v=empty-bins-v56';
import {ARCHITECTURE} from './themes/config.js?v=empty-bins-v56';
import {Backgrounds} from './themes/backgrounds.js?v=empty-bins-v56';
import {ARREST,arrestScene,ROBBERY,kickReach} from './cinematics.js?v=empty-bins-v56';
import {drawCharacter,drawChild,drawLyingChild,drawEating,drawAction,drawCrouch,spritesReady,spritesFailed} from './characters.js?v=empty-bins-v56';
import {WIDTH as W,HEIGHT as H,WORLD,GROUND,TYPES,RULES,BOXES,SHOPS,INSIDE_DOOR,COUNTER,SELLS,ALLEY,ALLEY_DOORS,areaAt} from './engine.js?v=empty-bins-v56';
const SHOP_NAMES=['bakery','market','cafe','hotel','pharmacy','darkAlley'],SIGNS={bread:'breadSign',potato:'potatoSign',medicine:'medicineSign'};
import {t} from './i18n.js?v=empty-bins-v56';
import {HD2D} from './hd2d.js?v=empty-bins-v56';
// Street view is drawn closer than the full canvas so characters read larger.
const STREET_ZOOM=1.5;
const canvas=(w=W,h=H)=>{const el=document.createElement('canvas');el.width=w;el.height=h;return el;};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function line(c,x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
function label(c,str,x,y,size=12,color='#d6ccaa',font='Georgia'){c.font=`${size}px ${font}`;c.fillStyle=color;c.textAlign='center';c.fillText(str,x,y);}
function newspaper(c,x,y,w=50,h=35,angle=0){c.save();c.translate(x,y);c.rotate(angle);rect(c,0,0,w,h,'#b5af8b');rect(c,4,4,w-8,4,'#646f56');for(let yy=13;yy<h-3;yy+=5){rect(c,4,yy,w*.4,2,'#7f8668');rect(c,w*.55,yy,w*.35,2,'#7f8668');}c.restore();}
function shopSign(c,str,x,y,size){c.save();c.font='bold '+size+'px Georgia';c.textAlign='center';c.lineWidth=1.3;c.lineJoin='round';c.strokeStyle='#efd7a3';c.strokeText(str,x,y);c.fillStyle='#352719';c.fillText(str,x,y);c.restore();}
export function drawRecognitionDot(c,n){if(!n.knows)return;c.save();c.fillStyle='#f24740';c.strokeStyle='#291612';c.lineWidth=1.5;c.beginPath();c.arc(n.x+14,n.y-171,3.3,0,Math.PI*2);c.fill();c.stroke();c.restore();}
function person(c,n,player=false,scale=1.3){drawCharacter(c,n,player,scale);}
export class Renderer{
 constructor(el){this.el=el;this.out=el.getContext('2d');this.surface=canvas();this.c=this.surface.getContext('2d');this.camera=0;this.zoom=1;this.coverMotion=null;this.coverSeen=false;this.focus={x:W*.5,y:H*.5};this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.area=-1;this.snap=false;this.fx=new HD2D();this.backgrounds=new Backgrounds();}
 resize(){if(this.el.clientWidth<1||this.el.clientHeight<1)return;const size=viewportSize(this.el.clientWidth,this.el.clientHeight);if(this.el.width!==size.width||this.el.height!==size.height){this.el.width=size.width;this.el.height=size.height;this.snap=true;}}
 draw(g,time,dt){this.resize();const waiting=!spritesReady()||!this.backgrounds.assetsReady,stage=this.el.closest?.('#stage');stage?.classList.toggle('is-loading',waiting);stage?.setAttribute('aria-busy',String(waiting));if(waiting){const c=this.out;c.fillStyle='#17231f';c.fillRect(0,0,this.el.width,H);c.fillStyle='#f7efd8';c.font='24px system-ui,sans-serif';c.textAlign='center';c.fillText(t(this.backgrounds.failed||spritesFailed()?'artLoadFailed':'loadingArt'),this.el.width/2,H/2);return;}const c=this.c;const shop=areaAt(g.player.x),area=shop?shop.id:-1;if(area!==this.area){this.area=area;this.snap=true;this.coverMotion=null;this.coverSeen=false;}c.clearRect(0,0,W,H);c.save();if(g.mode==='ending'){if(g.ending==='arrest')this.drawArrest(c,g,time);else if(g.ending==='robbed')this.drawRobbed(c,g,time);else this.drawCollapse(c,g,time);}else if(['intro','prologue','night'].includes(g.mode)){this.homeBackground(c);c.save();c.translate(MEAL_LAYOUT.center,GROUND);c.scale(MEAL_LAYOUT.scale,MEAL_LAYOUT.scale);c.translate(-MEAL_LAYOUT.sourceCenter,-GROUND);this.drawMeal(c,g,time);c.restore();}else this.drawStreet(c,g,time,dt);c.restore();
 const arrest=g.mode==='ending'&&g.ending==='arrest'?arrestScene(g.endingTime):null;const closeRobbery=g.mode==='ending'&&g.ending==='robbed'&&g.endingTime<ROBBERY.home;const street=['day','caught','return','morning'].includes(g.mode),home=['intro','prologue','night'].includes(g.mode)||g.mode==='ending'&&(g.ending==='collapse'||g.ending==='robbed'&&!closeRobbery),base=arrest?arrest.zoom:street?STREET_ZOOM:closeRobbery?2.1:home?HOME_ZOOM:1;const holding=g.mode==='day'&&g.activeTarget!==null&&g.target;const ratio=holding?Math.min(1,g.progress/TYPES[g.target.type].hold):0;const wanted=fitZoom(base+(holding?(this.reduced?.35:1.3)*ratio:0),this.el.width,H);this.zoom=home||arrest||closeRobbery?wanted:fitZoom(this.zoom+(wanted-this.zoom)*Math.min(1,dt*6),this.el.width,H);if(Math.abs(this.zoom-wanted)<.002)this.zoom=wanted;const plain=fitZoom(base,this.el.width,H),close=fitZoom(base+(this.reduced?.35:1.3),this.el.width,H);this.pocketFocus=street?Math.max(0,Math.min(1,(this.zoom-plain)/Math.max(.001,close-plain))):0;const fx=holding?g.target.x-this.camera:street?(g.tutorialCover?(g.player.x+g.tutorialCover.x)/2:g.player.x)-this.camera:arrest?arrest.focusX:W*.5,fy=holding?g.target.y-65:street||arrest?streetFocusY(this.zoom):closeRobbery?robberyFocusY(this.zoom):home?homeFocusY(this.zoom):H*.5,ease=street&&this.zoom>1.01?Math.min(1,dt*7):1;this.focus.x+=(fx-this.focus.x)*ease;this.focus.y+=(fy-this.focus.y)*ease;if(this.snap){this.focus.x=fx;this.focus.y=fy;this.snap=false;}
 const {w:sw,h:sh,sx,sy}=cameraWindow(this.zoom,this.focus.x,this.focus.y,this.el.width,H);this.view={sx,sy,zoom:this.zoom,cam:Math.round(this.camera)};this.out.imageSmoothingEnabled=false;this.out.clearRect(0,0,this.el.width,H);this.out.drawImage(this.surface,sx,sy,sw,sh,0,0,this.el.width,H);
 const look=street?(shop?(shop.kind===ALLEY?'alley':'shop'):'day'):'night';this.fx.apply(this.out,look,street?(this.focus.y-sy)*this.zoom:560,time,(holding?.6:1)*this.backgrounds.fx);
 if(g.mode==='day'){const seen=Math.max(0,...g.npcs.filter(n=>!n.alert).map(n=>n.witness));if(seen>.08){const edge=this.out.createRadialGradient(this.el.width/2,H/2,H*.45,this.el.width/2,H/2,Math.max(this.el.width,H)*.62);edge.addColorStop(0,'rgba(200,30,20,0)');edge.addColorStop(1,`rgba(200,30,20,${(.15+seen*.4).toFixed(3)})`);this.out.fillStyle=edge;this.out.fillRect(0,0,this.el.width,H);}} // Red edge while someone is noticing.
 }
 homeBackground(c){this.backgrounds.draw(c,'home');}
 roomBackground(c,shop,props=true){if(!this.backgrounds.draw(c,shop.kind===ALLEY?'alley':'shop'))return;
 shopSign(c,t(SHOP_NAMES[shop.kind]),W/2,140,29);label(c,t(shop.kind===ALLEY?'alleyExit':'exitSign'),INSIDE_DOOR,GROUND-205,20,'#e8d9b5','sans-serif');
 if(!props)return;if(shop.kind===ALLEY){const x=COUNTER;person(c,{type:'thug',id:1,x:x+10,y:GROUND-4,face:-1},false,ARCHITECTURE.actorScale);if(!this.backgrounds.prop(c,'table',x,GROUND,200,94)){rect(c,x-94,GROUND-60,188,60,'#503e2c');rect(c,x-100,GROUND-66,200,10,'#8b704e');for(let i=0;i<3;i++){const xx=x-44+i*44;poly(c,[[xx-13,GROUND-67],[xx+13,GROUND-67],[xx+9,GROUND-86],[xx-9,GROUND-86]],'#ab8053');}}label(c,t('shellSign'),x,GROUND-132,17,'#e5d5b3','sans-serif');}
 else if(SELLS[shop.kind])shopSign(c,t(SIGNS[SELLS[shop.kind]]),COUNTER,GROUND-180,21);
 }
 streetBase(c,cam){if(this.backgrounds.street(c,cam,SHOPS)){
 for(const shop of SHOPS){if(shop.kind===ALLEY)continue;const x=shop.door-cam;if(x<0||x>W)continue;shopSign(c,t(SHOP_NAMES[shop.kind]),x,GROUND-210,19);poly(c,[[x-7,GROUND-14],[x+7,GROUND-14],[x,GROUND-7]],'#e5cb8a');}
 for(const x0 of ALLEY_DOORS){const x=x0-cam;if(x>-60&&x<W+60){label(c,t('alleyDoor'),x,GROUND-120,15,'#b8b5a0','sans-serif');poly(c,[[x-6,GROUND-14],[x+6,GROUND-14],[x,GROUND-7]],'#b8b5a0');}}return;}
}
 worldPoint(px,py){return this.view?canvasToWorld(this.view,px,py):null;}
 screenPoint(x,y){if(!this.view)return {x:.5,y:.5};const p=worldToCanvas(this.view,x,y);return {x:p.x/this.el.width,y:p.y/this.el.height};}
 drawStreet(c,g,time,dt){this.updateCover(g,dt);const shop=areaAt(g.player.x),desired=shop?shop.x0:Math.max(0,Math.min(WORLD-W,g.player.x-W*.38));this.camera+=(desired-this.camera)*Math.min(1,dt*5);if(g.player.x===330||this.snap)this.camera=desired;const cam=Math.round(this.camera);if(shop)this.roomBackground(c,shop);else this.streetBase(c,cam);c.save();c.translate(-cam,0);
 for(const b of g.bins)this.bin(c,b);const chars=[...g.npcs,...(!g.player.hidden&&!this.coverMotion?[{...g.player,id:-1}]:[])].sort((a,b)=>a.y-b.y);for(const n of chars){if(n.x<cam-60||n.x>cam+W+60)continue;const isPlayer=n.id===-1;person(c,n,isPlayer,ARCHITECTURE.actorScale);if(isPlayer)poly(c,[[n.x-5,n.y-164],[n.x+5,n.y-164],[n.x,n.y-158]],'#dfc184');else if(n.alert)label(c,'!',n.x,n.y-170,24,'#eca77f','sans-serif');else if(n.type==='wealthy')poly(c,[[n.x,n.y-172],[n.x+4,n.y-168],[n.x,n.y-164],[n.x-4,n.y-168]],'#d9bb77');else if(n.type==='police'){rect(c,n.x-4,n.y-168,8,7,'#b6c8b0');rect(c,n.x-2,n.y-166,4,5,'#5d7f73');}if(!isPlayer)drawRecognitionDot(c,n);if(n.witness>.04&&!n.alert){const hot=n.witness>.6&&Math.sin(time*18)>0;const ex=n.x,ey=n.y-196;poly(c,[[ex-12,ey],[ex,ey-7],[ex+12,ey],[ex,ey+7]],hot?'#ff6a55':'#e23b2e');rect(c,ex-6,ey-3,12,6,'#fbe9df');rect(c,ex-3,ey-3,6,6,'#2a1512');rect(c,n.x-23,n.y-183,46,7,'#2a1512');rect(c,n.x-22,n.y-182,44*n.witness,5,hot?'#ff6a55':'#e23b2e');}}
 this.child(c,WAITING_CHILD.x,WAITING_CHILD.y,1.7,time,false);for(const b of BOXES){if(b.x<cam-180||b.x>cam+W+180)continue;const motion=this.coverMotion?.id===b.id?this.coverMotion:null;this.box(c,b,!!motion,motion?.amount||0,g.player.face);if(g.tutorialCover?.id===b.id)this.coverHighlight(c,b,time);}
 if(g.tutorialWaypoint)this.waypointHighlight(c,g.tutorialWaypoint,time);
 // Boarded doors of shops that caught you stealing.
 for(const id of g.closedShops){const x=SHOPS[id].door;line(c,x-44,470,x+44,620,'#6b4a2e',9);line(c,x+44,470,x-44,620,'#6b4a2e',9);rect(c,x-50,524,100,30,'#7a2219');label(c,t('barredSign'),x,545,15,'#f3d9c4','sans-serif');}
 if(g.target){const n=g.target;c.strokeStyle='#dcc58a';c.lineWidth=1.5;c.beginPath();c.ellipse(n.x,n.y+2,26,6,0,0,Math.PI*2);c.stroke();if(g.progress){const px=n.x+8*n.face,py=n.y-62;c.strokeStyle=g.suspicion>.65?'#e0a078':'#ead095';c.lineWidth=2;c.beginPath();c.arc(px,py,12,-Math.PI/2,-Math.PI/2+Math.PI*2*g.progress/TYPES[n.type].hold);c.stroke();}else{const px=n.x+8*n.face,py=n.y-62,pulse=.5+.5*Math.sin(time*6);c.strokeStyle=`rgba(240,206,128,${.45+.5*pulse})`;c.lineWidth=2;c.strokeRect(px-7-pulse*2,py-6-pulse*2,14+pulse*4,12+pulse*4);}}
 c.restore();if(g.chasers.length)rect(c,0,0,W,H,'#a04f3217');const dusk=1-g.timeLeft/RULES.daySeconds;if(dusk>.45)rect(c,0,0,W,H,`rgba(92,53,32,${(dusk-.45)*.38})`);if(!this.reduced)for(let i=0;i<18;i++){const x=(i*131+time*(7+i%4)-cam*.1)%W,y=320+(i*43+Math.sin(time+i)*12)%370;rect(c,x,y,1,2,'#e2d7a64b');}}
 waypointHighlight(c,{x,y=GROUND,width,height},time,{fill=false,blur=10}={}){
  const pulse=this.reduced?1:.84+.16*Math.sin(time*5);c.save();c.strokeStyle='#ffe3a3';c.lineWidth=4;c.shadowColor='#ffe3a3';c.shadowBlur=this.reduced?0:blur*pulse;c.globalAlpha=pulse;c.strokeRect(x-width/2,y-height,width,height);
  if(fill){c.globalAlpha=.13*pulse;c.fillStyle='#ffe3a3';c.fillRect(x-width/2,y-height,width,height);}c.restore();
 }
 coverHighlight(c,b,time){
  const img=this.backgrounds.props[b.inside?'storage':'cover'],p=coverPlacement(b,img?img.height/img.width:.72);
  this.waypointHighlight(c,{x:b.x,y:GROUND+7,width:p.width+14,height:p.height+14},time,{fill:true,blur:12});
 }
 updateCover(g,dt){
  const cover=g.player.hidden?BOXES.find(b=>b.id===g.player.boxId):null;
  if(cover){if(this.coverMotion?.id!==cover.id)this.coverMotion={id:cover.id,x:cover.x,amount:this.coverSeen?0:1};this.coverMotion.amount=Math.min(1,this.coverMotion.amount+dt/.28);}
  else if(this.coverMotion){this.coverMotion.amount-=dt/.22;if(this.coverMotion.amount<=0||Math.abs(g.player.x-this.coverMotion.x)>RULES.coverReach)this.coverMotion=null;}
  this.coverSeen=true;
 }
 box(c,b,occupied,amount=1,face=1){
  const prop=b.inside?'storage':'cover',img=this.backgrounds.props[prop];
  if(img){
   const p=coverPlacement(b,img.height/img.width),x=b.x,y=GROUND;c.save();c.save();c.translate(x,y-p.height*.45);c.scale(p.width*.62,p.height*.76);const shade=c.createRadialGradient(0,0,.08,0,0,1);shade.addColorStop(0,'#08120de0');shade.addColorStop(.55,'#08120d99');shade.addColorStop(1,'#08120d00');c.fillStyle=shade;c.fillRect(-1,-1,2,2);c.restore();c.fillStyle='#08120d99';c.beginPath();c.ellipse(x,y+2,p.width*.53,10,0,0,Math.PI*2);c.fill();
   if(occupied)drawCrouch(c,p.poseX,p.poseY,amount,ARCHITECTURE.actorScale,face);
   this.backgrounds.prop(c,p.prop,x,y,p.width,p.height);
   label(c,t(occupied?'hiddenStatus':'boxSign'),x,y-p.height-12,11,occupied?'#eed6a3':'#d3c29f','sans-serif');
   if(occupied)poly(c,[[x-5,y-p.height-7],[x+5,y-p.height-7],[x,y-p.height-2]],'#dfc184');
   c.restore();return;
  }
  if(this.backgrounds.prop(c,'crate',b.x,GROUND,82,66)){label(c,t(occupied?'hiddenStatus':'boxSign'),b.x,GROUND-84,10,'#dcc7a2','sans-serif');return;}if(this.backgrounds.ready){const x=b.x,y=GROUND;rect(c,x-40,y-61,80,61,'#4f3d2e');rect(c,x-36,y-56,72,50,'#7f6346');for(let i=0;i<5;i++){rect(c,x-35+i*14,y-55,2,49,'#4b3b2b');line(c,x-31+i*14,y-48,x-29+i*14,y-13,'#9a7b5555',1);}line(c,x-33,y-52,x+33,y-9,'#b09468',5);line(c,x+33,y-52,x-33,y-9,'#aa8b5e',5);rect(c,x-43,y-65,86,8,'#a88b61');rect(c,x-40,y-5,80,6,'#49392d');label(c,t(occupied?'hiddenStatus':'boxSign'),x,y-83,10,'#ddcba8','sans-serif');return;}
const x=b.x,y=GROUND;rect(c,x-40,y-61,80,61,'#887955');rect(c,x-35,y-56,70,49,'#6d694a');line(c,x-34,y-55,x+34,y-8,'#b7a273',5);line(c,x+34,y-55,x-34,y-8,'#a59367',5);rect(c,x-43,y-65,86,8,occupied?'#6d6346':'#b0a078');rect(c,x-40,y-5,80,7,'#4d583c');rect(c,x-32,y-45,64,1,'#c2ae7d55');if(occupied){rect(c,x-12,y-68,24,3,'#b1c197');label(c,t('hiddenStatus'),x,y-85,10,'#d3d5ab','sans-serif');}else label(c,t('boxSign'),x,y-83,9,'#c8c5a0','sans-serif');}
 bin(c,b){if(this.backgrounds.prop(c,'bin',b.x,GROUND,53,77)){if(!b.searched){rect(c,b.x-12,GROUND-72,17,6,'#809758');rect(c,b.x+3,GROUND-71,10,5,'#9eaa6a');}label(c,t('binSign'),b.x,GROUND-93,10,'#c5c1a5','sans-serif');return;}const x=b.x,y=GROUND;rect(c,x-24,y-62,48,62,'#536a56');rect(c,x-28,y-67,56,8,'#7e8e6d');rect(c,x-17,y-56,3,50,'#819174');rect(c,x+12,y-56,3,50,'#819174');rect(c,x-22,y-5,44,6,'#324c3b');line(c,x-14,y-70,x+22,y-78,'#78896a',4);if(!b.searched){rect(c,x-15,y-77,16,10,'#899b57');rect(c,x+1,y-73,18,8,'#a0a462');rect(c,x-6,y-79,8,3,'#4f7144');}label(c,t('binSign'),x,y-92,8,b.searched?'#7e9479':'#bac798','sans-serif');}
 child(c,x,y,s,time,eating=true){drawChild(c,x,y,s,0,'seated',-1);}
 drawMeal(c,g,time){
 if(!spritesReady())return;
 const hungry=g.mode==='night'&&!g.fed,eating=!hungry||g.ateRotten,tme=this.reduced?0:time;
 if(eating){drawEating(c,'father',925,638,2.6,tme);drawEating(c,'child',1040,638,2.35,tme+1.15);}
 else{person(c,{x:925,y:638,pose:'seated',face:1},true,2.6);drawChild(c,1040,638,2.35,0,'seated',-1);}
 if(!eating){poly(c,[[979,626],[1011,626],[1005,637],[985,637]],'#a8a38a');rect(c,980,625,30,3,'#d0c6a5');rect(c,985,629,20,2,'#5a6256');}
 if(g.ateRotten){rect(c,987,623,10,3,'#8fa65e');rect(c,993,621,8,3,'#afbb73');}

 }
 drawArrest(c,g,time){const phase=Math.min(ARREST.end,g.endingTime),scene=arrestScene(phase);this.streetBase(c,0);rect(c,0,0,W,H,'#172c3430');
 person(c,{x:scene.fatherX,y:GROUND,face:1,walk:0},true,1.8);person(c,{id:2,type:'wealthy',x:scene.victimX,y:GROUND,face:1,walk:phase>ARREST.caught&&phase<ARREST.caught+.8||phase>ARREST.escort&&phase<ARREST.leave?phase*6:0},false,1.8);
 c.save();c.translate(scene.childX,GROUND);c.scale(1.5,1.5);if(scene.trying){if(!drawAction(c,'child',scene.frame,0,0,1.05))this.walkingChild(c,0,0,0);}else this.walkingChild(c,0,0,phase>ARREST.leave||phase>=ARREST.reach&&phase<ARREST.escort?0:phase*6);c.restore();
 person(c,{id:8,type:'police',x:scene.policeX,y:GROUND,face:phase>=ARREST.escort?1:-1,walk:phase>ARREST.leave||phase>=ARREST.caught&&phase<ARREST.escort?0:phase*6},false,1.8);
 if(phase>=ARREST.noticed&&phase<ARREST.escort)label(c,'!',scene.policeX,GROUND-148,25,'#dda07c','sans-serif');newspaper(c,303,625,75,33,-.05);
 }
 drawRobbed(c,g,time){const p=g.endingTime;
 if(p<ROBBERY.home){this.roomBackground(c,SHOPS.find(s=>s.kind===ALLEY),false);
  if(p<ROBBERY.fall){
   person(c,{x:720,y:GROUND,pose:'seated',face:-1,walk:0},true,2.1);
   if(!this.backgrounds.prop(c,'table',650,GROUND,117,58)){rect(c,600,GROUND-37,97,37,'#66503a');for(let i=0;i<3;i++){const x=618+i*27;poly(c,[[x-8,GROUND-38],[x+8,GROUND-38],[x+5,GROUND-51],[x-5,GROUND-51]],'#af8051');}}
   const approach=Math.min(1,p/1.7),x=900-approach*132;
     if(p<1.7)person(c,{type:'thug',id:4,x,y:GROUND,face:-1,walk:p*6},false,1.65);
     else {const frame=p<1.98?0:p<2.2?1:p<2.52?2:3;if(!drawAction(c,'thug',frame,x,GROUND,1.65))person(c,{type:'thug',x,y:GROUND,face:-1},false,1.65);}
     if(p>=ROBBERY.hit&&p<ROBBERY.hit+.24){rect(c,0,0,W,H,'#e2d8bb24');label(c,'!',720,GROUND-110,25,'#e4c397','sans-serif');}
  }else{
   c.save();c.translate(766,GROUND-22);c.rotate(-Math.PI/2);person(c,{x:0,y:0,face:1,walk:0},true,1.3);c.restore();
   const away=p>ROBBERY.rob?(p-ROBBERY.rob)*110:0;
   for(const [i,base,face]of [[0,656,1],[1,784,-1]]){const reach=kickReach(p,i);person(c,{type:'thug',id:i+4,x:base+face*reach-face*away,y:GROUND,face:away?-face:face,walk:away?p*7:reach>0?Math.PI/2:0},false,1.3);}
   if(p>=ROBBERY.rob)for(let i=0;i<4;i++)rect(c,695+i*13,GROUND+3,5,3,'#bba279');
  }
  if(p>ROBBERY.home-.6)rect(c,0,0,W,H,'rgba(8,12,11,'+((p-(ROBBERY.home-.6))/.6)+')');return;
 }
 this.homeBackground(c);c.save();c.translate(W/2,GROUND);c.scale(1.2,1.2);c.translate(-1030,-GROUND);
 if(p<ROBBERY.collapse){newspaper(c,1023,628,65,17,.02);this.child(c,1060,638,2.1,0,false);}else{newspaper(c,990,638,138,14,.02);drawLyingChild(c,1054,GROUND,2.1);}
 poly(c,[[877,627],[949,623],[937,652],[895,655]],'#a79d7e');rect(c,885,627,50,3,'#626755');c.restore();
 }
 drawCollapse(c,g,time){this.homeBackground(c);rect(c,0,0,W,H,'#8da78c16');c.save();c.translate(COLLAPSE_LAYOUT.center,GROUND);c.scale(COLLAPSE_LAYOUT.scale,COLLAPSE_LAYOUT.scale);c.translate(-COLLAPSE_LAYOUT.sourceCenter,-GROUND);newspaper(c,990,638,138,14,.02);drawLyingChild(c,1054,GROUND,1.7);person(c,{x:967,y:635,walk:0,face:1,pose:'seated'},true,2.3);poly(c,[[934,641],[995,641],[987,659],[947,661]],'#b0a77c');rect(c,943,631,43,10,'#d4c18d');c.restore();}
}
