import cv2,numpy as np
cap=cv2.VideoCapture('preview30.mp4');prev=None;rows=[];i=0
while True:
  ok,fr=cap.read()
  if not ok:break
  g=cv2.cvtColor(cv2.resize(fr,(480,384)),cv2.COLOR_BGR2GRAY)
  if prev is not None:
    fl=cv2.calcOpticalFlowFarneback(prev,g,None,0.5,4,25,4,7,1.5,0)
    # central band around the focus line (the sharp part of the frame)
    band=fl[150:240,60:420];dy=np.median(band[...,1]);
    # zoom: horizontal flow on left vs right halves (expansion > 0 means zoom-in)
    L=np.median(fl[150:240,40:200,0]);R=np.median(fl[150:240,280:440,0]);
    rows.append((i/30,dy,(R-L)))
  prev=g;i+=1
import json
bad=[];out=[]
for t,dy,zx in rows:
  if 1.7<=t<=7.25 and -dy<0.5*np.median([-r[1] for r in rows if 2<=r[0]<=7]):bad.append(('speed dip',round(t,2),round(float(dy),2)))
  if t<=8.2 and zx>0.15:bad.append(('zoom-in',round(t,2),round(float(zx),2)))
for t,dy,zx in rows:
  if abs(t*2-round(t*2))<1e-6 or t in (0.0333,):out.append(f"{t:5.2f}s  vertical flow {-dy:6.2f}px/f  zoom(R-L) {zx:6.2f}")
print('\n'.join(out[:30]));print('cruise flow median 2-7s:',round(float(np.median([-r[1] for r in rows if 2<=r[0]<=7])),2),'px/frame')
print('min/max 1.7-7.25:',round(float(min(-r[1] for r in rows if 1.7<=r[0]<=7.25)),2),round(float(max(-r[1] for r in rows if 1.7<=r[0]<=7.25)),2))
print('max zoom-in signal 0-8.2s:',round(float(max(r[2] for r in rows if r[0]<=8.2)),3))
print('PROBLEMS:',bad[:10] if bad else 'none')
