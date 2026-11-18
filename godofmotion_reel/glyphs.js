const opentype = require('opentype.js');
const fs = require('fs');
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·/.:-%+';
function flatten(cmds){ // -> array of contours [[x,y],...], y down, em units (/upm)
  const out=[]; let cur=null, px=0, py=0;
  for(const c of cmds){
    if(c.type==='M'){ cur=[[c.x,c.y]]; out.push(cur); px=c.x;py=c.y; }
    else if(c.type==='L'){ cur.push([c.x,c.y]); px=c.x;py=c.y; }
    else if(c.type==='Q'){ for(let i=1;i<=8;i++){const t=i/8,u=1-t; cur.push([u*u*px+2*u*t*c.x1+t*t*c.x, u*u*py+2*u*t*c.y1+t*t*c.y]);} px=c.x;py=c.y; }
    else if(c.type==='C'){ for(let i=1;i<=10;i++){const t=i/10,u=1-t; cur.push([u*u*u*px+3*u*u*t*c.x1+3*u*t*t*c.x2+t*t*t*c.x, u*u*u*py+3*u*u*t*c.y1+3*u*t*t*c.y2+t*t*t*c.y]);} px=c.x;py=c.y; }
  }
  return out;
}
const res={};
for(const [name,file] of [['black','Inter-Black.otf'],['bold','Inter-Bold.otf']]){
  const f=opentype.parse(fs.readFileSync('/usr/share/fonts/opentype/inter/'+file).buffer.slice(0));
  const g={}; const upm=f.unitsPerEm;
  for(const ch of chars){
    const gl=f.charToGlyph(ch);
    const p=gl.getPath(0,0,1); // 1 = em size, y down
    const f4=v=>+v.toFixed(5);let d='';for(const c of p.commands){if(c.type==='M')d+=`M${f4(c.x)} ${f4(c.y)}`;else if(c.type==='L')d+=`L${f4(c.x)} ${f4(c.y)}`;else if(c.type==='Q')d+=`Q${f4(c.x1)} ${f4(c.y1)} ${f4(c.x)} ${f4(c.y)}`;else if(c.type==='C')d+=`C${f4(c.x1)} ${f4(c.y1)} ${f4(c.x2)} ${f4(c.y2)} ${f4(c.x)} ${f4(c.y)}`;else if(c.type==='Z')d+='Z';}
    const bb=p.getBoundingBox();
    g[ch]={d, adv:gl.advanceWidth/upm, bb:[bb.x1,bb.y1,bb.x2,bb.y2], contours: name==='black' && 'BEAT'.includes(ch) ? flatten(p.commands).map(c=>c.map(([x,y])=>[+x.toFixed(4),+y.toFixed(4)])) : undefined};
  }
  const kern={};
  for(const a of chars) for(const b of chars){ const k=f.getKerningValue(f.charToGlyph(a),f.charToGlyph(b)); if(k) kern[a+b]=k/upm; }
  res[name]={g,kern,cap:f.tables.os2.sCapHeight/upm, xh:f.tables.os2.sxHeight/upm};
}
fs.writeFileSync('glyphs.json', JSON.stringify(res));
console.log('ok', res.black.cap, Object.keys(res.black.kern).length, res.black.g['E'].adv, res.black.g['V'].adv);
