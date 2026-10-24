// A short E release opens a pocket; holding E buys exactly once at the same
// counter. A pause, scene change or leaving the counter cancels the gesture.
export const USE_TIMING={tap:280,buy:650};
export class UseInput{
 constructor(){this.cancel();}
 press(now,counter=null){if(this.active)return;this.active=true;this.started=now;this.counter=counter;this.fired=false;}
 update(now,counter=null){if(!this.active||this.fired)return null;if(this.counter!==null&&this.counter!==counter){this.cancel();return null;}if(this.counter!==null&&now-this.started>=USE_TIMING.buy){this.fired=true;return 'buy';}return null;}
 release(now,counter=null){const elapsed=now-this.started,ready=this.active&&!this.fired;const action=ready&&this.counter!==null&&this.counter===counter&&elapsed>=USE_TIMING.buy?'buy':ready&&elapsed<=USE_TIMING.tap?'tap':null;this.cancel();return action;}
 fraction(now){return this.active&&this.counter!==null&&!this.fired?Math.min(1,(now-this.started)/USE_TIMING.buy):0;}
 cancel(){this.active=false;this.counter=null;this.started=0;this.fired=false;}
}
