import {ACTIVE_THEME,THEMES} from './config.js?v=city-v3';
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
 };img.onerror=()=>console.error('Background theme failed to load');img.src=this.theme.atlas;const props=new Image();props.onload=()=>{const halfW=Math.floor(props.width/2),halfH=Math.floor(props.height/2),scan=document.createElement('canvas');scan.width=props.width;scan.height=props.height;const sc=scan.getContext('2d',{willReadFrequently:true});sc.drawImage(props,0,0);for(const [name,col,row]of [['crate',0,0],['bin',1,0],['table',0,1],['bowl',1,1]]){const data=sc.getImageData(col*halfW,row*halfH,halfW,halfH).data;let x0=halfW,y0=halfH,x1=0,y1=0;for(let y=0;y<halfH;y++)for(let x=0;x<halfW;x++)if(data[(y*halfW+x)*4+3]>128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}const el=document.createElement('canvas');el.width=x1-x0+1;el.height=y1-y0+1;el.getContext('2d').drawImage(props,col*halfW+x0,row*halfH+y0,el.width,el.height,0,0,el.width,el.height);this.props[name]=el;}};props.src=this.theme.props;}
 draw(c,name,cam=0){if(!this.ready)return false;const panel=this.panels[name];if(!panel)return false;
  if(name==='street'){const tile=W;for(let x=-Math.round(cam%tile);x<W;x+=tile)c.drawImage(panel,x,0);}else c.drawImage(panel,0,0);
  return true;
 }
 prop(c,name,x,y,w,h){const img=this.props[name];if(!img)return false;c.save();c.imageSmoothingEnabled=false;c.drawImage(img,Math.round(x-w/2),Math.round(y-h),w,h);c.restore();return true;}
 get fx(){return this.ready?this.theme.fx:1;}
}
