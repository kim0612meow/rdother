import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const PORT=Number(process.env.GAME_PREVIEW_PORT||4174);
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 try{
  let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(url==='/__qa')url='/tools/visual-check.html';
  if(url.endsWith('/'))url+='index.html';
  const file=path.resolve(root,'.'+url);
  if(!file.startsWith(root+path.sep)||url.includes('/.'))throw Error('outside');
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(PORT,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+PORT+'/games/robberfather/'));
