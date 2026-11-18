// Flattened capture of fastwork.com/th/selling at 1440 wide, DSF 2.
// Each scroll-pinned scene is frozen once; lifting pieces are hidden in the background
// and captured alone on transparent with 28px padding. Writes cap/*.png + cap/layout.json
const {chromium}=require('playwright');const fs=require('fs');
const OUT=__dirname+'/cap';fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT+'/pieces',{recursive:true});
const SECTIONS=[
  {id:'hero',scroll:0,rows:[0,900],pieces:[['article.orbit-card','card'],['.hero-cta-stack','cta']],
   ready:()=>{const e=document.querySelector('.script-accent');return e.getAttribute('aria-label')==='你'&&/is-idle/.test(e.className);}},
  {id:'header',scroll:900,rows:[70,300],pieces:[]},
  {id:'profile',scroll:2700,rows:[10,890],pieces:[['a.start-selling-profile-tab','chip'],['.start-selling-profile .card.is-photo','photo'],['.start-selling-profile button.row','service']]},
  {id:'pill',scroll:4650,pill:true,pieces:[]},
  {id:'pain',scroll:4950,rows:[50,900],pieces:[['.pain-note','note']]},
  {id:'commission',scroll:5925,rows:[0,900],pieces:[['.referral-card','referral'],['.client-pill','pill'],['.fee-message','msg']],
   ready:()=>{const e=document.querySelector('.referral-card');let o=1,f=false;for(let a=e;a;a=a.parentElement){const cs=getComputedStyle(a);o*=+cs.opacity;if(cs.filter!=='none')f=true;}return o>0.999&&!f&&document.querySelector('.fee-percent').innerText.trim()==='18%';}},
  {id:'mission',static:[6900,9348],slices:[6900,7800,8448],pieces:[['.start-selling-platform-cred-card','review'],['.start-selling-platform-agents-ask-field','search'],['.start-selling-platform-agents-ask-service','result'],['.start-selling-platform-secure-network-shield','shield'],['.start-selling-platform-orders-card','order'],['.start-selling-platform-invoice-card','invoice']]},
];
const PAD=28,DSF=2;
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:DSF,locale:'th-TH',
    userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'});
  const p=await ctx.newPage();
  await p.goto('https://fastwork.com/th/selling',{waitUntil:'networkidle',timeout:60000});
  await p.evaluate(()=>document.fonts.ready);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=400){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(140);} // lazy images + scroll animations
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(800);
  await p.addStyleTag({content:`.start-selling-top-nav,.sb-toast-viewport,[class*="cookie"],[id*="cookie"],[class*="hotjar"],#_hj_feedback_container{visibility:hidden!important}
    .script-accent path{stroke-dashoffset:0!important;animation:none!important;transition:none!important}
    .script-accent .accent-svg{animation:none!important;opacity:0!important}.script-accent .accent-svg.is-idle-frame-0{opacity:1!important}
    html.cap-hide [data-layer]{visibility:hidden!important}
    html.cap-solo,html.cap-solo body{background:transparent!important}
    html.cap-solo *{visibility:hidden!important}
    html.cap-solo [data-solo],html.cap-solo [data-solo] *{visibility:visible!important}`});
  const layout={dsf:DSF,width:1440,sections:[],pieces:[]};let pageY=0;
  const goto=async (y,ready)=>{await p.evaluate(()=>document.getAnimations().forEach(a=>a.play()));
    await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(1300);
    if(ready){for(let i=0;i<300;i++){if(await p.evaluate(ready))break;await p.waitForTimeout(100);}}
    await p.evaluate(()=>document.getAnimations().forEach(a=>{try{a.pause();}catch(e){}}));await p.waitForTimeout(100);};
  const mark=async(sec,y0view,y1view)=>p.evaluate(({pieces,y0,y1})=>{
    document.querySelectorAll('[data-layer]').forEach(e=>e.removeAttribute('data-layer'));const out=[];
    for(const [sel,kind] of pieces){document.querySelectorAll(sel).forEach(e=>{const r=e.getBoundingClientRect();
      if(r.width<8||r.height<8||r.bottom<y0+4||r.top>y1-4||r.right<0||r.left>1440)return;
      // skip pieces clipped away by an overflow:hidden ancestor
      let a=e.parentElement,vis=true;while(a&&a!==document.body){const cs=getComputedStyle(a);if(cs.overflow!=='visible'){const ar=a.getBoundingClientRect();if(r.right<=ar.left+20||r.left>=ar.right-20){vis=false;break;}}a=a.parentElement;}
      if(!vis)return;const id=kind+'_'+out.length;e.setAttribute('data-layer',id);out.push({id,kind,txt:(e.innerText||'').slice(0,30).replace(/\s+/g,' ')});});}
    return out;},{pieces:sec.pieces,y0:y0view,y1:y1view});
  const solo=async(id,secId,viewToSec)=>{ // isolate one piece
    const r=await p.evaluate(id=>{document.querySelectorAll('[data-solo]').forEach(e=>e.removeAttribute('data-solo'));
      const e=document.querySelector(`[data-layer="${id}"]`);e.setAttribute('data-solo','');document.documentElement.classList.add('cap-solo');
      const b=e.getBoundingClientRect();return {l:b.left,t:b.top,w:b.width,h:b.height};},id);
    const x0=Math.max(0,Math.floor(r.l-PAD)),y0=Math.max(0,Math.floor(r.t-PAD)),x1=Math.min(1440,Math.ceil(r.l+r.w+PAD)),y1=Math.min(900,Math.ceil(r.t+r.h+PAD));
    const file=`pieces/${secId}_${id}.png`;
    await p.screenshot({path:`${OUT}/${file}`,omitBackground:true,clip:{x:x0,y:y0,width:x1-x0,height:y1-y0}});
    await p.evaluate(()=>document.documentElement.classList.remove('cap-solo'));
    const s=viewToSec(0);return {file,box:[x0,y0+s,x1-x0,y1-y0],el:[r.l,r.t+s,r.w,r.h]};};

  for(const sec of SECTIONS){
    if(sec.static){ // normal-flow content: stitched slices, pieces captured where fully visible
      const [a,z]=sec.static;const files=[];
      await goto(sec.slices[0]);const marked=await p.evaluate(({pieces})=>{const out=[];for(const [sel,kind] of pieces)document.querySelectorAll(sel).forEach(e=>{const r=e.getBoundingClientRect();
        let a=e.parentElement,vis=true;while(a&&a!==document.body){const cs=getComputedStyle(a);if(cs.overflow!=='visible'){const ar=a.getBoundingClientRect();if(r.right<=ar.left+20||r.left>=ar.right-20){vis=false;break;}}a=a.parentElement;}
        if(!vis||r.width<8)return;const id=kind+'_'+out.length;e.setAttribute('data-layer',id);out.push({id,kind,top:r.top+scrollY,h:r.height,txt:(e.innerText||'').slice(0,30).replace(/\s+/g,' ')});});return out;},{pieces:sec.pieces});
      for(let i=0;i<sec.slices.length;i++){const s=sec.slices[i];await goto(s);
        const from=Math.max(a,s),to=Math.min(z,i+1<sec.slices.length?sec.slices[i+1]:z,s+900);
        await p.evaluate(()=>document.documentElement.classList.add('cap-hide'));
        const f=`bg_${sec.id}_${i}.png`;await p.screenshot({path:`${OUT}/${f}`,clip:{x:0,y:from-s,width:1440,height:to-from}});
        await p.evaluate(()=>document.documentElement.classList.remove('cap-hide'));files.push({file:f,y:pageY+(from-a)});}
      for(const m of marked){const sc=Math.max(0,Math.round(m.top+m.h/2-450));await goto(sc);
        const r=await solo(m.id,sec.id,()=>pageY+sc-a);layout.pieces.push({...m,section:sec.id,...r});}
      layout.sections.push({id:sec.id,y:pageY,h:z-a,files});pageY+=z-a;continue;
    }
    await goto(sec.scroll,sec.ready);
    if(sec.pill){const r=await p.evaluate(()=>{const b=document.querySelector('.start-selling-future-community-pill').getBoundingClientRect();return [b.top,b.height];});
      const y0=Math.round(r[0]-40),y1=Math.round(r[0]+r[1]+40);const f=`bg_${sec.id}.png`;
      await p.screenshot({path:`${OUT}/${f}`,clip:{x:60,y:y0,width:1320,height:y1-y0}});
      layout.sections.push({id:sec.id,y:pageY,h:y1-y0,files:[{file:f,y:pageY,x:60,fillWhite:true}]});pageY+=y1-y0;continue;}
    const [r0,r1]=sec.rows;const marked=await mark(sec,r0,r1);
    await p.evaluate(()=>document.documentElement.classList.add('cap-hide'));
    const f=`bg_${sec.id}.png`;await p.screenshot({path:`${OUT}/${f}`,clip:{x:0,y:r0,width:1440,height:r1-r0}});
    await p.evaluate(()=>document.documentElement.classList.remove('cap-hide'));
    for(const m of marked){const r=await solo(m.id,sec.id,()=>pageY-r0);layout.pieces.push({...m,section:sec.id,...r});}
    layout.sections.push({id:sec.id,y:pageY,h:r1-r0,files:[{file:f,y:pageY}]});pageY+=r1-r0;
  }
  layout.height=pageY;fs.writeFileSync(OUT+'/layout.json',JSON.stringify(layout,null,1));
  console.log('page height',pageY,'pieces',layout.pieces.length,layout.pieces.map(q=>q.id).join(' '));
  await b.close();
})();
