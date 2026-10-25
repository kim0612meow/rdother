import {WIDTH as W,HEIGHT as H} from './engine.js?v=interaction-sounds-v22';
// HD-2D look: sharp pixel characters, with soft camera effects laid on top
// (tilt-shift blur, bloom, light shafts, dust, colour grade).
const canvas=(w,h)=>{const el=document.createElement('canvas');el.width=w;el.height=h;return el;};
const LOOK={
 day:{shaft:'255,222,160',shaftAlpha:.13,warm:'rgba(255,196,120,.16)',cool:'rgba(20,60,80,.22)',bloom:.32,dust:'255,236,190'},
 shop:{shaft:'255,214,150',shaftAlpha:.09,warm:'rgba(255,190,120,.14)',cool:'rgba(30,40,60,.2)',bloom:.3,dust:'255,226,180'},
 alley:{shaft:'190,210,255',shaftAlpha:.05,warm:'rgba(255,170,90,.08)',cool:'rgba(10,30,60,.32)',bloom:.4,dust:'180,200,220'},
 night:{shaft:'170,200,255',shaftAlpha:.06,warm:'rgba(255,180,100,.1)',cool:'rgba(10,30,70,.3)',bloom:.42,dust:'200,215,240'}
};
export class HD2D{
 constructor(){this.blur=canvas(W/4,H/4);this.bc=this.blur.getContext('2d');this.glow=canvas(W/8,H/8);this.gc=this.glow.getContext('2d');this.mask=canvas(W,H);this.mc=this.mask.getContext('2d');this.filter='filter' in this.gc;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let s=7;const r=()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296;};this.dust=Array.from({length:46},()=>({x:r()*W,y:r()*H,z:.4+r()*.9,p:r()*6.28}));}
 apply(out,look,focusY,time,strength=1){const W=out.canvas.width,H=out.canvas.height;if(this.mask.width!==W||this.mask.height!==H){this.mask.width=W;this.mask.height=H;this.blur.width=Math.ceil(W/4);this.blur.height=Math.ceil(H/4);this.glow.width=Math.ceil(W/8);this.glow.height=Math.ceil(H/8);}const L=LOOK[look]||LOOK.day,t=this.reduced?0:time;
  // Tilt-shift: a soft copy shows only above and below the focus band.
  const bc=this.bc;bc.imageSmoothingEnabled=true;bc.clearRect(0,0,this.blur.width,this.blur.height);bc.drawImage(out.canvas,0,0,this.blur.width,this.blur.height);
  const mc=this.mc;mc.globalCompositeOperation='source-over';mc.clearRect(0,0,W,H);mc.imageSmoothingEnabled=true;mc.drawImage(this.blur,0,0,W,H);
  const top=Math.max(0,focusY-300),bot=Math.min(H,focusY+190),band=mc.createLinearGradient(0,0,0,H);
  band.addColorStop(0,`rgba(0,0,0,${.95*strength})`);band.addColorStop(Math.max(0,top/H),'rgba(0,0,0,0)');band.addColorStop(Math.min(1,bot/H),'rgba(0,0,0,0)');band.addColorStop(1,`rgba(0,0,0,${.9*strength})`);
  mc.globalCompositeOperation='destination-in';mc.fillStyle=band;mc.fillRect(0,0,W,H);mc.globalCompositeOperation='source-over';
  out.save();out.imageSmoothingEnabled=true;out.drawImage(this.mask,0,0);
  // Bloom: bright parts spill soft light.
  const gc=this.gc;gc.imageSmoothingEnabled=true;gc.clearRect(0,0,this.glow.width,this.glow.height);if(this.filter)gc.filter='brightness(.75) contrast(2.4) saturate(1.3)';gc.drawImage(out.canvas,0,0,this.glow.width,this.glow.height);gc.filter='none';
  out.globalCompositeOperation='screen';out.globalAlpha=L.bloom;out.drawImage(this.glow,-8,-8,W+16,H+16);out.globalAlpha=1;
  // Light shafts from the upper left, slowly breathing.
  out.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=120+i*330+Math.sin(t*.13+i)*40,w=90+i*25,a=L.shaftAlpha*(.6+.4*Math.sin(t*.4+i*1.7));const sh=out.createLinearGradient(x,0,x+260,H);sh.addColorStop(0,`rgba(${L.shaft},${a.toFixed(3)})`);sh.addColorStop(.7,`rgba(${L.shaft},${(a*.35).toFixed(3)})`);sh.addColorStop(1,`rgba(${L.shaft},0)`);out.fillStyle=sh;out.beginPath();out.moveTo(x,0);out.lineTo(x+w,0);out.lineTo(x+w+420,H);out.lineTo(x+300,H);out.closePath();out.fill();}
  // Dust motes drifting in the light.
  for(const d of this.dust){const x=(d.x+t*12*d.z)%W,y=(d.y+Math.sin(t*.6+d.p)*14+t*4*d.z)%H,a=(.18+.22*Math.sin(t*1.3+d.p))*d.z;if(a<=0)continue;out.fillStyle=`rgba(${L.dust},${a.toFixed(3)})`;const s=Math.round(1+d.z*2);out.fillRect(Math.round(x),Math.round(y),s,s);}
  // Colour grade: warm light on top, cool shadows below.
  out.globalCompositeOperation='soft-light';const grade=out.createLinearGradient(0,0,0,H);grade.addColorStop(0,L.warm);grade.addColorStop(1,L.cool);out.fillStyle=grade;out.fillRect(0,0,W,H);
  out.restore();}
}
