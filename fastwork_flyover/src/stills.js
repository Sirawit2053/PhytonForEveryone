// node stills.js outdir N t1 t2 ...
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,dir,N,...ts]=process.argv;fs.mkdirSync(dir,{recursive:true});
 const b=await chromium.launch({args:['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-angle=swiftshader']});
 const p=await b.newPage({viewport:{width:1440,height:1152}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text());});
 await p.goto('http://127.0.0.1:8765/film.html');
 try{await p.evaluate(()=>window.ready);}catch(e){console.log('READY ERR',e.message.slice(0,3000));}
 for(const t of ts){const t0=Date.now();await p.evaluate(([t,N])=>window.seek(+t,+N),[t,N]);const dt=Date.now()-t0;
   await p.screenshot({path:`${dir}/s_${(+t).toFixed(2).padStart(5,'0')}.png`});console.log('t',t,'render ms',dt);}
 if(errs.length)console.log('ERRS',errs.slice(0,6).join('\n').slice(0,3000));await b.close();})();
