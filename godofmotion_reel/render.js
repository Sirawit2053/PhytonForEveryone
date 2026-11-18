// node render.js startFrame endFrame out.mp4
const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const [,,s,e,out]=process.argv;const S=+s,E=+e;
 const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-c:v','png','-framerate','180','-i','-',
   '-vf',"tmix=frames=3,select='eq(mod(n\\,3)\\,2)',setpts=N/60/TB",'-r','60','-c:v','libx264','-preset','medium','-crf','11','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+__dirname+'/reel.html');const cdp=await p.context().newCDPSession(p);
 const t0=Date.now();
 for(let f=S;f<E;f++)for(let j=0;j<3;j++){
   const t=f/60+(j-1)/360;await p.evaluate(t=>window.seek(t,4,1/360),t);
   const r=await cdp.send('Page.captureScreenshot',{format:'png',optimizeForSpeed:true,clip:{x:0,y:0,width:1920,height:1080,scale:1}});
   const buf=Buffer.from(r.data,'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
 }
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
 console.log(`frames ${S}-${E} done in ${((Date.now()-t0)/1000).toFixed(1)}s`);})();
