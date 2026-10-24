// Pixel sprite atlas renderer. No body parts are assembled from rectangles.
// Generated source art is sampled onto a native pixel grid and reduced to 24 colours
// per identity. Animation reuses whole-body poses, including eating utensils.
const COLUMNS={father:0,child:1,civilian:2,worker:2,wealthy:3,police:4,thug:5};
const actions={},frames={},meals={},palettes={},scans=new WeakMap();let loaded=false;
export const CHARACTER_PALETTES={father:{cloth:'#6b6547',skin:'#c59873'},child:{paper:'#d8c9a7',skin:'#c59873'}};
export function characterKind(n,player=false){return player?'father':COLUMNS[n.type]!==undefined?n.type:'civilian';}
const image=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
function cut(img,x,y,w,h,scale){
 let c=scans.get(img);if(!c){const scan=document.createElement('canvas');scan.width=img.width;scan.height=img.height;c=scan.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0);scans.set(img,c);}const rgba=c.getImageData(x,y,w,h).data;
 let x0=w,y0=h,x1=-1,y1=-1;
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(rgba[(yy*w+xx)*4+3]>128){x0=Math.min(x0,xx);x1=Math.max(x1,xx);y0=Math.min(y0,yy);y1=Math.max(y1,yy);}
 if(x1<0)throw Error('Empty sprite frame');
 const out=document.createElement('canvas');out.width=Math.max(1,Math.round((x1-x0+1)*scale));out.height=Math.max(1,Math.round((y1-y0+1)*scale));
 const oc=out.getContext('2d',{willReadFrequently:true});oc.imageSmoothingEnabled=false;
 oc.drawImage(img,x+x0,y+y0,x1-x0+1,y1-y0+1,0,0,out.width,out.height);
 return out;
}
function makePalette(sprites,count=24){
 const points=[];for(const frame of sprites){const d=frame.getContext('2d').getImageData(0,0,frame.width,frame.height).data;for(let i=0;i<d.length;i+=4)if(d[i+3]>128)points.push([d[i],d[i+1],d[i+2]]);}
 points.sort((a,b)=>(a[0]+a[1]*2+a[2])-(b[0]+b[1]*2+b[2]));
 const colours=Array.from({length:count},(_,i)=>points[Math.floor((i+.5)*points.length/count)].slice());
 for(let pass=0;pass<7;pass++){
  const sums=colours.map(()=>[0,0,0,0]);
  for(const p of points){let best=0,dist=Infinity;for(let i=0;i<colours.length;i++){const q=colours[i],d=(p[0]-q[0])**2+(p[1]-q[1])**2*1.4+(p[2]-q[2])**2;if(d<dist){dist=d;best=i;}}const s=sums[best];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++;}
  for(let i=0;i<colours.length;i++)if(sums[i][3])colours[i]=sums[i].slice(0,3).map(n=>Math.round(n/sums[i][3]));
 }
 return colours;
}
function reduce(frame,palette){
 const c=frame.getContext('2d'),pixels=c.getImageData(0,0,frame.width,frame.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<128){d[i+3]=0;continue;}let best=palette[0],dist=Infinity;for(const q of palette){const v=(d[i]-q[0])**2+(d[i+1]-q[1])**2*1.4+(d[i+2]-q[2])**2;if(v<dist){dist=v;best=q;}}d[i]=best[0];d[i+1]=best[1];d[i+2]=best[2];d[i+3]=255;}
 c.putImageData(pixels,0,0);
}
export const ready=typeof Image==='undefined'?Promise.resolve():Promise.all([
 image(new URL('./assets/people-pixel-v2.png',import.meta.url).href),
 image(new URL('./assets/eating-pixel-v2.png',import.meta.url).href),
 image(new URL('./assets/actions-v3.png',import.meta.url).href),
 image(new URL('./assets/crouch-v4.png',import.meta.url).href)
]).then(([people,eating,actionSheet,crouchSheet])=>{
 const rows=[0,267,524,785,1006,1145],mealRows=[0,381,724,1062,1448],cw=people.width/6;
 for(const [kind,col]of Object.entries(COLUMNS)){
  if(kind==='worker')continue;
  frames[kind]=rows.slice(0,-1).map((y,i)=>cut(people,Math.round(col*cw),y,Math.round(cw),rows[i+1]-y,.28));
 }
 for(const [kind,col]of [['father',0],['child',1]])meals[kind]=mealRows.slice(0,-1).map((y,i)=>cut(eating,col*543,y,543,mealRows[i+1]-y,.135));
 for(const [kind,list]of Object.entries(frames)){const all=[...list,...(meals[kind]||[])];palettes[kind]=makePalette(all);for(const frame of all)reduce(frame,palettes[kind]);}
 for(const [kind,row,height]of [['child',0,48],['thug',1,73]]){
  actions[kind]=Array.from({length:4},(_,col)=>{const f=cut(actionSheet,Math.round(col*actionSheet.width/4),Math.round(row*actionSheet.height/2),Math.floor(actionSheet.width/4),Math.floor(actionSheet.height/2),1);const out=document.createElement('canvas');out.height=height;out.width=Math.round(f.width*height/f.height);const oc=out.getContext('2d');oc.imageSmoothingEnabled=false;oc.drawImage(f,0,0,out.width,out.height);reduce(out,palettes[kind]);return out;});
 }
 actions.crouch=[58,52,45,42].map((height,i)=>{const f=cut(crouchSheet,(i%2)*crouchSheet.width/2,i<2?0:550,crouchSheet.width/2,i<2?550:crouchSheet.height-550,1),out=document.createElement('canvas');out.height=height;out.width=Math.round(f.width*height/f.height);const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(f,0,0,out.width,out.height);reduce(out,palettes.father);return out;});
 frames.worker=frames.civilian;loaded=true;
}).catch(error=>{console.error('Character sprite loading failed',error);});
export function spritesReady(){return loaded;}
function blit(c,frame,x,y,scale,face=1){c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.scale(face*scale,scale);c.drawImage(frame,-Math.floor(frame.width/2),-frame.height);c.restore();}
export function drawCharacter(c,n,player=false,scale=1.3){
 if(!loaded)return false;
 const kind=characterKind(n,player),pose=n.pose||(n.walk?'walk':'stand');
 const gait=Math.abs(Math.floor((n.walk||0)/Math.PI*2))%4,row=pose==='seated'?4:pose==='back'?3:pose==='walk'?[0,1,0,2][gait]:0;
 blit(c,frames[kind][row],n.x,n.y,scale,n.face||1);return true;
}
export function drawChild(c,x,y,scale=1,walk=0,pose='seated',face=1){return drawCharacter(c,{x,y,type:'child',walk,pose,face},false,scale);}
export function drawEating(c,kind,x,y,scale,time){
 if(!loaded)return false;
 const row=[0,0,1,1,2,2,3,3][Math.floor(time*2.6)%8];blit(c,meals[kind][row],x,y,scale);return true;
}
export function drawPocketBack(c,type,look,time){
 if(!loaded)return false;
 const frame=frames[type][look==='look'?0:3],scale=520/frame.height;
 const twitch=look==='warn'?Math.round(Math.sin(time*14))*2:0;
 c.save();c.imageSmoothingEnabled=false;c.drawImage(frame,105-Math.floor(frame.width*scale/2)+twitch,-18,Math.round(frame.width*scale),520);c.restore();return true;
}

export function drawAction(c,kind,frame,x,y,scale=1){if(!loaded||!actions[kind])return false;const face=kind==='thug'&&frame!==2?-1:1;blit(c,actions[kind][frame],x,y,scale,face);return true;}
export function drawCrouch(c,x,y,amount,scale=1,face=1){if(!loaded)return false;blit(c,actions.crouch[Math.min(3,Math.floor(Math.max(0,amount)*4))],x,y,scale,face);return true;}
