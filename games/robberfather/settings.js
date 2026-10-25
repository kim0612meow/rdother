export const DEFAULT_BINDINGS=Object.freeze({left:'KeyA',right:'KeyD',enter:'KeyW',run:'ShiftLeft',steal:'KeyE',gauge:'Space',leave:'KeyQ',hide:'KeyF',discard:'KeyG',home:'KeyM'});
export const DEFAULT_VOLUMES=Object.freeze({background:1,effects:1,voice:1});
const volumeValue=(value,fallback=1)=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):fallback;
export const SETTINGS_KEY='one-more-meal-settings-v1';
export function keyLabel(code){return code==='Space'?'SPACE':code.startsWith('Key')?code.slice(3):code.startsWith('Digit')?code.slice(5):code.startsWith('Shift')?'SHIFT':({ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓'})[code]||code;}
export class Settings{
 constructor(data={}){this.volume=Number.isFinite(data?.volume)?Math.max(0,Math.min(1,data.volume)):1;this.volumes=Object.fromEntries(Object.keys(DEFAULT_VOLUMES).map(key=>[key,volumeValue(data?.volumes?.[key],this.volume)]));this.bindings={...DEFAULT_BINDINGS};const candidate=data?.bindings;if(candidate&&Object.keys(DEFAULT_BINDINGS).every(a=>typeof candidate[a]==='string'&&this.allowed(candidate[a]))&&new Set(Object.values(candidate)).size===Object.keys(DEFAULT_BINDINGS).length)this.bindings=Object.fromEntries(Object.keys(DEFAULT_BINDINGS).map(a=>[a,candidate[a]]));}
 allowed(code){return /^(Key[A-Z]|Digit[0-9]|Arrow(Left|Right|Up|Down)|Shift(Left|Right)|Space)$/.test(code);}
 bind(action,code){if(!(action in this.bindings)||!this.allowed(code))return false;const old=this.bindings[action],other=Object.keys(this.bindings).find(a=>a!==action&&this.bindings[a]===code);if(other)this.bindings[other]=old;this.bindings[action]=code;return true;}
 action(code){const direct=Object.keys(this.bindings).find(a=>this.bindings[a]===code);if(direct)return direct;if(code==='ShiftRight'&&this.bindings.run==='ShiftLeft')return 'run';return null;}
 label(action){return keyLabel(this.bindings[action]);}
 reset(){this.bindings={...DEFAULT_BINDINGS};this.volume=1;this.volumes={...DEFAULT_VOLUMES};}
 save(){try{globalThis.localStorage?.setItem(SETTINGS_KEY,JSON.stringify({volume:this.volume,volumes:this.volumes,bindings:this.bindings}));}catch{}}
}
let saved;try{saved=JSON.parse(globalThis.localStorage?.getItem(SETTINGS_KEY)||'{}');}catch{}
export const settings=new Settings(saved);
export function controlText(text){const labels={A:settings.label('left'),D:settings.label('right'),W:settings.label('enter'),E:settings.label('steal'),Q:settings.label('leave'),F:settings.label('hide'),G:settings.label('discard'),M:settings.label('home'),Shift:settings.label('run'),SHIFT:settings.label('run'),Space:settings.label('gauge'),SPACE:settings.label('gauge')};return text.replace(/A( and | ?\/ ?|와 |, )D|\b(Shift|SHIFT|Space|SPACE|W|E|Q|F|G|M)\b/g,(_,join,key)=>join?labels.A+join+labels.D:labels[key]);}
