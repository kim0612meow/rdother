// Optional UI-editor text overrides. Empty by default; normal translations remain the source.
export const UI_TEXT={en:{},ko:{}};
export function setUIText(texts={}){UI_TEXT.en={...(texts.en||{})};UI_TEXT.ko={...(texts.ko||{})};}
