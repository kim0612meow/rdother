// Morning farewell dialogue: three connected lines per day.
// English is player-facing; Korean preserves the same meaning.
// Requests refer only to existing food/shop mechanics, never extra errands.
const pair=([en,ko])=>({en,ko});
export const MORNING_LINES={
 hopeful:[
 ["Dad, your sleeve’s torn again.", "아빠, 소매 또 찢어졌어요."],
 ["Was it because of that man who was shouting yesterday?", "어제 소리 지르던 사람 때문이에요?"],
 ["Just make sure you come back, okay?", "그래도 꼭 돌아와요. 알았죠?"],

 ["Going out to earn money again?", "오늘도 돈 벌러 가요?"],
 ["I’ll wait here.", "저 여기서 기다릴게요."],
 ["We’re eating together tonight, right?", "오늘 저녁도 같이 먹는 거죠?"],

 ["Dad, you’re looking at everyone again.", "아빠, 또 사람들 보고 있어요."],
 ["Is your work somewhere over there?", "저쪽에 아빠 일하는 데 있어요?"],
 ["Okay. Be careful.", "알았어요. 조심히 가요."],

 ["Do you have to run at work?", "일할 때 뛰어야 해요?"],
 ["You’re always out of breath when you get back.", "돌아올 때마다 숨차 하잖아요."],
 ["Don’t run too hard today.", "오늘은 너무 많이 뛰지 마요."],

 ["Dad, I like the potatoes.", "아빠, 저 감자 좋아해요."],
 ["You don’t have to buy anything fancy.", "비싼 거 안 사 와도 돼요."],
 ["You’re going to eat with me, though. Promise?", "대신 아빠도 같이 먹어요. 약속해요?"],

 ["You keep looking down the street.", "아빠 자꾸 길 쪽 보네요."],
 ["Is there someone you don’t want to see?", "만나기 싫은 사람 있어요?"],
 ["You don’t have to tell me. Just be careful.", "말 안 해도 돼요. 조심만 해요."],

 ["Dad, did you sleep?", "아빠, 잠은 잤어요?"],
 ["You look more tired than yesterday.", "어제보다 더 피곤해 보여요."],
 ["I hope you don’t have to stay out long.", "오늘은 오래 안 걸리면 좋겠어요."],

 ["Why do you turn away when you see the police?", "경찰 보면 왜 돌아서 가요?"],
 ["Are they angry with you?", "아빠한테 화났어요?"],
 ["Okay, I won’t ask. Come back safe.", "알았어요, 안 물어볼게요. 무사히 와요."],

 ["Dad, is there enough work today?", "아빠, 오늘은 일 있어요?"],
 ["You walked around for ages yesterday.", "어제는 한참 돌아다녔잖아요."],
 ["I hope you earn enough before it gets dark.", "어두워지기 전에 다 벌면 좋겠어요."],

 ["I’ll stay here while you’re gone.", "아빠 없는 동안 여기 있을게요."],
 ["I won’t go looking for you.", "찾으러 안 나갈게요."],
 ["But don’t be too late, okay?", "그래도 너무 늦지는 마요. 알았죠?"],

 ["Does earning money hurt your hands?", "돈 벌면 손도 다쳐요?"],
 ["You always hide them when you get back.", "돌아오면 맨날 손 감추잖아요."],
 ["You can show me. I won’t be angry.", "보여줘도 돼요. 저 화 안 내요."],

 ["Dad, are you leaving now?", "아빠, 지금 가요?"],
 ["I’ll be waiting for you tonight.", "저녁에 아빠 기다리고 있을게요."],
 ["Don’t forget to eat with me.", "저랑 같이 먹는 거 잊지 마요."],
 ].map(pair),
 hungry:[
 ["Dad, I’m still hungry.", "아빠, 저 아직 배고파요."],
 ["Will you be able to earn enough today?", "오늘은 돈 벌 수 있어요?"],
 ["Please don’t come back too late.", "너무 늦게 오지는 마요."],

 ["I couldn’t sleep. My stomach kept growling.", "배에서 자꾸 소리가 나서 못 잤어요."],
 ["Did you hear it too?", "아빠도 들었어요?"],
 ["I hope we get to eat tonight.", "오늘 저녁에는 먹으면 좋겠어요."],

 ["Even bread would be okay today.", "오늘은 빵이라도 괜찮아요."],
 ["You can get that at the bakery, right?", "빵집에서 살 수 있죠?"],
 ["Get enough for you too.", "아빠 먹을 것도요."],

 ["Was it hard to earn money yesterday?", "어제 돈 벌기 힘들었어요?"],
 ["You don’t have to tell me what happened.", "무슨 일 있었는지 말 안 해도 돼요."],
 ["Just come back with something to eat today.", "오늘은 먹을 거 가져와요."],

 ["I said I wasn’t hungry yesterday.", "어제 안 배고프다고 했잖아요."],
 ["I was. I wanted you to eat.", "배고팠어요. 아빠 먹으라고 그런 거예요."],
 ["Can we both eat tonight?", "오늘은 둘 다 먹을 수 있어요?"],

 ["Dad, I don’t feel like getting up.", "아빠, 저 일어나기 싫어요."],
 ["I’ll wait here while you earn the money.", "돈 벌어 올 때까지 여기 있을게요."],
 ["You will come back, won’t you?", "꼭 돌아올 거죠?"],
 ].map(pair),
 sick:[
 ["My stomach still hurts, Dad.", "아빠, 아직도 배 아파요."],
 ["It started after we ate that food.", "그 음식 먹고 나서부터요."],
 ["Can you buy food from a shop today?", "오늘은 가게에서 먹을 거 사 오면 안 돼요?"],

 ["I don’t want that food again.", "그 음식은 다시 먹기 싫어요."],
 ["I know you brought it for me.", "저 먹으라고 가져온 거 알아요."],
 ["But it made my stomach hurt.", "그런데 먹고 배 아팠어요."],

 ["I feel dizzy when I stand up.", "일어나면 어지러워요."],
 ["I’ll stay lying down while you’re out.", "아빠 나가 있는 동안 누워 있을게요."],
 ["Please come back soon.", "빨리 돌아와요."],

 ["Are you going out to earn money now?", "이제 돈 벌러 가요?"],
 ["I’ll try to sleep until you get back.", "아빠 올 때까지 자고 있을게요."],
 ["Wake me up when it’s time to eat.", "밥 먹을 때 깨워줘요."],
 ].map(pair),
};
export function getMorningLines(day,lastMeal){const mood=lastMeal==='hungry'?'hungry':lastMeal==='rotten'?'sick':lastMeal==='both'?(day%2?'sick':'hungry'):'hopeful';const pool=MORNING_LINES[mood];const offset=Math.max(0,day-(mood==='hopeful'?1:2))*3;return [0,1,2].map(i=>pool[(offset+i)%pool.length]);}
export function storyText(line,locale='en'){return line[locale]??line.en;}
