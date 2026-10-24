import {ACTIVE_THEME,THEMES,ARCHITECTURE} from './config.js?v=city-v4';
const W=1440,H=840,GROUND=650;
export class Backgrounds{
 constructor(theme=ACTIVE_THEME){this.theme=THEMES[theme];this.panels={};this.props={};this.ready=false;if(!this.theme)return;const img=new Image();img.onload=()=>{
  const pw=Math.floor(img.width/2),ph=Math.floor(img.height/2);
  for(const [name,[col,row]]of Object.entries(this.theme.panels)){
   const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
   const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
   const split=Math.round(ph*this.theme.sourceGround[name]);
   c.drawImage(img,col*pw,row*ph,pw,split,0,0,W,GROUND);
   c.drawImage(img,col*pw,row*ph+split,pw,ph-split,0,GROUND,W,H-GROUND);
   this.panels[name]=canvas;
  }
  this.ready=true;
 };img.onerror=()=>console.error('Background theme failed to load');img.src=this.theme.atlas;const props=new Image();props.onload=()=>{const halfW=Math.floor(props.width/2),halfH=Math.floor(props.height/2),scan=document.createElement('canvas');scan.width=props.width;scan.height=props.height;const sc=scan.getContext('2d',{willReadFrequently:true});sc.drawImage(props,0,0);for(const [name,col,row]of [['crate',0,0],['bin',1,0],['table',0,1],['bowl',1,1]]){const data=sc.getImageData(col*halfW,row*halfH,halfW,halfH).data;let x0=halfW,y0=halfH,x1=0,y1=0;for(let y=0;y<halfH;y++)for(let x=0;x<halfW;x++)if(data[(y*halfW+x)*4+3]>128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}const el=document.createElement('canvas');el.width=x1-x0+1;el.height=y1-y0+1;el.getContext('2d').drawImage(props,col*halfW+x0,row*halfH+y0,el.width,el.height,0,0,el.width,el.height);this.props[name]=el;}};props.src=this.theme.props;if(this.theme.alley){const alley=new Image();alley.onload=()=>{const panel=document.createElement('canvas');panel.width=W;panel.height=H;const ctx=panel.getContext('2d');ctx.imageSmoothingEnabled=false;const split=Math.round(alley.height*.708);ctx.drawImage(alley,0,0,alley.width,split,0,0,W,GROUND);ctx.drawImage(alley,0,split,alley.width,alley.height-split,0,GROUND,W,H-GROUND);this.alleyOverride=panel;};alley.src=this.theme.alley;}}
 // Source art and interaction markers share door centres; architecture is reduced around the feet line.
 street(c,cam,shops){if(!this.ready)return false;if(!this.theme.compact)return this.draw(c,'street',cam);const p=this.panels.street;
  c.imageSmoothingEnabled=false;this.wall(c);this.floor(c,p);
  for(const shop of shops){const x=shop.door-cam;if(x<-300||x>W+300)continue;
   if(shop.kind===5){const a=this.alleyOverride||this.panels.alley;if(a)c.drawImage(a,ARCHITECTURE.alleyDoor-87.5,0,175,GROUND,x-53,GROUND-GROUND*.55,106,GROUND*.55);}
   else{const scale=ARCHITECTURE.facadeScale,sw=shop.w/scale,sx=ARCHITECTURE.streetDoor-sw/2;c.drawImage(p,sx,0,sw,GROUND,x-shop.w/2,GROUND-GROUND*scale,shop.w,GROUND*scale);}
  }return true;
 }
 draw(c,name,cam=0){if(!this.ready)return false;const panel=name==='alley'?(this.alleyOverride||this.panels.alley):this.panels[name];if(!panel)return false;
  if(name==='home'||(!this.theme.compact&&name!=='street')){c.drawImage(panel,0,0);return true;}
  if(name==='street'){for(let x=-Math.round(cam%W);x<W;x+=W)c.drawImage(panel,x,0);return true;}
  const scale=ARCHITECTURE.roomScale,width=W*scale,door=name==='alley'?ARCHITECTURE.alleyDoor:115,offset=150-door*scale;
  c.imageSmoothingEnabled=false;this.wall(c);this.floor(c,panel);
  // Repeat only the wall area to the right, keeping exactly one exit door.
  for(let x=offset+width;x<W;x+=(W-430)*scale)c.drawImage(panel,430,0,W-430,GROUND,x,GROUND-GROUND*scale,(W-430)*scale,GROUND*scale);
  c.drawImage(panel,0,0,W,GROUND,offset,GROUND-GROUND*scale,width,GROUND*scale);if(name==='shop')c.drawImage(panel,900,0,540,GROUND,950,GROUND-GROUND*scale,324,GROUND*scale);
  return true;
 }
 wall(c){const a=this.alleyOverride||this.panels.alley;if(!a){c.fillStyle='#514c3f';c.fillRect(0,0,W,GROUND);return;}for(let y=0;y<GROUND;y+=30)for(let x=0;x<W;x+=42)c.drawImage(a,670,160,76,54,x,y,42,30);}
 floor(c,p){for(let x=0;x<W;x+=W*.55){c.drawImage(p,0,GROUND,W,H-GROUND,x,GROUND,W*.55,(H-GROUND)*.55);for(let y=GROUND+(H-GROUND)*.55;y<H;y+=27.5)c.drawImage(p,0,790,W,50,x,y,W*.55,27.5);}}
 prop(c,name,x,y,w,h){const img=this.props[name];if(!img)return false;c.save();c.imageSmoothingEnabled=false;c.drawImage(img,Math.round(x-w/2),Math.round(y-h),w,h);c.restore();return true;}
 get fx(){return this.ready?this.theme.fx:1;}
}
