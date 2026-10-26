import {DETAIL_SCENES} from './scopes.js?v=tutorial-focus-v47';
import {MESSAGES} from '../i18n.js?v=tutorial-focus-v47';
export const TARGETS=[
 ['resources','#resourceHud','돈·식사·기회 묶음','Resources','street'],
 ['coins','#resourceHud .hud-group:nth-child(1)','돈 칸','Coins','street'],
 ['food','#resourceHud .hud-group:nth-child(2)','식사 칸','Meal','street'],
 ['chances','#resourceHud .hud-group:nth-child(3)','남은 기회','Chances','street'],
 ['day','#hud','날짜·아이 상태','Day and health','street'],
 ['clock','#dayClock','남은 시간','Time left','street'],
 ['pause','#pauseBtn','메뉴 버튼','Menu button','street'],
 ['home','#homePrompt','귀가 버튼','Go home','street'],
 ['stamina','#staminaWrap','스태미나','Breath','street'],
 ['skip','#tutorialSkip','튜토리얼 스킵 안내','Tutorial skip hint','street'],
 ['tutorial','#tutorial','튜토리얼 안내','Tutorial hint','street'],
 ['target','#targetCard','행인 정보','Target card','street'],
 ['discard','#discardNote','버리기 안내','Discard hint','street'],
 ['toast','#toast','알림','Notification','street'],
 ['dialogue','#dialogue','아이 대화창','Son dialogue','dialogue'],
 ['next','#dialogueNext','대화 다음 버튼','Next dialogue','dialogue'],
 ['pocket','#pickpocket','소매치기 패널','Pocket panel','pocket'],
 ['shell','#shell','도박 패널','Shell game','shell'],
 ['title','.intro-content','시작 화면 패널','Title panel','title'],
 ['start','#startBtn','시작 버튼','Start button','title'],
 ['continue','#continueBtn','이어서 하기 버튼','Continue button','title'],
 ['night','.cinema-copy','저녁 컷씬 글','Dinner caption','night'],
 ['ending','.ending-copy','엔딩 글','Ending caption','ending'],
 ['settings','#modal .modal','설정창','Settings panel','pause'],
];
export const SCENES={current:['현재 화면','Current'],street:['거리 HUD','Street HUD'],dialogue:['아이 대화','Son dialogue'],pocket:['소매치기','Pickpocket'],shell:['도박','Shell game'],title:['시작 화면','Title'],night:['저녁 컷씬','Dinner'],ending:['엔딩','Ending'],pause:['일시정지','Pause'],prologue:['도입 컷씬','Opening'],...DETAIL_SCENES};
export const STORAGE_KEY='one-more-meal-ui-layout-v1';
export const LIMITS={x:[-100,100],y:[-100,100],width:[0,100],height:[0,100],fontSize:[0,72],opacity:[.1,1],backgroundAlpha:[0,1]};
export function cleanLayout(data){if(data?.version!==1||!data.items||typeof data.items!=='object'||Array.isArray(data.items))throw Error('Invalid layout');const additions=cleanAdditions(data.additions),items={};for(const [key]of layoutTargets({additions})){const item=data.items[key];if(!item||typeof item!=='object')continue;const out={};for(const [name,[min,max]]of Object.entries(LIMITS)){const value=item[name];if(typeof value==='number'&&Number.isFinite(value))out[name]=Math.max(min,Math.min(max,value));}for(const name of ['color','background'])if(/^#[0-9a-f]{6}$/i.test(item[name]))out[name]=item[name].toLowerCase();if(['system','serif','mono'].includes(item.font))out.font=item.font;if(Object.keys(out).length)items[key]=out;}const result={version:1,items};if(additions.length)result.additions=additions;const texts={};for(const locale of ['ko','en']){const source=data.texts?.[locale];if(!source||typeof source!=='object'||Array.isArray(source))continue;const valid={};for(const key of Object.keys(MESSAGES[locale]))if(typeof source[key]==='string')valid[key]=source[key].slice(0,2000);if(Object.keys(valid).length)texts[locale]=valid;}if(Object.keys(texts).length)result.texts=texts;return result;}
export function layoutCSS(layout,width,height){const fonts={system:'system-ui,sans-serif',serif:'Georgia,"Noto Serif KR",serif',mono:'Consolas,monospace'};return layoutTargets(layout).map(([key,selector])=>{const p=layout.items[key];if(!p)return'';const declarations=[];if(p.x!==undefined||p.y!==undefined)declarations.push(`translate:${(p.x||0)*width/100}px ${(p.y||0)*height/100}px`);if(p.width)declarations.push(`width:${p.width*width/100}px`,'max-width:none');if(p.height)declarations.push(`height:${p.height*height/100}px`);if(p.fontSize)declarations.push(`font-size:${p.fontSize}px`);if(p.opacity!==undefined)declarations.push(`opacity:${p.opacity}`);if(p.color)declarations.push(`color:${p.color}`);if(p.background){const hex=p.background+Math.round((p.backgroundAlpha??1)*255).toString(16).padStart(2,'0');declarations.push(`background:${hex}`);}if(p.font)declarations.push(`font-family:${fonts[p.font]}`);const root=selector.startsWith('#modal ')?selector:'#stage '+selector;const cascade=[p.fontSize?'font-size:inherit':'',p.color?'color:inherit':'',p.font?'font-family:inherit':''].filter(Boolean);return(root+'{'+declarations.map(d=>d+' !important').join(';')+'}')+(cascade.length?root+' :is(span,p,strong,small,kbd,button,h1,h2){'+cascade.map(d=>d+' !important').join(';')+'}':'');}).filter(Boolean).join('\n')+textWrapCSS(layout);}

export const TEXT_KEYS={skip:['tutorialSkipHint'],resources:['coinTitle','mealTarget','chances'],coins:['coinTitle'],food:['mealTarget'],chances:['chances'],day:['day'],clock:['untilDusk'],pause:['pauseButton'],home:['home','homeEarly','foodShortageTitle','foodShortageCopy','foodShortageFinalCopy','foodShortageAction'],stamina:['stamina','exhausted'],tutorial:Object.keys(MESSAGES.en).filter(k=>/^(tutorial|coach)/.test(k)),target:['civilian','wealthy','police','slotReward','hold','front','suspicion','difficulty_easy','difficulty_normal','difficulty_hard'],discard:['holdDiscard'],toast:['saved','coinsFullNotice','noMoney','bought','stolen'],dialogue:['son','dialogueNext'],next:['dialogueNext'],pocket:['pickTitle','pickHintDual','pickHintTrace','noteMiss'],shell:['shellTitle','shellHint','shellBet','shellExit','shellForfeit'],title:['title','introOneLine','start','continue'],start:['start'],continue:['continue'],night:['nightTitle','nightCopy','nextDay'],ending:['arrestTitle','arrestCaption1','collapseTitle','collapseCaption1','robbedTitle','robbedCaption1','overAction'],settings:['resume','volume','controlsTitle','guide','restartStory','save','fullscreen']};
export function textKeysFor(target){return(TEXT_KEYS[target]||[]).filter(key=>typeof MESSAGES.en[key]==='string');}
export function originalUIText(key,locale){return MESSAGES[locale]?.[key]??MESSAGES.en[key]??key;}
export function editableTextKeys(){return Object.keys(MESSAGES.en);}

const TEXT_NODES={day:'#dayNumber',mealTarget:'#mealTarget',home:'#homePromptTitle',stamina:'#staminaLabel',exhausted:'#staminaLabel',holdDiscard:'#discardNote span',pickTitle:'[data-pick-title]',pickHintDual:'[data-pick-hint]',pickHintTrace:'[data-pick-hint]',dialogueNext:'#dialogueNext span',continue:'#continueBtn',dayHealth:'#healthNote',nightTitle:'#nightTitle',nightCopy:'#mealCopy',nextDay:'#nextDayText',pauseButton:'#pauseBtn'};
function textWrapCSS(layout){const keys=new Set(Object.values(layout.texts||{}).flatMap(texts=>Object.keys(texts)));return [...keys].map(key=>'#stage [data-i18n="'+key+'"]'+(TEXT_NODES[key]?',#stage '+TEXT_NODES[key]:'')+'{white-space:pre-wrap!important}').join('');}

export const ADDITION_SCENES=['all',...Object.keys(SCENES).filter(key=>key!=='current')];
export function cleanAdditions(raw){if(!Array.isArray(raw))return[];const found=new Set(),out=[];for(const value of raw){if(out.length>=50)break;if(!value||!/^added-[1-9]\d{0,5}$/.test(value.id)||found.has(value.id)||!['text','arrow'].includes(value.kind))continue;found.add(value.id);const texts={};for(const locale of ['ko','en'])texts[locale]=typeof value.texts?.[locale]==='string'?value.texts[locale].slice(0,2000):value.kind==='arrow'?'↓':locale==='ko'?'새 글':'New text';out.push({id:value.id,kind:value.kind,scene:ADDITION_SCENES.includes(value.scene)?value.scene:'street',texts});}return out;}
export function layoutTargets(layout){return [...TARGETS,...(layout.additions||[]).map(item=>[item.id,'#uie-'+item.id,item.texts.ko||'추가한 글',item.texts.en||'Added text',item.scene==='all'?'street':item.scene])];}
export function newAddition(kind,scene,existing=[]){let n=1;while(existing.some(item=>item.id==='added-'+n))n++;return cleanAdditions([{id:'added-'+n,kind,scene,texts:kind==='arrow'?{ko:'↓',en:'↓'}:{ko:'새 글',en:'New text'}}])[0];}
