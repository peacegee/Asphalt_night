import * as T from 'three';

export const cars = [{n:'DRIFT-86',d:'Хөнгөн, хойд дугуй хөтлөгч — хамгийн сайн гулгалт',acc:27,top:58,st:2.5,gr:4.4,col:0x9b3dff,gl:0xb84dff,w:1.8,l:4.2,rwd:1},{n:'MUSCLE V8',d:'Хүчтэй, хүнд — их утаа, их дрифт',acc:34,top:64,st:2,gr:3.6,col:0xff5a1f,gl:0xff5a1f,w:2,l:4.8,rwd:1},{n:'GT-AWD',d:'Тогтвортой — хамгийн хурдан тойрог',acc:31,top:66,st:2.2,gr:6.6,col:0x27c2ff,gl:0x27c2ff,w:1.9,l:4.5,rwd:0}];
const SP = cars;

export function createGame(root) {
  const listeners = new AbortController();
  const timeouts = new Set();
  const intervals = new Set();
  let frameId;
  const listen = (name, callback) => window.addEventListener(name, callback, { signal: listeners.signal });
  const later = (callback, delay) => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      callback();
    }, delay);
    timeouts.add(id);
  };
  const repeat = (callback, delay) => intervals.add(window.setInterval(callback, delay));
  const scheduleFrame = () => {
    frameId = window.requestAnimationFrame(frame);
  };

  const $=s=>root.querySelector(s),PI=Math.PI,cl=(v,a,b)=>Math.min(b,Math.max(a,v)),rn=(a,b)=>a+Math.random()*(b-a),ad=d=>Math.atan2(Math.sin(d),Math.cos(d));
  const R=new T.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,1.75));R.setSize(innerWidth,innerHeight);root.prepend(R.domElement);
  const S=new T.Scene(),C=new T.PerspectiveCamera(66,innerWidth/innerHeight,.1,500);S.background=new T.Color(0x07080d);S.fog=new T.Fog(0x07080d,30,230);
  S.add(new T.HemisphereLight(0x7080b8,0x201810,.8));const moon=new T.DirectionalLight(0x8fa0d0,.35);moon.position.set(-40,80,30);S.add(moon);
  const carL=new T.PointLight(0xffa860,1.3,45);S.add(carL);
  [[60,15,0xff7a30],[230,60,0x30c8ff],[100,200,0xff7a30],[-70,170,0x30c8ff]].forEach(([x,z,c])=>{const l=new T.PointLight(c,1.5,130);l.position.set(x,14,z);S.add(l)});
  function cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c}
  function tex(c,rx=1,ry=1){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t}
  // ---- track
  const CPt=[[0,0],[100,0],[200,-15],[270,25],[290,100],[250,170],[170,185],[130,140],[80,160],[60,230],[-10,260],[-90,230],[-110,150],[-60,100],[-90,40],[-50,-10]].map(([x,z])=>new T.Vector3(x,0,z));
  const curve=new T.CatmullRomCurve3(CPt,true,'centripetal');curve.arcLengthDivisions=3000;
  const N=600,SPd=curve.getSpacedPoints(N),LEN=curve.getLength(),DS=LEN/N,HW=8,WALL=11.5,TOT=3,FIN=N*(TOT+1);
  const CX=[],CZ=[],TX=[],TZ=[],KS=[];
  for(let i=0;i<N;i++){CX[i]=SPd[i].x;CZ[i]=SPd[i].z}
  for(let i=0;i<N;i++){const a=(i+1)%N,b=(i+N-1)%N,dx=CX[a]-CX[b],dz=CZ[a]-CZ[b],l=Math.hypot(dx,dz);TX[i]=dx/l;TZ[i]=dz/l}
  for(let i=0;i<N;i++){const a=(i+4)%N,b=(i+N-4)%N;KS[i]=ad(Math.atan2(TX[a],TZ[a])-Math.atan2(TX[b],TZ[b]))/(8*DS)}
  const VL=KS.map(k=>Math.min(70,Math.sqrt(26/Math.max(Math.abs(k),1e-4))));
  for(let r=0;r<3;r++)for(let i=N*2;i>=0;i--){const a=i%N,b=(i+1)%N;VL[a]=Math.min(VL[a],Math.sqrt(VL[b]*VL[b]+2*38*DS))}
  function near(x,z,h){let bi=h,bd=1e9;for(let k=-40;k<=40;k++){const i=(h+k+N)%N,d=(x-CX[i])**2+(z-CZ[i])**2;if(d<bd){bd=d;bi=i}}return bi}
  function strip(a,ya,b,yb,mat,vs){const pos=[],uv=[],ix=[];for(let i=0;i<=N;i++){const j=i%N,nx=TZ[j],nz=-TX[j];pos.push(CX[j]+nx*a,ya,CZ[j]+nz*a,CX[j]+nx*b,yb,CZ[j]+nz*b);uv.push(0,i*DS/vs,1,i*DS/vs);if(i<N){const k=i*2;ix.push(k,k+1,k+2,k+1,k+3,k+2)}}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();S.add(new T.Mesh(g,mat))}
  const DB=T.DoubleSide;
  strip(-HW,.02,HW,.02,new T.MeshStandardMaterial({map:tex(cv(256,256,(g,w,h)=>{g.fillStyle='#2a2b31';g.fillRect(0,0,w,h);for(let i=0;i<3500;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},.05)`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}g.fillStyle='#e8e8e8';g.fillRect(6,0,6,h);g.fillRect(w-12,0,6,h);g.fillStyle='#ffd24a';g.fillRect(w/2-2,0,4,h/2)})),roughness:.8,side:DB}),16);
  const cm=new T.MeshStandardMaterial({map:tex(cv(32,64,g=>{g.fillStyle='#d01a2a';g.fillRect(0,0,32,32);g.fillStyle='#eee';g.fillRect(0,32,32,32)})),side:DB});strip(HW,.03,HW+1.4,.03,cm,5);strip(-HW,.03,-HW-1.4,.03,cm,5);
  const wm=new T.MeshStandardMaterial({map:tex(cv(128,64,(g,w,h)=>{g.fillStyle='#101014';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){g.fillStyle=x%64?'#c8102e':'#ddd';g.fillRect(x+2,18,28,28)}})),side:DB});
  strip(WALL,0,WALL,1.1,wm,8);strip(-WALL,0,-WALL,1.1,wm,8);
  strip(WALL,1.1,WALL,1.25,new T.MeshBasicMaterial({color:0xff5a1f,side:DB}),8);strip(-WALL,1.1,-WALL,1.25,new T.MeshBasicMaterial({color:0x27c2ff,side:DB}),8);
  const gt=tex(cv(64,64,()=>{}),30,300);const gtc=cv(64,64,(g)=>{g.fillStyle='#0e0f13';g.fillRect(0,0,64,64);for(let i=0;i<500;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.06})`;g.fillRect(Math.random()*64,Math.random()*64,2,2)}});
  const grd=new T.Mesh(new T.PlaneGeometry(1400,1400),new T.MeshStandardMaterial({map:tex(gtc,90,90),roughness:1}));grd.rotation.x=-PI/2;grd.position.set(100,-.02,120);S.add(grd);
  // finish line + gantry
  {const g=new T.Group(),h0=Math.atan2(TX[0],TZ[0]);g.position.set(CX[0],0,CZ[0]);g.rotation.y=h0;
   const ch=new T.Mesh(new T.PlaneGeometry(16,2.4),new T.MeshBasicMaterial({map:tex(cv(128,32,(c)=>{for(let x=0;x<16;x++)for(let y=0;y<4;y++){c.fillStyle=(x+y)%2?'#111':'#eee';c.fillRect(x*8,y*8,8,8)}}))}));ch.rotation.x=-PI/2;ch.position.y=.05;g.add(ch);
   const bm=new T.MeshStandardMaterial({color:0x15161c,metalness:.6,roughness:.4});[-1,1].forEach(q=>{const p=new T.Mesh(new T.BoxGeometry(.6,9,.6),bm);p.position.set(q*(HW+2),4.5,0);g.add(p)});
   const tb=new T.Mesh(new T.BoxGeometry(HW*2+4,1.8,.5),bm);tb.position.y=9;g.add(tb);
   const tx=new T.MeshBasicMaterial({map:tex(cv(512,64,(c,w,h)=>{c.fillStyle='#07080d';c.fillRect(0,0,w,h);c.fillStyle='#ff5a1f';c.font='800 40px Unbounded,sans-serif';c.textAlign='center';c.fillText('START / FINISH',w/2,46)}))});
   [.27,-.27].forEach((z,i)=>{const p=new T.Mesh(new T.PlaneGeometry(HW*2+3.6,1.6),tx);p.position.set(0,9,z);p.rotation.y=i?PI:0;g.add(p)});S.add(g)}
  // poles with light beams
  {const M=Math.floor(LEN/60),pm=new T.InstancedMesh(new T.CylinderGeometry(.15,.2,10,6),new T.MeshStandardMaterial({color:0x1a1b22}),M),hm=new T.InstancedMesh(new T.BoxGeometry(1.6,.3,.8),new T.MeshBasicMaterial({color:0xfff0c8}),M),bmm=new T.InstancedMesh(new T.ConeGeometry(7,22,16,1,true),new T.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:.05,blending:T.AdditiveBlending,depthWrite:false,side:DB}),M),d=new T.Object3D();
   for(let k=0;k<M;k++){const i=Math.floor(k*60/DS)%N,sd=k%2?1:-1,x=CX[i]+TZ[i]*sd*(WALL+3),z=CZ[i]-TX[i]*sd*(WALL+3);d.rotation.set(0,0,0);d.position.set(x,5,z);d.updateMatrix();pm.setMatrixAt(k,d.matrix);d.position.set(x,10.1,z);d.updateMatrix();hm.setMatrixAt(k,d.matrix);d.position.set(x,-1,z);d.updateMatrix();bmm.setMatrixAt(k,d.matrix)}S.add(pm,hm,bmm)}
  // industrial skyline
  {const wc=cv(64,128,(g,w,h)=>{g.fillStyle='#14151b';g.fillRect(0,0,w,h);for(let y=6;y<h;y+=12)for(let x=6;x<w;x+=12)if(Math.random()<.25){g.fillStyle=Math.random()<.5?'#ff9a4a':'#4fd0ff';g.fillRect(x,y,6,6)}}),t=tex(wc),m=new T.MeshStandardMaterial({color:0x888888,map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.9});
   for(let n=0;n<90;n++){const x=rn(-250,450),z=rn(-200,450);let ok=1;for(let i=0;i<N;i+=5)if(Math.hypot(x-CX[i],z-CZ[i])<34){ok=0;break}if(!ok)continue;const w=rn(10,24),h=rn(8,45),b=new T.Mesh(new T.BoxGeometry(w,h,w),m);b.position.set(x,h/2,z);S.add(b)}}
  // ---- cars

  function makeCar(t,col){const s=SP[t],g=new T.Group(),b=new T.Group();g.add(b);g.b=b;col=col??s.col;
   const add=(geo,m,x,y,z,p=b)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);p.add(o);return o},bm=new T.MeshStandardMaterial({color:col,metalness:.6,roughness:.3}),dk=new T.MeshStandardMaterial({color:0x0b0d12,roughness:.3,metalness:.5});
   add(new T.BoxGeometry(s.w,.55,s.l),bm,0,.55,0);add(new T.BoxGeometry(s.w*.82,.45,s.l*.45),dk,0,1.05,-.3);add(new T.BoxGeometry(s.w*.2,.02,s.l*.9),new T.MeshBasicMaterial({color:0xffffff}),0,.84,0);
   add(new T.BoxGeometry(s.w*1.02,.08,.5),dk,0,1.3,-s.l/2+.2);[-1,1].forEach(q=>add(new T.BoxGeometry(.08,.35,.12),dk,q*s.w*.35,1.12,-s.l/2+.25));
   const hm=new T.MeshBasicMaterial({color:0xfff2c0}),tm=new T.MeshBasicMaterial({color:0xff2020});[-1,1].forEach(q=>{add(new T.BoxGeometry(.45,.18,.1),hm,q*s.w*.33,.6,s.l/2);add(new T.BoxGeometry(.45,.16,.1),tm,q*s.w*.33,.62,-s.l/2)});
   const gl=add(new T.PlaneGeometry(s.w*1.2,s.l*1.1),new T.MeshBasicMaterial({color:s.gl,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false}),0,.1,0);gl.rotation.x=-PI/2;
   g.wh=[];const wm_=new T.MeshStandardMaterial({color:0x0a0a0a});[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([q,z],i)=>{const pv=new T.Group();pv.position.set(q*s.w/2,.36,z*s.l*.32);g.add(pv);const w=add(new T.CylinderGeometry(.36,.36,.32,14),wm_,0,0,0,pv);w.rotation.z=PI/2;g.wh.push({pv,w,f:i<2})});return g}
  // ---- particles
  const soft=new T.CanvasTexture(cv(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}));
  function PS(n,size,map,drag,grav){const g=new T.BufferGeometry(),pp=new Float32Array(n*3).fill(-99),cc=new Float32Array(n*3),vv=new Float32Array(n*3),bb=new Float32Array(n*3),ll=new Float32Array(n),l0=new Float32Array(n);g.setAttribute('position',new T.BufferAttribute(pp,3));g.setAttribute('color',new T.BufferAttribute(cc,3));
   const p=new T.Points(g,new T.PointsMaterial({size,map,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));p.frustumCulled=false;S.add(p);let k=0;
   return{emit(x,y,z,vx,vy,vz,col,life){const i=k++%n;pp.set([x,y,z],i*3);vv.set([vx,vy,vz],i*3);const c=new T.Color(col);bb.set([c.r,c.g,c.b],i*3);ll[i]=l0[i]=life},
   upd(dt){for(let i=0;i<n;i++){const j=i*3;if(ll[i]>0){ll[i]-=dt;const f=Math.max(0,ll[i]/l0[i]);vv[j]*=1-drag*dt;vv[j+2]*=1-drag*dt;vv[j+1]+=grav*dt;pp[j]+=vv[j]*dt;pp[j+1]+=vv[j+1]*dt;pp[j+2]+=vv[j+2]*dt;cc[j]=bb[j]*f;cc[j+1]=bb[j+1]*f;cc[j+2]=bb[j+2]*f}else pp[j+1]=-99}g.attributes.position.needsUpdate=g.attributes.color.needsUpdate=true}}}
  const SM=PS(900,4.2,soft,1.1,1.2),SK=PS(500,.35,null,.4,-16);
  const smoke=(x,z,k=1)=>SM.emit(x+rn(-.3,.3),.4,z+rn(-.3,.3),rn(-1.2,1.2),rn(.4,1.6),rn(-1.2,1.2),0x55565f,rn(.9,1.7)*k);
  const spark=(x,y,z,n,sp,col=0xffb040)=>{for(let i=0;i<n;i++)SK.emit(x,y,z,rn(-sp,sp),rn(0,sp*.7),rn(-sp,sp),col,rn(.3,.8))};
  const SKM=new T.InstancedMesh(new T.PlaneGeometry(.34,1),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.55,depthWrite:false}),900),dm=new T.Object3D();dm.rotation.order='YXZ';let ski=0;
  for(let i=0;i<900;i++){dm.position.set(0,-50,0);dm.updateMatrix();SKM.setMatrixAt(i,dm.matrix)}S.add(SKM);
  const skid=(x,z,h)=>{dm.position.set(x,.045,z);dm.rotation.set(-PI/2,h,0);dm.updateMatrix();SKM.setMatrixAt(ski++%900,dm.matrix);SKM.instanceMatrix.needsUpdate=true};
  // ---- audio
  let AC,E1,E2,EG,SG,MUS,muted=0;
  function audio(){if(AC)return;try{AC=new AudioContext()}catch(e){return}
   E1=AC.createOscillator();E2=AC.createOscillator();E1.type='sawtooth';E2.type='square';const ws=AC.createWaveShaper(),cr=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cr[i]=Math.tanh(x*3)}ws.curve=cr;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;EG=AC.createGain();EG.gain.value=0;E1.connect(ws);E2.connect(ws);ws.connect(lp);lp.connect(EG);EG.connect(AC.destination);E1.start();E2.start();
   const nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;NB=nb;
   const sc=AC.createBufferSource();sc.buffer=nb;sc.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1900;bp.Q.value=3;SG=AC.createGain();SG.gain.value=0;sc.connect(bp);bp.connect(SG);SG.connect(AC.destination);sc.start();
   MUS=AC.createGain();MUS.gain.value=.3;MUS.connect(AC.destination);
   const step=60/136/4,bass=[55,55,0,55,65.4,0,55,0,49,49,0,49,58.3,0,49,65.4];let n=0,nt=AC.currentTime+.1;
   repeat(()=>{while(nt<AC.currentTime+.25){const i=n%16,t=nt;
    if(bass[i]){const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o.frequency.value=bass[i];f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(120,t+step*.9);g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+step*.95);o.connect(f);f.connect(g);g.connect(MUS);o.start(t);o.stop(t+step)}
    if(i%4===0){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);g.gain.setValueAtTime(.8,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(MUS);o.start(t);o.stop(t+.22)}
    if(i%2){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);s.connect(f);f.connect(g);g.connect(MUS);s.start(t);s.stop(t+.06)}
    n++;nt+=step}},60)}
  let NB;
  function snd(f,d,ty='sine',v=.15,sw=0){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(sw)o.frequency.exponentialRampToValueAtTime(sw,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(t+d)}
  function thud(v){if(!AC)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;f.type='lowpass';f.frequency.value=700;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.3);s.connect(f);f.connect(g);g.connect(AC.destination);s.start();snd(80,.25,'sine',v,35)}
  // ---- state
  const TYPE={t:0},P={x:0,z:0,h:0,vx:0,vz:0,w:0,nit:100,idx:0,laps:0,pi:0,type:0},AI=[];let car=makeCar(0);S.add(car);
  const hl=new T.SpotLight(0xfff0d0,2,80,.55,.5);hl.position.set(0,1,2);hl.target.position.set(0,0,25);car.add(hl,hl.target);
  for(let i=0;i<7;i++){const a={m:makeCar(i%3,new T.Color().setHSL(rn(0,1),.75,.5).getHex()),s:0,v:0,o:0,sk:rn(.86,.99),top:rn(50,62),ph:rn(0,6),fin:0,x:0,z:0};S.add(a.m);AI.push(a)}
  let mode='menu',ct=0,raceT=0,lapT=0,bestLap=0,tt=0,shake=0,ca=0,pProg=0,ds=0,dd=0,driftTot=0,prevTh=0,lastBeep=9,finT=0,fr=0;
  const K={};
  const pop=t=>{const e=$('#pp');e.textContent=t;e.classList.remove('s');void e.offsetWidth;e.classList.add('s')};
  const slot=k=>({s:N-(14+Math.floor(k/2)*8)/DS,o:(k%2?-1:1)*3.6});
  function posOf(s,o){const i=Math.floor(s)%N,f=s-Math.floor(s),j=(i+1)%N;return{x:CX[i]+(CX[j]-CX[i])*f+TZ[i]*o,z:CZ[i]+(CZ[j]-CZ[i])*f-TX[i]*o,h:Math.atan2(TX[i],TZ[i]),i}}
  function setCar(t){S.remove(car);car=makeCar(t);P.type=t;car.add(hl,hl.target);S.add(car)}
  function grid(){const a=AI.slice();let n=0;for(let k=0;k<8;k++){if(k===6){const p=slot(k),q=posOf(p.s,p.o);Object.assign(P,{x:q.x,z:q.z,h:q.h,vx:0,vz:0,w:0,nit:100,idx:q.i,laps:0,pi:q.i});continue}const p=slot(k),A=a[n++];A.s=p.s;A.o=p.o;A.v=0;A.fin=0}
   raceT=0;lapT=0;bestLap=0;ds=0;driftTot=0;finT=0;lastLap=0}
  function menu(msg){const o=$('#ov');o.style.display='flex';void o.offsetWidth;o.style.opacity=1;if(msg)$('#ovp').innerHTML=msg;mode='menu';grid()}
  const start=()=>{audio();$('#ov').style.opacity=0;later(()=>{if(mode!=='menu')$('#ov').style.display='none'},500);grid();mode='count';ct=4;lastBeep=9};
  listen('keydown',e=>{const k=e.key.toLowerCase();K[k]=1;if([' ','arrowup','arrowdown'].includes(k))e.preventDefault();if(k==='m'&&MUS){muted=!muted;MUS.gain.value=muted?0:.3}if(k==='r'&&mode==='race'){const i=near(P.x,P.z,P.idx),q=posOf(i,0);Object.assign(P,{x:q.x,z:q.z,h:q.h,vx:0,vz:0,w:0})}});
  listen('keyup',e=>K[e.key.toLowerCase()]=0);listen('resize',()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()});
  // minimap
  let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;for(let i=0;i<N;i++){mnx=Math.min(mnx,CX[i]);mxx=Math.max(mxx,CX[i]);mnz=Math.min(mnz,CZ[i]);mxz=Math.max(mxz,CZ[i])}
  const MMs=Math.min(180/(mxx-mnx),130/(mxz-mnz)),MM=$('#mm').getContext('2d'),mpx=(x,z)=>[(x-mnx)*MMs+10,(z-mnz)*MMs+10];
  const MB=cv(200,150,g=>{g.strokeStyle='#555a6a';g.lineWidth=5;g.beginPath();for(let i=0;i<=N;i+=3){const[a,b]=mpx(CX[i%N],CZ[i%N]);i?g.lineTo(a,b):g.moveTo(a,b)}g.closePath();g.stroke()});
  function mini(){MM.clearRect(0,0,200,150);MM.drawImage(MB,0,0);AI.forEach(a=>{const[x,y]=mpx(a.x,a.z);MM.fillStyle='#8a8f9e';MM.beginPath();MM.arc(x,y,3,0,7);MM.fill()});const[x,y]=mpx(P.x,P.z);MM.fillStyle='#ff5a1f';MM.beginPath();MM.arc(x,y,5,0,7);MM.fill()}
  // ---- loop
  let last=performance.now(),ht=0;const cp=new T.Vector3();
  function frame(now){const dt=Math.min(.05,(now-last)/1e3);last=now;tt+=dt;const s=SP[P.type],racing=mode==='race',live=racing||mode==='fin';
   const th=(mode==='fin'?0:(K.w||K.arrowup?1:0)),br=mode==='fin'?0:(K.s||K.arrowdown?1:0),st=mode==='fin'||mode==='menu'?0:((K.a||K.arrowleft?1:0)-(K.d||K.arrowright?1:0)),hb=mode!=='fin'&&K[' '],nit=racing&&K.shift&&P.nit>2&&th>0;
   const fx=Math.sin(P.h),fz=Math.cos(P.h),lx=Math.cos(P.h),lz=-Math.sin(P.h);let vf=P.vx*fx+P.vz*fz,vl=P.vx*lx+P.vz*lz;
   if(mode==='count'){ct-=dt;const n=Math.ceil(ct-.9);if(n!==lastBeep&&n>=1&&n<=3){lastBeep=n;pop(String(n));snd(440,.18,'square',.15)}if(ct<=.9){mode='race';pop('GO!');snd(880,.5,'square',.2);lastT=0}}
   if(mode==='count'&&th){for(let q=-1;q<=1;q+=2){smoke(P.x-fx*1.6+lx*q*.9,P.z-fz*1.6+lz*q*.9);if(Math.random()<.5)skid(P.x-fx*1.6+lx*q*.9,P.z-fz*1.6+lz*q*.9,P.h)}}
   if(live){const top=s.top*(nit?1.25:1);
    if(th>0){if(vf<top)vf+=s.acc*(nit?1.8:1)*dt*(1-.55*Math.max(0,vf/top))}else if(br)vf-=(vf>0?48:s.acc*.6)*dt;
    vf*=Math.exp(-.2*dt);const ni=near(P.x,P.z,P.idx),dl=(P.x-CX[ni])*TZ[ni]-(P.z-CZ[ni])*TX[ni];
    if(Math.abs(dl)>HW+1.4){vf*=Math.exp(-1.3*dt);vl*=Math.exp(-1.3*dt);if(Math.hypot(P.vx,P.vz)>8&&Math.random()<.5)SM.emit(P.x,.3,P.z,rn(-2,2),rn(1,2),rn(-2,2),0x4a3a2a,1.1)}
    let gr=s.gr;if(hb)gr*=.18;else if(th>0&&vf>10&&st&&s.rwd)gr*=.62;if(Math.abs(vl)>6)gr*=.75;vl*=Math.exp(-gr*dt);vf*=Math.exp(-Math.abs(vl)*.012*dt);if(hb)vf*=Math.exp(-.35*dt);
    P.nit=nit?P.nit-30*dt:Math.min(100,P.nit+8*dt);
    const sf=cl(Math.abs(vf)/8,0,1)*(vf>=0?1:-1),tw=st*s.st*sf*(1-cl(Math.abs(vf)/110,0,.4))*(hb?1.4:1);P.w+=(tw-P.w)*Math.min(1,dt*(hb?4:9));P.w+=cl(vl,-12,12)*.012*(Math.abs(vf)>8?1:0);P.h+=P.w*dt;
    P.vx=fx*vf+lx*vl;P.vz=fz*vf+lz*vl;P.x+=P.vx*dt;P.z+=P.vz*dt;
    const i2=near(P.x,P.z,ni),d2=(P.x-CX[i2])*TZ[i2]-(P.z-CZ[i2])*TX[i2];P.idx=i2;
    if(Math.abs(d2)>WALL-1){const sg=Math.sign(d2),nx=TZ[i2]*sg,nz=-TX[i2]*sg;P.x-=nx*(Math.abs(d2)-(WALL-1));P.z-=nz*(Math.abs(d2)-(WALL-1));const vn=P.vx*nx+P.vz*nz;if(vn>0){P.vx-=1.4*vn*nx;P.vz-=1.4*vn*nz;P.vx*=.9;P.vz*=.9;if(vn>3){shake=Math.min(.6,vn*.04);thud(Math.min(.5,vn*.03));$('#fl').style.opacity=Math.min(1,vn*.08);later(()=>$('#fl').style.opacity=0,120)}spark(P.x+nx,.6,P.z+nz,Math.floor(10+vn*2),6)}}
    if(Math.hypot(P.vx,P.vz)>10&&Math.abs(d2)>WALL-1.4&&Math.random()<.7)spark(P.x+TZ[i2]*Math.sign(d2),.5,P.z-TX[i2]*Math.sign(d2),3,4,0xffd080);
    if(P.pi>N*.85&&i2<N*.15)P.laps++;else if(P.pi<N*.15&&i2>N*.85)P.laps--;P.pi=i2;
    if(P.laps>=1&&P.pi<6&&P.pi>=0&&lastLap!==P.laps){lastLap=P.laps;if(P.laps>1&&P.laps<=TOT+1){const lt=raceT-lapT;bestLap=bestLap?Math.min(bestLap,lt):lt;pop('ТОЙРОГ '+lt.toFixed(1)+'с')}lapT=raceT}
    if(racing)raceT+=dt;
    if(Math.abs(vl)>4&&vf>9&&Math.abs(d2)<HW+1.4){ds+=Math.abs(vl)*dt*14*(1+Math.min(3,dd*.4));dd+=dt;$('#dr').style.opacity=1;$('#dr').textContent='ДРИФТ '+Math.floor(ds)+'  ×'+(1+Math.min(3,Math.floor(dd*.4)))}else if(ds>0){dd=0;if(ds>30){driftTot+=Math.floor(ds);pop('ДРИФТ +'+Math.floor(ds));snd(700,.2,'sine',.1,1000)}ds=0;$('#dr').style.opacity=0}
    if(Math.abs(vl)>3.5&&Math.hypot(vf,vl)>8||hb&&vf>8){for(let q=-1;q<=1;q+=2){const rx=P.x-fx*1.5+lx*q*.9,rz=P.z-fz*1.5+lz*q*.9;smoke(rx,rz);smoke(rx,rz);skid(rx,rz,P.h+Math.atan2(vl,vf)*.0)}}
    if(nit)for(let q=0;q<3;q++)SK.emit(P.x-fx*2.5,.6,P.z-fz*2.5,-fx*8+rn(-1,1),rn(0,1),-fz*8+rn(-1,1),0x66ccff,.35);
    if(!th&&prevTh&&vf>35){spark(P.x-fx*2.5,.7,P.z-fz*2.5,10,3,0xff8830);thud(.12)}prevTh=th;
    pProg=P.laps*N+P.pi}
   const sp=Math.hypot(P.vx,P.vz);
   // AI
   AI.forEach(a=>{if(racing||mode==='fin'){const i=Math.floor(a.s)%N,tv=Math.min(VL[i]*a.sk,a.top)*(1+cl((pProg-a.s)*DS/400,-.05,.1));a.v=a.v<tv?Math.min(tv,a.v+24*dt):Math.max(tv,a.v-45*dt);a.s+=a.v*dt/DS;if(!a.fin&&a.s>=FIN)a.fin=raceT||1}
    a.o+=(Math.sin(tt*.25+a.ph)*3.5-a.o)*dt*1.5;const q=posOf(a.s,a.o),k=KS[q.i],sl=cl(k*a.v*.05,-.5,.5);a.x=q.x;a.z=q.z;a.m.position.set(q.x,0,q.z);a.m.rotation.y=q.h+sl;
    if(Math.abs(k)*a.v>1.1&&Math.random()<.7){smoke(q.x-Math.sin(q.h)*1.5,q.z-Math.cos(q.h)*1.5);if(Math.random()<.3)skid(q.x-Math.sin(q.h)*1.5,q.z-Math.cos(q.h)*1.5,q.h+sl)}
    if(live){const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);if(d<2.7&&d>0){P.x=a.x+dx/d*2.7;P.z=a.z+dz/d*2.7;P.vx=P.vx*.7+dx/d*5;P.vz=P.vz*.7+dz/d*5;a.v*=.85;shake=.3;thud(.2);spark(a.x+dx/2,.7,a.z+dz/2,14,5)}}
    a.m.wh.forEach(w=>w.w.rotation.x+=a.v*dt/.36)});
   // player visuals
   car.position.set(P.x,0,P.z);car.rotation.y=P.h;car.b.rotation.z=cl(vl*.012,-.12,.12);car.b.rotation.x=cl(-th*.03+br*.03,-.05,.05);car.wh.forEach(w=>{w.w.rotation.x+=vf*dt/.36;if(w.f)w.pv.rotation.y=st*.45});carL.position.set(P.x,6,P.z);
   SM.upd(dt);SK.upd(dt);
   // camera
   if(mode==='menu'){const q=slot(6),p=posOf(q.s,q.o);C.position.set(P.x+Math.sin(tt*.4)*7.5,2.6,P.z+Math.cos(tt*.4)*7.5);C.lookAt(P.x,.8,P.z);ca=P.h}
   else{ca+=ad((sp>8?Math.atan2(P.vx*.5+fx*sp*.5,P.vz*.5+fz*sp*.5):P.h)-ca)*Math.min(1,dt*3.5);shake=Math.max(0,shake-dt*1.2);cp.set(P.x-Math.sin(ca)*(8+sp*.03),3+sp*.01,P.z-Math.cos(ca)*(8+sp*.03));C.position.lerp(cp,1-Math.exp(-dt*8));C.position.x+=rn(-shake,shake)*.4;C.position.y+=rn(-shake,shake)*.4;C.lookAt(P.x+fx*6,1.1,P.z+fz*6)}
   C.fov+=(64+sp*.35+(nit?12:0)-C.fov)*dt*4;C.updateProjectionMatrix();
   // audio
   if(AC){const g=Math.min(5,Math.floor(sp/(s.top/5.5))),rpm=cl((sp-g*s.top/5.5)/(s.top/5.5),0,1)*.75+.25+(th?.1:0);E1.frequency.value=38+rpm*100;E2.frequency.value=(38+rpm*100)*.5;EG.gain.value=mode==='menu'?0:.07+th*.05;SG.gain.value=mode==='menu'?0:Math.min(.16,Math.max(0,(Math.abs(vl)-3)/14))*(hb||Math.abs(vl)>3?1:0)}
   // hud
   ht+=dt;if(ht>.1){ht=0;const rk=1+AI.filter(a=>a.s>pProg).length,lap=cl(P.laps,1,TOT);$('#ps').innerHTML=rk+'<small>/8</small>';$('#lp').innerHTML=`Тойрог ${lap}/${TOT}<br>Цаг ${raceT.toFixed(1)}с${bestLap?'<br>Шилдэг '+bestLap.toFixed(1)+'с':''}`;
    const g=Math.min(5,Math.floor(sp/(s.top/5.5)));$('#sp').innerHTML=Math.round(sp*3.6)+'<small>км/ц · '+(g+1)+'-р араа</small>';$('#rp i').style.width=cl((sp-g*s.top/5.5)/(s.top/5.5),0,1)*100+'%';$('#nt i').style.width=P.nit+'%';mini();
    if(racing&&pProg>=FIN){mode='fin';const place=1+AI.filter(a=>a.fin&&a.fin<raceT).length;finT=raceT;later(()=>menu(`<b style="font:800 28px Unbounded">${place}-Р БАЙР</b><br>Нийт цаг ${finT.toFixed(1)}с · Шилдэг тойрог ${bestLap.toFixed(1)}с · Дрифтийн оноо ${driftTot}<br>Машинаа сольж дахин уралд.`),2500);pop(place+'-Р БАЙР!')}}
   R.render(S,C);scheduleFrame()}
  let lastLap=0,lastT=0;
  grid();scheduleFrame();

  return {
    select(index) {
      setCar(index);
      audio();
    },
    start,
    dispose() {
      listeners.abort();
      cancelAnimationFrame(frameId);
      timeouts.forEach(id => clearTimeout(id));
      intervals.forEach(id => clearInterval(id));
      if (AC) void AC.close();
      R.dispose();
      R.forceContextLoss();
      R.domElement.remove();
    },
  };
}
