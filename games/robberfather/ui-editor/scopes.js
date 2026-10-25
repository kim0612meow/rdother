// UI visibility only; tutorial indices follow the saved progression.
export const DETAIL_SCENES={
  "tutorial:move": [
    "튜토리얼 · 이동",
    "Tutorial · Move",
    "street",
    0
  ],
  "tutorial:find": [
    "튜토리얼 · 행인 찾기",
    "Tutorial · Find a passerby",
    "street",
    1
  ],
  "tutorial:approach": [
    "튜토리얼 · 뒤로 접근",
    "Tutorial · Approach",
    "street",
    2
  ],
  "tutorial:pull": [
    "튜토리얼 · 마우스 실습",
    "Tutorial · Mouse practice",
    "pocket",
    3
  ],
  "tutorial:qte": [
    "튜토리얼 · SPACE 실습",
    "Tutorial · SPACE practice",
    "pocket",
    4
  ],
  "tutorial:dodge": [
    "튜토리얼 · E로 빠져나오기",
    "Tutorial · Leave with E",
    "pocket",
    5
  ],
  "tutorial:resume": [
    "튜토리얼 · 다시 훔치기",
    "Tutorial · Steal again",
    "pocket",
    6
  ],
  "tutorial:caught": [
    "튜토리얼 · 들킨 횟수 설명",
    "Tutorial · Spotted count",
    "street",
    7
  ],
  "tutorial:escape": [
    "튜토리얼 · 추격과 F 숨기",
    "Tutorial · Chase and hide",
    "street",
    8
  ],
  "tutorial:memory": [
    "튜토리얼 · 얼굴 기억 설명",
    "Tutorial · Face memory",
    "street",
    9
  ],
  "tutorial:buyIntro": [
    "튜토리얼 · 음식 구매 설명",
    "Tutorial · Buying food",
    "street",
    10
  ],
  "tutorial:shop": [
    "튜토리얼 · 상점 문으로 이동",
    "Tutorial · Shop entrance",
    "street",
    11
  ],
  "tutorial:counter": [
    "튜토리얼 · 판매대로 이동",
    "Tutorial · Find the counter",
    "street",
    12
  ],
  "tutorial:purchase": [
    "튜토리얼 · 음식 사기",
    "Tutorial · Purchase",
    "street",
    13
  ],
  "tutorial:meal": [
    "튜토리얼 · 식사 칸 설명",
    "Tutorial · Meal slots",
    "street",
    14
  ],
  "prologue:0": [
    "도입 · 첫 자막",
    "Opening · First caption",
    "prologue"
  ],
  "prologue:1": [
    "도입 · 두 번째 자막",
    "Opening · Second caption",
    "prologue"
  ],
  "dialogue:0": [
    "아침 · 첫 대사",
    "Morning · First line",
    "dialogue"
  ],
  "dialogue:1": [
    "아침 · 두 번째 대사",
    "Morning · Second line",
    "dialogue"
  ],
  "dialogue:2": [
    "아침 · 세 번째 대사",
    "Morning · Third line",
    "dialogue"
  ],
  "night:fed": [
    "저녁 · 충분한 식사",
    "Dinner · Full meal",
    "night"
  ],
  "night:hungry": [
    "저녁 · 부족한 식사",
    "Dinner · Not enough food",
    "night"
  ],
  "ending:arrest": [
    "엔딩 · 아이가 잡혀감",
    "Ending · Arrest",
    "ending"
  ],
  "ending:collapse": [
    "엔딩 · 아이가 쓰러짐",
    "Ending · Illness",
    "ending"
  ],
  "ending:robbed": [
    "엔딩 · 뒷골목 강도",
    "Ending · Alley robbery",
    "ending"
  ]
};
export function baseScene(scope){return DETAIL_SCENES[scope]?.[2]||scope;}
export function activeDetail(context){
 if(context.mode==='day'&&!context.tutorialDone)return Object.keys(DETAIL_SCENES).find(key=>key.startsWith('tutorial:')&&DETAIL_SCENES[key][3]===context.tutorial)||'';
 if(context.mode==='prologue')return 'prologue:'+context.prologueIndex;
 if(context.mode==='morning')return 'dialogue:'+context.morningIndex;
 if(context.mode==='night')return 'night:'+(context.fed?'fed':'hungry');
 if(context.mode==='ending')return 'ending:'+context.ending;
 return '';
}
export function scopeVisible(scope,scene,detail='',preview=''){
 if(preview&&preview!=='current')return scope==='all'||scope===preview||(!DETAIL_SCENES[scope]&&scope===baseScene(preview));
 if(scope==='all')return true;
 if(DETAIL_SCENES[scope])return scene!=='pause'&&scope===detail&&(baseScene(scope)!=='pocket'||scene==='pocket');
 return scope===scene;
}
