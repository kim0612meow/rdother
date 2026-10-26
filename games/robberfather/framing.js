export const WAITING_CHILD={x:180,y:647,speechY:605};
import {WIDTH,HEIGHT,GROUND,RULES} from './engine.js?v=morning-farewell-v45';

// Keep a narrow walkable foreground at every street/room camera scale.
export const FOOT_LINE=.85;
export function streetFocusY(zoom){return GROUND-HEIGHT*(FOOT_LINE-.5)/zoom;}
// Meal/title scenes have no bottom HUD: keep paving to eight percent there.
export const HOME_FOOT_LINE=.92,HOME_ZOOM=1.25;
export function homeFocusY(zoom){return GROUND-HEIGHT*(HOME_FOOT_LINE-.5)/zoom;}
// Keep both spoons, the bowl and the newspaper together at the screen centre.
export const COLLAPSE_LAYOUT={sourceCenter:1010.5,center:WIDTH/2,scale:1.2};
export const MEAL_LAYOUT={sourceCenter:982.5,center:WIDTH/2,scale:1.2};
// Match the real window, keeping square pixels and no letterbox bands.
export function viewportSize(width,height){return {width:Math.max(1,Math.round(HEIGHT*width/Math.max(1,height))),height:HEIGHT};}
export function fitZoom(zoom,width=WIDTH,height=HEIGHT){return Math.max(zoom,width/WIDTH,height/HEIGHT);}
export function cameraWindow(zoom,x,y,width=WIDTH,height=HEIGHT){
 const w=width/zoom,h=height/zoom;
 return {sx:Math.max(0,Math.min(WIDTH-w,x-w/2)),sy:Math.max(0,Math.min(HEIGHT-h,y-h/2)),w,h};
}
export function worldToCanvas(view,x,y){return {x:(x-view.cam-view.sx)*view.zoom,y:(y-view.sy)*view.zoom};}
export function canvasToWorld(view,x,y){return {x:view.cam+view.sx+x/view.zoom,y:view.sy+y/view.zoom};}
// Match the opaque load, rather than the cart's empty right-hand deck.
export function coverPlacement(cover,aspect){
 return {prop:cover.inside?'storage':'cover',width:RULES.coverWidth,height:RULES.coverWidth*aspect,poseX:cover.x-(cover.inside?0:40),poseY:GROUND-2};
}
