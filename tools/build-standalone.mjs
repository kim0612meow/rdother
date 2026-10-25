// Build the HTML game with its named ES modules and referenced PNG atlases embedded.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=fileURLToPath(new URL('../games/robberfather/',import.meta.url));
const imports=/import\s*\{([^}]+)\}\s*from\s*['"]([^?'";]+)(?:\?[^'";]+)?['"];?/g;
const modules=new Map();
async function collect(file){
 if(modules.has(file))return;
 const m={id:'GameModule'+modules.size,code:await readFile(file,'utf8'),names:new Set(),deps:[]};modules.set(file,m);
 for(const [,items,relative]of m.code.matchAll(imports)){
  if(!relative.startsWith('.'))throw Error('External module '+relative);
  const dep=path.resolve(path.dirname(file),relative);await collect(dep);m.deps.push(dep);
  for(const name of items.split(','))modules.get(dep).names.add(name.trim().split(/\s+as\s+/)[0]);
 }
}
const main=path.join(root,'app.js');await collect(main);
const emitted=new Set();let js='';
async function emit(file){
 if(emitted.has(file))return;
 const m=modules.get(file);for(const dep of m.deps)await emit(dep);
 let code=m.code.replace(imports,(_,items,relative)=>`const {${items.trim().replace(/\s+as\s+/g,':')}}=${modules.get(path.resolve(path.dirname(file),relative)).id};`).replace(/\bexport\s+(?=const\b|class\b|function\b)/g,'');
 for(const match of [...code.matchAll(/new URL\('([^']+)',import.meta.url\).href/g)]){
  const asset=await readFile(path.resolve(path.dirname(file),match[1]));code=code.replace(match[0],JSON.stringify('data:'+({'.png':'image/png','.mp3':'audio/mpeg'}[path.extname(match[1])]||'application/octet-stream')+';base64,'+asset.toString('base64')));
 }
 js+=`const ${m.id}=(()=>{\n${code}\nreturn {${[...m.names].join(',')}};\n})();\n`;emitted.add(file);
}
await emit(main);new Script(js);
const css=await readFile(path.join(root,'game.css'),'utf8');
let html=await readFile(path.join(root,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="game.css[^"]*">/,()=>`<style>${css}</style>`).replace(/<script type="module" src="app.js[^"]*"><\/script>/,()=>`<script type="module">\n${js.replace(/<\/script/gi,'<\\/script')}\n</script>`);
const out=path.resolve(process.argv[2]||'Robberfather.html');await writeFile(out,html);console.log(`Built ${out} · ${modules.size} modules · ${Buffer.byteLength(html)} bytes`);
