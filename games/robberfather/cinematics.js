// Shared by simulation, captions, sound cues and renderer.
export const ROBBERY={hit:2.2,fall:3.1,kicks:[4.1,5.55,7,8.45,9.9],rob:11,home:12.5,collapse:16,end:19};
export const ARREST={reach:3.2,noticed:4.2,caught:6.2,escort:8,leave:12,end:14};
// Shared staging keeps the camera and the actual actors together, including
// the final escorted walk. The officer never walks the child off screen.
export function arrestScene(time){
 const p=Math.max(0,Math.min(ARREST.end,time)),approach=Math.min(1,p/ARREST.reach),escort=Math.max(0,Math.min(1,(p-ARREST.escort)/(ARREST.leave-ARREST.escort)));
 const policeX=p<ARREST.escort?1150-Math.max(0,Math.min(1,(p-ARREST.noticed)/(ARREST.caught-ARREST.noticed)))*284:866+escort*244;
 const childX=p<ARREST.escort?570+approach*254:policeX-42;
 const close=Math.max(0,Math.min(1,(p-2)/1.2)),focus=660+(870-660)*close;
 return {childX,policeX,fatherX:400,victimX:880+Math.max(0,Math.min(1,(p-ARREST.caught)/.8))*120+Math.max(0,Math.min(4,p-ARREST.escort))*80,trying:p>=ARREST.reach&&p<ARREST.caught,frame:p<3.6?0:p<4?1:p<4.8?2:3,zoom:1.75+.55*close,focusX:p>=ARREST.escort?(childX+policeX)/2:focus,part:p<ARREST.reach?1:p<ARREST.escort?2:3};
}
export function endingDuration(kind){return kind==='robbed'?ROBBERY.end:kind==='arrest'?ARREST.end:8;}
export function endingPart(kind,time){return kind==='arrest'?arrestScene(time).part:kind!=='robbed'?(time<3.6?1:time<6.4?2:3):time<6?1:time<ROBBERY.home?2:3;}
export function kickReach(time,side){let reach=0;ROBBERY.kicks.forEach((hit,i)=>{if(i%2!==side)return;const d=Math.abs(time-hit);if(d<.38)reach=Math.max(reach,(1-d/.38)*18);});return reach;}
