// Change this one line to 'classic' to restore the previous backgrounds.
export const ACTIVE_THEME='painted-city-v1';
export const THEMES={
 classic:null,
 'painted-city-v1':{
  props:new URL('./painted-city-v1/props.png',import.meta.url).href,
  atlas:new URL('./painted-city-v1/backgrounds.png',import.meta.url).href,
  // [column, row]. Keep replacements in the same four-panel layout.
  panels:{street:[0,0],home:[1,0],shop:[0,1],alley:[1,1]},
  // Where feet meet the ground in the artwork, before mapping it to GROUND.
  sourceGround:{street:.81,home:.81,shop:.81,alley:.81},
  fx:.22
 }
};
