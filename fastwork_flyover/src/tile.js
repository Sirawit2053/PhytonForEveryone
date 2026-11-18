const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const svg=fs.readFileSync(__dirname+'/logo/favicon.svg','utf8');const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:512,height:512}});await p.emulateMedia({colorScheme:'dark'});
 await p.setContent(`<html><body style="margin:0;background:transparent"><div style="width:512px;height:512px;border-radius:112px;background:#0B4597;display:flex;align-items:center;justify-content:center"><div style="width:300px;height:300px">${svg.replace('<svg ','<svg style="width:100%;height:100%" ')}</div></div></body></html>`);
 await p.screenshot({path:__dirname+'/film/assets/tile.png',omitBackground:true});await b.close();})();
