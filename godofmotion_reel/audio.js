const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+__dirname+'/reel.html');const b64=await p.evaluate(()=>window.renderAudio());
 fs.writeFileSync(__dirname+'/audio.wav',Buffer.from(b64,'base64'));if(errs.length)console.log(errs);await b.close();})();
