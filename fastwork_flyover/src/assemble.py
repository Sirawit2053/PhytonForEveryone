import json,sys
from PIL import Image
d='cap/';L=json.load(open(d+'layout.json'));S=L['dsf'];W=1440*S;H=L['height']*S
page=Image.new('RGBA',(W,H),(255,255,255,255))
for s in L['sections']:
  for f in s['files']:
    im=Image.open(d+f['file']).convert('RGBA');page.paste(im,(f.get('x',0)*S,int(round(f['y']*S))))
page.save(d+'page_bg.png')
full=page.copy()
for q in L['pieces']:
  im=Image.open(d+q['file']).convert('RGBA');bx=q['box'];full.alpha_composite(im,(int(round(bx[0]*S)),int(round(bx[1]*S))))
full.save(d+'page_full.png')
print(W,H)
