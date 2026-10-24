// Shared by the street and pocket games. Derived from the saved day, never
// reset by reloading or by the first theft of a new morning.
// Hunger scales pocket suspicion, turn warnings and the Space target by 1.5.
// Movement and pursuit speed keep their existing day-based progression.
export function dayDifficulty(day=1,multiplier=1){
 const days=Math.max(0,Math.floor(Number.isFinite(day)?day:1)-1);
 const pressure=Number.isFinite(multiplier)?Math.max(1,multiplier):1;
 return {
  precision:pressure,
  alert:(1+days*.075)*pressure,
  warning:1/((1+days*.035)*pressure),
  witnessRange:Math.min(120,days*5),
  chase:Math.min(50,days*1.8),
  zone:1/(1+days*.11),
  timing:1+Math.min(.8,days*.025),
  pull:1+Math.min(.45,days*.02)
 };
}
