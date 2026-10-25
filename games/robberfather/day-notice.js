// A day-opening notice is a single presentation, never a suspended popup.
export class DayNotice{
 constructor(){this.reset();}
 reset(){this.day=null;this.remaining=0;this.spec=null;}
 start(day,spec){if(this.day===day)return;this.day=day;this.spec=spec;this.remaining=spec?8:0;}
 dismiss(){this.remaining=0;}
 update(dt,visible,interrupted=false){if(interrupted)this.dismiss();else if(visible)this.remaining=Math.max(0,this.remaining-Math.max(0,dt));return visible&&!!this.spec&&this.remaining>0;}
}
