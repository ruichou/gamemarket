import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=path.resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!target.startsWith(root+path.sep)&&target!==path.join(root,'index.html')){res.writeHead(403);return res.end();}const data=await readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port 4173 is busy. If the demo is already running, open http://127.0.0.1:4173 .':e.message);process.exitCode=1;}).listen(4173,'127.0.0.1',()=>{console.log('Local: http://127.0.0.1:4173');if(process.argv.includes('--open')&&process.platform==='win32')spawn('explorer.exe',['http://127.0.0.1:4173'],{windowsHide:true}).on('error',()=>console.log('Please open the URL in your browser.'));});
