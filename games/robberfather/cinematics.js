// Shared by simulation, captions, sound cues and renderer.
export const ROBBERY={hit:2.2,fall:3.1,kicks:[4.1,5.55,7,8.45,9.9],rob:11,home:12.5,collapse:16,end:19};
export function endingDuration(kind){return kind==='robbed'?ROBBERY.end:8;}
export function endingPart(kind,time){return kind!=='robbed'?(time<3.6?1:time<6.4?2:3):time<6?1:time<ROBBERY.home?2:3;}
export function kickReach(time,side){let reach=0;ROBBERY.kicks.forEach((hit,i)=>{if(i%2!==side)return;const d=Math.abs(time-hit);if(d<.38)reach=Math.max(reach,(1-d/.38)*18);});return reach;}
