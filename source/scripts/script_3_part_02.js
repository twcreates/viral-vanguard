  if(Wp.pierce){const hs=rc.intersectObjects(targets(),false),seen=new Set();let blocks=0,end=null;
   for(const h of hs){if(h.object.userData.en){const e=h.object.userData.e;if(!seen.has(e)){seen.add(e);const dm=hitDmg(e,h);BLOOD.hit(h.point,rc.ray.direction,dm/30);hurt(e,dm)}}else if(h.object.userData.p2){if(!seen.has('p2')){seen.add('p2');CO.hitP2(h)}}else if(h.object.userData.glass){CITY.shatter(h.object,h.point)}else{destroy(h.point,Wp.brk);FX.impact(h.point,hNrm(h),Wp.col,1);if(++blocks>=3){end=h.point;break}}}
   tracer(end||farPt());continue}
  const h=rc.intersectObjects(targets(),false)[0];
  if(Wp.well){const pt=h?h.point:farPt();tracer(pt);if(h&&h.object.userData.en){const dm=hitDmg(h.object.userData.e,h);BLOOD.hit(h.point,rc.ray.direction,dm/30);hurt(h.object.userData.e,dm)}else if(h&&h.object.userData.glass)CITY.shatter(h.object,pt);else if(h)destroy(pt,Wp.brk);addWell(pt);continue}
  if(!h){tracer(Wp.range?rc.ray.origin.clone().addScaledVector(rc.ray.direction,Wp.range):farPt());continue}
  tracer(h.point);
  if(Wp.boom)explode(h.point,Wp.dmg,Wp.boom);
  else if(h.object.userData.en){const e=h.object.userData.e,dm=hitDmg(e,h);if(Wp.chill)e.chill=Wp.chill;BLOOD.hit(h.point,rc.ray.direction,dm/30);hurt(e,dm);if(Wp.chain)chainZap(e,dm)}
  else if(h.object.userData.p2)CO.hitP2(h);
  else if(h.object.userData.glass)CITY.shatter(h.object,h.point);
  else{destroy(h.point,Wp.brk);FX.impact(h.point,hNrm(h),Wp.col,Wp.pel>1?.55:1)}}
 rc.far=100}
function blast(){if(!go||bcd>0)return;dsrc='BLAST';rc.far=100;bcd=5*(1-(Ar.cdr||0));shake=.5;aimAt(0,0);const h=rc.intersectObjects(targets(),false)[0],pt=h?h.point:farPt();AUD.boom(pt,1.25);tracer(pt,null,0xff2bd6);destroy(pt,5.5);burst(pt,30,0xff2bd6,14);[...EN].forEach(e=>{if(e.m.position.distanceTo(pt)<8)hurt(e,70)})}
function reload(){if(rel<=0&&ammo<Wp.mag)rel=Wp.rl}
let dj=0,airT=0,padT=0;
function jump(){if(!go||stance)return;if(slideT>0&&ground){slideBurst();return}if(ground){V.y=11*(Ar.jmp||1);ground=0;dj=0;footstep(surfAt(),0,'jump',.8)}else if(!dj&&!(grap&&grap.pull)){dj=1;V.y=10*(Ar.jmp||1);burst(new T.Vector3(P.x,P.y+.1,P.z),10,0x21e6ff,5);beep(520,.14,'sine',.08)}}
function jumpBtn(){if(!go)return;if(stance>0){stance=0;return}if(grap&&grap.pull){const kx=V.x,kz=V.z,hang=grap.hang>0;endGrapple(11);if(hang){V.x=Math.sin(yaw)*7;V.z=Math.cos(yaw)*7}else{V.x=kx*.6;V.z=kz*.6}return}jump()}
function crouchDown(){if(!go)return;sprintLock=false;if(sprinting&&ground){slide();cdT=0;return}cdT=performance.now()}
function crouchUp(){if(cdT&&performance.now()-cdT<300)stance=stance===1?0:1;cdT=0}
const FB={hold:0,t:0,mode:'hip'};let adsOn=false,adsHeld=0,rmb=false;
function fireDown(){if(!go)return;FB.hold=1;FB.t=0;FB.mode=FMODE[Wp.id]||'hip';sprintLock=false;if(FB.mode==='onetap')fire()}
function fireUp(){if(FB.hold&&FB.mode==='release')fire();FB.hold=0}
function fireEngine(dt){if(FB.hold)FB.t+=dt;const m=FB.mode;
 trig=F.f>0||(FB.hold&&(m==='hip'||m==='ads'||m==='mixed'));
 adsW=(adsOn||adsHeld>0||rmb||(FB.hold&&(m==='ads'||m==='release'||(m==='mixed'&&FB.t>.25))))&&rel<=0&&swapT<=0&&slideT<=0;
 if(adsW||trig)sprintLock=false;
 const at=ADS_T[Wp.id]||.2;ads=adsW?Math.min(1,ads+dt/at):Math.max(0,ads-dt/(at*.8));
 if(trig)fire()}
function swapWeapon(to){if(!go||swapT>0)return;const n=to==null?cur^1:to;if(n===cur)return;slotAmmo[cur]=ammo;rel=0;burstN=0;spinT=0;FB.hold=0;adsOn=false;
 cur=n;Wp=slots[cur];ammo=slotAmmo[cur];buildGun();swapT=.5;fcd=0;beep(320,.08,'square',.05);updCard()}
function updCard(){$('wn').textContent=Wp.name.toUpperCase();$('w2').textContent=SHORT[slots[cur^1].id]||slots[cur^1].name}
function tactical(){if(!go||tacN<1)return;tacN--;if(tacT<=0)tacT=12;rc.far=16;aimAt(0,0);const h=rc.intersectObjects(targets(),false)[0],pt=h?h.point:rc.ray.origin.clone().addScaledVector(rc.ray.direction,14);rc.far=100;
 tracer(pt,null,0xffffff);burst(pt,26,0xffffff,10);beep(1400,.3,'sine',.12);shake=Math.max(shake,.15);for(const e of EN)if(e.m.position.distanceTo(pt)<7)e.stun=2.5}
function callStreak(i){if(!go)return;const s=STREAKS[i];if(SK.used[i]||SK.k<s.c)return;SK.used[i]=1;beep(520+i*180,.4,'triangle',.15);feed('<b>'+s.n+'</b> ONLINE');
 if(i===0){droneT=15;dshot=0}
 else if(i===1){rc.far=120;aimAt(0,0);const h=rc.intersectObjects(targets(),false)[0],pt=h?h.point:rc.ray.origin.clone().addScaledVector(rc.ray.direction,40);rc.far=100;pt.y=Math.max(pt.y,0);
  for(let k=0;k<3;k++){tracer(pt.clone().add(new T.Vector3((rnd()-.5)*2,0,(rnd()-.5)*2)),pt.clone().add(new T.Vector3((rnd()-.5)*4,45,(rnd()-.5)*4)),0xff2a3d);TR[TR.length-1].t=.45}
  dsrc='STRIKE';destroy(pt,4.5);burst(pt,40,0xff2a3d,16);shake=.7;[...EN].forEach(e=>{if(e.m.position.distanceTo(pt)<9)hurt(e,220)})}
 else{hp=maxHP;invT=6;healA=.9}
 if(SK.used.every(Boolean)){SK.k=0;SK.used=[0,0,0]}}
// ---- jet flame: soft additive plume (white-blue core, blue body, flicker, faint shock bands); length/brightness from uI
const JFLAME=(()=>{const V=`uniform float uT,uI,uL;varying float vH;varying vec3 vN,vV;varying vec2 vQ;
void main(){vec3 p=position;vH=clamp(-p.y/uL,0.,1.);float w=1.+.12*sin(uT*41.+p.y*9.)*vH;p.xz*=w;vQ=vec2(atan(p.z,p.x),p.y);
 vec4 mv=modelViewMatrix*vec4(p,1.);vV=normalize(-mv.xyz);vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}`;
 const F=`uniform float uT,uI,uC;uniform vec3 uCol;varying float vH;varying vec3 vN,vV;varying vec2 vQ;
float h1(float n){return fract(sin(n)*43758.5453);}
float nz(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);float n=i.x+i.y*57.;return mix(mix(h1(n),h1(n+1.),f.x),mix(h1(n+57.),h1(n+58.),f.x),f.y);}
void main(){float e=abs(dot(normalize(vN),normalize(vV)));float edge=pow(e,1.6);
 float fl=.75+.25*nz(vec2(vQ.x*2.,vH*7.-uT*18.))+.15*sin(uT*63.);
 float shock=1.+.35*uC*pow(max(0.,sin(vH*26.-uT*4.)),8.)*(1.-vH);
 float a=pow(1.-vH,1.35)*edge*fl*shock*uI;
 vec3 col=mix(vec3(.85,.95,1.),uCol,smoothstep(.0,.45,vH));col=mix(col,uCol*.6+vec3(.15,0.,.25),smoothstep(.6,1.,vH));
 vec3 o=col*a*(1.7+uC*1.2);gl_FragColor=vec4(o,clamp(max(o.r,max(o.g,o.b))*.8,0.,1.));}`;
 return(len,r0,r1,col,core)=>{const g=new T.CylinderGeometry(r0,r1,len,20,8,true);g.translate(0,-len/2,0);
  const u={uT:{value:0},uI:{value:1},uL:{value:len},uC:{value:core?1:0},uCol:{value:new T.Color(col)}};
  const m=new T.Mesh(g,new T.ShaderMaterial({uniforms:u,vertexShader:V,fragmentShader:F,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false}));
  m.material.blending=T.CustomBlending;m.material.blendSrc=T.OneFactor;m.material.blendDst=T.OneFactor;m.material.blendSrcAlpha=T.OneFactor;m.material.blendDstAlpha=T.OneFactor;
  m.frustumCulled=false;m.renderOrder=4;m.onBeforeRender=()=>{u.uT.value=performance.now()/1000};m.userData.u=u;return m}})();
// light-only blending: adds colour but leaves destination alpha untouched, so plumes stay clean over a transparent canvas
const addLight=m=>{m.onBeforeCompile=sh=>{if(sh.fragmentShader.indexOf('#include <fog_fragment>')>=0)sh.fragmentShader=sh.fragmentShader.replace(/#include <fog_fragment>\n}$/,'#include <fog_fragment>\ngl_FragColor=vec4(gl_FragColor.rgb*gl_FragColor.a,gl_FragColor.a);\n}')};m.blending=T.CustomBlending;m.blendEquation=T.AddEquation;m.blendSrc=T.OneFactor;m.blendDst=T.OneFactor;m.blendSrcAlpha=T.ZeroFactor;m.blendDstAlpha=T.OneFactor;m.premultipliedAlpha=false;return m};
// a plume = soft outer flame + narrow bright core + a little nozzle glow disc
function jetPlume(len,r,col){const g=new T.Group(),o=JFLAME(len,r,r*1.9,col,false),c=JFLAME(len*.55,r*.55,r*.25,col,true);addLight(o.material);addLight(c.material);g.add(o,c);
 const gt=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),rg=x.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.35,'rgba(140,190,255,.6)');rg.addColorStop(1,'rgba(40,80,255,0)');x.fillStyle=rg;x.fillRect(0,0,64,64);const t=new T.CanvasTexture(cv);t.generateMipmaps=false;t.minFilter=T.LinearFilter;return t})();
 const sp=new T.Sprite(addLight(new T.SpriteMaterial({map:gt,color:col,transparent:true,depthWrite:false,toneMapped:false})));sp.scale.setScalar(r*5);sp.position.y=-r*.4;g.add(sp);
 g.userData.set=(k,t)=>{const fl=.9+.1*Math.sin(t*37)+.06*Math.sin(t*91);o.userData.u.uI.value=k*fl;c.userData.u.uI.value=k*fl;o.scale.y=.35+.65*k;c.scale.y=.35+.65*k;sp.material.opacity=Math.min(1,k*1.2)*fl;sp.visible=k>.01;o.visible=c.visible=k>.01};
 return g}

// ---- jetpack (Warden Mk III and Ascendant Mk IV): hold jump in mid-air to thrust; fuel drains while burning and refills on the ground
const JET={fuel:1,on:false,k:0,hold:false,cool:0,t:0,snd:null,dust:0};
const jetOK=()=>Ar&&(Ar.tier||0)>=2;
const JF=(()=>{const d=document.createElement('div');d.id='jfuel';d.innerHTML='<i></i><b>JET</b>';document.body.appendChild(d);return d})();
function jetStep(dt){if(!jetOK()){JET.on=false;return}
 const want=!!((JET.hold||K.Space)&&!ground&&!stance&&JET.fuel>0&&(airT>.18||V.y<1.5)&&!LEDGE&&!(grap&&grap.pull));
 if(want&&!JET.on&&JET.fuel<.08)return;
 if(want!==JET.on){JET.on=want;jetSnd(want?1:0);if(!want)AUD.jetCool()}
 const mk4=Ar.tier>=3,acc=mk4?40:36,cap=mk4?8.5:7;
 if(JET.on){V.y=Math.min(cap,V.y+acc*dt*(V.y<0?1.6:1));JET.fuel=Math.max(0,JET.fuel-dt/(mk4?3.4:2.6));JET.cool=.5;
  shake=Math.max(shake,.02)}
 else{JET.cool-=dt;if(ground&&JET.cool<=0)JET.fuel=Math.min(1,JET.fuel+dt/(mk4?2.2:2.8))}}
// first-person plume visuals (behind and below the camera, seen when looking down), ground glow, dust, HUD gauge
const JFX=(()=>{const g=new T.Group();S.add(g);const pl=[];for(const s of[-1,1]){const p=jetPlume(1.35,.08,0x4f8cff);p.position.set(s*.26,0,0);g.add(p);pl.push(p)}
 const lt=new T.PointLight(0x6aa0ff,0,7,1.6);g.add(lt);g.visible=false;return{g,pl,lt}})();
// first-person legs for jetpack flight: the suit's own legs and boots (hips down), hanging and swaying under the camera when you look down
const FPL=(()=>{const grp=new T.Group(),piv=new T.Group();grp.add(piv);grp.visible=false;let mesh=null,tier=-1,k=0;
 const SC=1.92/11.9,HIP=5.25;
 function build(t){const g=opGeo(SUIT_SRC[t](),t?SUIT_N[t][0]:35166,t?SUIT_N[t][1]:209928,[-3.1,-0.2,-2.0],[3.1,12.6,3.4],t),p=g.attributes.position,ix=g.index.array,keep=[];
  for(let i=0;i<ix.length;i+=3)if(p.getY(ix[i])<HIP&&p.getY(ix[i+1])<HIP&&p.getY(ix[i+2])<HIP)keep.push(ix[i],ix[i+1],ix[i+2]);
  g.setIndex(new T.BufferAttribute(new Uint16Array(keep),1));g.computeBoundingSphere();
  // cross-section bounds at the cut, so the armoured waist cap closes the hips seen from above
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>HIP-.6&&y<HIP){x0=Math.min(x0,p.getX(i));x1=Math.max(x1,p.getX(i));z0=Math.min(z0,p.getZ(i));z1=Math.max(z1,p.getZ(i))}}
  if(mesh){piv.remove(mesh);mesh.geometry.dispose()}mesh=new T.Mesh(g,opMat(0,t));mesh.scale.setScalar(SC);mesh.position.y=-HIP*SC;mesh.frustumCulled=false;piv.add(mesh);tier=t;
  mesh.material.side=T.DoubleSide;mesh.material.fragmentShader=mesh.material.fragmentShader.replace(/}\s*$/,'if(!gl_FrontFacing)gl_FragColor.rgb*=.05;}')}
 return{g:grp,step(dt){if(!S.children.includes(grp))S.add(grp);
  const want=jetOK()&&go&&!ground&&(JET.k>.08||(JET.on))?1:0;k+=(want-k)*Math.min(1,dt*(want?6:3));grp.visible=k>.02;if(!grp.visible)return;
  const t=Ar.tier||0;if(t!==tier)build(t);const tt=performance.now()/1000;
  grp.position.set(P.x-Math.sin(yaw)*.26,P.y+HIP*SC-.1+(1-k)*.25,P.z-Math.cos(yaw)*.26);grp.rotation.y=yaw+Math.PI;
  // legs trail back slightly under thrust, with a slow pendulum sway and a little scissor between the boots
  piv.rotation.set((.38+.08*JET.k)*k+Math.sin(tt*1.7)*.05,0,Math.sin(tt*1.1)*.03);
  mesh.material.uniforms.uOp.value=Math.min(1,k*1.4)}}})();
function jetFx(dt){const ok=(jetOK()||SJ.t>0||JET.k>.01)&&go;JF.style.display=jetOK()&&go?'flex':'none';if(!ok){JFX.g.visible=false;if(JET.on){JET.on=false;jetSnd(0)}return}
 JET.k+=((JET.on?1:Math.min(1,SJ.t*1.6))-JET.k)*Math.min(1,dt*(JET.on||SJ.t>1.2?14:6));JET.t+=dt;
 JF.firstChild.style.transform='scaleX('+JET.fuel.toFixed(3)+')';JF.classList.toggle('low',JET.fuel<.25);JF.classList.toggle('on',JET.on);
 JFX.g.visible=JET.k>.01;if(JFX.g.visible){JFX.g.position.set(P.x+Math.sin(yaw)*.2,P.y+1.12,P.z+Math.cos(yaw)*.2);JFX.g.rotation.y=yaw;
  const t=performance.now()/1000;JFX.pl.forEach(p=>p.userData.set(JET.k,t));JFX.lt.intensity=2.2*JET.k*(.85+.15*Math.sin(t*40));
  const gh=P.y;if(gh<4&&JET.on&&(JET.dust-=dt)<=0){JET.dust=.05;burst(new T.Vector3(P.x+(rnd()-.5)*1.2,.12,P.z+(rnd()-.5)*1.2),2,0x8aa0c8,3.5)}}
 if(JET.snd)jetSndUpd()}
