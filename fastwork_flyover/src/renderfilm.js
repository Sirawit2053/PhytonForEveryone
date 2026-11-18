// node renderfilm.js startFrame endFrame fps N out.mp4
const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const [,,s,e,fps,N,out]=process.argv;const S=+s,E=+e;
 const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-c:v','png','-framerate',fps,'-i','-','-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-r',fps,out],{stdio:['pipe','inherit','inherit']});
 const b=await chromium.launch({args:['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-angle=swiftshader']});
 const p=await b.newPage({viewport:{width:1440,height:1152}});const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.goto('http://127.0.0.1:8765/film.html');await p.evaluate(()=>window.ready);const cdp=await p.context().newCDPSession(p);
 const t0=Date.now();
 for(let f=S;f<E;f++){await p.evaluate(([t,N])=>window.seek(t,N),[f/(+fps),+N]);
   const r=await cdp.send('Page.captureScreenshot',{format:'png',optimizeForSpeed:true});const buf=Buffer.from(r.data,'base64');
   if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
   if((f-S)%60===0)console.log(out,'frame',f,((Date.now()-t0)/1000).toFixed(0)+'s');}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();if(errs.length)console.log('ERR',errs[0]);
 console.log(out,'done',((Date.now()-t0)/1000).toFixed(0)+'s');})();
