// Choose 'painted-city-v1' for the previous art layout, or 'classic' for procedural art.
export const ACTIVE_THEME='side-street-v2';
const painted={
 props:new URL('./painted-city-v1/props.png',import.meta.url).href,
 atlas:new URL('./painted-city-v1/backgrounds.png',import.meta.url).href,
 panels:{street:[0,0],home:[1,0],shop:[0,1],alley:[1,1]},
 sourceGround:{street:.81,home:.81,shop:.81,alley:.81},fx:.22
};
export const THEMES={classic:null,'painted-city-v1':painted,
 'side-street-v2':{...painted,compact:true,alley:new URL('./side-street-v2/alley.png',import.meta.url).href}
};
// Atlas coordinates are calibrated to the centres of the pictured doors.
export const ARCHITECTURE={facadeScale:.55,streetDoor:736,alleyDoor:252,roomScale:.6};
