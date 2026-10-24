import {WIDTH,HEIGHT,GROUND,RULES} from './engine.js?v=cover-v8';

// Keep a narrow walkable foreground at every street/room camera scale.
export const FOOT_LINE=.85;
export function streetFocusY(zoom){return GROUND-HEIGHT*(FOOT_LINE-.5)/zoom;}
export function cameraWindow(zoom,x,y){
 const w=WIDTH/zoom,h=HEIGHT/zoom;
 return {sx:Math.max(0,Math.min(WIDTH-w,x-w/2)),sy:Math.max(0,Math.min(HEIGHT-h,y-h/2)),w,h};
}
// Match the opaque load, rather than the cart's empty right-hand deck.
export function coverPlacement(cover,aspect){
 return {prop:cover.inside?'storage':'cover',width:RULES.coverWidth,height:RULES.coverWidth*aspect,poseX:cover.x-(cover.inside?0:40),poseY:GROUND-2};
}
