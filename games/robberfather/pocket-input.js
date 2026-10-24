// Resolve near-simultaneous E/Space in favour of leaving the pocket, in either order.
export class PocketInput{
 constructor(){this.spaceAt=null;this.exitAt=-Infinity;}
 exit(now){this.exitAt=now;this.spaceAt=null;}
 request(now){if(now-this.exitAt<180)return false;if(this.spaceAt===null)this.spaceAt=now;return true;}
 get pending(){return this.spaceAt!==null;}
 consume(now){if(this.spaceAt===null||now-this.spaceAt<80)return false;this.spaceAt=null;return now-this.exitAt>=180;}
 clear(){this.spaceAt=null;}
}
