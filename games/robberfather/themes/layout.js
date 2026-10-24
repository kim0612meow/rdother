// Every facade owns a complete, non-overlapping interval. The home is a real
// story location; all other doorway centres come directly from the simulation.
export function streetBays(shops,world=4400){
 const nodes=[{id:'home',kind:5,door:330},...shops].sort((a,b)=>a.door-b.door);
 return nodes.map((node,i)=>({...node,left:i?(nodes[i-1].door+node.door)/2:0,right:i<nodes.length-1?(node.door+nodes[i+1].door)/2:world}));
}
// Keep the central doorway at a fixed human width. The side windows stay whole
// as the rest of each facade fills its assigned bay.
export function facadeSlices(bay,sourceWidth,doorU=.5,doorWidth=112){
 const centre=sourceWidth*doorU,half=Math.min(sourceWidth*.16,centre*.8,(sourceWidth-centre)*.8);
 return [
  {sx:0,sw:centre-half,dx:bay.left,dw:bay.door-doorWidth/2-bay.left},
  {sx:centre-half,sw:half*2,dx:bay.door-doorWidth/2,dw:doorWidth},
  {sx:centre+half,sw:sourceWidth-centre-half,dx:bay.door+doorWidth/2,dw:bay.right-bay.door-doorWidth/2}
 ];
}
