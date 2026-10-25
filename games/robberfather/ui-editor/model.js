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
export const SCENES={current:['현재 화면','Current'],street:['거리 HUD','Street HUD'],dialogue:['아이 대화','Son dialogue'],pocket:['소매치기','Pickpocket'],shell:['도박','Shell game'],title:['시작 화면','Title'],night:['저녁 컷씬','Dinner'],ending:['엔딩','Ending'],pause:['일시정지','Pause']};
export const STORAGE_KEY='one-more-meal-ui-layout-v1';
export const LIMITS={x:[-100,100],y:[-100,100],width:[0,100],height:[0,100],fontSize:[0,72],opacity:[.1,1],backgroundAlpha:[0,1]};
export function cleanLayout(data){if(data?.version!==1||!data.items||typeof data.items!=='object'||Array.isArray(data.items))throw Error('Invalid layout');const items={};for(const [key]of TARGETS){const item=data.items[key];if(!item||typeof item!=='object')continue;const out={};for(const [name,[min,max]]of Object.entries(LIMITS)){const value=item[name];if(typeof value==='number'&&Number.isFinite(value))out[name]=Math.max(min,Math.min(max,value));}for(const name of ['color','background'])if(/^#[0-9a-f]{6}$/i.test(item[name]))out[name]=item[name].toLowerCase();if(['system','serif','mono'].includes(item.font))out.font=item.font;if(Object.keys(out).length)items[key]=out;}return{version:1,items};}
export function layoutCSS(layout,width,height){const fonts={system:'system-ui,sans-serif',serif:'Georgia,"Noto Serif KR",serif',mono:'Consolas,monospace'};return TARGETS.map(([key,selector])=>{const p=layout.items[key];if(!p)return'';const declarations=[];if(p.x!==undefined||p.y!==undefined)declarations.push(`translate:${(p.x||0)*width/100}px ${(p.y||0)*height/100}px`);if(p.width)declarations.push(`width:${p.width*width/100}px`,'max-width:none');if(p.height)declarations.push(`height:${p.height*height/100}px`);if(p.fontSize)declarations.push(`font-size:${p.fontSize}px`);if(p.opacity!==undefined)declarations.push(`opacity:${p.opacity}`);if(p.color)declarations.push(`color:${p.color}`);if(p.background){const hex=p.background+Math.round((p.backgroundAlpha??1)*255).toString(16).padStart(2,'0');declarations.push(`background:${hex}`);}if(p.font)declarations.push(`font-family:${fonts[p.font]}`);const root=selector.startsWith('#modal ')?selector:'#stage '+selector;const cascade=[p.fontSize?'font-size:inherit':'',p.color?'color:inherit':'',p.font?'font-family:inherit':''].filter(Boolean);return(root+'{'+declarations.map(d=>d+' !important').join(';')+'}')+(cascade.length?root+' :is(span,p,strong,small,kbd,button,h1,h2){'+cascade.map(d=>d+' !important').join(';')+'}':'');}).filter(Boolean).join('\n');}