// sound: ignition thump, a roaring filtered-noise body with low rumble and crackle, pitch/level following thrust, and a sputter on cut-off
function jetSnd(on){if(on){SND.jetOn();JET.snd=1}else{SND.jetOff();JET.snd=null}}
function jetSndUpd(){SND.jetUpd(JET.k,V.y)}
// ---- floating planet: cratered surface with continents and ice caps, drifting cloud shell, atmospheric rim, lit from one side
const PLANET=(()=>{const R=80,pos=new T.Vector3(300,250,-470);
 const NZ=`float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
vec2 cell(vec3 p){vec3 i=floor(p),f=fract(p);float d1=8.,r=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 g=vec3(x,y,z),o=vec3(h3(i+g),h3(i+g+11.3),h3(i+g+27.1));vec3 q=g+o-f;float d=dot(q,q);if(d<d1){d1=d;r=h3(i+g+5.7);}}return vec2(sqrt(d1),r);}`;
 const V=`varying vec3 vP,vN,vW;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
 const surf=new T.ShaderMaterial({uniforms:{uL:{value:new T.Vector3(.75,.35,.55).normalize()},uCam:{value:new T.Vector3()}},vertexShader:V,fog:false,
  fragmentShader:`uniform vec3 uL,uCam;varying vec3 vP,vN,vW;`+NZ+`
float crater(vec3 p,float sc){vec2 c=cell(p*sc);float r=.18+.25*c.y;float d=c.x/r;return (d<1.?-(1.-d*d)*.9:0.)+smoothstep(1.25,1.,d)*smoothstep(.8,1.,d)*.6;}
void main(){vec3 n=normalize(vP);float h=fbm(n*3.2)+.5*fbm(n*9.);float cr=crater(n,4.)*.6+crater(n+3.1,9.)*.35+crater(n+7.7,20.)*.18;
 vec3 lowc=vec3(.20,.24,.36),mid=vec3(.46,.38,.33),hi=vec3(.66,.60,.55);vec3 col=mix(lowc,mid,smoothstep(.55,.75,h));col=mix(col,hi,smoothstep(.85,1.05,h));
 col*=.85+.35*cr;col=mix(col,vec3(.9,.93,1.),smoothstep(.72,.86,abs(n.y))*.9);
 float e=.02;vec3 b=vec3(fbm((n+vec3(e,0,0))*3.2)-fbm((n-vec3(e,0,0))*3.2),fbm((n+vec3(0,e,0))*3.2)-fbm((n-vec3(0,e,0))*3.2),fbm((n+vec3(0,0,e))*3.2)-fbm((n-vec3(0,0,e))*3.2));
 vec3 bc=vec3(crater(n+vec3(e,0,0),4.)-crater(n-vec3(e,0,0),4.),crater(n+vec3(0,e,0),4.)-crater(n-vec3(0,e,0),4.),crater(n+vec3(0,0,e),4.)-crater(n-vec3(0,0,e),4.));
 vec3 nn=normalize(n-b*1.6-bc*.9);float dif=max(dot(nn,uL),0.);float term=smoothstep(-.12,.25,dot(n,uL));
 vec3 c=col*(dif*1.25*term+.035)+vec3(.02,.03,.08);vec3 vd=normalize(uCam-vW);float rim=pow(1.-max(dot(normalize(vN),vd),0.),3.);
 c+=vec3(.25,.45,1.)*rim*(.25+.9*term);gl_FragColor=vec4(pow(c,vec3(.95)),1.);}`});
 const cl=new T.ShaderMaterial({uniforms:{uL:surf.uniforms.uL,uCam:surf.uniforms.uCam,uT:{value:0}},vertexShader:V,transparent:true,depthWrite:false,fog:false,
  fragmentShader:`uniform vec3 uL,uCam;uniform float uT;varying vec3 vP,vN,vW;`+NZ+`
void main(){vec3 n=normalize(vP);float a=uT*.012;mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));vec3 q=n;q.xz=r*q.xz;
 float w=fbm(q*4.+vec3(0,uT*.004,0)+fbm(q*2.5)*1.4);float bands=.5+.5*sin(n.y*9.+fbm(q*3.)*4.);float d=smoothstep(.44,.70,w*(.75+.4*bands));
 float term=smoothstep(-.15,.3,dot(n,uL));float l=.08+1.05*max(dot(n,uL),0.)*term;gl_FragColor=vec4(vec3(.95,.97,1.)*l,d*.92);}`});
 const atm=new T.ShaderMaterial({uniforms:{uL:surf.uniforms.uL,uCam:surf.uniforms.uCam},vertexShader:V,transparent:true,depthWrite:false,fog:false,side:T.BackSide,blending:T.AdditiveBlending,
  fragmentShader:`uniform vec3 uL,uCam;varying vec3 vP,vN,vW;void main(){vec3 n=normalize(vP),vd=normalize(uCam-vW);float f=pow(max(0.,1.-abs(dot(normalize(vN),vd))),2.);float g=smoothstep(.0,1.,f)*(1.-smoothstep(.55,1.,f));
 float term=smoothstep(-.4,.4,dot(n,uL));gl_FragColor=vec4(vec3(.3,.55,1.)*g*(.25+1.1*term),1.);}`});
 const g=new T.Group();g.position.copy(pos);const s=new T.Mesh(new T.SphereGeometry(R,96,64),surf),c=new T.Mesh(new T.SphereGeometry(R*1.018,96,64),cl),a=new T.Mesh(new T.SphereGeometry(R*1.09,64,48),atm);
 [s,c,a].forEach(m=>{m.frustumCulled=false;g.add(m)});g.rotation.z=.32;S.add(g);
 return{g,update(t,cam){cam.getWorldPosition(surf.uniforms.uCam.value);cl.uniforms.uT.value=t;s.rotation.y=t*.006;g.position.set(pos.x+cam.position.x*.9,pos.y,pos.z+cam.position.z*.9);}}})();
// ---- cinematic sci-fi sound design: weapon fire, impacts, plasma jetpack, futuristic planetary-city ambience
const SND=(()=>{let ctx=null,verb=null,vin=null,amb=null;
 const ir=(sec,dec)=>{const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++){const t=i/AC.sampleRate;d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec)*(t<.01?t/.01:1)}}return b};
 function init(){if(ctx===AC)return true;if(!AC)return false;ctx=AC;verb=AC.createConvolver();verb.buffer=ir(LOWSPEC?1.1:2.6,3.2);vin=AC.createGain();vin.gain.value=1;const vo=AC.createGain();vo.gain.value=.55;vin.connect(verb).connect(vo).connect(sfxOut());return true}
 const now=()=>AC.currentTime;
 const G=(v,dst)=>{const g=AC.createGain();g.gain.value=v;g.connect(dst||sfxOut());return g};
 const envG=(t,a,peak,d,dst)=>{const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);g.connect(dst);return g};
 const noise=(t,dur,type,f0,f1,q,peak,a,dst,off)=>{const n=AC.createBufferSource(),f=AC.createBiquadFilter();n.buffer=noiseBuf();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t+dur);n.connect(f).connect(envG(t,a,peak,dur,dst));n.start(t,off==null?Math.random()*.8:off);n.stop(t+a+dur+.05)};
 const osc=(t,dur,type,f0,f1,peak,a,dst)=>{const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);o.connect(envG(t,a,peak,dur,dst));o.start(t);o.stop(t+a+dur+.05)};
 const send=(dry,amt)=>{const s=AC.createGain();s.gain.value=amt;dry.connect(s).connect(vin);return dry};
 // ---- weapon fire: ballistic = crack + body thump + mechanism + city slapback; energy = charge whine + plasma crack + sub
 const BALL={pulse:1,smg:1,burst:1,chain:0,scatter:1};
 function fire(w){if(!init())return;try{const t=now()+.002,out=G(.9),wet=send(G(1,out),.0);const v=.55,f=w.snd||500,pk=w.id==='scatter'?1.6:w.id==='smg'?.7:1;
  const dst=G(1,out);send(dst,.35);
  if(BALL[w.id]){noise(t,.012,'highpass',4000,4000,.7,.55*v*pk,.0008,dst);                                   // supersonic crack
   noise(t,.09*pk,'lowpass',2600,380,.8,.7*v*pk,.002,dst);                                                   // muzzle blast body
   osc(t,.11,'sine',120*pk,42,.8*v*pk,.002,dst);                                                            // chest thump
   noise(t+.018,.03,'bandpass',2400,1800,6,.18*v,.001,dst);noise(t+.045,.025,'bandpass',3300,2600,8,.12*v,.001,dst);   // bolt carrier cycling
   osc(t,.07,'sawtooth',f*2.2,f*.7,.07*v,.002,dst);                                                          // sci-fi coil snap
   const sl=AC.createDelay(.5);sl.delayTime.value=.09+Math.random()*.06;const sg=AC.createGain();sg.gain.value=.22;const sf=AC.createBiquadFilter();sf.type='lowpass';sf.frequency.value=1200;
   const tmp=G(1,sl);sl.connect(sf).connect(sg).connect(out);noise(t,.07,'lowpass',1800,400,.8,.5*v*pk,.002,tmp)}   // slapback off the buildings
  else{osc(t,.06,'sine',f*.8,f*2.6,.22*v,.004,dst);osc(t+.03,.22,'sawtooth',f*1.6,f*.35,.16*v,.003,dst);           // charge chirp then discharge sweep
   noise(t+.02,.16,'bandpass',5200,900,2.5,.5*v,.002,dst);                                                   // plasma crackle
   osc(t+.02,.18,'sine',90,35,.7*v,.003,dst);                                                               // sub punch
   const ring=AC.createOscillator(),rg=AC.createGain(),am=AC.createGain();ring.frequency.value=f*3.1;am.gain.value=0;rg.gain.setValueAtTime(.0001,t);rg.gain.exponentialRampToValueAtTime(.06*v,t+.01);rg.gain.exponentialRampToValueAtTime(.0001,t+.35);
   const lfo=AC.createOscillator();lfo.frequency.value=37;lfo.connect(am.gain);ring.connect(am).connect(rg).connect(dst);ring.start(t);lfo.start(t);ring.stop(t+.4);lfo.stop(t+.4)}   // ionised shimmer
 }catch(e){}}
 // ---- impact on a surface: concrete/metal tick, debris patter, occasional ricochet whine; distance-attenuated
 function impact(p){if(!init()||!p)return;try{const d=Math.hypot(p.x-P.x,p.y-P.y,p.z-P.z),v=Math.min(1,6/(d+2)),t=now()+Math.min(.12,d/340),pan=AC.createStereoPanner?AC.createStereoPanner():null;
  const dst=pan?pan:G(1);if(pan){const rx=Math.cos(yaw)*(p.x-P.x)-Math.sin(yaw)*(p.z-P.z);pan.pan.value=Math.max(-1,Math.min(1,rx/8));pan.connect(sfxOut())}send(dst,.25);
  noise(t,.03,'bandpass',3200,2000,3,.35*v,.001,dst);noise(t,.06,'lowpass',1500,300,.7,.25*v,.002,dst);
  for(let i=0;i<3;i++)noise(t+.05+i*.035+Math.random()*.02,.02,'bandpass',2500+Math.random()*2500,1800,4,.07*v,.001,dst);
  if(Math.random()<.22)osc(t+.01,.32,'sine',3200+Math.random()*1200,1100,.07*v,.01,dst)}catch(e){}}
 // ---- plasma jetpack engine: ignition charge + whoomp; roar, twin detuned plasma whine, turbine shriek, crackle; spool down + sputter
 let jet=null;
 // ---- jetpack rocket: stereo brown-noise roar + exhaust hiss + sub rumble + shock-diamond crackle, all breathing on a slow turbulence signal
 let RKB=null;const rocketBufs=()=>{if(RKB&&RKB.sr===AC.sampleRate)return RKB;const sr=AC.sampleRate,L=sr*3|0;
  const mk=fill=>{const b=AC.createBuffer(2,L,sr);for(let c=0;c<2;c++)fill(b.getChannelData(c));const F=sr*.06|0;for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let k=0;k<F;k++){const w=k/F;d[L-F+k]=d[L-F+k]*(1-w)+d[k]*w}}return b};
  const brown=mk(d=>{let l=0;for(let i=0;i<L;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}});
  const crack=mk(d=>{let i=0;while(i<L){i+=sr*(.0025+Math.random()*.014)|0;const a=Math.pow(Math.random(),2.5),len=sr*(.0004+Math.random()*.0022)|0;for(let k=0;k<len&&i+k<L;k++)d[i+k]+=(Math.random()*2-1)*a*Math.exp(-k/(len*.28))}});
  const turb=mk(d=>{let v=0,tg=0;const st=sr*.035|0;for(let i=0;i<L;i++){if(i%st===0)tg=Math.random()*2-1;v+=(tg-v)*.0007;d[i]=v}});
  return RKB={sr,brown,crack,turb}};
 function jetOn(){if(!init()||jet)return;try{const t=now(),B=rocketBufs(),out=G(0,sfxOut());out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(.5,t+.22);send(out,.22);
  const flt=(type,f,q)=>{const b=AC.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;return b},loopS=buf=>{const s=AC.createBufferSource();s.buffer=buf;s.loop=true;return s};
  // ignition: a pressurised gas rush opening up, igniter ticks, then the burn catches (no percussive hit)
  noise(t,.5,'bandpass',220,3200,.6,.32,.14,out);for(let i=0;i<6;i++)noise(t+.01+i*.028+Math.random()*.015,.018,'highpass',4500,6500,.8,.1,.0008,out);
  const br=loopS(B.brown),rl=flt('lowpass',1100,.6),rp=AC.createBiquadFilter();rp.type='peaking';rp.frequency.value=170;rp.gain.value=5;rp.Q.value=.8;const gRoar=G(.95,out);br.connect(rl).connect(rp).connect(gRoar);   // core roar
  const sb=flt('lowpass',85,.7),gSub=G(.75,out);br.connect(sb).connect(gSub);                                         // sub rumble
  const wn=loopS(noiseBuf()),hl=flt('bandpass',2200,.4),gHiss=G(.5,out);wn.connect(hl).connect(gHiss);             // exhaust hiss
  const cr=loopS(B.crack),ch=flt('highpass',1300),gCr=G(.75,out);cr.connect(ch).connect(gCr);                         // shock-diamond crackle
  const tu=loopS(B.turb),t1=G(.38,gRoar.gain),t2=G(.16,gHiss.gain),t3=G(.4,gCr.gain);tu.connect(t1);tu.connect(t2);tu.connect(t3);   // turbulence
  const th=AC.createOscillator();th.type='sawtooth';th.frequency.value=92;const tf=flt('lowpass',320,1.2),gTh=G(.03,out);th.connect(tf).connect(gTh);   // faint thrust tone
  const all=[br,wn,cr,tu,th];all.forEach(o=>o.start(t+.04,o===th?0:Math.random()*2));jet={out,rl,hl,gCr,gHiss,th,tf,all}}catch(e){}}
 function jetUpd(k,vy){if(!jet)return;const t=now(),x=Math.min(1,Math.max(0,(vy+2)/10));jet.rl.frequency.setTargetAtTime(800+1400*x,t,.12);jet.hl.frequency.setTargetAtTime(1800+1400*x,t,.15);
  jet.gCr.gain.setTargetAtTime(.55+.45*x,t,.15);jet.gHiss.gain.setTargetAtTime(.38+.25*x,t,.15);jet.th.frequency.setTargetAtTime(86+34*x,t,.25);jet.tf.frequency.setTargetAtTime(280+200*x,t,.2);jet.out.gain.setTargetAtTime(.42+.12*x,t,.1)}
 function jetOff(){if(!jet)return;const j=jet;jet=null;try{const t=now();j.out.gain.cancelScheduledValues(t);j.out.gain.setValueAtTime(Math.max(.0001,j.out.gain.value),t);j.out.gain.exponentialRampToValueAtTime(.0001,t+.5);
  j.rl.frequency.setTargetAtTime(160,t,.12);j.hl.frequency.setTargetAtTime(700,t,.12);j.th.frequency.exponentialRampToValueAtTime(40,t+.45);
  noise(t+.02,.25,'lowpass',900,180,.7,.12,.01,sfxOut());   // burn-out sigh
  j.all.forEach(o=>o.stop(t+.55))}catch(e){}}
 // ---- planetary megacity ambience: sub-drone and power hum, high wind, traffic hiss, spacecraft flybys, PA chimes with muffled voice, distant sirens and starship rumbles
 function ambStart(){if(!init()||amb)return;try{const t=now(),out=G(0,sfxOut());out.gain.setTargetAtTime(.5,t,1.5);const nodes=[];
  const n=AC.createBufferSource();n.buffer=noiseBuf();n.loop=true;nodes.push(n);
  const lo=AC.createBiquadFilter();lo.type='lowpass';lo.frequency.value=90;n.connect(lo).connect(G(.5,out));                                   // city sub-drone
  const wb=AC.createBiquadFilter();wb.type='bandpass';wb.frequency.value=700;wb.Q.value=.6;const wg=G(.05,out);n.connect(wb).connect(wg);
  const wl=AC.createOscillator();wl.frequency.value=.07;const wlg=AC.createGain();wlg.gain.value=.04;wl.connect(wlg).connect(wg.gain);const wl2=AC.createOscillator();wl2.frequency.value=.05;const wl2g=AC.createGain();wl2g.gain.value=300;wl2.connect(wl2g).connect(wb.frequency);nodes.push(wl,wl2);   // wind gusts
  const tr=AC.createBiquadFilter();tr.type='bandpass';tr.frequency.value=2200;tr.Q.value=.4;n.connect(tr).connect(G(.012,out));                  // distant traffic hiss
  for(const[f,v]of[[60,.03],[120,.018],[180,.008]]){const o=AC.createOscillator();o.frequency.value=f;o.connect(G(v,out));nodes.push(o)}       // grid hum
  nodes.forEach(o=>o.start(t,0));amb={out,nodes,next:{fly:t+3+Math.random()*4,pa:t+15+Math.random()*15,siren:t+25+Math.random()*25,ship:t+10+Math.random()*12}}}catch(e){}}
 function ambStop(){if(!amb)return;const a=amb;amb=null;try{const t=now();a.out.gain.setTargetAtTime(.0001,t,.4);a.nodes.forEach(o=>o.stop(t+2))}catch(e){}}
 function flyby(){const t=now(),d=2.6+Math.random()*2,dir=Math.random()<.5?-1:1,out=G(1,amb.out),pan=AC.createStereoPanner?AC.createStereoPanner():null;
  if(pan){pan.pan.setValueAtTime(-dir,t);pan.pan.linearRampToValueAtTime(dir,t+d);pan.connect(out)}const dst=pan||out;send(dst,.5);
  const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+d*.5);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(dst);
  const n=AC.createBufferSource();n.buffer=noiseBuf();n.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(500,t);f.frequency.linearRampToValueAtTime(1600,t+d*.5);f.frequency.linearRampToValueAtTime(380,t+d);n.connect(f).connect(g);
  const o=AC.createOscillator();o.type='sawtooth';const b=140+Math.random()*120;o.frequency.setValueAtTime(b*1.18,t);o.frequency.linearRampToValueAtTime(b,t+d*.5);o.frequency.linearRampToValueAtTime(b*.82,t+d);   // doppler
  const of=AC.createBiquadFilter();of.type='lowpass';of.frequency.value=900;const og=AC.createGain();og.gain.value=.25;o.connect(of).connect(og).connect(g);n.start(t,Math.random());o.start(t);n.stop(t+d+.1);o.stop(t+d+.1)}
 function pa(){const t=now(),out=G(1,amb.out);send(out,.9);[[880,0],[1108,.28],[1318,.56]].forEach(([f,dt])=>{osc(t+dt,.9,'sine',f,f*.998,.05,.01,out);osc(t+dt,.6,'sine',f*2.01,f*2,.012,.01,out)});
  const n=AC.createBufferSource();n.buffer=noiseBuf();n.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=2;const g=AC.createGain();g.gain.value=0;const s=AC.createOscillator();s.frequency.value=4.3;const sg=AC.createGain();sg.gain.value=.03;s.connect(sg).connect(g.gain);
  const env=G(0,out);env.gain.setValueAtTime(.0001,t+1.2);env.gain.linearRampToValueAtTime(1,t+1.4);env.gain.setValueAtTime(1,t+4.2);env.gain.linearRampToValueAtTime(.0001,t+4.6);n.connect(f).connect(g).connect(env);
  const s2=AC.createOscillator();s2.frequency.value=1.1;const s2g=AC.createGain();s2g.gain.value=400;s2.connect(s2g).connect(f.frequency);[n,s,s2].forEach(o=>{o.start(t+1.1);o.stop(t+4.8)})}
 function siren(){const t=now(),out=G(.03,amb.out);send(out,1.4);const o=AC.createOscillator();o.type='triangle';for(let i=0;i<6;i++){o.frequency.setValueAtTime(i%2?740:980,t+i*.55)}const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1500;o.connect(f).connect(out);o.start(t);o.stop(t+3.3)}
 function ship(){const t=now(),d=5+Math.random()*3,out=G(1,amb.out);send(out,.6);noise(t,d,'lowpass',60,150,.9,.35,d*.45,out);osc(t,d,'sine',38,30,.25,d*.4,out)}
 function tick(){if(!amb||!AC)return;const t=now(),n=amb.next;try{if(t>n.fly){flyby();n.fly=t+6+Math.random()*12}if(t>n.pa){pa();n.pa=t+40+Math.random()*35}if(t>n.siren){siren();n.siren=t+35+Math.random()*40}if(t>n.ship){ship();n.ship=t+18+Math.random()*20}}catch(e){}}
 return{fire,impact,jetOn,jetUpd,jetOff,ambStart,ambStop,tick}})();
// ================= CINEMATIC AUDIO ENGINE (from "Viral Vanguard - Cinematic Audio Blueprints") =================
// punch / body / tail built separately; tails come from a runtime space preset chosen from the geometry around the listener;
// distance = filter + delay; recorded-style layers are synthesised (noise bursts shaped like gunpowder, metal modes, Foley).
const AUD=(()=>{let A=null,bus=null,lp=null,comp=null,spIn=null,cv=[],cg=[],act=0,slap=null,slapG=null,slapF=null,er=[],eqLo=null,eqHi=null,space='street',spT=0;
 const PRE={ // RT60 s, predelay s, damping (0 bright..1 dark), wet, slap delay s, slap fb, slap level, ER ms list, low/high shelf dB
  alley:{rt:.8,pd:.006,damp:.55,wet:.42,sd:.032,sf:.38,sl:.32,er:[5,9,14],lo:3,hi:-5},
  street:{rt:1.5,pd:.03,damp:.35,wet:.30,sd:.2,sf:.22,sl:.22,er:[31,52,78],lo:0,hi:1},
  plaza:{rt:2.4,pd:.06,damp:.45,wet:.34,sd:.62,sf:.32,sl:.26,er:[60,94,120],lo:-3,hi:0},
  under:{rt:1.25,pd:.009,damp:.6,wet:.40,sd:.11,sf:.30,sl:.28,er:[8,11,19],lo:4,hi:-3},
  glass:{rt:.6,pd:.004,damp:.1,wet:.34,sd:.02,sf:.1,sl:.05,er:[3,5,8],lo:-4,hi:4},
  roof:{rt:.45,pd:.002,damp:.4,wet:.14,sd:1.1,sf:.28,sl:.20,er:[2],lo:-3,hi:0},
  market:{rt:.85,pd:.012,damp:.75,wet:.28,sd:.06,sf:.1,sl:.06,er:[10,16,21],lo:1,hi:-6},
  water:{rt:1.9,pd:.04,damp:.7,wet:.24,sd:2.1,sf:.25,sl:.18,er:[45],lo:-2,hi:-4}};
 const IRC={};
 function irOf(k){const key=k+A.sampleRate;if(IRC[key])return IRC[key];const p=PRE[k],sr=A.sampleRate,n=Math.floor(sr*((LOWSPEC?Math.min(p.rt,.7):p.rt)*1.2+p.pd)),b=A.createBuffer(2,n,sr),pdN=Math.floor(p.pd*sr);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let y=0;for(let i=pdN;i<n;i++){const t=(i-pdN)/sr,e=Math.pow(10,-3*t/p.rt);const x=(Math.random()*2-1)*e;y=y*p.damp*Math.min(1,.4+t)+x*(1-p.damp*.6);d[i]=y*(t<.004?t/.004:1)}}
  return IRC[key]=b}
 function init(){if(A===AC&&bus)return true;if(!AC)return false;A=AC;
  lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000;lp.Q.value=.5;comp=A.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.attack.value=.004;comp.release.value=.18;
  bus=A.createGain();bus.gain.value=1;bus.connect(lp).connect(comp).connect(A.destination);
  spIn=A.createGain();spIn.gain.value=1;eqLo=A.createBiquadFilter();eqLo.type='lowshelf';eqLo.frequency.value=220;eqHi=A.createBiquadFilter();eqHi.type='highshelf';eqHi.frequency.value=4000;
  const wet=A.createGain();wet.gain.value=1;eqLo.connect(eqHi).connect(wet).connect(bus);
  for(let i=0;i<2;i++){cv[i]=A.createConvolver();cg[i]=A.createGain();cg[i].gain.value=i?0:1;spIn.connect(cv[i]).connect(cg[i]).connect(eqLo)}
  slap=A.createDelay(3);slapF=A.createBiquadFilter();slapF.type='lowpass';slapF.frequency.value=2200;slapG=A.createGain();const fb=A.createGain();fb.gain.value=.25;slap._fb=fb;
  spIn.connect(slap);slap.connect(slapF).connect(slapG).connect(bus);slapF.connect(fb).connect(slap);
  for(let i=0;i<3;i++){const d=A.createDelay(.2),g=A.createGain();g.gain.value=0;spIn.connect(d).connect(g).connect(bus);er.push([d,g])}
  setSpace('street',true);return true}
 function setSpace(k,now_){if(!A)return;if(k===space&&!now_)return;space=k;const p=PRE[k],t=A.currentTime,ni=now_?act:1-act;
  cv[ni].buffer=irOf(k);if(!now_){cg[ni].gain.setTargetAtTime(p.wet,t,.15);cg[act].gain.setTargetAtTime(0,t,.15);act=ni}else cg[act].gain.value=p.wet;
  slap.delayTime.setTargetAtTime(p.sd,t,.2);slap._fb.gain.setTargetAtTime(p.sf,t,.2);slapG.gain.setTargetAtTime(p.sl,t,.2);
  eqLo.gain.setTargetAtTime(p.lo,t,.2);eqHi.gain.setTargetAtTime(p.hi,t,.2);
  er.forEach(([d,g],i)=>{const ms=p.er[i];g.gain.setTargetAtTime(ms?.18/(i+1):0,t,.2);if(ms)d.delayTime.setTargetAtTime(ms/1000,t,.2)})}
 // ---- space detection from the collision grid around the listener
 function detect(){if(typeof CITY==='undefined'||typeof P==='undefined')return 'street';const x=P.x,y=P.y+1.5,z=P.z,s=CITY.sol;
  let over=99;for(let h=2;h<26;h+=1.5)if(s(x,y+h,z)){over=h;break}
  const dist=(dx,dz)=>{for(let r=1;r<32;r+=1.5)if(s(x+dx*r,y,z+dz*r))return r;return 99};
  const dE=dist(1,0),dW=dist(-1,0),dN=dist(0,-1),dS=dist(0,1);
  const B=CITY.bounds;if(x<B[0]+14||x>B[1]-14||z<B[2]+14||z>B[3]-14)return 'water';
  if(over<6&&(Math.min(dE,dW)<5||Math.min(dN,dS)<5)&&P.y>30)return 'glass';
  if(over<26&&P.y<16)return 'under';
  if((dE<8&&dW<8)||(dN<8&&dS<8))return 'alley';
  if(P.y>12)return 'roof';
  if(Math.abs(x)<38&&Math.abs(z)<38)return 'plaza';
  const m=NCC_LAYOUT.zones.Market;if(x>m[0]-4&&x<m[1]+4&&z>m[2]-4&&z<m[3]+4)return 'market';
  return 'street'}
 // ---- primitives
 const out=()=>{init();return bus};
 const N=()=>noiseBuf();
 function env(t,a,pk,d,dst,shape){const g=A.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,pk),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);g.connect(dst);return g}
 function nz(t,d,type,f0,f1,q,pk,a,dst,rate){const n=A.createBufferSource(),f=A.createBiquadFilter();n.buffer=N();if(rate)n.playbackRate.value=rate;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);n.connect(f).connect(env(t,a,pk,d,dst));n.start(t,Math.random()*.8);n.stop(t+a+d+.05)}
 function os(t,d,type,f0,f1,pk,a,dst){const o=A.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(15,f1),t+d);o.connect(env(t,a,pk,d,dst));o.start(t);o.stop(t+a+d+.05)}
 function modes(t,fs,dec,pk,dst){fs.forEach((f,i)=>{const o=A.createOscillator();o.frequency.value=f*(1+(Math.random()-.5)*.02);o.connect(env(t,.0015,pk/(i+1),dec*(1-i*.12),dst));o.start(t);o.stop(t+dec+.05)})}
 // a source routed to the bus with pan, distance filter, a reverb send and (optionally) a delay for the speed of sound
 function src(p,wetMul=1,gain=1){const o=out(),t0=A.currentTime;const g=A.createGain();g.gain.value=gain;
  if(!p){const sd=A.createGain();sd.gain.value=.55*wetMul;g.connect(o);g.connect(sd).connect(spIn);return{n:g,t:t0+.002,d:0}}
  const dx=p.x-P.x,dz=p.z-P.z,dy=(p.y||0)-P.y,d=Math.hypot(dx,dy,dz),f=A.createBiquadFilter();f.type='lowpass';
  let cut=d<25?18000:Math.max(1200,18000-(d-25)*150);
  // occlusion: a solid cell on the straight line drops the highs hard
  if(d>3){for(let i=1;i<6;i++){const u=i/6;if(CITY.sol(P.x+dx*u,P.y+1.5+dy*u,P.z+dz*u)){cut=Math.min(cut,1600);break}}}
  f.frequency.value=cut;const pan=A.createStereoPanner?A.createStereoPanner():null,at=Math.min(1,8/(d+3));g.gain.value=gain*at;
  if(pan){const rx=Math.cos(yaw)*dx-Math.sin(yaw)*dz;pan.pan.value=Math.max(-1,Math.min(1,rx/Math.max(4,d*.8)));g.connect(f).connect(pan).connect(o)}else g.connect(f).connect(o);
  const sd=A.createGain();sd.gain.value=Math.min(1.2,.5+d/60)*wetMul*at*.9;g.connect(sd).connect(spIn);
  return{n:g,t:t0+.002+Math.min(.35,d/343),d}}
 const R=(a,b)=>a+Math.random()*(b-a),J=k=>1+(Math.random()-.5)*k;
 let lastShot=0,duckT=0;
 function duck(db,dur){const t=A.currentTime,k=Math.pow(10,-db/20);try{if(typeof MUS!=='undefined')MUS.T.forEach(m=>{if(m.g){const v=m.g.gain.value;m.g.gain.cancelScheduledValues(t);m.g.gain.setValueAtTime(v,t);m.g.gain.linearRampToValueAtTime(Math.max(.0001,v*k),t+.02);m.g.gain.setTargetAtTime(v,t+dur,.12)}})}catch(e){}}
 // ---- weapons: mechanical + report + signature + tail (space), 6-8 variations through random pitch and filter offsets
 function casings(surf,n=1,heavy){const s=src(null,.6,.5);for(let k=0;k<n;k++){const t=s.t+R(.32,.6)+k*.04,hollow=heavy?.6:1;
   if(surf==='grass')nz(t,.03,'lowpass',900,500,.7,.05,.002,s.n);
   else for(let b=0;b<3;b++){const tb=t+b*R(.07,.12)*(1+b*.5),v=.07/(b+1);modes(tb,heavy?[1450,2380,3300].map(f=>f*hollow):[3900,6100,8400],heavy?.12:.06,v,s.n);if(surf==='metal')modes(tb,[1200,1900],.15,v*.6,s.n)}}}
  // ---- weapon reports: rendered per shot-variant at sample level (no oscillator 'pew' sweeps)
  //      layers: supersonic N-wave crack, saturated muzzle blast with a closing low-pass, low-end body, receiver/bolt metal,
  //      a comb-filtered energy discharge and ion crackle for the sci-fi side, then a stereo street tail and building slapbacks
  const GUNSPEC={
   pulse:{crack:.9,bt:.016,c0:7500,c1:900,drv:3.2,bf:150,bt2:.075,bg:.6,clk:[.021,.048],modes:[1900,3350,5150],mg:.1,mt:.03,zap:{d:.00042,fb:.74,dur:.03,g:.32},crk:.05,cg:.12,tail:.34,tt:.42,len:.95,vol:.95},
   burst:{crack:.85,bt:.013,c0:8000,c1:1100,drv:3,bf:170,bt2:.06,bg:.5,clk:[.018,.04],modes:[2100,3700,5600],mg:.09,mt:.028,zap:{d:.00036,fb:.7,dur:.025,g:.3},crk:.04,cg:.1,tail:.3,tt:.38,len:.85,vol:.9},
   smg:{crack:.65,bt:.009,c0:8500,c1:1500,drv:2.6,bf:210,bt2:.04,bg:.38,clk:[.016],modes:[2600,4400],mg:.07,mt:.02,zap:{d:.0003,fb:.6,dur:.015,g:.18},crk:0,tail:.24,tt:.3,len:.7,vol:.78},
   scatter:{crack:.55,bt:.042,c0:5200,c1:480,drv:4.2,bf:88,bt2:.15,bg:1.05,clk:[],modes:[880,1650,2550],mg:.12,mt:.05,zap:null,crk:0,tail:.62,tt:.7,len:1.3,vol:1.05},
   rail:{pre:.045,crack:1.2,bt:.028,c0:9000,c1:700,drv:4,bf:72,bt2:.17,bg:.95,clk:[],modes:[1400,2950,6100],mg:.1,mt:.06,zap:{d:.00024,fb:.86,dur:.09,g:.55},crk:.22,cg:.3,tail:.75,tt:.95,len:1.6,vol:1.05},
   arc:{crack:0,bt:.06,c0:1700,c1:300,drv:3.5,bf:74,bt2:.18,bg:1,clk:[.03],modes:[320,610,980],mg:.22,mt:.12,zap:null,crk:0,hiss:.35,tail:.5,tt:.6,len:1.2,vol:1},
   ion:{crack:.55,bt:.013,c0:7000,c1:1200,drv:2.8,bf:160,bt2:.06,bg:.45,clk:[.02],modes:[2400,3900],mg:.06,mt:.025,zap:{d:.0006,fb:.8,dur:.04,g:.4},crk:.08,cg:.22,tail:.3,tt:.38,len:.85,vol:.85},
   cryo:{crack:.2,bt:.02,c0:6000,c1:1800,drv:2,bf:180,bt2:.05,bg:.3,clk:[],modes:[3200,4750,6900],mg:.14,mt:.09,zap:{d:.00018,fb:.78,dur:.05,g:.25},crk:0,hiss:.45,tail:.3,tt:.4,len:.9,vol:.85},
   void:{pre:.08,suck:1,crack:.3,bt:.05,c0:3000,c1:240,drv:3.6,bf:52,bt2:.26,bg:1.1,clk:[],modes:[410,770],mg:.1,mt:.12,zap:{d:.0009,fb:.9,dur:.14,g:.5},crk:.1,cg:.15,tail:.7,tt:1,len:1.7,vol:1},
   chain:{crack:.35,bt:.012,c0:7000,c1:1600,drv:2.5,bf:140,bt2:.05,bg:.4,clk:[],modes:[2900,4300],mg:.05,mt:.02,zap:{d:.00034,fb:.82,dur:.06,g:.45},crk:.16,cg:.42,tail:.32,tt:.4,len:.95,vol:.9}};
  const GB={};
  function genGun(sp){const sr=A.sampleRate,L=Math.ceil(sp.len*sr),buf=A.createBuffer(2,L,sr),core=new Float32Array(L),rn=()=>Math.random()*2-1,T0=Math.floor((sp.pre||0)*sr);
   const nrm=(a,k)=>{let m=0;for(let i=0;i<a.length;i++)m=Math.max(m,Math.abs(a[i]));if(m>0)for(let i=0;i<a.length;i++)a[i]*=k/m;return a};
   // charge-up (rail) or inward suck (void) before the report
   if(T0>0){const pre=new Float32Array(T0);let y=0;for(let i=0;i<T0;i++){const u=i/T0,fc=sp.suck?300+2500*u*u:1200+6000*u,a=Math.exp(-6.283*fc/sr);y=a*y+(1-a)*rn();pre[i]=y*(sp.suck?u*u*u:u*u)}nrm(pre,sp.suck?.35:.25);core.set(pre,0)}
   // supersonic crack: a 0.6 ms N-wave
   if(sp.crack){const Nw=Math.max(8,.0006*sr|0);for(let i=0;i<Nw;i++)core[T0+i]+=sp.crack*(1-2*i/Nw)}
   // muzzle blast: noise through a two-pole low-pass that closes from c0 to c1, then tanh saturation
   {const n=Math.min(L-T0,Math.ceil(sp.bt*7*sr)),bl=new Float32Array(n);let y1=0,y2=0;for(let i=0;i<n;i++){const tt=i/sr,fc=sp.c1+(sp.c0-sp.c1)*Math.exp(-tt/(sp.bt*1.4)),a=Math.exp(-6.283*fc/sr),env=(1-Math.exp(-tt/.0003))*Math.exp(-tt/sp.bt);
     y1=a*y1+(1-a)*rn()*env;y2=a*y2+(1-a)*y1;bl[i]=y2}nrm(bl,1);const d=sp.drv,td=Math.tanh(d);for(let i=0;i<n;i++)core[T0+i]+=Math.tanh(d*bl[i])/td*.9;GB._bl=bl}
   // low-end body: low-passed noise plus a fixed-pitch sub (no pitch sweep)
   {const n=Math.min(L-T0,Math.ceil(sp.bt2*6*sr)),lo=new Float32Array(n);let y1=0,y2=0;const a=Math.exp(-6.283*sp.bf/sr);for(let i=0;i<n;i++){const tt=i/sr,env=(1-Math.exp(-tt/.002))*Math.exp(-tt/sp.bt2);y1=a*y1+(1-a)*rn();y2=a*y2+(1-a)*y1;lo[i]=y2*env+.35*Math.sin(6.283*sp.bf*.5*tt)*env*(1-Math.exp(-tt/.004))*.02}
    nrm(lo,sp.bg);for(let i=0;i<n;i++)core[T0+i]+=Math.tanh(lo[i]*1.6)/1.6*1.4}
   // receiver metal: inharmonic decaying modes, and bolt/servo clicks
   {const n=Math.min(L-T0,Math.ceil(sp.mt*6*sr));sp.modes.forEach((f,k)=>{const ph=Math.random()*6.283,ff=f*(1+rn()*.015);for(let i=0;i<n;i++){const tt=i/sr;core[T0+i]+=Math.sin(6.283*ff*tt+ph)*Math.exp(-tt/sp.mt)*sp.mg/(k+1)}})}
   for(const ct of sp.clk){const o=T0+Math.floor((ct+rn()*.002)*sr),n=Math.ceil(.012*sr);for(const f of[2300,3700,5100]){const ph=Math.random()*6.283;for(let i=0;i<n&&o+i<L;i++){const tt=i/sr;core[o+i]+=Math.sin(6.283*f*tt+ph)*Math.exp(-tt/.0025)*.09}}for(let i=0;i<.002*sr&&o+i<L;i++)core[o+i]+=rn()*.12*(1-i/(.002*sr))}
   // energy discharge: a noise burst through a feedback comb (metallic, pitched by the comb delay)
   if(sp.zap){const z=sp.zap,n=Math.min(L-T0,Math.ceil((z.dur*4+.05)*sr)),D=Math.max(2,Math.round(z.d*sr)),y=new Float32Array(n);for(let i=0;i<n;i++){const tt=i/sr,x=rn()*Math.exp(-tt/(z.dur/2.5))*(tt<z.dur?1:Math.exp(-(tt-z.dur)/.01));y[i]=x+(i>=D?z.fb*y[i-D]:0)}
    let hp=0,pv=0;for(let i=0;i<n;i++){hp=.92*(hp+y[i]-pv);pv=y[i];y[i]=hp}nrm(y,z.g);for(let i=0;i<n;i++)core[T0+i]+=y[i]}
   // ion crackle: sparse sharp ticks thinning out
   if(sp.crk){const n=Math.min(L-T0,Math.ceil(sp.crk*sr));let i=0;while(i<n){i+=Math.floor(sr*(.0008+Math.random()*.006*(1+3*i/n)));const a=Math.random()*sp.cg*Math.exp(-3*i/n),w=Math.floor(sr*(.0002+Math.random()*.0006));for(let k=0;k<w&&T0+i+k<L;k++)core[T0+i+k]+=rn()*a*(1-k/w)}}
   // gas hiss (mortar tube / cryo vent)
   if(sp.hiss){const n=Math.min(L-T0,Math.ceil(.5*sr));let pv=0,hp=0;for(let i=0;i<n;i++){const tt=i/sr,x=rn();hp=.75*(hp+x-pv);pv=x;core[T0+i]+=hp*sp.hiss*(1-Math.exp(-tt/.01))*Math.exp(-tt/.16)*.5}}
   // stereo street tail + building slapbacks
   const bl=GB._bl;for(let c=0;c<2;c++){const d=buf.getChannelData(c);d.set(core);let y1=0,y2=0;const a=Math.exp(-6.283*650/sr),st=T0+Math.floor(.012*sr);
    for(let i=st;i<L;i++){const tt=(i-st)/sr,env=(1-Math.exp(-tt/.02))*Math.exp(-tt/sp.tt);y1=a*y1+(1-a)*rn();y2=a*y2+(1-a)*y1;d[i]+=y2*env*sp.tail*1.6}
    for(const[dl,gk]of[[c?.118:.097,.26],[c?.31:.345,.13],[c?.52:.47,.06]]){const o=T0+Math.floor((dl+Math.random()*.01)*sr);let yy=0;const aa=Math.exp(-6.283*1400/sr);for(let i=0;i<bl.length&&o+i<L;i++){yy=aa*yy+(1-aa)*bl[i];d[o+i]+=yy*gk*sp.tail*1.1}}
    // fade the very end
    const F=Math.floor(.05*sr);for(let i=0;i<F;i++)d[L-1-i]*=i/F}
   {let m=0;for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<L;i++)m=Math.max(m,Math.abs(d[i]))}const k=.95/m;for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<L;i++)d[i]*=k}}
   return buf}
  function gunBuf(id){const sp=GUNSPEC[id]||GUNSPEC.pulse,key=id+'@'+A.sampleRate;const L=GB[key]=GB[key]||[];if(!L.length)L.push(genGun(sp));if(L.length<4&&!L._q)prewarm(id);return L[Math.random()*L.length|0]}
 function prewarm(id){if(!init())return;const key=id+'@'+A.sampleRate,L=GB[key]=GB[key]||[];if(L._q)return;L._q=1;const step=()=>{if(L.length>=4){L._q=0;return}try{L.push(genGun(GUNSPEC[id]||GUNSPEC.pulse))}catch(e){L._q=0;return}setTimeout(step,90)};setTimeout(step,60)}
  function fire(w){if(!init())return;try{const s=src(null,1,1),t=s.t,o=s.n,id=w.id;lastShot=A.currentTime;
   const surf=typeof surfAt==='function'?surfAt():'concrete',sp=GUNSPEC[id]||GUNSPEC.pulse;
   const n=A.createBufferSource();n.buffer=gunBuf(id);n.playbackRate.value=1+(Math.random()-.5)*.05;const g=A.createGain();g.gain.value=sp.vol*1.25;n.connect(g).connect(o);n.start(t);
   if(id==='scatter'){duck(6,.25);const tp=t+.42;nz(tp,.05,'bandpass',1800,1500,4,.22,.002,o);modes(tp+.01,[1650,2600],.08,.08,o);nz(tp+.21,.05,'bandpass',1500,1900,4,.24,.002,o);modes(tp+.22,[1900,3100],.1,.1,o);casings(surf,1,true)}
   else if(id==='pulse'||id==='smg'||id==='burst'||id==='ion')casings(surf);
   if(id==='rail'||id==='void')for(let i=0;i<5;i++)modes(t+.8+i*R(.25,.45),[5200+i*150,7600],.03,.012,o);
   }catch(e){}}
 // ---- impacts by surface
 function impact(p,kind){if(!init()||!p)return;try{const s=src(p,.8,1),t=s.t,o=s.n;
  if(!kind){kind=p.y<.2?(Math.random()<.4?'wet':'concrete'):(Math.abs(Math.sin(p.x*12.9+p.z*78.2))<.25?'metal':'concrete');
   if(typeof BM!=='undefined'&&BM.some(b=>Math.abs(b.position.x-p.x)<1.3&&Math.abs(b.position.y-p.y)<1.3&&Math.abs(b.position.z-p.z)<1.3))kind='crate'}
  if(kind==='concrete'||kind==='wet'){nz(t,.012,'bandpass',3400,2200,2,.5,.0008,o);nz(t+.004,.08,'bandpass',700,450,1.6,.32,.002,o);
   for(let i=0;i<5;i++)nz(t+.05+i*R(.03,.09),.015,'bandpass',R(2500,6000),2000,5,.06/(1+i*.3),.001,o);
   if(kind==='wet'){nz(t+.003,.12,'bandpass',1400,700,1.4,.22,.003,o);for(let i=0;i<3;i++)nz(t+.12+i*R(.05,.1),.03,'bandpass',R(1800,3200),1400,6,.04,.002,o)}}
  else if(kind==='metal'){modes(t,[R(1500,2400),R(2900,3600),R(4300,5200)],R(.12,.35),.14,o);nz(t,.006,'highpass',5000,5000,.7,.4,.0005,o);
   if(Math.random()<.25){const f0=R(2600,3800);os(t+.012,R(.3,.7),'sine',f0,f0*.38,.06,.012,o)}}
  else if(kind==='crate'){nz(t,.02,'bandpass',1200,700,1.2,.45,.001,o);modes(t+.003,[340,520,880],.18,.1,o);for(let i=0;i<4;i++)nz(t+.04+i*R(.03,.07),.02,'bandpass',R(1500,3500),1200,4,.08,.001,o)}
  else if(kind==='glass'){nz(t,.01,'highpass',4000,4000,.7,.5,.0005,o);for(let i=0;i<9;i++)modes(t+.02+i*R(.03,.12),[R(4000,9000),R(7000,11000)],.15,.03,o)}
  }catch(e){}}
 // ---- explosions: crack + thump + arc discharge + debris + distant roll; close blasts muffle the mix and ring the ears
 function boom(p,size=1){if(!init())return;try{const s=src(p,1.2,1.4*size),t=s.t,o=s.n,d=s.d;
  if(d<20)nz(t,.008,'highpass',3500,3500,.7,1,.0005,o);
  nz(t,.4*size,'lowpass',1600,90,.7,1.4,.003,o);os(t,.6,'sine',58,26,1.6*size,.003,o);
  {const n=A.createBufferSource(),g=A.createGain(),sq=A.createOscillator(),sg=A.createGain();n.buffer=N();sq.type='square';sq.frequency.value=41;sg.gain.value=.6;sq.connect(sg).connect(g.gain);g.gain.value=0;
   const f=A.createBiquadFilter();f.type='bandpass';f.frequency.value=2600;f.Q.value=.8;n.connect(f).connect(g).connect(env(t+.01,.004,.45,.35,o));n.start(t);sq.start(t);n.stop(t+.5);sq.stop(t+.5)}
  if(d<60)for(let i=0;i<14;i++)nz(t+.15+i*R(.05,.16),.03,'bandpass',R(900,5000),800,3,.09*Math.exp(-i*.12),.002,o);
  if(d>30)nz(t+.2,2.2,'lowpass',180,60,.7,.6,.4,o);
  duck(9,.4);
  if(d<6){const t0=A.currentTime;lp.frequency.cancelScheduledValues(t0);lp.frequency.setValueAtTime(900,t0+.01);lp.frequency.exponentialRampToValueAtTime(20000,t0+2.2);
   const r=A.createOscillator();r.frequency.value=3800;r.connect(env(t0+.05,.1,.035,1.5,bus));r.start(t0+.05);r.stop(t0+1.8)}
  if(d<30&&Math.random()<.5)setTimeout(()=>alarm(p),R(500,1500))}catch(e){}}
 function alarm(p){try{const s=src(p,1,.25),t=s.t;for(let i=0;i<8;i++)os(t+i*.32,.3,'square',i%2?960:740,i%2?950:735,.05,.01,s.n)}catch(e){}}
 // ---- infected spiders
 function spClick(e){try{const p=e.m.position,s=src(p,.6,.7),t=s.t,o=s.n;const n=2+(Math.random()*4|0);for(let i=0;i<n;i++){nz(t+i*R(.03,.07),.006,'bandpass',R(2600,4200),R(2000,3000),9,.18,.0006,o)}
  if(Math.random()<.25)nz(t+.05,R(.2,.4),'bandpass',R(3200,5200),R(2400,3800),2.2,.06,.04,o)}catch(e_){}}
 function spStep(e){try{const p=e.m.position,s=src(p,.4,.35),t=s.t,o=s.n;for(let i=0;i<4;i++)nz(t+i*.018,.004,'bandpass',R(1800,3200),2000,7,.12,.0005,o)}catch(e_){}}
 function spHit(e){if(!init())return;try{const s=src(e.m.position,.7,.9),t=s.t,o=s.n;nz(t,.02,'bandpass',1600,900,1.6,.5,.001,o);nz(t+.005,.07,'lowpass',900,300,.9,.4,.002,o);
  os(t+.02,.22,'sawtooth',R(900,1300),R(500,700),.06,.01,o);nz(t+.02,.2,'bandpass',R(2800,3600),2200,4,.12,.01,o)}catch(e_){}}
 function spDie(e){if(!init())return;try{const s=src(e.m.position,.8,1),t=s.t,o=s.n;nz(t,.1,'lowpass',700,200,.8,.7,.003,o);os(t,.18,'sine',90,45,.6,.003,o);
  os(t+.01,.4,'sawtooth',1100,380,.07,.02,o);for(let i=0;i<10;i++)nz(t+.15+i*R(.06,.18),.006,'bandpass',R(2400,4200),2400,9,.12*Math.exp(-i*.18),.0006,o);
  nz(t+.1,1.2,'highpass',5000,3500,.7,.035,.1,o);os(t+.1,.8,'sine',7400,6800,.008,.05,o);   // blue blood fizz
  const k=src(null,0,.6),tk=k.t;os(tk+.06,.06,'sine',140,70,.25,.002,k.n);nz(tk+.06,.02,'bandpass',2600,2000,3,.1,.001,k.n)}catch(e_){}}   // kill confirm: low thud + click
 // ---- player body
 function hurtMe(x){if(!init())return;try{const s=src(null,.3,1),t=s.t,o=s.n;nz(t,.06,'lowpass',900,240,.8,.6,.002,o);modes(t+.002,[620,1100,1750],.15,.12,o);
  os(t+.03,.18,'sawtooth',R(140,170),R(95,110),.07,.02,o);nz(t+.03,.16,'bandpass',R(500,700),400,3,.12,.02,o);os(t,.6,'sine',3600,3500,.012,.02,o)}catch(e){}}
 function shieldHit(){if(!init())return;try{const s=src(null,.6,1),t=s.t,o=s.n;nz(t,.04,'lowpass',1200,300,.7,.5,.002,o);modes(t,[1300,2700,4100],.4,.08,o);nz(t+.01,.25,'highpass',5000,3000,.7,.08,.01,o)}catch(e){}}
 function land(air,tier){if(!init())return;try{const s=src(null,.4,1),t=s.t,o=s.n,k=Math.min(1,(air-.3)/1.2);if(k<=0)return;
  nz(t,.12,'lowpass',700,160,.8,.6*k,.003,o);os(t,.2,'sine',48,30,.8*k,.003,o);modes(t+.01,[700,1250,1900],.12,.12*k,o);
  if(air>.9){os(t+.05,.35,'sawtooth',420,780,.02*k,.04,o);nz(t+.12,.3,'bandpass',900,500,1.2,.08*k,.03,o)}}catch(e){}}
 function armorStep(mode,I,tier){if(!A||mode==='crawl')return;try{const s=src(null,.15,1),t=s.t+.012,o=s.n,v=(.03+.02*(tier||0))*(I||1)*(mode==='run'?1.4:mode==='land'?2:1);
  nz(t,.03,'bandpass',R(1300,2100),1200,3,v,.002,o);if(tier>=2)modes(t+.01,[R(900,1100),R(1600,1900)],.05,v*.6,o);nz(t,.06,'bandpass',R(2500,3500),2400,1.2,v*.5,.01,o)}catch(e){}}
 // ---- traversal: grapple, lifts, launch pads, jetpack cooling
 let reel=null,liftL=null,wind=null,hb=0,br=0;
 function grapFire(){if(!init())return;try{const s=src(null,.5,1),t=s.t,o=s.n;nz(t,.01,'highpass',3000,3000,.7,.6,.0005,o);nz(t,.08,'lowpass',2200,500,.8,.6,.002,o);os(t,.06,'sine',160,80,.5,.002,o);
  {const n=A.createBufferSource(),f=A.createBiquadFilter();n.buffer=N();f.type='bandpass';f.frequency.setValueAtTime(3200,t);f.frequency.exponentialRampToValueAtTime(1400,t+.5);f.Q.value=4;n.connect(f).connect(env(t,.01,.12,.5,o));n.start(t);n.stop(t+.6)}
  for(let i=0;i<10;i++)nz(t+.02+i*.035,.008,'bandpass',2200,2000,8,.05,.0008,o)}catch(e){}}
 function grapHit(p,metal){if(!init())return;try{const s=src(p,.7,1),t=s.t,o=s.n;if(metal)modes(t,[900,1700,2600],.3,.18,o);else{nz(t,.02,'bandpass',2000,1200,1.5,.5,.001,o);for(let i=0;i<4;i++)nz(t+.03+i*.04,.015,'bandpass',R(2500,5000),2000,5,.06,.001,o)}
  const me=src(null,.3,1);os(me.t+.02,.5,'triangle',98,92,.18,.003,me.n);os(me.t+.02,.4,'sine',196,190,.06,.003,me.n);
  stopReel();reel=(()=>{const g=A.createGain();g.gain.value=0;g.connect(out());const m=A.createOscillator(),m2=A.createOscillator(),f=A.createBiquadFilter();m.type='sawtooth';m2.type='square';m.frequency.value=170;m2.frequency.value=343;f.type='bandpass';f.frequency.value=900;f.Q.value=2;
   const n=A.createBufferSource();n.buffer=N();n.loop=true;const nf=A.createBiquadFilter();nf.type='bandpass';nf.frequency.value=700;const ng=A.createGain();ng.gain.value=.4;
   m.connect(f);m2.connect(f);f.connect(g);n.connect(nf).connect(ng).connect(g);[m,m2,n].forEach(x=>x.start());g.gain.setTargetAtTime(.06,A.currentTime,.05);return{g,m,m2,n,all:[m,m2,n]}})()}catch(e){}}
 function stopReel(){if(!reel)return;const r=reel;reel=null;try{const t=A.currentTime;r.g.gain.setTargetAtTime(.0001,t,.04);r.all.forEach(x=>x.stop(t+.3))}catch(e){}}
 function grapRelease(){stopReel();if(!A)return;try{const s=src(null,.4,1),t=s.t;os(t,.08,'sine',260,120,.12,.002,s.n);nz(t,.2,'bandpass',1800,600,2,.1,.004,s.n);for(let i=0;i<6;i++)nz(t+.04+i*.03,.006,'bandpass',2600,2400,8,.05,.0006,s.n)}catch(e){}}
 function pad(){if(!init())return;try{const s=src(null,.6,1),t=s.t,o=s.n;
  // field spin-up: detuned pair rising fast with a shimmering harmonic
  os(t,.14,'sawtooth',300,1500,.05,.03,o);os(t,.14,'sawtooth',304,1530,.05,.03,o);os(t,.14,'sine',600,2400,.06,.02,o);
  const b=t+.12;
  // field release: a resonant upward whoosh that tears open, with a second higher sweep layered on top
  nz(b,.9,'bandpass',350,5200,2.2,.55,.03,o);nz(b+.02,.7,'highpass',900,7000,.9,.22,.04,o);
  // energy tone: detuned saws gliding up an octave and a half, plus a pure harmonic glide
  os(b,.8,'sawtooth',220,780,.06,.04,o);os(b,.8,'sawtooth',223,792,.05,.04,o);os(b,.6,'sine',880,2640,.07,.02,o);
  // ion shimmer and a fizz of discharge sparks trailing the launch
  modes(b+.05,[1660,2490,3730,5590],.7,.05,o);
  for(let k=0;k<9;k++){const ct=b+.08+k*.05+Math.random()*.03;nz(ct,.015,'highpass',6000,8000,.8,.07*(1-k/10),.0005,o)}}catch(e){}}
 function jetCool(){if(!init())return;try{const s=src(null,.3,1);for(let i=0;i<6;i++)modes(s.t+.2+i*R(.18,.32),[R(4800,6200)],.03,.02,s.n)}catch(e){}}
 // ---- skills
 function skill(id){if(!init())return;try{const s=src(null,.6,1),t=s.t,o=s.n;
  if(id==='shield'){nz(t,.4,'lowpass',200,1800,.8,.4,.1,o);os(t,.5,'sawtooth',60,120,.08,.1,o);modes(t+.35,[1300,1960,2600],.8,.05,o)}
  else if(id==='dash'){nz(t,.18,'bandpass',600,2600,1.2,.5,.01,o);nz(t,.03,'highpass',3000,3000,.7,.3,.001,o)}
  else if(id==='chrono'){os(t,.35,'sine',800,200,.2,.02,o);nz(t,.35,'lowpass',8000,400,.7,.2,.02,o);const t0=A.currentTime;lp.frequency.cancelScheduledValues(t0);lp.frequency.setValueAtTime(lp.frequency.value,t0);lp.frequency.exponentialRampToValueAtTime(1500,t0+.3);lp.frequency.setValueAtTime(1500,t0+4.6);lp.frequency.exponentialRampToValueAtTime(20000,t0+5)}
  else if(id==='drone'){os(t,.3,'sawtooth',220,880,.05,.05,o);nz(t,.5,'bandpass',300,600,2,.12,.1,o);modes(t+.3,[2400,3600],.1,.06,o)}
  else{os(t,.15,'sine',440,880,.08,.01,o);nz(t,.1,'bandpass',1500,3000,2,.12,.01,o)}}catch(e){}}
 function ready(){if(!init())return;try{const s=src(null,.2,1),t=s.t;nz(t,.012,'bandpass',2200,2000,6,.12,.0008,s.n);os(t+.05,.06,'sine',620,620,.03,.005,s.n);os(t+.14,.08,'sine',930,930,.03,.005,s.n)}catch(e){}}
 // ---- UI: rotary detent ticks, toggle clacks with an armoured thump
 function ui(k){if(!AC)return;if(!init())return;try{const s=src(null,k==='hover'?.1:.35,1),t=s.t,o=s.n;
  if(k==='hover'){nz(t,.008,'bandpass',3200,2800,5,.05,.0006,o)}
  else if(k==='back'){nz(t,.012,'bandpass',1700,1500,4,.2,.0008,o);os(t+.01,.09,'sine',110,70,.12,.003,o)}
  else{nz(t,.012,'bandpass',2100,1800,4,.25,.0008,o);os(t+.008,.12,'sine',85,55,.22,.003,o);nz(t+.03,.12,'highpass',4500,3000,.7,.03,.02,o)}}catch(e){}}
 // ---- per-frame mix: space, lift hum, beacon, heartbeat and breathing (no constant ambient beds)
 let amb2=null,nextBeacon=0,nextJoint=0,nextClick=0,nextDrip=0;
 function ambOn(){if(!init()||amb2)return;try{const t=A.currentTime,mk=(f,type='sine')=>{const o=A.createOscillator();o.type=type;o.frequency.value=f;o.start(t);return o};
  const n=A.createBufferSource();n.buffer=N();n.loop=true;n.start(t,Math.random());
  const lf=A.createBiquadFilter();lf.type='bandpass';lf.frequency.value=380;lf.Q.value=3;const lg=A.createGain();lg.gain.value=0;const lh=mk(70);const lhg=A.createGain();lhg.gain.value=.4;lh.connect(lhg).connect(lg);n.connect(lf).connect(lg).connect(out());
  amb2={lg,lf,all:[n,lh]}}catch(e){}}
 function G2(v,d){const g=A.createGain();g.gain.value=v;g.connect(d);return g}
 function ambOff(){if(!amb2)return;const a=amb2;amb2=null;try{const t=A.currentTime;[a.lg].forEach(g=>g.gain.setTargetAtTime(.0001,t,.3));a.all.forEach(o=>o.stop(t+1.5))}catch(e){}}
 function tick(dt){if(!AC||!A||typeof go==='undefined')return;const t=A.currentTime;
  if(!go){if(amb2)ambOff();stopReel();return}
  if(!amb2)ambOn();
  spT-=dt;if(spT<=0){spT=.35;setSpace(detect())}
  try{
   // lifts: hum near the beams, a rising rush while you ride one
   let ln=99;for(const[lx,lz]of CITY.LIFTS)ln=Math.min(ln,Math.hypot(P.x-lx,P.z-lz));const riding=CITY.liftAt(P.x,P.y,P.z)>0;
   amb2.lg.gain.setTargetAtTime(riding?.18:ln<8?.06*(1-ln/8):0,t,.15);amb2.lf.frequency.setTargetAtTime(riding?380+P.y*14:380,t,.2);
   if(t>nextBeacon){nextBeacon=t+4;const s=src(new T.Vector3(0,219,0),2,.5);os(s.t,1.6,'sine',523,520,.05,.02,s.n);os(s.t,1.2,'sine',1046,1040,.012,.02,s.n)}
   if(space==='under'&&t>nextJoint){nextJoint=t+R(4,6);const s=src(new T.Vector3(P.x+R(-20,20),19,P.z+R(-20,20)),1,1);os(s.t,.2,'sine',70,40,.3,.003,s.n);os(s.t+.18,.2,'sine',66,40,.25,.003,s.n);nz(s.t,.1,'lowpass',800,200,.7,.12,.003,s.n)}
   if(t>nextDrip&&P.y<4){nextDrip=t+R(.6,2.2);const s=src(new T.Vector3(P.x+R(-8,8),R(3,6),P.z+R(-8,8)),.8,.25);os(s.t,.05,'sine',R(1400,2600),R(700,1100),.05,.002,s.n)}
   // spiders: chitter and skitter from the nearest three within 25 m
   if(t>nextClick&&typeof EN!=='undefined'){nextClick=t+R(.18,.5);const near=EN.filter(e=>e.m&&e.m.visible!==false).map(e=>[e,e.m.position.distanceTo(P)]).filter(a=>a[1]<25).sort((a,b)=>a[1]-b[1]).slice(0,3);
    for(const[e]of near){if(Math.random()<.45)spClick(e);else spStep(e)}}
   // low health: heartbeat 60-110 bpm, laboured breathing, the world muffled to 3 kHz
   const hk=typeof hp!=='undefined'&&maxHP?hp/maxHP:1;
   if(hk<.3&&hp>0){hb-=dt;if(hb<=0){hb=60/(60+50*(1-hk/.3));const s=src(null,0,1);os(s.t,.09,'sine',62,40,.5,.004,s.n);os(s.t+.16,.08,'sine',55,38,.35,.004,s.n)}
    br-=dt;if(br<=0){br=R(1.8,2.6);const s=src(null,.1,1);nz(s.t,.6,'bandpass',900,600,1.2,.06,.25,s.n);nz(s.t+.9,.8,'bandpass',700,450,1.2,.05,.3,s.n)}
    if(lp.frequency.value>3100&&!(t<lp._hold))lp.frequency.setTargetAtTime(3000,t,.3)}
   else if(lp.frequency.value<19000&&!(lp._lock>t)&&(typeof slowT==='undefined'||slowT<=0))lp.frequency.setTargetAtTime(20000,t,.5);
   if(reel&&typeof grap!=='undefined'&&grap&&grap.pull){const sp=Math.hypot(V.x,V.y,V.z);reel.m.frequency.setTargetAtTime(140+sp*9,t,.05);reel.m2.frequency.setTargetAtTime(283+sp*18,t,.05);reel.g.gain.setTargetAtTime(.04+sp*.002,t,.05)}
   else if(reel&&!(grap&&grap.pull)&&!(grap))stopReel()}catch(e){}}
 // ---- slide: armoured knee-guard scrape over grit, magnetic skid hum, servo wind-down and a few sparks
 function slide(){if(!init())return;try{const s=src(null,.6,1),t=s.t,o=s.n;
  nz(t,.6,'bandpass',2600,650,1.1,.38,.02,o);nz(t,.75,'lowpass',520,140,.7,.32,.03,o);
  for(let i=0;i<16;i++)nz(t+.02+i*.034+Math.random()*.02,.028,'bandpass',R(1800,3800),R(900,1600),3,.11*(1-i/18),.001,o);
  os(t,.65,'sawtooth',150,82,.03,.05,o);os(t,.7,'sine',58,46,.1,.04,o);
  for(let i=0;i<6;i++)modes(t+.04+i*R(.05,.11),[R(4200,6400)],.035,.018,o)}catch(e){}}
 // ---- slide-jet: pressure release crack, ignition whoomp rising into a roaring thrust, air tearing past, ionised crackle tail
 function slideBurst(){if(!init())return;try{const s=src(null,.7,1),t=s.t,o=s.n;
  nz(t,.012,'highpass',4500,4500,.7,.55,.0006,o);
  nz(t+.005,.35,'lowpass',260,2600,.8,.6,.012,o);
  nz(t+.03,1.1,'bandpass',420,1500,.7,.5,.05,o);
  nz(t+.06,.9,'highpass',1600,6500,.7,.22,.08,o);
  os(t+.02,.9,'sawtooth',180,760,.04,.06,o);os(t+.02,.9,'sawtooth',183,772,.035,.06,o);
  for(let i=0;i<10;i++){const ct=t+.08+i*.05+Math.random()*.03;nz(ct,.016,'highpass',5500,7500,.8,.08*(1-i/11),.0005,o)}}catch(e){}}
 function door(p,open){if(!init())return;try{const s=src(p,.8,1),t=s.t,o=s.n;
  if(open){nz(t,.18,'bandpass',3200,1400,1.6,.2,.004,o);nz(t+.02,.42,'bandpass',900,1900,1.2,.14,.03,o);os(t+.02,.4,'sawtooth',260,420,.025,.04,o);nz(t+.42,.06,'lowpass',500,160,.8,.25,.003,o);modes(t+.43,[740,1180],.12,.04,o)}
  else{nz(t,.5,'bandpass',1700,800,1.2,.12,.04,o);os(t,.55,'sawtooth',400,240,.02,.05,o);nz(t+.56,.07,'lowpass',420,130,.8,.32,.002,o);modes(t+.57,[520,880],.16,.05,o);nz(t+.6,.25,'highpass',3500,2500,.8,.05,.02,o)}}catch(e){}}
 return{init,door,slide,slideBurst,prewarm:id=>{try{prewarm(id)}catch(e){}},fire,impact,boom,spHit,spDie,hurt:hurtMe,shieldHit,land,armorStep,grapFire,grapHit,grapRelease,pad,jetCool,skill,ready,ui,tick,setSpace,get space(){return space},get bus(){return bus}}})();

SND.fire=w=>AUD.fire(w);{let li=0;SND.impact=p=>{const t=performance.now();if(t-li<28)return;li=t;AUD.impact(p)}}
{const _fs=footstep;footstep=function(surf,foot,mode,I){_fs(surf,foot,mode,I);AUD.armorStep(mode,I,typeof Ar!=='undefined'&&Ar?Ar.tier||0:0)}}
// menu sounds: detent tick on hover, armoured clack on select, softer clack on back/close
{let hv=null;document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('.tile,[data-pop],#px,#done,.btn,button');if(!b||b===hv||!AC||(typeof go!=='undefined'&&go))return;hv=b;AUD.ui('hover')},true);
 document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.tile,[data-pop],#px,#done,.btn,button');if(!b||(typeof go!=='undefined'&&go&&!b.closest('#ov,#pz,#end')))return;setTimeout(()=>AUD.ui(b.id==='px'||b.id==='done'?'back':'select'),0)},true)}
// ---- quick 180: eased spin with a lean into the turn, a camera dip, FOV punch, weapon swing that lags then settles, speed streaks and a pivot sound
const TURN={t:-1,from:0,dir:1,dur:.36,roll:0,dip:0,gx:0,gy:0,fov:0};
const TFX=(()=>{const d=document.createElement('div');d.id='turnfx';document.body.appendChild(d);return d})();
function quickTurn(){if(!go||TURN.t>=0)return;TURN.t=0;TURN.from=yaw;TURN.dir=(J&&J.x>.2)?-1:1;sprintLock=false;$('bq').classList.add('on');
 if(AC){try{const t0=AC.currentTime,o=sfxOut(),n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=noiseBuf();f.type='bandpass';f.Q.value=1.1;f.frequency.setValueAtTime(500,t0);f.frequency.exponentialRampToValueAtTime(2200,t0+.18);f.frequency.exponentialRampToValueAtTime(700,t0+.34);
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.16,t0+.12);g.gain.exponentialRampToValueAtTime(.0001,t0+.36);n.connect(f).connect(g).connect(o);n.start(t0,Math.random()*.5);n.stop(t0+.4)}catch(e){}
  footstep(surfAt(),0,'run',.7);setTimeout(()=>go&&footstep(surfAt(),1,'run',.55),190)}}
function turnStep(dt){if(TURN.t<0)return;TURN.t+=dt;const u=Math.min(1,TURN.t/TURN.dur),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,b=Math.sin(Math.PI*u);
 const target=TURN.from+TURN.dir*Math.PI*e,prev=TURN.cur==null?TURN.from:TURN.cur;yaw+=target-prev;TURN.cur=target;
 TURN.roll=TURN.dir*.075*b;TURN.dip=.06*b;TURN.fov=7*b;TURN.gx=-TURN.dir*.07*Math.sin(Math.PI*Math.min(1,u*1.15));TURN.gy=-TURN.dir*.42*Math.sin(Math.PI*Math.min(1,u*1.1));
 TFX.style.opacity=(.85*b).toFixed(3);TFX.style.backgroundPosition='0 0,0 '+((TURN.dir*u*240)|0)+'px';
 if(u>=1){TURN.t=-1;TURN.cur=null;TURN.roll=TURN.dip=TURN.gx=TURN.gy=TURN.fov=0;TFX.style.opacity=0;$('bq').classList.remove('on')}}

// ---- ACOG-style 4x combat scope for scoped weapons: ADS raises the optic, the view zooms through the lens with a lit chevron reticle and bullet-drop stadia
const SCOPED={rail:1};
const SCOPE=(()=>{const d=document.createElement('div');d.id='scope';d.innerHTML=`<div class="lens"></div><svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet"><defs><filter id="fg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<circle r="99" fill="none" stroke="#000" stroke-width="3"/><circle r="96" fill="none" stroke="rgba(120,200,255,.18)" stroke-width="1.2"/>
<g stroke="#111" stroke-width=".7" fill="#111" font-family="Arial" font-size="4.2" font-weight="700"><path d="M-99 0H-46M46 0H99M0 99V58"/><path d="M-4 22H4M-6.5 32H6.5M-5 42H5M-4 52H4"/><text x="8" y="23.5">4</text><text x="9" y="33.5">5</text><text x="8" y="43.5">6</text><text x="7" y="53.5">8</text>
<path d="M-30 0V-3M-20 0V-2M-10 0V-2M10 0V-2M20 0V-2M30 0V-3" /></g>
<g filter="url(#fg)"><path d="M-9 11L0 -1L9 11" fill="none" stroke="#ff9a1a" stroke-width="2.6" stroke-linejoin="miter"/><path d="M0 -1V18" stroke="#ff9a1a" stroke-width=".8" opacity=".85"/></g>
<circle r="99" fill="none" stroke="url(#gl)" stroke-width="0"/></svg><div class="glare"></div>`;document.body.appendChild(d);
 let k=0,t=0;return{k:()=>k,upd(){const want=go&&SCOPED[Wp.id]&&ads>.55;const tk=want?Math.min(1,(ads-.55)/.4):0;k+=(tk-k)*.45;t+=.016;
  d.style.opacity=k>.02?Math.min(1,k*1.4).toFixed(3):0;d.style.display=k>.02?'block':'none';const sw=k*(1.6+2*Math.min(1,Math.hypot(V.x,V.z)/6));d.style.setProperty('--sx',(Math.sin(t*1.3)*sw).toFixed(2)+'px');d.style.setProperty('--sy',(Math.sin(t*2.1)*sw*.8+rec*60).toFixed(2)+'px');
  const hide=k>.6;gun.visible=!hide;fpArm.vis(!hide);document.body.classList.toggle('scoped',k>.5)}}})();
// drone weapon: a short charge-up glow, twin pulse bolts from the eye, flash, blue tracer, impact sparks and blood, plasma sound, recoil kick
function droneFire(e){dr.updateMatrixWorld(true);const mp=dy.getWorldPosition(new T.Vector3()),tp=e.m.position.clone();tp.y+=.1+rnd()*.3;const dir=tp.clone().sub(mp).normalize();
 const side=(dr.userData.sd=-(dr.userData.sd||1)),bp=mp.clone().add(new T.Vector3(side*.06,-.01,0).applyQuaternion(C.quaternion));dr.userData.ch=1;dr.userData.kick=.07;dr.userData.fl.intensity=5;
 FX.flash(bp.clone().addScaledVector(dir,.1),new T.Color(.55,.8,1),.7,.09);FX.flash(bp,new T.Color(1,1,1),.25,.05);FX.tracer(bp,tp,0x3a9cff);FX.tracer(bp.clone().addScaledVector(dir,.02),tp,0xbfe0ff);

 setTimeout(()=>{if(!e.d){BLOOD.hit(tp,dir,.7);FX.puff(tp,0x6ab0ff,.6);FX.flash(tp,new T.Color(.5,.8,1),.6,.08);hurt(e,18)}},Math.min(140,25+mp.distanceTo(tp)*4));
 if(AC){try{const t=AC.currentTime,o=sfxOut();const os=AC.createOscillator(),g=AC.createGain();os.type='sawtooth';os.frequency.setValueAtTime(1900,t);os.frequency.exponentialRampToValueAtTime(240,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.14);
  const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1400;f.Q.value=.8;os.connect(f).connect(g).connect(o);os.start(t);os.stop(t+.16);
  const s2=AC.createOscillator(),g2=AC.createGain();s2.frequency.setValueAtTime(140,t);s2.frequency.exponentialRampToValueAtTime(50,t+.1);g2.gain.setValueAtTime(.18,t);g2.gain.exponentialRampToValueAtTime(.0001,t+.12);s2.connect(g2).connect(o);s2.start(t);s2.stop(t+.13)}catch(err){}}}
function slide(){if(go&&ground&&slideT<=0){slideT=.75;stance=0;sprintLock=false;try{AUD.slide()}catch(e){}}}
// slide-jet: jump while sliding fires the pack - a low, fast launch that keeps (and grows) the slide's momentum in flight
const SJ={t:0,fov:0,roll:0,dip:0};
function slideBurst(){const sp=Math.hypot(V.x,V.z),fx=-Math.sin(yaw),fz=-Math.cos(yaw),out=Math.max(sp*1.3,18);
 V.x=fx*out;V.z=fz*out;V.y=7.8*(Ar.jmp||1);ground=0;dj=1;slideT=0;stance=0;SJ.t=1.35;SJ.fov=16;SJ.dip=1;SJ.roll=(rnd()<.5?-1:1)*.05;shake=Math.max(shake,.28);
 JET.fuel=Math.max(0,JET.fuel-.12);JET.cool=.6;padT=0;burst(new T.Vector3(P.x,P.y+.15,P.z),28,0x4f8cff,10);burst(new T.Vector3(P.x-fx*.6,P.y+.4,P.z-fz*.6),16,0xff2bd6,6);
 try{AUD.slideBurst()}catch(e){}if(typeof vib==='function')vib()}
// ---- grapple: pistol launcher in the off hand fires a braided cable with a claw; reels the player in, hangs on walls,
// and near a ledge the player hangs under the lip, plants the off hand on the edge and hauls up onto it; jump releases
let grap=null,LEDGE=null,GRK=0,LDK=0,GOUT=0,GDR=0,GRET=0;const GV=new T.Vector3(),GN_=new T.Vector3(),GHW=new T.Vector3();
const FPG_REST=new T.Vector3(-.24,-.21,-.50);
function grapMuzzle(o){return GRG.fpGun.localToWorld(o.copy(GRG.fpGun.userData.muzzle))}
const GRAPPLE_RANGE=20;
function grappleHit(){rc.far=GRAPPLE_RANGE;aimAt(0,0);const h=rc.intersectObjects(BM.concat(CITY.proxies),false)[0];rc.far=100;return h||null}
function fireGrapple(){const h=grappleHit();if(!h){beep(160,.12,'square',.05);return false}
 const p=h.point.clone(),n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):new T.Vector3(0,1,0),q=p.clone().addScaledVector(n,-.3);
 let top=p.y;while(top<130&&solid(q.x,top+.1,q.z))top+=.5;{let lo=Math.max(p.y,top-.5),hi=top;for(let i=0;i<7;i++){const m=(lo+hi)/2;if(solid(q.x,m,q.z))lo=m;else hi=m}top=lo}
 const roof=n.y>.5,nearTop=!roof&&top-p.y<6;let tg,E=null;
 if(roof)tg=new T.Vector3(p.x,p.y+1.2,p.z);
 else if(nearTop){E=new T.Vector3(p.x,top,p.z);tg=E.clone().addScaledVector(n,.65);tg.y=top-.85}   // hang just under the lip
 else tg=p.clone().addScaledVector(n,1.6);
 grap={p,n:n.clone(),tg,E,top:roof,ledge:nearTop,t:0,shot:0,pull:false,stall:0,hang:0};
 C.updateMatrixWorld(true);grap.from=C.localToWorld(new T.Vector3(-.24,-.18,-.80));sprintLock=false;stance=0;slideT=0;
 GRG.fpGun.userData.head.visible=false;
 AUD.grapFire();return true}
function endGrapple(pop){if(!grap)return;grap=null;GRG.hide();GRG.fpGun.userData.head.visible=true;dj=0;if(pop)V.y=Math.max(V.y,pop)}
function startLedge(){const E=grap.E,n=grap.n.clone();n.y=0;n.normalize();const left=new T.Vector3(-Math.cos(yaw),0,Math.sin(yaw));
 const lf=new T.Vector3(-n.z,0,n.x);LEDGE={t:0,n,from:P.clone(),hand:E.clone().addScaledVector(n,-.10).addScaledVector(lf,.22).setY(E.y+.035),
  hang:new T.Vector3(E.x+n.x*.45,E.y-1.72,E.z+n.z*.45),peak:new T.Vector3(E.x+n.x*.30,E.y-.02,E.z+n.z*.30),stand:new T.Vector3(E.x-n.x*.65,E.y+.02,E.z-n.z*.65)};
 grap=null;GRG.hide();GRG.fpGun.userData.head.visible=true;V.set(0,0,0);footstep('concrete',0,'land',.5)}
function ledgeStep(dt){const L=LEDGE;L.t+=dt;const t=L.t,T1=.22,T2=.70,T3=.98,e=x=>x*x*(3-2*x);
 if(t<T2){const ty=Math.atan2(L.n.x,L.n.z);let dy=ty-yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));yaw+=dy*Math.min(1,dt*12)}
 if(t<T1)P.copy(L.from).lerp(L.hang,e(t/T1));
 else if(t<T2){const u=e((t-T1)/(T2-T1));P.copy(L.hang).lerp(L.peak,u);P.y=L.hang.y+(L.peak.y-L.hang.y)*Math.pow(u,.8)}
 else{const u=e(Math.min(1,(t-T2)/(T3-T2)));P.copy(L.peak).lerp(L.stand,u);P.y=L.peak.y+(L.stand.y-L.peak.y)*u+.12*Math.sin(Math.PI*u)}
 V.set(0,0,0);if(t>=T3){P.copy(L.stand);LEDGE=null;ground=1;footstep('roof',1,'land',.7)}}
function grapStep(dt){GV.copy(grap.tg).sub(GN_.set(P.x,P.y+.9,P.z));const d=GV.length();
 if(grap.ledge&&(d<1.5||grap.stall>.12)){startLedge();return}
 if(d<1.4||grap.hang>0){if(grap.top){endGrapple(5);return}grap.hang+=dt;V.set(0,0,0);if(grap.hang>12)endGrapple(.1);return}  // cling to the wall: jump off, or fire again to climb
 const sp=Math.min(34,12+d*2.2);V.copy(GV.multiplyScalar(sp/d));
 if(grap.last&&grap.last.distanceTo(P)<sp*dt*.25){if((grap.stall+=dt)>.22){endGrapple(9);return}}else grap.stall=0;grap.last=(grap.last||new T.Vector3()).copy(P)}
function updGrapple(dt){
 // off-hand launcher: raised while the cable is out, lowered otherwise; the ledge pull swaps it for a bare hand on the edge
 // sequence: engage -> the off hand leaves the rifle and brings the launcher up into frame; release -> hand and launcher drop
 // quickly down out of frame; only once the launcher is gone does the hand come back up onto the rifle's fore-end
 if(grap){GOUT=Math.min(1,GOUT+dt*7);GDR=0;GRET=0}
 else if(GOUT>0){GDR=Math.min(1,GDR+dt/.13);if(GDR>=1){GOUT=0;GRET=1}}
 else if(GRET>0)GRET=Math.max(0,GRET-dt/.16);
 const eo=GOUT*GOUT*(3-2*GOUT),ed=GDR*GDR;GRK=GOUT>0?1:GRET*GRET*(3-2*GRET);
 LDK=LEDGE?Math.min(1,LEDGE.t/.16)*(1-Math.max(0,(LEDGE.t-.80)/.18)):0;
 const fg=GRG.fpGun;fg.visible=GOUT>0&&!LEDGE;if(fg.visible){
  // left-hand pistol hold: launcher raised from the hip, barrel tracking the claw, a sharp recoil kick when it fires
  const kick=grap?Math.max(0,1-grap.t/.16):0,kk=kick*kick;
  fg.position.set(FPG_REST.x-.12*(1-eo)+.01*kk-.06*ed,FPG_REST.y-.55*(1-eo)+.02*kk-.6*ed,FPG_REST.z+.07*kk+.08*ed);
  let ry=.10,rx=.05;if(grap){C.updateMatrixWorld(true);const lp=C.worldToLocal(grap.p.clone()).sub(fg.position);ry=Math.atan2(-lp.x,-lp.z);rx=Math.atan2(lp.y,Math.hypot(lp.x,lp.z));ry=Math.max(-.5,Math.min(.6,ry));rx=Math.max(-.4,Math.min(.7,rx))}
  fg.rotation.order='YXZ';fg.rotation.set(rx+.6*(1-eo)+.35*kk-1.1*ed,ry,.10-.45*(1-eo)+.04*kk+.3*ed)}
 if(LEDGE){ledgeStep(dt);return}
 if(!grap)return;grap.t+=dt;
 if(!grap.pull){grap.shot=Math.min(1,grap.shot+dt*110/Math.max(1,grap.from.distanceTo(grap.p)));if(grap.shot>=1){grap.pull=true;AUD.grapHit(grap.p,Math.random()<.3)}}
 if(grap.t>(grap.hang>0?14:2.6)||!go){endGrapple(4);return}
 C.updateMatrixWorld(true);const m0=grapMuzzle(GV),hp=grap.from.clone().lerp(grap.p,grap.shot);if(grap.pull)hp.copy(grap.p);
 const fc=GRG.flyClaw,dir=hp.clone().sub(m0).normalize();fc.visible=true;
 if(grap.pull){fc.position.copy(grap.p).addScaledVector(grap.n,.06);fc.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),grap.n.clone().negate());fc.userData.open(Math.min(1,(fc.userData.k=(fc.userData.k||0)+dt*9)))}
 else{fc.position.copy(hp);fc.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),dir);fc.userData.k=0;fc.userData.open(.08)}
 const tail=fc.localToWorld(new T.Vector3(0,0,-.16));
 GRG.cable(m0,tail,grap.pull?.002:.035*(1-grap.shot)+.004,grap.pull?(grap.t-(grap.tp||(grap.tp=grap.t))<.25?.02*(1-(grap.t-grap.tp)/.25):0):.03*(1-grap.shot),grap.t)}
// the cable only holds while the skill button is held: letting go detaches from the wall at once
function releaseGrapple(){if(!grap)return;AUD.grapRelease();const pop=grap.pull?Math.min(6,Math.max(2,-V.y*.2+3)):0;endGrapple(pop);if(scd>0)scd=Math.min(scd,Sk.cd*.35)}
function useSkill(){if(!go||scd>0)return;
 if(Sk.id==='grapple'){if(grap&&!(grap.hang>0))return;const hold=grap;if(hold){grap=null}if(fireGrapple())scd=Sk.cd*(1-(Ar.cdr||0));else if(hold)grap=hold;return}
 scd=Sk.cd*(1-(Ar.cdr||0));AUD.skill(Sk.id);
 switch(Sk.id){
  case 'dash':dashDir.set(-Math.sin(yaw),0,-Math.cos(yaw));dashT=.22;invT=.5;shake=.15;break;
  case 'shield':shieldT=4;break;
  case 'drone':droneT=8;dshot=0;break;
  case 'chrono':slowT=5;break;
  case 'nanite':hp=Math.min(maxHP,hp+50);healA=.9;break}}
function takeDmg(x){if(invT>0)return;if(shieldT>0){AUD.shieldHit();return}AUD.hurt(x);hp-=x*(1-Ar.dr);dmgA=.9}

// ================= 3D HANGAR AVATAR =================
const OPM_SRC='<<assets/data_55.b64>>';
const OPM_T1='<<assets/data_56.b64>>';
const OPM_T2='<<assets/data_57.b64>>';
const OPM_T3='<<assets/data_58.b64>>';
const OPM_FRAG="\n#define PI 3.14159265\nuniform vec3 uGlo;\n#define GLO uGlo\nuniform float uOp,uDetK,uTime;uniform sampler2D uDet;varying vec3 vP,vN,vNv,vV,vCol,vEmi;varying vec4 vMR;varying vec2 vX;\nconst vec3 E2L=vec3(1.46896,7.95698,0.42479),W2L=vec3(0.61085,7.08597,1.19440),nEL=vec3(-0.36276,-0.83452,0.41471),nWL=vec3(-0.60970,-0.35504,0.70867),HCL=vec3(0.29792,7.04509,1.64485);\nconst mat3 MUL=mat3(0.52234,0.25109,-0.81493,-0.08322,0.96611,0.24433,0.84867,-0.05981,0.52554),MFL=mat3(0.49429,0.61966,-0.60967,0.07184,0.66982,0.73904,0.86632,-0.40910,0.28657),MHL=mat3(-0.39912,0.59966,0.69362,-0.86807,-0.00356,-0.49642,-0.29522,-0.80025,0.52197);\nconst vec3 E2R=vec3(2.00809,7.95763,-0.23409),W2R=vec3(1.21410,8.17416,0.95334),nER=vec3(-0.29127,-0.73184,0.61610),nWR=vec3(-0.60763,-0.30676,0.73259),HCR=vec3(0.92145,7.79139,1.21856);\nconst mat3 MUR=mat3(0.86068,0.00236,-0.50914,-0.12135,0.97212,-0.20063,0.49447,0.23446,0.83697),MFR=mat3(0.76041,0.64705,-0.05570,0.12867,-0.06603,0.98949,0.63657,-0.75958,-0.13346),MHR=mat3(0.64418,0.52750,-0.55387,-0.03467,0.74353,0.66780,0.76409,-0.41098,0.49725);\n\nconst vec3 SR_=vec3(1.62,9.62,0.),ER_=vec3(2.04,7.95,-.06),WR_=vec3(2.22,6.52,.04);\nfloat hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);\n return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),\n            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}\nfloat fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}\nfloat D_GGX(float nh,float a){float a2=a*a;float d=nh*nh*(a2-1.)+1.;return a2/(PI*d*d);}\nvec3 F_s(vec3 f0,float vh){return f0+(1.-f0)*pow(1.-vh,5.);}\nfloat scratches(vec3 p){float s=0.;\n for(int i=0;i<3;i++){vec3 dir=normalize(vec3(hash(vec3(float(i),1,2))-.5,hash(vec3(2,float(i),5))-.5,hash(vec3(4,7,float(i)))-.5));\n  float f=dot(p,dir)*(60.+40.*float(i))+fbm(p*8.+float(i))*6.;float l=smoothstep(.06,0.,abs(fract(f)-.5));\n  s=max(s,l*smoothstep(.62,.8,fbm(p*vec3(3.,9.,5.)+float(i)*3.1)));}\n return s;}float seg2(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}\n// neon line work painted onto the armour (projected decals), returns distance to the nearest line\nfloat glowD(vec3 p,vec3 n,bool isA){float ax=abs(p.x),d=1e3;vec2 f=vec2(ax,p.y);\n if(n.z>.3&&p.z>0.){\n  d=min(d,seg2(f,vec2(1.02,9.78),vec2(.36,9.32)));d=min(d,seg2(f,vec2(1.10,9.10),vec2(.28,8.40)));     // chest V\n  d=min(d,seg2(f,vec2(.66,8.15),vec2(.60,7.45)));                                                      // abdomen sides\n  d=min(d,seg2(f,vec2(.80,5.70),vec2(.95,4.30)));d=min(d,seg2(f,vec2(1.05,3.05),vec2(1.14,1.55)));    // thigh, shin\n  if(p.z>.60)d=min(d,abs(length(vec2(ax-.92,p.y-3.60))-.16));\n  if(isA&&ax>1.7&&p.y<8.2&&p.y>6.6)d=min(d,seg2(f,vec2(2.10,7.85),vec2(2.25,6.75)));\n  if(p.y<.95&&p.z>.1)d=min(d,seg2(f,vec2(1.16,.84),vec2(1.17,.42)));                       // forearm\n }\n if(n.z<-.3&&p.z<0.){\n  d=min(d,abs(length(vec2(p.x,p.y-9.10))-.52));\n  d=min(d,seg2(f,vec2(.20,8.55),vec2(.20,7.25)));d=min(d,seg2(f,vec2(.95,9.85),vec2(.55,9.55)));\n  d=min(d,seg2(f,vec2(.90,5.60),vec2(.95,4.40)));d=min(d,seg2(f,vec2(1.10,3.0),vec2(1.15,1.6)));\n }\n if(abs(n.x)>.4&&p.x*n.x>0.){vec2 g=vec2(p.z,p.y);\n  if(ax>1.95&&p.y>9.2&&(isA||p.x<0.))d=min(d,abs(length(g-vec2(-.02,9.66))-.24));                                    // shoulder emblem\n  if(isA&&ax>2.15&&p.y<7.9&&p.y>6.6)d=min(d,abs(length(g-vec2(0.,7.20))-.17));                             // forearm emblem\n  if(ax>1.1&&p.y>4.1&&p.y<5.8)d=min(d,abs(length(g-vec2(0.,4.95))-.26));                              // thigh emblem\n  if(ax>1.2&&p.y<3.3&&p.y>1.3)d=min(d,seg2(g,vec2(.10,3.0),vec2(.10,1.7)));\n  if(ax>1.3&&p.y<1.05)d=min(d,abs(length(g-vec2(-.03,.80))-.10));                            // calf line\n  if(ax>.95&&p.y>8.0&&p.y<9.9)d=min(d,seg2(g,vec2(.30,9.6),vec2(.05,8.3)));                            // ribcage side\n }\n return d;}\n\n\nfloat visY(float ax){return .03+.16*ax*ax;}\nfloat smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}\nmat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}\n\n\n// vent grille: dark slots with a lit upper lip; u runs across the slots, m is the soft panel mask\nvoid slots(float u,float m,inout float vent,inout float lip){float t=fract(u);\n vent=max(vent,m*smoothstep(.16,.24,t)*smoothstep(.80,.72,t));lip=max(lip,m*smoothstep(.74,.80,t)*smoothstep(.94,.86,t));}\nfloat box2(vec2 q,vec2 c,vec2 h,float r){vec2 d=abs(q-c)-h+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}\n// circuit trace: run, 45-degree jog, run, end pad (all in a 2D surface chart)\nfloat trace(vec2 q,vec2 a,float l1,float j,float l2){vec2 b=a+vec2(l1,0.),c=b+vec2(sign(l1)*abs(j),j),e=c+vec2(l2,0.);\n float d=min(min(seg2(q,a,b),seg2(q,b,c)),seg2(q,c,e));return min(d,abs(length(q-e)-.018));}\nfloat chev(vec2 q,float y0){return max(abs(q.y-y0+.62*abs(q.x))-.024,abs(q.x)-.19);}\nfloat ySlit(float ax,float y){float yc=.11-.065*(1.-smoothstep(0.,.42,ax));float hw=.024-.011*smoothstep(.15,.44,ax);float bar=max(abs(y-yc)-hw,ax-.44);bar=max(bar,dot(vec2(ax,-(y-yc)),normalize(vec2(1.,1.6)))-.43);float sw=.016+.009*smoothstep(-.1,-.44,y);float stem=max(ax-sw,max(y-yc,-y-.46));return smin(bar,stem,.014);}\nvoid main(){vec3 p=vP,nO=normalize(vN);vec3 n=normalize(vNv);vec3 rd=normalize(vV),v=-rd;\n float wearW=vMR.z,fab=vMR.w,metal=vMR.x;\n \n#ifdef LITE\nfloat sc=0.,gr=.5+.2*noise(p*9.),gr2=.5;\n#else\nfloat sc=scratches(p*.8),gr=fbm(p*14.),gr2=fbm(p*vec3(60.,4.,60.));\n#endif\n\n float curv=clamp(length(fwidth(nO))*2.5,0.,1.);\n vec3 f0=vCol;float rough=vMR.y;vec3 alb=vCol*(1.-metal);\n // armour plates: grain, wear on edges and scratches, dirt\n vec3 fp=vCol*(.88+.2*gr);float rp=vMR.y+.12*gr2-.10*sc;\n \n#ifdef LITE\nfloat wear=clamp(curv*.35,0.,1.);\n#else\nfloat wear=clamp(sc*.8+curv*.5*smoothstep(.45,.75,fbm(p*10.)),0.,1.);\n#endif\nfp=mix(fp,vec3(.68,.69,.71),wear*.6*step(.2,vCol.b));rp=mix(rp,.18,wear);\n f0=mix(mix(vec3(.04),vCol,metal),fp,wearW);rough=mix(rough,rp,wearW);\n // Godot-baked tier detail (triplanar in body space): plate seams, weave / brushing / filigree, edge wear and lit inlays\n float emiD=0.;if(uDetK>0.&&wearW>.05){vec3 bw=pow(abs(nO),vec3(4.));bw/=bw.x+bw.y+bw.z;vec3 q=p*.12;\n  vec4 d=texture2D(uDet,q.zy)*bw.x+texture2D(uDet,q.xz)*bw.y+texture2D(uDet,q.xy)*bw.z;float hb=(texture2D(uDet,q.zy,1.5)*bw.x+texture2D(uDet,q.xz,1.5)*bw.y+texture2D(uDet,q.xy,1.5)*bw.z).r;\n  float fk=clamp(1.-length(fwidth(q.xy+q.yz))*28.,0.,1.);float h=d.r,seam=smoothstep(.5,.22,h)*mix(.35,1.,fk);\n  f0*=1.-.55*seam*uDetK;alb*=1.-.55*seam*uDetK;rough=clamp(mix(rough,d.g,.4*uDetK*fk)+.15*seam,.04,1.);f0=mix(f0,vec3(.62,.64,.68),d.a*.3*uDetK*wearW);\n  vec3 dpx=dFdx(vV),dpy=dFdy(vV);float hx=dFdx(hb),hy=dFdy(hb);vec3 r1=cross(dpy,n),r2=cross(n,dpx);float det=dot(dpx,r1);\n  n=normalize(abs(det)*n-sign(det)*(hx*r1+hy*r2)*.45*fk*uDetK);emiD=d.b*mix(.4,1.,fk);}\n if(fab>.01){\n#ifdef LITE\nfloat qd=.5,rib=.5+.5*sin(p.y*120.);\n#else\nfloat qd=fbm(p*50.),rib=.5+.5*sin(p.y*120.+fbm(p*6.)*3.);\n#endif\nalb*=mix(1.,(.85+.3*qd)*(.92+.16*rib),fab);rough+=.1*qd*fab;}\n vec3 emi=vEmi+GLO*emiD*(1.5+.8*sin(uTime*2.4+p.y*2.6))*uDetK;float vent=0.,lip=0.,vglow=0.;\n // painted neon lines (arm points mapped back to the rest pose by segment)\n if(wearW>.05){vec3 gp=p,gn=nO;bool isA=false;float sg=floor(vX.y+.5);\n#ifdef ARMREST\nisA=true;\n#endif\n\n  if(sg>.5){isA=true;vec3 q=sg>3.5?vec3(-p.x,p.y,p.z):p,qn=sg>3.5?vec3(-nO.x,nO.y,nO.z):nO;float k=sg>3.5?sg-3.:sg;\n   mat3 M=k<1.5?(sg>3.5?MUR:MUL):k<2.5?(sg>3.5?MFR:MFL):(sg>3.5?MHR:MHL);\n   vec3 o=k<1.5?SR_:k<2.5?ER_:WR_,c=k<1.5?SR_:k<2.5?(sg>3.5?E2R:E2L):(sg>3.5?W2R:W2L);gp=o+M*(q-c);gn=M*qn;}\n  float gd=glowD(gp,gn,isA);\n  if(isA&&gp.y<7.75&&gp.y>6.7){float fd=1e3;\n   if(gn.x>.45){vec2 c=vec2(gp.z,gp.y);float m=smoothstep(.01,0.,box2(c,vec2(.0,7.38),vec2(.10,.17),.03));slots((gp.y-7.18)/.055,m,vent,lip);fd=min(fd,trace(c,vec2(.16,7.62),0.,0.,0.)+1e3);}\n   if(gn.z>.35){vec2 c=vec2(gp.x,gp.y);fd=min(fd,trace(vec2(-c.y,c.x),vec2(-7.62,2.34),.30,-.08,.28));}\n   emi+=GLO*(1.9*smoothstep(.016,.008,fd)+.25*exp(-fd*45.));}emi+=wearW*GLO*(3.2*smoothstep(.034,.018,gd)+.5*exp(-gd*30.));}\n // ---- refined detail: vents, circuit traces, data stripes, rank insignia (body and helmet only)\n\n#ifndef ARMREST\n if(floor(vX.y+.5)<.5&&wearW>.05){float ax=abs(p.x);vec2 f=vec2(ax,p.y);\n  vec3 hq=(p-vec3(0,11.38,0))/vec3(1.08,1.28,1.03);float hx=abs(hq.x);float tg=1e3,tp=0.;\n  // helmet: rear exhaust grille, cheek intakes\n  if(nO.z<-.25&&hq.z<-.30){float m=smoothstep(.012,0.,box2(vec2(hx,hq.y),vec2(0.,-.30),vec2(.24,.15),.04));slots((hq.y+.45)/.062,m,vent,lip);vglow=max(vglow,m);}\n  if(abs(nO.x)>.35&&hq.z>-.05&&hq.y<-.25){vec2 c=vec2(hq.z,hq.y);float m=smoothstep(.01,0.,box2(c,vec2(.12,-.43),vec2(.10,.09),.03));slots((c.x+.6*c.y)/.05,m,vent,lip);}\n  // helmet: circuit traces sweeping back above the ear line, data dashes along the crown channels\n  if(abs(nO.x)>.30&&hx>.30&&hq.y>.05&&hq.y<.40){vec2 c=vec2(-hq.z,hq.y);\n   tg=min(tg,trace(c,vec2(-.02,.30),.22,-.06,.18));tg=min(tg,trace(c,vec2(.02,.24),.16,-.07,.20));tg=min(tg,trace(c,vec2(.06,.18),.10,-.06,.10));}\n  if(hq.y>.30&&nO.y>.3&&hq.z<.15){float t=fract(hq.z*13.);if(abs(hx-.215)<.012&&t<.55)tp=max(tp,1.);}\n  // chest: angled vent between the V lines; rank bars on the left breast\n  if(nO.z>.3&&p.z>0.&&p.y>8.2){vec2 dvn=vec2(-.57,.82),dvl=vec2(.82,.57),c=f-vec2(.80,9.20);float m=smoothstep(.012,0.,box2(vec2(dot(c,dvl),dot(c,dvn)),vec2(0.),vec2(.17,.10),.03));slots(dot(c,dvn)/.05+.5,m,vent,lip);\n   if(p.x>0.){float b=min(box2(f,vec2(.66,9.80),vec2(.13,.022),.006),box2(f,vec2(.66,9.72),vec2(.13,.022),.006));float bo=box2(f,vec2(.66,9.76),vec2(.17,.075),.015);\n    float a=smoothstep(.006,0.,b);f0=mix(f0,vec3(.80,.82,.86),a);rough=mix(rough,.22,a);tg=min(tg,abs(bo));}\n   else{tg=min(tg,trace(f,vec2(.30,9.70),.30,-.08,.16));}}\n  // thighs and back plate: circuit traces\n  if(nO.z>.3&&p.z>0.&&p.y<5.8&&p.y>4.2){tg=min(tg,trace(vec2(-f.y,f.x),vec2(-5.55,.66),.35,-.08,.30));}\n  if(nO.z<-.3&&p.z<0.&&p.y>7.6&&p.y<9.0){tg=min(tg,trace(vec2(-f.y,f.x),vec2(-8.92,.62),.30,.12,.32));\n   float m=smoothstep(.01,0.,box2(f,vec2(.46,8.30),vec2(.13,.15),.03));slots((p.y-8.12)/.06,m,vent,lip);}\n  // rank insignia: three silver chevrons edged in blue on the left pauldron\n  if(p.x>0.&&nO.x>.4&&ax>1.90&&p.y>9.25){vec2 g=vec2(p.z+.02,p.y-9.66);\n   float cv=min(chev(g,.14),min(chev(g,.02),chev(g,-.10)));float a=smoothstep(.006,0.,cv);\n   f0=mix(f0,vec3(.82,.84,.88),a);rough=mix(rough,.2,a);tg=min(tg,abs(length(g)-.27));\n   float st=length(g-vec2(0.,.22));if(st<.045){float an=atan(g.y-.22,g.x),r=.045*(.55+.45*cos(5.*an));f0=mix(f0,vec3(.82,.84,.88),smoothstep(.004,0.,st-r));}}\n  emi+=GLO*(1.9*smoothstep(.016,.008,tg)+.25*exp(-tg*45.))+GLO*1.4*tp;\n  f0=mix(f0,vec3(.012),vent);alb=mix(alb,vec3(.004),vent);rough=mix(rough,.6,vent);\n  f0=mix(f0,vec3(.55,.57,.60),lip*.7);rough=mix(rough,.2,lip);emi+=GLO*.35*vent*vglow;}\n#endif\n // helmet: aggressive T slit (scowling brow bar + narrow stem), side ring light, earpiece ring, left mouth vents\n vec3 hp=(p-vec3(0,11.38,0))/vec3(1.08,1.28,1.03);\n if(hp.y>-.75&&hp.y<.6&&hp.z>-.6){float ax=abs(hp.x);float band=ySlit(ax,hp.y);\n  if(hp.z>.12&&band<.012){float core=smoothstep(.012,-.012,band);float a=smoothstep(.012,.0,band);emi=mix(emi,GLO*(2.4+1.0*core)*(1.-.25*smoothstep(.30,.45,ax)),a);f0=mix(f0,vec3(.05),a);alb=mix(alb,vec3(0.,.03,.05),a);metal*=1.-a;}\n  vec3 e=vec3(ax,hp.y,hp.z)-vec3(.53,-.08,-.12);e.xz=rot(.25)*e.xz;\n  if(hp.x<0.&&abs(e.x)<.09)emi+=GLO*3.*smoothstep(.016,.008,abs(length(e.yz)-.10));\n  if(hp.x>.17&&hp.x<.58&&hp.y>-.68&&hp.y<-.28&&hp.z>-.05){float hv=0.,hl=0.;float m=smoothstep(0.,.04,hp.x-.17)*smoothstep(0.,.04,.58-hp.x)*smoothstep(0.,.03,hp.y+.68)*smoothstep(0.,.03,-.28-hp.y);slots((hp.y+.68)/.065-(hp.x-.17)*1.4,m,hv,hl);f0=mix(f0,vec3(.012),hv);alb=mix(alb,vec3(.004),hv);rough=mix(rough,.6,hv);f0=mix(f0,vec3(.55,.57,.60),hl*.7);rough=mix(rough,.2,hl);emi+=GLO*.3*hv;vent=max(vent,hv*.6);}\n  vec3 ep=hp-vec3(.535,-.10,-.06);if(ep.x>.07)emi+=GLO*3.*smoothstep(.016,.008,abs(length(ep.yz)-.075));}\n float occ=vX.x*(1.-.8*vent);\n vec3 L0=normalize(vec3(.8,.6,1.)),L1=normalize(vec3(-.9,.2,1.)),L2=normalize(vec3(.3,.5,-.9));\n float a=max(rough*rough,.03);vec3 col=vec3(0.);\n for(int i=0;i<3;i++){vec3 l=i==0?L0:i==1?L1:L2;vec3 lc=i==0?vec3(1.,.98,.95)*1.5:i==1?vec3(.55,.65,.8)*.6:vec3(.3,.8,1.)*1.1;float nl=max(dot(n,l),0.);\n  vec3 hh=normalize(l+v);float nh=max(dot(n,hh),0.),nv=max(dot(n,v),.001);vec3 Fh=F_s(f0,max(dot(v,hh),0.));\n  float spec=min(D_GGX(nh,a)*.25/max(nl*nv,.05)*nl,8.);col+=lc*(Fh*spec*.6+(1.-metal)*alb*nl*1.4+metal*f0*nl*.12);}\n vec3 r=reflect(rd,n);float up=r.y,sd=r.x;\n vec3 envc=vec3(.05,.07,.10)+vec3(.9,.95,1.)*.9*smoothstep(.55,.85,up)*smoothstep(.9,.3,abs(sd))+vec3(.2,.7,.9)*.35*smoothstep(.5,.9,-sd)+vec3(.6)*.25*smoothstep(-.2,.4,up);\n\n#ifdef LITE\nenvc*=.35;\n#endif\n col+=envc*F_s(f0,max(dot(n,v),0.))*occ*.8;\n if(fab>.01){float fr=pow(1.-max(dot(n,v),0.),2.5);col+=(vec3(.75,.8,.9)*.10*max(dot(n,L0),0.)+vec3(.3,.8,1.)*.18*max(dot(n,L2),0.)+vec3(.15))*fr*fab\n#ifdef LITE\n*.18\n#endif\n;}\n col*=mix(1.,occ,.8);\n#ifdef LITE\ncol*=.62;\n#endif\ncol+=emi;\n col=col*(2.51*col+.03)/(col*(2.43*col+.59)+.14);col=pow(col,vec3(1./2.2));\n gl_FragColor=vec4(col,uOp);}\n";
const OPM_VERT="attribute vec3 aCol,aEmi;attribute vec4 aMR;attribute vec2 aX;varying vec3 vP,vN,vNv,vV,vCol,vEmi;varying vec4 vMR;varying vec2 vX;\nvoid main(){vP=position;vN=normal;vNv=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=mv.xyz;vCol=aCol;vEmi=aEmi;vMR=aMR;vX=aX;gl_Position=projectionMatrix*mv;}";
// armour suits: base operator plus three upgrade tiers; each overrides plate / trim colours and the glow
const SUITS=[{name:'Mk I',glo:[.04,.30,1.],mt:{}},
 {name:'Sentinel Mk II',glo:[.04,.36,1.],mt:{1:[.105,.112,.13,1,.24,1,0],11:[.04,.043,.052,1,.30,1,0],5:[.105,.112,.13,1,.24,1,0],6:[.50,.53,.58,1,.26,0,0]}},
 {name:'Warden Mk III',glo:[.08,.62,1.],mt:{1:[.06,.062,.068,1,.16,1,0],11:[.024,.025,.03,1,.26,1,0],5:[.06,.062,.068,1,.16,1,0],6:[.74,.76,.80,1,.15,0,0]}},
 {name:'Ascendant Mk IV',glo:[.26,.55,1.],mt:{1:[.034,.034,.04,1,.12,1,0],11:[.016,.016,.02,1,.2,1,0],5:[.034,.034,.04,1,.12,1,0],6:[.95,.68,.28,1,.2,0,0]}}];
const SUIT_SRC=[()=>OPM_SRC,()=>OPM_T1,()=>OPM_T2,()=>OPM_T3],SUIT_N=[[0,0],[35064,209910],[35024,209832],[34997,209790]];
// Godot-baked detail maps (R height, G roughness, B emissive mask, A edge wear): one per armour tier plus weapon metal and polymer
const DETSRC={"armor_t0": "data:image/png;base64,<<assets/file_28.png>>", "armor_t1": "data:image/png;base64,<<assets/file_29.png>>", "armor_t2": "data:image/png;base64,<<assets/file_30.png>>", "armor_t3": "data:image/png;base64,<<assets/file_31.png>>", "weapon_metal": "data:image/png;base64,<<assets/file_32.png>>", "weapon_polymer": "data:image/png;base64,<<assets/file_33.png>>"};
const OPT={value:0};const DETX={};const detTex=k=>{if(DETX[k])return DETX[k];const t=new T.TextureLoader().load(DETSRC[k]);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return DETX[k]=t};
// weapons: swap the canvas-painted metal/polymer maps for the Godot-baked ones (albedo from wear, roughness from G, normals from the height channel)
(function godotWeaponMaps(){const N=GFX.N;for(const[k,key,base]of[['metal','weapon_metal',[226,226,230]],['poly','weapon_polymer',[236,236,238]]]){const im=new Image();im.onload=()=>{
  const c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');g.drawImage(im,0,0,N,N);const d=g.getImageData(0,0,N,N).data;
  const mk=()=>{const q=document.createElement('canvas');q.width=q.height=N;return[q,q.getContext('2d')]},[ac,a]=mk(),[rc,r]=mk(),[hc,h]=mk();
  const A=a.createImageData(N,N),Rr=r.createImageData(N,N),H=h.createImageData(N,N);
  for(let i=0;i<N*N;i++){const o=i*4,hv=d[o],rv=d[o+1],wv=d[o+3];const t=.92+.08*(hv/255-.5)*2+.1*wv/255;
   A.data[o]=Math.min(255,base[0]*t);A.data[o+1]=Math.min(255,base[1]*t);A.data[o+2]=Math.min(255,base[2]*t);A.data[o+3]=255;
   Rr.data[o]=Rr.data[o+1]=Rr.data[o+2]=Math.max(30,Math.min(255,rv*.85+40-wv*.25));Rr.data[o+3]=255;H.data[o]=H.data[o+1]=H.data[o+2]=hv;H.data[o+3]=255}
  a.putImageData(A,0,0);r.putImageData(Rr,0,0);h.putImageData(H,0,0);const T_=GFX._tx[k],n=GFX._nrm(hc,k==='poly'?3:2);
  T_.map.image=ac;T_.map.needsUpdate=true;T_.rough.image=rc;T_.rough.needsUpdate=true;T_.nrm.image=n;T_.nrm.needsUpdate=true};im.src=DETSRC[key]}})();
function opGeo(src,NV,NI,LO,HI,tier){
  const raw=atob(src),buf=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)buf[i]=raw.charCodeAt(i);
  const dv=new DataView(buf.buffer),pos=new Float32Array(NV*3),nrm=new Float32Array(NV*3),col=new Float32Array(NV*3),emi=new Float32Array(NV*3),mr=new Float32Array(NV*4),xx=new Float32Array(NV*2);
  // material table: colour, metal, roughness, wear (armour), fabric, emissive
  const MT={1:[.085,.088,.096,1,.22,1,0],11:[.032,.033,.038,1,.30,1,0],8:[.62,.64,.68,1,.20,0,0],4:[.030,.032,.036,0,.52,0,1],13:[.030,.028,.026,0,.48,0,.6],15:[.028,.027,.026,0,.46,0,0],14:[.05,.05,.055,0,.8,0,0],9:[.018,.018,.018,0,.85,0,0],2:[.0,.03,.05,0,.05,0,0],5:[.085,.088,.096,1,.22,1,0],12:[.02,.06,.08,0,.3,0,0]};
  const SU=SUITS[tier||0],SM=SU.mt,GL=SU.glo;
  for(let i=0;i<NV;i++){const o=i*12;for(let k=0;k<3;k++){pos[i*3+k]=LO[k]+(HI[k]-LO[k])*dv.getUint16(o+k*2,true)/65535;nrm[i*3+k]=dv.getInt8(o+8+k)/127}
   const id=buf[o+6],sg=buf[o+7],t=SM[id]||MT[id]||MT[1];col.set(t.slice(0,3),i*3);mr.set([t[3],t[4],t[5],t[6]],i*4);xx[i*2]=buf[o+11]/255;xx[i*2+1]=sg;
   if(id===12)emi.set([GL[0]*1.8,GL[1]*1.8,GL[2]*1.8],i*3);if(id===7)emi.set([GL[0]*2.8,GL[1]*2.8,GL[2]*2.8],i*3)}
  const ix=new Uint16Array(buf.buffer.slice(NV*12,NV*12+NI*2));
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nrm,3));
  g.setAttribute('aCol',new T.BufferAttribute(col,3));g.setAttribute('aEmi',new T.BufferAttribute(emi,3));g.setAttribute('aMR',new T.BufferAttribute(mr,4));g.setAttribute('aX',new T.BufferAttribute(xx,2));
  g.setIndex(new T.BufferAttribute(ix,1));g.computeBoundingSphere();
  return g}
function opMat(arm,tier){return new T.ShaderMaterial({uniforms:{uOp:{value:1},uGlo:{value:new T.Vector3(...SUITS[tier||0].glo)},uDet:{value:detTex('armor_t'+(tier||0))},uDetK:{value:1},uTime:OPT},vertexShader:OPM_VERT,fragmentShader:OPM_FRAG,defines:arm?{ARMREST:1,LITE:1}:{},extensions:{derivatives:true},toneMapped:false})}
const OPA_SRC='<<assets/data_59.b64>>',OPA_N=[6996,42000],OPA_LO=[1.3,5.05,-0.85],OPA_HI=[3.0,8.4,0.9];
const A3=(()=>{try{
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 const cv=document.createElement('canvas');cv.id='av3';cv.setAttribute('aria-label','3D operative, drag to rotate');
 const r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'low-power'});
 r.setPixelRatio(Math.min(devicePixelRatio,2));r.setClearColor(0,0);
 r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.1;
 r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
 const sc=new T.Scene(),cam=new T.PerspectiveCamera(8,1,.5,160);
 // studio environment so the metal has something to reflect
 {const es=new T.Scene();es.add(new T.Mesh(new T.BoxGeometry(14,9,14),new T.MeshBasicMaterial({color:0x0b0a14,side:T.BackSide})));
  const pnl=(c,k,w,h,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,1,0);es.add(m)};
  pnl(0xdfe8ff,4,5,2.5,1.5,4.2,3.5);pnl(0x9fb4ff,1.4,3,4,-5,1.5,2);pnl(0x3aaeff,6,.5,5,4.5,1.5,-3);pnl(0xff2bd6,4,.5,5,-4.5,1.5,-3);pnl(0x3a3a48,1,10,10,0,-4,0);
  const pm=new T.PMREMGenerator(r);sc.environment=pm.fromScene(es,.04).texture;pm.dispose()}
 sc.add(new T.HemisphereLight(0x8a94c0,0x14081e,.4));
 const key=new T.DirectionalLight(0xe4ecff,2.2);key.position.set(1.4,3.2,2.6);key.target.position.set(0,.95,0);sc.add(key,key.target);
 key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1.4,right:1.4,top:2.4,bottom:-1.2,near:.5,far:8});key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.0004;key.shadow.normalBias=.02;
 const rimA=new T.PointLight(0x4aa8ff,4,7,1);rimA.position.set(-1.4,2.1,-1.3);
 const rimB=new T.PointLight(0xff2bd6,2.4,7,1);rimB.position.set(1.4,1.6,-1.3);
 const fill=new T.PointLight(0x7f8cff,.7,7,1);fill.position.set(-.9,1.2,2.2);sc.add(rimA,rimB,fill);
 // floor: soft contact shadow, dark pad, glowing ring
 const sg=new T.Mesh(new T.CircleGeometry(1.1,48),new T.ShadowMaterial({opacity:.75}));sg.rotation.x=-Math.PI/2;sg.receiveShadow=true;sc.add(sg);
 const pad=new T.Mesh(new T.CircleGeometry(.66,48),new T.MeshBasicMaterial({color:0x05030f,transparent:true,opacity:.6}));pad.rotation.x=-Math.PI/2;pad.position.y=.001;
 const ringM=new T.MeshBasicMaterial({color:0xff2bd6,transparent:true,opacity:.8,toneMapped:false,side:T.DoubleSide});
 const ring=new T.Mesh(new T.RingGeometry(.66,.685,72),ringM);ring.rotation.x=-Math.PI/2;ring.position.y=.003;sc.add(ring);
 // floating hologram scroll behind the operative: the NEON CORE title projected on a curved sheet between two glowing rollers
 {const HW=2.5,HH=1.42,cy=1.42,cz=-1.55,img=new Image(),tx=new T.Texture(img);img.onload=()=>{tx.needsUpdate=true};img.src='data:image/jpeg;base64,<<assets/file_34.jpg>>';tx.encoding=T.sRGBEncoding;tx.minFilter=T.LinearFilter;
  const g=new T.CylinderGeometry(3.2,3.2,HH,48,1,true,-HW/3.2/2,HW/3.2);g.rotateY(Math.PI);g.translate(0,0,3.2);   // gentle curve, concave toward the camera
  const u={uMap:{value:tx},uT:{value:0}};
  const m=new T.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform sampler2D uMap;uniform float uT;varying vec2 vUv;\n'+
   'float h(float x){return fract(sin(x*91.7)*43758.5);}\n'+
   'void main(){vec2 uv=vec2(1.-vUv.x,vUv.y);float band=step(.985,h(floor(uT*3.))) * step(abs(uv.y-fract(uT*.37)),.03);uv.x+=band*.012*sin(uT*80.);\n'+
   ' vec3 c=vec3(texture2D(uMap,uv+vec2(.0018,0.)).r,texture2D(uMap,uv).g,texture2D(uMap,uv-vec2(.0018,0.)).b);\n'+
   ' float scan=.78+.22*sin(uv.y*620.+uT*9.);float roll=.88+.12*smoothstep(.0,.08,abs(fract(uv.y-uT*.11)-.5));\n'+
   ' float edge=smoothstep(0.,.05,uv.x)*smoothstep(1.,.95,uv.x)*smoothstep(0.,.04,uv.y)*smoothstep(1.,.96,uv.y);\n'+
   ' float flick=.92+.08*h(floor(uT*14.));vec3 tint=vec3(.75,.9,1.15);\n'+
   ' vec3 col=c*tint*scan*roll*flick*edge*1.15+vec3(.04,.12,.25)*edge*.35;gl_FragColor=vec4(col,1.);}'});
  const sheet=new T.Mesh(g,m),holo=new T.Group();holo.add(sheet);
  // rollers (scroll ends) with emissive caps and a faint projector glow under the bottom roller
  const rollM=new T.MeshStandardMaterial({color:0x10131c,metalness:.85,roughness:.3}),glowC=new T.MeshBasicMaterial({color:0x21e6ff,toneMapped:false});
  for(const sy of[-1,1]){const y=sy*(HH/2+.035);const rl=new T.Mesh(new T.CylinderGeometry(.03,.03,HW*1.04,20),rollM);rl.rotation.z=Math.PI/2;rl.position.set(0,y,-.02);holo.add(rl);
   const ln=new T.Mesh(new T.CylinderGeometry(.033,.033,HW*.96,20,1,true),new T.MeshBasicMaterial({color:sy>0?0x21e6ff:0xff2bd6,transparent:true,opacity:.35,toneMapped:false,blending:T.AdditiveBlending,depthWrite:false}));ln.rotation.z=Math.PI/2;ln.position.copy(rl.position);holo.add(ln);
   for(const sx of[-1,1]){const cap=new T.Mesh(new T.CylinderGeometry(.045,.045,.05,20),rollM);cap.rotation.z=Math.PI/2;cap.position.set(sx*HW*.535,y,-.02);holo.add(cap);
    const lit=new T.Mesh(new T.CircleGeometry(.03,20),glowC);lit.position.set(sx*(HW*.535+.026),y,-.02);lit.rotation.y=sx*Math.PI/2;holo.add(lit)}}
  holo.position.set(0,cy,cz);sc.add(holo);
  sheet.onBeforeRender=()=>{const t=performance.now()/1000;u.uT.value=t;holo.position.y=cy+Math.sin(t*.8)*.025;holo.rotation.y=Math.sin(t*.35)*.04}}
 // drifting embers
 const EM=70,eg=new T.BufferGeometry(),ep=new Float32Array(EM*3);
 for(let i=0;i<EM;i++){const a=rnd()*6.28,d=.5+rnd()*1.1;ep[i*3]=Math.cos(a)*d;ep[i*3+1]=rnd()*2.4;ep[i*3+2]=Math.sin(a)*d-.4}
 eg.setAttribute('position',new T.BufferAttribute(ep,3));
 sc.add(new T.Points(eg,new T.PointsMaterial({color:0xff7a3d,size:.018,transparent:true,opacity:.85,toneMapped:false})));
 const spin=new T.Group();sc.add(spin);
 // menu avatar: the Elite Operator character, pre-rendered as a 48-angle turntable (7.5 degree steps) and shown on a camera-facing card
 // that cross-fades between neighbouring angles as the operative is turned; the floor ring and embers stay real 3D around it
 // menu avatar: the Elite Operator as a real-time 3D mesh (35k vertices) with the character's own shading, posed holding a rifle
 const OP=(()=>{const S=1.92/11.9,NV=35166,NI=209928,LO=[-3.1,-0.2,-2.0],HI=[3.1,12.6,3.4];
  const GEO=[opGeo(OPM_SRC,NV,NI,LO,HI,0)],g=GEO[0];
  const mat=opMat(0,0);
  const geoOf=t=>GEO[t]||(GEO[t]=opGeo(SUIT_SRC[t](),t?SUIT_N[t][0]:NV,t?SUIT_N[t][1]:NI,LO,HI,t));
  const mesh=new T.Mesh(g,mat);mesh.scale.setScalar(S);mesh.castShadow=true;mesh.frustumCulled=false;spin.add(mesh);
  const GP=new T.Vector3(-0.06122,1.27678,0.22556),GB=new T.Matrix4().makeBasis(new T.Vector3(0.67152,-0.00000,-0.74099),new T.Vector3(0.37124,0.86545,0.33643),new T.Vector3(0.64128,-0.50100,0.58116));
  // soft idle boost from the bottom of the pack: Mk III fires from its two exhaust stacks; Mk IV adds its twin thruster nozzles
  const JP=new T.Group();mesh.add(JP);const jpl=[];
  const mkJ=(x,y,z,len,r,col,tierMin)=>{const p=jetPlume(len,r,col);p.position.set(x,y,z);p.userData.tm=tierMin;JP.add(p);jpl.push(p)};
  for(const sx of[-1,1]){mkJ(sx*.62,8.27,-1.30,2.6,.10,0x5aa0ff,2);mkJ(sx*.30,7.94,-1.24,3.4,.12,0x7aa8ff,3)}
  JP.onBeforeRender=()=>{};const jpTick=()=>{const t=performance.now()/1000,k=.78+.12*Math.sin(t*2.1);jpl.forEach(p=>{const on=tier>=p.userData.tm;p.visible=on;if(on)p.userData.set(k,t)})};
  mesh.onBeforeRender=jpTick;
  let tier=0;const setTier=t=>{t=t||0;if(t===tier)return;tier=t;mesh.geometry=geoOf(t);mat.uniforms.uGlo.value.set(...SUITS[t].glo);mat.uniforms.uDet.value=detTex('armor_t'+t)};
  return{ready:true,GP,GB,mesh,JP,update(ry,yo){mesh.position.y=yo},setTier,geoOf,get tier(){return tier}}})();
 let heldGun=null;

 // worn armor-plate surface: grime, seams, rivets, scratches -> color, roughness and a normal map
 const TX=(()=>{const N=512,mk=()=>{const c=document.createElement('canvas');c.width=c.height=N;return[c,c.getContext('2d')]};
  const[hc,h]=mk(),[ac,a]=mk(),[rc2,ro]=mk();
  h.fillStyle='#808080';h.fillRect(0,0,N,N);a.fillStyle='#8e8f99';a.fillRect(0,0,N,N);ro.fillStyle='#808080';ro.fillRect(0,0,N,N);
  for(let i=0;i<30;i++){const x=rnd()*N,y=rnd()*N,R=20+rnd()*70,g=a.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,'rgba(12,12,16,.16)');g.addColorStop(1,'rgba(12,12,16,0)');a.fillStyle=g;a.fillRect(x-R,y-R,R*2,R*2)}
  for(let i=0;i<14000;i++){const x=rnd()*N,y=rnd()*N,s=1+rnd()*2.5,v=rnd(),c=v<.5?40:190;
   a.fillStyle=`rgba(${c},${c},${c+8},${.05+rnd()*.1})`;a.fillRect(x,y,s,s);
   h.fillStyle=`rgba(${v<.5?105:150},${v<.5?105:150},${v<.5?105:150},.3)`;h.fillRect(x,y,s,s);
   ro.fillStyle=`rgba(${v*255|0},${v*255|0},${v*255|0},.1)`;ro.fillRect(x,y,s*2,s*2)}
  const seams=[[18,18,N-18,18],[N-18,18,N-18,N-18],[N-18,N-18,18,N-18],[18,N-18,18,18],[18,N*.58,N-18,N*.58],[N*.4,N*.58,N*.4,N-18]];
  const line=(c,col,w,o)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();seams.forEach(([x1,y1,x2,y2])=>{c.moveTo(x1+o,y1+o);c.lineTo(x2+o,y2+o)});c.stroke()};
  line(h,'#1c1c1c',5,0);line(h,'#bdbdbd',2,4);line(a,'rgba(8,8,12,.9)',4,0);line(a,'rgba(205,210,225,.35)',1.5,3.5);line(ro,'#d8d8d8',5,0);
  [[34,34],[N-34,34],[34,N-34],[N-34,N-34],[N*.4+18,N*.58+18],[N-34,N*.58+18]].forEach(([x,y])=>{h.fillStyle='#dcdcdc';h.beginPath();h.arc(x,y,5,0,7);h.fill();a.fillStyle='#4e4f58';a.beginPath();a.arc(x,y,5,0,7);a.fill()});
  for(let i=0;i<130;i++){const x=rnd()*N,y=rnd()*N,dx=(rnd()-.5)*60,dy=(rnd()-.5)*16;
   a.strokeStyle=`rgba(215,219,232,${.15+rnd()*.35})`;a.lineWidth=.6+rnd();a.beginPath();a.moveTo(x,y);a.lineTo(x+dx,y+dy);a.stroke();
   ro.strokeStyle='rgba(20,20,20,.6)';ro.lineWidth=1.5;ro.beginPath();ro.moveTo(x,y);ro.lineTo(x+dx,y+dy);ro.stroke();
   h.strokeStyle='rgba(60,60,60,.5)';h.lineWidth=1;h.beginPath();h.moveTo(x,y);h.lineTo(x+dx,y+dy);h.stroke()}
  const hd=h.getImageData(0,0,N,N).data,[nc,n]=mk(),nd=n.createImageData(N,N),H=(x,y)=>hd[(((y+N)%N)*N+((x+N)%N))*4]/255;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=(H(x+1,y)-H(x-1,y))*3,dy=(H(x,y+1)-H(x,y-1))*3,l=Math.hypot(dx,dy,1),i=(y*N+x)*4;nd.data[i]=(-dx/l*.5+.5)*255;nd.data[i+1]=(dy/l*.5+.5)*255;nd.data[i+2]=(1/l*.5+.5)*255;nd.data[i+3]=255}
  n.putImageData(nd,0,0);
  const tx=(c,s)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(s)t.encoding=T.sRGBEncoding;t.anisotropy=4;return t};
  return{map:tx(ac,1),nrm:tx(nc),rgh:tx(rc2)}})();

 // rounded box with true smooth normals
 function rbox(w,h,d,rad,seg=3){rad=Math.min(rad,w/2-1e-4,h/2-1e-4,d/2-1e-4);const g=new T.BoxGeometry(w,h,d,seg*2,seg*2,seg*2),p=g.attributes.position,nm=g.attributes.normal,v=V(0,0,0),c=V(0,0,0),o=V(0,0,0),ix=w/2-rad,iy=h/2-rad,iz=d/2-rad;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(cl(v.x,-ix,ix),cl(v.y,-iy,iy),cl(v.z,-iz,iz));o.subVectors(v,c);
   if(o.lengthSq()>1e-12){o.setLength(rad);p.setXYZ(i,c.x+o.x,c.y+o.y,c.z+o.z);o.normalize();nm.setXYZ(i,o.x,o.y,o.z)}}
  return g}
 // taper width along height (bottom scale -> top scale)
 function tap(g,b,t,z){const p=g.attributes.position;g.computeBoundingBox();const y0=g.boundingBox.min.y,y1=g.boundingBox.max.y;for(let i=0;i<p.count;i++){const k=b+(t-b)*(p.getY(i)-y0)/(y1-y0);p.setX(i,p.getX(i)*k);if(z)p.setZ(i,p.getZ(i)*k)}return g}
 // a group at a, with +y pointing to b and +z toward the hint
 function frame(par,a,b,hint){const y=b.clone().sub(a),L=y.length();y.normalize();const z=hint.clone().addScaledVector(y,-hint.dot(y)).normalize(),x=V(0,0,0).crossVectors(y,z),g=new T.Group();g.position.copy(a);g.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));par.add(g);return[g,L]}
 // two-bone IK: elbow/knee position
 function ik(S,Hd,L1,L2,pole){const d0=Hd.clone().sub(S);let d=Math.min(d0.length(),L1+L2-1e-3);const dir=d0.normalize(),a=(L1*L1-L2*L2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,L1*L1-a*a)),pv=pole.clone().addScaledVector(dir,-pole.dot(dir)).normalize();return S.clone().addScaledVector(dir,a).addScaledVector(pv,hh)}

 let fig=null,fx={},lastKey='',dragging=false,resumeAt=0,lw=0,lh=0;
 function dispose(o){o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(q=>q.dispose())})}
 // ---- helpers for the operative model
 function bow(g,amt){const p=g.attributes.position;g.computeBoundingBox();const hw=(g.boundingBox.max.x-g.boundingBox.min.x)/2||1;for(let i=0;i<p.count;i++){const u=p.getX(i)/hw;p.setZ(i,p.getZ(i)-amt*u*u)}g.computeVertexNormals();return g}
 const uvs=(g,k)=>{const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*k+.3,u.getY(i)*k+.3);return g};
 const tube=(pts,rad,m)=>new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),Math.max(20,pts.length*10),rad,6,false),m);
 // faceted armor-tile surface (color, normal, roughness), built once
 const TILE=(()=>{const N=512,mk=()=>{const c=document.createElement('canvas');c.width=c.height=N;return[c,c.getContext('2d')]};
  const[ac,a]=mk(),[hc,h]=mk(),[rc,ro]=mk();
  a.fillStyle='#16171c';a.fillRect(0,0,N,N);h.fillStyle='#303030';h.fillRect(0,0,N,N);ro.fillStyle='#909090';ro.fillRect(0,0,N,N);
  const S=37,rows=Math.round(N/(S*1.5)),cols=Math.round(N/(S*Math.sqrt(3))),dx=N/cols,dy=N/rows,J={};
  const jit=(i,j)=>{const k=((i%cols)+cols)%cols+','+((j%rows)+rows)%rows;return J[k]||(J[k]=[(rnd()-.5)*dx*.28,(rnd()-.5)*dy*.28])};
  for(let j=-1;j<=rows;j++)for(let i=-1;i<=cols;i++){const jj=jit(i,j),cx=(i+(j%2?.5:0))*dx+jj[0],cy=j*dy+jj[1],pts=[];
   for(let k=0;k<6;k++){const an=Math.PI/6+k*Math.PI/3,rr=S*(.8+rnd()*.35);pts.push([cx+Math.cos(an)*rr*.98,cy+Math.sin(an)*rr*.86])}
   const v=44+rnd()*34|0,hv=150+rnd()*40|0,rv=120+rnd()*60|0;
   for(const ox of[-N,0,N])for(const oy of[-N,0,N]){const path=c=>{c.beginPath();pts.forEach(([x,y],k)=>k?c.lineTo(x+ox,y+oy):c.moveTo(x+ox,y+oy));c.closePath()};
    a.fillStyle=`rgb(${v},${v+2},${v+7})`;path(a);a.fill();h.fillStyle=`rgb(${hv},${hv},${hv})`;path(h);h.fill();ro.fillStyle=`rgb(${rv},${rv},${rv})`;path(ro);ro.fill();
    a.strokeStyle='rgba(8,9,12,.95)';a.lineWidth=2.4;path(a);a.stroke();h.strokeStyle='#202020';h.lineWidth=3;path(h);h.stroke();
    a.strokeStyle='rgba(160,170,190,.28)';a.lineWidth=1;a.beginPath();a.moveTo(pts[3][0]+ox+1,pts[3][1]+oy+1);a.lineTo(pts[4][0]+ox,pts[4][1]+oy+1);a.lineTo(pts[5][0]+ox-1,pts[5][1]+oy+1);a.stroke()}}
  for(let i=0;i<4000;i++){const v=rnd();a.fillStyle=`rgba(${v<.5?10:180},${v<.5?10:185},${v<.5?14:200},.08)`;a.fillRect(rnd()*N,rnd()*N,1.5,1.5)}
  for(let i=0;i<80;i++){const x=rnd()*N,y=rnd()*N;a.strokeStyle=`rgba(190,195,210,${.12+rnd()*.25})`;a.lineWidth=.7;a.beginPath();a.moveTo(x,y);a.lineTo(x+(rnd()-.5)*22,y+(rnd()-.5)*7);a.stroke()}
  const hd=h.getImageData(0,0,N,N).data,[nc,n]=mk(),nd=n.createImageData(N,N),H=(x,y)=>hd[(((y+N)%N)*N+((x+N)%N))*4]/255;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=(H(x+1,y)-H(x-1,y))*2.2,gy=(H(x,y+1)-H(x,y-1))*2.2,l=Math.hypot(gx,gy,1),i=(y*N+x)*4;nd.data[i]=(-gx/l*.5+.5)*255;nd.data[i+1]=(gy/l*.5+.5)*255;nd.data[i+2]=(1/l*.5+.5)*255;nd.data[i+3]=255}
  n.putImageData(nd,0,0);
  const tx=(c,s)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(s)t.encoding=T.sRGBEncoding;t.anisotropy=4;return t};
  return{map:tx(ac,1),nrm:tx(nc),rgh:tx(rc)}})();
 function rboxT(w,h,d,rad,seg=3){const g=rbox(w,h,d,rad,seg),u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*Math.max(.55,Math.max(w,d)*2.1),u.getY(i)*Math.max(.55,Math.max(h,d)*2.1));return g}
 // realistic carry styles: grip point, barrel direction, gun "up", support-hand distance along the barrel, elbow poles
 const STY={
  pulse:  {name:'Low ready',G:V(-.17,1.24,.3),D:V(.5,-.25,.83),U:V(0,1,0),f:.22,pr:V(-1,-.3,-.6),pl:V(1,-.8,.1)},
  scatter:{name:'Port arms',G:V(-.16,1.15,.34),D:V(.5,.62,.6),U:V(0,0,1),f:.3,pr:V(-1,-.5,-.3),pl:V(1,-.6,.2)},
  rail:   {name:'Sling ready',G:V(-.16,1.2,.3),D:V(.45,-.5,.75),U:V(0,1,0),f:.26,pr:V(-1,-.3,-.6),pl:V(1,-.8,.1)},
  smg:    {name:'High ready',G:V(-.1,1.34,.36),D:V(.14,.3,.94),U:V(0,.95,-.3),f:.16,pr:V(-1,-.8,-.3),pl:V(1,-.7,-.1)},
  arc:    {name:'Hip carry',G:V(-.18,1.2,.28),D:V(.35,0,.94),U:V(0,1,0),f:.24,pr:V(-1,-.6,-.2),pl:V(1,-.8,0)},
  ion:    {name:'Underarm carry',G:V(-.2,1.1,.3),D:V(.3,-.08,.95),U:V(0,1,0),f:.3,pr:V(-1,-.7,-.1),pl:V(1,-.9,0)},
  cryo:   {name:'Low ready',G:V(-.16,1.22,.3),D:V(.45,-.38,.81),U:V(0,1,0),f:.2,pr:V(-1,-.3,-.6),pl:V(1,-.8,.1)},
  void:   {name:'Close carry',G:V(-.14,1.27,.31),D:V(.42,.12,.9),U:V(0,1,0),f:.2,pr:V(-1,-.5,-.4),pl:V(1,-.8,0)},
  burst:  {name:'Compressed ready',G:V(-.1,1.3,.33),D:V(.3,-.45,.84),U:V(0,1,0),f:.18,pr:V(-1,-.6,-.3),pl:V(1,-.8,-.1)},
  chain:  {name:'Cross carry',G:V(-.18,1.12,.33),D:V(.55,.5,.67),U:V(0,0,1),f:.26,pr:V(-1,-.5,-.3),pl:V(1,-.6,.2)}};
 function make(a,w,s){
  const fig=new T.Group(),FIG=fig;fx={};
  const B={Light:.94,Medium:1,Heavy:1.09,Stealth:.94,Support:1,Tech:1.03}[a.cls]||1;
  const plate=new T.MeshPhysicalMaterial({color:new T.Color(0x8a90a0).lerp(new T.Color(a.p3d),.25),envMapIntensity:.55,map:TILE.map,normalMap:TILE.nrm,roughnessMap:TILE.rgh,metalness:.72,roughness:.55,clearcoat:.35,clearcoatRoughness:.4,side:T.DoubleSide});
  const plateD=plate.clone();plateD.color=new T.Color(0x3e424c);
  const suit=new T.MeshStandardMaterial({envMapIntensity:.08,color:0x020203,roughness:.88,metalness:.1});
  const dark=new T.MeshStandardMaterial({envMapIntensity:.15,color:0x050507,roughness:.5,metalness:.7,normalMap:TILE.nrm,normalScale:new T.Vector2(.6,.6)});
  const gunM=new T.MeshPhysicalMaterial({color:0x111317,envMapIntensity:.3,metalness:.85,roughness:.3,clearcoat:.35,clearcoatRoughness:.25});
  const lens=new T.MeshPhysicalMaterial({color:0x05070d,metalness:.9,roughness:.08,clearcoat:1});
  const glow=new T.MeshBasicMaterial({color:new T.Color(0x1440ff).multiplyScalar(1.6),toneMapped:false});
  const acc=new T.MeshBasicMaterial({color:new T.Color(a.c1).multiplyScalar(1.25),toneMapped:false});
  const wG=new T.MeshBasicMaterial({color:w.col,toneMapped:false}),skG=new T.MeshBasicMaterial({color:new T.Color(s.col),toneMapped:false});
  const M=(p,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{if(geo.isMesh){p.add(geo);return geo}const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);if(m.type!=='MeshBasicMaterial')o.castShadow=o.receiveShadow=true;p.add(o);return o};
  const RB=(x,y,z,rr)=>rboxT(x,y,z,rr??Math.min(x,y,z)*.3);
  const bar=(p,m,w_,h_,d_,x,y,z,rx=0,ry=0,rz=0)=>M(p,new T.BoxGeometry(w_,h_,d_),m,x,y,z,rx,ry,rz);
  const glowBar=(p,w_,h_,x,y,z,rx=0,ry=0,rz=0,m=glow)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.set(rx,ry,rz);p.add(g);M(g,RB(w_+.016,h_+.016,.014,.006),dark);M(g,RB(w_,h_,.01,Math.min(w_,h_)*.45),m,0,0,.006);return g};
  const ball=(p,rad,m,v)=>M(p,new T.SphereGeometry(rad,24,16),m,v.x,v.y,v.z);
  const limb=(p,A,Bp,r1,r2,m,hint=V(0,0,1))=>{const[f,L]=frame(p,A,Bp,hint);M(f,new T.CylinderGeometry(r2,r1,L,24),m,0,L/2,0);return[f,L]};
  const dome=(p,rad,sx_,sy_,sz_,m,x,y,z,frac=.55)=>{const o=M(p,new T.SphereGeometry(rad,36,18,0,Math.PI*2,0,Math.PI*frac),m,x,y,z);o.scale.set(sx_,sy_,sz_);return o};

  // ---- legs (rig built at hero scale, then slimmed to human proportions: hips ~0.09 m, crotch ~0.94 m)
  {const fig=new T.Group();fig.scale.set(.72,.99,.76);FIG.add(fig);
  for(const sx of[-1,1]){const sl=-sx,hip=V(sx*.13,1.0,0),ank=V(sx*.19,.13,0),knee=ik(hip,ank,.45,.44,V(sx*.1,0,1));
   ball(fig,.12,suit,hip);
   const[th,tL]=limb(fig,hip,knee,.125,.1,suit);
   M(th,bow(tap(RB(.24,tL*.86,.06,.025),.8,1),.09),plate,0,tL*.47,.1,-.03);
   M(th,tap(RB(.075,tL*.8,.2,.03),.85,1,1),plate,sl*.12,tL*.47,0);
   M(th,tap(RB(.06,tL*.7,.17,.025),.85,1,1),plateD,-sl*.1,tL*.5,0);
   M(th,bow(RB(.22,tL*.75,.06,.025),-.06),plateD,0,tL*.5,-.1);
   M(th,RB(.13,.09,.05,.02),plate,sl*.06,tL*.85,.13,-.15);
   glowBar(th,.016,.11,sl*.07,tL*.25,.145,-.05,sl*.15,0);
   glowBar(th,.015,.12,sl*.157,tL*.4,0,0,sl*Math.PI/2,0);
   ball(fig,.085,suit,knee);
   const[sh,sL]=limb(fig,knee,ank,.09,.07,suit);
   dome(sh,.085,1,1,.75,plate,0,0,.055).rotation.x=Math.PI/2;
   M(sh,RB(.16,.06,.06,.02),plateD,0,-.06,.1,-.2);
   {const kr=new T.Group();kr.position.set(sl*.105,.01,0);kr.rotation.y=sl*Math.PI/2;sh.add(kr);M(kr,new T.CylinderGeometry(.034,.034,.02,24),dark,0,0,0,Math.PI/2);M(kr,new T.TorusGeometry(.024,.0045,8,24),acc,0,0,.011)}
   M(sh,bow(tap(RB(.21,sL*.72,.07,.03),1.05,.85),.06),plate,0,sL*.47,.075);
   M(sh,tap(RB(.2,sL*.62,.13,.04),1.1,.8,1),plateD,0,sL*.42,-.045);
   glowBar(sh,.017,.15,sl*.04,sL*.62,.115,.05,0,0);
   glowBar(sh,.016,.12,sl*.07,sL*.42,.11,.05,0,sl*.15);
   M(sh,tube([V(sl*.11,sL*.2,.04),V(sl*.115,sL*.45,.03),V(sl*.105,sL*.7,-.01)],.006,glow));
   const bt=new T.Group();bt.position.set(ank.x,0,ank.z);bt.rotation.y=sx*.08;fig.add(bt);
   M(bt,RB(.2,.17,.34,.05),plate,0,.1,.05);M(bt,RB(.215,.05,.37,.02),dark,0,.025,.05);
   M(bt,RB(.18,.1,.13,.04),plate,0,.085,.2,.2);M(bt,RB(.19,.12,.1,.035),plateD,0,.2,-.07);
   M(bt,RB(.17,.08,.14,.035),plate,0,.2,.06,-.15);
   glowBar(bt,.09,.016,sl*.02,.095,.268,.1,0,0);glowBar(bt,.1,.016,sl*.102,.1,.08,0,sl*Math.PI/2,0)}}

  // ---- pelvis, torso, backpack: narrower V-taper chest, real waist, shoulders at ~1.43 m
  const TG=new T.Group();TG.scale.set(.74,.82,.75);TG.position.y=.17;fig.add(TG);
  {const fig=TG;
  M(fig,RB(.46,.14,.32,.05),suit,0,1.0,0);
  M(fig,RB(.52,.1,.36,.035),dark,0,1.07,0);
  for(const[x,z,ry,w_]of[[-.17,.15,-.25,.1],[-.06,.18,0,.08],[.06,.18,0,.08],[.17,.15,.25,.1],[-.25,.03,-1.35,.1],[.25,.03,1.35,.1],[0,-.18,0,.16]]){M(fig,RB(w_,.1,.06,.018),plateD,x,1.06,z,0,ry,0);M(fig,RB(w_*.9,.025,.065,.008),dark,x,1.1,z,0,ry,0)}
  M(fig,bow(tap(RB(.17,.17,.06,.025),.6,1),.03),plate,0,.94,.15,.12);
  for(const sx of[-1,1])M(fig,bow(RB(.17,.24,.05,.02),.03),plate,sx*.24,.93,.04,0,sx*.35,sx*.12);
  M(fig,bow(RB(.34,.16,.06,.025),-.04),plateD,0,.95,-.17,-.12);
  // ---- abdomen + torso
  {const ab=M(fig,new T.CylinderGeometry(.22,.2,.3,32),suit,0,1.24,0);ab.scale.z=.75;
   for(let i=0;i<3;i++)for(const sx of[-1,1])M(fig,RB(.11,.08,.05,.018),plateD,sx*.065,1.15+i*.09,.14-i*.004,-.05);
   for(const sx of[-1,1])M(fig,RB(.08,.26,.24,.03),plateD,sx*.2,1.26,-.01,0,0,sx*.06)}
  M(fig,tap(rbox(.66,.42,.44,.1),.82,1,1),plateD,0,1.5,-.02);
  for(const sx of[-1,1]){M(fig,bow(tap(RB(.3,.27,.09,.04),.85,1),.04),plate,sx*.15,1.53,.15,-.08,sx*.22,sx*-.04);M(fig,RB(.22,.1,.12,.03),plate,sx*.25,1.62,.08,-.3,sx*.4,sx*.3)}
  for(const sx of[-1,1]){M(fig,tube([V(sx*.06,1.66,.15),V(sx*.15,1.65,.17),V(sx*.25,1.6,.15)],.006,glow));M(fig,tube([V(sx*.24,1.47,.19),V(sx*.17,1.42,.215),V(sx*.08,1.375,.22)],.0075,glow))}
  glowBar(fig,.075,.016,0,1.585,.208,-.1,0,0);
  glowBar(fig,.06,.016,0,1.35,.205,.05,0,0,acc);
  M(fig,RB(.07,.05,.05,.015),plateD,0,1.47,.2);M(fig,new T.CylinderGeometry(.014,.014,.01,18),skG,0,1.47,.227,Math.PI/2);
  M(fig,new T.CylinderGeometry(.075,.085,.14,24),suit,0,1.72,0);
  M(fig,tap(rbox(.34,.12,.3,.05),1,.82,1),plate,0,1.69,-.01);
  // ---- backpack
  {const bp=new T.Group();bp.position.set(0,1.45,-.235);fig.add(bp);
   M(bp,RB(.38,.5,.14,.04),plateD);M(bp,RB(.14,.56,.08,.03),plate,0,.02,-.07);
   for(const sx of[-1,1]){M(bp,RB(.1,.42,.07,.025),plate,sx*.14,-.02,-.05);M(bp,new T.BoxGeometry(.025,.025,.01),glow,sx*.15,.04,-.09,0,0,Math.PI/4)}
   const gb=(w_,h_,x,y)=>glowBar(bp,w_,h_,x,y,-.112,0,Math.PI,0);gb(.022,.24,0,.07);gb(.02,.1,-.055,-.17);gb(.02,.1,.055,-.17)}}

  // ---- weapon in its carry pose (grip at origin, barrel along +z)
  const st=STY[w.id]||STY.pulse,D=st.D.clone().normalize(),U=st.U.clone().addScaledVector(D,-st.U.dot(D)).normalize(),X=V(0,0,0).crossVectors(U,D);
  const SR=V(-.2,1.47,0),SL=V(.2,1.47,0),L1=.3,L2=.26,RE=(L1+L2)*.95,GS=1;
  const G=st.butt?st.butt.clone().addScaledVector(D,.29*GS):V(st.G.x*.75,1.47+(st.G.y-1.54)*.95,st.G.z*.82);
  const rh=()=>st.butt?G.clone().addScaledVector(D,st.hold).addScaledVector(X,.035).addScaledVector(U,-.03):G.clone().addScaledVector(U,-.07).addScaledVector(D,-.02);
  const lh=()=>G.clone().addScaledVector(D,st.f).addScaledVector(U,-.05);
  for(let it=0;it<3;it++){                       // keep both hands within reach of the shoulders
   for(const[get,S]of[[rh,SR]].concat(st.f!=null?[[lh,SL]]:[])){const v=get().sub(S),d=v.length();if(d>RE)G.addScaledVector(v.normalize(),-(d-RE))}
   if(!st.butt&&G.z<.22)G.z=.22}
  const wp=new T.Group();wp.position.copy(G);wp.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(X,U,D));wp.scale.setScalar(GS);fig.add(wp);
  {const gm=gunModel(w.id,{body:gunM,dark,glow:wG,line:glow,box:(x,y,z)=>RB(x,y,z)});wp.add(gm.g);fx.gunParts=gm.parts;fx.model=gm.g;fx.drops=[];fx.wid=w.id;fx.wrl=w.rl}
  fx.gun=wp;
  const RH=rh(),LH=st.f!=null?lh():V(.33,.9,.05);

  // ---- shoulders + arms
  for(const sx of[-1,1]){
   const pg=new T.Group();pg.position.set(sx*.33,1.585,0);pg.rotation.z=sx*-.18;TG.add(pg);
   dome(pg,.16,.95,1,1,plate,0,0,0,.62);dome(pg,.158,.98,.7,1,plateD,sx*.015,-.06,0);
   M(pg,new T.TorusGeometry(.152,.0045,6,56),acc,sx*.015,-.06,0,Math.PI/2).scale.set(.98,1,1);
   const S=sx<0?SR:SL,Hd=sx<0?RH:LH,E=ik(S,Hd,L1,L2,sx<0?st.pr:(st.f!=null?st.pl:V(.3,0,-1)));
   ball(fig,.074,suit,S);
   const[ua,uL]=limb(fig,S,E,.072,.058,suit);
   M(ua,tap(RB(.14,uL*.72,.14,.04),1,1.08,1),plate,0,uL*.52,0);
   glowBar(ua,.014,.1,0,uL*.4,.072);
   const eb=ball(fig,.058,suit,E);
   const[fa,fL]=limb(fig,E,Hd,.058,.045,suit);
   if(sx>0){const pole=st.f!=null?st.pl:V(.3,0,-1);fx.larm={rest:Hd.clone(),pose(H){const E2=ik(S,H,L1,L2,pole);orient(ua,S,E2,V(0,0,1));orient(fa,E2,H,V(0,0,1));eb.position.copy(E2)}}}
   M(fa,RB(.09,.08,.075,.028),plateD,0,0,-.038);
   M(fa,tap(rboxT(.125,fL*.76,.125,.04),.85,1.15,1),plate,0,fL*.5,0);
   M(fa,tube([V(0,fL*.25,.065),V(0,fL*.55,.066)],.005,glow));
   M(fa,tube([V(-sx*.022,fL*.6,.065),V(-sx*.04,fL*.82,.058)],.005,glow));
   M(fa,RB(.115,.04,.115,.016),dark,0,fL*.92,0);
   const hd=new T.Group();hd.position.y=fL+.005;hd.scale.setScalar(.92);fa.add(hd);
   M(hd,RB(.12,.12,.08,.03),dark,0,.06,0);M(hd,RB(.11,.04,.085,.015),plateD,0,.03,0);
   for(let i=0;i<4;i++){const f=new T.Group();f.position.set(-.042+i*.028,.12,0);f.rotation.x=.9;hd.add(f);M(f,RB(.025,.06,.03,.009),dark,0,.03,0);M(f,RB(.024,.045,.028,.008),plateD,0,.072,.012,.5)}
   M(hd,RB(.03,.06,.03,.01),dark,sx*.065,.08,.03,0,0,sx*.4);
   glowBar(hd,.075,.012,0,.1,.045,.6,0,0)}

  // ---- helmet: Y visor, ear lights
  {const hg=new T.Group();hg.position.set(0,1.72,.012);hg.scale.setScalar(.88);fig.add(hg);fx.head=hg;
   const shell=new T.IcosahedronGeometry(.15,4),sp=shell.attributes.position;
   for(let i=0;i<sp.count;i++){let x=sp.getX(i),y=sp.getY(i),z=sp.getZ(i);if(y<-.04){const k=1-(-.04-y)*1.6;x*=k;if(z>0)z*=1-(-.04-y)*.8}if(z>.05&&y<.06)z+=.012;sp.setXYZ(i,x*.98,y*1.1,z*1.12)}
   shell.computeVertexNormals();{const u=shell.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*2.5,u.getY(i)*1.6)}
   M(hg,shell,plate);
   const fp=new T.SphereGeometry(.152,36,14,Math.PI/2-.7,1.4,Math.PI/2-.25,.62);fp.scale(.99,1.1,1.13);M(hg,fp,lens);
   const HS=V(.152*.99,.152*1.1,.152*1.13),on=(az,el,k=1.03)=>V(Math.sin(az)*Math.cos(el)*HS.x*k,Math.sin(el)*HS.y*k,Math.cos(az)*Math.cos(el)*HS.z*k);
   const vis=a.id==='specter'?new T.MeshBasicMaterial({color:new T.Color(0xa45cff).multiplyScalar(1.4),toneMapped:false}):glow;
   for(const sx of[-1,1])M(hg,tube([on(sx*.95,.3),on(sx*.65,.24),on(sx*.32,.11),on(0,-.03)],.009,vis));
   M(hg,tube([on(0,-.03),on(0,-.2),on(0,-.38,1)],.009,vis));
   M(hg,tap(rbox(.18,.08,.1,.035),.7,1,1),plate,0,-.13,.08,.25);
   for(const sx of[-1,1]){const e=new T.Group();e.position.set(sx*.148,.005,0);e.rotation.y=sx*Math.PI/2;hg.add(e);
    M(e,new T.CylinderGeometry(.06,.065,.04,32),plateD,0,0,0,Math.PI/2);M(e,new T.TorusGeometry(.044,.008,10,36),glow,0,0,.022);M(e,new T.CylinderGeometry(.03,.03,.02,26),lens,0,0,.026,Math.PI/2);M(e,new T.TorusGeometry(.02,.003,8,24),acc,0,0,.037)}
   switch(a.id){
    case 'vanguard':M(hg,RB(.03,.035,.24,.012),plate,0,.165,-.02,-.25);bar(hg,acc,.008,.008,.2,0,.185,-.02,-.25);break;
    case 'recon':M(hg,new T.CylinderGeometry(.004,.004,.26,8),dark,-.12,.2,-.06,0,0,.15);M(hg,new T.SphereGeometry(.011,10,8),acc,-.14,.33,-.06);break;
    case 'jugg':M(hg,RB(.22,.07,.08,.02),plate,0,-.15,.07);for(const sx of[-1,1])bar(hg,acc,.008,.045,.008,sx*.1,-.15,.112);break;
    case 'specter':for(const sx of[-1,1])M(hg,RB(.035,.17,.24,.012),plate,sx*.14,.07,-.03,0,0,sx*.32);break;
    case 'medic':bar(hg,acc,.08,.006,.022,0,.168,0);bar(hg,acc,.022,.006,.08,0,.168,0);break;
    case 'eng':M(hg,new T.CylinderGeometry(.004,.004,.24,8),dark,.12,.2,-.05,0,0,-.2);M(hg,new T.SphereGeometry(.013,10,8),acc,.145,.32,-.05);break}}

  // ---- skill gear
  if(s.id==='dash'){fx.flames=[];for(const sx of[-1,1]){M(fig,new T.CylinderGeometry(.03,.042,.14,18),dark,sx*.09,1.04,-.23);fx.flames.push(M(fig,new T.ConeGeometry(.034,.2,14),new T.MeshBasicMaterial({color:new T.Color(s.col),transparent:true,opacity:.85,toneMapped:false}),sx*.09,.88,-.23,Math.PI))}}
  if(s.id==='nanite')for(const sx of[-1,1]){fx.can=M(fig,new T.CylinderGeometry(.035,.035,.22,18),new T.MeshBasicMaterial({color:new T.Color(s.col),transparent:true,opacity:.85,toneMapped:false}),sx*.17,1.31,-.215);M(fig,new T.CylinderGeometry(.04,.04,.025,18),dark,sx*.17,1.42,-.215);M(fig,new T.CylinderGeometry(.04,.04,.025,18),dark,sx*.17,1.2,-.215)}
  if(s.id==='chrono')fx.rings=[0,1].map(i=>M(fig,new T.TorusGeometry(.52+i*.1,.006,8,90),new T.MeshBasicMaterial({color:new T.Color(s.col),transparent:true,opacity:.85,toneMapped:false}),0,.85+i*.37,0,Math.PI/2+(i?.3:-.2)));
  if(s.id==='grapple'){const gl=new T.Group();gl.position.set(-.2,.99,.06);gl.rotation.set(0,.25,0);fig.add(gl);M(gl,new T.CylinderGeometry(.045,.05,.26,20),dark,0,0,.04,Math.PI/2);M(gl,new T.CylinderGeometry(.055,.055,.08,20),plateD,0,0,-.06,Math.PI/2);
   M(gl,new T.TorusGeometry(.05,.008,8,24),skG,0,0,-.02);for(let i=0;i<3;i++){const c=new T.Group();c.position.z=.18;c.rotation.z=i*2.09;gl.add(c);M(c,RB(.012,.05,.03,.005),plate,0,.03,0,.5)}M(gl,new T.ConeGeometry(.02,.06,10),skG,0,0,.21,Math.PI/2)}
  if(s.id==='drone'){const d=new T.Group();M(d,new T.SphereGeometry(.07,22,14),plate);M(d,new T.SphereGeometry(.03,14,10),skG,0,0,.06);M(d,new T.TorusGeometry(.105,.007,8,30),glow,0,0,0,Math.PI/2);fig.add(d);fx.drone=d}
  fig.scale.set(B,1,1+(B-1)*.5);
  fx.style=st.name;
  return fig}
 let lastW='';function build(a,w,s){const k=a.id+w.id+s.id;if(k===lastKey)return;lastKey=k;const wChanged=lastW&&lastW!==w.id;lastW=w.id;const ry=spin.rotation.y;if(fig){spin.remove(fig);dispose(fig)}if(heldGun){spin.remove(heldGun);dispose(heldGun);heldGun=null}OP.setTier(a.tier||0);fig=make(a,w,s);fig.userData.t0=performance.now();fig.visible=false;fx.rlAt=wChanged?performance.now()+450:0;fx.wrl=w.rl;spin.add(fig);
  if(fx.gun){heldGun=fx.gun;fig.remove(heldGun);heldGun.position.copy(OP.GP);heldGun.quaternion.setFromRotationMatrix(OP.GB);heldGun.scale.setScalar(1.1);spin.add(heldGun)}
  if(OP.hol){OP.mesh.remove(OP.hol);OP.hol=null}if(s.id==='grapple'){const h=GRG.holster(),S_=1.92/11.9;h.scale.setScalar(1.05/S_);h.position.set(1.30,6.62,.10);h.rotation.set(0,Math.PI/2,-.08);OP.mesh.add(h);OP.hol=h}spin.rotation.y=ry;ringM.color.set(a.c1)}
 const offC={x:0,y:0},offT={x:0,y:0};
 function applyOff(){if(!lw)return;if(Math.abs(offC.x)<1e-4&&Math.abs(offC.y)<1e-4)cam.clearViewOffset();else cam.setViewOffset(lw,lh,offC.x*lw,offC.y*lh,lw,lh)}
 function fit(){const el=cv.parentElement;if(!el)return;const W=el.clientWidth,H=el.clientHeight;if(!W||!H||(W===lw&&H===lh))return;lw=W;lh=H;r.setSize(W,H,false);cam.aspect=W/H;
  // frame the operative full height with the boots on the corridor floor; eye-level camera matches the corridor horizon
  const port=H>W,f=port?.5:.6,feet=port?.77:.835,t=Math.tan(cam.fov*Math.PI/360);let V=1.92/f;if(V*cam.aspect<1.8)V=1.8/cam.aspect;
  const cy=(feet-.5)*V,d=V/(2*t);cam.position.set(0,cy,d);cam.lookAt(0,cy,0);cam.updateProjectionMatrix();applyOff()}
 function focus(m){offT.x=m===1?.2:0;offT.y=m===2?.2:0}
 // ---- rotation: drag (touch or mouse) with momentum, hold-to-turn buttons, wheel, keys, auto-rotate, face front
 let lx=0,lt=0,pid=null,vel=0,hold=0,auto=true,frontTo=null,pressFrom=0;const STEP=Math.PI/4;
 const DRAG_K=()=>Math.PI*2.2/Math.max(320,Math.min(lw||800,900));   // a full-width swipe turns about one revolution
 const nudge=()=>{resumeAt=performance.now()+6000;frontTo=null};
 const markUsed=()=>{const h=document.getElementById('avh');if(h&&!h.classList.contains('used')){h.classList.add('used');try{localStorage.setItem('vv-dragged','1')}catch(_){}}};
 cv.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;if(pid!==null&&!e.buttons)pid=null;if(pid!==null)return;pid=e.pointerId;dragging=true;vel=0;markUsed();lx=e.clientX;lt=performance.now();nudge();try{cv.setPointerCapture(pid)}catch(_){}e.preventDefault()});
 cv.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pid)return;const n=performance.now(),dx=e.clientX-lx,a=dx*DRAG_K();spin.rotation.y+=a;const dtm=Math.max(8,n-lt)/1000;vel=vel*.4+(a/dtm)*.6;lx=e.clientX;lt=n});
 const up=e=>{if(e.pointerId!==pid)return;pid=null;dragging=false;if(performance.now()-lt>150)vel=0;vel=Math.max(-9,Math.min(9,vel));nudge()};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
 // touch: dedicated, non-passive touch events so the page, the app around it, or the browser can't take over the swipe
 let tid=null;
 const tmove=(x)=>{const n=performance.now(),a=(x-lx)*DRAG_K();spin.rotation.y+=a;const dtm=Math.max(8,n-lt)/1000;vel=vel*.4+(a/dtm)*.6;lx=x;lt=n};
 cv.addEventListener('touchstart',e=>{e.preventDefault();if(tid!==null&&e.touches.length===1)tid=null;if(tid!==null)return;const t=e.changedTouches[0];tid=t.identifier;dragging=true;vel=0;markUsed();lx=t.clientX;lt=performance.now();nudge()},{passive:false});
 cv.addEventListener('touchmove',e=>{e.preventDefault();if(tid===null)return;for(const t of e.changedTouches)if(t.identifier===tid)tmove(t.clientX)},{passive:false});
 const tend=e=>{for(const t of e.changedTouches)if(t.identifier===tid){tid=null;dragging=false;if(performance.now()-lt>150)vel=0;vel=Math.max(-9,Math.min(9,vel));nudge()}};
 cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);addEventListener('touchend',tend,true);addEventListener('touchcancel',tend,true);
 cv.addEventListener('wheel',e=>{e.preventDefault();const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;spin.rotation.y+=d*.004;vel=0;nudge()},{passive:false});
 const rotApi={
  // press: start turning immediately; release: if the press turned less than 45 degrees, ease on to finish a 45-degree turn
  press(d){const base=frontTo!==null&&Math.sign(frontTo-spin.rotation.y)===d?frontTo:spin.rotation.y;hold=d;vel=0;nudge();pressFrom=base},
  release(){if(!hold)return;const d=hold;hold=0;nudge();if((spin.rotation.y-pressFrom)*d<STEP)frontTo=pressFrom+d*STEP;resumeAt=performance.now()+3000},
  hold(d){d?this.press(d):this.release()},
  step(d){vel=0;const from=frontTo===null?spin.rotation.y:frontTo;nudge();frontTo=from+d*STEP;resumeAt=performance.now()+3000},
  toggleAuto(){auto=!auto;if(auto)resumeAt=0;return auto},
  front(){const y=spin.rotation.y,k=Math.round(y/(Math.PI*2));frontTo=k*Math.PI*2;vel=0;hold=0;resumeAt=performance.now()+3500},
  get auto(){return auto}};
 function render(dt,now){fit();if(!fig)return;
  {const k=Math.min(1,dt*7),ox=offC.x,oy=offC.y;offC.x+=(offT.x-offC.x)*k;offC.y+=(offT.y-offC.y)*k;if(Math.abs(offC.x-ox)+Math.abs(offC.y-oy)>1e-5)applyOff()}
  if(!dragging){
   if(hold){spin.rotation.y+=hold*2.2*dt;resumeAt=now+3000}
   else if(frontTo!==null){const d=frontTo-spin.rotation.y;spin.rotation.y+=d*Math.min(1,dt*6);if(Math.abs(d)<.002){spin.rotation.y=frontTo;frontTo=null}}
   else if(Math.abs(vel)>.02){spin.rotation.y+=vel*dt;vel*=Math.exp(-2.6*dt)}
   else{vel=0;if(auto&&now>resumeAt)spin.rotation.y+=dt*.3}}
  const br=Math.sin(now/1100),k=Math.min(1,(now-(fig.userData.t0||0))/450);OP.update(spin.rotation.y,br*.004);if(heldGun)(fx.rlAt||(heldGun.position.y=OP.GP.y+br*.004));fig.position.y=br*.004+.035*(1-k)*(1-k);fig.scale.set(1,1+br*.004,1);fig.rotation.z=Math.sin(now/2300)*.006;if(fx.head)fx.head.rotation.y=Math.sin(now/3100)*.08;
  if(fx.flames)fx.flames.forEach((f,i)=>f.scale.set(1,.75+Math.sin(now/40+i*2)*.25+rnd()*.15,1));
  
  if(fx.rings)fx.rings.forEach((t,i)=>t.rotation.z+=dt*(i?-.8:.6));
  if(fx.can)fx.can.material.opacity=.6+Math.sin(now/300)*.25;
  if(fx.rlAt&&fx.gunParts&&fx.larm&&now>fx.rlAt){const t=(now-fx.rlAt)/1000/Math.max(2.6,fx.wrl),md=fx.model;fig.updateMatrixWorld(true);
   if(t<1){const pouch=md.worldToLocal(fig.localToWorld(new T.Vector3(.14,1.04,.16))),fore=md.worldToLocal(fig.localToWorld(fx.larm.rest.clone()));
    const res=reloadFrame(fx.wid,t,{p:fx.gunParts,pouch,fore,get last(){return fx.rlLast},set last(v){fx.rlLast=v}});
    if(heldGun){const o=res.pose,q=new T.Quaternion().setFromRotationMatrix(OP.GB),e=new T.Quaternion().setFromEuler(new T.Euler(o.rx*.8,o.ry*.8,o.rz*.8));heldGun.quaternion.copy(q).multiply(e);heldGun.position.set(OP.GP.x+o.px*.5,OP.GP.y+o.py*.5+.03*Math.sin(Math.PI*t),OP.GP.z+o.pz*.5)}rlSfx(fx.wid,fx.rlS==null?-1:fx.rlS,t,Math.max(2.6,fx.wrl),.5);fx.rlS=t;
    fig.updateMatrixWorld(true);fx.larm.pose(fig.worldToLocal(md.localToWorld(res.hand)));
    if(res.drop)spawnDrop(fx.gunParts.mag,md,res.drop,fig,fx.drops)}
   else{resetParts(fx.gunParts);fx.larm.pose(fx.larm.rest);fx.rlAt=0;fx.rlLast=null;fx.rlS=null;if(heldGun){heldGun.quaternion.setFromRotationMatrix(OP.GB);heldGun.position.copy(OP.GP)}}}
  if(fx.drops)stepDrops(fx.drops,dt,.03,fig,40);
  if(fx.drone){const t=now/1400;fx.drone.position.set(Math.cos(t)*.75,1.97+Math.sin(t*2)*.05,Math.sin(t)*.75);fx.drone.lookAt(0,1.65,0)}
  const p=eg.attributes.position;for(let i=0;i<EM;i++){let y=p.getY(i)+dt*(.1+(i%5)*.03);if(y>2.4)y=0;p.setY(i,y)}p.needsUpdate=true;
  ringM.opacity=dragging||Math.abs(vel)>.3?Math.min(.95,ringM.opacity+dt*5):Math.max(.22+Math.sin(now/500)*.08,ringM.opacity-dt*2);
  r.render(sc,cam)}
 let ICONS=null;
 let SICONS=null;
 function suitIcons(){if(SICONS)return SICONS;SICONS={};try{
  const isc=new T.Scene(),IW=160,IH=290,cam=new T.PerspectiveCamera(9.4,IW/IH,1,200),rt=new T.WebGLRenderTarget(IW,IH),px=new Uint8Array(IW*IH*4);
  for(let t=0;t<SUITS.length;t++){const m=new T.Mesh(OP.geoOf(t),opMat(0,t));m.frustumCulled=false;m.rotation.y=-.62;isc.add(m);
   cam.position.set(0,6.2,78);cam.lookAt(0,6.2,0);r.setRenderTarget(rt);r.setClearColor(0,0);r.clear();r.render(isc,cam);r.readRenderTargetPixels(rt,0,0,IW,IH,px);r.setRenderTarget(null);
   let x0=IW,y0=IH,x1=0,y1=0;for(let y=0;y<IH;y++)for(let x=0;x<IW;x++)if(px[(y*IW+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1>x0){const pd=2,cw=x1-x0+1+pd*2,ch=y1-y0+1+pd*2,c3=document.createElement('canvas');c3.width=cw;c3.height=ch;const g3=c3.getContext('2d'),im=g3.createImageData(cw,ch);
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const sx=x0-pd+x,sy=y1+pd-y;if(sx<0||sy<0||sx>=IW||sy>=IH)continue;const si=(sy*IW+sx)*4,di=(y*cw+x)*4;
     const al=px[si+3];im.data[di]=Math.min(255,px[si]*255/Math.max(al,1));im.data[di+1]=Math.min(255,px[si+1]*255/Math.max(al,1));im.data[di+2]=Math.min(255,px[si+2]*255/Math.max(al,1));im.data[di+3]=al}
    g3.putImageData(im,0,0);SICONS[t]=c3.toDataURL('image/png')}
   isc.remove(m);m.material.dispose()}
  rt.dispose();
 }catch(e){SICONS={}}lw=lh=0;return SICONS}
 function icons(){if(ICONS)return ICONS;ICONS={};try{
  const isc=new T.Scene();isc.environment=sc.environment;
  isc.add(new T.HemisphereLight(0xb8c6ff,0x1a1020,.22));
  const k1=new T.DirectionalLight(0xffffff,4.2);k1.position.set(-1.5,3.2,1.8);isc.add(k1);const k4=new T.DirectionalLight(0xdfe6ff,1.6);k4.position.set(-3,.4,-.6);isc.add(k4);
  const k2=new T.DirectionalLight(0x7fb2ff,2.6);k2.position.set(1.2,1.6,-2.6);isc.add(k2);
  const k3=new T.DirectionalLight(0xff8ad8,.9);k3.position.set(-1,-1.5,-1);isc.add(k3);
  const body=new T.MeshPhysicalMaterial({color:0x0f1014,envMapIntensity:.6,metalness:.85,roughness:.32,clearcoat:.8,clearcoatRoughness:.18,normalMap:TILE.nrm,normalScale:new T.Vector2(.25,.25)});
  const dark=new T.MeshPhysicalMaterial({color:0x040405,envMapIntensity:.3,metalness:.75,roughness:.4,clearcoat:.45});
  const IW=200,IH=84,ocam=new T.OrthographicCamera(-1,1,1,-1,.01,20);
  r.setSize(IW,IH,false);
  for(const w of WEAPONS){const gm=gunModel(w.id,{body,dark,glow:new T.MeshBasicMaterial({color:new T.Color(w.col).multiplyScalar(1.4),toneMapped:false})});
   const grp=new T.Group();grp.add(gm.g);isc.add(grp);gm.g.rotation.set(.08,0,0);grp.updateMatrixWorld(true);
   const bb=new T.Box3().setFromObject(grp),c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3());
   const dir=new T.Vector3(-1,.55,-.36).normalize();ocam.position.copy(c).addScaledVector(dir,4);ocam.up.set(0,1,0);ocam.lookAt(c);
   const hw=Math.max(sz.z*.5,sz.y*.62*IW/IH);ocam.left=-hw;ocam.right=hw;ocam.top=hw*IH/IW;ocam.bottom=-hw*IH/IW;ocam.updateProjectionMatrix();
   r.setClearColor(0,0);r.render(isc,ocam);ICONS[w.id]=cv.toDataURL('image/png');
   isc.remove(grp);dispose(grp)}
 }catch(e){ICONS={}}lw=lh=0;return ICONS}
 return{el:cv,build,render,icons,suitIcons,op:()=>OP,reload(){if(!fx.rlAt&&fx.gunParts){ensureAC();fx.rlAt=performance.now()+120}},focus,rot:rotApi,status:()=>({drops:fx.drops?fx.drops.length:0,reloading:!!fx.rlAt,arm:!!fx.larm,spin:spin.rotation.y}),setSpin:v=>{spin.rotation.y=v;resumeAt=performance.now()+1e9}};
}catch(e){console.warn('3D avatar unavailable',e);return null}})();

// ================= INPUT =================
const K={},J={x:0,y:0},F={f:0};let touch=matchMedia('(pointer:coarse)').matches;
const touchDevice=touch||('ontouchstart' in window)||navigator.maxTouchPoints>0;
const setMode=t=>{touch=t;document.body.classList.toggle('t',t)};setMode(touch);
const look=(dx,dy,s)=>{s*=(1-.3*ads)*(SCOPE.k()>.5?.32:1);yaw-=dx*s*cfg.sn;pitch=cl(pitch-dy*s*cfg.sn,-1.5,1.5)};
let noLock=!('requestPointerLock' in HTMLElement.prototype),hadLock=false;
function plain(r){try{const q=r.requestPointerLock();q&&q.catch&&q.catch(()=>{noLock=true})}catch(e){noLock=true}}
function lock(){if(noLock)return;const r=R.domElement;try{const q=r.requestPointerLock({unadjustedMovement:true});if(q&&q.catch)q.catch(()=>plain(r))}catch(e){plain(r)}}
document.addEventListener('pointerlockerror',()=>{noLock=true});
function unlock(){try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}}
function stopInput(){F.f=0;J.x=J.y=0;for(const c in K)K[c]=0;FB.hold=0;adsHeld=0;rmb=false;sprintLock=false;cdT=0;if(typeof endStick==='function')endStick()}
function pause(){if(!go)return;go=false;stopInput();document.body.classList.remove('playing');$('pz').hidden=false;unlock()}
function resume(){$('pz').hidden=true;go=true;last=performance.now();document.body.classList.add('playing');if(!touch)lock()}
function toHangar(){go=false;CO.stop();SND.ambStop();stopInput();document.body.classList.remove('playing');$('pz').hidden=true;$('end').hidden=true;$('hud').hidden=true;$('ov').hidden=false;unlock();renderMenu()}
addEventListener('keydown',e=>{if(e.repeat)return;K[e.code]=1;const c=e.code;if(c==='Space'){e.preventDefault();jumpBtn()}if(c==='KeyR')reload();if(c==='KeyE')blast();if(c==='KeyG')tactical();if(c==='KeyQ'||c==='KeyF')useSkill();
 if(c==='KeyC'||c==='ControlLeft')crouchDown();if(c==='KeyX')swapWeapon();if(c==='Digit1')swapWeapon(0);if(c==='Digit2')swapWeapon(1);if(c==='Digit4')callStreak(0);if(c==='Digit5')callStreak(1);if(c==='Digit6')callStreak(2);
 if(c==='KeyV')quickTurn();if(c==='KeyM'&&go)$('mm').classList.toggle('big');if(c==='KeyP')go?pause():(!$('pz').hidden&&resume())});
addEventListener('keyup',e=>{K[e.code]=0;if(e.code==='KeyC'||e.code==='ControlLeft')crouchUp();if(e.code==='KeyQ')releaseGrapple()});
addEventListener('blur',()=>{for(const c in K)K[c]=0;F.f=0;rmb=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement){hadLock=true;return}if(hadLock&&go&&!touch){hadLock=false;pause()}});
addEventListener('mousemove',e=>{if(!go||touch)return;if(document.pointerLockElement||noLock)look(cl(e.movementX||0,-150,150),cl(e.movementY||0,-150,150),.0022)});
addEventListener('pointerdown',e=>{const t=e.pointerType==='touch';if(t!==touch)setMode(t);if(t||!go)return;if(!document.pointerLockElement&&!noLock){lock();return}},true);
addEventListener('mousedown',e=>{if(touch||!go)return;if(!document.pointerLockElement&&!noLock)return;if(e.button===0)F.f=1;if(e.button===2)rmb=true});
addEventListener('mouseup',e=>{if(e.button===0)F.f=0;if(e.button===2)rmb=false});addEventListener('contextmenu',e=>e.preventDefault());
const tc=$('tc'),zl=$('zl'),zr=$('zr'),stick=$('stick'),knob=$('knob'),lockA=$('lockA');let jo=null,lp=null,lockArm=false;
const vib=()=>{if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}};
const tcXY=e=>{const r=tc.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
// floating left stick: dead zone 12%, push past 85% forward to sprint, drag above the ring to lock sprint
const joy=(dx,dy)=>{const sr=stick.offsetWidth/2||75,u=sr/75,d=Math.hypot(dx,dy)||1,l=Math.min(1,d/sr),m=l<.12?0:l;J.x=dx/d*m;J.y=dy/d*m;
 knob.style.transform='translate('+dx/d*Math.min(d,sr)+'px,'+dy/d*Math.min(d,sr)+'px)';
 lockArm=-dy>sr+40*u&&Math.abs(dx)<sr;lockA.classList.toggle('arm',lockArm);lockA.textContent=lockArm?'SPRINTING \u00b7 RELEASE TO LOCK':'SPRINT \u2191';
 if(sprintLock&&m>0&&-J.y<.5)sprintLock=false};
function endStick(){jo=null;lockArm=false;lockA.classList.remove('arm');lockA.textContent='SPRINT \u2191';J.x=J.y=0;knob.style.transform='';stick.style.left=stick.style.top='';stick.classList.remove('on')}
zl.onpointerdown=e=>{e.preventDefault();try{zl.setPointerCapture(e.pointerId)}catch(_){}const[x,y]=tcXY(e);jo={x,y,id:e.pointerId};stick.style.left=x+'px';stick.style.top=y+'px';stick.classList.add('on');joy(0,0)};
zl.onpointermove=e=>{if(jo&&e.pointerId===jo.id){const[x,y]=tcXY(e);joy(x-jo.x,y-jo.y)}};
zl.onpointerup=zl.onpointercancel=e=>{if(!jo||e.pointerId!==jo.id)return;const arm=lockArm;endStick();if(arm&&go){sprintLock=true;stance=0;vib()}};
zr.onpointerdown=e=>{try{zr.setPointerCapture(e.pointerId)}catch(_){}lp=[e.clientX,e.clientY,e.pointerId]};
zr.onpointermove=e=>{if(lp&&e.pointerId===lp[2]){look(e.clientX-lp[0],e.clientY-lp[1],.005);lp[0]=e.clientX;lp[1]=e.clientY}};
zr.onpointerup=zr.onpointercancel=()=>lp=null;
// multi-touch buttons: each tracks its own pointer; move = drag-to-aim where wanted
function tb(id,down,up,move){const b=$(id);let pid=null,lx=0,ly=0;
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(pid!==null)return;pid=e.pointerId;try{b.setPointerCapture(pid)}catch(_){}lx=e.clientX;ly=e.clientY;b.classList.add('on');down&&down(e)});
 b.addEventListener('pointermove',e=>{if(e.pointerId!==pid||!move)return;move(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY});
 const end=e=>{if(e.pointerId!==pid)return;pid=null;b.classList.remove('on');up&&up(e)};
 ['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,end));b.addEventListener('contextmenu',e=>e.preventDefault())}
const aimDrag=(dx,dy)=>look(dx,dy,.005);
tb('bf',fireDown,fireUp,aimDrag);
tb('bf2',()=>{F.f++;sprintLock=false},()=>{F.f=Math.max(0,F.f-1)});
tb('bads',()=>{if(cfg.adsMode==='hold')adsHeld=1;else adsOn=!adsOn;vib()},()=>{adsHeld=0});
tb('br',()=>{reload();vib()});tb('bj',()=>{JET.hold=true;jumpBtn();vib()},()=>{JET.hold=false});tb('bc',()=>{crouchDown();vib()},crouchUp);
tb('bk',()=>{useSkill();vib()},()=>releaseGrapple());tb('bq',()=>{quickTurn();vib()});tb('bt',()=>{tactical();vib()});tb('bb',()=>{blast();vib()});
[0,1,2].forEach(i=>tb('bs'+(i+1),()=>{callStreak(i);vib()}));
tb('bp',()=>pause());tb('wsw',()=>{swapWeapon();vib()});
$('mm').addEventListener('pointerdown',e=>{if(!go||!touch)return;e.preventDefault();e.stopPropagation();$('mm').classList.toggle('big')});

// tap-safe buttons: fire once whether the browser sends pointerup, touchend or click
function tapBtn(el,fn){let t=0;const h=e=>{if(e){e.preventDefault();e.stopPropagation()}const n=performance.now();if(n-t<500)return;t=n;fn()};el.addEventListener('pointerup',h);el.addEventListener('click',h);el.addEventListener('touchend',h,{passive:false})}

// ================= ORIENTATION =================
let rotOk=false;
function checkOrient(){const portrait=innerHeight>innerWidth*1.05,show=touchDevice&&portrait&&!rotOk;$('rot').hidden=!show;if(show&&go)pause()}
addEventListener('orientationchange',()=>setTimeout(checkOrient,250));
tapBtn($('rotok'),()=>{rotOk=true;checkOrient()});
function goLandscape(){if(!touchDevice)return;try{const de=document.documentElement,fs=de.requestFullscreen||de.webkitRequestFullscreen;if(fs&&!document.fullscreenElement){const p=fs.call(de,{navigationUI:'hide'});const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}};p&&p.then?p.then(lk).catch(()=>{}):lk()}}catch(e){}}

// ================= DEPLOY / RESET =================
// ---- LOCAL CO-OP (split screen): player 2 on a gamepad (or the arrow keys + numpad), sharing this screen.
//      Designed for couch play and for Steam Remote Play Together, where the guest's controller/keyboard arrives as local input.
const CO=(()=>{let on=false,mode='coop',C2=null,body1=null,body2=null,gun2=null,hud=null,hit1=null,hit2=null,dhud=null,win=0;const TRC=[],KB={},SC=[0,0],GOAL=5;
 const st={p:new T.Vector3(),v:new T.Vector3(),yaw:0,pitch:0,hp:100,ammo:30,rel:0,fcd:0,down:0,ground:false,ads:0,padT:0,kick:0,W:null,jumpHeld:0};
 const P2K=/^(Key[IJKLUOYHN]|Semicolon|Quote|Slash|Period|ControlRight|Arrow|Numpad)/;addEventListener('keydown',e=>{if(on&&P2K.test(e.code)){KB[e.code]=1;e.preventDefault();e.stopImmediatePropagation()}},true);addEventListener('keyup',e=>{KB[e.code]=0});
 const mkBody=col=>{const g=new T.Group(),arm=new T.MeshStandardMaterial({color:0x15171c,metalness:.7,roughness:.35}),gl=new T.MeshBasicMaterial({color:col});
  const B=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m||arm);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
  B(.5,.62,.3,0,1.22,0);B(.34,.34,.34,0,1.72,0);B(.28,.05,.02,0,1.76,.175,gl);B(.045,.16,.02,0,1.66,.175,gl);
  B(.2,.8,.22,-.13,.42,0);B(.2,.8,.22,.13,.42,0);B(.15,.6,.15,-.34,1.2,.1);B(.15,.6,.15,.34,1.2,.1);B(.52,.05,.32,0,.98,0,gl);B(.36,.44,.12,0,1.3,-.2);
  g.visible=false;return g};
 function ensure(){if(C2)return;C2=new T.PerspectiveCamera(80,1,.05,1400);S.add(C2);body1=mkBody(0x21e6ff);body2=mkBody(0xff2bd6);S.add(body1,body2);
  hud=document.createElement('div');hud.id='p2hud';hud.hidden=true;
  hud.innerHTML='<div class="x"></div><div class="t"><b>P2</b><span id="p2hp">100</span><i>HP</i><span id="p2am">30</span><i>AMMO</i></div><div class="dn" id="p2dn" hidden>P2 DOWN &middot; RESPAWNING</div><div class="hint" id="p2hint">P2 keys: I J K L move &middot; Arrows (or U/O, Y/H) look &middot; ; fire &middot; &apos; aim &middot; / jump &middot; . reload &middot; or plug in a controller</div>';
  document.body.appendChild(hud)}
 function spawnNear(){const s=st;for(const[a,b]of[[2,0],[-2,0],[0,2],[0,-2],[2.5,2.5],[-2.5,-2.5],[0,0]]){const x=P.x+a,z=P.z+b;if(!solid(x,P.y+.4,z)&&!solid(x,P.y+1.5,z)){s.p.set(x,P.y,z);break}}
  s.v.set(0,0,0);s.yaw=yaw;s.pitch=0;s.hp=100;s.down=0;s.ammo=s.W.mag;s.rel=0;s.fcd=0}
 const hm=new T.MeshBasicMaterial({visible:false}),mkHit=tag=>{const m=new T.Mesh(new T.BoxGeometry(.8,1.9,.8),hm);m.geometry.translate(0,.95,0);m.userData[tag]=1;m.layers.enable(1);S.add(m);return m};
 const spawnPts=()=>{const L=(NCC_LAYOUT.spawns||[]).map(([x,z])=>[x,z]);return L.length?L:[[0,60],[0,-60]]};
 function farSpawn(from){let best=null,bd=-1;for(const[x,z]of spawnPts()){const d=Math.hypot(x-from.x,z-from.z);if(d>bd&&!solid(x,.5,z)&&!solid(x,1.5,z)){bd=d;best=[x,z]}}return best||[from.x+30,from.z]}
 function duelHud(){if(!dhud){dhud=document.createElement('div');dhud.id='duelhud';document.body.appendChild(dhud)}dhud.hidden=!(on&&mode==='duel');
  dhud.innerHTML=`<b class="p1">P1 ${SC[0]}</b><span>1V1 MARKSMAN &middot; FIRST TO ${GOAL}</span><b class="p2">${SC[1]} P2</b>`+(win?`<div class="win">${win===1?'PLAYER 1':'PLAYER 2'} WINS</div>`:'')}
 function scored(k){SC[k]++;feed(`<b>${k?'P2':'P1'}</b> <i>ELIMINATED</i> ${k?'P1':'P2'}`);if(SC[k]>=GOAL){win=k+1;setTimeout(()=>{SC[0]=SC[1]=0;win=0;duelHud();p1Respawn();st.down=Math.min(st.down,.01)},4000)}duelHud()}
 function p1Respawn(){const sp=farSpawn(st.p);P.set(sp[0],0,sp[1]);V.set(0,0,0);hp=maxHP;ammo=Wp.mag;rel=0;invT=1.5;yaw=Math.atan2(-(st.p.x-P.x),-(st.p.z-P.z))}
 function p1Down(){hp=maxHP;scored(1);p1Respawn()}
 function hitP2(h){const head=h.point.y>st.p.y+1.45,dm=head?150:75;BLOOD.hit(h.point,rc.ray.direction,dm/30);try{AUD.spHit({m:{position:h.point}})}catch(e){}hurtP2(dm,1)}
 function hitList(){return on&&mode==='duel'&&st.down<=0&&hit2?[hit2]:[]}
 function start(md){mode=md==='duel'?'duel':'coop';ensure();if(!hit1){hit1=mkHit('p1');hit2=mkHit('p2')}on=true;
  if(mode==='duel'){EN.forEach(e=>S.remove(e.m));EN=[];Wp=pick(WEAPONS,'rail');buildGun();ammo=Wp.mag;rel=0;slots=[Wp,Wp];slotAmmo=[Wp.mag,Wp.mag];cur=0;SC[0]=SC[1]=0;win=0;
   const a=farSpawn({x:0,z:0});P.set(a[0],0,a[1]);V.set(0,0,0)}
  st.W=Wp;document.body.classList.add('coop');document.body.classList.toggle('duel',mode==='duel');hud.hidden=false;
  if(gun2){C2.remove(gun2)}C.updateMatrixWorld(true);gunModelG.updateMatrixWorld(true);gun2=gunModelG.clone(true);
  const m=new T.Matrix4().copy(C.matrixWorld).invert().multiply(gunModelG.matrixWorld);m.decompose(gun2.position,gun2.quaternion,gun2.scale);gun2.traverse(o=>{o.visible=true;o.frustumCulled=false});C2.add(gun2);
  C2.layers.mask=C.layers.mask;spawnNear();if(mode==='duel'){const b=farSpawn(P);st.p.set(b[0],0,b[1]);st.yaw=Math.atan2(-(P.x-st.p.x),-(P.z-st.p.z));yaw=Math.atan2(-(st.p.x-P.x),-(st.p.z-P.z))}duelHud();setTimeout(()=>{const h=document.getElementById('p2hint');if(h)h.hidden=true},12000)}
 function stop(){on=false;mode='coop';document.body.classList.remove('coop','duel');if(hud)hud.hidden=true;if(dhud)dhud.hidden=true;if(body1)body1.visible=false;if(body2)body2.visible=false;TRC.forEach(t=>S.remove(t.l));TRC.length=0}
 function input(){let mx=0,mz=0,lx=0,ly=0,fire=0,jump=0,reload=0,ads=0;const pads=navigator.getGamepads?[...navigator.getGamepads()]:[],gp=pads.find(g=>g&&g.connected);
  if(gp){const dz=v=>Math.abs(v||0)<.16?0:v,b=i=>gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.4);mx=dz(gp.axes[0]);mz=dz(gp.axes[1]);lx=dz(gp.axes[2]);ly=dz(gp.axes[3]);fire=b(7)||b(5);ads=b(6)||b(4);jump=b(0);reload=b(2);
   const h=document.getElementById('p2hint');if(h&&!h.hidden)h.hidden=true}
  // QWERTY (right-hand side, clear of player 1's WASD/QERFCX keys): IJKL move, arrows or U/O + Y/H look, ; fire, ' aim, / or N jump, . reload
  mx+=(KB.KeyL?1:0)-(KB.KeyJ?1:0);mz+=(KB.KeyK?1:0)-(KB.KeyI?1:0);
  lx+=(KB.ArrowRight||KB.KeyO||KB.Numpad6?1:0)-(KB.ArrowLeft||KB.KeyU||KB.Numpad4?1:0);ly+=(KB.ArrowDown||KB.KeyH||KB.Numpad2?1:0)-(KB.ArrowUp||KB.KeyY||KB.Numpad8?1:0);
  return{mx:Math.max(-1,Math.min(1,mx)),mz:Math.max(-1,Math.min(1,mz)),lx:Math.max(-1,Math.min(1,lx)),ly:Math.max(-1,Math.min(1,ly)),fire:fire||KB.Semicolon||KB.ControlRight||KB.Numpad0,jump:jump||KB.Slash||KB.KeyN||KB.NumpadEnter,reload:reload||KB.Period||KB.NumpadDecimal,ads:ads||KB.Quote}}
 const hitP=(x,y,z)=>solid(x,y,z)||y<0;
 function hurtP2(x,byP1){if(!on||st.down>0)return;st.hp-=x;if(st.hp<=0){st.hp=0;st.down=mode==='duel'?3:5;if(mode==='duel'&&byP1)scored(0);else feed('<b>P2</b> <i>DOWN</i>');const d=document.getElementById('p2dn');if(d)d.hidden=false}}
 function line(a,b,col){const g=new T.BufferGeometry().setFromPoints([a,b]),l=new T.Line(g,new T.LineBasicMaterial({color:col||0xff6ad5,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));S.add(l);TRC.push({l,t:.06})}
 function shoot(){const s=st,W=s.W;s.ammo--;s.fcd=W.rate||.1;s.kick=.05;try{AUD.fire(W)}catch(e){}C2.updateMatrixWorld(true);const o=C2.getWorldPosition(new T.Vector3());
  const muzzle=new T.Vector3(.18,-.16,-.8).applyMatrix4(C2.matrixWorld);
  for(let k=0;k<(W.pel||1);k++){const spr=(W.spr||.012)*(1-.7*s.ads),dir=new T.Vector3((rnd()-.5)*2*spr,(rnd()-.5)*2*spr,-1).normalize().transformDirection(C2.matrixWorld);
   rc.set(o,dir);rc.far=W.range||80;const h=rc.intersectObjects(BM.concat(EN.map(e=>e.m),CITY.proxies,mode==='duel'&&hit1&&hp>0?[hit1]:[]),false)[0],end=h?h.point:o.clone().addScaledVector(dir,rc.far);line(muzzle,end,W.col);
   if(!h)continue;
   if(h.object.userData.p1){const head=h.point.y>P.y+1.45,dm=head?150:75;BLOOD.hit(h.point,dir,dm/30);if(!(invT>0)){hp-=dm;dmgA=.9;try{AUD.hurt(dm)}catch(e){}}continue}
   if(W.boom){explode(h.point,W.dmg,W.boom);continue}
   if(h.object.userData.en){const e=h.object.userData.e,Rg=W.range||80,d=h.distance,rm=d<=Rg*.5?1:Math.max(.35,1-.65*(d-Rg*.5)/(Rg*.5)),dm=W.dmg*zoneMul(e)*rm;BLOOD.hit(h.point,dir,dm/30);hurt(e,dm)}
   else if(h.object.userData.glass)CITY.shatter(h.object,h.point);
   else{try{FX.impact(h.point,hNrm(h),W.col,1)}catch(e){}}}
  rc.far=100}
 function step(dt){if(!on)return;const s=st,I=input();
  for(let i=TRC.length-1;i>=0;i--){const t=TRC[i];t.t-=dt;t.l.material.opacity=Math.max(0,t.t/.06);if(t.t<=0){S.remove(t.l);t.l.geometry.dispose();t.l.material.dispose();TRC.splice(i,1)}}
  if(s.down>0){s.down-=dt;if(s.down<=0){spawnNear();if(mode==='duel'){const b=farSpawn(P);s.p.set(b[0],0,b[1])}const d=document.getElementById('p2dn');if(d)d.hidden=true}upd();return}
  s.ads+=((I.ads?1:0)-s.ads)*Math.min(1,dt*10);
  s.yaw-=I.lx*2.9*dt*(1-.55*s.ads);s.pitch=Math.max(-1.45,Math.min(1.45,s.pitch-I.ly*2.2*dt*(1-.55*s.ads)));
  const f=-I.mz,l=Math.hypot(I.mx,f),n=l>1?l:1,sp=6.3*(1-.4*s.ads),wx=(Math.cos(s.yaw)*I.mx-Math.sin(s.yaw)*f)/n,wz=(-Math.sin(s.yaw)*I.mx-Math.cos(s.yaw)*f)/n,c=Math.min(1,dt*(s.ground?10:3));
  if(s.padT<=0){s.v.x+=(wx*sp-s.v.x)*c;s.v.z+=(wz*sp-s.v.z)*c}s.padT-=dt;
  if(I.jump&&!s.jumpHeld&&s.ground){s.v.y=9.2;s.ground=false}s.jumpHeld=I.jump?1:0;
  const lt=CITY.liftAt(s.p.x,s.p.y,s.p.z);if(lt>0)s.v.y=Math.max(s.v.y,Math.min(9,(lt-s.p.y)*4+1.5));
  const pd=s.padT<=0&&CITY.padAt(s.p.x,s.p.y,s.p.z);if(pd){s.v.set(pd[2],pd[3],pd[4]);s.padT=.35;try{AUD.pad()}catch(e){}}
  s.v.y-=26*dt;
  const go_=(nx,nz)=>{if(!hitP(nx,s.p.y+.45,nz)&&!hitP(nx,s.p.y+1.5,nz))return true;if(s.ground)for(const up of[.3,.6]){if(!hitP(nx,s.p.y+up+.05,nz)&&!hitP(nx,s.p.y+up+.5,nz)&&!hitP(nx,s.p.y+up+1.5,nz)){s.p.y+=up;return true}}return false};
  const Rr=.35,nx=s.p.x+s.v.x*dt;if(go_(nx+Math.sign(s.v.x)*Rr,s.p.z))s.p.x=nx;else s.v.x=0;const nz=s.p.z+s.v.z*dt;if(go_(s.p.x,nz+Math.sign(s.v.z)*Rr))s.p.z=nz;else s.v.z=0;
  const dy=s.v.y*dt,N=Math.max(1,Math.ceil(Math.abs(dy)/.25));s.ground=false;
  for(let i=0;i<N;i++){const ny=s.p.y+dy/N;if(dy<=0&&hitP(s.p.x,ny,s.p.z)){let y=ny;for(let k=0;k<14&&hitP(s.p.x,y,s.p.z);k++)y+=.05;s.p.y=Math.max(0,y);s.v.y=0;s.ground=true;break}
   if(dy>0&&hitP(s.p.x,ny+1.8,s.p.z)){s.v.y=0;break}s.p.y=ny}
  const B=CITY.bounds;s.p.x=Math.max(B[0]+1,Math.min(B[1]-1,s.p.x));s.p.z=Math.max(B[2]+1,Math.min(B[3]-1,s.p.z));
  s.fcd-=dt;if(s.rel>0){s.rel-=dt;if(s.rel<=0)s.ammo=s.W.mag}
  if(I.reload&&s.rel<=0&&s.ammo<s.W.mag)s.rel=s.W.rl;
  if(I.fire&&s.fcd<=0&&s.rel<=0){if(s.ammo<=0)s.rel=s.W.rl;else shoot()}
  s.kick*=Math.exp(-dt*18);upd()}
 function upd(){const s=st;C2.position.set(s.p.x,s.p.y+1.62,s.p.z);C2.rotation.set(s.pitch+s.kick,s.yaw,0,'YXZ');C2.fov=(cfg.fov||80)*(1-(mode==='duel'?.62:.3)*s.ads);if(hit1){hit1.position.set(P.x,P.y,P.z);hit2.position.copy(s.p);hit1.updateMatrixWorld();hit2.updateMatrixWorld()}
  if(gun2){gun2.visible=s.down<=0;gun2.position.z+=0}body2.position.copy(s.p);body2.rotation.y=s.yaw+Math.PI;body1.position.set(P.x,P.y,P.z);body1.rotation.y=yaw+Math.PI;
  const hp=document.getElementById('p2hp'),am=document.getElementById('p2am');if(hp)hp.textContent=Math.ceil(s.hp);if(am)am.textContent=s.rel>0?'RELOAD':s.ammo}
 // spiders chase whichever player is closer
 function target(mp){if(!on||st.down>0)return null;const d1=Math.hypot(P.x-mp.x,P.z-mp.z),d2=Math.hypot(st.p.x-mp.x,st.p.z-mp.z);return d2<d1?st.p:null}
 function slash(e,d,dt){e.scd=(e.scd||0)-dt;if(d<2.5&&Math.abs(st.p.y+.9-e.m.position.y)<1.7&&e.scd<=0&&!(e.stun>0)){e.scd=1.1+rnd()*.5;hurtP2(14+wave*.8);try{slashSnd(1)}catch(x){}}}
 function render(){const v=R.getSize(new T.Vector2()),W=v.x,H=v.y,h2=W/2;R.setScissorTest(true);
  C.aspect=h2/H;C.updateProjectionMatrix();R.setViewport(0,0,h2,H);R.setScissor(0,0,h2,H);body1.visible=false;body2.visible=st.down<=0;R.render(S,C);
  C2.aspect=h2/H;C2.updateProjectionMatrix();R.setViewport(h2,0,W-h2,H);R.setScissor(h2,0,W-h2,H);body1.visible=true;body2.visible=false;R.render(S,C2);
  R.setScissorTest(false);R.setViewport(0,0,W,H);C.aspect=W/H;C.updateProjectionMatrix()}
 return{start,stop,step,render,target,slash,hurt:hurtP2,hitP2,hitList,p1Down,get on(){return on},get duel(){return on&&mode==='duel'},st}})();
function resetRun(){FX.clear();JET.fuel=1;JET.k=0;if(JET.on){JET.on=false;jetSnd(0)}JET.hold=false;TURN.t=-1;TURN.cur=null;TURN.roll=TURN.dip=TURN.gx=TURN.gy=TURN.fov=0;if(typeof TFX!=='undefined')TFX.style.opacity=0;endGrapple();LEDGE=null;GRK=0;GOUT=0;GDR=0;GRET=0;BLOOD.clear();dj=0;airT=0;buildArena();EN.forEach(e=>S.remove(e.m));EN=[];clearDead();PA.forEach(p=>S.remove(p.m));PA.length=0;TR.forEach(t=>S.remove(t.l));TR.length=0;
 P.set(10*MAPK,0,92*MAPK);V.set(0,0,0);padT=0;yaw=0;pitch=0;wave=1;score=0;wt=0;bcd=0;scd=0;rel=0;fcd=0;rec=0;slideT=0;dashT=invT=shieldT=droneT=slowT=0;healA=dmgA=0;dirty=0;
 WELLS.forEach(w=>S.remove(w.g));WELLS.length=0;FPD.forEach(d=>S.remove(d.o));FPD.length=0;spinT=0;burstN=0;Wp=pick(WEAPONS,cfg.w);Ar=pick(ARMORS,cfg.a);fpArm.suit(Ar.tier);Sk=pick(SKILLS,cfg.s);maxHP=Ar.hp;hp=maxHP;ammo=Wp.mag;buildGun();
 slots=[Wp,pick(WEAPONS,Wp.id==='smg'?'pulse':'smg')];slotAmmo=[slots[0].mag,slots[1].mag];cur=0;if(AC){AUD.prewarm(slots[0].id);AUD.prewarm(slots[1].id)}
 stance=0;eyeH=1.65;ads=0;adsOn=false;adsW=false;sprintLock=false;sprinting=false;swapT=0;tacN=2;tacT=0;SK.k=0;SK.used=[0,0,0];FB.hold=0;$('kf').innerHTML='';$('mm').classList.remove('big');applyCam();updCard();
 for(let i=0;i<5;i++)spawn(1)}
function deploy(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume().catch(()=>{})}catch(err){AC=null}
 resetRun();$('ov').hidden=true;$('pz').hidden=true;$('end').hidden=true;$('hud').hidden=false;
 stopInput();last=performance.now();go=false;document.body.classList.add('playing');
 if(touch)goLandscape();else lock();checkOrient();CUT.start();if(cfg.coop)CO.start(cfg.coop==='duel'?'duel':'coop');else CO.stop()}
// ---- deployment loading screen: letterboxed cinematic fly-throughs of the map's districts, area titles, sector loading bar, tap to skip
const CUT=(()=>{const el=document.createElement('div');el.id='load';el.hidden=true;
 el.innerHTML='<div class="lb t"></div><div class="lb b"></div><div class="cap"><small id="cutk">SECTOR 01</small><b id="cutn">CENTRAL SPIRE PLAZA</b><i id="cutd"></i></div><div class="ld"><span>DEPLOYING TO NEON CORE CITY</span><div class="bar"><i id="cutp"></i></div><em>TAP TO SKIP</em></div><div class="tip" id="cutt"></div>';
 document.body.appendChild(el);
 const V=(x,y,z)=>new T.Vector3(x,y,z),VS=(x,y,z)=>new T.Vector3(x*MAPK,y,z*MAPK);
 const SH=[{n:'CENTRAL SPIRE PLAZA',d:'Ground zero. The Spire still broadcasts over the Grand Plaza.',a:VS(-46,6,58),b:VS(-30,16,40),la:V(0,24,0),lb:V(0,70,0)},
  {n:'GRAND PLAZA MARKET',d:'Neon stalls, transit canopy and close-quarters cover.',a:VS(76,3.2,46),b:VS(62,4.5,42),la:VS(48,2.5,26),lb:VS(40,4,18)},
  {n:'SKY-BRIDGE ROW',d:'Glass corridors 22-32 m up, threaded through the towers. Launch pads put you on the roofs.',a:VS(-20,62,70),b:VS(-12,50,55),la:V(-40*MAPK,28,-77*MAPK),lb:V(-20*MAPK,28,-77*MAPK)},
  {n:'THE BAY',d:'Black water, sea walls and the mountains of the far shore.',a:VS(-205,40,72),b:VS(-198,50,30),la:VS(-110,4,-30),lb:VS(-60,30,-90)},
  {n:'CENTRAL SPIRE PLAZA',d:'The podium lifts ride the Spire to its first observation deck.',a:VS(26,2.2,-22),b:VS(19,3.2,-27),la:V(0,22,0),lb:V(0,95,0)},
  {n:'GRAND PLAZA MARKET',d:'Transit canopy overhead; launch pads throw you onto its roof.',a:VS(28,2.6,6),b:VS(36,3.4,10),la:VS(56,2.4,30),lb:VS(62,3,34)},
  (()=>{const b=NCC_LAYOUT.skybridges[0],d=b.d,c=b.c,y=b.top,P_=(t,o=0)=>V(c[0]+d[0]*t-d[1]*o,y,c[1]+d[1]*t+d[0]*o);return{n:'SKY-BRIDGE ROW',d:'Shoot out the glass to get inside the corridors.',a:P_(-b.L/2-8,14).setY(y-12),b:P_(-b.L/2+6,12).setY(y-6),la:P_(0,0).setY(y+2),lb:P_(b.L/2,0).setY(y+2)}})()];
 const TIPS=['Stand in a cyan lift beam to ride up to highways, bridges and the Spire deck.','Blue launch pads throw you onto the sky-bridge roofs.','Hold jump in mid-air to burn your jetpack (Warden and Ascendant frames).','Tap 180 to whip round on spiders closing from behind.','Shoot the base of a tower to drop the blocks above it.','Grapple near a roof edge to pull yourself up onto the ledge.','Scoped rifles zoom to 4x when you aim down sights.'];
 const DUR=2.3,FADE=.35;let on=false,t=0,skip=0;const e=x=>x*x*(3-2*x);
 function start(){on=true;t=0;skip=0;step.i=-1;el.hidden=false;document.body.classList.add('cutting');el.classList.remove('out');$('hud').style.visibility='hidden';$('cutt').textContent='TIP  \u00b7  '+TIPS[Math.random()*TIPS.length|0];
  if(typeof EN!=='undefined')EN.forEach(q=>q.m.visible=false);if(typeof gun!=='undefined')gun.visible=false;if(typeof fpArm!=='undefined')fpArm.vis(false)}
 function end(){on=false;document.body.classList.remove('cutting');el.classList.add('out');setTimeout(()=>{el.hidden=true},500);$('hud').style.visibility='';EN.forEach(q=>q.m.visible=true);gun.visible=true;fpArm.vis(true);last=performance.now();go=true;C.fov=cfg.fov;C.updateProjectionMatrix();if(typeof Wp!=='undefined'&&Wp&&Wp.rl)rel=Wp.rl}   // ready-up: run the weapon's full reload (animation + sounds) the moment you drop in
 function step(dt,now){t+=dt;const total=SH.length*DUR,i=Math.min(SH.length-1,Math.floor(Math.max(0,t)/DUR)),u=Math.min(1,Math.max(0,(t-i*DUR)/DUR)),s=SH[i];
  C.position.copy(s.a).lerp(s.b,e(u));const la=s.la.clone().lerp(s.lb,e(u));C.lookAt(la);C.rotation.z+=Math.sin(t*.7)*.01;C.fov=58-6*u;C.updateProjectionMatrix();
  if(i!==step.i){step.i=i;$('cutk').textContent='SECTOR 0'+(i+1);$('cutn').textContent=s.n;$('cutd').textContent=s.d;}
  {const c=el.querySelector('.cap'),a=Math.min(1,u*DUR/.5);c.style.opacity=a.toFixed(3);c.style.transform='translateX('+((1-a)*-24).toFixed(1)+'px)'}
  const f=Math.min(1,u*DUR/FADE,(DUR-u*DUR)/FADE);el.style.setProperty('--fade',(1-Math.max(0,f)).toFixed(3));
  $('cutp').style.width=Math.min(100,t/total*100).toFixed(1)+'%';
  if(typeof CITY!=='undefined')CITY.update(dt,now,C);if(typeof PLANET!=='undefined')PLANET.update(now/1000,C);if(typeof SND!=='undefined')SND.tick();
  R.render(S,C);if(t>=total||skip)end()}
 el.addEventListener('pointerdown',e=>{e.preventDefault();skip=1});addEventListener('keydown',e=>{if(on&&(e.code==='Space'||e.code==='Enter'||e.code==='Escape'))skip=1});
 return{start,step,seek(v){t=v},get on(){return on}}})();
{const cb=$('coopb'),sync=()=>{cb.querySelector('b').textContent=cfg.coop==='duel'?'1V1 DUEL':cfg.coop?'CO-OP':'OFF';cb.setAttribute('aria-pressed',cfg.coop?'true':'false');cb.classList.toggle('on',!!cfg.coop)};sync();tapBtn(cb,()=>{cfg.coop=!cfg.coop?'coop':cfg.coop==='duel'?false:'duel';sync();try{save()}catch(e){}})}
tapBtn($('go'),deploy);tapBtn($('again'),deploy);tapBtn($('rs'),resume);tapBtn($('pq'),toHangar);tapBtn($('eh'),toHangar);

// ================= PHYSICS & LOOP =================
const hit=(x,y,z)=>{for(const h of[.1,.9,1.7])for(const a of[-.35,.35])for(const b of[-.35,.35])if(solid(x+a,y+h,z+b))return 1;return 0};
function move(dt){SJ.t=Math.max(0,SJ.t-dt);if(ground&&SJ.t<1.2)SJ.t=0;SJ.fov*=Math.exp(-dt*(SJ.t>0?1.3:3.5));SJ.dip*=Math.exp(-dt*4);SJ.roll*=Math.exp(-dt*2.5);let mx=(K.KeyD?1:0)-(K.KeyA?1:0)+J.x,f=(K.KeyW?1:0)-(K.KeyS?1:0)-J.y;if(sprintLock&&!jo&&!K.KeyS)f=Math.max(f,1);const l=Math.hypot(mx,f),n=l>1?l:1;
 sprinting=ground&&slideT<=0&&!adsW&&ads<.35&&f>.3&&(K.ShiftLeft||K.ShiftRight||sprintLock||lockArm);if(sprinting&&stance)stance=0;if(!sprinting&&sprintLock&&!ground)sprinting=false;
 let sp=6.5*Ar.spd*(Wp.move||1)*(sprinting?1.35:1)*STM[stance]*(1-.4*ads),wx=(Math.cos(yaw)*mx-Math.sin(yaw)*f)/n,wz=(-Math.sin(yaw)*mx-Math.cos(yaw)*f)/n;
 const px0=P.x,pz0=P.z;stepOff*=Math.exp(-dt*13);stepKick*=Math.exp(-dt*16);stepRoll*=Math.exp(-dt*9);if(ground&&CITY.stairH(P.x,P.z)>=0&&wz*Math.sign(P.z)<0)sp*=.9;
 if(slideT>0){slideT-=dt;if(slideT<=0)stance=1;if(l<.1){wx=-Math.sin(yaw);wz=-Math.cos(yaw)}sp=14*Ar.spd*(slideT/.75+.3)}
 if(LEDGE){V.set(0,0,0)}
 else if(grap&&grap.pull){grapStep(dt)}
 else{if(dashT>0){dashT-=dt;V.x=dashDir.x*34;V.z=dashDir.z*34}
 else if(padT>0&&!ground){padT=Math.max(padT,.01)}
 else if(SJ.t>0&&!ground){const hx=-Math.sin(yaw),hz=-Math.cos(yaw),cur=Math.hypot(V.x,V.z),tg=Math.max(JET.on?21:16,cur*.997),c=Math.min(1,dt*3.2);V.x+=(hx*tg-V.x)*c;V.z+=(hz*tg-V.z)*c}
 else{const c=Math.min(1,dt*(ground?10:3));V.x+=(wx*sp-V.x)*c;V.z+=(wz*sp-V.z)*c}
 V.y-=26*dt;jetStep(dt);{const lt=CITY.liftAt(P.x,P.y,P.z);if(lt>0){V.y=Math.max(V.y,Math.min(9,(lt-P.y)*4+1.5));if(V.y<0)V.y=0;dj=0}const pd=padT<=0&&CITY.padAt(P.x,P.y,P.z);if(pd){V.set(pd[2],pd[3],pd[4]);padT=.35;dj=1;AUD.pad()}}}
 const su=(x,z)=>{if(!ground||grap||hit(x,P.y+.8,z))return 0;let lo=0,hi=.8;for(let i=0;i<7;i++){const m=(lo+hi)/2;if(hit(x,P.y+m,z))lo=m;else hi=m}if(CITY.stairH(x,z)<0)stepOff-=hi;return hi};
 const ox=P.x;P.x+=V.x*dt;if(hit(P.x,P.y,P.z)){const tx=P.x,u=su(tx,P.z);if(u)P.y+=u;else{P.x=ox;V.x=0;if(l>.1&&P.y<1.5&&ground&&!grap&&!hit(tx,P.y+1.8,P.z))V.y=10}}
 const oz=P.z;P.z+=V.z*dt;if(hit(P.x,P.y,P.z)){const tz=P.z,u=su(P.x,tz);if(u)P.y+=u;else{P.z=oz;V.z=0;if(l>.1&&P.y<1.5&&ground&&!grap&&!hit(P.x,P.y+1.8,tz))V.y=10}}
 const wasG=ground;ground=0;{const ns=Math.max(1,Math.ceil(Math.abs(V.y*dt)/.3)),dy=V.y*dt/ns;for(let i=0;i<ns;i++){const oy=P.y;P.y+=dy;if(hit(P.x,P.y,P.z)){if(V.y<0)ground=1;P.y=oy;V.y=0;break}}}
 if(wasG&&!ground&&V.y<=0&&!grap&&dashT<=0&&P.y>0&&hit(P.x,P.y-.8,P.z)){let lo=0,hi=.8;for(let i=0;i<7;i++){const m=(lo+hi)/2;if(hit(P.x,P.y-m,P.z))hi=m;else lo=m}P.y-=lo;if(CITY.stairH(P.x,P.z)<0)stepOff+=lo;ground=1;V.y=0}
 {const dd=Math.hypot(P.x-px0,P.z-pz0),spd=dd/Math.max(dt,1e-3),gnd=ground||P.y<=0,onS=gnd&&CITY.stairH(P.x,P.z)>=0;gaitSpd=gnd?spd:0;   // gait: one footstep per half cycle
  if(gnd&&spd>.4&&slideT<=0&&!grap){const len=onS?.5*Math.min(3,Math.max(1,Math.ceil(spd/2.2))):stance===2?.9:Math.min(2.6,Math.max(.6,.55+spd*.22));
   const before=Math.floor(gaitPh/Math.PI);gaitPh+=Math.PI*Math.min(dd,1.5)/len;
   if(Math.floor(gaitPh/Math.PI)!==before){stairFoot^=1;const kk=Math.min(1.2,spd/6);
    if(onS){const up=(P.z-pz0)*Math.sign(P.z)<0;stepKick=(up?.03:.045)*kk+.008;stepRoll=(stairFoot?1:-1)*.006*kk;stairStep(stairFoot,up,Math.min(1.25,.4+spd/9))}
    else if(stance===2)footstep('crawl',stairFoot,'crawl',.8);
    else{stepKick=Math.max(stepKick,.008*kk);footstep(surfAt(),stairFoot,spd>5?'run':'walk',(stance?.55:1)*Math.min(1.2,.35+spd/8))}}}}
 if(P.y<=0){P.y=0;V.y=Math.max(0,V.y);ground=1}if(ground){dj=0;if(!wasG&&airT>.2){const su_=surfAt();if(su_==='stair'){stairStep(0,false,1.3);stairStep(1,false,1)}else AUD.land(airT,Ar.tier||0);footstep(su_,0,'land',Math.min(1.6,.6+airT));stepKick=Math.min(.13,.035+airT*.09);gaitPh=Math.round(gaitPh/Math.PI)*Math.PI}airT=0}else airT+=dt;P.x=cl(P.x,CITY.bounds[0]+1,CITY.bounds[1]-1);P.z=cl(P.z,CITY.bounds[2]+1,CITY.bounds[3]-1);if(ground)padT=Math.max(0,padT-dt*4)}
const mm=$('mm').getContext('2d');let st=0,bob=0,menuSpin=0,stepOff=0,stepKick=0,stepRoll=0,stairD=0,stairFoot=0,lastTread=-1,gaitPh=0,gaitSpd=0,runK=0,sprK=0;
const tmp=new T.Vector3();
function die(){go=false;stopInput();document.body.classList.remove('playing');unlock();$('hud').hidden=true;$('es').textContent='SCORE '+score+' \u00b7 WAVE '+wave;$('end').hidden=false}
const HC={};const setL=(id,t)=>{if(HC[id]!==t){HC[id]=t;$(id).querySelector('.lb').textContent=t}};
function hudCtl(){const cdr=1-(Ar.cdr||0),bk=$('bk');bk.style.setProperty('--p',scd>0?(1-scd/(Sk.cd*cdr)).toFixed(3):1);bk.classList.toggle('rdy',scd<=0);setL('bk',scd>0?Math.ceil(scd)+'s':Sk.short);
 setL('bb',bcd>0?Math.ceil(bcd)+'s':'BLAST');$('bb').classList.toggle('cd',bcd>0);
 const tn=String(tacN);if(HC.tn!==tn){HC.tn=tn;$('tn').textContent=tn}$('bt').classList.toggle('cd',tacN<1);
 $('br').classList.toggle('full',ammo>=Wp.mag&&rel<=0);$('bc').classList.toggle('c1',stance===1);$('bc').classList.toggle('c2',stance===2);setL('bc',stance===2?'PRONE':stance===1?'CROUCH':'CROUCH');
 $('bads').classList.toggle('lit',adsOn||ads>.5);stick.classList.toggle('lk',sprintLock);document.body.classList.toggle('adsing',ads>.5);
 STREAKS.forEach((s,i)=>{const b=$('bs'+(i+1)),r=!SK.used[i]&&SK.k>=s.c;b.classList.toggle('rdy',r);b.classList.toggle('used',!!SK.used[i]);setL('bs'+(i+1),SK.used[i]?'USED':r?s.n:Math.min(SK.k,s.c)+'/'+s.c)});
 $('cross').style.opacity=(.8*(1-ads)+.1).toFixed(2);
 HC.gf=(HC.gf||0)+1;if(HC.gf%5===0){const ok=Sk.id==='grapple'&&scd<=0&&!grap&&!!grappleHit();if(HC.gok!==ok){HC.gok=ok;$('cross').classList.toggle('gok',ok)}}}
const FT={ema:16,prev:0,next:0};
function drsStep(now){const d=now-FT.prev;FT.prev=now;if(d>0&&d<250)FT.ema+=(d-FT.ema)*.06;if(now<FT.next||!go)return;FT.next=now+1500;
 if(FT.ema>21&&DRS>.55){DRS=Math.max(.55,DRS-.1);applyRes()}else if(FT.ema<14.5&&DRS<1){DRS=Math.min(1,DRS+.05);applyRes()}}
function tick(now){requestAnimationFrame(tick);drsStep(now);OPT.value=now/1000;const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=Math.max(now,last);
 if(CUT.on){CUT.step(dt,now);return}
 if(!go){if(!$('ov').hidden){A3&&A3.render(dt,now);return}R.render(S,C);return}
 if(K.Space&&stance===0&&ground)jump();if(cdT&&performance.now()-cdT>=300){stance=2;cdT=0;vib()}move(dt);turnStep(dt);jetFx(dt);/* first-person legs during jetpack flight removed by request */SND.tick();PLANET.update(now/1000,C);spiderPush();bob+=dt*Math.hypot(V.x,V.z)*1.3*(1-.6*ads);fcd-=dt;bcd-=dt;{const was=scd;scd-=dt;if(was>0&&scd<=0)AUD.ready()}AUD.tick(dt);swapT-=dt;fireEngine(dt);
 if(tacN<2){tacT-=dt;if(tacT<=0){tacN++;tacT=tacN<2?12:0}}
 {const sk=SCOPE.k(),fv=(SCOPED[Wp.id]?cfg.fov*(1-.22*Math.min(1,ads/.6)*(1-sk))*(1-sk)+cfg.fov/4.2*sk:cfg.fov*(1-(ADS_Z[Wp.id]||.22)*ads))+TURN.fov+SJ.fov;SCOPE.upd();if(Math.abs(C.fov-fv)>.01){C.fov=fv;C.updateProjectionMatrix()}}if(rel>0){rel-=dt;if(rel<=0)ammo=Wp.mag}
 if(burstN>0){burstT-=dt;if(burstT<=0){if(ammo>0&&rel<=0){discharge();burstN--;burstT=.075}else burstN=0;if(!burstN)fcd=Wp.rate}}
 if(Wp.spin){spinT=trig&&rel<=0&&ammo>0?spinT+dt:Math.max(0,spinT-dt*1.5);if(gunParts.spin&&rel<=0)gunParts.spin.rotation.z+=dt*(4+30*Math.min(1,spinT/Wp.spin))*(trig?1:.3)}
 invT-=dt;shieldT-=dt;slowT-=dt;
 rec*=.9;mf.intensity*=.6;shake*=.88;
 const sl=slideT>0?.7:0,sh=(rnd()-.5)*shake;
 eyeH+=(EYE[stance]-eyeH)*Math.min(1,dt*10);
 const mv=ground&&gaitSpd>.5&&slideT<=0;runK+=((mv?Math.min(1.35,gaitSpd/6.5):0)-runK)*Math.min(1,dt*8);
 sprK+=((sprinting&&mv&&!trig&&rel<=0&&swapT<=0&&ads<.1?1:0)-sprK)*Math.min(1,dt*(sprinting?6:11));
 const gp=gaitPh,gA=runK*(1-ads)*(stance===2?.3:1),hb=-(.016+.026*sprK)*gA*Math.cos(2*gp),hl=(.02+.012*sprK)*gA*Math.sin(gp);
 C.position.set(P.x+sh+hl*Math.cos(yaw),P.y+eyeH-sl+stepOff-stepKick+hb-TURN.dip,P.z+sh-hl*Math.sin(yaw));
 C.rotation.set(pitch+SJ.dip*.05+sh*.3+.007*gA*Math.cos(2*gp)-.03*sprK-(LEDGE?.42*Math.sin(Math.PI*Math.min(1,LEDGE.t/.98))+.1*Math.max(0,1-LEDGE.t/.22):0),yaw+.006*gA*Math.sin(gp),(slideT>0?.08:0)+SJ.roll+stepRoll+TURN.roll+(.009+.01*sprK)*gA*Math.sin(gp));
 {const dip=swapT>0?sm(swapT,0,.5)*.45:0,na=1-ads,g2=gp-.45,jA=runK*na*(1-sprK);   // jog: figure-8 sway that lags the head a touch
  gun.position.set(.3-.3*ads+.013*jA*Math.sin(g2),-.28+(.28-((SIGHT[Wp.id]||{}).yc||.12)*.85)*ads-.014*jA*Math.cos(2*g2)-dip-stepKick*.35*na,-.6+.12*ads+rec*2*(1-.5*ads)+.008*jA*Math.cos(g2));
  gun.rotation.set(dip*1.2+.025*jA*Math.cos(2*g2),.02*jA*Math.sin(g2),.035*jA*Math.sin(g2));
  if(TURN.gy){gun.rotation.y+=TURN.gy;gun.position.x+=TURN.gx;gun.rotation.z+=TURN.gy*.35;gun.position.y-=Math.abs(TURN.gx)*.4}
  if(LDK>0){gun.position.y-=.22*LDK;gun.position.x+=.06*LDK;gun.rotation.x-=.55*LDK;gun.rotation.z-=.35*LDK}}
 {let o={rx:0,ry:0,rz:0,px:0,py:0,pz:0},hand=null,res=null;
  if(rel>0){const pouch=gunModelG.worldToLocal(C.localToWorld(FP_POUCH.clone()));res=reloadFrame(Wp.id,1-rel/Wp.rl,{p:gunParts,pouch,get last(){return fpRel.last},set last(v){fpRel.last=v}});{const tt=1-rel/Wp.rl;rlSfx(Wp.id,fpS,tt,Wp.rl,1);fpS=tt}o=res.pose;{const tt=1-rel/Wp.rl,k=sm(tt,0,.1)-sm(tt,.88,1);o.py+=.12*k;o.px-=.11*k;o.pz+=.14*k;o.rx+=.06*k}hand=res.hand;gunParts.anim=1}
  else{if(gunParts.anim){resetParts(gunParts);gunParts.anim=0}fpRel.last=null;fpS=-1;const R=RIG[Wp.id]||RIG.pulse;hand=R.pump&&gunParts.top?gunParts.top.position.clone().add(new T.Vector3(0,-.045,0)):new T.Vector3(...(R.fore||[0,-.02,.3]))}
  if(SJ.t>0){const q=Math.min(1,SJ.t/.4)*(1-ads);o.rx+=q*.22;o.rz+=q*.32;o.py-=q*.07;o.px+=q*.05;o.pz+=q*.06}   // slide-jet: rifle tucked and canted for the launch
  if(sprK>.001){const q=sprK*(1-ads),sw=Math.sin(gp),ud=Math.cos(2*gp);   // sprint: rifle canted across the chest at low-ready, rocking with each arm pump
   o.rx+=q*(.42+.06*ud);o.ry+=q*(.78+.13*sw);o.rz+=q*(.68+.16*sw);o.px+=q*(-.13+.035*sw);o.py+=q*(-.12-.04*ud);o.pz+=q*(.1+.03*Math.cos(gp))}
  gunWrap.rotation.set(o.rx,o.ry,o.rz);gunWrap.position.set(o.px,o.py,o.pz);C.updateMatrixWorld(true);
  {let hl=C.worldToLocal(gunModelG.localToWorld(hand));if(GRK>.02&&!LEDGE){const fg=GRG.fpGun;fg.updateMatrixWorld(true);hl.lerp(C.worldToLocal(fg.localToWorld(fg.userData.grip.clone())),GRK)}
   if(LDK>0)hl.lerp(C.worldToLocal(LEDGE?LEDGE.hand.clone():hl.clone()),LDK);
   const fw=(GRK>.3||LDK>.3)?null:new T.Vector3(0,0,1).transformDirection(gunModelG.matrixWorld).transformDirection(C.matrixWorldInverse),gu=fw?new T.Vector3(0,1,0).transformDirection(gunModelG.matrixWorld).transformDirection(C.matrixWorldInverse):null;
   // reload: the off hand turns over the magazine (palm on its spine, pushing it home), then rolls back under the fore-end
   const rlt=rel>0?1-rel/Wp.rl:1,rw=rel>0?sm(rlt,.06,.16)*(1-sm(rlt,.84,.97)):0;
   if(gu)hl.addScaledVector(gu,-(window.PDN==null?-.03:window.PDN)*(1-rw));   // seat the fore-end in the palm (hand raised so the handguard rests in it);
   let pl=null;if(rw>0&&gu&&fw&&!(GRK>.3)&&!LEDGE)pl=gu.clone().lerp(fw,rw*(window.RWK||1)).normalize();
   if(GRK>.3&&!LEDGE){const fg=GRG.fpGun;pl=new T.Vector3(1,.05,.12).transformDirection(fg.matrixWorld).transformDirection(C.matrixWorldInverse)}
   const GA=window.GAX||[0,.95,.3],gax=new T.Vector3(...GA).normalize().transformDirection(gunModelG.matrixWorld).transformDirection(C.matrixWorldInverse);   // pistol-grip axis (heel -> index finger), raked like a real grip
   fpArm.pose(hl,C.worldToLocal(gunModelG.localToWorld(new T.Vector3(...(window.GRP||[0,-.07,-.012])))),fw,gu,pl,gax)}
  if(res&&res.drop)spawnDrop(gunParts.mag,gunModelG,res.drop,S,FPD)}
 stepDrops(FPD,dt,.035,S,14);MFX.step(dt);
 for(let i=WELLS.length-1;i>=0;i--){const w=WELLS[i];w.t-=dt;w.ring.rotation.z+=dt*4;w.g.scale.setScalar(.8+.2*Math.sin(now/60));
  for(const e of [...EN]){const ep=e.m.position,dx=w.p.x-ep.x,dz=w.p.z-ep.z,d=Math.hypot(dx,dz)||1;if(d<9){const step=Math.min(d,7*dt);ep.x+=dx/d*step;ep.z+=dz/d*step;if(d<2.6)hurt(e,38*dt)}}
  if(w.t<=0){dsrc='VOID WELL';S.remove(w.g);burst(w.p,24,Wp.col,10);shake=Math.max(shake,.2);[...EN].forEach(e=>{if(e.m.position.distanceTo(w.p)<3.5)hurt(e,45)});WELLS.splice(i,1)}}{const on=Sk.id==='drone'||droneT>0,tt=now/1000;dr.visible=on&&go;
  dr.position.set(-1.22+Math.sin(tt*.9)*.05,.74+Math.sin(tt*1.7)*.05+Math.sin(tt*3.1)*.014,-1.5+Math.cos(tt*.7)*.04+(dr.userData.kick||0));
  {const ch=dr.userData.ch||0;dy.scale.setScalar(1+ch*1.2);dr.userData.ch=ch*.86;dr.rotation.x+=-(dr.userData.kick||0)*1.6}
  dr.rotation.set(Math.sin(tt*1.3)*.08,Math.sin(tt*.8)*.12+(dr.userData.aimY||0),Math.sin(tt*1.1)*.07);dr.userData.kick=(dr.userData.kick||0)*.82;dr.userData.fl.intensity*=.78}
 // drone skill
 if(droneT>0){droneT-=dt;dshot-=dt;dy.material.color.copy(new T.Color(0x6ab0ff).multiplyScalar(2));if(dshot<=0){dshot=.3;let best=null,bd=35;for(const e of EN){const d=e.m.position.distanceTo(P);if(d<bd){bd=d;best=e}}if(best){dsrc='DRONE';droneFire(best)}}}else dy.material.color.copy(new T.Color(0x2a8cff).multiplyScalar(1.6));
 st+=dt;if(dirty&&st>.18){st=0;settle()}
 if(!CO.duel&&!EN.length&&(wt+=dt)>2){wt=0;wave++;const n=Math.min(24,4+wave*2);for(let i=0;i<n;i++)spawn(wave)}
 const slowM=(slowT>0?.3:1)*(Ar.eslow||1);
 CO.step(dt);stepDead(dt);
 for(const e of EN){if(e.chill>0)e.chill-=dt;e.fl-=dt;{const M=e.m.material;M.emissive.setHex(e.stun>0?0xffffff:e.chill>0?0x66d9ff:0x1a7cff);M.emissiveIntensity=e.stun>0?.85:e.chill>0?.6:0}if(e.stun>0){e.stun-=dt;e.m.rotation.y+=dt*2;continue}const m=e.m,TG=CO.target(m.position)||P,dx=TG.x-m.position.x,dz=TG.z-m.position.z,d=Math.hypot(dx,dz)||1,s=e.sp*slowM*(e.chill>0?.4:1)*dt;let ux=dx/d,uz=dz/d;
  if(e.sd>0){e.sd-=dt;const tx=-uz*e.sg,tz=ux*e.sg;ux=tx*.85+ux*.15;uz=tz*.85+uz*.15}   // steer around buildings
  const adv=d>1.5?1:0,nx=m.position.x+ux*s*adv,nz=m.position.z+uz*s*adv;let blk=0;
  if(!solid(nx,1.2,m.position.z)&&!solid(nx,.4,m.position.z))m.position.x=nx;else{e.eat+=dt;blk=1}
  if(!solid(m.position.x,1.2,nz)&&!solid(m.position.x,.4,nz))m.position.z=nz;else{e.eat+=dt;blk=1}
  if(blk&&!(e.sd>0)&&(CITY.sol(nx,.4,m.position.z)||CITY.sol(m.position.x,.4,nz))){e.sd=.9+rnd()*1.1;e.sg=(e.sg&&rnd()<.75)?e.sg:(rnd()<.5?1:-1)}
  if(e.eat>.8){e.eat=0;destroy(new T.Vector3(nx,1.2,nz),.6)}
  for(const o of EN){if(o===e)continue;const ox=m.position.x-o.m.position.x,oz=m.position.z-o.m.position.z,od=Math.hypot(ox,oz);if(od<1.9&&od>1e-4){const k=(1.9-od)*.5;const px=m.position.x+ox/od*k,pz=m.position.z+oz/od*k;if(!solid(px,.4,pz)&&!solid(px,1.2,pz)){m.position.x=px;m.position.z=pz}}}
  m.position.y=1.2;e.ph+=s*5.5*(adv||.35);spAnim(e,d);m.rotation.y=Math.atan2(dx,dz);
  if(TG!==P)CO.slash(e,d,dt);else spSlash(e,d,dt)}
 hp=Math.min(maxHP,hp+Ar.reg*dt);
 dmgA*=.9;healA*=.94;
 $('dmg').style.opacity=Math.max(dmgA,hp<maxHP*.35?.35:0);$('shd').style.opacity=shieldT>0?1:0;$('chr').style.opacity=slowT>0?1:0;$('heal').style.opacity=healA;
 if(hp<=0){if(CO.duel)CO.p1Down();else{die();return}}
 for(let i=PA.length-1;i>=0;i--){const p=PA[i];p.v.y-=20*dt;p.m.position.addScaledVector(p.v,dt);if(p.m.position.y<.15){p.m.position.y=.15;p.v.multiplyScalar(.5)}p.l-=dt;p.m.scale.setScalar(Math.max(.01,p.l));if(p.l<=0){S.remove(p.m);PA.splice(i,1)}}
 BLOOD.update(dt);FX.update(dt);
 for(let i=TR.length-1;i>=0;i--){TR[i].t-=dt;if(TR[i].t<=0){S.remove(TR[i].l);TR.splice(i,1)}}
 // hud
 $('w').textContent=wave;$('sc').textContent=score;$('am').textContent=rel>0?'--':ammo+'/'+Wp.mag;$('hpf').style.width=(hp/maxHP*100)+'%';$('hpt').textContent=Math.ceil(hp)+' / '+maxHP;
 hudCtl();CITY.update(dt,now,C);updGrapple(dt);
 {const big=$('mm').classList.contains('big'),N=320,h=160,q=big?.92:2.6;mm.clearRect(0,0,N,N);mm.save();mm.beginPath();if(big)mm.rect(0,0,N,N);else mm.arc(h,h,h-2,0,6.28);mm.clip();
 const cy=Math.cos(yaw),sy=Math.sin(yaw),pt=(x,z)=>[h+((x-P.x)*cy-(z-P.z)*sy)*q,h+((x-P.x)*sy+(z-P.z)*cy)*q];
 const bd=CITY.bounds,poly=(L,f)=>{mm.beginPath();L.forEach(([x,z],i)=>{const[a,c]=pt(x,z);i?mm.lineTo(a,c):mm.moveTo(a,c)});mm.closePath();f()};
 mm.fillStyle='#0b2550';mm.fillRect(0,0,N,N);mm.fillStyle='#120c26';poly([[bd[0],bd[2]],[bd[1],bd[2]],[bd[1],bd[3]],[bd[0],bd[3]]],()=>mm.fill());
 mm.fillStyle='#1d1838';for(const r of NCC_LAYOUT.roads){const u=r.d,v=[-u[1],u[0]],h2=r.L/2,w2=r.W/2;poly([[r.c[0]+u[0]*h2+v[0]*w2,r.c[1]+u[1]*h2+v[1]*w2],[r.c[0]-u[0]*h2+v[0]*w2,r.c[1]-u[1]*h2+v[1]*w2],[r.c[0]-u[0]*h2-v[0]*w2,r.c[1]-u[1]*h2-v[1]*w2],[r.c[0]+u[0]*h2-v[0]*w2,r.c[1]+u[1]*h2-v[1]*w2]],()=>mm.fill())}
 mm.strokeStyle='#d9902a88';mm.lineWidth=Math.max(2,q*6);for(const r of NCC_LAYOUT.highways){const u=r.d,h2=r.L/2;mm.beginPath();const[a,c]=pt(r.c[0]-u[0]*h2,r.c[1]-u[1]*h2),[e,f]=pt(r.c[0]+u[0]*h2,r.c[1]+u[1]*h2);mm.moveTo(a,c);mm.lineTo(e,f);mm.stroke()}
 if(big){mm.strokeStyle='#21e6ff66';mm.lineWidth=2;poly([[bd[0],bd[2]],[bd[1],bd[2]],[bd[1],bd[3]],[bd[0],bd[3]]],()=>mm.stroke())}
 const bs=q*2;
 mm.fillStyle='#2e2456';for(const b of CITY.boxes){mm.beginPath();[[b[0],b[2]],[b[1],b[2]],[b[1],b[3]],[b[0],b[3]]].forEach(([x,z],i)=>{const[a,c]=pt(x,z);i?mm.lineTo(a,c):mm.moveTo(a,c)});mm.fill()}
 {const[a,c]=pt(0,0);mm.strokeStyle='#8a3bff';mm.lineWidth=2;mm.beginPath();mm.arc(a,c,16.5*q,0,6.29);mm.stroke()}
 mm.fillStyle='#5b3aa8';for(const b of BM){if(b.userData.j)continue;const[a,c]=pt(b.position.x,b.position.z);mm.fillRect(a-bs/2,c-bs/2,bs,bs)}
 for(const e of EN){const[a,c]=pt(e.m.position.x,e.m.position.z);mm.fillStyle=e.stun>0?'#ffffff':'#ff2a3d';mm.fillRect(a-6,c-6,12,12)}
 mm.restore();mm.fillStyle='#21e6ff';mm.beginPath();mm.moveTo(h,h-22);mm.lineTo(h+14,h+14);mm.lineTo(h-14,h+14);mm.fill()}
 if(CO.on)CO.render();else R.render(S,C)}
renderMenu();checkOrient();buildGun();
requestAnimationFrame(tick);
