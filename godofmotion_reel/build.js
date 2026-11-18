const fs=require('fs');
const g=fs.readFileSync(__dirname+'/glyphs.json','utf8');
fs.writeFileSync(__dirname+'/reel.html',fs.readFileSync(__dirname+'/reel.src.html','utf8').replace('/*GLYPHS*/null',g));
