// Frame-driven: no timers survive a pause, scene change or skipped line.
export class DialogueTyper{
 constructor(){this.start('');}
 start(text){this.letters=Array.from(text);this.index=0;this.wait=0;this.soundWait=0;}
 get done(){return this.index>=this.letters.length;}
 get visible(){return this.letters.slice(0,this.index).join('');}
 get remaining(){return this.letters.slice(this.index).join('');}
 finish(){this.index=this.letters.length;}
 update(dt){if(this.done)return false;this.wait-=dt;this.soundWait-=dt;let audible=false;while(this.wait<=0&&!this.done){const char=this.letters[this.index++];if(/[\p{L}\p{N}]/u.test(char))audible=true;this.wait+=/[.!?。！？]/.test(char)?.18:/[,，…]/.test(char)?.1:.038;}if(audible&&this.soundWait<=0){this.soundWait=.075;return true;}return false;}
}
