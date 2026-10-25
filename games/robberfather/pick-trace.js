// Minigame: grab the wallet and draw it out along a winding line.
// tol: how far off the line the hand may wander. bends: how twisty the line is.
const STYLE={civilian:{tol:30,bends:3,swing:70},wealthy:{tol:23,bends:5,swing:105},police:{tol:17,bends:7,swing:125}};
function buildPath(type,seed,start,W,H){let r=seed;const rand=()=>{r=(r*16807)%2147483647;return r/2147483647;};const s=STYLE[type],pts=[{...start},{x:262,y:start.y}];for(let i=1;i<=s.bends;i++){const x=262+(560-262)*i/(s.bends+1);pts.push({x,y:Math.max(70,Math.min(H-70,H/2+(rand()*2-1)*s.swing))});}pts.push({x:568,y:H/2+(rand()*2-1)*40});
 // Catmull-Rom through the control points, then resample every 3px so progress is measured in pixels.
 const dense=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t;dense.push({x:.5*(2*p1.x+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),y:.5*(2*p1.y+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)});}}dense.push(pts.at(-1));
 const path=[dense[0]];let acc=0;for(let i=1;i<dense.length;i++){const a=dense[i-1],b=dense[i],d=Math.hypot(b.x-a.x,b.y-a.y);acc+=d;while(acc>=3){acc-=3;const k=1-acc/d;path.push({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k});}}path.push(dense.at(-1));return path;}
export class Trace{
 // Speed cap keeps the quickest pull close to each type's hold time.
 constructor({type,hold,seed,start,W,H}){this.tol=STYLE[type].tol;this.path=buildPath(type,seed,start,W,H);this.speed=(this.path.length-1)*3/(hold*.8);this.index=0;this.carry=0;this.warn=false;this.grabbing=false;this.pointer=null;this.note='noteGrab';}
 get fraction(){return this.index/(this.path.length-1);}
 // The hand is in the pocket only while holding the wallet.
 get touching(){return this.grabbing;}
 resume(){this.grabbing=false;this.note='noteResume';}
 down(p){this.pointer=p;const hand=this.path[this.index];if(Math.hypot(p.x-hand.x,p.y-hand.y)<46){this.grabbing=true;this.note='noteFollow';}else this.note='noteGrab';}
 move(p){this.pointer=p;}
 up(){if(this.grabbing){this.grabbing=false;this.note='noteRegrab';}}
 // Returns true on a mistake: the wallet slides back into the pocket a little.
 update(dt){if(!this.grabbing||!this.pointer){this.warn=false;return false;}const p=this.pointer,path=this.path,tol=this.tol;let best=this.index,bestD=Infinity;const hi=Math.min(path.length-1,this.index+30);for(let i=Math.max(0,this.index-8);i<=hi;i++){const d=Math.hypot(p.x-path[i].x,p.y-path[i].y);if(d<bestD){bestD=d;best=i;}}
  const hand=path[this.index],lead=Math.hypot(p.x-hand.x,p.y-hand.y);
  if(bestD>tol)return this.slip('noteOff');if(lead>tol+62)return this.slip('noteFast');
  const step=Math.floor(this.speed*dt/3+this.carry);this.carry=(this.speed*dt/3+this.carry)%1;if(best>this.index)this.index=Math.min(best,this.index+Math.max(0,step));this.warn=lead>tol+30;return false;}
 slip(note){this.grabbing=false;this.carry=0;this.warn=false;this.note=note;this.index=Math.max(0,this.index-Math.round((this.path.length-1)*.22));return true;}
 draw(c,danger){const path=this.path;
  // The way out: dashed guide, gold where the wallet has already travelled.
  c.lineCap='round';c.lineJoin='round';c.strokeStyle='#ffffff18';c.lineWidth=this.tol*2;c.beginPath();path.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
  c.strokeStyle='#f1e4c2aa';c.lineWidth=3;c.setLineDash([10,9]);c.beginPath();path.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);
  c.strokeStyle='#e7c27a';c.lineWidth=6;c.beginPath();for(let i=0;i<=this.index;i++)i?c.lineTo(path[i].x,path[i].y):c.moveTo(path[i].x,path[i].y);c.stroke();
  // Your sleeve waits at the end.
  const end=path.at(-1);c.fillStyle='#24302b';c.beginPath();c.arc(end.x+30,end.y,34,0,Math.PI*2);c.fill();c.strokeStyle='#e7c27a';c.lineWidth=3;c.setLineDash([5,5]);c.beginPath();c.arc(end.x+30,end.y,34,0,Math.PI*2);c.stroke();c.setLineDash([]);
  const hand=path[this.index];return{x:hand.x,y:hand.y,danger:danger||this.warn,ring:true,grabbing:this.grabbing};}
}
