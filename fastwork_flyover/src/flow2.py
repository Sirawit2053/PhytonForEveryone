import cv2,numpy as np
cap=cv2.VideoCapture('preview30.mp4');frames=[]
while True:
  ok,fr=cap.read()
  if not ok:break
  frames.append(cv2.cvtColor(fr,cv2.COLOR_BGR2GRAY))
res=[]
for i in range(1,int(8.2*30)):
  a,b=frames[i-1],frames[i]
  pts=cv2.goodFeaturesToTrack(a,400,0.01,8,mask=None)
  if pts is None:res.append((i/30,np.nan,0));continue
  nb,st,_=cv2.calcOpticalFlowPyrLK(a,b,pts,None,winSize=(31,31),maxLevel=4)
  ok=st[:,0]==1;p0=pts[ok,0];p1=nb[ok,0]
  # convert screen motion to page-space speed using the camera's ground scale at each point's row is overkill;
  # instead compare against the same rows: points in the sharp middle band 380-780
  m=(p0[:,1]>380)&(p0[:,1]<780)
  if m.sum()<5:res.append((i/30,np.nan,int(m.sum())));continue
  res.append((i/30,float(np.median(-(p1[m,1]-p0[m,1]))),int(m.sum())))
arr=np.array([r[1] for r in res]);t=np.array([r[0] for r in res])
cr=(t>=1.7)&(t<=7.25)
print('cruise 1.7-7.25s: min %.2f  median %.2f  max %.2f px/frame (n/a frames: %d)'%(np.nanmin(arr[cr]),np.nanmedian(arr[cr]),np.nanmax(arr[cr]),np.isnan(arr[cr]).sum()))
for a,b in [(0.9,1.1),(3.7,4.2)]:
  s=(t>=a)&(t<=b);print(f'{a}-{b}s:',' '.join('%.1f'%v for v in arr[s]))
print('flight frames moving backwards (<0):',int(np.nansum(arr[(t>0.1)&(t<8.2)]<0)))
print('backward frames:',[(round(float(a),3),round(float(v),2)) for a,v in zip(t,arr) if a>0.1 and a<8.2 and v<0])
print('first 0.7s:',' '.join('%.1f'%v for v in arr[t<0.75]))
