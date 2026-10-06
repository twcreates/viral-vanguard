
const T=THREE,$=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=Math.random;

// ================= LOADOUT DATA =================
const LOWSPEC=(()=>{try{return matchMedia('(pointer:coarse)').matches||(navigator.hardwareConcurrency||8)<=4}catch(e){return false}})();   // phones/tablets and low-core PCs get the lighter audio/FX budget
const MAPK=.765;   // Neon Core City footprint: 90% then a further 15% (76.5% of the original blockout)
const WEAPONS=[
 {id:'pulse',carry:'Low ready',rlName:'Magazine swap',name:'VX-9 Helix Carbine',cls:'Assault',desc:'Steady full-auto fire that works at any range.',dmg:20,rate:.09,mag:30,rl:1.4,pel:1,spr:.004,rec:.012,kick:.006,brk:.9,col:0x21e6ff,hex:'#21e6ff',snd:520},
 {id:'scatter',carry:'Port arms',rlName:'Shell feed and pump',name:'Breacher-12 Scattergun',cls:'Shotgun',desc:'Eight pellets a shell. Tears through walls and anything close.',dmg:13,rate:.65,mag:6,rl:2,pel:8,spr:.09,rec:.05,kick:.03,brk:.75,col:0xff8a2b,hex:'#ff8a2b',snd:180},
 {id:'rail',carry:'Sling ready',rlName:'Power cell exchange',name:'Orion Rail Lance',cls:'Marksman',desc:'Pierces every infected in a line and punches through three blocks.',dmg:110,rate:.85,mag:5,rl:2.1,pel:1,spr:0,rec:.04,kick:.025,brk:1.1,pierce:1,col:0xb46bff,hex:'#b46bff',snd:900},
 {id:'smg',carry:'High ready',rlName:'Drum swap',name:'Hornet-7 PDW',cls:'Close quarters',desc:'Very fast fire and quick reloads, with light hits.',dmg:10,rate:.05,mag:45,rl:1.2,pel:1,spr:.018,rec:.006,kick:.003,brk:.7,col:0x3dff9a,hex:'#3dff9a',snd:760},
 {id:'arc',carry:'Hip carry',rlName:'Break-open load',name:'Nova Arc Mortar',cls:'Explosive',desc:'Rounds detonate on impact and hit everything nearby.',dmg:60,rate:.6,mag:4,rl:2,pel:1,spr:0,rec:.05,kick:.03,brk:2.4,boom:3.6,col:0xffd23d,hex:'#ffd23d',snd:140},
 {id:'ion',carry:'Underarm carry',rlName:'Belt box change',name:'Tempest Ion Repeater',cls:'Heavy',desc:'Barrels spin up the longer you fire, reaching a torrent of bolts. You move 15% slower.',dmg:14,rate:.055,spin:1,move:.85,mag:90,rl:2.6,pel:1,spr:.02,rec:.004,kick:.003,brk:.8,col:0x3d8bff,hex:'#3d8bff',snd:300},
 {id:'cryo',carry:'Low ready',rlName:'Canister twist',name:'Glacier Cryo Projector',cls:'Control',desc:'Short-range freezing stream. Chilled infected move at 40% speed.',dmg:8,rate:.06,mag:60,rl:1.8,pel:1,spr:.012,rec:.002,kick:.001,brk:.5,chill:2.2,range:22,col:0x9fe8ff,hex:'#9fe8ff',snd:1200},
 {id:'void',carry:'Close carry',rlName:'Core recharge',name:'Event Horizon Voidcaster',cls:'Exotic',desc:'Opens a gravity well that drags nearby infected in and crushes them.',dmg:40,rate:1.1,mag:3,rl:2.4,pel:1,spr:0,rec:.05,kick:.02,brk:1.4,well:1.8,col:0xe14dff,hex:'#e14dff',snd:90},
 {id:'burst',carry:'Compressed ready',rlName:'Side-mag slap',name:'Fang-3 Burst Rifle',cls:'Burst',desc:'Three-round bursts with tight grouping and heavy hits.',dmg:28,rate:.38,burst:3,mag:24,rl:1.5,pel:1,spr:.003,rec:.01,kick:.005,brk:.9,col:0xff3d5a,hex:'#ff3d5a',snd:640},
 {id:'chain',carry:'Cross carry',rlName:'Capacitor flip',name:'Stormcaller Chain Emitter',cls:'Energy',desc:'Lightning that jumps from the target to three more infected nearby.',dmg:34,rate:.32,chain:3,mag:12,rl:1.9,pel:1,spr:0,rec:.02,kick:.008,brk:.8,col:0xcfe0ff,hex:'#cfe0ff',snd:1500}
];
// ---- shared 3D weapon models (grip at origin, barrel along +z) with movable parts for reloads
// ---- weapon micro-detail: procedural surface maps (machined metal, stippled polymer), laser-etched markings, chamfered parts, world-scale UVs
const GFX=(()=>{let R_=null;const N=512;
 const cv=(n=N)=>{const c=document.createElement('canvas');c.width=c.height=n;return[c,c.getContext('2d')]};
 let s=1337;const rn=()=>(s=(s*16807)%2147483647)/2147483647;
 // height field -> tangent-space normal map
 const nrm=(hc,k)=>{const n=hc.width,h=hc.getContext('2d').getImageData(0,0,n,n).data,[oc,o]=cv(n),id=o.createImageData(n,n),d=id.data;
  const H=(x,y)=>h[(((y+n)%n)*n+((x+n)%n))*4]/255;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=(H(x+1,y)-H(x-1,y))*k,dy=(H(x,y+1)-H(x,y-1))*k,l=Math.hypot(dx,dy,1),i=(y*n+x)*4;d[i]=(-dx/l*.5+.5)*255;d[i+1]=(dy/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255}
  o.putImageData(id,0,0);return oc};
 const tex=(c,srgb)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.encoding=T.sRGBEncoding;return t};
 // machined / coated metal
 const metal=(()=>{const[hc,h]=cv(),[ac,a]=cv(),[rc,r]=cv();
  h.fillStyle='#808080';h.fillRect(0,0,N,N);a.fillStyle='#e6e6e6';a.fillRect(0,0,N,N);r.fillStyle='#b8b8b8';r.fillRect(0,0,N,N);
  for(let y=0;y<N;y+=1){const v=128+(rn()-.5)*14;h.fillStyle=`rgb(${v},${v},${v})`;h.globalAlpha=.35;h.fillRect(0,y,N,1);
   const q=180+(rn()-.5)*30;r.fillStyle=`rgb(${q},${q},${q})`;r.globalAlpha=.25;r.fillRect(0,y,N,1)}h.globalAlpha=r.globalAlpha=1;   // tool-path lines
  for(let i=0;i<40;i++){const x=rn()*N,y=rn()*N,R=30+rn()*90,g=a.createRadialGradient(x,y,0,x,y,R);{const q=rn()<.5?60:235;g.addColorStop(0,`rgba(${q},${q},${q+6},.05)`)};g.addColorStop(1,'rgba(0,0,0,0)');a.fillStyle=g;a.fillRect(x-R,y-R,2*R,2*R)}  // coating mottle
  for(let i=0;i<260;i++){const x=rn()*N,y=rn()*N,l=8+rn()*60,an=rn()*6.28;      // micro scratches
   h.strokeStyle=`rgba(${rn()<.6?60:200},${rn()<.6?60:200},${rn()<.6?60:200},.55)`;h.lineWidth=.6+rn()*.8;h.beginPath();h.moveTo(x,y);h.lineTo(x+Math.cos(an)*l,y+Math.sin(an)*l);h.stroke();
   r.strokeStyle='rgba(90,90,90,.5)';r.lineWidth=1;r.beginPath();r.moveTo(x,y);r.lineTo(x+Math.cos(an)*l,y+Math.sin(an)*l);r.stroke();
   a.strokeStyle='rgba(255,255,255,.10)';a.lineWidth=.5;a.beginPath();a.moveTo(x,y);a.lineTo(x+Math.cos(an)*l,y+Math.sin(an)*l);a.stroke()}
  for(let i=0;i<9000;i++){const x=rn()*N,y=rn()*N,v=rn();h.fillStyle=v<.5?'rgba(0,0,0,.25)':'rgba(255,255,255,.25)';h.fillRect(x,y,1,1);r.fillStyle=`rgba(${v*255|0},${v*255|0},${v*255|0},.12)`;r.fillRect(x,y,2,2)}  // grain
  for(let i=0;i<30;i++){const x=rn()*N,y=rn()*N,R=10+rn()*40,g=r.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,'rgba(60,60,60,.35)');g.addColorStop(1,'rgba(60,60,60,0)');r.fillStyle=g;r.fillRect(x-R,y-R,2*R,2*R)}   // handling polish
  return{map:tex(ac,1),rough:tex(rc),nrm:tex(nrm(hc,2.2))}})();
 // stippled polymer (grips, stocks, handguards)
 const poly=(()=>{const[hc,h]=cv(),[rc,r]=cv(),[ac,a]=cv();h.fillStyle='#808080';h.fillRect(0,0,N,N);r.fillStyle='#d8d8d8';r.fillRect(0,0,N,N);a.fillStyle='#ececec';a.fillRect(0,0,N,N);
  for(let i=0;i<5200;i++){const x=rn()*N,y=rn()*N,R=1.2+rn()*2.2,g=h.createRadialGradient(x,y,0,x,y,R);const up=rn()<.5;g.addColorStop(0,up?'rgba(255,255,255,.55)':'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(128,128,128,0)');h.fillStyle=g;h.fillRect(x-R,y-R,2*R,2*R)}
  for(let i=0;i<1500;i++){const x=rn()*N,y=rn()*N;r.fillStyle='rgba(120,120,120,.4)';r.fillRect(x,y,2,2);a.fillStyle=`rgba(255,255,255,${rn()*.12})`;a.fillRect(x,y,3,3)}
  return{map:tex(ac,1),rough:tex(rc),nrm:tex(nrm(hc,3.2))}})();
 // laser-etched markings atlas: 4 rows
 const marks=(()=>{const[c,g]=cv(1024);g.clearRect(0,0,1024,1024);g.fillStyle='rgba(225,235,245,.92)';g.textBaseline='middle';
  const row=(y,txt,font,sz)=>{g.font=`${font} ${sz}px "Arial Narrow",Arial,sans-serif`;g.fillText(txt,24,y)};
  row(64,'VV-ARMS  /  MK.IV  PULSE SYSTEM','700',58);row(140,'CAL 6.8 KJ  \u00b7  SN 04-7731-VG','600',46);
  row(320,'SAFE','700',44);row(380,'SEMI','700',44);row(440,'AUTO','700',44);
  g.fillStyle='rgba(255,170,60,.95)';row(600,'\u26a0 HIGH VOLTAGE  \u00b7  KEEP CLEAR OF MUZZLE','700',40);
  g.fillStyle='rgba(225,235,245,.9)';row(760,'NEO-KAIRO ARSENAL  \u00b7  MADE IN ORBIT','600',44);
  g.strokeStyle='rgba(225,235,245,.9)';g.lineWidth=4;for(let i=0;i<3;i++){g.beginPath();g.arc(560,320+i*60,10,0,7);g.stroke()}
  const t=new T.CanvasTexture(c);t.anisotropy=8;return t})();
 const mkMat=(v0,v1)=>new T.MeshBasicMaterial({map:marks,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,toneMapped:false,opacity:.42});
 const decal=(u0,v0,u1,v1)=>{const g=new T.PlaneGeometry(1,1),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,u0+(u1-u0)*uv.getX(i),1-(v0+(v1-v0)*(1-uv.getY(i))));return g};
 const D={brand:decal(0,.02,1,.1),serial:decal(0,.1,.75,.17),sel:decal(0,.28,.6,.46),warn:decal(0,.56,.95,.62),orig:decal(0,.71,.9,.78)};
 // chamfered boxes (cached) so edges catch highlights
 const bc={};const bev=(w,h,d)=>{const k=[w,h,d].map(x=>x.toFixed(4)).join();if(bc[k])return bc[k];const m=Math.min(w,h,d);
  if(m<.014)return bc[k]=new T.BoxGeometry(w,h,d);const b=Math.min(m*.18,.006),sh=new T.Shape(),x=w/2-b,y=h/2-b;
  sh.moveTo(-x,-y);sh.lineTo(x,-y);sh.lineTo(x,y);sh.lineTo(-x,y);sh.lineTo(-x,-y);
  const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.0005,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:1,curveSegments:1});g.translate(0,0,-(d-2*b)/2);g.computeVertexNormals();return bc[k]=g};
 // world-scale box-projected UVs (about 6 cm per texture tile) so maps never stretch
 const wuv=(geo,sc)=>{if(geo.userData.wuv)return;geo.userData.wuv=1;const p=geo.attributes.position,n=geo.attributes.normal;if(!p||!n)return;
  const uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let u,v;
   if(ax>=ay&&ax>=az){u=p.getZ(i);v=p.getY(i)}else if(ay>=az){u=p.getZ(i);v=p.getX(i)}else{u=p.getX(i);v=p.getY(i)}uv[i*2]=u*sc;uv[i*2+1]=v*sc}
  geo.setAttribute('uv',new T.BufferAttribute(uv,2))};
 const env=()=>{if(R_!==null)return R_;try{const es=new T.Scene();es.add(new T.Mesh(new T.BoxGeometry(14,9,14),new T.MeshBasicMaterial({color:0x0b0a14,side:T.BackSide})));
   const pnl=(c,k,w,h,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,1,0);es.add(m)};
   pnl(0xdfe8ff,4,5,2.5,1.5,4.2,3.5);pnl(0x9fb4ff,1.4,3,4,-5,1.5,2);pnl(0x3aaeff,6,.5,5,4.5,1.5,-3);pnl(0xff2bd6,4,.5,5,-4.5,1.5,-3);pnl(0x3a3a48,1,10,10,0,-4,0);
   const pm=new T.PMREMGenerator(R);R_=pm.fromScene(es,.04).texture;pm.dispose()}catch(e){R_=null}return R_};
 // upgrade the materials a gun was given (once per material)
 const up=(m,kind,fp)=>{if(!m||m.userData.gfx||!m.isMeshStandardMaterial)return m;m.userData.gfx=1;const t=kind==='poly'?poly:metal;
  m.map=t.map;m.roughnessMap=t.rough;m.normalMap=t.nrm;m.normalScale=new T.Vector2(kind==='poly'?.6:.35,kind==='poly'?.6:.35);
  if(kind==='poly'){m.metalness=Math.min(m.metalness,.15);m.roughness=Math.max(m.roughness,.75)}else{m.roughness=Math.min(1,m.roughness*.9+.04)}
  if(m.isMeshPhysicalMaterial){m.clearcoat=kind==='poly'?.08:.55;m.clearcoatRoughness=.28}
  if(fp){const e=env();if(e){m.envMap=e;m.envMapIntensity=kind==='poly'?.35:.9}}
  m.needsUpdate=true;return m};
 return{bev,wuv,up,mkMat,D,env,_tx:{metal,poly},_nrm:nrm,N}})();
// per-weapon realism kit: sight line height (yc), rear/front sight [z, base y, parent], handguard [z0,z1,y,r], mag well [x,y,z,w,h,d,rx], bore height for the muzzle flash
const SIGHT={pulse:{yc:.125,rear:[-.04,.098],front:[.62,.068],hg:[.28,.66,.032,.047],mw:[0,-.032,.112,.054,.034,.086,.2],bore:.035},
 smg:{yc:.115,rear:[-.04,.092],front:[.33,.06],hg:[.18,.355,.03,.037],mw:[0,-.03,.15,.046,.03,.058,0],bore:.03},
 burst:{yc:.135,rear:[-.15,.111],front:[.37,.065],hg:[.19,.385,.04,.033],bore:.04},
 chain:{yc:.125,rear:[-.04,.102],front:[.36,.06],mw:[0,-.03,.1,.06,.03,.13,0],bore:.035},
 scatter:{yc:.128,rear:[-.04,.106],front:[.66,.087],hg:[.52,.69,.065,.03],bore:.065},
 ion:{yc:.172,rear:[-.02,.154],front:[.14,.154],mw:[0,-.045,.06,.095,.03,.15,0],bore:.03},
 rail:{yc:.13,bore:.03},arc:{yc:.12,rear:[-.06,.085],front:[.55,.075,'front'],bore:.06},
 cryo:{yc:.115,rear:[.07,.08],front:[.27,.08],bore:.035},void:{yc:.14,rear:[-.06,.085],front:[.30,.124],bore:.035}};
const WPN_KIT={
wpn_grip:{s:1.831111e-06,o:[0.040876,-0.06,0.002],b:{metal:[934,5160,0,'<<assets/data_01.b64>>']}},
wpn_stock:{s:3.601184e-06,o:[0.092,0.055,-0.118],b:{metal:[590,3528,0,'<<assets/data_02.b64>>'],roof:[432,1512,0,'<<assets/data_03.b64>>'],chrome:[297,1344,0,'<<assets/data_04.b64>>']}},
};
// Godot-sculpted furniture (lofted grip with finger grooves and palm swell, contoured stock with cheek riser and butt pad)
const WKG={};function wkGeo(name){if(WKG[name])return WKG[name];const K=WPN_KIT[name],out={};
 for(const bk in K.b){const[nv,ni,big,b64]=K.b[bk],bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;let o=0;
  const q=new Int16Array(bin,o,nv*3);o+=nv*6;o+=(4-o%4)%4;const n=new Int8Array(bin,o,nv*3);o+=nv*3;o+=(4-o%4)%4;o+=nv*3;o+=(4-o%4)%4;
  const ix=big?new Uint32Array(bin.slice(o,o+ni*4)):new Uint16Array(bin.slice(o,o+ni*2));const P=new Float32Array(nv*3),N=new Float32Array(nv*3);
  for(let i=0;i<nv*3;i++){P[i]=q[i]*K.s+K.o[i%3];N[i]=n[i]/127}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setIndex(new T.BufferAttribute(ix,1));
  // box-projected UVs (metres x 8) so the Godot-baked stipple and machining maps wrap the sculpted surfaces
  const U=new Float32Array(nv*2);for(let i=0;i<nv;i++){const ax=Math.abs(N[i*3]),ay=Math.abs(N[i*3+1]),az=Math.abs(N[i*3+2]);const x=P[i*3],y=P[i*3+1],z=P[i*3+2];
   if(ax>=ay&&ax>=az){U[i*2]=z*8;U[i*2+1]=y*8}else if(ay>=az){U[i*2]=x*8;U[i*2+1]=z*8}else{U[i*2]=x*8;U[i*2+1]=y*8}}g.setAttribute('uv',new T.BufferAttribute(U,2));
  g.computeBoundingSphere();out[bk]=g}return WKG[name]=out}
function wkMesh(name,m){const grp=new T.Group(),G=wkGeo(name);for(const bk in G){const mesh=new T.Mesh(G[bk],bk==='chrome'?m.body:m.dark);mesh.castShadow=true;grp.add(mesh)}return grp}
function gunModel(id,m){
 const g=new T.Group(),parts={glows:[],v:[]},box=m.box||GFX.bev;
 GFX.up(m.body,'metal',m.fp);GFX.up(m.dark,'poly',m.fp);
 const A=(p,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);if(mat.type!=='MeshBasicMaterial')o.castShadow=true;p.add(o);return o};
 const Gp=(p,x=0,y=0,z=0)=>{const o=new T.Group();o.position.set(x,y,z);p.add(o);return o};
 const cyl=(r1,r2,h,s=18)=>new T.CylinderGeometry(r1,r2,h,s);
 const gl=()=>{const q=m.glow.clone();q.userData.c=q.color.clone();parts.glows.push(q);return q};
 const X=Math.PI/2;
 // shared furniture: grip, stock, butt
 {const gp=wkMesh('wpn_grip',m);gp.position.set(0,-.018,.012);gp.scale.set(1.05,1.02,1.05);g.add(gp)}
 if(id!=='burst'){const st=wkMesh('wpn_stock',m);st.position.set(0,.012,-.068);st.scale.set(1.08,1.05,1.05);g.add(st)}
 let mz=.78;
 switch(id){
  case 'scatter':{A(g,box(.08,.11,.34),m.body,0,.035,.08);for(const y of[.065,.0])A(g,cyl(.022,.022,.42),m.dark,0,y,.48,X);
   parts.top=Gp(g,0,-.035,.42);A(parts.top,box(.07,.055,.16),m.dark);for(let i=0;i<4;i++)A(parts.top,box(.072,.006,.01),m.body,0,-.02,-.06+i*.04);
   parts.mag=Gp(g,.0,-.01,.12);A(parts.mag,cyl(.013,.013,.06,12),m.glow,0,0,0,X);parts.mag.visible=false;
   A(g,box(.004,.012,.26),m.glow,.042,.06,.1);A(g,box(.004,.012,.26),m.glow,-.042,.06,.1);mz=.7;break}
  case 'rail':{A(g,box(.06,.09,.34),m.body,0,.035,.08);A(g,box(.042,.05,.66),m.body,0,.03,.6);
   const q=gl();[.42,.58,.75].forEach(z=>A(g,new T.TorusGeometry(.045,.008,10,26),q,0,.03,z));A(g,new T.SphereGeometry(.02,14,10),q,0,.03,.93);
   parts.mag=Gp(g,0,.095,-.08);A(parts.mag,box(.045,.045,.15),m.dark);A(parts.mag,box(.047,.02,.12),m.glow,0,.012,0);
   A(g,cyl(.022,.022,.13),m.dark,0,.108,.1,X);mz=.95;break}
  case 'smg':{A(g,box(.06,.08,.26),m.body,0,.035,.05);A(g,box(.05,.06,.18),m.body,0,.03,.27);A(g,cyl(.016,.016,.07),m.dark,0,.03,.39,X);
   parts.mag=Gp(g,0,-.03,.15);A(parts.mag,box(.036,.05,.05),m.dark,0,-.005,0);A(parts.mag,cyl(.068,.068,.082,32),m.body,0,-.088,.012,0,0,X);for(const s of[-1,1]){A(parts.mag,new T.TorusGeometry(.056,.004,8,30),m.dark,s*.042,-.088,.012,0,X,0);A(parts.mag,new T.TorusGeometry(.034,.004,8,24),m.dark,s*.042,-.088,.012,0,X,0);A(parts.mag,cyl(.014,.014,.012,16),m.dark,s*.045,-.088,.012,0,0,X)}A(parts.mag,box(.012,.03,.006),m.dark,-.053,-.088,.012);A(parts.mag,new T.TorusGeometry(.062,.004,8,30),m.glow,.0415,-.088,.012,0,X,0);
   parts.top=Gp(g,.035,.07,-.02);A(parts.top,box(.02,.02,.04),m.dark);mz=.44;break}
  case 'arc':{A(g,box(.07,.1,.3),m.body,0,.035,.05);
   parts.front=Gp(g,0,-.015,.2);A(parts.front,cyl(.045,.045,.42,26),m.body,0,.045,.21,X);const q=gl();[.08,.2,.32].forEach(z=>A(parts.front,new T.TorusGeometry(.05,.008,10,26),q,0,.045,z));A(parts.front,new T.SphereGeometry(.045,18,12),q,0,.045,.42);
   parts.mag=Gp(g,0,.03,.24);A(parts.mag,new T.SphereGeometry(.035,14,10),m.glow);parts.mag.visible=false;mz=.66;break}
  case 'ion':{A(g,box(.1,.12,.36),m.body,0,.03,.06);
   parts.spin=Gp(g,0,.03,.26);for(const[x,y]of[[.025,.025],[-.025,.025],[.025,-.025],[-.025,-.025]])A(parts.spin,cyl(.013,.013,.42,10),m.dark,x,y,.2,X);
   for(const z of[.03,.2,.38])A(parts.spin,cyl(.048,.048,.025,20),m.body,0,0,z,X);
   A(g,box(.03,.09,.04),m.dark,0,-.06,.3,-.3);
   parts.mag=Gp(g,0,-.1,.06);A(parts.mag,box(.085,.1,.14),m.dark);A(parts.mag,box(.087,.012,.1),m.glow,0,.02,0);mz=.68;break}
  case 'cryo':{A(g,box(.07,.09,.3),m.body,0,.035,.06);A(g,new T.ConeGeometry(.05,.16,20,1,true),m.dark,0,.035,.33,-X);
   const q=gl();[.22,.26,.3].forEach(z=>A(g,new T.TorusGeometry(.04,.006,8,24),q,0,.035,z));
   parts.mag=Gp(g,0,.135,.0);A(parts.mag,cyl(.028,.028,.12),new T.MeshBasicMaterial({color:m.glow.color,transparent:true,opacity:.75,toneMapped:false}));A(parts.mag,cyl(.031,.031,.02),m.dark,0,.065,0);A(parts.mag,cyl(.031,.031,.02),m.dark,0,-.065,0);mz=.42;break}
  case 'void':{A(g,box(.07,.1,.3),m.body,0,.035,.04);A(g,new T.TorusGeometry(.075,.014,10,32),m.dark,0,.035,.3);const q=gl();A(g,new T.TorusGeometry(.058,.006,8,30),q,0,.035,.3);
   for(const s of[-1,1])A(g,box(.012,.03,.14),m.body,s*.07,.035,.25);
   parts.mag=Gp(g,0,.035,.3);A(parts.mag,new T.SphereGeometry(.035,16,12),q);
   for(const s of[-1,1]){const v=Gp(g,s*.035,.087,.08);A(v,box(.034,.006,.13),m.body,-s*.017,0,0);A(v,box(.02,.003,.1),m.glow,-s*.017,-.004,0);parts.v.push(v)}mz=.32;break}
  case 'burst':{A(g,box(.065,.11,.42),m.body,0,.035,-.02);A(g,box(.06,.09,.04),m.dark,0,.02,-.25);A(g,box(.045,.05,.2),m.body,0,.04,.29);A(g,cyl(.015,.015,.06),m.dark,0,.04,.41,X);
   A(g,box(.07,.012,.3),m.glow,0,.093,-.02);
   parts.mag=Gp(g,.06,.02,-.08);A(parts.mag,box(.09,.035,.13),m.dark);A(parts.mag,box(.091,.008,.1),m.glow,0,.012,0);
   parts.top=Gp(g,0,.1,-.06);A(parts.top,box(.025,.02,.05),m.dark);mz=.44;break}
  case 'chain':{A(g,box(.07,.1,.3),m.body,0,.035,.04);for(const s of[-1,1])A(g,box(.012,.05,.24),m.body,s*.032,.035,.3);
   const q=gl();[.22,.27,.32,.37].forEach(z=>A(g,new T.TorusGeometry(.022,.005,8,20),q,0,.035,z));A(g,new T.SphereGeometry(.016,12,8),q,0,.035,.42);
   parts.mag=Gp(g,0,-.075,.1);A(parts.mag,box(.05,.06,.12),m.dark);A(parts.mag,box(.052,.012,.08),m.glow,0,.015,0);mz=.44;break}
  default:{A(g,box(.066,.1,.34),m.body,0,.035,.1);A(g,box(.056,.072,.42),m.body,0,.032,.48);A(g,cyl(.016,.016,.09),m.dark,0,.035,.73,X);
   for(const s of[-1,1])A(g,box(.004,.012,.26),m.glow,s*.035,.05,.12);
   parts.mag=Gp(g,0,-.06,.12);A(parts.mag,box(.045,.14,.07),m.dark,0,-.05,0,.2);A(parts.mag,box(.046,.01,.05),m.glow,0,-.01,0,.2);
   parts.top=Gp(g,.04,.07,.02);A(parts.top,box(.02,.02,.04),m.dark);mz=.78}}
 if(m.line)A(g,box(.01,.004,.2),m.line,0,.088,.14);
 // trigger and guard
  // ---- realism kit: vented handguards, flared mag wells with release buttons, curved trigger in a rounded guard, iron sights on a common sight line
 {const dk=m.dark,bd=m.body,V=(x,y,z)=>new T.Vector3(x,y,z),U=new T.Vector3(0,1,0);
  const seg=(p,a,b,r,mat)=>{const d=new T.Vector3().subVectors(b,a),L=d.length(),o=new T.Mesh(cyl(r,r,L,8),mat);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(U,d.normalize());p.add(o);return o};
  const poly=(p,pts,r,mat)=>{for(let i=1;i<pts.length;i++){seg(p,pts[i-1],pts[i],r,mat);if(i<pts.length-1)A(p,new T.SphereGeometry(r,8,6),mat,pts[i].x,pts[i].y,pts[i].z)}};
  const K=SIGHT[id]||{};
  // trigger guard: bottom bar from the grip, sweeping up at the front into the receiver; curved trigger blade inside
  if(id!=='burst'||true){poly(g,[V(0,-.084,.004),V(0,-.084,.068),V(0,-.079,.085),V(0,-.066,.096),V(0,-.048,.099),V(0,-.034,.097)],.0042,dk);
   poly(g,[V(0,-.036,.047),V(0,-.047,.049),V(0,-.057,.047),V(0,-.065,.042),V(0,-.070,.036)],.0034,bd);A(g,box(.010,.006,.012),dk,0,-.036,.046)}
  // vented handguard: an octagonal shroud with rows of slots and side accessory cut-outs
  if(K.hg){const[z0,z1,y,r]=K.hg,L=z1-z0,sh=A(g,cyl(r,r,L,8),bd,0,y,(z0+z1)/2,X);sh.rotation.y=Math.PI/8;
   A(g,cyl(r+.003,r+.003,.012,8),dk,0,y,z0+.006,X).rotation.y=Math.PI/8;A(g,cyl(r+.003,r+.003,.010,8),dk,0,y,z1-.005,X).rotation.y=Math.PI/8;
   const n=Math.max(3,Math.floor((L-.05)/.034));
   for(let i=0;i<n;i++){const z=z0+.03+i*(L-.06)/(n-1);for(const a of[0,1,2,3,4,5,6,7]){if(a===2||a===6)continue;const an=a*Math.PI/4,cx=Math.sin(an)*r*.93,cy=Math.cos(an)*r*.93;
     const sl=A(g,box(.0035,r*.42,.018),dk,cx,y+cy,z);sl.rotation.z=-an;}}
   for(const s of[-1,1])for(let i=0;i<Math.max(2,n-1);i++)A(g,box(.003,.012,.024),dk,s*r*.97,y,z0+.04+i*(L-.08)/Math.max(1,n-2))}
  // mag well: flared housing around the top of the magazine, with a release button; the magazine slides out of it on reload
  if(K.mw){const[x,y,z,w,h,d,rx]=K.mw,mw=new T.Group();mw.position.set(x,y,z);mw.rotation.x=rx||0;g.add(mw);
   A(mw,box(w,h,.006),bd,0,0,d/2-.003);A(mw,box(w,h,.006),bd,0,0,-d/2+.003);for(const s of[-1,1])A(mw,box(.006,h,d),bd,s*(w/2-.003),0,0);
   A(mw,box(w+.012,.008,d+.014),dk,0,-h/2,0);A(g,cyl(.006,.006,.006,12),dk,x+(K.mwSide?0:w/2+.002),y+.008,z-d/2-.006,0,0,X)}
  // iron sights: rear aperture with protective ears, front post with wings; both reach the same sight line (yc)
  if(K.yc){const yc=K.yc;
   if(K.rear){const[zr,yb]=K.rear;A(g,box(.03,yc-.016-yb,.026),dk,0,(yc-.016+yb)/2,zr);A(g,new T.TorusGeometry(.012,.0032,8,22),dk,0,yc,zr);
    for(const s of[-1,1])A(g,box(.004,yc+.016-yb,.022),dk,s*.019,(yc+.016+yb)/2,zr);A(g,cyl(.004,.004,.04,10),bd,0,yc-.02,zr+.004,0,0,X)}
   if(K.front){const[zf,yb,par]=K.front,P_=par&&parts[par]?parts[par]:g,o=par&&parts[par]?parts[par].position:V(0,0,0);
    A(P_,box(.024,yc-.006-yb,.018),dk,0-o.x,(yc-.006+yb)/2-o.y,zf-o.z);A(P_,box(.0032,.012,.0032),bd,0-o.x,yc-.004-o.y,zf-o.z);
    for(const s of[-1,1])A(P_,box(.0035,.022,.014),dk,s*.012-o.x,yc-.002-o.y,zf-o.z)}}}

 const rail=(z0,z1,y)=>{A(g,box(.03,.008,z1-z0),m.dark,0,y,(z0+z1)/2);for(let z=z0+.008;z<z1;z+=.016)A(g,box(.034,.007,.007),m.dark,0,y+.007,z)};
 const vents=(x,y,z0,n,step)=>{for(let i=0;i<n;i++)A(g,box(.003,.014,.008),m.dark,x,y,z0+i*step)};
 switch(id){
  case 'pulse':rail(-.06,.2,.09);vents(.03,.03,.32,5,.035);vents(-.03,.03,.32,5,.035);A(g,box(.003,.022,.06),m.dark,.034,.05,.06);break;
  case 'scatter':rail(-.06,.18,.095);A(g,box(.003,.03,.07),m.dark,.041,.04,.06);break;
  case 'smg':rail(-.06,.14,.081);vents(.026,.03,.22,3,.03);vents(-.026,.03,.22,3,.03);break;
  case 'burst':rail(-.18,.12,.1);vents(.023,.04,.24,4,.03);vents(-.023,.04,.24,4,.03);break;
  case 'chain':rail(-.06,.14,.091);break;
  case 'rail':{const sc=new T.Group();sc.position.set(0,.13,.04);g.add(sc);A(sc,cyl(.022,.022,.2,20),m.dark,0,0,0,X);A(sc,cyl(.028,.022,.04,20),m.dark,0,0,.11,X);A(sc,cyl(.026,.026,.008,20),new T.MeshBasicMaterial({color:0x12306a}),0,0,.132,X);A(g,box(.012,.02,.012),m.dark,0,.108,-.02);A(g,box(.012,.02,.012),m.dark,0,.108,.1);vents(.031,.03,.48,6,.05);vents(-.031,.03,.48,6,.05);break}
  case 'ion':A(g,box(.02,.05,.02),m.dark,0,.115,-.02);A(g,box(.02,.05,.02),m.dark,0,.115,.14);A(g,box(.02,.018,.18),m.dark,0,.145,.06);vents(.051,.04,-.06,6,.03);vents(-.051,.04,-.06,6,.03);break;
  case 'cryo':{A(g,cyl(.02,.02,.012,18),m.dark,.036,.05,.1,0,0,X);const gf=A(g,new T.CircleGeometry(.015,18),m.glow,.043,.05,.1,0,X,0);vents(.036,.03,-.02,4,.03);break}
  case 'arc':vents(.036,.04,-.06,5,.03);A(g,box(.02,.04,.02),m.dark,0,.105,.0);break;
  case 'void':vents(.036,.035,-.06,5,.03);vents(-.036,.035,-.06,5,.03);break}
 // ---- micro detail: fasteners, ejection port, selector, charging handle, etched markings, muzzle device, sling swivel
 {const hw=({pulse:.033,scatter:.04,rail:.03,smg:.03,arc:.035,ion:.05,cryo:.035,void:.035,burst:.0325,chain:.035})[id]||.033,dk=m.dark,bd=m.body,pin=cyl(.0045,.0045,.006,10),hex=cyl(.006,.006,.004,6);
  for(const s of[-1,1]){for(const[y,z]of[[.06,-.08],[.06,.17],[.005,.17],[.005,-.03]])A(g,hex,bd,s*(hw+.002),y,z,0,0,X);
   A(g,pin,dk,s*(hw+.002),.0,.06,0,0,X);
   const mk=GFX.mkMat();A(g,GFX.D.brand,mk,s*(hw+.0012),.068,-.07,0,s*X,0).scale.set(.1,.009,1);
   A(g,GFX.D.serial,mk,s*(hw+.0012),.057,-.075,0,s*X,0).scale.set(.075,.007,1)}
  A(g,box(.002,.024,.07),dk,hw+.0015,.045,.08);A(g,box(.0015,.016,.06),new T.MeshStandardMaterial({color:0x050506,metalness:.4,roughness:.7}),hw+.0028,.045,.08);
  A(g,cyl(.006,.006,.006,12),bd,-hw-.003,.0,-.005,0,0,X);A(g,box(.003,.004,.022),bd,-hw-.007,.0,.002,.5);
  A(g,GFX.D.sel,GFX.mkMat(),-hw-.0012,.0,-.03,0,-X,0).scale.set(.03,.03,1);
  A(g,box(.016,.012,.02),dk,0,.085,-.13);A(g,box(.03,.006,.012),bd,0,.085,-.142);
  A(g,GFX.D.warn,GFX.mkMat(),hw+.0012,.022,.2,0,X,0).scale.set(.13,.008,1);
  if(id!=='burst'){A(g,new T.TorusGeometry(.008,.0025,8,16),bd,-.03,-.01,-.26,0,X,0);A(g,cyl(.004,.004,.012,8),bd,-.03,-.0,-.26)}
  if(['pulse','smg','burst','scatter','chain'].includes(id)){const mzG=Gp(g,0,id==='scatter'?.065:.035,mz-.02);
   A(mzG,cyl(.019,.017,.05,16),dk,0,0,0,X);for(let i=0;i<3;i++)A(mzG,box(.04,.004,.006),new T.MeshStandardMaterial({color:0x020203}),0,.008,-.012+i*.012);
   A(mzG,cyl(.0085,.0085,.052,12),new T.MeshStandardMaterial({color:0x010102,roughness:1}),0,0,.001,X)}
 }
 // ---- hyper-real micro parts: machined steel and bronze accents, fluted barrel, tritium sight dots, bolt face in the port, stippled grip, QD sling cups
 {const ST=m.steel||(m.steel=new T.MeshStandardMaterial({color:0x4a4f58,metalness:1,roughness:.36})),BZ=m.bronze||(m.bronze=new T.MeshStandardMaterial({color:0x8c6a3c,metalness:.95,roughness:.32})),
   RB=m.rubber||(m.rubber=new T.MeshStandardMaterial({color:0x0b0b0d,metalness:0,roughness:.95})),TRI=m.tri||(m.tri=new T.MeshBasicMaterial({color:new T.Color(0x5dff8a).multiplyScalar(1.4),toneMapped:false}));
  const K=SIGHT[id]||{},hw=({pulse:.033,scatter:.04,rail:.03,smg:.03,arc:.035,ion:.05,cryo:.035,void:.035,burst:.0325,chain:.035})[id]||.033,by=K.bore||.035;
  if(K.hg){const z0=K.hg[1],z1=mz-.03;if(z1-z0>.04){A(g,cyl(.0125,.0125,z1-z0,16),ST,0,by,(z0+z1)/2,X);const n=Math.floor((z1-z0)/.016);for(let i=0;i<n;i++)A(g,cyl(.0135,.0135,.004,16),m.dark,0,by,z0+.008+i*.016,X)}}
  if(K.yc){if(K.rear)for(const sx of[-1,1])A(g,new T.SphereGeometry(.0026,8,6),TRI,sx*.0105,K.yc+.0015,K.rear[0]+.014);
   if(K.front&&!K.front[2])A(g,new T.SphereGeometry(.0024,8,6),TRI,0,K.yc+.004,K.front[0]+.009)}
  A(g,box(.003,.016,.05),ST,hw+.0006,.045,.08);A(g,cyl(.0035,.0035,.004,12),BZ,hw+.0016,.045,.062,0,0,X);                       // bolt carrier and extractor in the ejection port
  for(const sx of[-1,1]){const gp=A(g,box(.004,.07,.036),RB,sx*.0195,-.072,-.008,.3);gp.rotation.x=.3}                          // stippled rubber grip panels
  A(g,box(.009,.012,.02),BZ,0,-.04,.046,.25);                                                                                  // bronze trigger shoe
  if(id!=='burst'){A(g,new T.TorusGeometry(.007,.0022,8,16),ST,hw+.004,.03,-.24,0,Math.PI/2,0);A(g,cyl(.0055,.0055,.006,12),ST,hw+.001,.03,-.24,0,0,X)}  // QD sling cup
  A(g,cyl(.0042,.0042,.012,10),BZ,-hw-.004,.0,-.005,0,0,X);                                                                    // bronze selector hub
 }
 g.traverse(o=>{if(o.isMesh&&o.geometry&&o.material!==m.glow&&o.material.type!=='MeshBasicMaterial')GFX.wuv(o.geometry,16)});
 parts.muzzle=mz;
 [parts.mag,parts.top,parts.front,parts.spin,...parts.v].forEach(o=>o&&(o.userData.b={p:o.position.clone(),r:o.rotation.clone(),s:o.scale.clone(),v:o.visible}));
 return{g,parts}}
// ---- reload animations: t runs 0..1; pose (o) moves the whole gun in first person (rx>0 = muzzle up)
const sm=(t,a,b)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x)};
const swap=(t,a1,b1,a2,b2,d)=>t<(b1+a2)/2?d*sm(t,a1,b1):d*(1-sm(t,a2,b2));
function resetParts(p){[p.mag,p.top,p.front,p.spin,...p.v].forEach(o=>{if(!o)return;const b=o.userData.b;o.position.copy(b.p);o.rotation.copy(b.r);o.scale.copy(b.s);o.visible=b.v});p.glows.forEach(q=>q.color.copy(q.userData.c))}
const glowLvl=(p,k)=>p.glows.forEach(q=>q.color.copy(q.userData.c).multiplyScalar(k));
const RLD={
 pulse(t,p,o){const k=sm(t,0,.14)-sm(t,.86,1);o.rz=.5*k;o.rx=-.2*k;o.py=-.03*k;
  p.mag.position.y+=swap(t,.14,.32,.42,.6,-.4);p.mag.rotation.x+=swap(t,.14,.32,.42,.6,-.4);
  p.top.position.z+=-.07*(sm(t,.66,.73)-sm(t,.78,.84))},
 scatter(t,p,o){const k=sm(t,0,.14)-sm(t,.8,.94);o.rz=-.85*k;o.rx=.12*k;
  const ph=(t-.16)/.6*4;if(ph>=0&&ph<4){const f=ph%1;p.mag.visible=f<.85;p.mag.position.x+=.14*(1-sm(f,0,.7));p.mag.position.y+=-.03*(1-sm(f,0,.7))}
  p.top.position.z+=-.09*(sm(t,.8,.86)-sm(t,.89,.95))},
 rail(t,p,o){const k=sm(t,0,.12)-sm(t,.88,1);o.rx=.35*k;o.rz=.2*k;
  p.mag.position.z+=swap(t,.12,.32,.45,.65,-.32);p.mag.position.y+=swap(t,.12,.32,.45,.65,.04);
  glowLvl(p,t<.1?1:t<.68?.15:.15+.95*sm(t,.68,.95)+(t<.95?(Math.random()-.5)*.3:0))},
 smg(t,p,o){const k=sm(t,0,.14)-sm(t,.86,1);o.rz=1.15*k;o.rx=-.1*k;
  const d=swap(t,.14,.32,.45,.66,-.34);p.mag.position.y+=d;p.mag.rotation.x+=d*9;
  p.top.position.z+=-.05*(sm(t,.7,.76)-sm(t,.8,.86))},
 arc(t,p,o){const k=sm(t,0,.12)-sm(t,.86,1);o.rx=-.18*k;o.rz=.25*k;
  const op=sm(t,.1,.28)-sm(t,.68,.82);p.front.rotation.x+=.6*op;
  p.mag.visible=t>.3&&t<.66;p.mag.position.z+=-.34*(1-sm(t,.32,.6));p.mag.position.y+=.05*(1-sm(t,.32,.6))},
 ion(t,p,o){const k=sm(t,0,.15)-sm(t,.86,1);o.py=-.07*k;o.rx=.18*k;o.rz=.3*k;
  p.mag.position.y+=swap(t,.15,.35,.45,.68,-.45);p.mag.position.x+=swap(t,.15,.35,.45,.68,.06);
  p.spin.rotation.z+=sm(t,.72,1)*sm(t,.72,1)*30},
 cryo(t,p,o){const k=sm(t,0,.12)-sm(t,.86,1);o.rz=-.6*k;o.rx=.1*k;
  p.mag.rotation.y+=3.2*sm(t,.1,.24)+3.2*sm(t,.62,.78);p.mag.position.y+=swap(t,.22,.38,.48,.62,.28);
  glowLvl(p,t<.2?1-sm(t,.05,.2)*.85:t<.62?.15:.15+.85*sm(t,.62,.85))},
 void(t,p,o){const k=sm(t,0,.12)-sm(t,.86,1);o.rx=.3*k;o.py=.03*k;
  const v=sm(t,.06,.2)-sm(t,.8,.92);p.v.forEach((q,i)=>q.rotation.z+=(i?-1:1)*1.1*v);
  const c=t<.34?1-sm(t,.12,.32):sm(t,.38,.78);p.mag.scale.setScalar(Math.max(.01,c*(1+.15*Math.sin(t*60))));
  glowLvl(p,.2+.8*c+(t>.7&&t<.8?.6:0))},
 burst(t,p,o){const k=sm(t,0,.12)-sm(t,.86,1);o.ry=.5*k;o.rz=.35*k;
  p.mag.position.x+=swap(t,.12,.3,.42,.56,.24)+(t>.56&&t<.62?-.012*Math.sin((t-.56)/.06*Math.PI):0);
  p.top.position.z+=-.06*(sm(t,.04,.1)-sm(t,.68,.71))},
 chain(t,p,o){const k=sm(t,0,.15)-sm(t,.84,1);o.rx=.85*k;o.rz=-.2*k;
  p.mag.position.y+=swap(t,.15,.32,.42,.6,-.36);
  glowLvl(p,t<.15?1:t<.62?.12:t<.84?(Math.random()<.5?1.7:.25):1)}};
function applyReload(id,t,p,o){resetParts(p);(RLD[id]||RLD.pulse)(t,p,o)}
// ---- hand-driven reloads: per-weapon rig (model-local units; grip at origin, barrel +z)
const ik2=(S,Hd,L1,L2,pole)=>{const d0=Hd.clone().sub(S);let d=Math.min(d0.length(),L1+L2-1e-3);const dir=d0.normalize(),a=(L1*L1-L2*L2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,L1*L1-a*a)),pv=pole.clone().addScaledVector(dir,-pole.dot(dir)).normalize();return S.clone().addScaledVector(dir,a).addScaledVector(pv,hh)};
function orient(g,a,b,hint){const y=b.clone().sub(a),L=y.length();y.normalize();const z=hint.clone().addScaledVector(y,-hint.dot(y)).normalize(),x=new T.Vector3().crossVectors(y,z);g.position.copy(a);g.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));return L}
const RIG={
 pulse:  {dir:[0,-1,.2],pull:.13,grip:[0,-.12,0],fore:[0,-.03,.36],pose:{rz:.45,rx:-.12,py:.02},fin:'top'},
 scatter:{shells:3,dir:[0,-1,0],pull:.1,grip:[0,-.03,0],pump:1,pose:{rz:-.7,rx:.1}},
 rail:   {dir:[0,.25,-1],pull:.22,grip:[0,.045,0],fore:[0,-.02,.3],pose:{rx:.2,rz:.25}},
 smg:    {dir:[0,-1,0],pull:.12,grip:[0,-.085,0],fore:[0,-.02,.24],pose:{rz:.9,rx:-.08},fin:'top'},
 arc:    {dir:[0,.3,-1],pull:.2,grip:[0,.045,0],fore:[0,-.03,.42],pose:{rx:-.1,rz:.25},hideSeated:1},
 ion:    {dir:[0,-1,0],pull:.16,grip:[0,-.075,0],fore:[0,-.1,.3],pose:{py:-.05,rz:.25,rx:.1}},
 cryo:   {dir:[0,1,0],pull:.18,grip:[0,.09,0],fore:[0,-.02,.18],pose:{rz:-.45,rx:.08}},
 void:   {dir:[0,1,0],pull:.16,grip:[0,.05,0],fore:[0,-.02,.18],pose:{rx:.25,py:.02}},
 burst:  {dir:[1,0,0],pull:.18,grip:[.075,0,0],fore:[0,-.02,.3],pose:{ry:.35,rz:.3},fin:'top'},
 chain:  {dir:[0,-1,0],pull:.13,grip:[0,-.07,0],fore:[0,-.03,.17],pose:{rx:.3,rz:-.1}}};
// weapon-specific actions layered on top (bolts, pumps, hinges, spin, glow)
const RX={
 pulse(t,p){p.top.position.z+=-.07*(sm(t,.74,.79)-sm(t,.81,.86))},
 smg(t,p){p.top.position.z+=-.06*(sm(t,.74,.79)-sm(t,.81,.86))},
 burst(t,p){p.top.position.z+=-.06*(sm(t,.01,.06)-sm(t,.78,.8))},
 scatter(t,p){p.top.position.z+=-.09*(sm(t,.8,.86)-sm(t,.88,.94))},
 rail(t,p){glowLvl(p,t<.2?1-sm(t,.1,.2)*.85:t<.72?.15:.15+.9*sm(t,.72,.95)+(t<.95?(Math.random()-.5)*.3:0))},
 arc(t,p){p.front.rotation.x+=.6*(sm(t,.0,.1)-sm(t,.76,.86))},
 ion(t,p){p.spin.rotation.z+=sm(t,.74,1)*sm(t,.74,1)*30},
 cryo(t,p){p.mag.rotation.y+=3.2*sm(t,.03,.1)+3.2*sm(t,.72,.8);glowLvl(p,t<.2?1-sm(t,.08,.2)*.85:t<.72?.15:.15+.85*sm(t,.72,.9))},
 void(t,p){const v=sm(t,0,.09)-sm(t,.8,.9);p.v.forEach((q,i)=>q.rotation.z+=(i?-1:1)*1.1*v);glowLvl(p,t<.2?1:t<.62?.2:.2+.8*sm(t,.62,.8)+(t>.72&&t<.8?.6:0))},
 chain(t,p){glowLvl(p,t<.12?1:t<.72?.12:t<.86?(Math.random()<.5?1.7:.25):1)}};
// one frame of a reload: moves gun parts, returns the off hand's target (model-local), the gun pose, and a drop event
function reloadFrame(id,t,c){const R=RIG[id]||RIG.pulse,p=c.p,v3=a=>new T.Vector3(a[0],a[1],a[2]);
 resetParts(p);(RX[id]||(()=>{}))(t,p);
 const o={rx:0,ry:0,rz:0,px:0,py:0,pz:0},k=sm(t,0,.1)-sm(t,.88,1);for(const q in R.pose)o[q]=R.pose[q]*k;
 const base=p.mag.userData.b.p,dir=v3(R.dir).normalize(),GRAB=base.clone().add(v3(R.grip)),PULL=GRAB.clone().addScaledVector(dir,R.pull),POUCH=c.pouch;
 const FORE=c.fore?c.fore.clone():R.pump&&p.top?p.top.position.clone().add(new T.Vector3(0,-.045,0)):v3(R.fore||[0,-.02,.3]);
 const L=(a,b,t0,t1)=>a.clone().lerp(b,sm(t,t0,t1)),was=c.last==null?-1:c.last;c.last=t;const cross=x=>was<x&&t>=x;
 let hand,drop=null;
 if(R.shells){
  if(t<.12)hand=L(FORE,POUCH,0,.12);
  else if(t<.72){const u=(t-.12)/.2,n=Math.min(R.shells-1,Math.floor(u)),f=u-n;
   if(f<.45)hand=POUCH.clone().lerp(PULL,sm(f,0,.45));else if(f<.65)hand=PULL.clone().lerp(GRAB,sm(f,.45,.65));else hand=GRAB.clone().lerp(n===R.shells-1?FORE:POUCH,sm(f,.65,1));
   p.mag.visible=f<.65;p.mag.position.copy(base).add(hand.clone().sub(GRAB))}
  else hand=FORE.clone();
  if(cross(.86))drop={pos:GRAB.clone().addScaledVector(dir,.02).sub(v3(R.grip)),dir:new T.Vector3(1,.6,0)}}
 else{
  const FIN=R.fin==='top'&&p.top?p.top.position.clone().add(new T.Vector3(0,.035,0)):GRAB;
  if(t<.1)hand=L(FORE,GRAB,0,.1);else if(t<.2)hand=L(GRAB,PULL,.1,.2);else if(t<.36)hand=L(PULL,POUCH,.2,.36);else if(t<.46)hand=POUCH.clone();
  else if(t<.62)hand=L(POUCH,PULL,.46,.62);else if(t<.72)hand=L(PULL,GRAB,.62,.72);else if(t<.86)hand=L(GRAB,FIN,.72,.8);else hand=L(FIN,FORE,.86,1);
  if((t>=.1&&t<.2)||(t>=.46&&t<.72))p.mag.position.copy(base).add(hand.clone().sub(GRAB));
  if(t>=.72&&t<.78)p.mag.position.addScaledVector(dir,-.008*Math.sin((t-.72)/.06*Math.PI));
  p.mag.visible=R.hideSeated?((t>=.1&&t<.2)||(t>=.46&&t<.86)):!(t>=.2&&t<.46);
  if(cross(.2))drop={pos:base.clone().add(PULL).sub(GRAB),dir:dir.clone().multiplyScalar(.6).add(new T.Vector3(0,-.4,0))}}
 return{hand,pose:o,drop}}
// clone the gun's ammo part as a loose object that falls under gravity (container = world scene or the avatar)
function spawnDrop(part,model,dropLocal,container,list){const c=part.clone(true);c.visible=true;c.traverse(q=>{q.visible=true});
 const wp=model.localToWorld(dropLocal.pos.clone()),wq=model.getWorldQuaternion(new T.Quaternion()).multiply(part.userData.b.r?new T.Quaternion().setFromEuler(part.userData.b.r):new T.Quaternion()),ws=model.getWorldScale(new T.Vector3());
 const wd=dropLocal.dir.clone().transformDirection(model.matrixWorld);
 container.updateMatrixWorld(true);const inv=container.matrixWorld.clone().invert(),cq=container.getWorldQuaternion(new T.Quaternion()).invert(),cs=container.getWorldScale(new T.Vector3());
 c.position.copy(wp).applyMatrix4(inv);c.quaternion.copy(cq.multiply(wq));c.scale.set(ws.x/cs.x,ws.y/cs.y,ws.z/cs.z);
 const vd=wd.transformDirection(inv);container.add(c);
 list.push({o:c,v:vd.multiplyScalar(1.4).add(new T.Vector3((Math.random()-.5)*.4,-.3,(Math.random()-.5)*.4)),w:new T.Vector3((Math.random()-.5)*12,(Math.random()-.5)*8,(Math.random()-.5)*12),t:0,rest:false})}
function stepDrops(list,dt,floor,container,life){for(let i=list.length-1;i>=0;i--){const d=list[i];d.t+=dt;
 if(!d.rest){d.v.y-=9.8*dt;d.o.position.addScaledVector(d.v,dt);d.o.rotation.x+=d.w.x*dt;d.o.rotation.y+=d.w.y*dt;d.o.rotation.z+=d.w.z*dt;
  if(d.o.position.y<floor){if(!d.hit){d.hit=1;dropHit(container&&container.isScene?.9:.45)}d.o.position.y=floor;d.v.y*=-.32;d.v.x*=.55;d.v.z*=.55;d.w.multiplyScalar(.45);if(Math.abs(d.v.y)<.4){d.rest=true;d.o.rotation.x=Math.round(d.o.rotation.x/(Math.PI/2))*(Math.PI/2);d.o.rotation.z=Math.round(d.o.rotation.z/(Math.PI/2))*(Math.PI/2)}}}
 if(d.t>life){container.remove(d.o);list.splice(i,1)}}}

const ARMORS=[
 {id:'recon',p3d:0x2b3446,name:'Recon',cls:'Light',hp:80,spd:1.2,dr:0,reg:2,c1:'#21e6ff',c2:'#dfe9ff',perk:'Moves 20% faster than standard.'},
 {id:'vanguard',p3d:0x1d1b26,name:'Vanguard',cls:'Medium',hp:110,spd:1,dr:.1,reg:2,c1:'#ff2bd6',c2:'#cfcae8',perk:'Takes 10% less damage.'},
 {id:'jugg',p3d:0x2c1518,name:'Juggernaut',cls:'Heavy',hp:170,spd:.8,dr:.25,reg:1,c1:'#ff2a3d',c2:'#6a6386',perk:'Takes 25% less damage. Slow to move.'},
 {id:'specter',p3d:0x15121f,name:'Specter',cls:'Stealth',hp:85,spd:1.12,dr:0,reg:2,eslow:.8,c1:'#b46bff',c2:'#2a2448',perk:'Infected close in 20% slower while they track you.'},
 {id:'medic',p3d:0x3b4040,name:'Medic',cls:'Support',hp:100,spd:1,dr:.05,reg:7,c1:'#3dff9a',c2:'#eef3f0',perk:'Regenerates 7 health per second.'},
 {id:'eng',p3d:0x302b1c,name:'Engineer',cls:'Tech',hp:115,spd:.95,dr:.08,reg:2,cdr:.35,c1:'#ffd23d',c2:'#4a4466',perk:'Skill and blast recharge 35% faster.'},
 {id:'mk2',tier:1,p3d:0x1b2030,name:'Sentinel Mk II',cls:'Upgrade I',hp:130,spd:1.02,dr:.14,reg:3,cdr:.1,c1:'#2f7bff',c2:'#c9d4e6',perk:'Layered chest overplate, heavy segmented pauldrons, vambraces and thigh plates. 14% less damage, skills recharge 10% faster.'},
 {id:'mk3',tier:2,p3d:0x101318,name:'Warden Mk III',cls:'Upgrade II',hp:155,spd:1.06,dr:.18,reg:4,cdr:.2,eslow:.9,jmp:1.08,c1:'#19b8ff',c2:'#e3e8ef',perk:'Back-mounted power pack with exhaust stacks, armoured knees, hip plates, helmet fins. Jetpack: hold jump in mid-air. 18% less damage, 20% faster recharge, higher jumps, Infected near you move 10% slower.'},
 {id:'mk4',tier:3,p3d:0x0a0a0e,name:'Ascendant Mk IV',cls:'Upgrade III',hp:180,spd:1.1,dr:.24,reg:5,cdr:.3,eslow:.8,jmp:1.18,c1:'#5a8cff',c2:'#ffcf6a',perk:'Chest reactor core, swept thruster wings, gold-trimmed crown helmet and glowing conduits. Twin-nozzle jetpack with more thrust and fuel: hold jump in mid-air. 24% less damage, 30% faster recharge, regenerates 5/s, highest jumps, Infected 20% slower.'}
];
const SKILLS=[
 {id:'dash',name:'Phase Dash',short:'DASH',cd:5,col:'#21e6ff',desc:'Blink forward and ignore damage for half a second.'},
 {id:'shield',name:'Overshield',short:'SHIELD',cd:14,col:'#7ad7ff',desc:'Block all incoming damage for 4 seconds.'},
 {id:'drone',name:'Hunter Drone',short:'DRONE',cd:18,col:'#ff2bd6',desc:'Your drone fires on the nearest infected for 8 seconds.'},
 {id:'chrono',name:'Chrono Field',short:'CHRONO',cd:16,col:'#b46bff',desc:'Slow every infected by 70% for 5 seconds.'},
 {id:'nanite',name:'Nanite Surge',short:'HEAL',cd:12,col:'#3dff9a',desc:'Restore 50 health instantly.'},
 {id:'grapple',name:'Grapple Gun',short:'GRAPPLE',cd:2.5,col:'#3dffc8',desc:'Fire a cable up to 20 m at any building or obstacle and reel yourself in. Aim near a roof edge to land on the roof. Hit a high wall and you cling to it: fire again to climb higher or jump to kick off.'}
];
let cfg={w:'pulse',a:'vanguard',s:'shield',sn:1,fov:85,preset:'2-thumb',adsMode:'toggle',res:1};
try{Object.assign(cfg,JSON.parse(localStorage.getItem('vv2')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('vv2',JSON.stringify(cfg))}catch(e){}};
function applyPreset(){const b=document.body.classList;b.remove('p2','p3','p4');b.add({'3-claw':'p3','4-claw':'p4'}[cfg.preset]||'p2')}applyPreset();
const pick=(arr,id)=>arr.find(x=>x.id===id)||arr[0];

// ================= AVATAR =================
function weaponArt(id,c){const d='#1b1440';switch(id){
 case 'scatter':return `<rect x="-12" y="-5" width="16" height="11" rx="2" fill="${d}"/><rect x="0" y="-9" width="50" height="18" rx="3" fill="${d}"/><rect x="50" y="-7" width="30" height="6" fill="#2a2050"/><rect x="50" y="1" width="30" height="6" fill="#2a2050"/><rect x="14" y="7" width="26" height="7" rx="2" fill="${c}"/><rect x="76" y="-8" width="6" height="16" fill="${c}"/>`;
 case 'rail':return `<rect x="-14" y="-4" width="16" height="10" rx="2" fill="${d}"/><rect x="0" y="-5" width="100" height="10" rx="2" fill="${d}"/><rect x="28" y="-8" width="5" height="16" fill="${c}"/><rect x="48" y="-8" width="5" height="16" fill="${c}"/><rect x="68" y="-8" width="5" height="16" fill="${c}"/><rect x="4" y="-2" width="90" height="2" fill="${c}"/><circle cx="102" cy="0" r="4" fill="${c}"/>`;
 case 'smg':return `<rect x="-8" y="-4" width="12" height="9" rx="2" fill="${d}"/><rect x="0" y="-7" width="42" height="14" rx="3" fill="${d}"/><rect x="42" y="-3" width="14" height="6" fill="#2a2050"/><circle cx="20" cy="12" r="8" fill="${c}"/><circle cx="20" cy="12" r="3" fill="${d}"/><rect x="4" y="-3" width="30" height="3" fill="${c}"/>`;
 case 'arc':return `<rect x="-12" y="-5" width="16" height="11" rx="2" fill="${d}"/><rect x="0" y="-8" width="60" height="16" rx="8" fill="${d}"/><rect x="12" y="-8" width="4" height="16" fill="${c}"/><rect x="24" y="-8" width="4" height="16" fill="${c}"/><rect x="36" y="-8" width="4" height="16" fill="${c}"/><circle cx="68" cy="0" r="10" fill="${c}"/><circle cx="68" cy="0" r="4" fill="#fff"/>`;
 default:return `<rect x="-14" y="-4" width="16" height="10" rx="2" fill="${d}"/><rect x="0" y="-6" width="58" height="12" rx="3" fill="${d}"/><rect x="58" y="-3" width="22" height="6" fill="${c}"/><rect x="18" y="6" width="8" height="14" rx="2" fill="${d}"/><rect x="6" y="-2" width="40" height="3" fill="${c}"/>`}}
function avatarSVG(a,w,s){
 const W=a.cls==='Heavy'?66:(a.cls==='Light'||a.cls==='Stealth')?44:52,h=W/2,c1=a.c1,c2=a.c2,dk='#120c2a',pr=a.cls==='Heavy'?20:a.cls==='Light'||a.cls==='Stealth'?11:15,sc=s.col;
 let back='',front='',visor='',helmX='';
 if(s.id==='dash')back+=`<rect x="${100-h+2}" y="86" width="14" height="40" rx="4" fill="${dk}"/><rect x="${100+h-16}" y="86" width="14" height="40" rx="4" fill="${dk}"/><path d="M${100-h+3} 126 l6 26 l6 -26 z M${100+h-15} 126 l6 26 l6 -26 z" fill="${sc}" opacity=".85"/>`;
 if(s.id==='nanite')back+=`<rect x="${100-h-2}" y="80" width="12" height="34" rx="5" fill="${sc}"/><rect x="${100+h-10}" y="80" width="12" height="34" rx="5" fill="${sc}"/>`;
 if(s.id==='drone')front+=`<g><ellipse cx="166" cy="64" rx="14" ry="5" fill="${dk}"/><circle cx="166" cy="60" r="9" fill="#dcdcf0"/><circle cx="163" cy="60" r="4" fill="${sc}"/><path d="M152 64 l-10 6 M180 64 l10 6" stroke="${sc}" stroke-width="2" fill="none"/></g>`;
 if(s.id==='chrono')front+=`<circle cx="100" cy="112" r="16" fill="none" stroke="${sc}" stroke-width="2"/><path d="M100 100 v12 l7 5" stroke="${sc}" stroke-width="2" fill="none"/>`;
 switch(a.id){
  case 'recon':visor=`<rect x="78" y="47" width="44" height="9" rx="4.5" fill="url(#vz)"/>`;break;
  case 'jugg':visor=`<path d="M78 44 h44 v10 h-16 v14 h-12 v-14 h-16 z" fill="url(#vz)"/>`;helmX=`<rect x="72" y="58" width="8" height="16" rx="2" fill="${c1}"/><rect x="120" y="58" width="8" height="16" rx="2" fill="${c1}"/>`;break;
  case 'specter':visor=`<ellipse cx="100" cy="54" rx="22" ry="17" fill="#07041a"/><rect x="82" y="50" width="36" height="3" rx="1.5" fill="${c1}"/>`;helmX=`<path d="M74 40 Q100 14 126 40 L118 30 Q100 18 82 30 Z" fill="${c1}" opacity=".8"/>`;break;
  case 'medic':visor=`<rect x="81" y="44" width="38" height="18" rx="9" fill="url(#vz)"/>`;helmX=`<rect x="96" y="27" width="8" height="14" fill="${c1}"/><rect x="93" y="30" width="14" height="8" fill="${c1}"/>`;break;
  case 'eng':visor=`<circle cx="91" cy="53" r="8" fill="url(#vz)"/><circle cx="109" cy="53" r="8" fill="url(#vz)"/><rect x="97" y="51" width="6" height="3" fill="${dk}"/>`;helmX=`<path d="M118 32 L130 8" stroke="${dk}" stroke-width="3"/><circle cx="130" cy="8" r="4" fill="${c1}"/>`;break;
  default:visor=`<rect x="80" y="44" width="40" height="18" rx="9" fill="url(#vz)"/>`;helmX=`<path d="M94 26 Q100 12 106 26 L104 40 L96 40 Z" fill="${c1}"/>`;
 }
 const stroke=`stroke="#07041a" stroke-width="2.5" stroke-linejoin="round"`;
 return `<svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${a.name} armor with ${w.name} and ${s.name}">
 <defs><radialGradient id="ag"><stop offset="0" stop-color="${c1}" stop-opacity=".4"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
 <linearGradient id="vz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".35" stop-color="${c1}"/><stop offset="1" stop-color="#0a0620"/></linearGradient></defs>
 <ellipse cx="100" cy="150" rx="92" ry="124" fill="url(#ag)"/>
 <ellipse cx="100" cy="262" rx="62" ry="9" fill="#000000" opacity=".55"/><ellipse cx="100" cy="262" rx="70" ry="11" fill="none" stroke="${c1}" stroke-opacity=".5" stroke-width="1.5"/>
 ${back}
 <g ${stroke}>
  <rect x="${100-h+4}" y="156" width="${h-6}" height="86" rx="6" fill="${c2}"/><rect x="${102}" y="156" width="${h-6}" height="86" rx="6" fill="${c2}"/>
  <rect x="${100-h+2}" y="194" width="${h-2}" height="14" rx="4" fill="${c1}"/><rect x="${101}" y="194" width="${h-2}" height="14" rx="4" fill="${c1}"/>
  <rect x="${100-h}" y="236" width="${h+2}" height="18" rx="5" fill="${dk}"/><rect x="${98}" y="236" width="${h+2}" height="18" rx="5" fill="${dk}"/>
  <path d="M${100-h} 82 L${100+h} 82 L${100+h-5} 160 L${100-h+5} 160 Z" fill="${c2}"/>
  <path d="M${100-h+8} 90 L${100+h-8} 90 L${100+h-12} 132 L100 142 L${100-h+12} 132 Z" fill="${dk}" fill-opacity=".35"/>
  <rect x="${100-h+5}" y="148" width="${W-10}" height="10" fill="${dk}"/>
  <circle cx="100" cy="112" r="9" fill="${dk}"/>
  <rect x="${100-h-15}" y="88" width="15" height="58" rx="7" fill="${c2}"/><rect x="${100+h}" y="88" width="15" height="58" rx="7" fill="${c2}"/>
  <ellipse cx="${100-h-6}" cy="90" rx="${pr}" ry="${pr*.72}" fill="${c1}"/><ellipse cx="${100+h+6}" cy="90" rx="${pr}" ry="${pr*.72}" fill="${c1}"/>
  <rect x="92" y="70" width="16" height="14" fill="${dk}"/>
  <circle cx="100" cy="50" r="27" fill="${c2}"/>
 </g>
 <circle cx="100" cy="112" r="5" fill="${sc}"/><rect x="${100-h+6}" y="96" width="${W-12}" height="3" fill="${c1}" opacity=".9"/>
 ${helmX}${visor}${front}
 <g transform="translate(${100-h-20},150)" ${stroke}>${weaponArt(w.id,w.hex)}</g>
 <circle cx="${100-h-8}" cy="150" r="8" fill="${dk}" ${stroke}/><circle cx="${100+h+8}" cy="152" r="8" fill="${dk}" ${stroke}/>
 </svg>`}

// ---- custom menu icons
const SHORT={pulse:'HELIX',scatter:'BREACH',rail:'ORION',smg:'HORNET',arc:'NOVA',ion:'TEMPEST',cryo:'GLACIER',void:'HORIZON',burst:'FANG-3',chain:'STORM'};
const _R=(x,y,w,h,r=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`,_C=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`,_GR=x=>`<path d="M${x} 16.5h4l-1 7h-4z"/>`;
const WICON={
 pulse:c=>[_R(2,10,10,7,1.5)+_R(12,8,22,8,1.5)+_R(34,10,20,4)+_R(54,10.5,6,3,.5)+_R(20,4.5,9,3)+'<path d="M22 16h6l-1.5 9h-5z"/>'+_GR(15),_R(13,11,40,1.4,.5)+_R(22.5,19,4,1.2,.4),''],
 scatter:c=>[_R(2,10,10,7,1.5)+_R(12,8,18,9,1.5)+_R(30,8,27,3)+_R(30,12.5,27,3)+_R(34,16,15,4,1.5)+_GR(15),_R(13,10.5,15,1.4,.5)+_R(56,8,2,7.5,.5),''],
 rail:c=>[_R(2,11,9,6,1.5)+_R(11,9,16,7,1.5)+_R(27,11.5,33,2.6)+_R(12,5,11,3.2)+_GR(14),_R(13,5.6,9,2,.5)+_C(60,12.8,1.6),_C(35,12.8,3.6)+_C(43,12.8,3.6)+_C(51,12.8,3.6)],
 smg:c=>[_R(7,10,7,5,1.5)+_R(14,8,20,8,1.5)+_R(34,10,10,4)+_R(44,10.5,5,3,.5)+_GR(17)+_C(27,20,5.5),_R(15,10.5,17,1.3,.5),_C(27,20,5.5)],
 arc:c=>[_R(3,10,8,6,1.5)+_R(11,8,14,9,1.5)+_R(25,7,27,11,5.5)+_GR(14),_C(54,12.5,4),'<path d="M31 7v11M37 7v11M43 7v11"/>'],
 ion:c=>[_R(6,8,20,11,2)+_R(26,8.5,32,1.6,.5)+_R(26,11.5,32,1.6,.5)+_R(26,14.5,32,1.6,.5)+_R(26,17.5,32,1.6,.5)+_R(29,7,4,13)+_R(44,7,4,13)+_R(10,19,13,6,1.5)+_R(35,19,3,6),_R(11,21,11,1.4,.5)+_R(8,10,16,1.4,.5),''],
 cryo:c=>[_R(4,10,8,6,1.5)+_R(12,9,18,8,1.5)+'<path d="M30 10l14-4v15l-14-4z"/>'+_GR(15)+_R(16.5,1.5,7,1.6,.5),_R(17.5,3,5,6.5,1.5),'<path d="M48 8l5-2.5M48 13.5h6M48 19l5 2.5"/>'],
 void:c=>[_R(4,10,8,6,1.5)+_R(12,9,16,8,1.5)+_GR(15)+_R(28,6,9,2)+_R(28,19,9,2),_C(44,13.5,3),'<circle cx="44" cy="13.5" r="8" stroke-width="2.6"/>'],
 burst:c=>['<path d="M4 9h34l3 3v5H12v3H4z"/>'+_R(41,10.5,14,4)+_R(55,11,4,3,.5)+_GR(22),_R(25,12,10,4.5,1)+_R(6,7.6,28,1.2,.4),''],
 chain:c=>[_R(4,10,8,6,1.5)+_R(12,9,16,8,1.5)+_R(28,7,24,2.2)+_R(28,17.8,24,2.2)+_GR(15)+_R(16,17,8,5,1.5),_C(56,13,2),'<path d="M29 13l4-3 3 6 4-6 3 6 4-6 3 3"/>']};
function weaponIcon(id,c){const[b,f,s]=(WICON[id]||WICON.pulse)(c);return `<svg viewBox="0 0 64 28" aria-hidden="true"><g fill="currentColor">${b}</g><g fill="${c}">${f}</g><g fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${s}</g></svg>`}
function armorIcon(a){const c=a.c1,ex={
  vanguard:`<path d="M14.5 2.5h3l1 5.5h-5z" fill="${c}"/>`,
  recon:`<path d="M10 9L6.5 2.5" stroke="currentColor" stroke-width="1.4"/><circle cx="6.3" cy="2.3" r="1.5" fill="${c}"/>`,
  jugg:`<path d="M6.5 23h19v3.5l-3.5 3.5H10l-3.5-3.5z" fill="currentColor"/><path d="M11 26.5v2M16 26.5v2.5M21 26.5v2" stroke="${c}" stroke-width="1.4"/>`,
  specter:`<path d="M7.5 13L2.5 6l6.5 3.5zM24.5 13l5-7-6.5 3.5z" fill="currentColor"/>`,
  medic:`<path d="M14.6 1.8h2.8v2.6H20v2.8h-2.6v2.6h-2.8V7.2H12V4.4h2.6z" fill="${c}"/>`,
  eng:`<path d="M22 9l3.5-6.5" stroke="currentColor" stroke-width="1.4"/><circle cx="25.7" cy="2.3" r="1.5" fill="${c}"/><circle cx="12.3" cy="12.6" r="2.4" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="19.7" cy="12.6" r="2.4" fill="none" stroke="${c}" stroke-width="1.5"/>`}[a.id]||'';
 const wide=a.id==='jugg'?' transform="translate(16 17) scale(1.1 1) translate(-16 -17)"':'';
 return `<svg viewBox="0 0 32 32" aria-hidden="true"><g${wide}><path d="M6 19c0-7 4.5-12 10-12s10 5 10 12v4l-4 4H10l-4-4z" fill="currentColor"/><path d="M8.5 15.5l7.5 4 7.5-4M16 19.5V25" stroke="${a.id==='specter'?'#b46bff':'#3d7dff'}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.2" cy="19" r="2.1" fill="#0a0620" stroke="${c}" stroke-width="1.4"/><circle cx="25.8" cy="19" r="2.1" fill="#0a0620" stroke="${c}" stroke-width="1.4"/></g>${ex}</svg>`}
function skillIcon(s){const c=s.col,p={
  dash:'<path d="M5 9l7 7-7 7M13 9l7 7-7 7M21 9l6.5 7-6.5 7"/>',
  shield:'<path d="M16 3.5l10 4v7.5c0 7-4.5 11-10 13.5C10.5 26 6 22 6 15V7.5z"/><path d="M16 9v14M11 14h10" stroke-width="1.6"/>',
  drone:'<circle cx="16" cy="18" r="5.5"/><path d="M3.5 11h9.5M19 11h9.5M8.3 11V7.5M23.7 11V7.5M12.5 14.5L10 11M19.5 14.5L22 11"/><circle cx="16" cy="18" r="1.8" fill="currentColor"/>',
  chrono:'<circle cx="16" cy="17.5" r="10"/><path d="M16 11.5v6l4.5 3M12.5 4h7M16 4v3.5"/>',
  nanite:'<path d="M16 3l11 6.5v13L16 29 5 22.5v-13z"/><path d="M16 10v12M10 16h12"/>',
  grapple:'<path d="M5 27l13-13"/><path d="M18 14l3-9 3 3 3 3-9 3z"/><path d="M21 5l-4-1M27 11l1 4"/><circle cx="5" cy="27" r="2" fill="currentColor"/><path d="M8 24c2 1 3 2 3 4" stroke-dasharray="2 2"/>'}[s.id]||'';
 const gid='sg'+s.id;return `<svg viewBox="-2 -2 36 36" aria-hidden="true" fill="none" style="color:${c};overflow:visible"><defs><radialGradient id="${gid}" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="#0a0620" stop-opacity=".9"/></radialGradient></defs><path d="M16 -.5l14.3 8.25v16.5L16 32.5 1.7 24.25V7.75z" fill="url(#${gid})" stroke="${c}" stroke-width="1.4" stroke-opacity=".9"/><path d="M16 2.2l12 6.9v13.8L16 29.8 4 22.9V9.1z" stroke="#fff" stroke-opacity=".14" stroke-width=".8"/><g transform="translate(16 16) scale(.62) translate(-16 -16)" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 2px ${c})">${p}</g></svg>`}
function itemIcon(kind,x){if(kind==='armor'){const si=A3&&A3.suitIcons&&A3.suitIcons()[x.tier||0];if(si)return `<img class="simg" src="${si}" alt="">`}if(kind==='weapon'){const im=A3&&A3.icons&&A3.icons()[x.id];return im?`<img class="wimg" src="${im}" alt="">`:weaponIcon(x.id,x.hex)}return kind==='armor'?armorIcon(x):skillIcon(x)}
// ================= HANGAR UI =================
let pop=null;const isPortrait=()=>matchMedia('(orientation:portrait) and (max-width:760px)').matches;
const bar=(l,v,max,txt)=>`<div class="sb"><span style="text-align:left;color:inherit">${l}</span><i><em style="width:${Math.round(cl(v/max,0.04,1)*100)}%"></em></i><span>${txt}</span></div>`;
const POPS={weapon:['WEAPON','10 classes'],armor:['ARMOR','9 frames'],skill:['SKILL','5 abilities'],set:['SETTINGS','Controls and view']};
function slotHTML(kind,x,label,sub){const sh=(kind==='weapon'?SHORT[x.id]:kind==='armor'?String(x.name||label).split(' ')[0]:x.short)||x.name||label;return `<span class="ic ic-${kind}">${itemIcon(kind,x)}</span><span class="tx"><small>${kind.toUpperCase()}</small><b><span class="ln">${label}</span><span class="sn">${String(sh).toUpperCase()}</span></b><span>${sub}</span></span>`}
function renderMenu(){
 const w=pick(WEAPONS,cfg.w),a=pick(ARMORS,cfg.a),s=pick(SKILLS,cfg.s);
 if(A3){if(!A3.el.isConnected){$('av').textContent='';$('av').appendChild(A3.el);$('avh').hidden=false;try{if(localStorage.getItem('vv-dragged'))$('avh').classList.add('used')}catch(_){}}A3.build(a,w,s)}else $('av').innerHTML=avatarSVG(a,w,s);
 $('avn').textContent=a.name.toUpperCase();$('avc').textContent=a.cls.toUpperCase()+' FRAME';$('avk').textContent=a.perk;
 const sl=document.querySelectorAll('.slot');
 sl[0].innerHTML=slotHTML('weapon',w,w.name.toUpperCase(),w.cls);sl[0].style.setProperty('--sc',w.hex);
 sl[1].innerHTML=slotHTML('armor',a,a.name.toUpperCase(),a.cls+' frame');sl[1].style.setProperty('--sc',a.c1);
 sl[2].innerHTML=slotHTML('skill',s,s.name.toUpperCase(),s.cd+'s recharge');sl[2].style.setProperty('--sc',s.col);
 document.querySelectorAll('[data-pop]').forEach(b=>b.setAttribute('aria-expanded',b.dataset.pop===pop));
 if(A3&&A3.focus)A3.focus(pop?(isPortrait()?2:1):0);
 $('ov').classList.toggle('popping',!!pop);const P=$('pop');if(!pop){P.hidden=true;return}
 P.hidden=false;$('pt').textContent=POPS[pop][0];$('ps').textContent=POPS[pop][1];
 const L=$('list'),D=$('det');
 if(pop==='set'){L.style.setProperty('--cols',1);L.innerHTML=`<div class="set"><label for="sn">Look sensitivity <input id="sn" type="range" min=".4" max="2.5" step=".05" value="${cfg.sn}"></label><label for="fv">Field of view <input id="fv" type="range" min="70" max="110" step="1" value="${cfg.fov}"></label><label for="vg">Game volume <input id="vg" type="range" min="0" max="1" step=".01" value="${volG()}"></label><label for="vm">Music volume <input id="vm" type="range" min="0" max="1" step=".01" value="${volM()}"></label><label for="lp">Touch layout <select id="lp">${[['2-thumb','2-thumb'],['3-claw','3-finger claw'],['4-claw','4-finger claw']].map(([v,t])=>`<option value="${v}"${cfg.preset===v?' selected':''}>${t}</option>`).join('')}</select></label><label for="res">Resolution <span class="resrow"><select id="res">${[[.5,'50% (performance)'],[.67,'67%'],[.75,'75%'],[.85,'85%'],[1,'100% (default)'],[1.25,'125%'],[1.5,'150% (sharpest)']].map(([v,t])=>`<option value="${v}"${(cfg.res||1)==v?' selected':''}>${t}</option>`).join('')}</select><output id="resv"></output></span></label><label for="adsm">ADS button <select id="adsm"><option value="toggle"${cfg.adsMode!=='hold'?' selected':''}>Tap to toggle</option><option value="hold"${cfg.adsMode==='hold'?' selected':''}>Hold</option></select></label></div>`;
  D.innerHTML=`<p><b>TOUCH</b>Left stick moves; full push is a jog. Push past the ring into SPRINT to sprint, release there to lock it. Jump again in mid-air to double jump. Drag the right side or the fire button to aim. Crouch: tap, hold for prone, tap while sprinting to slide. Claw layouts add a left fire button.</p><p><b>DESKTOP</b>WASD, mouse, RMB aim, Shift sprint, C crouch, R reload, X swap, E lethal, G stun, Q skill, 4/5/6 streaks, M map.</p><p><b>TIP</b>Shoot the base of a tower to drop the blocks above it.</p>`;
  $('sn').oninput=e=>{cfg.sn=+e.target.value;applyCam();save()};$('fv').oninput=e=>{cfg.fov=+e.target.value;applyCam();save()};$('vg').oninput=e=>{cfg.vg=+e.target.value;applyVol();save()};$('vg').onchange=()=>{ensureAC();beep(660,.12,'sine',.12)};$('vm').oninput=e=>{cfg.vm=+e.target.value;ensureAC();applyVol();save()};$('lp').onchange=e=>{cfg.preset=e.target.value;applyPreset();save()};$('adsm').onchange=e=>{cfg.adsMode=e.target.value;save()};$('res').onchange=e=>{cfg.res=+e.target.value;applyRes();save()};applyRes();return}
 const arr=pop==='weapon'?WEAPONS:pop==='armor'?ARMORS:SKILLS,sel=pop==='weapon'?cfg.w:pop==='armor'?cfg.a:cfg.s;
 L.style.setProperty('--cols',pop==='weapon'?5:3);
 L.innerHTML=arr.map(x=>{const col=x.hex||x.c1||x.col,lab=pop==='weapon'?SHORT[x.id]:pop==='skill'?x.short:x.name.toUpperCase();return `<button class="tile${pop==='weapon'?'':' sq'}" data-id="${x.id}" aria-pressed="${x.id===sel}" aria-label="${x.name}" title="${x.name}" style="--ic:${col}">${itemIcon(pop,x)}<b>${lab}</b></button>`}).join('');
 L.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{const same=cfg[pop==='weapon'?'w':pop==='armor'?'a':'s']===b.dataset.id;cfg[pop==='weapon'?'w':pop==='armor'?'a':'s']=b.dataset.id;save();renderMenu();if(pop==='weapon'&&same&&A3&&A3.reload)A3.reload();const t=$('list').querySelector(`[data-id="${b.dataset.id}"]`);t&&t.focus()});
 if(pop==='weapon')D.innerHTML=`<div class="dh">${itemIcon('weapon',w)}</div><p><b>${w.name.toUpperCase()} \u00b7 ${w.cls.toUpperCase()}</b>${w.desc} Carried at ${w.carry.toLowerCase()}. Reload: ${w.rlName.toLowerCase()}.</p><div class="bars">${bar('DAMAGE',w.dmg*w.pel,110,w.pel>1?w.dmg+'\u00d7'+w.pel:w.dmg)}${bar('RATE',1/w.rate,20,Math.round(60/w.rate)+'/m')}${bar('MAG',w.mag,45,w.mag)}${bar('RELOAD',2.7-w.rl,1.7,w.rl+'s')}</div>`;
 else if(pop==='armor')D.innerHTML=`<div class="dh sq">${itemIcon('armor',a)}</div><p><b>${a.name.toUpperCase()} \u00b7 ${a.cls.toUpperCase()}</b>${a.perk}</p><div class="bars">${bar('HEALTH',a.hp,190,a.hp)}${bar('SPEED',a.spd,1.2,Math.round(a.spd*100)+'%')}${bar('ARMOR',a.dr,.25,Math.round(a.dr*100)+'%')}${bar('REGEN',a.reg,7,a.reg+'/s')}</div>`;
 else D.innerHTML=`<div class="dh sq">${itemIcon('skill',s)}</div><p><b>${s.name.toUpperCase()}</b>${s.desc}</p><div class="bars">${bar('RECHARGE',20-s.cd,16,s.cd+'s')}</div>`;
}
(function rotUI(){
 const keyHold={};addEventListener('keydown',e=>{if($('ov').hidden||!A3||pop||e.repeat)return;const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='SELECT')return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();keyHold[e.key]=1;A3.rot.press(e.key==='ArrowLeft'?-1:1)}});
 addEventListener('keyup',e=>{if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&keyHold[e.key]){keyHold[e.key]=0;if(!A3)return;if(keyHold.ArrowLeft)A3.rot.press(-1);else if(keyHold.ArrowRight)A3.rot.press(1);else A3.rot.release()}})})();
function openPop(k){pop=pop===k?null:k;renderMenu();if(pop){const t=$('list').querySelector('[aria-pressed="true"]')||$('px');t&&t.focus()}}
document.querySelectorAll('[data-pop]').forEach(b=>b.onclick=()=>{const k=b.dataset.pop,was=pop===k;openPop(k);if(was)b.focus()});
$('px').onclick=$('done').onclick=()=>{const k=pop;pop=null;renderMenu();const b=document.querySelector(`[data-pop="${k}"]`);b&&b.focus()};
addEventListener('keydown',e=>{if(e.key==='Escape'&&pop&&!$('ov').hidden){e.preventDefault();$('px').onclick()}});
addEventListener('resize',()=>{if(pop&&A3&&A3.focus)A3.focus(isPortrait()?2:1)});

// ================= 3D WORLD =================
const R=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'});R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.shadowMap.autoUpdate=false;
let DRS=1;const resPR=()=>Math.max(.35,Math.min(devicePixelRatio,LOWSPEC?1.6:2)*(cfg.res||1)*DRS);R.setPixelRatio(resPR());R.setSize(innerWidth,innerHeight);document.body.prepend(R.domElement);
function applyRes(){R.setPixelRatio(resPR());R.setSize(innerWidth,innerHeight);const o=document.getElementById('resv');if(o)o.textContent=Math.round(innerWidth*resPR())+' \u00d7 '+Math.round(innerHeight*resPR())}
const S=new T.Scene();S.background=new T.Color(0x0a0620);S.fog=new T.FogExp2(0x1a0838,.016);
const C=new T.PerspectiveCamera(85,innerWidth/innerHeight,.1,700);C.rotation.order='YXZ';S.add(C);
// ================= NEON NIGHT CITY (match arena) =================
// Layout follows the concept map: Central Spire plaza at the origin, Residential NW, Commercial NE,
// Industrial SW, Docks/Harbor SE with open water past the east and south edges. North is -z (spawn faces it).
// Neon Core City layout (cleaned from the supplied blockout) and Godot-built kit meshes (see the Godot project)
const NCC_LAYOUT={"bounds":[-126.225,126.225,-103.275,103.275],"roads":[{"c":[0.0,80.325],"L":229.5,"W":13.77,"d":[1.0,-0.0],"name":"Road_0"},{"c":[0.0,26.775],"L":244.8,"W":10.71,"d":[1.0,-0.0],"name":"Road_1"},{"c":[0.0,-26.775],"L":244.8,"W":10.71,"d":[1.0,-0.0],"name":"Road_2"},{"c":[-65.025,-11.475],"L":191.25,"W":10.71,"d":[-0.0,1.0],"name":"Road_3"},{"c":[7.65,-11.475],"L":198.9,"W":10.71,"d":[-0.0,1.0],"name":"Road_4"},{"c":[70.38,-11.475],"L":191.25,"W":10.71,"d":[-0.0,1.0],"name":"Road_5"},{"c":[-15.3,-0.0],"L":191.25,"W":9.18,"d":[0.95104,-0.30906],"name":"Road_6"},{"c":[15.3,-11.475],"L":175.95,"W":9.18,"d":[0.92717,0.37463],"name":"Road_7"}],"highways":[{"c":[0.0,-59.67],"L":198.9,"W":10.0,"d":[0.99027,-0.13915],"top":19,"bot":15,"supports":[[79.545,-70.847],[53.03,-67.121],[26.515,-63.396],[0.0,-59.67],[-26.515,-55.944],[-53.03,-52.219],[-79.545,-48.493]]},{"c":[-62.73,-0.0],"L":156.825,"W":10.0,"d":[0.05238,-0.99863],"top":19,"bot":15,"supports":[[-62.73,-59.288],[-62.73,-35.572],[-62.73,-11.857],[-62.73,11.857],[-62.73,35.572],[-62.73,59.288]]},{"c":[67.32,-11.475],"L":145.35,"W":10.0,"d":[0.03489,0.99939],"top":19,"bot":15,"supports":[[67.32,-65.025],[67.32,-43.605],[67.32,-22.185],[67.32,-0.765],[67.32,20.655],[67.32,42.075]]}],"bridges":[{"c":[-80.325,-57.375],"L":72.675,"W":7.0,"d":[0.97816,-0.20788],"top":10.0},{"c":[-91.8,-3.825],"L":72.675,"W":7.0,"d":[0.98481,0.17361],"top":10.0},{"c":[76.5,-76.5],"L":72.675,"W":7.0,"d":[0.99027,0.13914],"top":10.0}],"skybridges":[{"c":[-34.425,-58.905],"L":53.55,"W":7.0,"d":[0.99027,-0.13915],"top":28.0,"name":"North"},{"c":[55.845,-29.835],"L":41.31,"W":7.0,"d":[0.97816,0.20787],"top":32.0,"name":"East"},{"c":[-69.615,-23.715],"L":36.72,"W":6.0,"d":[0.96128,-0.27559],"top":25.0,"name":"West"},{"c":[-32.417,-95.434],"L":40.02,"W":7.0,"d":[0.99886,-0.04779],"top":22.0,"name":"Market Link"},{"c":[98.685,-38.059],"L":66.73,"W":7.0,"d":[-0.61909,-0.78532],"top":28.0,"name":"Harbor Link"},{"c":[93.139,13.77],"L":53.83,"W":7.0,"d":[0.30555,0.95218],"top":25.6,"name":"Canyon Link"},{"c":[-34.999,16.447],"L":66.45,"W":7.0,"d":[0.52378,0.85186],"top":22.0,"name":"Arcology Link"}],"skyport":{"box":[58.905,106.335,-104.805,-75.735],"top":23},"spire":{"c":[0,0],"height":216.5},"plaza":{"box":[-27.54,27.54,-27.54,27.54]},"parks":[{"box":[-60.435,-28.305,35.955,58.905],"trees":[[-34.387,47.958,8.46],[-38.694,55.508,5.32],[-50.314,51.102,7.38],[-44.163,46.616,8.18],[-38.518,55.715,6.44],[-54.476,53.768,6.54]]},{"box":[-60.435,-31.365,-47.43,-26.01],"trees":[[-50.643,-40.155,6.34],[-51.584,-33.385,7.26],[-39.734,-33.828,5.86],[-43.965,-42.825,5.1],[-42.549,-44.355,6.36],[-48.547,-38.273,6.0]]},{"box":[30.217,64.642,31.365,52.785],"trees":[[54.889,34.788,8.88],[55.417,43.965,7.86],[40.201,37.271,8.9],[54.797,37.06,5.78],[57.329,48.578,8.16],[46.114,39.596,5.2]]},{"box":[29.835,61.965,-52.785,-28.305],"trees":[[37.829,-46.275,7.42],[40.254,-49.626,6.84],[56.289,-32.62,5.3],[51.576,-44.55,6.84],[38.166,-33.335,6.46],[38.564,-43.877,6.34]]},{"box":[-23.715,16.065,-79.942,-60.817],"trees":[[-2.677,-76.622,5.2],[-0.13,-69.872,8.6],[6.939,-70.059,6.22],[-19.049,-64.601,5.12],[-10.328,-68.624,6.18],[1.928,-73.494,5.52]]},{"box":[16.83,36.72,-4.59,12.24],"trees":[[33.645,6.939,8.08],[33.622,-0.203,5.92],[31.786,0.088,7.36],[31.227,0.482,5.7],[23.287,-0.065,7.54],[24.511,3.592,8.92]]}],"zones":{"Central_Plaza":[-13.005,13.005,-10.71,10.71],"Market":[29.835,51.255,12.24,29.07],"Transit":[19.89,38.25,6.885,20.655],"Rooftop":[-45.135,-23.715,-66.555,-51.255]},"covers":[[6.533,2.632,4.5,1.3],[-6.701,-6.648,1.3,4.5],[-0.52,-0.872,4.5,1.3],[-7.749,-1.974,4.5,1.3],[7.673,7.13,1.3,4.5],[-7.153,-4.735,1.3,4.5],[34.838,22.728,4.5,1.3],[41.463,23.44,1.3,4.5],[35.236,24.243,4.5,1.3],[46.757,18.36,1.3,4.5],[42.259,20.204,4.5,1.3],[46.65,15.048,4.5,1.3],[32.819,10.519,4.5,1.3],[30.256,10.725,4.5,1.3],[25.551,12.584,4.5,1.3],[26.775,13.495,1.3,4.5],[32.941,9.624,4.5,1.3],[24.74,14.03,4.5,1.3],[-29.59,-57.696,4.5,1.3],[-42.48,-60.29,1.3,4.5],[-29.743,-58.201,1.3,4.5],[-25.689,-63.143,1.3,4.5],[-42.412,-58.607,4.5,1.3],[-40.767,-59.234,4.5,1.3]],"transit_canopy":[10.71,47.43,6.885,20.655],"pads":[[-34.425,-58.905,49.17],[55.08,-32.13,57.17],[0.0,-0.0,17.17],[29.07,13.77,20.17]],"spawns":[[-103.275,53.55],[103.275,53.55],[-103.275,-65.025],[95.625,-87.975]],"signs":[{"c":[-91.8,15.3],"L":9.0,"W":0.35,"d":[1.0,-0.0],"y0":39.0,"y1":55.0,"mat":"Magenta signage"},{"c":[-55.08,-13.77],"L":8.0,"W":0.35,"d":[1.0,-0.0],"y0":56.0,"y1":70.0,"mat":"Cyan architectural light"},{"c":[55.08,6.12],"L":10.0,"W":0.35,"d":[1.0,-0.0],"y0":44.0,"y1":62.0,"mat":"Magenta signage"},{"c":[85.68,-26.775],"L":9.0,"W":0.35,"d":[1.0,-0.0],"y0":63.0,"y1":79.0,"mat":"Cyan architectural light"},{"c":[-22.95,-80.325],"L":11.0,"W":0.35,"d":[1.0,-0.0],"y0":75.0,"y1":95.0,"mat":"Blue architectural light"},{"c":[22.95,-80.325],"L":10.0,"W":0.35,"d":[1.0,-0.0],"y0":82.0,"y1":100.0,"mat":"Magenta signage"}],"mountains":[{"c":[129.836,-137.21],"r":16.1,"h":82.9},{"c":[121.119,-112.325],"r":23.5,"h":43.0},{"c":[97.996,-132.793],"r":14.7,"h":48.2},{"c":[88.943,-126.925],"r":26.9,"h":80.0},{"c":[68.977,-109.444],"r":27.9,"h":59.5},{"c":[57.566,-124.783],"r":27.4,"h":64.1},{"c":[42.932,-137.535],"r":25.5,"h":69.8},{"c":[17.04,-134.892],"r":26.0,"h":87.2},{"c":[6.208,-109.858],"r":16.4,"h":79.4},{"c":[-13.999,-128.639],"r":19.9,"h":67.4},{"c":[-25.406,-110.948],"r":14.7,"h":83.4},{"c":[-45.839,-108.768],"r":17.0,"h":84.8},{"c":[-58.239,-130.769],"r":25.3,"h":47.0},{"c":[-73.589,-136.243],"r":23.0,"h":44.4},{"c":[-92.626,-118.976],"r":26.7,"h":67.9},{"c":[-109.751,-126.826],"r":20.9,"h":51.9},{"c":[-127.372,-135.302],"r":25.0,"h":76.4},{"c":[-135.497,-117.259],"r":26.5,"h":75.5},{"c":[21.887,-173.54],"r":14.8,"h":19.5},{"c":[145.576,9.348],"r":27.2,"h":35.2},{"c":[-67.718,-165.508],"r":20.0,"h":20.5},{"c":[-160.003,63.215],"r":11.7,"h":14.9},{"c":[140.653,56.572],"r":15.4,"h":17.7},{"c":[-148.326,-100.134],"r":10.1,"h":33.3},{"c":[-145.37,67.397],"r":14.8,"h":25.2},{"c":[-148.636,-24.006],"r":25.6,"h":40.2},{"c":[-57.467,-148.112],"r":17.1,"h":36.8},{"c":[134.227,-88.193],"r":21.8,"h":28.1},{"c":[108.764,-99.944],"r":17.4,"h":32.6},{"c":[-144.504,0.439],"r":24.1,"h":14.7},{"c":[-147.694,12.883],"r":17.7,"h":18.6},{"c":[-139.968,88.013],"r":12.9,"h":14.8},{"c":[115.465,87.933],"r":21.5,"h":38.6},{"c":[51.201,-171.647],"r":16.8,"h":41.7},{"c":[144.666,-9.601],"r":20.2,"h":12.8},{"c":[-99.676,108.389],"r":19.9,"h":31.9},{"c":[105.715,111.43],"r":24.5,"h":22.8},{"c":[-62.925,143.506],"r":24.0,"h":15.6},{"c":[-13.812,151.99],"r":11.0,"h":25.5},{"c":[132.689,-104.736],"r":21.2,"h":40.2}],"bay":[-306.0,76.5,-183.6,0.0],"flyers":[[-91.8,64.5,-49.725],[-45.9,84.5,-87.975],[65.025,71.5,-80.325],[95.625,59.5,-26.775],[15.3,99.5,-103.275]],"cars":[{"c":[-80.325,80.325],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[0.0,80.325],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[76.5,80.325],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[-59.67,26.775],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[55.08,26.775],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[-65.025,-26.775],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[65.025,-26.775],"L":5.0,"W":2.1,"d":[1.0,-0.0]},{"c":[-15.3,13.77],"L":5.0,"W":2.1,"d":[1e-05,1.0]},{"c":[15.3,-13.77],"L":5.0,"W":2.1,"d":[1e-05,1.0]}],"lamps":[[-84.15,19.125],[-55.08,19.125],[-19.125,19.125],[19.125,19.125],[55.08,19.125],[84.15,19.125],[-65.025,-34.425],[-26.775,-34.425],[26.775,-34.425],[65.025,-34.425]],"towers":[{"name":"A","box":[-77.265,-63.495,-32.895,-19.125],"h":72.5,"crown":77.5,"beacon":85.0,"neon":"Violet Neon","shops":{"n":1,"s":1,"w":1,"e":1}},{"name":"B","box":[-40.545,-28.305,-68.85,-56.61],"h":65.0,"crown":70.0,"beacon":77.5,"neon":"Green Neon","shops":{"n":0,"s":0,"w":0,"e":0}},{"name":"C","box":[48.195,61.965,-39.015,-25.245],"h":77.5,"crown":82.5,"beacon":90.0,"neon":"Pink Neon","shops":{"n":0,"s":1,"w":1,"e":1}},{"name":"D","box":[72.292,83.767,-69.997,-58.522],"h":70.0,"crown":75.0,"beacon":82.5,"neon":"Pink Neon","shops":{"n":0,"s":0,"w":1,"e":0}},{"name":"E","box":[-10.328,2.677,-85.297,-72.292],"h":85.0,"crown":90.0,"beacon":97.5,"neon":"Violet Neon","shops":{"n":0,"s":0,"w":0,"e":1}}],"buildings":[{"box":[-126.225,-119.722,-103.275,-85.68],"h":16.1,"glass":true,"crown":false,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-117.427,-108.63,-103.275,-85.68],"h":14.1,"glass":true,"crown":false,"antenna":false,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-113.985,-83.385,-65.79],"h":46.35,"glass":false,"crown":false,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-119.34,-63.495,-56.992],"h":44.85,"glass":true,"crown":true,"antenna":true,"neon":"Violet Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-119.34,-54.697,-45.9],"h":50.35,"glass":true,"crown":true,"antenna":true,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-118.193,-108.63,-43.605,-35.955],"h":50.3,"glass":true,"crown":true,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-126.225,-109.395,-2.295,13.77],"h":12.9,"glass":false,"crown":true,"antenna":true,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-113.985,35.955,43.987],"h":16.3,"glass":true,"crown":false,"antenna":true,"neon":null,"kind":"ind","shops":{"n":1,"s":0,"w":0,"e":0}},{"box":[-126.225,-113.985,46.282,53.55],"h":13.4,"glass":false,"crown":true,"antenna":false,"neon":"Cyan Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-113.985,55.845,69.615],"h":10.35,"glass":true,"crown":false,"antenna":false,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-118.575,75.735,83.767],"h":12.3,"glass":false,"crown":false,"antenna":true,"neon":"Violet Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":1}},{"box":[-126.225,-118.575,86.062,93.33],"h":11.25,"glass":true,"crown":false,"antenna":true,"neon":"Violet Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-126.225,-118.193,95.625,103.275],"h":11.05,"glass":true,"crown":false,"antenna":true,"neon":"Pink Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-115.897,-108.63,95.625,103.275],"h":14.9,"glass":true,"crown":false,"antenna":true,"neon":"Violet Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-106.335,-88.74,-103.275,-85.68],"h":25.35,"glass":true,"crown":false,"antenna":true,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-106.335,-88.74,-83.385,-75.735],"h":21.45,"glass":true,"crown":false,"antenna":true,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-106.335,-88.74,1.53,13.77],"h":14.2,"glass":true,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-106.335,-88.74,95.625,103.275],"h":12.25,"glass":false,"crown":false,"antenna":true,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-86.445,-74.205,-103.275,-95.242],"h":17.75,"glass":true,"crown":false,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":1}},{"box":[-86.445,-74.205,-92.947,-85.68],"h":14.5,"glass":true,"crown":false,"antenna":true,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":1}},{"box":[-86.445,-74.205,-83.385,-65.79],"h":39.15,"glass":true,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":1}},{"box":[-86.445,-75.735,3.825,11.475],"h":10.9,"glass":true,"crown":true,"antenna":true,"neon":"Pink Neon","kind":"ind","shops":{"n":0,"s":1,"w":0,"e":1}},{"box":[-86.445,-74.205,35.955,42.458],"h":12.85,"glass":true,"crown":true,"antenna":true,"neon":null,"kind":"ind","shops":{"n":1,"s":0,"w":0,"e":1}},{"box":[-86.445,-74.205,44.752,53.55],"h":14.35,"glass":true,"crown":false,"antenna":false,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":1}},{"box":[-86.445,-74.205,55.845,69.615],"h":9.95,"glass":false,"crown":false,"antenna":false,"neon":"Violet Neon","kind":"ind","shops":{"n":0,"s":1,"w":0,"e":1}},{"box":[-86.445,-68.85,95.625,103.275],"h":14.15,"glass":true,"crown":false,"antenna":true,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-55.845,-48.96,-103.275,-85.68],"h":31.0,"glass":true,"crown":true,"antenna":true,"neon":"Violet Neon","kind":"res","shops":{"n":0,"s":0,"w":1,"e":0}},{"box":[-55.845,-48.96,-17.595,-6.12],"h":31.0,"glass":false,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"res","shops":{"n":1,"s":0,"w":1,"e":0}},{"box":[-55.845,-48.96,61.2,69.615],"h":9.6,"glass":true,"crown":false,"antenna":true,"neon":"Pink Neon","kind":"ind","shops":{"n":0,"s":1,"w":1,"e":0}},{"box":[-66.555,-57.758,95.625,103.275],"h":13.0,"glass":false,"crown":false,"antenna":true,"neon":"Cyan Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-55.462,-48.96,95.625,103.275],"h":15.5,"glass":true,"crown":false,"antenna":true,"neon":"Violet Neon","kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-46.665,-38.633,-103.275,-85.68],"h":59.15,"glass":true,"crown":true,"antenna":false,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-36.337,-29.07,-103.275,-85.68],"h":46.7,"glass":false,"crown":true,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-46.665,-29.07,-83.385,-72.675],"h":50.5,"glass":true,"crown":true,"antenna":false,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-46.665,-32.13,-17.595,-6.12],"h":53.9,"glass":true,"crown":false,"antenna":false,"neon":"Pink Neon","kind":"com","shops":{"n":1,"s":0,"w":0,"e":1}},{"box":[-46.665,-40.163,61.2,69.615],"h":13.4,"glass":false,"crown":true,"antenna":true,"neon":"Pink Neon","kind":"ind","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-37.867,-29.07,61.2,69.615],"h":12.6,"glass":false,"crown":true,"antenna":false,"neon":null,"kind":"ind","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-46.665,-37.867,95.625,103.275],"h":11.65,"glass":false,"crown":false,"antenna":false,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-35.572,-29.07,95.625,103.275],"h":15.05,"glass":true,"crown":true,"antenna":false,"neon":null,"kind":"ind","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-26.775,-17.977,-103.275,-89.505],"h":58.25,"glass":false,"crown":false,"antenna":true,"neon":"Pink Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-15.682,-9.18,-103.275,-89.505],"h":53.0,"glass":false,"crown":true,"antenna":false,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-26.775,-17.977,-43.605,-36.72],"h":67.45,"glass":true,"crown":true,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-15.682,-9.18,-43.605,-36.72],"h":57.8,"glass":false,"crown":false,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-26.01,-9.18,35.955,53.55],"h":51.5,"glass":true,"crown":true,"antenna":true,"neon":"Pink Neon","kind":"com","shops":{"n":1,"s":0,"w":0,"e":0}},{"box":[-26.01,-19.508,55.845,69.615],"h":56.6,"glass":false,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-17.212,-9.18,55.845,69.615],"h":50.25,"glass":false,"crown":true,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[-26.775,-9.18,95.625,103.275],"h":50.65,"glass":true,"crown":false,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[-6.885,-0.383,95.625,103.275],"h":43.05,"glass":true,"crown":true,"antenna":true,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[1.912,10.71,95.625,103.275],"h":46.5,"glass":true,"crown":false,"antenna":true,"neon":"Pink Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[16.83,30.6,-103.275,-85.68],"h":47.55,"glass":true,"crown":false,"antenna":true,"neon":"Pink Neon","kind":"com","shops":{"n":0,"s":0,"w":1,"e":0}},{"box":[18.36,30.6,-83.385,-70.38],"h":61.75,"glass":false,"crown":false,"antenna":true,"neon":null,"kind":"com","shops":{"n":0,"s":0,"w":1,"e":0}},{"box":[16.83,27.54,-55.845,-45.9],"h":63.75,"glass":false,"crown":true,"antenna":true,"neon":"Pink Neon","kind":"com","shops":{"n":0,"s":0,"w":1,"e":0}},{"box":[16.83,27.54,35.955,53.55],"h":49.9,"glass":true,"crown":true,"antenna":false,"neon":null,"kind":"com","shops":{"n":1,"s":0,"w":1,"e":0}},{"box":[16.83,30.6,55.845,69.615],"h":63.9,"glass":true,"crown":true,"antenna":true,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":1,"w":1,"e":0}},{"box":[13.005,30.6,95.625,103.275],"h":50.65,"glass":false,"crown":true,"antenna":false,"neon":"Pink Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[32.895,41.692,-103.275,-86.445],"h":58.85,"glass":false,"crown":false,"antenna":true,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[43.987,50.49,-103.275,-86.445],"h":51.1,"glass":true,"crown":true,"antenna":false,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[32.895,50.49,55.845,69.615],"h":49.7,"glass":false,"crown":false,"antenna":false,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[32.895,50.49,95.625,103.275],"h":55.3,"glass":false,"crown":false,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[52.785,61.2,-13.77,-6.12],"h":55.45,"glass":false,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"res","shops":{"n":1,"s":0,"w":0,"e":1}},{"box":[52.785,61.2,55.845,69.615],"h":46.0,"glass":false,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":1,"w":0,"e":1}},{"box":[52.785,70.38,95.625,103.275],"h":50.4,"glass":true,"crown":true,"antenna":true,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[79.56,90.27,-54.315,-45.9],"h":60.75,"glass":false,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"res","shops":{"n":0,"s":0,"w":1,"e":0}},{"box":[79.56,90.27,-43.605,-35.955],"h":48.1,"glass":true,"crown":true,"antenna":true,"neon":"Pink Neon","kind":"res","shops":{"n":0,"s":1,"w":1,"e":0}},{"box":[79.56,90.27,-17.595,-6.12],"h":35.8,"glass":true,"crown":false,"antenna":true,"neon":null,"kind":"res","shops":{"n":1,"s":0,"w":1,"e":0}},{"box":[79.56,90.27,-3.825,6.12],"h":32.25,"glass":true,"crown":true,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":1,"w":1,"e":0}},{"box":[79.56,90.27,35.955,53.55],"h":28.4,"glass":false,"crown":false,"antenna":false,"neon":"Violet Neon","kind":"com","shops":{"n":1,"s":0,"w":1,"e":0}},{"box":[79.56,90.27,55.845,69.615],"h":21.35,"glass":false,"crown":false,"antenna":true,"neon":null,"kind":"com","shops":{"n":0,"s":1,"w":1,"e":0}},{"box":[72.675,90.27,95.625,103.275],"h":23.95,"glass":false,"crown":false,"antenna":false,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[92.565,110.16,-63.495,-45.9],"h":52.85,"glass":false,"crown":true,"antenna":true,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[92.565,99.832,-43.605,-35.955],"h":45.45,"glass":true,"crown":true,"antenna":true,"neon":null,"kind":"res","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[102.127,110.16,-43.605,-35.955],"h":39.55,"glass":true,"crown":false,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[92.565,110.16,-17.595,-6.12],"h":32.55,"glass":false,"crown":true,"antenna":false,"neon":"Violet Neon","kind":"res","shops":{"n":1,"s":0,"w":0,"e":0}},{"box":[92.565,99.067,-3.825,11.475],"h":34.85,"glass":true,"crown":false,"antenna":true,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[101.362,110.16,-3.825,11.475],"h":42.3,"glass":false,"crown":true,"antenna":true,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[92.565,110.16,35.955,42.84],"h":34.65,"glass":true,"crown":true,"antenna":true,"neon":"Cyan Neon","kind":"com","shops":{"n":1,"s":0,"w":0,"e":0}},{"box":[92.565,110.16,95.625,103.275],"h":19.35,"glass":true,"crown":false,"antenna":true,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[112.455,126.225,-103.275,-85.68],"h":18.2,"glass":true,"crown":false,"antenna":true,"neon":"Cyan Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[115.515,126.225,-83.385,-65.79],"h":58.75,"glass":true,"crown":true,"antenna":false,"neon":"Pink Neon","kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[112.455,126.225,-55.462,-45.9],"h":48.35,"glass":false,"crown":true,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[112.455,126.225,-43.605,-35.955],"h":51.9,"glass":true,"crown":true,"antenna":false,"neon":null,"kind":"res","shops":{"n":0,"s":1,"w":0,"e":0}},{"box":[112.455,126.225,-17.595,-6.12],"h":37.05,"glass":true,"crown":true,"antenna":true,"neon":"Pink Neon","kind":"res","shops":{"n":1,"s":0,"w":0,"e":0}},{"box":[112.455,126.225,-3.825,4.208],"h":36.05,"glass":true,"crown":false,"antenna":false,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[112.455,126.225,6.503,13.77],"h":44.65,"glass":true,"crown":false,"antenna":true,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[113.985,126.225,35.955,44.752],"h":23.35,"glass":false,"crown":false,"antenna":false,"neon":"Violet Neon","kind":"com","shops":{"n":1,"s":0,"w":0,"e":0}},{"box":[113.985,126.225,47.047,53.55],"h":20.75,"glass":true,"crown":false,"antenna":false,"neon":"Pink Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[113.985,126.225,55.845,69.615],"h":23.5,"glass":false,"crown":false,"antenna":false,"neon":null,"kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}},{"box":[118.575,126.225,75.735,93.33],"h":23.4,"glass":false,"crown":false,"antenna":false,"neon":"Cyan Neon","kind":"com","shops":{"n":0,"s":0,"w":1,"e":0}},{"box":[112.455,126.225,95.625,103.275],"h":15.35,"glass":false,"crown":false,"antenna":false,"neon":"Violet Neon","kind":"com","shops":{"n":0,"s":0,"w":0,"e":0}}],"anchors":[{"box":[-71.596,-60.886,-59.792,-49.082],"h":41.7,"bridge":"North","shops":{"n":1,"s":1,"w":0,"e":0},"gate":true},{"box":[-7.964,2.746,-68.728,-58.018],"h":43.85,"bridge":"North","shops":{"n":0,"s":0,"w":0,"e":1},"gate":true},{"box":[25.046,35.756,-40.599,-29.889],"h":44.0,"bridge":"East","shops":{"n":0,"s":1,"w":0,"e":0},"gate":true},{"box":[75.934,86.644,-29.781,-19.071],"h":44.0,"bridge":"East","shops":{"n":0,"s":0,"w":1,"e":1},"gate":true},{"box":[-97.767,-87.057,-22.537,-11.827],"h":41.5,"bridge":"West","shops":{"n":1,"s":0,"w":0,"e":0},"gate":true},{"box":[-52.173,-41.463,-35.603,-24.893],"h":37.25,"bridge":"West","shops":{"n":1,"s":0,"w":1,"e":1},"gate":true}]};
const VEH_DATA={"ship":{"s":0.0005691909464076161,"o":[-7.786420822143555,12.355188369750977,-0.026929855346679688],"min":[-26.437101364135742,-6.295492649078369,-18.677610397338867],"max":[2.6497058868408203,8.573222160339355,18.623748779296875],"g":{"Window":[101,384,0,-1.0,"<<assets/data_05.b64>>"],"HullMain":[6760,22332,0,0.0,"<<assets/data_06.b64>>"],"Hull":[3908,11274,0,-1.0,"<<assets/data_07.b64>>"],"Engine":[1550,3618,0,0.0,"<<assets/data_08.b64>>"],"Lights":[499,1344,0,-1.0,"<<assets/data_09.b64>>"],"GoldAccentsMain":[224,660,0,-1.0,"<<assets/data_10.b64>>"],"GoldAccents":[448,1248,0,0.0,"<<assets/data_11.b64>>"]}},"moto":{"s":7.736988491391657e-05,"o":[0.5330921411514282,2.608862340450287,1.8004525899887085],"min":[-2.002086877822876,0.07368332147598267,-0.7347264289855957],"max":[3.0682711601257324,2.9825031757354736,0.7347264289855957],"g":{"paint":[2978,8898,0,null,"<<assets/data_12.b64>>",1],"metal":[8164,18645,0,null,"<<assets/data_13.b64>>",1],"dark":[7274,23529,0,null,"<<assets/data_14.b64>>",1],"lamp":[194,396,0,null,"<<assets/data_15.b64>>",1]}},"shipTex":{"Window":{"map":"data:image/jpeg;base64,<<assets/file_04.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_05.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_06.jpg>>"},"HullMain":{"map":"data:image/jpeg;base64,<<assets/file_07.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_08.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_09.jpg>>"},"Hull":{"map":"data:image/jpeg;base64,<<assets/file_10.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_11.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_12.jpg>>"},"Engine":{"map":"data:image/jpeg;base64,<<assets/file_13.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_14.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_15.jpg>>"},"Lights":{"map":"data:image/jpeg;base64,<<assets/file_16.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_17.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_18.jpg>>","emi":"data:image/jpeg;base64,<<assets/file_19.jpg>>"},"GoldAccentsMain":{"map":"data:image/jpeg;base64,<<assets/file_20.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_21.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_22.jpg>>"},"GoldAccents":{"map":"data:image/jpeg;base64,<<assets/file_23.jpg>>","mr":"data:image/jpeg;base64,<<assets/file_24.jpg>>","nrm":"data:image/jpeg;base64,<<assets/file_25.jpg>>"}}};
// ---------- imported vehicle models (civilian spacecraft + motorcycle), decoded once and drawn instanced ----------
const VEH=(()=>{const D=VEH_DATA;let shipK=null,motoK=null;
 const geo=(M,g)=>{const[nv,ni,big,ub,b64,hasC]=g,bin=atob(b64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);const buf=u8.buffer;let o=0;const al=()=>{o+=(4-o%4)%4};
  const q=new Int16Array(buf,0,nv*3);o=nv*6;al();const n8=new Int8Array(buf,o,nv*3);o+=nv*3;al();
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){P[i]=q[i]*M.s+M.o[i%3];N[i]=n8[i]/127}
  const G=new T.BufferGeometry();G.setAttribute('position',new T.BufferAttribute(P,3));G.setAttribute('normal',new T.BufferAttribute(N,3));
  if(hasC){const c8=new Uint8Array(buf,o,nv*3);o+=nv*3;al();const C=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){const v=c8[i]/255;C[i]=v*v*(v*.3+.7)}G.setAttribute('color',new T.BufferAttribute(C,3))}
  else if(ub!==null){const u16=new Uint16Array(buf,o,nv*2);o+=nv*4;const U=new Float32Array(nv*2);for(let i=0;i<nv;i++){U[i*2]=u16[i*2]/65535*8;U[i*2+1]=u16[i*2+1]/65535*8+ub}G.setAttribute('uv',new T.BufferAttribute(U,2))}
  G.setIndex(new T.BufferAttribute(big?new Uint32Array(buf,o,ni):new Uint16Array(buf,o,ni),1));G.computeBoundingSphere();return G};
 const tex=(src,srgb)=>{const im=new Image();const t=new T.Texture(im);im.onload=()=>{t.needsUpdate=true};im.src=src;t.flipY=false;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(srgb)t.encoding=T.sRGBEncoding;return t};
 // ship: nose +X, landing gear at y=-6.3 -> scaled so the hull is ~5.2 m long (a little bigger than a car)
 const SHIP_S=.18,MOTO_S=.41;
 const ship=()=>{if(shipK)return shipK;const env=GFX.env&&GFX.env();shipK={};for(const k in D.ship.g){const t=D.shipTex[k]||{};
   const m=new T.MeshStandardMaterial({map:t.map?tex(t.map,1):null,roughnessMap:t.mr?tex(t.mr):null,metalnessMap:t.mr?tex(t.mr):null,normalMap:t.nrm?tex(t.nrm):null,roughness:1,metalness:k==='Window'?.2:.85,envMap:env||null,envMapIntensity:.9});
   if(k==='Window'){m.color.setHex(0x7fa8d8);m.roughness=.08;m.metalness=.1;m.map=null;m.roughnessMap=m.metalnessMap=null;m.emissive.setHex(0x0a1828)}
   if(k==='HullMain'||k==='Hull'){m.color.setHex(0xb8bcc8);m.metalness=.75}
   if(k==='Lights'){m.emissiveMap=t.emi?tex(t.emi,1):null;m.emissive.setHex(0xffffff);m.emissiveIntensity=2.4}
   const G=geo(D.ship,D.ship.g[k]);G.translate(11.9,6.3,0);shipK[k]={g:G,m}}return shipK};
 const moto=()=>{if(motoK)return motoK;const env=GFX.env&&GFX.env();motoK={};const g=D.moto.g;const geo_=geo;const geoM=(M,x)=>{const G=geo_(M,x);G.translate(-.53,-.07,0);return G};
  const base={vertexColors:true,envMap:env||null};
  motoK.metal={g:geoM(D.moto,g.metal),m:new T.MeshStandardMaterial({...base,roughness:.28,metalness:.9,envMapIntensity:1.1})};
  motoK.dark={g:geoM(D.moto,g.dark),m:new T.MeshStandardMaterial({...base,roughness:.62,metalness:.25,envMapIntensity:.6})};
  motoK.lamp={g:geoM(D.moto,g.lamp),m:new T.MeshStandardMaterial({vertexColors:true,emissive:0xfff0c8,emissiveIntensity:1.8,color:0x222222})};
  const pg=geoM(D.moto,g.paint);pg.deleteAttribute('color');
  motoK.black={g:pg,m:new T.MeshPhysicalMaterial({color:0x0b0b0e,roughness:.22,metalness:.35,clearcoat:1,clearcoatRoughness:.08,envMap:env||null,envMapIntensity:1.2})};
  motoK.red={g:pg,m:new T.MeshPhysicalMaterial({color:0xa00c10,roughness:.25,metalness:.3,clearcoat:1,clearcoatRoughness:.08,envMap:env||null,envMapIntensity:1.2})};
  return motoK};
 const _m=new T.Matrix4(),_p=new T.Vector3(),_q=new T.Quaternion(),_s=new T.Vector3(),_e=new T.Euler();
 const mtx=(x,y,z,ry,s)=>_m.compose(_p.set(x,y,z),_q.setFromEuler(_e.set(0,ry,0)),_s.set(s,s,s)).clone();
 const inst=(K,parts,list)=>{const grp=new T.Group();for(const k of parts){const L=list.filter(e=>e.parts.includes(k));if(!L.length)continue;
   const im=new T.InstancedMesh(K[k].g,K[k].m,L.length);L.forEach((e,i)=>im.setMatrixAt(i,e.m));im.castShadow=im.receiveShadow=true;im.frustumCulled=false;grp.add(im)}return grp};
 // LED tints for the custom-lit ships (the stock lights are amber)
 const TINT={orange:0xff6a10,blue:0x2a7dff,pink:0xff3cb4};
 const ships=list=>{const K=ship(),L=[];const tints={};
  for(const s of list){const parts=Object.keys(K).filter(k=>k!=='Lights');L.push({m:mtx(s.x,s.y,s.z,s.ry,SHIP_S),parts:parts.concat(s.tint?['L_'+s.tint]:['Lights'])})}
  for(const t in TINT){const m=K.Lights.m.clone();m.emissive.setHex(TINT[t]);m.color.setHex(TINT[t]);m.emissiveIntensity=3.2;K['L_'+t]={g:K.Lights.g,m}}
  return inst(K,Object.keys(K),L)};
 const motos=list=>{const K=moto(),L=list.map(b=>({m:mtx(b.x,b.y,b.z,b.ry,MOTO_S),parts:['metal','dark','lamp',b.red?'red':'black']}));return inst(K,['metal','dark','lamp','black','red'],L)};
 return{ships,motos,SHIP_S,MOTO_S,TINT,ship,moto}})();
const NCC_KIT={
spire:{s:0.003321177,o:[86.971,108.67,85.365],b:{metal:[331,864,0,'<<assets/data_16.b64>>'],chrome:[15270,58896,0,'<<assets/data_17.b64>>'],glow:[9751,43032,0,'<<assets/data_18.b64>>'],glass:[48,72,0,'1JdXvfWDl5tXvW2Al5tXvfWD1JdXvW2A1JcugPWDl5sugG2Al5sugPWD1JcugG2Al5tXvfWD1JdXvW2Al5tXvW2A1JdXvfWDl5sugPWD1JcugG2Al5sugG2A1JcugPWDl5tXvfWD1JcugPWD1JdXvfWDl5sugPWDl5tXvW2A1JcugG2A1JdXvW2Al5sugG2A1JdXvcS2l5tXvT2zl5tXvcS21JdXvT2z1JcugMS2l5sugD2zl5sugMS21JcugD2zl5tXvcS21JdXvT2zl5tXvT2z1JdXvcS2l5sugMS21JcugD2zl5sugD2z1JcugMS2l5tXvcS21JcugMS21JdXvcS2l5sugMS2l5tXvT2z1JcugD2z1JdXvT2zl5sugD2zAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCUpnCBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsA']}},
highway_seg:{s:0.0003051851,o:[4.445,7.8,0],b:{metal:[24,36,0,'tYAqnP9/gQ0qnAGAgQ0qnP9/tYAqnAGAtYBlm/9/gQ1lmwGAgQ1lm/9/tYBlmwGAgQ0qnP9/tYAqnAGAgQ0qnAGAtYAqnP9/gQ1lm/9/tYBlmwGAgQ1lmwGAtYBlm/9/gQ0qnP9/tYBlm/9/tYAqnP9/gQ1lm/9/gQ0qnAGAtYBlmwGAtYAqnAGAgQ1lmwGAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEACgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMCgoMBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMA'],roof:[720,2880,0,'<<assets/data_19.b64>>'],chrome:[312,1188,0,'<<assets/data_20.b64>>'],glow:[264,396,0,'<<assets/data_21.b64>>']}},
highway_pylon:{s:0.0002578814,o:[3.7,8.45,6.85],b:{roof:[432,1728,0,'<<assets/data_22.b64>>'],chrome:[288,1152,0,'<<assets/data_23.b64>>'],glow:[120,180,0,'<<assets/data_24.b64>>']}},
ped_bridge:{s:0.0001525925,o:[1.5,3.69,0],b:{metal:[144,576,0,'<<assets/data_25.b64>>'],chrome:[1296,5184,0,'<<assets/data_26.b64>>'],glass:[48,72,0,'W4Szvf9/5IWzvQGA5IWzvf9/W4SzvQGAW4QZpP9/5IUZpAGA5IUZpP9/W4QZpAGA5IWzvf9/W4SzvQGA5IWzvQGAW4Szvf9/5IUZpP9/W4QZpAGA5IUZpAGAW4QZpP9/5IWzvf9/W4QZpP9/W4Szvf9/5IUZpP9/5IWzvQGAW4QZpAGAW4SzvQGA5IUZpAGAUC2zvf9/2S6zvQGA2S6zvf9/UC2zvQGAUC0ZpP9/2S4ZpAGA2S4ZpP9/UC0ZpAGA2S6zvf9/UC2zvQGA2S6zvQGAUC2zvf9/2S4ZpP9/UC0ZpAGA2S4ZpAGAUC0ZpP9/2S6zvf9/UC0ZpP9/UC2zvf9/2S4ZpP9/2S6zvQGAUC0ZpAGAUC2zvQGA2S4ZpAGAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsA'],glow:[96,144,0,'fIRpwf9/xIVpwQGAxIVpwf9/fIRpwQGAfIQhwP9/xIUhwAGAxIUhwP9/fIQhwAGAxIVpwf9/fIRpwQGAxIVpwQGAfIRpwf9/xIUhwP9/fIQhwAGAxIUhwAGAfIQhwP9/xIVpwf9/fIQhwP9/fIRpwf9/xIUhwP9/xIVpwQGAfIQhwAGAfIRpwQGAxIUhwAGAcC1pwf9/uC5pwQGAuC5pwf9/cC1pwQGAcC0hwP9/uC4hwAGAuC4hwP9/cC0hwAGAuC5pwf9/cC1pwQGAuC5pwQGAcC1pwf9/uC4hwP9/cC0hwAGAuC4hwAGAcC0hwP9/uC5pwf9/cC0hwP9/cC1pwf9/uC4hwP9/uC5pwQGAcC0hwAGAcC1pwQGAuC4hwAGA95gNgv9/PpoNggGAPpoNgv9/95gNggGA95gBgP9/PpoBgAGAPpoBgP9/95gBgAGAPpoNgv9/95gNggGAPpoNggGA95gNgv9/PpoBgP9/95gBgAGAPpoBgAGA95gBgP9/PpoNgv9/95gBgP9/95gNgv9/PpoBgP9/PpoNggGA95gBgAGA95gNggGAPpoBgAGA9hgNgv9/PRoNggGAPRoNgv9/9hgNggGA9hgBgP9/PRoBgAGAPRoBgP9/9hgBgAGAPRoNgv9/9hgNggGAPRoNggGA9hgNgv9/PRoBgP9/9hgBgAGAPRoBgAGA9hgBgP9/PRoNgv9/9hgBgP9/9hgNgv9/PRoBgP9/PRoNggGA9hgBgAGA9hgNggGAPRoBgAGAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPehUPeBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsANAAyADAANAA2ADIANQAzADEANQA3ADMAPAA6ADgAPAA+ADoAPQA7ADkAPQA/ADsARABCAEAARABGAEIARQBDAEEARQBHAEMATABKAEgATABOAEoATQBLAEkATQBPAEsAVABSAFAAVABWAFIAVQBTAFEAVQBXAFMAXABaAFgAXABeAFoAXQBbAFkAXQBfAFsA']}},
skybridge:{s:0.0001525925,o:[1.1382,3.3,0],b:{metal:[144,576,0,'<<assets/data_27.b64>>'],chrome:[736,3312,0,'<<assets/data_28.b64>>'],glass:[48,72,0,'94ZmJv9/A4lmJgGAA4lmJv9/94ZmJgGA94aGq/9/A4mGqwGAA4mGq/9/94aGqwGAA4lmJv9/94ZmJgGAA4lmJgGA94ZmJv9/A4mGq/9/94aGqwGAA4mGqwGA94aGq/9/A4lmJv9/94aGq/9/94ZmJv9/A4mGq/9/A4lmJgGA94aGqwGA94ZmJgGAA4mGqwGAuDxmJv9/xD5mJgGAxD5mJv9/uDxmJgGAuDyGq/9/xD6GqwGAxD6Gq/9/uDyGqwGAxD5mJv9/uDxmJgGAxD5mJgGAuDxmJv9/xD6Gq/9/uDyGqwGAxD6GqwGAuDyGq/9/xD5mJv9/uDyGq/9/uDxmJv9/xD6Gq/9/xD5mJgGAuDyGqwGAuDxmJgGAxD6GqwGAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsA'],glow:[72,108,0,'OoLunP9/goPunAGAgoPunP9/OoLunAGAOoJlm/9/goNlmwGAgoNlm/9/OoJlmwGAgoPunP9/OoLunAGAgoPunAGAOoLunP9/goNlm/9/OoJlmwGAgoNlmwGAOoJlm/9/goPunP9/OoJlm/9/OoLunP9/goNlm/9/goPunAGAOoJlmwGAOoLunAGAgoNlmwGAOULunP9/gEPunAGAgEPunP9/OULunAGAOUJlm/9/gENlmwGAgENlm/9/OUJlmwGAgEPunP9/OULunAGAgEPunAGAOULunP9/gENlm/9/OUJlmwGAgENlmwGAOUJlm/9/gEPunP9/OUJlm/9/OULunP9/gENlm/9/gEPunAGAOUJlmwGAOULunAGAgENlmwGABt+oJv9/tOaoJgGAtOaoJv9/Bt+oJgGABt8eJf9/tOYeJQGAtOYeJf9/Bt8eJQGAtOaoJv9/Bt+oJgGAtOaoJgGABt+oJv9/tOYeJf9/Bt8eJQGAtOYeJQGABt8eJf9/tOaoJv9/Bt8eJf9/Bt+oJv9/tOYeJf9/tOaoJgGABt8eJQGABt+oJgGAtOYeJQGAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsANAAyADAANAA2ADIANQAzADEANQA3ADMAPAA6ADgAPAA+ADoAPQA7ADkAPQA/ADsARABCAEAARABGAEIARQBDAEEARQBHAEMA']}},
skyport:{s:0.0009491257,o:[0.1,26.9,12.1],b:{chrome:[1631,6480,0,'<<assets/data_29.b64>>'],metal:[24,36,0,'H4R0kUgYD3t0kR+ED3t0kUgYH4R0kR+EH4RKkUgYD3tKkR+ED3tKkUgYH4RKkR+ED3t0kUgYH4R0kR+ED3t0kR+EH4R0kUgYD3tKkUgYH4RKkR+ED3tKkR+EH4RKkUgYD3t0kUgYH4RKkUgYH4R0kUgYD3tKkUgYD3t0kR+EH4RKkR+EH4R0kR+ED3tKkR+EAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbFhcbBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMA'],glow:[2313,7908,0,'<<assets/data_30.b64>>'],glass:[240,720,0,'<<assets/data_31.b64>>']}},





street_lamp:{s:0.0001168859,o:[3.53,3.83,3.53],b:{roof:[144,576,0,'<<assets/data_32.b64>>'],chrome:[282,1140,0,'<<assets/data_33.b64>>'],glow:[48,72,0,'WoV7eUPktY57eXq1tY57eUPkWoV7eXq1WoV6eEPktY56eHq1tY56eEPkWoV6eHq1tY57eUPkWoV7eXq1tY57eXq1WoV7eUPktY56eEPkWoV6eHq1tY56eHq1WoV6eEPktY57eUPkWoV6eEPkWoV7eUPktY56eEPktY57eXq1WoV6eHq1WoV7eXq1tY56eHq1Momh8eCO3Yqh8TSN3Yqh8eCOMomh8TSNMokpvOCO3YopvDSN3YopvOCOMokpvDSN3Yqh8eCOMomh8TSN3Yqh8TSNMomh8eCO3YopvOCOMokpvDSN3YopvDSNMokpvOCO3Yqh8eCOMokpvOCOMomh8eCO3YopvOCO3Yqh8TSNMokpvDSNMomh8TSN3YopvDSNAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcje3ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia7BAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsA']}},
barrier:{s:4.882962e-05,o:[0,1.6,1.17],b:{roof:[288,1152,0,'<<assets/data_34.b64>>'],glow:[168,252,0,'<<assets/data_35.b64>>']}},
market_stall:{s:5.493332e-05,o:[0,1.8,0.41181],b:{chrome:[644,2340,0,'<<assets/data_36.b64>>'],glow:[72,108,0,'VpWxxeQ6qmqxxaA2qmqxxeQ6VpWxxaA2VpVtweQ6qmptwaA2qmptweQ6VpVtwaA2qmqxxeQ6VpWxxaA2qmqxxaA2VpWxxeQ6qmptweQ6VpVtwaA2qmptwaA2VpVtweQ6qmqxxeQ6VpVtweQ6VpWxxeQ6qmptweQ6qmqxxaA2VpVtwaA2VpWxxaA2qmptwaA2AYA+OUVW/38+ObdS/38+OUVWAYA+ObdSAYCwNUVW/3+wNbdS/3+wNUVWAYCwNbdS/38+OUVWAYA+ObdS/38+ObdSAYA+OUVW/3+wNUVWAYCwNbdS/3+wNbdSAYCwNUVW/38+OUVWAYCwNUVWAYA+OUVW/3+wNUVW/38+ObdSAYCwNbdSAYA+ObdS/3+wNbdSyLE4blwyOE44bvAwOE44blwyyLE4bvAwyLHGUVwyOE7GUfAwOE7GUVwyyLHGUfAwOE44blwyyLE4bvAwOE44bvAwyLE4blwyOE7GUVwyyLHGUfAwOE7GUfAwyLHGUVwyOE44blwyyLHGUVwyyLE4blwyOE7GUVwyOE44bvAwyLHGUfAwyLE4bvAwOE7GUfAwAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFyvqFy3ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia7HcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsANAAyADAANAA2ADIANQAzADEANQA3ADMAPAA6ADgAPAA+ADoAPQA7ADkAPQA/ADsARABCAEAARABGAEIARQBDAEEARQBHAEMA'],metal:[864,3456,0,'<<assets/data_37.b64>>']}},
tree:{s:0.0001216635,o:[1.265,3.9865,1.7456],b:{roof:[302,1296,0,'<<assets/data_38.b64>>'],glow:[655,2784,0,'<<assets/data_39.b64>>'],metal:[936,4536,0,'<<assets/data_40.b64>>']}},
rock_0:{s:3.453241e-05,o:[0.025911,1.1315,0.0543],b:{roof:[740,4104,0,'<<assets/data_41.b64>>']}},
rock_1:{s:3.401117e-05,o:[0.071258,1.1144,-0.080676],b:{roof:[740,4104,0,'<<assets/data_42.b64>>']}},
lift:{s:5.798517e-05,o:[0,1.9,0],b:{chrome:[743,2880,0,'<<assets/data_43.b64>>'],glow:[606,2448,0,'<<assets/data_44.b64>>']}},
launch_pad:{s:6.202994e-05,o:[0,2.0325,0],b:{chrome:[47,144,0,'BTXlkv9//3/lkgU1/3/lkvvKBTXlkgGA+8rlkgGAAYDlkvvKAYDlkgU1+8rlkv9/BTXlkv9/BTVzif9//39ziQU1/39zifvKBTVziQGA+8pziQGAAYBzifvKAYBziQU1+8pzif9/BTVzif9/BTUBgP9//38BgAU1/38BgPvKBTUBgAGA+8oBgAGAAYABgPvKAYABgAU1+8oBgP9/BTUBgP9/AADlkgAABTXlkv9//3/lkgU1/3/lkvvKBTXlkgGA+8rlkgGAAYDlkvvKAYDlkgU1+8rlkv9/BTXlkv9/AAABgAAABTUBgP9//38BgAU1/38BgPvKBTUBgAGA+8oBgAGAAYABgPvKAYABgAU1+8oBgP9/BTUBgP9/AAAxAHV1ADF1AM8xAIvPAIuLAM+LADHPAHUxAHUxAHV1ADF1AM8xAIvPAIuLAM+LADHPAHUxAHUxAHV1ADF1AM8xAIvPAIuLAM+LADHPAHUxAHUAfwAAfwAAfwAAfwAAfwAAfwAAfwAAfwAAfwAAfwAAgQAAgQAAgQAAgQAAgQAAgQAAgQAAgQAAgQAAgQAAAAAODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIODxIAAAAJAAEAAAAJAAoAAQAKAAIAAQAKAAsAAgALAAMAAgALAAwAAwAMAAQAAwAMAA0ABAANAAUABAANAA4ABQAOAAYABQAOAA8ABgAPAAcABgAPABAABwAQAAgABwAQABEACAASAAoACQASABMACgATAAsACgATABQACwAUAAwACwAUABUADAAVAA0ADAAVABYADQAWAA4ADQAWABcADgAXAA8ADgAXABgADwAYABAADwAYABkAEAAZABEAEAAZABoAEQAcAB0AGwAdAB4AGwAeAB8AGwAfACAAGwAgACEAGwAhACIAGwAiACMAGwAjACQAGwAnACYAJQAoACcAJQApACgAJQAqACkAJQArACoAJQAsACsAJQAtACwAJQAuAC0AJQA='],glow:[542,2448,0,'<<assets/data_45.b64>>']}},
bench:{s:2.899258e-05,o:[0,0.95,0.65251],b:{chrome:[576,2304,0,'<<assets/data_46.b64>>'],glow:[24,36,0,'voZEuXHKQnlEuWbGQnlEuXHKvoZEuWbGvoY5tXHKQnk5tWbGQnk5tXHKvoY5tWbGQnlEuXHKvoZEuWbGQnlEuWbGvoZEuXHKQnk5tXHKvoY5tWbGQnk5tWbGvoY5tXHKQnlEuXHKvoY5tXHKvoZEuXHKQnk5tXHKQnlEuWbGvoY5tWbGvoZEuWbGQnk5tWbGAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeHcjeBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMA']}},
vending:{s:3.204443e-05,o:[0.55,1.05,0.625],b:{chrome:[288,1152,0,'<<assets/data_47.b64>>'],glow:[48,72,0,'JYm2bXPpk+S2bQPnk+S2bXPpJYm2bQPnJYk9z3Ppk+Q9zwPnk+Q9z3PpJYk9zwPnk+S2bXPpJYm2bQPnk+S2bQPnJYm2bXPpk+Q9z3PpJYk9zwPnk+Q9zwPnJYk9z3Ppk+S2bXPpJYk9z3PpJYm2bXPpk+Q9z3Ppk+S2bQPnJYk9zwPnJYm2bQPnk+Q9zwPnZ+YkSavqB/UkScvlB/UkSavqZ+YkScvlZ+YxDKvqB/UxDMvlB/UxDKvqZ+YxDMvlB/UkSavqZ+YkScvlB/UkScvlZ+YkSavqB/UxDKvqZ+YxDMvlB/UxDMvlZ+YxDKvqB/UkSavqZ+YxDKvqZ+YkSavqB/UxDKvqB/UkScvlZ+YxDMvlZ+YkScvlB/UxDMvlAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAAAB/AACBAAB/AACBAAB/AACBAAB/AACBfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAH8AAIEAAH8AAIEAAH8AAIEAAH8AAIEAL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36dL36d3ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia73ia7BAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMAHAAaABgAHAAeABoAHQAbABkAHQAfABsAJAAiACAAJAAmACIAJQAjACEAJQAnACMALAAqACgALAAuACoALQArACkALQAvACsA']}},
crown_a:{s:0.0002693258,o:[3.625,8.825,3.625],b:{chrome:[1055,4464,0,'<<assets/data_48.b64>>'],glow:[149,468,0,'<<assets/data_49.b64>>']}},
crown_b:{s:0.0002069379,o:[1.5807,5.6193,-0.10095],b:{chrome:[335,1296,0,'<<assets/data_50.b64>>'],glass:[24,36,0,'OI0B5C5LGzfDMy21GzcB5C5LOI3DMy21OI0BgAIWGzfDzwGAGzcBgAIWOI3DzwGAGzcB5C5LOI3DMy21GzfDMy21OI0B5C5LGzcBgAIWOI3DzwGAGzfDzwGAOI0BgAIWGzcB5C5LOI0BgAIWOI0B5C5LGzcBgAIWGzfDMy21OI3DzwGAOI3DMy21GzfDzwGAAMRwADyQAMRwADyQAMRwADyQAMRwADyQfwAAgQAAfwAAgQAAfwAAgQAAfwAAgQAAAHA8AJDEAHA8AJDEAHA8AJDEAHA8AJDEXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCXJnCBAACAAAABAAGAAIABQADAAEABQAHAAMADAAKAAgADAAOAAoADQALAAkADQAPAAsAFAASABAAFAAWABIAFQATABEAFQAXABMA'],glow:[420,2088,0,'<<assets/data_51.b64>>']}},
};
const CITY=(()=>{
 let sd=90210;const cr=()=>(sd=(sd*16807)%2147483647)/2147483647,pick=a=>a[cr()*a.length|0],rr=(a,b)=>a+(b-a)*cr();
 const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]};
 const ctex=(c,rep)=>{const t=new T.CanvasTexture(c);if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t};
 const PAL={mag:'#ff2bd6',vio:'#8a3bff',blu:'#2f8bff',cya:'#21e6ff',tea:'#14b8a6',ora:'#ff9a3c',red:'#ff3355',warm:'#ffc069'};
 const HEX=Object.fromEntries(Object.entries(PAL).map(([k,v])=>[k,new T.Color(v)]));
 const S0=S,PRE_CITY=new Set(S.children);

 // ---------- textures ----------
 // facade atlases: one tile = 16 m wide x 25.6 m tall (8 window bays x 8 floors); emissive canvas holds only the lit glass
 function facade(style){const N=512,[c,g]=cvs(N,N),[e,h]=cvs(N,N);h.fillStyle='#000';h.fillRect(0,0,N,N);
  const cw=N/8,ch=N/8;
  if(style==='res'){g.fillStyle='#262434';g.fillRect(0,0,N,N);
   for(let i=0;i<300;i++){g.fillStyle=`rgba(${cr()*40|0},${cr()*40|0},${60+cr()*30|0},.25)`;g.fillRect(cr()*N,cr()*N,cr()*40,cr()*6)}
   for(let y=0;y<8;y++){g.fillStyle='#1a1826';g.fillRect(0,y*ch+ch-7,N,7);
    for(let x=0;x<8;x++){const wx=x*cw+12,wy=y*ch+12,ww=cw-24,wh=ch-30,lit=cr();
     g.fillStyle='#0b0b14';g.fillRect(wx-3,wy-3,ww+6,wh+6);
     const col=lit<.42?pick(['#ffb54a','#ffcf7a','#ff9d5c']):lit<.52?pick([PAL.mag,PAL.cya,'#9b7bff']):lit<.6?'#7fa6ff':null;
     g.fillStyle=col||'#111827';g.fillRect(wx,wy,ww,wh);
     if(col){h.fillStyle=col;h.globalAlpha=.75+cr()*.25;h.fillRect(wx,wy,ww,wh);h.globalAlpha=1;
      if(cr()<.5){h.fillStyle='rgba(0,0,0,.55)';for(let b=0;b<wh;b+=5)h.fillRect(wx,wy+b,ww,2)}       // blinds
      if(cr()<.3){h.fillStyle='rgba(0,0,0,.8)';h.fillRect(wx+ww*.5,wy+wh*.35,ww*.35,wh*.65)}}           // silhouette / furniture
     g.fillStyle='#3a3848';g.fillRect(wx+ww/2-1,wy,2,wh);
     if(cr()<.22){g.fillStyle='#4a4a58';g.fillRect(wx+ww*.15,wy+wh+4,ww*.7,11);g.fillStyle='#2a2a34';for(let k=0;k<5;k++)g.fillRect(wx+ww*.2+k*ww*.13,wy+wh+6,2,7)} // AC unit
     if(y%2===0&&cr()<.35){g.fillStyle='#5a5870';g.fillRect(wx-6,wy+wh+2,ww+12,4);for(let k=0;k<6;k++)g.fillRect(wx-6+k*(ww+12)/5,wy+wh-12,2,14)}}}}  // balcony rail
  else if(style==='com'){const gr=g.createLinearGradient(0,0,N,N);gr.addColorStop(0,'#0c1430');gr.addColorStop(1,'#141034');g.fillStyle=gr;g.fillRect(0,0,N,N);
   for(let y=0;y<8;y++){const band=cr();for(let x=0;x<8;x++){const lit=cr(),wx=x*cw+2,wy=y*ch+4,ww=cw-4,wh=ch-10;
     const col=band<.25?(lit<.85?'#9fdcff':null):band<.35?(lit<.8?'#c8a2ff':null):lit<.3?pick(['#bfe8ff','#7fd1ff','#e6f4ff']):lit<.36?PAL.mag:null;
     g.fillStyle=col?col:'#101a3a';g.globalAlpha=col?.9:1;g.fillRect(wx,wy,ww,wh);g.globalAlpha=1;
     if(col){h.fillStyle=col;h.globalAlpha=.55+cr()*.3;h.fillRect(wx,wy,ww,wh);h.globalAlpha=1}
     g.fillStyle='rgba(120,160,255,.18)';g.fillRect(wx,wy,ww,3)}
    g.fillStyle='#05070f';g.fillRect(0,y*ch+ch-6,N,6)}
   for(let x=0;x<=8;x++){g.fillStyle='#04060c';g.fillRect(x*cw-2,0,4,N)}}
  else{g.fillStyle='#2a2220';g.fillRect(0,0,N,N);                                    // industrial: stained panels, sparse sodium light
   for(let y=0;y<N;y+=16)for(let x=0;x<N;x+=32){const v=34+cr()*14|0;g.fillStyle=`rgb(${v+6},${v},${v-4})`;g.fillRect(x+(y/16%2)*16,y,30,14)}
   for(let i=0;i<40;i++){g.fillStyle=`rgba(10,8,6,${.2+cr()*.3})`;g.fillRect(cr()*N,cr()*N,4+cr()*8,30+cr()*120)}
   for(let y=0;y<8;y+=2)for(let x=0;x<8;x++){if(cr()<.45)continue;const wx=x*cw+8,wy=y*ch+16,ww=cw-16,wh=ch*.7,lit=cr()<.4;
    g.fillStyle='#14100c';g.fillRect(wx,wy,ww,wh);g.fillStyle=lit?'#ff9a3c':'#1c1812';g.fillRect(wx+3,wy+3,ww-6,wh-6);
    g.fillStyle='#0c0a08';for(let k=1;k<4;k++)g.fillRect(wx+3,wy+k*wh/4,ww-6,2);
    if(lit){h.fillStyle='#ff8a2a';h.globalAlpha=.7;h.fillRect(wx+3,wy+3,ww-6,wh-6);h.globalAlpha=1}}}
  // weathering: grime streaks under sills, rust bleeding from fixings, water stains, darkened base and crevice grime
  {const W=N;const gg=g.createLinearGradient(0,W*.55,0,W);gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(1,'rgba(6,5,8,.45)');g.fillStyle=gg;g.fillRect(0,0,W,W);
   for(let i=0;i<90;i++){const x=cr()*W,y=(cr()*8|0)*(W/8)+W/8-6,L=20+cr()*110,w=1+cr()*3.5,lg=g.createLinearGradient(0,y,0,y+L);lg.addColorStop(0,'rgba(8,7,10,.38)');lg.addColorStop(1,'rgba(8,7,10,0)');g.fillStyle=lg;g.fillRect(x,y,w,L)}
   const nr=style==='ind'?60:style==='res'?28:10;for(let i=0;i<nr;i++){const x=cr()*W,y=cr()*W,L=30+cr()*140,w=1.5+cr()*5,lg=g.createLinearGradient(0,y,0,y+L);lg.addColorStop(0,'rgba(140,62,22,.55)');lg.addColorStop(.4,'rgba(110,50,20,.3)');lg.addColorStop(1,'rgba(80,40,20,0)');g.fillStyle=lg;g.fillRect(x,y,w,L);
    g.fillStyle='rgba(150,70,25,.6)';g.beginPath();g.arc(x+w/2,y,w*.9,0,6.28);g.fill()}
   for(let i=0;i<14;i++){const x=cr()*W,y=cr()*W,r=20+cr()*60,rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(20,24,30,.22)');rg.addColorStop(1,'rgba(20,24,30,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,r*2,r*2)}}
  return{map:ctex(c,1),emi:ctex(e,1)}}
 // shopfronts: 4 rows, each 12 m x 4.5 m
 function shopfronts(){const W=1024,RH=384,[c,g]=cvs(W,RH*4),[e,h]=cvs(W,RH*4);h.fillStyle='#000';h.fillRect(0,0,W,RH*4);
  const cols=[[PAL.mag,'#ffd1f3'],[PAL.cya,'#d6fbff'],[PAL.ora,'#ffe2c4'],[PAL.vio,'#e7dbff']];
  for(let r=0;r<4;r++){const y0=r*RH,[a,b]=cols[r];g.fillStyle='#14121c';g.fillRect(0,y0,W,RH);
   for(let s=0;s<3;s++){const x0=s*W/3+14,sw=W/3-28;
    g.fillStyle='#0a0a10';g.fillRect(x0,y0+60,sw,RH-70);
    const gl=g.createLinearGradient(0,y0+70,0,y0+RH);gl.addColorStop(0,b);gl.addColorStop(1,a);
    g.fillStyle=gl;g.globalAlpha=.85;g.fillRect(x0+8,y0+78,sw*.62,RH-96);g.globalAlpha=1;
    h.fillStyle=gl;h.globalAlpha=.8;h.fillRect(x0+8,y0+78,sw*.62,RH-96);h.globalAlpha=1;
    g.fillStyle='#000';for(let k=0;k<4;k++){g.fillRect(x0+20+k*sw*.15,y0+RH-120+cr()*30,18,90)}           // shelves / people
    g.fillStyle='#1a1a24';g.fillRect(x0+sw*.68,y0+90,sw*.28,RH-100);g.fillStyle=a;g.fillRect(x0+sw*.68+6,y0+96,sw*.28-12,RH-112);
    h.fillStyle=a;h.globalAlpha=.6;h.fillRect(x0+sw*.68+6,y0+96,sw*.28-12,RH-112);h.globalAlpha=1;          // door
    g.fillStyle=a;g.fillRect(x0,y0+56,sw,6);h.fillStyle=a;h.fillRect(x0,y0+56,sw,6)}
   g.fillStyle='#262434';g.fillRect(0,y0,W,50)}
  return{map:ctex(c,1),emi:ctex(e,1)}}
 // striped awning fabric: 4 colourways stacked
 function awningTex(){const[c,g]=cvs(256,256);const sets=[[PAL.mag,'#2a0a2a'],[PAL.cya,'#06222a'],[PAL.ora,'#2a1404'],['#e8e8f0',PAL.vio]];
  sets.forEach(([a,b],i)=>{for(let x=0;x<256;x+=32){g.fillStyle=a;g.fillRect(x,i*64,16,64);g.fillStyle=b;g.fillRect(x+16,i*64,16,64)}g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,i*64+54,256,10)});
  return ctex(c,1)}
 // sign atlas: neon text signs, vertical blade signs, billboards, street holo signs
 const SA=(()=>{const W=2048,[c,g]=cvs(W,W),R={};
  const neon=(txt,x,y,w,h,col,font,vert)=>{g.save();g.fillStyle='rgba(6,4,14,.92)';g.strokeStyle=col;g.lineWidth=5;g.shadowColor=col;g.shadowBlur=18;
   const pad=10;g.beginPath();g.roundRect?g.roundRect(x+pad,y+pad,w-2*pad,h-2*pad,10):g.rect(x+pad,y+pad,w-2*pad,h-2*pad);g.fill();g.stroke();
   g.fillStyle='#fff';g.shadowBlur=26;g.textAlign='center';g.textBaseline='middle';
   if(vert){const n=txt.length,fs=Math.min(w*.62,(h-40)/n*.86);g.font=`900 ${fs}px Impact, "Arial Black", sans-serif`;for(let i=0;i<n;i++){g.fillStyle=col;g.fillText(txt[i],x+w/2,y+28+(i+.5)*(h-56)/n);g.fillStyle='rgba(255,255,255,.75)';g.fillText(txt[i],x+w/2,y+28+(i+.5)*(h-56)/n)}}
   else{let fs=h*.52;g.font=`900 ${fs}px Impact, "Arial Black", sans-serif`;while(g.measureText(txt).width>w-50&&fs>10){fs-=2;g.font=`900 ${fs}px Impact, "Arial Black", sans-serif`}
    g.fillStyle=col;g.fillText(txt,x+w/2,y+h/2+2);g.fillStyle='rgba(255,255,255,.8)';g.lineWidth=1;g.fillText(txt,x+w/2,y+h/2+2)}
   g.restore()};
  const H=['NOODLES','HOTEL','SYNTH','RAMEN','CYBER BAR','24/7','CLINIC','ARCADE','SUSHI','PAWN','TECH','CAFE','OPEN','CLUB','MOTEL','DATA','VR DEN','PHARMA','LOUNGE','GYM','DINER','FIX-IT','BIO','KARAOKE'];
  const HC=[PAL.mag,PAL.cya,PAL.ora,PAL.vio,PAL.blu,PAL.tea,PAL.red,PAL.mag];
  H.forEach((t,i)=>{const x=(i%4)*512,y=(i/4|0)*128;neon(t,x,y,512,128,HC[i%HC.length]);R['h'+i]=[x,y,512,128]});
  const V=['HOTEL','RAMEN','BAR','NEON','CLUB','BYTES','LIVE','SUSHI','OPEN','SYNC','CAFE','BOTS'];
  V.forEach((t,i)=>{const x=i*128,y=768;neon(t,x,y,128,512,HC[(i+3)%HC.length],0,1);R['v'+i]=[x,y,128,512]});
  // billboards: original abstract art + slogans
  const BB=[['AURORA SYSTEMS','THINK FASTER',PAL.cya,PAL.vio],['VOLT COLA','CHARGE UP',PAL.mag,PAL.ora],['DREAM//OS','SLEEP IS OPTIONAL',PAL.vio,PAL.cya],['NEO-KAIRO','NIGHT NEVER ENDS',PAL.mag,PAL.blu]];
  BB.forEach(([t1,t2,a,b],i)=>{const x=i*512,y=1280,w=512,h=512;const gr=g.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#0a0420');gr.addColorStop(1,'#140838');g.fillStyle=gr;g.fillRect(x+6,y+6,w-12,h-12);
   g.save();g.beginPath();g.rect(x+6,y+6,w-12,h-12);g.clip();g.globalCompositeOperation='lighter';
   for(let k=0;k<7;k++){const rg=g.createRadialGradient(x+rr(60,450),y+rr(60,380),0,x+rr(60,450),y+rr(60,380),rr(60,190));rg.addColorStop(0,k%2?a:b);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.globalAlpha=.55;g.fillRect(x,y,w,h)}
   g.globalAlpha=1;g.strokeStyle=a;g.lineWidth=6;g.shadowColor=a;g.shadowBlur=20;                    // stylised figure profile (original, abstract)
   g.beginPath();const cx=x+w*.62,cy=y+h*.42;g.arc(cx,cy-40,60,Math.PI*.9,Math.PI*2.2);g.quadraticCurveTo(cx+70,cy+80,cx+10,cy+150);g.lineTo(cx-90,cy+200);g.stroke();
   g.strokeStyle=b;g.beginPath();g.arc(cx,cy-40,90,Math.PI*1.1,Math.PI*1.9);g.stroke();
   g.globalCompositeOperation='source-over';g.shadowBlur=0;g.fillStyle='rgba(0,0,0,.25)';for(let s=0;s<h;s+=4)g.fillRect(x,y+s,w,1);g.restore();
   g.save();g.textAlign='left';g.shadowColor=a;g.shadowBlur=22;g.fillStyle='#fff';let fs=58;g.font=`900 ${fs}px Impact, "Arial Black", sans-serif`;while(g.measureText(t1).width>w-60)g.font=`900 ${fs-=2}px Impact, "Arial Black", sans-serif`;
   g.fillText(t1,x+30,y+h-110);g.fillStyle=a;g.font=`700 28px "Arial Black", sans-serif`;g.fillText(t2,x+32,y+h-62);g.fillStyle=b;g.fillRect(x+30,y+h-45,140,6);g.restore();
   g.strokeStyle=a;g.lineWidth=8;g.strokeRect(x+6,y+6,w-12,h-12);R['b'+i]=[x,y,w,h]});
  // street holo signs: arrows, district names, warning chevrons
  const S2=[['>>',PAL.cya],['RESIDENTIAL',PAL.mag],['COMMERCIAL',PAL.cya],['INDUSTRIAL',PAL.ora],['DOCKS',PAL.tea],['SPIRE',PAL.vio],['SLOW',PAL.ora],['NO ENTRY',PAL.red]];
  S2.forEach(([t,col],i)=>{const x=i*256,y=1792;neon(t,x,y,256,256,col);R['s'+i]=[x,y,256,256]});
  // build sheet v2 decals (free atlas region x1536-2048, y768-1280): graffiti, dot-matrix, stencil, pockmarks, claw grooves
  {let q=7;const qr=()=>(q=(q*16807)%2147483647)/2147483647,X=1536;
   const spray=(txt,y,h,col,id)=>{g.save();g.textAlign='center';g.textBaseline='middle';let fs=h*.62;g.font=`900 ${fs}px Impact, "Arial Black", sans-serif`;while(g.measureText(txt).width>480&&fs>10){fs-=2;g.font=`900 ${fs}px Impact, "Arial Black", sans-serif`}
    g.shadowColor=col;g.shadowBlur=14;g.fillStyle=col;g.globalAlpha=.9;g.fillText(txt,X+256+qr()*4,y+h*.44);g.shadowBlur=0;g.globalAlpha=.85;
    const tw=g.measureText(txt).width;for(let i=0;i<16;i++){const dx=X+256-tw/2+qr()*tw,dl=6+qr()*h*.38;g.fillRect(dx,y+h*.44+fs*.3,2+qr()*2,dl);g.beginPath();g.arc(dx+1.5,y+h*.44+fs*.3+dl,2.4,0,7);g.fill()}
    g.restore();R[id]=[X,y,512,h]};
   spray('BOATS 0400 ->',768,128,'#ff2bd6','g0');spray('THEY CAME FROM THE DRAINS',896,128,'#a6ff3c','g1');
   // amber dot-matrix
   g.save();g.fillStyle='#0b0704';g.fillRect(X+4,1028,504,88);g.textAlign='center';g.textBaseline='middle';g.font='900 52px "Courier New", monospace';g.shadowColor='#ffae2a';g.shadowBlur=12;g.fillStyle='#ffb43c';g.fillText('SERVICE SUSPENDED',X+256,1072,490);
   g.shadowBlur=0;g.fillStyle='#0b0704';for(let x=X+4;x<X+508;x+=5)g.fillRect(x,1028,2,88);for(let y=1028;y<1116;y+=5)g.fillRect(X+4,y,504,2);g.strokeStyle='#3a2a14';g.lineWidth=4;g.strokeRect(X+4,1028,504,88);g.restore();R.g2=[X,1024,512,96];
   // stencil
   g.save();g.fillStyle='rgba(20,16,8,.0)';g.textAlign='center';g.textBaseline='middle';g.font='900 46px Impact, "Arial Black", sans-serif';g.fillStyle='#ffd23c';g.fillText('QUARANTINE - DO NOT CROSS',X+256,1168,496);
   g.globalCompositeOperation='destination-out';for(let x=X+10;x<X+500;x+=19)g.fillRect(x,1150+qr()*14,3,8);for(let i=0;i<220;i++)g.fillRect(X+qr()*512,1124+qr()*88,2,2);g.restore();R.g3=[X,1120,512,96];
   // bullet pockmarks
   g.save();for(let i=0;i<16;i++){const x=X+14+qr()*228,y=1226+qr()*44,r=3+qr()*5,rg=g.createRadialGradient(x,y,0,x,y,r*2.2);rg.addColorStop(0,'rgba(0,0,0,.95)');rg.addColorStop(.42,'rgba(10,8,14,.9)');rg.addColorStop(.5,'rgba(190,190,210,.55)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-r*2.2,y-r*2.2,r*4.4,r*4.4)}g.restore();R.g4=[X,1216,256,64];
   // claw grooves with acid-green glow
   g.save();g.lineCap='round';for(let k=0;k<3;k++){const y0=1228+k*14;g.strokeStyle='rgba(166,255,60,.55)';g.shadowColor='#a6ff3c';g.shadowBlur=10;g.lineWidth=7;g.beginPath();g.moveTo(X+266,y0);g.quadraticCurveTo(X+384,y0+10,X+502,y0+22);g.stroke();
    g.shadowBlur=0;g.strokeStyle='rgba(0,0,0,.95)';g.lineWidth=3.5;g.stroke()}g.restore();R.g5=[X+256,1216,256,64]}
  const tex=ctex(c);tex.anisotropy=8;return{tex,R,W}})();

 // ---------- geometry buckets (merged into a few draw calls) ----------
 const BK={};const bk=k=>BK[k]||(BK[k]={p:[],n:[],u:[],c:[]});
 const _v=new T.Vector3(),_n=new T.Vector3(),_c=new T.Color(),_m3=new T.Matrix3();
 function addGeo(key,geo,mtx,col,uvS){const g=geo.index?geo.toNonIndexed():geo,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,b=bk(key);
  _m3.getNormalMatrix(mtx);if(col!=null)_c.set(col);
  for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(mtx);b.p.push(_v.x,_v.y,_v.z);_n.fromBufferAttribute(N,i).applyMatrix3(_m3).normalize();b.n.push(_n.x,_n.y,_n.z);
   if(U){let u=U.getX(i),v=U.getY(i);if(uvS){u=uvS[0]+u*uvS[2];v=uvS[1]+v*uvS[3]}b.u.push(u,v)}else b.u.push(0,0);
   if(col!=null)b.c.push(_c.r,_c.g,_c.b);else b.c.push(1,1,1)}
  if(g!==geo)g.dispose()}
 const M4=(x=0,y=0,z=0,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ')),new T.Vector3(sx,sy,sz));
 const G={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,16),cyl8:new T.CylinderGeometry(1,1,1,8),plane:new T.PlaneGeometry(1,1),sph:new T.SphereGeometry(1,14,10)};
 const box=(key,x,y,z,w,h,d,col,ry=0,rx=0,rz=0)=>addGeo(key,G.box,M4(x,y,z,ry,rx,rz,w,h,d),col);
 const cyl=(key,x,y,z,r,h,col,ry=0,rx=0,rz=0,seg8)=>addGeo(key,seg8?G.cyl8:G.cyl,M4(x,y,z,ry,rx,rz,r,h,r),col);
 const quad=(key,x,y,z,w,h,ry,col,uvR,rx=0)=>addGeo(key,G.plane,M4(x,y,z,ry,rx,0,w,h,1),col,uvR);
 const sUV=(id)=>{const[x,y,w,h]=SA.R[id];return[x/SA.W,1-(y+h)/SA.W,w/SA.W,h/SA.W]};
 // facade walls with metric UVs (tile 16 x 25.6 m); y0..y1 band; uo randomises the window pattern per building
 function walls(key,x0,x1,z0,z1,y0,y1,uo){const b=bk(key),TW=16,TH=25.6,f=(ax,az,bx,bz,nx,nz,u0)=>{const L=Math.hypot(bx-ax,bz-az),u1=u0+L/TW,v0=y0/TH,v1=y1/TH;
   const P=[[ax,y0,az],[bx,y0,bz],[bx,y1,bz],[ax,y1,az]],UV=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];for(const i of[0,1,2,0,2,3]){b.p.push(...P[i]);b.n.push(nx,0,nz);b.u.push(...UV[i]);b.c.push(1,1,1)}};
  f(x0,z1,x1,z1,0,1,uo);f(x1,z1,x1,z0,1,0,uo+.31);f(x1,z0,x0,z0,0,-1,uo+.57);f(x0,z0,x0,z1,-1,0,uo+.83)}
 function shopband(x0,x1,z0,z1,row,sides){const b=bk('shop'),TW=12,H=4.5,v0=1-(row+1)/4,v1=1-row/4;
  const f=(ax,az,bx,bz,nx,nz)=>{const L=Math.hypot(bx-ax,bz-az),u1=L/TW,u0=cr();const P=[[ax,0,az],[bx,0,bz],[bx,H,bz],[ax,H,az]],UV=[[u0,v0],[u0+u1,v0],[u0+u1,v1],[u0,v1]];for(const i of[0,1,2,0,2,3]){b.p.push(...P[i]);b.n.push(nx,0,nz);b.u.push(...UV[i]);b.c.push(1,1,1)}};
  if(sides.s)f(x0,z1,x1,z1,0,1);if(sides.e)f(x1,z1,x1,z0,1,0);if(sides.n)f(x1,z0,x0,z0,0,-1);if(sides.w)f(x0,z0,x0,z1,-1,0)}

 // ---------- collision: static footprints on a 1 m grid over the playfield, plus ray proxies ----------
 // grid covers the whole Neon Core City plateau; two elevated slab layers per cell (decks, bridges, sky-bridges)
 const GX0=-172,GZ0=-142,NX=344,NZ=284,SG=new Float32Array(NX*NZ),SB=new Float32Array(NX*NZ),ST=new Float32Array(NX*NZ),SB2=new Float32Array(NX*NZ),ST2=new Float32Array(NX*NZ),SB3=new Float32Array(NX*NZ),ST3=new Float32Array(NX*NZ),SB4=new Float32Array(NX*NZ),ST4=new Float32Array(NX*NZ),boxes=[],proxies=[],proxyMat=new T.MeshBasicMaterial({visible:false});
 const ci=(x,z)=>{const gx=Math.floor(x)-GX0,gz=Math.floor(z)-GZ0;return gx<0||gz<0||gx>=NX||gz>=NZ?-1:gx*NZ+gz};
 function solidBox(x0,x1,z0,z1,h,mm){const small=x1-x0<3.2&&z1-z0<3.2,cx=Math.floor((x0+x1)/2),cz=Math.floor((z0+z1)/2);for(let x=Math.floor(x0);x<Math.ceil(x1);x++)for(let z=Math.floor(z0);z<Math.ceil(z1);z++){if(small&&!(x===cx&&z===cz)&&(Math.min(x+1,x1)-Math.max(x,x0))*(Math.min(z+1,z1)-Math.max(z,z0))<.3)continue;/* small props (posts, trees, pylons, lamps, barriers) only block the cells they really cover */const i=ci(x,z);if(i>=0)SG[i]=Math.max(SG[i],h)}
  if(mm!==false)boxes.push([x0,x1,z0,z1,h]);const p=new T.Mesh(G.box,proxyMat);p.position.set((x0+x1)/2,h/2,(z0+z1)/2);p.scale.set(x1-x0,h,z1-z0);p.updateMatrixWorld();proxies.push(p)}
 const slab=(x,z,b,t)=>{const i=ci(x,z);if(i<0)return;
  if(ST[i]<=0){SB[i]=b;ST[i]=t}else if(b<=ST[i]+.6&&t>=SB[i]-.6){SB[i]=Math.min(SB[i],b);ST[i]=Math.max(ST[i],t)}
  else if(ST2[i]<=0){SB2[i]=b;ST2[i]=t}else{SB2[i]=Math.min(SB2[i],b);ST2[i]=Math.max(ST2[i],t)}};
 const RMQ=[],roofMass=(x0,x1,z0,z1,top)=>RMQ.push(()=>{for(let x=Math.floor(x0);x<Math.ceil(x1);x++)for(let z=Math.floor(z0);z<Math.ceil(z1);z++){const i=ci(x,z);if(i>=0&&SG[i]>top-6)SG[i]=Math.max(SG[i],top)}(window.NCC_ROOFOBJ=window.NCC_ROOFOBJ||[]).push([(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,top])});
 const slab3=(x,z,b,t)=>{const i=ci(x,z);if(i<0)return;if(ST3[i]<=0){SB3[i]=b;ST3[i]=t}else if(b<=ST3[i]+.6&&t>=SB3[i]-.6){SB3[i]=Math.min(SB3[i],b);ST3[i]=Math.max(ST3[i],t)}else if(ST4[i]<=0){SB4[i]=b;ST4[i]=t}else{SB4[i]=Math.min(SB4[i],b);ST4[i]=Math.max(ST4[i],t)}};
 const sol=(x,y,z)=>{const i=ci(x,z);if(i<0)return false;return y<SG[i]||(y>=SB[i]&&y<ST[i])||(y>=SB2[i]&&y<ST2[i])||(y>=SB3[i]&&y<ST3[i])||(y>=SB4[i]&&y<ST4[i])};
 const stairH=(x,z)=>-1;
 const hAt=(x,z)=>{const i=ci(x,z);return i<0?0:SG[i]};

 // ---------- building kit ----------
 const AW=['aw0','aw1','aw2','aw3'];
 function awning(x,z,w,ry,row){const m=M4(x,3.75,z,ry);const g=new T.PlaneGeometry(w,1.7);g.rotateX(-Math.PI/2+.42);g.translate(0,0,.7);addGeo('awn',g,m,null,[0,1-(row+1)/4,w/6,.25]);g.dispose();
  const e=new T.BoxGeometry(w,.06,.06);e.translate(0,-.33,1.45);addGeo('glow',e,m,HEX[pick(['mag','cya','ora','vio'])].clone().multiplyScalar(1.2));e.dispose();
  for(const s of[-1,1]){const a=new T.BoxGeometry(.05,.05,1.5);a.rotateX(-.42);a.translate(s*w/2,-.05,.72);addGeo('metal',a,m,0x222230);a.dispose()}}
 function sign(id,x,y,z,w,h,ry,blade){quad('sign',x,y,z,w,h,ry,null,sUV(id));if(blade){const m=M4(x,y,z,ry);const br=new T.BoxGeometry(.08,.08,.9);br.translate(0,h/2-.3,-.45);addGeo('metal',br,m,0x22222c);br.translate(0,-(h-.6),0);addGeo('metal',br,m,0x22222c);br.dispose()}}
 const pools=[];const pool=(x,z,r,col,a=1,stretch=1,ry=0)=>pools.push([x,z,r,col,a,stretch,ry]);
 function rooftop(x0,x1,z0,z1,h,kind){const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
  box('roof',cx,h+.15,cz,w+.3,.3,d+.3,0x16141e);box('glow',cx,h+.32,z1+.13,w+.3,.06,.06,HEX[kind==='com'?'cya':kind==='ind'?'ora':'mag']);
  if(kind!=='ind'&&cr()<.6){const tx=cx+rr(-w/4,w/4),tz=cz+rr(-d/4,d/4);cyl('metal',tx,h+1.4,tz,1.1,2.2,0x2a2830);roofMass(tx-1,tx+1,tz-1,tz+1,h+2.5);cyl('metal',cx+rr(-w/4,w/4),h+3,cz,.05,6,0x55556a)}
  if(cr()<.5){const ax=cx+rr(-w/3,w/3),az=cz+rr(-d/3,d/3),ah=rr(4,10);cyl('metal',ax,h+ah/2,az,.08,ah,0x444455);addGeo('glow',G.sph,M4(ax,h+ah,az,0,0,0,.18,.18,.18),HEX.red.clone().multiplyScalar(1.4))}
  for(let i=0;i<(w*d/60|0)+1;i++){const bx=cx+rr(-w/2+1,w/2-1),bz=cz+rr(-d/2+1,d/2-1),sx=rr(.8,1.8),sy=rr(.6,1.2),sz=rr(.8,1.8);box('metal',bx,h+.6,bz,sx,sy,sz,0x2c2a34);roofMass(bx-sx/2,bx+sx/2,bz-sz/2,bz+sz/2,h+.6+sy/2)}}
 // a building: facade style, optional shop band facing streets, awnings, signs; solid when inside the playfield
 function building(x0,x1,z0,z1,h,kind,o={}){const st=kind==='com'?'facC':kind==='ind'?'facI':'facR',y0=o.shops?4.5:0;
  walls(st,x0,x1,z0,z1,y0,h,cr()*4);rooftop(x0,x1,z0,z1,h,kind);
  if(o.shops){const row=cr()*4|0;shopband(x0,x1,z0,z1,row,o.shops);const sides=o.shops;
   box('metal',(x0+x1)/2,4.55,(z0+z1)/2,x1-x0+.2,.18,z1-z0+.2,0x1c1a26);
   if(!sides.s)box('roof',(x0+x1)/2,2.25,z1-.05,x1-x0,4.5,.1,0x1a1822);if(!sides.n)box('roof',(x0+x1)/2,2.25,z0+.05,x1-x0,4.5,.1,0x1a1822);if(!sides.e)box('roof',x1-.05,2.25,(z0+z1)/2,.1,4.5,z1-z0,0x1a1822);if(!sides.w)box('roof',x0+.05,2.25,(z0+z1)/2,.1,4.5,z1-z0,0x1a1822);
   const edge=(ax,az,bx,bz,ry,ox,oz)=>{const L=Math.hypot(bx-ax,bz-az);for(let t=2;t<L-2;t+=rr(4.5,7)){const w=Math.min(rr(2.6,4),L-t-1),cx=ax+(bx-ax)*(t+w/2)/L+ox*.01,cz=az+(bz-az)*(t+w/2)/L+oz*.01,sx_=cx+ox*.1,sz_=cz+oz*.1;
     if(cr()<.75)awning(cx,cz,w,ry,cr()*4|0);
     if(cr()<.6)sign('h'+(cr()*24|0),sx_,5.6,sz_,w*.95,w*.24,ry);
     pool(cx+ox*1.8,cz+oz*1.8,3.4,HEX[pick(['mag','cya','ora','warm','vio'])],.55);t+=w}};
   if(sides.s)edge(x0,z1+.02,x1,z1+.02,0,0,1);if(sides.n)edge(x1,z0-.02,x0,z0-.02,Math.PI,0,-1);if(sides.e)edge(x1+.02,z1,x1+.02,z0,Math.PI/2,1,0);if(sides.w)edge(x0-.02,z0,x0-.02,z1,-Math.PI/2,-1,0)}
  if(o.blade){const[sx,sz,ry]=o.blade;sign('v'+(cr()*12|0),sx,rr(8,Math.max(9,h-6)),sz,1.5,6,ry,1)}
  if(o.bill){const[bx,by,bz,ry,id]=o.bill;const n=new T.Vector3(Math.sin(ry),0,Math.cos(ry));sign(id,bx,by,bz,14,14,ry);box('metal',bx-n.x*.2,by,bz-n.z*.2,14.8,14.8,.3,0x101018,ry);
  pool(bx+n.x*8,bz+n.z*8,11,HEX.mag,.35);holo.push([bx+n.x*.08,by,bz+n.z*.08,14,14,ry])}
  if(kind==='res'&&cr()<.7){for(let y=6;y<h-3;y+=rr(5,9)){const side=cr()<.5;const L=side?x1-x0:z1-z0;  // neon strip trims down corners
    box('glow',side?(x0+x1)/2:x1+.06,y,side?z1+.06:(z0+z1)/2,side?L:.05,.05,side?.05:L,HEX[pick(['mag','vio','cya'])].clone().multiplyScalar(.9))}}
  struct(x0,x1,z0,z1,h,kind,o);
  if(o.solid!==false)solidBox(x0,x1,z0,z1,h)}
 const holo=[];

 // ================= NEON CORE CITY: layout from the blockout (cleaned for play) + Godot-built kit instances =================
 // Coordinates match the Godot project: metres, +Y up, north = -Z, ground y = 0. The Central Spire stands at the origin.
 const LAY=NCC_LAYOUT,BND=LAY.bounds,HWY=19;
 // towers must not stand on the elevated highways: trim the side of any footprint that overhangs a deck
 for(const tw of LAY.towers.concat(LAY.buildings))for(const h of LAY.highways){const inDeck=(x,z)=>{const px=x-h.c[0],pz=z-h.c[1];return Math.abs(px*h.d[0]+pz*h.d[1])<=h.L/2+.5&&Math.abs(-px*h.d[1]+pz*h.d[0])<=6};
  const hits=()=>{const[x0,x1,z0,z1]=tw.box;for(let x=x0;x<=x1;x+=.25)for(let z=z0;z<=z1;z+=.25)if(inDeck(x,z))return true;return false};
  if(tw.h<=HWY-1.3||!hits())continue;const[x0,x1,z0,z1]=tw.box,cx=(x0+x1)/2,cz=(z0+z1)/2,px=cx-h.c[0],pz=cz-h.c[1],side=-px*h.d[1]+pz*h.d[0],nx=-h.d[1]*Math.sign(side),nz=h.d[0]*Math.sign(side);
  const k=Math.abs(nx)>=Math.abs(nz)?(nx>0?0:1):(nz>0?2:3);for(let i=0;i<120&&hits();i++){if(k===0)tw.box[0]+=.25;else if(k===1)tw.box[1]-=.25;else if(k===2)tw.box[2]+=.25;else tw.box[3]-=.25}}
 const RYd=d=>Math.atan2(d[0],d[1]);
 // Godot kit instancing: every placement is collected here and turned into one InstancedMesh per kit piece and material bucket
 const KI={};const kitAt=(name,x,y,z,ry=0,sx=1,sy=1,sz=1)=>{(KI[name]||(KI[name]=[])).push(M4(x,y,z,ry,0,0,sx,sy,sz))};
 // oriented cells: calls fn(x,z) for every 1 m cell whose centre lies in the rectangle (centre, long-axis dir d, length L, width W)
 const obbCells=(cx,cz,L,W,dx,dz,fn)=>{const hl=L/2,hw=W/2,ex=Math.abs(dx)*hl+Math.abs(dz)*hw,ez=Math.abs(dz)*hl+Math.abs(dx)*hw;
  for(let x=Math.floor(cx-ex);x<Math.ceil(cx+ex);x++)for(let z=Math.floor(cz-ez);z<Math.ceil(cz+ez);z++){const px=x+.5-cx,pz=z+.5-cz;if(Math.abs(px*dx+pz*dz)<=hl&&Math.abs(-px*dz+pz*dx)<=hw)fn(x,z)}};
 const pboxR=(cx,cy,cz,w,h,d,ry)=>{const p=new T.Mesh(G.box,proxyMat);p.position.set(cx,cy,cz);p.rotation.y=ry||0;p.scale.set(w,h,d);p.updateMatrixWorld();proxies.push(p)};
 const addProxy=(g,y=0)=>{const m=new T.Mesh(g,new T.MeshBasicMaterial({visible:false,side:T.DoubleSide}));m.position.y=y;m.updateMatrixWorld();proxies.push(m)};
 const deck=(cx,cz,L,W,dx,dz,b,t)=>{obbCells(cx,cz,L,W,dx,dz,(x,z)=>slab(x,z,b,t));pboxR(cx,(b+t)/2,cz,W,t-b,L,Math.atan2(dx,dz))};
 const deck3=(cx,cz,L,W,dx,dz,b,t)=>{obbCells(cx,cz,L,W,dx,dz,(x,z)=>slab3(x,z,b,t));pboxR(cx,(b+t)/2,cz,W,t-b,L,Math.atan2(dx,dz))};
 const groundOBB=(cx,cz,L,W,dx,dz,h)=>{obbCells(cx,cz,L,W,dx,dz,(x,z)=>{const i=ci(x,z);if(i>=0)SG[i]=Math.max(SG[i],h)});pboxR(cx,h/2,cz,W,h,L,Math.atan2(dx,dz))};
 const inRoad=(x,z,pad=0)=>LAY.roads.some(r=>{const px=x-r.c[0],pz=z-r.c[1];return Math.abs(px*r.d[0]+pz*r.d[1])<=r.L/2+pad&&Math.abs(-px*r.d[1]+pz*r.d[0])<=r.W/2+pad});
 const PLZ=36*MAPK;
const inPlaza=(x,z,pad=0)=>Math.abs(x)<PLZ+pad&&Math.abs(z)<PLZ+pad;
 // gravity lifts (stand in the beam to rise) and launch pads (throw you onto elevated routes)
 const LIFTS=[],PADS=[],beams=[];
 function lift(x,z,top){kitAt('lift',x,0,z);LIFTS.push([x,z,top]);beams.push([x,z,top]);pool(x,z,3.2,HEX.cya,.6)}
 const PAD_APEX=10;
 function pad(x,z,tx,ty,tz){kitAt('launch_pad',x,0,z);const g=26,vy=Math.sqrt(2*g*(ty+PAD_APEX)),tf=vy/g+Math.sqrt(2*PAD_APEX/g);PADS.push([x,z,(tx-x)/tf,vy,(tz-z)/tf]);pool(x,z,3,HEX.blu,.6)}
 const landing=(x,z,w,d,top,ry)=>{box('metal',x,top-.25,z,w,.5,d,0x22202c,ry);obbCells(x,z,d,w,Math.sin(ry),Math.cos(ry),(a,b)=>slab(a,b,top-.5,top));pboxR(x,top-.25,z,w,.5,d,ry);box('glow',x,top+.01,z,w*.9,.02,.06,HEX.cya,ry)};

 // ---------- ground plateau, sea walls and the bay ----------
 const asphalt=(()=>{const N=512,[c,g]=cvs(N,N);g.fillStyle='#0d0c16';g.fillRect(0,0,N,N);
  for(let i=0;i<9000;i++){const v=cr()*30+10|0;g.fillStyle=`rgba(${v},${v},${v+12},.5)`;g.fillRect(cr()*N,cr()*N,2,2)}
  for(let i=0;i<14;i++){const x=cr()*N,y=cr()*N,r=rr(20,70),rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(60,50,110,.35)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,2*r,2*r)}
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.5;for(let i=0;i<10;i++){g.beginPath();let x=cr()*N,y=cr()*N;g.moveTo(x,y);for(let k=0;k<6;k++){x+=rr(-30,30);y+=rr(-30,30);g.lineTo(x,y)}g.stroke()}
  const t=ctex(c,1);t.repeat.set((BND[1]-BND[0])/10,(BND[3]-BND[2])/10);return t})();
 const GW=BND[1]-BND[0],GD=BND[3]-BND[2],GCX=(BND[0]+BND[1])/2,GCZ=(BND[2]+BND[3])/2;
 const ground=new T.Mesh(new T.PlaneGeometry(GW,GD),new T.MeshStandardMaterial({map:asphalt,color:0x9a98b8,roughness:.32,metalness:.55}));ground.rotation.x=-Math.PI/2;ground.position.set(GCX,0,GCZ);S0.add(ground);C.far=1400;C.updateProjectionMatrix();
 for(const[x,z,w,d]of[[GCX,BND[2]-.5,GW+2,1],[GCX,BND[3]+.5,GW+2,1],[BND[0]-.5,GCZ,1,GD+2],[BND[1]+.5,GCZ,1,GD+2]]){box('roof',x,-2.2,z,w,4.4,d,0x1c1a24);box('glow',x,-.35,z,w>2?w:1.06,.08,d>2?d:1.06,HEX.cya.clone().multiplyScalar(.8))}
 for(let t=BND[0]+6;t<BND[1];t+=12){cyl('metal',t,.35,BND[2]+.6,.25,.7,0x2a2a32);cyl('metal',t,.35,BND[3]-.6,.25,.7,0x2a2a32)}
 for(let t=BND[2]+6;t<BND[3];t+=12){cyl('metal',BND[0]+.6,.35,t,.25,.7,0x2a2a32);cyl('metal',BND[1]-.6,.35,t,.25,.7,0x2a2a32)}
 const paver=(()=>{const N=256,[c,g]=cvs(N,N);g.fillStyle='#1c1a28';g.fillRect(0,0,N,N);g.strokeStyle='#100e18';g.lineWidth=3;for(let i=0;i<=N;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,N);g.moveTo(0,i);g.lineTo(N,i);g.stroke()}
  for(let i=0;i<60;i++){g.fillStyle=`rgba(90,80,160,${cr()*.12})`;g.fillRect((cr()*8|0)*32+2,(cr()*8|0)*32+2,28,28)}const t=ctex(c,1);return t})();
 const walkM=new T.MeshStandardMaterial({map:paver,roughness:.4,metalness:.4,color:0xb0b0c8});
 const walkG=[];const walk=(x0,x1,z0,z1,y=.12)=>{const g=new T.BoxGeometry(x1-x0,y,z1-z0);g.translate((x0+x1)/2,y/2,(z0+z1)/2);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*(x1-x0)/4,u.getY(i)*(z1-z0)/4);walkG.push(g)};
 const walkO=(cx,cz,L,W,ry,y=.12)=>{const g=new T.BoxGeometry(W,y,L);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*W/4,u.getY(i)*L/4);g.rotateY(ry);g.translate(cx,y/2,cz);walkG.push(g)};
 const lane=(x0,z0,x1,z1,w,col,dash)=>{const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0);if(!dash){box('glow',(x0+x1)/2,.025,(z0+z1)/2,w,.02,L,col,ry);return}
  for(let t=0;t<L;t+=dash*2){const a=t/L,b=Math.min(1,(t+dash)/L);box('glow',x0+(x1-x0)*(a+b)/2,.025,z0+(z1-z0)*(a+b)/2,w,.02,(b-a)*L,col,ry)}};
 const water=(()=>{const N=512,[c,g]=cvs(N,N);g.fillStyle='#06071a';g.fillRect(0,0,N,N);
  for(let i=0;i<500;i++){const x=cr()*N,y=cr()*N,w=rr(6,40);g.fillStyle=`rgba(${pick(['255,43,214','33,230,255','138,59,255','255,154,60'])},${rr(.05,.25)})`;g.fillRect(x,y,w,1.5)}
  const t=ctex(c,1);t.repeat.set(40,40);const m=new T.Mesh(new T.PlaneGeometry(1800,1800),new T.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.8,color:0x445,roughness:.15,metalness:.8}));
  m.rotation.x=-Math.PI/2;m.position.set(0,-3.4,0);S0.add(m);return{t,m}})();

 // ---------- roads: lane markings, kerbs and paved sidewalks (cut where roads cross and at the plaza) ----------
 const WHITE=new T.Color(0xffffff).multiplyScalar(.75);
 for(const r of LAY.roads){const[dx,dz]=r.d,sx=-dz,sz=dx,ry=RYd(r.d),hl=r.L/2,hw=r.W/2;
  const at=(t,o)=>[r.c[0]+dx*t+sx*o,r.c[1]+dz*t+sz*o];
  const other=(x,z)=>LAY.roads.some(q=>q!==r&&(()=>{const px=x-q.c[0],pz=z-q.c[1];return Math.abs(px*q.d[0]+pz*q.d[1])<=q.L/2+.5&&Math.abs(-px*q.d[1]+pz*q.d[0])<=q.W/2+3.6})());
  for(let t=-hl;t<hl;t+=4){const m=t+2;const[cx,cz]=at(m,0);if(inPlaza(cx,cz,-1)||other(cx,cz))continue;
   for(const s of[-1,1]){const[a,b]=at(m,s*(hw-.5));box('glow',a,.025,b,.14,.02,4,(s<0?HEX.cya:HEX.mag).clone().multiplyScalar(.9),ry);
    const[ka,kb]=at(m,s*(hw+.12));box('roof',ka,.07,kb,.24,.14,4,0x24222e,ry);box('glow',ka,.15,kb,.06,.02,4,HEX.vio,ry);
    const[wa,wb]=at(m,s*(hw+1.85));if(!inRoad(wa,wb,-.2)&&!inPlaza(wa,wb))walkO(wa,wb,4,3.5,ry)}
   const lanes=r.W>13?4:2,lw=r.W/lanes;
   for(let k=1;k<lanes;k++){if(k===lanes/2)continue;const[a,b]=at(m,-hw+k*lw);if((Math.floor(m/4))%2===0)box('glow',a,.025,b,.12,.02,2.6,WHITE,ry)}
   for(const o of[-.18,.18]){const[a,b]=at(m,o);box('glow',a,.025,b,.1,.02,4,HEX.ora.clone().multiplyScalar(.8),ry)}}
  // crosswalk stripes where the road meets another road or the plaza
  for(const e of[-1,1])for(let t=hl-2;t>-hl;t-=4){const[cx,cz]=at(t*e,0);if(inPlaza(cx,cz,2)||other(cx,cz)){const[pa,pb]=at((t+3.5)*e,0);if(inPlaza(pa,pb,2)||other(pa,pb))break;
    for(let o=-hw+1;o<=hw-1;o+=1.4){const[a,b]=at((t+3)*e,o);box('glow',a,.022,b,.7,.02,3,new T.Color(0xc8d0ff).multiplyScalar(.55),ry)}break}}}

 // ---------- Grand Plaza and the Central Spire ----------
 walk(-PLZ,PLZ,-PLZ,PLZ,.1);
 for(const[r,c]of[[34.5*MAPK,HEX.cya],[28*MAPK,HEX.mag],[22.5*MAPK,HEX.vio]]){const g=new T.RingGeometry(r-.14,r+.14,160);g.rotateX(-Math.PI/2);g.translate(0,.11,0);addGeo('glow',g,new T.Matrix4(),c);g.dispose()}
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2;box('glow',Math.sin(a)*31.2*MAPK,.11,Math.cos(a)*31.2*MAPK,.08,.02,5,HEX.blu,a)}
 for(const s of[-1,1])for(const q of[-1,1]){box('glow',s*(PLZ-.2),.13,q*PLZ/2,.1,.04,PLZ,HEX.cya.clone().multiplyScalar(.7));box('glow',q*PLZ/2,.13,s*(PLZ-.2),PLZ,.04,.1,HEX.cya.clone().multiplyScalar(.7))}
 pool(0,0,40*MAPK,HEX.vio,.45);
 kitAt('spire',0,0,0);
 {const tiers=[[20,52],[15,84],[11,123],[7,177],[2.6,192]];
  for(let x=-21;x<21;x++)for(let z=-21;z<21;z++){const r=Math.hypot(x+.5,z+.5),i=ci(x,z);if(i<0)continue;
   if(r<=9)SG[i]=Math.max(SG[i],27);else if(r<=16.5)SG[i]=Math.max(SG[i],12.8);
   let t=0;for(const[tr,ty]of tiers)if(r<=tr)t=ty;if(t>0)slab(x,z,27,t)}
  addProxy(new T.CylinderGeometry(16.5,16.5,12.8,32),6.4);addProxy(new T.CylinderGeometry(9,9,15,24),20);
  addProxy(new T.CylinderGeometry(15,20,25,8),39.5);addProxy(new T.CylinderGeometry(11,15,30,8),69);addProxy(new T.CylinderGeometry(8,11,36,8),105);addProxy(new T.CylinderGeometry(4,7,48,8),153);
  boxes.push([-16.5,16.5,-16.5,16.5,12.8]);
  // elevator shafts: gravity lifts up to the first observation deck, with a walkway onto it
  for(const s of[-1,1]){lift(0,s*21.6,52.6);landing(0,s*18.4,3.2,4.6,52.4,0);}
  pool(0,22,6,HEX.cya,.6);pool(0,-22,6,HEX.cya,.6);for(const a of[0,1,2,3]){const x=Math.sin(a*Math.PI/2)*17.5,z=Math.cos(a*Math.PI/2)*17.5;pool(x,z,7,a%2?HEX.mag:HEX.cya,.55)}}
 const spire=new T.Group();S0.add(spire);
 const beacon=new T.Mesh(new T.SphereGeometry(1.1,16,12),new T.MeshBasicMaterial({color:0xff3355}));beacon.position.y=219;spire.add(beacon);
 const halo=[0,1,2].map(i=>{const m=new T.Mesh(new T.TorusGeometry(26+i*3,.09,6,160),new T.MeshBasicMaterial({color:[0x21e6ff,0xff2bd6,0x8a3bff][i],transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false}));m.position.y=60+i*16;m.rotation.x=Math.PI/2+(i-1)*.16;spire.add(m);return m});
 // plaza cover: blockout cover blocks become quarantine barriers, pushed out of the podium
 const barrierAt=(x,z,ry)=>{kitAt('barrier',x,0,z,ry);const c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));solidBox(x-(1.6*c+.4*s),x+(1.6*c+.4*s),z-(1.6*s+.4*c),z+(1.6*s+.4*c),1.25);pool(x,z,2.4,HEX.red,.25,1.5,ry)};
 for(const[cx0,cz0,w,d]of LAY.covers){let cx=cx0,cz=cz0;const ry=d>w?Math.PI/2:0;
  if(inPlaza(cx,cz)){if(Math.hypot(cx,cz)<19){const L=Math.hypot(cx,cz)||1;cx=cx/L*24+cx*.2;cz=cz/L*24+cz*.2}barrierAt(cx,cz,ry)}}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,x=Math.sin(a)*30*MAPK,z=Math.cos(a)*30*MAPK;kitAt('tree',x,0,z,cr()*6);solidBox(x-.9,x+.9,z-.9,z+.9,.5);pool(x,z,3.5,new T.Color(0x3cff8c),.4)}
 for(const[x,z]of[[25,25],[-25,25],[25,-25],[-25,-25]].map(q=>q.map(v=>v*MAPK))){kitAt('bench',x,0,z,Math.atan2(-x,-z));kitAt('vending',x+2.6,0,z,Math.atan2(-x,-z));solidBox(x+2.1,x+3.1,z-.5,z+.5,2.1)}

 // ---------- parks and rooftop gardens ----------
 for(const p of LAY.parks){const[x0,x1,z0,z1]=p.box,cx=(x0+x1)/2,cz=(z0+z1)/2;
  box('roof',cx,.17,cz,x1-x0,.34,z1-z0,0x0b2414);solidBox(x0,x1,z0,z1,.34,false);
  box('roof',cx,.25,z0,x1-x0+.4,.5,.4,0x2c2a34);box('roof',cx,.25,z1,x1-x0+.4,.5,.4,0x2c2a34);
  walkO(cx,cz,x1-x0-2,2.4,Math.PI/2,.38);box('glow',cx,.39,cz+1.25,x1-x0-2,.02,.08,new T.Color(0x3cff8c).multiplyScalar(.9));box('glow',cx,.39,cz-1.25,x1-x0-2,.02,.08,new T.Color(0x3cff8c).multiplyScalar(.9));
  for(const[tx,tz,th]of p.trees){const s=Math.min(1.3,Math.max(.8,th/8));kitAt('tree',tx,.34,tz,cr()*6,s,s,s);solidBox(tx-.9*s,tx+.9*s,tz-.9*s,tz+.9*s,.9);pool(tx,tz,3.2*s,new T.Color(0x3cff8c),.45)}
  for(let k=0;k<3;k++){const x=x0+4+(x1-x0-8)*(k+.5)/3;kitAt('bench',x,.34,cz+2.6,Math.PI)}}

 // ---------- buildings: blockout skyline cleaned into blocks with alleys; shopfronts face streets ----------
 const BB=['b0','b1','b2','b3'];
 const towerOf=(b,kind,glassy,crown,neonC,hero)=>{const[x0,x1,z0,z1]=b.box,h=b.h,cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
  const sh=b.shops&&(b.shops.n||b.shops.s||b.shops.e||b.shops.w)?b.shops:null;
  const o={shops:sh};
  if(kind==='res'&&cr()<.6)o.blade=[x1+.05,cz,Math.PI/2];
  if(kind==='com'&&sh&&h>30&&cr()<.45){const side=sh.s?'s':sh.n?'n':sh.e?'e':'w',by=Math.min(h-9,rr(16,30));
   o.bill=side==='s'?[cx,by,z1+.15,0,pick(BB)]:side==='n'?[cx,by,z0-.15,Math.PI,pick(BB)]:side==='e'?[x1+.15,by,cz,Math.PI/2,pick(BB)]:[x0-.15,by,cz,-Math.PI/2,pick(BB)];
   if((side==='s'||side==='n')?w<15:d<15)o.bill=null}
  if(hero||h>90){building(x0,x1,z0,z1,h*.6,kind,o);building(x0+1.4,x1-1.4,z0+1.4,z1-1.4,h*.84,kind,{});building(x0+2.8,x1-2.8,z0+2.8,z1-2.8,h,kind,{});}
  else building(x0,x1,z0,z1,h,kind,o);
  const tw=hero||h>90?w-5.6:w,td=hero||h>90?d-5.6:d;
  if(crown)kitAt(cr()<.5?'crown_a':'crown_b',cx,h+.3,cz,0,tw/10,Math.max(tw,td)/10,td/10);
  if(neonC){box('glow',x1+.08,h*.48,z1+.08,.22,h*.72,.22,neonC);pool(x1+1,z1+1,4,neonC,.5)}};
 const NEONC={'Cyan Neon':HEX.cya,'Pink Neon':HEX.mag,'Violet Neon':HEX.vio,'Green Neon':new T.Color(0x3cff8c)};
 for(const b of LAY.buildings)towerOf(b,b.kind,b.glass,b.crown,b.neon?NEONC[b.neon]:null,false);
 for(const t of LAY.towers){towerOf(t,'com',true,true,NEONC[t.neon]||HEX.cya,true);const cx=(t.box[0]+t.box[1])/2,cz=(t.box[2]+t.box[3])/2;addGeo('glow',G.sph,M4(cx,t.beacon,cz,0,0,0,1.2,1.2,1.2),HEX.cya.clone().multiplyScalar(1.3))}
 // sky-bridge anchor towers straddle the streets below as gateways: four legs, the tower body starting at 24 m
 const gateTower=a=>{const[x0,x1,z0,z1]=a.box,h=a.h,y0=24,cx=(x0+x1)/2,cz=(z0+z1)/2;
  walls('facC',x0,x1,z0,z1,y0,h,cr()*4);rooftop(x0,x1,z0,z1,h,'com');box('roof',cx,y0-.6,cz,x1-x0+.6,1.2,z1-z0+.6,0x1a1822);
  box('glow',cx,y0-1.22,cz,x1-x0-2,.04,.12,HEX.mag);box('glow',cx,y0-1.22,cz,.12,.04,z1-z0-2,HEX.cya);
  for(const[x,z]of[[x0+.9,z0+.9],[x1-.9,z0+.9],[x0+.9,z1-.9],[x1-.9,z1-.9]]){box('metal',x,y0/2,z,1.8,y0,1.8,0x1d1c23);box('glow',x,y0/2,z,1.84,y0*.8,.06,HEX.mag.clone().multiplyScalar(.8));solidBox(x-.9,x+.9,z-.9,z+.9,y0)}
  obbCells(cx,cz,z1-z0,x1-x0,0,1,(x,z)=>slab(x,z,y0-1.2,h));pboxR(cx,(y0-1.2+h)/2,cz,x1-x0,h-y0+1.2,z1-z0,0);boxes.push([x0,x1,z0,z1,h]);
  kitAt(cr()<.5?'crown_a':'crown_b',cx,h+.3,cz,0,(x1-x0)/10,(x1-x0)/10,(z1-z0)/10);pool(cx,cz,9,HEX.mag,.4)};
 for(const a of LAY.anchors)a.gate?gateTower(a):towerOf(a,'com',true,true,HEX.mag,false);

 // ---------- elevated highways (deck 19 m) on hammerhead pylons; lifts and landings at both ends ----------
 const runSeg=(c,d,L,seg,y,name)=>{const n=Math.ceil(L/seg),ry=RYd(d);for(let k=0;k<n;k++){const t=-L/2+(k+.5)*L/n;kitAt(name,c[0]+d[0]*t,y,c[1]+d[1]*t,ry,1,1,(L/n)/seg)}};
 // lifts beside elevated decks: try both sides and growing offsets until the whole beam column is clear, then bridge it to the deck with a landing
 const colClear=(x,z,top)=>{for(let y=.3;y<top+2.4;y+=.5)for(const[a,b]of[[0,0],[.9,0],[-.9,0],[0,.9],[0,-.9]])if(sol(x+a,y,z+b))return false;return true};
 const liftBeside=(c,d,t0,edge,top,deckTop)=>{const[dx,dz]=d,sx=-dz,sz=dx,ry=RYd(d);
  for(const o of[edge+3,edge+5.5,edge+8.5])for(const ts of[0,4,-4,8,-8])for(const s of[1,-1]){const t=t0+ts,lx=c[0]+dx*t+sx*s*o,lz=c[1]+dz*t+sz*s*o;
   if(!colClear(lx,lz,top)||inPlaza(lx,lz))continue;lift(lx,lz,top);const w=o-1.6-edge,lo=edge+w/2;if(w>.2)landing(c[0]+dx*t+sx*s*lo,c[1]+dz*t+sz*s*lo,w,3,deckTop,ry);return[s,t]}
  return null};
 for(const h of LAY.highways){const[dx,dz]=h.d,sx=-dz,sz=dx;runSeg(h.c,h.d,h.L,20,HWY,'highway_seg');
  deck3(h.c[0],h.c[1],h.L,11,dx,dz,HWY-1.2,HWY);
  for(const s of[-1,1])obbCells(h.c[0]+sx*s*5.25,h.c[1]+sz*s*5.25,h.L,.6,dx,dz,(x,z)=>slab3(x,z,HWY-1.2,HWY+1.1));
  const ons=h.supports.map(q=>{const t=(q[0]-h.c[0])*dx+(q[1]-h.c[1])*dz;return[h.c[0]+dx*t,h.c[1]+dz*t,t]});
  for(const[x,z]of ons){kitAt('highway_pylon',x,0,z,RYd(h.d)+Math.PI/2,1,(HWY-2.4)/16.6,1);solidBox(x-1.3,x+1.3,z-1.3,z+1.3,HWY-2.4);pool(x,z,4,HEX.cya,.35)}
  ons.sort((a,b)=>a[2]-b[2]);
  for(const q of[ons[1],ons[ons.length-2]])liftBeside(h.c,h.d,q[2]+5,5.5,HWY+.6,HWY);
  for(let t=-h.L/2+10;t<h.L/2;t+=20)pool(h.c[0]+dx*t,h.c[1]+dz*t,6,HEX.cya,.22,2.2,RYd(h.d))}

 // ---------- pedestrian bridges (10 m) and enclosed sky-bridges, with lifts at the ends ----------
 for(const b of LAY.bridges){const[dx,dz]=b.d,sx=-dz,sz=dx,top=b.top;runSeg(b.c,b.d,b.L,10,top,'ped_bridge');
  deck3(b.c[0],b.c[1],b.L,7,dx,dz,top-.5,top);
  for(const s of[-1,1])obbCells(b.c[0]+sx*s*3.3,b.c[1]+sz*s*3.3,b.L-1,.4,dx,dz,(x,z)=>slab3(x,z,top-.5,top+.9));
  for(const e of[-1,1])liftBeside(b.c,b.d,e*(b.L/2-3),3.5,top+.6,top);}
  const GLASS=[],GLASS_G=new T.BoxGeometry(1,1,1),GLASS_M=new T.MeshPhysicalMaterial({color:0x8fd8ff,metalness:.1,roughness:.04,transparent:true,opacity:.26,clearcoat:1,side:T.DoubleSide,depthWrite:false});
  for(const s of LAY.skybridges){const[dx,dz]=s.d,sx=-dz,sz=dx,top=s.top;{const n=Math.ceil(s.L/10),ry=RYd(s.d);for(let k=0;k<n;k++){const t=-s.L/2+(k+.5)*s.L/n,x=s.c[0]+dx*t,z=s.c[1]+dz*t;if(hAt(x,z)>=top+4.8&&hAt(x+dx*4,z+dz*4)>=top+4.8&&hAt(x-dx*4,z-dz*4)>=top+4.8)continue;kitAt('skybridge',x,top,z,ry,1,1,(s.L/n)/10)}}
  deck(s.c[0],s.c[1],s.L,7.4,dx,dz,top-.6,top);
  obbCells(s.c[0],s.c[1],s.L,7.4,dx,dz,(x,z)=>slab(x,z,top+4.8,top+5.3));pboxR(s.c[0],top+5.05,s.c[1],7.4,.5,s.L,RYd(s.d));
  // lifts first (clear columns), then side walls left open where each lift's landing meets the corridor
  const LS=[-1,1].map(e=>liftBeside(s.c,s.d,e*(s.L/2-2),3.7,top+.6,top));
  for(const k of[-1,1])for(let t=-s.L/2;t<s.L/2;t+=1){if(LS.some(r=>r&&r[0]===k&&Math.abs(t+.5-r[1])<2.2))continue;obbCells(s.c[0]+sx*k*3.6+dx*(t+.5),s.c[1]+sz*k*3.6+dz*(t+.5),1,.3,dx,dz,(x,z)=>slab(x,z,top,top+4.8))}
   for(const k of[-1,1])for(let t0=-s.L/2;t0<s.L/2-.01;t0+=5){const t1=Math.min(s.L/2,t0+5),tm=(t0+t1)/2,len=t1-t0;
    if(LS.some(r=>r&&r[0]===k&&Math.abs(tm-r[1])<2.2+len/2))continue;
    if(hAt(s.c[0]+dx*tm,s.c[1]+dz*tm)>=top-.6)continue;   // that stretch runs through a tower
    const g=new T.Mesh(GLASS_G,GLASS_M);g.position.set(s.c[0]+sx*k*3.6+dx*tm,top+2.4,s.c[1]+sz*k*3.6+dz*tm);g.rotation.y=RYd(s.d);g.scale.set(.05,4.8,len-.1);g.renderOrder=2;
    const cells=new Set();for(let t=t0;t<t1;t+=.25)for(let o=3.42;o<=3.8;o+=.12){const i=ci(s.c[0]+sx*k*o+dx*t,s.c[1]+sz*k*o+dz*t);if(i>=0)cells.add(i)}
    g.userData.glass={cells:[...cells],top,n:[sx*k,0,sz*k]};g.updateMatrixWorld();S0.add(g);proxies.push(g);GLASS.push(g)}
   holo.push([s.c[0]+sx*3.75,top+2.4,s.c[1]+sz*3.75,Math.min(30,s.L*.5),2.4,Math.atan2(sx,sz)])}
 // transit hub canopy (walkable glass roof) over the platform
 {const[x0,x1,z0,z1]=LAY.transit_canopy,cx=(x0+x1)/2,cz=(z0+z1)/2;
  box('metal',cx,13.6,cz,x1-x0,.35,z1-z0,0x3a5a7a);for(let x=x0+2;x<x1;x+=8)for(const z of[z0+1,z1-1]){box('metal',x,6.8,z,.6,13.6,.6,0x22232a);solidBox(x-.3,x+.3,z-.3,z+.3,13.6,false)}
  box('glow',cx,13.4,cz,x1-x0,.08,.1,HEX.cya);obbCells(cx,cz,z1-z0,x1-x0,0,1,(x,z)=>slab(x,z,13.4,13.8));pboxR(cx,13.6,cz,x1-x0,.4,z1-z0,0);
  box('roof',cx,.5,cz,x1-x0-4,1,5,0x2c2a34);solidBox(cx-(x1-x0-4)/2,cx+(x1-x0-4)/2,cz-2.5,cz+2.5,1);box('glow',cx,1.01,cz+2.45,x1-x0-4,.02,.12,HEX.ora)}

 // ---------- skyport landing platform (24 m) ----------
 {const[x0,x1,z0,z1]=LAY.skyport.box,top=LAY.skyport.top,cx=(x0+x1)/2,cz=(z0+z1)/2;kitAt('skyport',cx,top,cz,0,MAPK,1,MAPK);
  obbCells(cx,cz,38*MAPK,62*MAPK,0,1,(x,z)=>slab(x,z,top-2,top));pboxR(cx,top-1,cz,62*MAPK,2,38*MAPK,0);
  for(const s of[-1,1]){obbCells(cx,cz+s*18.9*MAPK,.4,62*MAPK,0,1,(x,z)=>slab(x,z,top-2,top+1.1));obbCells(cx+s*30.9*MAPK,cz,38*MAPK,.4,0,1,(x,z)=>slab(x,z,top-2,top+1.1))}
  for(const x of[-24*MAPK,0,24*MAPK])for(const z of[-14*MAPK,14*MAPK]){box('roof',cx+x,(top-2)/2,cz+z,2.4,top-2,2.4,0x34343c);solidBox(cx+x-1.2,cx+x+1.2,cz+z-1.2,cz+z+1.2,top-2,false)}
  obbCells(cx+27*MAPK,cz-14*MAPK,5,5,0,1,(x,z)=>slab(x,z,top,top+14));
  {let ok=false;for(const ox of[-8,8,-18,18,0,-26,26])for(const sz_ of[1,-1]){if(ok)break;const lx=cx+ox,lz=cz+sz_*21.6*MAPK;if(Math.abs(lz)>BND[3]-2||!colClear(lx,lz,top+.6))continue;lift(lx,lz,top+.6);landing(lx,cz+sz_*19.8*MAPK,2.4,2.2,top,0);ok=true}
   for(const oz of[0,-8,8,-14,14])for(const sx_ of[-1,1]){if(ok)break;const lx=cx+sx_*34.6*MAPK,lz=cz+oz;if(Math.abs(lx)>BND[1]-2||!colClear(lx,lz,top+.6))continue;lift(lx,lz,top+.6);landing(cx+sx_*32.3*MAPK,lz,3.2,2.4,top,Math.PI/2);ok=true}}pool(cx,cz,30,HEX.vio,.3)}

 // ---------- districts: Grand Plaza Market stalls, rooftop arena, blockout signage, spawn beacons ----------
 {const[m0,m1,m2]=LAY.zones.Market;for(let i=0;i<4;i++)for(let j=0;j<2;j++){const x=m0+4+i*6.5,z=m2+5+j*11,ry=j?Math.PI:0;kitAt('market_stall',x,0,z,ry);
   const oz=j?-.7:.7;solidBox(x-1.6,x+1.6,z+oz-.5,z+oz+.5,1.05,false);pool(x,z+oz*2,3,pick([HEX.mag,HEX.cya,HEX.ora,HEX.vio]),.6)}
  sign('h'+(cr()*24|0),m0+14,6.5,m2+0.2,10,2.5,0);}
 {const[x0,x1,z0,z1]=LAY.zones.Rooftop,cx=(x0+x1)/2,cz=(z0+z1)/2;building(x0,x1,z0,z1,10,'res',{});
  for(const s of[-1,1]){box('roof',cx,10.9,cz+s*((z1-z0)/2-.35),x1-x0,1.2,.7,0x1c1a26);box('glow',cx,11.52,cz+s*((z1-z0)/2-.35),x1-x0,.03,.72,HEX.mag);obbCells(cx,cz+s*((z1-z0)/2-.35),.7,x1-x0,0,1,(x,z)=>{const i=ci(x,z);if(i>=0)SG[i]=Math.max(SG[i],11.2)})}
  for(const[c0,c1,w,d]of LAY.covers)if(c0>x0&&c0<x1&&c1>z0&&c1<z1){const ry=d>w?Math.PI/2:0;kitAt('barrier',c0,10,c1,ry);const c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));solidBox(c0-(1.6*c+.4*s),c0+(1.6*c+.4*s),c1-(1.6*s+.4*c),c1+(1.6*s+.4*c),11.25)}
  lift(x0-2.6,cz,10.6);lift(x1+2.6,cz,10.6)}
 for(const[c0,c1,w,d]of LAY.covers)for(const k of['Market','Transit']){const[a,b,e,f]=LAY.zones[k];if(c0>a&&c0<b&&c1>e&&c1<f)barrierAt(c0,c1,d>w?Math.PI/2:0)}
 LAY.signs.forEach((s,i)=>{const ry=RYd(s.d)-Math.PI/2,h=s.y1-s.y0,w=s.L,id=BB[i%4],y=(s.y0+s.y1)/2;sign(id,s.c[0],y,s.c[1],w,h,ry);
  const n=new T.Vector3(Math.sin(ry),0,Math.cos(ry));box('metal',s.c[0]-n.x*.2,y,s.c[1]-n.z*.2,w+.8,h+.8,.3,0x101018,ry);holo.push([s.c[0]+n.x*.08,y,s.c[1]+n.z*.08,w,h,ry]);pool(s.c[0]+n.x*8,s.c[1]+n.z*8,10,HEX.mag,.3)});
 for(const[x,z]of LAY.spawns){kitAt('launch_pad',x,0,z);pool(x,z,5,HEX.blu,.6);box('glow',x,.05,z,7,.02,.1,HEX.cya);box('glow',x,.05,z,.1,.02,7,HEX.cya)}

 // ---------- street furniture: lamps ----------
 for(const r of LAY.roads){const[dx,dz]=r.d,sx=-dz,sz=dx,n=Math.floor(r.L/30);
  for(let k=0;k<n;k++){const t=-r.L/2+15+k*30;for(const s of[-1,1]){const x=r.c[0]+dx*t+sx*s*(r.W/2+1.2),z=r.c[1]+dz*t+sz*s*(r.W/2+1.2);if(inPlaza(x,z)||inRoad(x,z,-.4)||sol(x,1,z)||LIFTS.some(q=>Math.hypot(q[0]-x,q[1]-z)<3.5))continue;
   kitAt('street_lamp',x,0,z,Math.atan2(-sx*s,-sz*s));solidBox(x-.3,x+.3,z-.3,z+.3,7.4,false);pool(x-sx*s*2.2,z-sz*s*2.2,6,s<0?HEX.cya:HEX.mag,.55)}}}
 // ---------- parked commuter spacecraft (10, on the street sides) and motorcycles (black / red), with collision ----------
 const SHIPS=[],BIKES=[];
 const obbSolid=(cx,cz,L,W,ry,h)=>{const c=Math.cos(ry),s=Math.sin(ry);for(let a=-L/2;a<=L/2+.01;a+=.5)for(let b=-W/2;b<=W/2+.01;b+=.5){const i=ci(cx+a*c+b*s,cz-a*s+b*c);if(i>=0)SG[i]=Math.max(SG[i],h)}
  const hx=Math.abs(c)*L/2+Math.abs(s)*W/2,hz=Math.abs(s)*L/2+Math.abs(c)*W/2;boxes.push([cx-hx,cx+hx,cz-hz,cz+hz,h]);
  const p=new T.Mesh(G.box,proxyMat);p.position.set(cx,h/2,cz);p.rotation.y=ry;p.scale.set(L,h,W);p.updateMatrixWorld();proxies.push(p)};
 const inOther=(x,z,r)=>LAY.roads.some(q=>{if(q===r)return false;const px=x-q.c[0],pz=z-q.c[1];return Math.abs(px*q.d[0]+pz*q.d[1])<=q.L/2+2&&Math.abs(-px*q.d[1]+pz*q.d[0])<=q.W/2+2});
 const footOK=(cx,cz,L,W,ry,r,gap)=>{const c=Math.cos(ry),s=Math.sin(ry);for(let a=-L/2;a<=L/2+.01;a+=.6)for(let b=-W/2;b<=W/2+.01;b+=.6){const x=cx+a*c+b*s,z=cz-a*s+b*c;
   if(sol(x,.4,z)||sol(x,2.2,z)||inPlaza(x,z,1)||Math.abs(x)>BND[1]-3||Math.abs(z)>BND[3]-3||inOther(x,z,r))return false}
  return!LIFTS.some(q=>Math.hypot(q[0]-cx,q[1]-cz)<L/2+3.5)&&!SHIPS.concat(BIKES).some(q=>Math.hypot(q.x-cx,q.z-cz)<(q.L+L)/2+gap)};
 const along=(r,t,off,s)=>[r.c[0]+r.d[0]*t-r.d[1]*s*off,r.c[1]+r.d[1]*t+r.d[0]*s*off];
 // ships: hull 5.2 x 3.5 m (rear fins span 6.7 m), parallel to the curb, nose with the traffic flow
 for(let n=0;SHIPS.length<10&&n<900;n++){const r=LAY.roads[n%LAY.roads.length],t=rr(-r.L/2+14,r.L/2-14),s=n%2?1:-1,[x,z]=along(r,t,r.W/2-2.05,s),ry=Math.atan2(-r.d[1],r.d[0])+(s>0?Math.PI:0)+rr(-.04,.04);
  if(!footOK(x,z,5.4,6.8,ry,r,6))continue;const i=SHIPS.length,tint=i%2?['orange','blue','pink'][(i>>1)%3]:null;SHIPS.push({x,y:0,z,ry,L:5.4,tint});
  const c=Math.cos(ry),sn=Math.sin(ry);obbSolid(x,z,5.2,3.4,ry,2.2);obbSolid(x-1.5*c,z+1.5*sn,1.1,6.7,ry,2.0);
  pool(x,z,4.2,tint?new T.Color(VEH.TINT[tint]):HEX.ora,.5,1.5,ry)}
 // motorcycles: parked nose-out at an angle to the curb, singly or in rows of two or three; alternating black / red
 for(let n=0;BIKES.length<14&&n<900;n++){const r=LAY.roads[(n*3+1)%LAY.roads.length],t0=rr(-r.L/2+10,r.L/2-10),s=n%2?1:-1,cnt=1+(n%3),ang=rr(.55,.9);
  for(let j=0;j<cnt&&BIKES.length<14;j++){const t=t0+j*1.3,sx=-r.d[1]*s,sz=r.d[0]*s,vx=r.d[0]*Math.cos(ang)-sx*Math.sin(ang),vz=r.d[1]*Math.cos(ang)-sz*Math.sin(ang),ry=Math.atan2(-vz,vx),[x,z]=along(r,t,r.W/2-.3-1.05*Math.sin(ang),s);
   if(!footOK(x,z,2.2,.8,ry,r,.35))break;BIKES.push({x,y:0,z,ry,L:2.2,red:BIKES.length%2===1});obbSolid(x,z,2.1,.7,ry,1.0)}}
 S0.add(VEH.ships(SHIPS));S0.add(VEH.motos(BIKES));window.VEHPOS={SHIPS,BIKES};

 // traversal pads: launch from the street onto the sky-bridge roofs, the Spire podium and the transit canopy
 {const roofPt=(sb,p)=>{let best=null,bd=1e9;for(let t=-sb.L/2+5;t<sb.L/2-5;t+=1){const x=sb.c[0]+sb.d[0]*t,z=sb.c[1]+sb.d[1]*t,y=sb.top+5.3;if(sol(x,y+.4,z)||sol(x,y+1.8,z)||!sol(x,y-.2,z))continue;const d=Math.hypot(x-p[0],z-p[1]);if(d<bd){bd=d;best=[x,y,z]}}return best||[p[0],sb.top+5.3,p[1]]};
  const tg=[roofPt(LAY.skybridges[0],LAY.pads[0]),roofPt(LAY.skybridges[1],LAY.pads[1]),[-10,12.8,10.5],[38*MAPK,14,19*MAPK]];
  // find a launch spot 12-18 m away whose whole arc is clear (apex 3 m over the target, edge crossed after the apex region)
  const arcWhy=[];const arcClear=(x,z,tx,ty,tz)=>{const g=26,vy=Math.sqrt(2*g*(ty+PAD_APEX)),tf=vy/g+Math.sqrt(2*PAD_APEX/g);if(!colClear(x,z,1.5)||inRoad(x,z,-1)&&false)return false;
   for(let t=.02;t<tf-.05;t+=.012){const u=t/tf,px=x+(tx-x)*u,pz=z+(tz-z)*u,py=vy*t-13*t*t;for(const h of[-.6,.2,1,2.1])for(const[oa,ob]of[[0,0],[.5,.5],[-.5,-.5],[.5,-.5],[-.5,.5]])if(sol(px+oa,py+h,pz+ob)&&!(t>tf-.12&&h<0)){if(arcWhy.length<40)arcWhy.push([+x.toFixed(0),+z.toFixed(0),+px.toFixed(0),+(py+h).toFixed(0),+pz.toFixed(0)]);return false}}return true};window.ARCWHY=arcWhy;
  for(const[tx,ty,tz]of tg){let done=false;for(const R of[12,14,16,18,22,26,30,34,38,42])for(let k=0;k<16&&!done;k++){const a=k/16*Math.PI*2+.2,x=tx+Math.cos(a)*R,z=tz+Math.sin(a)*R;
    if(Math.abs(x)<BND[1]-3&&Math.abs(z)<BND[3]-3&&!inPlaza(x,z,-8)&&arcClear(x,z,tx,ty,tz)){pad(x,z,tx,ty,tz);done=true}}if(done)continue;
   for(const R of[12,14,16,18])for(let k=0;k<16&&!done;k++){const a=k/16*Math.PI*2+.2,x=tx+Math.cos(a)*R,z=tz+Math.sin(a)*R;if(Math.abs(x)<BND[1]-3&&Math.abs(z)<BND[3]-3&&arcClear(x,z,tx,ty,tz)){pad(x,z,tx,ty,tz);done=true}}}}
 // ---------- mountains and rocks ring the bay (pushed out past the shoreline) ----------
 for(const m of LAY.mountains){const L=Math.hypot(m.c[0],m.c[1])||1,x=m.c[0]+m.c[0]/L*45,z=m.c[1]+m.c[1]/L*45,big=m.h>30;
  kitAt(Math.abs(x)%2<1?'rock_0':'rock_1',x,-4.5,z,cr()*6,m.r*1.1,(big?m.h*1.9:m.h*1.2)+4.5,m.r*1.1)}

 // ---------- billboard projector beams (additive frustums from a head in front of each billboard) ----------
 {const P=[],Cc=[];for(const[bx,by,bz,w,h,ry]of holo){if(by<6||by>80)continue;const nx=Math.sin(ry),nz=Math.cos(ry),tx=Math.cos(ry),tz=-Math.sin(ry);
   const ax=bx+nx*7,az=bz+nz*7,ay=Math.max(1.2,by-h/2-2.5);/* projector on a steel boom cantilevered from the facade: aimed housing, cyan lens and band, twin rails, tie-rod, wall plate */const dyb=by-ay,Lb=Math.hypot(7,dyb),rxb=Math.atan2(-7,dyb),dX=-nx*7/Lb,dY=dyb/Lb,dZ=-nz*7/Lb,lx=ax+dX*.56,ly=ay+dY*.56,lz=az+dZ*.56;for(const s of[-1,1]){box('metal',bx+nx*3.55+tx*s*.17,ay-.04,bz+nz*3.55+tz*s*.17,.13,.13,7.1,0x2c3040,ry);addGeo('glow',G.box,M4(bx+nx*3.55+tx*s*.17,ay-.115,bz+nz*3.55+tz*s*.17,ry,0,0,.04,.02,6.9),HEX.cya)}box('metal',bx+nx*3.5,ay+.95,bz+nz*3.5,.09,.09,Math.hypot(7,1.9),0x2c3040,ry,Math.atan2(1.9,7));box('metal',bx+nx*.08,ay+.6,bz+nz*.08,.8,2.1,.18,0x2c3040,ry);cyl('metal',ax,ay,az,.27,1.1,0x15171e,ry,rxb);addGeo('glow',G.cyl,M4(ax+dX*.12,ay+dY*.12,az+dZ*.12,ry,rxb,0,.285,.05,.285),HEX.cya);addGeo('glow',G.cyl,M4(lx,ly,lz,ry,rxb,0,.21,.02,.21),HEX.cya);
   const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[bx+tx*u*w/2+nx*.1,by+v*h/2,bz+tz*u*w/2+nz*.1]),col=[HEX.cya,HEX.mag,HEX.vio][P.length%3];
   for(let i=0;i<4;i++){const a=c[i],b=c[(i+1)%4];P.push(lx,ly,lz,...a,...b);Cc.push(col.r*.5,col.g*.5,col.b*.5,col.r*.05,col.g*.05,col.b*.05,col.r*.05,col.g*.05,col.b*.05)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(Cc,3));
  const bm=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));bm.renderOrder=4;S0.add(bm)}
 // coloured smog: district-tinted haze layers overhead
 {const[c,g]=cvs(128,128),rg=g.createRadialGradient(64,64,0,64,64,64);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.5,'rgba(255,255,255,.4)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);
  const sm=new T.MeshBasicMaterial({map:ctex(c),vertexColors:true,transparent:true,opacity:.14,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}),P=[],U=[],Cc=[];
  for(const[x,z,s,col,y]of[[-90,-80,170,HEX.mag,70],[90,-80,170,HEX.cya,78],[-90,80,170,HEX.ora,64],[90,80,170,HEX.tea,72],[0,0,150,HEX.vio,96],[-40,-110,120,HEX.mag,44],[110,-30,120,HEX.cya,48],[-110,30,120,HEX.ora,40],[40,110,120,HEX.tea,46]])
   for(const[px,pz,u,v]of[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,-1,0,0],[1,1,1,1],[-1,1,0,1]]){P.push(x+px*s/2,y,z+pz*s/2);U.push(u,v);Cc.push(col.r,col.g,col.b)}
  const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(P,3));g2.setAttribute('uv',new T.Float32BufferAttribute(U,2));g2.setAttribute('color',new T.Float32BufferAttribute(Cc,3));const smog=new T.Mesh(g2,sm);smog.renderOrder=5;S0.add(smog)}
 // sky: gradient dome with painted ridges, moon and clouds
 {const W=2048,H=1024,[c,g]=cvs(W,H);const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#03030c');gr.addColorStop(.45,'#0b0a26');gr.addColorStop(.52,'#2a1450');gr.addColorStop(.56,'#120a2c');gr.addColorStop(1,'#05040e');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){g.fillStyle=`rgba(255,255,255,${cr()*.6})`;g.fillRect(cr()*W,cr()*H*.42,1,1)}
  {g.save();g.globalCompositeOperation='lighter';for(let i=0;i<260;i++){const x=W*.3+i*3.4+rr(-40,40),y=H*.05+i*.9+rr(-30,30),r=rr(18,60),rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,`rgba(${pick(['150,120,220','120,140,230','200,130,200'])},.05)`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,2*r,2*r)}g.restore()}
  for(let k=0;k<3;k++){g.fillStyle=['#0d0b22','#0a0918','#08070f'][k];g.beginPath();g.moveTo(0,H*.56);let y=H*(.5-k*.01);for(let x=0;x<=W;x+=W/60){y=Math.min(H*.555,Math.max(H*(.42+k*.03),y+rr(-18,18)));g.lineTo(x,y)}g.lineTo(W,H*.56);g.fill()}
  for(const[mx,my,mr]of[[W*.36,H*.16,30],[W*.405,H*.2,20]]){const rg=g.createRadialGradient(mx,my,mr*.4,mx,my,mr*5);rg.addColorStop(0,'rgba(220,230,255,.6)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(mx-mr*5,my-mr*5,mr*10,mr*10);
   g.fillStyle='#e8ecff';g.beginPath();g.arc(mx,my,mr,0,Math.PI*2);g.fill();g.fillStyle='#03030c';g.beginPath();g.arc(mx+mr*.45,my-mr*.15,mr*.95,0,Math.PI*2);g.fill()}
  for(let i=0;i<70;i++){const x=cr()*W,y=rr(H*.08,H*.45),w=rr(120,420),h=rr(10,40);const cg=g.createRadialGradient(x,y,0,x,y,w/2);cg.addColorStop(0,`rgba(${pick(['70,50,120','40,40,90','90,40,110'])},${rr(.1,.25)})`);cg.addColorStop(1,'rgba(0,0,0,0)');g.save();g.translate(x,y);g.scale(1,h/w);g.fillStyle=cg;g.fillRect(-w/2,-w/2,w,w);g.restore()}
  const t=ctex(c);const sky=new T.Mesh(new T.SphereGeometry(680,48,24),new T.MeshBasicMaterial({map:t,side:T.BackSide,fog:false,depthWrite:false}));sky.rotation.y=-.6;sky.renderOrder=-10;S0.add(sky);S0.background=new T.Color(0x05040e)}
 const slabAt=null;
 // ---------- structural realism kit (called per building): corner columns, pilasters, slab ledges, bracing, conduits, rooftop plant, ladders, rust runs ----------
 function struct(x0,x1,z0,z1,h,kind,o){const cx=(x0+x1)/2,cz=(z0+z1)/2,dist=Math.hypot(cx,cz),near=dist<105&&h<120,y0=o.shops?4.6:0,W=x1-x0,D=z1-z0;
  const STEEL=0x1d1c23,CONC=0x2b2a30,PIPE=0x3b3632;
  for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])box('metal',x,h/2,z,.62,h+.2,.62,STEEL);                                   // corner columns
  if(!near)return;
  const sides=[[x0,z1+.16,x1,z1+.16,0],[x0,z0-.16,x1,z0-.16,0],[x1+.16,z0,x1+.16,z1,1],[x0-.16,z0,x0-.16,z1,1]];
  const bay=kind==='com'?4:5.5;
  for(const[ax,az,bx,bz,vert]of sides){const L=vert?bz-az:bx-ax;
   for(let t=bay;t<L-1;t+=bay){const x=vert?ax:ax+t,z=vert?az+t:az;box('metal',x,(y0+h)/2,z,vert?.26:.2,h-y0,vert?.2:.26,kind==='com'?0x232634:STEEL)}   // pilasters / mullion fins
   if(kind!=='com'&&h<80)for(let y=y0+4.4;y<h-1;y+=4.4)box('roof',vert?ax:(ax+bx)/2,y,vert?(az+bz)/2:az,vert?.42:L+.5,.2,vert?L+.5:.42,CONC);   // floor-slab ledges
   if(kind==='ind'){for(let t=0;t<L-6;t+=8){const x=vert?ax:ax+t+4,z=vert?az+t+4:az,ln=Math.hypot(8,Math.min(8,h-y0-1));                           // X-bracing
     for(const s of[-1,1])box('metal',x,y0+4.5,z,vert?.16:ln,.18,vert?ln:.16,0x2c2a26,vert?0:0,vert?s*.78:0,vert?0:s*.78)}}}
  // exposed utility conduits running down one or two faces, with brackets and a horizontal feeder
  const np=1+(cr()<.5?1:0);for(let i=0;i<np;i++){const sd=sides[(cr()*4)|0],vert=sd[4],t=rr(1.2,(vert?D:W)-1.2),x=vert?sd[0]+.12:sd[0]+t,z=vert?sd[1]+t:sd[1]+(sd[1]>cz?.12:-.12);
   for(let k=0;k<2;k++){const ox=vert?0:k*.32,oz=vert?k*.32:0;cyl('metal',x+ox,h/2,z+oz,.09+k*.03,h,PIPE,0,0,0,1);for(let y=2;y<h;y+=3)box('metal',x+ox,y,z+oz,.32,.08,.32,0x18171c)}}
  // rooftop plant: HVAC housings with fan shrouds, exhaust stacks, a mast with an aircraft warning light
  const nh=1+(cr()*3|0);for(let i=0;i<nh;i++){const hx=rr(x0+2,x1-2),hz=rr(z0+2,z1-2);box('metal',hx,h+.7,hz,2.2,1.4,1.6,0x34343a);roofMass(hx-1.1,hx+1.1,hz-.8,hz+.8,h+1.45);cyl('roof',hx,h+1.45,hz,.62,.12,0x101014,0,0,0,1);box('metal',hx,h+1.42,hz,1.25,.04,.04,0x55555c)}
  if(cr()<.6){const sx=rr(x0+1.5,x1-1.5),sz=rr(z0+1.5,z1-1.5);cyl('metal',sx,h+2,sz,.35,4,0x2a2626,0,0,0,1);roofMass(sx-.35,sx+.35,sz-.35,sz+.35,h+4)}
  if(cr()<.45){const mx=rr(x0+2,x1-2),mz=rr(z0+2,z1-2),mh=rr(6,14);cyl('metal',mx,h+mh/2,mz,.08,mh,0x3a3a40,0,0,0,1);box('glow',mx,h+mh+.12,mz,.22,.22,.22,new T.Color(0xff2030))}
  // access ladder on a quiet side of residential / industrial blocks
  if(kind!=='com'&&cr()<.6){const sd=sides.find((s,i)=>!(o.shops&&(i===0?o.shops.s:i===1?o.shops.n:i===2?o.shops.e:o.shops.w)))||sides[1];const vert=sd[4],t=rr(1.5,(vert?D:W)-1.5),lx=vert?sd[0]+.05:sd[0]+t,lz=vert?sd[1]+t:sd[1],top=Math.min(h,14);
   for(const s of[-.24,.24])box('metal',lx+(vert?0:s),top/2+.4,lz+(vert?s:0),.06,top,.06,0x4a4a50);for(let y=.9;y<top;y+=.42)box('metal',lx,y,lz,vert?.06:.5,.04,vert?.5:.06,0x55555c)}
  // rust runs bleeding down from ledges and bolts
  const nr=kind==='ind'?6:kind==='res'?4:1;for(let i=0;i<nr;i++){const sd=sides[(cr()*4)|0],vert=sd[4],t=rr(1,(vert?D:W)-1),y=rr(y0+4,Math.min(h-2,40)),x=vert?sd[0]+.03*(sd[0]>cx?1:-1):sd[0]+t,z=vert?sd[1]+t:sd[1]+.03*(sd[1]>cz?1:-1);
   const ry=vert?(sd[0]>cx?Math.PI/2:-Math.PI/2):(sd[1]>cz?0:Math.PI);quad('rust',x,y-1.8,z,rr(.8,2.2),rr(3,6),ry,null)}}
 // ---------- streetscape: furniture, trash, drains, steam vents, puddles, light cones; megastructures, sky-bridges and aerial traffic ----------
 function streetscape(){const BENCH=0x2c2a30,BAG=0x0e0e12;
  G.bag=G.bag||(()=>{const g=new T.IcosahedronGeometry(1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*(.85+cr()*.3),p.getY(i)*(.7+cr()*.25),p.getZ(i)*(.85+cr()*.3));g.computeVertexNormals();return g})();
  const bench=(x,z,ry)=>{box('metal',x,.45,z,1.8,.08,.5,BENCH,ry);box('metal',x+Math.sin(ry)*-.22,.75,z+Math.cos(ry)*-.22,1.8,.42,.06,BENCH,ry);for(const s of[-.75,.75])box('metal',x+Math.cos(ry)*s,.22,z-Math.sin(ry)*s,.08,.44,.45,0x18171c,ry)};
  const bag=(x,z)=>{const s=rr(.28,.45);addGeo('roof',G.bag,M4(x,s*.7,z,cr()*6,0,0,s,s*.85,s),BAG)};
  const litter=(x,z)=>{for(let i=0;i<4;i++)box('roof',x+rr(-.8,.8),.012,z+rr(-.8,.8),rr(.12,.3),.01,rr(.08,.22),pick([0x6a6a70,0x8a7a5a,0x3a4a6a,0x7a3040]),cr()*6)};
  const OK=(x,z)=>!sol(x,.5,z)&&!sol(x,1.2,z)&&!inPlaza(x,z,-2);
  for(const r of LAY.roads){const[dx,dz]=r.d,sx=-dz,sz=dx,ry=RYd(r.d);
   for(let t=-r.L/2+9;t<r.L/2;t+=17)for(const s of[-1,1]){const bx=r.c[0]+dx*t+sx*s*(r.W/2+2.6),bz=r.c[1]+dz*t+sz*s*(r.W/2+2.6);
    if(OK(bx,bz)&&!inRoad(bx,bz,-.3))bench(bx,bz,ry+(s>0?-Math.PI/2:Math.PI/2));
    const gx=r.c[0]+dx*(t+6)+sx*s*(r.W/2-.35),gz=r.c[1]+dz*(t+6)+sz*s*(r.W/2-.35);if(!inPlaza(gx,gz)){box('roof',gx,.03,gz,.5,.05,.9,0x0a0a0c,ry);for(let k=0;k<5;k++)box('metal',gx,.06,gz+(k-2)*.18,.46,.02,.03,0x2a2a30,ry)}}}
  for(let i=0;i<420;i++){const x=rr(BND[0]+4,BND[1]-4),z=rr(BND[2]+4,BND[3]-4);if(!OK(x,z))continue;if(inRoad(x,z,-1)&&cr()<.7)continue;
   if(cr()<.55){bag(x,z);if(cr()<.6)bag(x+rr(-.5,.5),z+rr(-.5,.5))}else litter(x,z)}
  const vents=[];for(let i=0;i<60&&vents.length<22;i++){const x=rr(BND[0]+10,BND[1]-10),z=rr(BND[2]+10,BND[3]-10);if(!OK(x,z)||!OK(x+1,z+1)||Math.hypot(x,z)<38)continue;box('roof',x,.03,z,1.2,.06,1.2,0x0b0b0e);for(let k=0;k<6;k++)box('metal',x-.5+k*.2,.065,z,.04,.02,1.1,0x30303a);vents.push([x,z])}
  return vents}
 function megastructures(){const grp=new T.Group(),mtex=(()=>{const N=256,[c,g]=cvs(N,N*2);g.fillStyle='#070a16';g.fillRect(0,0,N,N*2);
   for(let y=0;y<N*2;y+=6)for(let x=0;x<N;x+=5){const r=cr();g.fillStyle=r<.18?pick(['#9fdcff','#ffd38a','#c8a2ff','#7fd1ff']):r<.22?PAL.mag:'#0d1226';g.globalAlpha=r<.22?.85:1;g.fillRect(x,y,3,3)}g.globalAlpha=1;
   for(let y=0;y<N*2;y+=48){g.fillStyle='rgba(120,200,255,.5)';g.fillRect(0,y,N,1)}const t=ctex(c,1);return t})();
  const haze=new T.Color(0x2a3060);
  const T_=[[-250,-210,420,40],[200,-280,520,46],[-310,80,360,34],[50,-340,470,52],[290,160,330,30]];
  const tops=[];for(const[x,z,H,W]of T_){let y=0,w=W,i=0;while(y<H-10){const sh=Math.min(H-y,rr(70,140)),geo=new T.BoxGeometry(w,sh,w*rr(.7,1));const tx=mtex.clone();tx.needsUpdate=true;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(w/30,sh/60);
    const m=new T.Mesh(geo,new T.MeshBasicMaterial({map:tx,color:new T.Color(1,1,1).lerp(haze,.35+.25*(Math.hypot(x,z)/450)),fog:false}));m.position.set(x,y+sh/2,z);grp.add(m);
    const rim=new T.Mesh(new T.BoxGeometry(w+1.4,1.2,w*1.0+1.4),new T.MeshBasicMaterial({color:new T.Color(pick([0x21e6ff,0xff2bd6,0x8a3bff,0xffb04a])).multiplyScalar(.9),fog:false}));rim.position.set(x,y+sh,z);grp.add(rim);
    y+=sh;w*=rr(.68,.86);i++}
   const sp=new T.Mesh(new T.CylinderGeometry(.6,2.2,60,8),new T.MeshBasicMaterial({color:0x1a1c2a,fog:false}));sp.position.set(x,y+30,z);grp.add(sp);
   const ring=new T.Mesh(new T.TorusGeometry(w*.9,.8,6,40),new T.MeshBasicMaterial({color:new T.Color(0x21e6ff).multiplyScalar(1.2),fog:false,toneMapped:false}));ring.rotation.x=Math.PI/2;ring.position.set(x,y+4,z);grp.add(ring);
   const red=new T.Mesh(new T.SphereGeometry(1.4,8,6),new T.MeshBasicMaterial({color:0xff2030,fog:false}));red.position.set(x,y+61,z);grp.add(red);tops.push({x,z,H,red})}
  // sky-bridges between neighbouring megastructures (two decks each) with lit undersides
  for(const[a,b]of[[0,3],[3,1],[0,2]]){const A=T_[a],Bt=T_[b];for(const hy of[.38,.62]){const y=Math.min(A[2],Bt[2])*hy,dx=Bt[0]-A[0],dz=Bt[1]-A[1],L=Math.hypot(dx,dz);
    const br=new T.Mesh(new T.BoxGeometry(6,4,L),new T.MeshBasicMaterial({color:0x10131f,fog:false}));br.position.set((A[0]+Bt[0])/2,y,(A[1]+Bt[1])/2);br.rotation.y=Math.atan2(dx,dz);grp.add(br);
    const ls=new T.Mesh(new T.BoxGeometry(6.2,.5,L),new T.MeshBasicMaterial({color:new T.Color(0xffc070).multiplyScalar(.8),fog:false}));ls.position.copy(br.position);ls.position.y-=2;ls.rotation.y=br.rotation.y;grp.add(ls)}}
  S0.add(grp);return tops}
 // oil-slick puddles on the asphalt: dark glossy film with thin-film iridescence and neon glints, irregular edges
 function puddles(){const P=[],U=[],S_=[];for(let i=0;i<160;i++){const rd=LAY.roads[i%LAY.roads.length],t=rr(-rd.L/2,rd.L/2),o=rr(-rd.W/2-3,rd.W/2+3);let x=rd.c[0]+rd.d[0]*t-rd.d[1]*o,z=rd.c[1]+rd.d[1]*t+rd.d[0]*o;if(inPlaza(x,z,-3)&&cr()<.6||sol(x,.3,z))continue;
   const r=rr(.8,2.6),sx=r*rr(.8,1.6),ry=cr()*6.28,sd=cr()*100,m=M4(x,.05,z,ry,0,0,sx,1,r);
   for(const[px,pz,u,v]of[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,-1,0,0],[1,1,1,1],[-1,1,0,1]]){_v.set(px,0,pz).applyMatrix4(m);P.push(_v.x,_v.y,_v.z);U.push(u,v);S_.push(sd)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setAttribute('seed',new T.Float32BufferAttribute(S_,1));
  const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uT:{value:0}},
   vertexShader:'attribute float seed;varying vec2 vU;varying float vS;varying vec3 vW;void main(){vU=uv;vS=seed;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
   fragmentShader:`uniform float uT;varying vec2 vU;varying float vS;varying vec3 vW;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){return .5*n(p)+.25*n(p*2.1)+.125*n(p*4.3);}
void main(){vec2 q=vU*2.-1.;float d=length(q)+ .35*(fb(q*2.2+vS)-.5);float m=smoothstep(.95,.7,d);if(m<.01)discard;
 vec3 v=normalize(cameraPosition-vW);float fr=pow(1.-max(v.y,0.),3.);
 float th=fb(vW.xz*.9+vS)*2.+fb(vW.xz*3.1-uT*.02)*.6;vec3 iri=.5+.5*cos(6.2831*(th+vec3(0.,.33,.67)));
 vec3 refl=mix(vec3(.03,.02,.07),vec3(.35,.12,.55),fr)+vec3(.1,.5,.7)*pow(fb(vW.xz*.15+vec2(uT*.01,0.)),3.)*fr*1.6;
 vec3 c=refl+iri*.10*smoothstep(.2,.8,fb(vW.xz*1.7+vS))*(.4+fr);gl_FragColor=vec4(c,m*(.55+.4*fr));}`});
  const mesh=new T.Mesh(g,mat);mesh.renderOrder=1;S0.add(mesh);return mat}
 // volumetric light cones: neon from the shop signs bleeding down through the haze to the wet street
 function lightCones(){const[c,g]=cvs(32,128),gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,128);const t=ctex(c);
  const geo=new T.CylinderGeometry(.35,2.4,5.4,18,1,true);geo.translate(0,-2.7,0);let n=0;const grp=new T.Group();
  for(const[x,z,r,col,a]of pools){if(a<.5||n>70||cr()<.4)continue;n++;const m=new T.Mesh(geo,new T.MeshBasicMaterial({map:t,color:col.clone().multiplyScalar(.28),transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));m.position.set(x,5.5,z);grp.add(m)}
  S0.add(grp)}
 const VENTS=streetscape();
 // ---------- build merged meshes ----------
 const FAC={facR:facade('res'),facC:facade('com'),facI:facade('ind')},SH=shopfronts();
 const mats={
  facR:new T.MeshStandardMaterial({map:FAC.facR.map,emissive:0xffffff,emissiveMap:FAC.facR.emi,emissiveIntensity:1.15,roughness:.75,metalness:.25}),
  facC:new T.MeshStandardMaterial({map:FAC.facC.map,emissive:0xffffff,emissiveMap:FAC.facC.emi,emissiveIntensity:1.1,roughness:.3,metalness:.6}),
  facI:new T.MeshStandardMaterial({map:FAC.facI.map,emissive:0xffffff,emissiveMap:FAC.facI.emi,emissiveIntensity:1,roughness:.85,metalness:.2}),
  shop:new T.MeshStandardMaterial({map:SH.map,emissive:0xffffff,emissiveMap:SH.emi,emissiveIntensity:1.2,roughness:.4,metalness:.3}),
  roof:new T.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:.2}),
  metal:new T.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.55}),
  glow:new T.MeshBasicMaterial({vertexColors:true}),
  sign:new T.MeshBasicMaterial({map:SA.tex,transparent:true,side:T.DoubleSide,depthWrite:false}),
  strobe:new T.MeshBasicMaterial({vertexColors:true}),
  rust:new T.MeshStandardMaterial({map:(()=>{const[c,g]=cvs(64,256);for(let i=0;i<9;i++){const x=6+cr()*52,w=2+cr()*6,L=80+cr()*170,lg=g.createLinearGradient(0,0,0,L);lg.addColorStop(0,'rgba(150,66,22,.85)');lg.addColorStop(.35,'rgba(120,52,20,.5)');lg.addColorStop(1,'rgba(90,40,18,0)');g.fillStyle=lg;g.fillRect(x,0,w,L)}const gg=g.createLinearGradient(0,0,0,256);gg.addColorStop(0,'rgba(20,14,10,.4)');gg.addColorStop(1,'rgba(20,14,10,0)');g.fillStyle=gg;g.fillRect(0,0,64,256);return ctex(c)})(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,roughness:.9,metalness:.3}),
  awn:new T.MeshStandardMaterial({map:awningTex(),emissive:0xffffff,emissiveIntensity:.28,side:T.DoubleSide,roughness:.8}),
 };mats.awn.emissiveMap=mats.awn.map;
 for(const k in BK){const b=BK[k];if(!b.p.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.u,2));g.setAttribute('color',new T.Float32BufferAttribute(b.c,3));g.computeBoundingSphere();
  const m=new T.Mesh(g,mats[k]);m.matrixAutoUpdate=false;if(k==='sign')m.renderOrder=2;S0.add(m)}
 {const g=walkG.map(x=>x.toNonIndexed()),P=[],N=[],U=[];for(const x of g){P.push(...x.attributes.position.array);N.push(...x.attributes.normal.array);U.push(...x.attributes.uv.array)}
  const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(P,3));wg.setAttribute('normal',new T.Float32BufferAttribute(N,3));wg.setAttribute('uv',new T.Float32BufferAttribute(U,2));const wm=new T.Mesh(wg,walkM);wm.matrixAutoUpdate=false;S0.add(wm)}
 // ---------- Godot kit: decode the quantised meshes and draw every placement as an InstancedMesh per material bucket ----------
 mats.chrome=new T.MeshStandardMaterial({vertexColors:true,roughness:.3,metalness:.85});
 mats.glass=new T.MeshStandardMaterial({vertexColors:true,roughness:.06,metalness:.9,transparent:true,opacity:.32,depthWrite:false});
 const KG={};const kitGeo=name=>{if(KG[name])return KG[name];const K=NCC_KIT[name],out={};
  for(const bk in K.b){const[nv,ni,big,b64]=K.b[bk],bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;let o=0;
   const q=new Int16Array(bin,o,nv*3);o+=nv*6;o+=(4-o%4)%4;const n=new Int8Array(bin,o,nv*3);o+=nv*3;o+=(4-o%4)%4;const c=new Uint8Array(bin,o,nv*3);o+=nv*3;o+=(4-o%4)%4;
   const ix=big?new Uint32Array(bin.slice(o,o+ni*4)):new Uint16Array(bin.slice(o,o+ni*2));
   const P=new Float32Array(nv*3),N=new Float32Array(nv*3),Cc=new Float32Array(nv*3);
   for(let i=0;i<nv*3;i++){P[i]=q[i]*K.s+K.o[i%3];N[i]=n[i]/127;Cc[i]=c[i]/255*1.25}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setAttribute('color',new T.BufferAttribute(Cc,3));g.setIndex(new T.BufferAttribute(ix,1));g.computeBoundingSphere();out[bk]=g}
  return KG[name]=out};
 for(const name in KI){const geos=kitGeo(name),list=KI[name];
  if(name==='crown_a'||name==='crown_b')RMQ.push(()=>{const A_=new T.Vector3(),B_=new T.Vector3(),C_=new T.Vector3();for(const m of list)for(const bk in geos){const g=geos[bk],p=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:p.count;
    for(let i=0;i+2<n;i+=3){A_.fromBufferAttribute(p,ix?ix[i]:i).applyMatrix4(m);B_.fromBufferAttribute(p,ix?ix[i+1]:i+1).applyMatrix4(m);C_.fromBufferAttribute(p,ix?ix[i+2]:i+2).applyMatrix4(m);
     const st=Math.max(1,Math.ceil(Math.max(A_.distanceTo(B_),B_.distanceTo(C_),C_.distanceTo(A_))/.5));for(let u=0;u<=st;u++)for(let w=0;w<=st-u;w++){const a_=u/st,b_=w/st,c_=1-a_-b_,x=A_.x*a_+B_.x*b_+C_.x*c_,y=A_.y*a_+B_.y*b_+C_.y*c_,z=A_.z*a_+B_.z*b_+C_.z*c_,k=ci(x,z);if(k>=0&&y>SG[k]&&y-SG[k]<40)SG[k]=y}}}})
  for(const bk in geos){const im=new T.InstancedMesh(geos[bk],mats[bk==='glass'?'glass':bk],list.length);list.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;if(bk==='glass')im.renderOrder=2;if(name==='skybridge'&&bk==='glass')im.visible=false;S0.add(im)}}
 const FLY=[];
 // gravity-lift beams: additive cylinders with a scrolling scan pattern
 const beamM=(()=>{const[c,g]=cvs(32,256);for(let y=0;y<256;y+=16){const gr=g.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,'rgba(120,240,255,.0)');gr.addColorStop(.5,'rgba(120,240,255,.55)');gr.addColorStop(1,'rgba(120,240,255,0)');g.fillStyle=gr;g.fillRect(0,y,32,16)}
  const t=ctex(c,1);return new T.MeshBasicMaterial({map:t,color:0x21e6ff,transparent:true,opacity:.42,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})})();
 for(const[x,z,top]of beams){const g=new T.CylinderGeometry(1.35,1.35,top,24,1,true);g.translate(0,top/2,0);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setY(i,u.getY(i)*top/6);const m=new T.Mesh(g,beamM);m.position.set(x,0,z);m.renderOrder=3;S0.add(m)}
 const liftAt=(x,y,z)=>{for(const[lx,lz,top]of LIFTS)if((x-lx)*(x-lx)+(z-lz)*(z-lz)<1.9&&y<top+.2&&y>-.5)return top;return -1};
 const padAt=(x,y,z)=>{const gr=y<=.8+hAt(x,z);for(const p of PADS){if((x-p[0])*(x-p[0])+(z-p[1])*(z-p[1])>=3.2)continue;if(p[5]!=null?(y>p[5]-.3&&y<p[5]+.8):gr)return p}return null};
 // fit the light pools to open ground
 {const free=(x,z)=>hAt(x,z)<.6;for(let i=pools.length-1;i>=0;i--){const q=pools[i];if(!free(q[0],q[1])){pools.splice(i,1);continue}
   let r=q[2];for(;r>1.5;r*=.85){let ok=0;for(let k=0;k<12;k++){const a=k/12*6.283;if(free(q[0]+Math.cos(a)*r*.8,q[1]+Math.sin(a)*r*.8))ok++}if(ok>=11)break}q[2]=r}}
 // wet-ground light pools + reflection streaks: one additive mesh
 {const[c,g]=cvs(128,128),rg=g.createRadialGradient(64,64,0,64,64,64);rg.addColorStop(0,'rgba(255,255,255,.9)');rg.addColorStop(.35,'rgba(255,255,255,.35)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);
  const P=[],U=[],Cc=[];for(const[x,z,r,col,a,st,ry]of pools){const m=M4(x,.045,z,ry||0,0,0,r,1,r*(st||1));const q=[[-1,0,-1,0,0],[1,0,-1,1,0],[1,0,1,1,1],[-1,0,-1,0,0],[1,0,1,1,1],[-1,0,1,0,1]];
   for(const[px,py,pz,u,v]of q){_v.set(px,py,pz).applyMatrix4(m);P.push(_v.x,_v.y,_v.z);U.push(u,v);Cc.push(col.r*a,col.g*a,col.b*a)}}
  const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(P,3));g2.setAttribute('uv',new T.Float32BufferAttribute(U,2));g2.setAttribute('color',new T.Float32BufferAttribute(Cc,3));
  const pm=new T.Mesh(g2,new T.MeshBasicMaterial({map:ctex(c),vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));pm.renderOrder=1;S0.add(pm)}
 // holographic scanline sheen over billboards (animated)
 const holoM=(()=>{const[c,g]=cvs(64,256);for(let y=0;y<256;y+=4){g.fillStyle=`rgba(160,220,255,${y%16?.05:.22})`;g.fillRect(0,y,64,2)}const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(180,240,255,.25)');gr.addColorStop(.56,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,256);
  const t=ctex(c,1);return new T.MeshBasicMaterial({map:t,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})})();
 {const P=[],U=[];for(const[x,y,z,w,h,ry]of holo){const m=M4(x+Math.sin(ry)*.06,y,z+Math.cos(ry)*.06,ry,0,0,w,h,1);for(const[px,py,u,v]of[[-.5,-.5,0,0],[.5,-.5,1,0],[.5,.5,1,1],[-.5,-.5,0,0],[.5,.5,1,1],[-.5,.5,0,1]]){_v.set(px,py,0).applyMatrix4(m);P.push(_v.x,_v.y,_v.z);U.push(u,v*h/10)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));const hm=new T.Mesh(g,holoM);hm.renderOrder=3;S0.add(hm)}
 // lighting: dim moonlit hemisphere + district colour lights
 S0.add(new T.HemisphereLight(0x5a5cc8,0x140a24,.62));{const mo=new T.DirectionalLight(0xa8b4ff,.95),dir=new T.Vector3(40,80,-60).normalize();mo.position.copy(dir).multiplyScalar(260);mo.target.position.set(0,0,0);S0.add(mo,mo.target);
  mo.castShadow=true;const sz=LOWSPEC?1024:2048,sc=mo.shadow.camera;mo.shadow.mapSize.set(sz,sz);sc.left=-175;sc.right=175;sc.top=175;sc.bottom=-175;sc.near=20;sc.far=560;sc.updateProjectionMatrix();mo.shadow.bias=-.0004;mo.shadow.normalBias=.06;mo.shadow.radius=2.5}
 [[0xff2bd6,-90,16,-80],[0x21e6ff,90,18,-80],[0xff9a3c,-90,14,80],[0x14b8a6,90,14,80],[0x8a3bff,0,30,0],[0x21e6ff,53,10,27],[0xff2bd6,-45,52,-77]].forEach(([c,x,y,z])=>{x*=MAPK;z*=MAPK;y=Math.max(y,hAt(x,z)+8);while(sol(x,y,z)&&y<240)y+=2;const l=new T.PointLight(c,2.6,150);l.position.set(x,y,z);S0.add(l)});
 S0.fog=new T.FogExp2(0x0c0a24,.0052);
 const MEGA=megastructures(),TRAF={update(){}},PUD=puddles();lightCones();
 const STEAM=(()=>{const[c,g]=cvs(64,64);for(let i=0;i<14;i++){const x=32+(cr()-.5)*26,y=32+(cr()-.5)*26,r=10+cr()*14,rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(255,255,255,.28)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,64,64)}const t=ctex(c);
  const out=[];for(const[x,z]of VENTS)for(let k=0;k<6;k++){const sp=new T.Sprite(new T.SpriteMaterial({map:t,color:0x9aa4c8,transparent:true,depthWrite:false,opacity:0}));sp.position.set(x,.2,z);S0.add(sp);out.push({sp,x,z,ph:k/6})}return out})();

 function update(dt,now,cam){const t=now/1000;stepDoors(Math.min(.05,dt||.016));
  mats.strobe.color.setScalar(Math.sin(t*7)>.2?1:.12);
  halo.forEach((h,i)=>h.rotation.z+=dt*(i%2?-.25:.35));beacon.material.color.setHex(Math.sin(t*3)>.6?0xff3355:0x3a0a14);
  TRAF.update(dt);PUD.uniforms.uT.value=t;MEGA.forEach((m,i)=>m.red.visible=Math.sin(t*2.2+i)>.3);
  for(const s of STEAM){const u=(t*.22+s.ph)%1;s.sp.position.set(s.x+Math.sin(t*.7+s.ph*9)*.4*u,.2+u*5.5,s.z+u*.6);s.sp.scale.setScalar(.6+u*3.4);s.sp.material.opacity=.42*Math.sin(Math.PI*u)}
  holoM.map.offset.y=-(t*.18%1);water.t.offset.x=(t*.006)%1;water.t.offset.y=(t*.004)%1;
  beamM.map.offset.y=-(t*.6%1);
  for(const f of FLY){f.list.forEach((q,i)=>{q.a+=q.s*dt;const x=q.cx+Math.cos(q.a)*q.r,z=q.cz+Math.sin(q.a)*q.r,y=q.y+Math.sin(q.a*3+i)*1.2;_m4.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(0,Math.atan2(-Math.sin(q.a)*Math.sign(q.s),Math.cos(q.a)*Math.sign(q.s)),Math.sin(q.a*2)*.06)),_s1);for(const im of f.ims)im.setMatrixAt(i,_m4)});for(const im of f.ims)im.instanceMatrix.needsUpdate=true}
  }
 const _m4=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_s1=new T.Vector3(1,1,1);
 // sky-bridge corridors: rebuild the collision so the inside is walkable (deck below, roof above, glass walls at the sides);
 // overlapping slabs used to fill the corridor solid, which made the bridges impossible to enter
 for(const sbr of LAY.skybridges){const[dx,dz]=sbr.d,sx=-dz,sz=dx,top=sbr.top,wall=new Set();GLASS.forEach(g=>{if(Math.abs(g.userData.glass.top-top)<.01)g.userData.glass.cells.forEach(i=>wall.add(i))});
  const done=new Set();for(let t=-sbr.L/2;t<=sbr.L/2;t+=.4)for(let o=-3.75;o<=3.75;o+=.4){const i=ci(sbr.c[0]+dx*t+sx*o,sbr.c[1]+dz*t+sz*o);if(i<0||done.has(i))continue;done.add(i);if(SG[i]>=top-.6)continue;
   if(wall.has(i)){SB[i]=top-.6;ST[i]=top+5.3;SB2[i]=0;ST2[i]=0}else{SB[i]=top-.6;ST[i]=top;SB2[i]=top+4.8;ST2[i]=top+5.3}}}
 // sky-bridge walkways THROUGH buildings: where a corridor runs into a tower, carve a walkable passage (floor at deck height,
 // building solid above the ceiling and beside the walls), line it with a lit interior, and mark each facade entry with a doorway
 // ---- sky-bridge lobbies: futuristic lofts where the corridors cross buildings - polished floor, exposed beams, panoramic
 //      city windows, light slots, steel columns, a lounge, planters, a holo-table and (when tall enough) a glass-railed mezzanine
 const LBG={},lbAdd=(k,g,m)=>{const q=(g.index?g.toNonIndexed():g.clone());q.applyMatrix4(m);(LBG[k]=LBG[k]||[]).push(q)};
 const viewTex=(()=>{const[c,g]=cvs(512,256),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#090620');gr.addColorStop(.55,'#2a1150');gr.addColorStop(1,'#5a1a6a');g.fillStyle=gr;g.fillRect(0,0,512,256);
   for(let i=0;i<40;i++){const w=8+Math.random()*30,h=40+Math.random()*170,x=Math.random()*512;g.fillStyle=`rgb(${8+Math.random()*14|0},${6+Math.random()*10|0},${20+Math.random()*24|0})`;g.fillRect(x,256-h,w,h);
    for(let yy=256-h+4;yy<252;yy+=6)for(let xx=x+2;xx<x+w-2;xx+=4)if(Math.random()<.35){g.fillStyle=pick(['#ff2bd6','#21e6ff','#ffd08a','#8a7bff','#ffffff']);g.globalAlpha=.4+Math.random()*.5;g.fillRect(xx,yy,2,3);g.globalAlpha=1}}
   g.fillStyle='rgba(180,220,255,.06)';for(let x=0;x<512;x+=3)g.fillRect(x,0,1,256);const t=ctex(c,1);t.wrapS=T.RepeatWrapping;return t})();
 const LBM={floor:new T.MeshStandardMaterial({color:0x1a1822,metalness:.35,roughness:.12}),wall:new T.MeshStandardMaterial({color:0x3a3a44,metalness:.15,roughness:.7,emissive:0x0a0a12}),
  beam:new T.MeshStandardMaterial({color:0x5a4030,metalness:.1,roughness:.55,emissive:0x120a06}),steel:new T.MeshStandardMaterial({color:0x2a2d36,metalness:.85,roughness:.3}),
  sofa:new T.MeshStandardMaterial({color:0x2b2440,metalness:.05,roughness:.85,emissive:0x07050c}),plant:new T.MeshStandardMaterial({color:0x1f6a3e,roughness:.8,emissive:0x061a0e}),
  view:new T.MeshBasicMaterial({map:viewTex,color:0xbfc8ff,toneMapped:false}),warm:new T.MeshBasicMaterial({color:0xffe0b8,toneMapped:false}),cyan:new T.MeshBasicMaterial({color:0x21e6ff,toneMapped:false}),
  mag:new T.MeshBasicMaterial({color:0xff2bd6,toneMapped:false}),glass:new T.MeshPhysicalMaterial({color:0x9fdcff,transparent:true,opacity:.22,roughness:.05,metalness:0,depthWrite:false,side:T.DoubleSide}),
  holo:new T.MeshBasicMaterial({color:0x21e6ff,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false})};
 // furniture/partition mass: mark the grid cells whose centres fall inside a rotated footprint as solid up to top+h
 function FMASS(cx,cz,ry,top,x,z,w,d,h){const c=Math.cos(ry),s_=Math.sin(ry),wx=cx+x*c+z*s_,wz=cz-x*s_+z*c,r=Math.hypot(w,d)/2+1;
  for(let gx=Math.floor(wx-r);gx<=Math.ceil(wx+r);gx++)for(let gz=Math.floor(wz-r);gz<=Math.ceil(wz+r);gz++){const k=ci(gx,gz);if(k<0)continue;const dx_=gx+.5-wx,dz_=gz+.5-wz,lo=dx_*c-dz_*s_,lq=dx_*s_+dz_*c;
   if(Math.abs(lo)<=w/2+.15&&Math.abs(lq)<=d/2+.15)SG[k]=Math.max(SG[k],top+h)}}
 LBM.dwall=(()=>{const[c,g]=cvs(256,256);g.fillStyle='#2b2d36';g.fillRect(0,0,256,256);
   for(let i=0;i<4;i++){const x=i*64;const gr=g.createLinearGradient(x,0,x+64,0);gr.addColorStop(0,'#33353f');gr.addColorStop(.5,'#2a2c35');gr.addColorStop(1,'#25272f');g.fillStyle=gr;g.fillRect(x+2,0,60,256);g.fillStyle='#14151b';g.fillRect(x,0,2,256)}
   g.fillStyle='#14151b';g.fillRect(0,126,256,3);for(let i=0;i<4;i++)for(const y of[20,236])for(const x of[10,54]){g.fillStyle='#4a4d58';g.beginPath();g.arc(i*64+x,y,2.2,0,7);g.fill()}
   const t=ctex(c,1);t.wrapS=t.wrapT=T.RepeatWrapping;return new T.MeshStandardMaterial({map:t,metalness:.45,roughness:.5,emissive:0x07070c})})();
 LBM.sign=(()=>{const[c,g]=cvs(512,96);g.fillStyle='#05060c';g.fillRect(0,0,512,96);g.strokeStyle='#21e6ff';g.lineWidth=3;g.strokeRect(4,4,504,88);
   g.font='800 46px "Orbitron",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#bff6ff';g.shadowColor='#21e6ff';g.shadowBlur=16;g.fillText('SKYWALK  ◂ ▸',256,50);
   return new T.MeshBasicMaterial({map:ctex(c,1),toneMapped:false})})();
 LBM.screen=(()=>{const[c,g]=cvs(256,160);const gr=g.createLinearGradient(0,0,256,160);gr.addColorStop(0,'#1a0838');gr.addColorStop(1,'#04203a');g.fillStyle=gr;g.fillRect(0,0,256,160);
   g.strokeStyle='rgba(33,230,255,.7)';g.lineWidth=2;g.beginPath();for(let x=0;x<=256;x+=8)g.lineTo(x,100-Math.sin(x*.05)*22-Math.random()*14);g.stroke();
   g.fillStyle='#ff2bd6';g.font='700 18px Arial';g.fillText('NEON CORE TRANSIT',12,28);g.fillStyle='#bff6ff';g.font='12px Arial';g.fillText('SKYWALK STATUS  ●  ONLINE',12,50);
   for(let i=0;i<6;i++){g.fillStyle=i%2?'#21e6ff':'#ff2bd6';g.fillRect(14+i*38,128,26,18-i*2)}return new T.MeshBasicMaterial({map:ctex(c,1),toneMapped:false})})();
 // tiled box helper: UVs scaled to metres so panelled textures keep their size
 const tileBox=(w,h,d,sc=2)=>{const g=new T.BoxGeometry(w,h,d),uv=g.attributes.uv,n=g.attributes.normal;for(let i=0;i<uv.count;i++){const ax=Math.abs(n.getX(i)),az=Math.abs(n.getZ(i));uv.setXY(i,uv.getX(i)*(ax>.5?d:az>.5?w:w)/sc,uv.getY(i)*(Math.abs(n.getY(i))>.5?d:h)/sc)}return g};
 // plain corridor fit-out: benches, planters, info screens and wall light panels along the walls, keeping a 3.6 m walkway clear
 function CORR(at,ry,a,b,top){const len=b-a;if(len<6)return;const tm=(a+b)/2,[cx,cz]=at(tm),base=new T.Matrix4().compose(new T.Vector3(cx,top,cz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(1,1,1)),
   M=(x,y,z,ry_=0)=>base.clone().multiply(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry_),new T.Vector3(1,1,1))),
   B=(k,w,h,d,x,y,z)=>lbAdd(k,new T.BoxGeometry(w,h,d),M(x,y,z)),L2=len/2;
  for(let z=-L2+3,k=0;z<L2-2.6;z+=5,k++){const sg=k%2?1:-1,x=sg*2.85;
   if(k%3!==2){B('steel',.55,.08,2,x,.44,z);B('sofa',.5,.1,1.9,x,.53,z);B('steel',.08,.44,.08,x,.22,z-.85);B('steel',.08,.44,.08,x,.22,z+.85);B(sg>0?'mag':'cyan',.02,.02,1.9,x-sg*.27,.4,z);
    FMASS(cx,cz,ry,top,x,z,.55,2,.58);
    lbAdd('screen',new T.PlaneGeometry(1.6,1),M(sg*3.27,1.9,z,-sg*Math.PI/2));B('steel',.05,1.1,1.7,sg*3.27,1.9,z)}
   else{lbAdd('steel',new T.CylinderGeometry(.38,.3,.7,14),M(x,.35,z));lbAdd('plant',new T.SphereGeometry(.55,12,9),M(x,1.05,z));lbAdd('plant',new T.SphereGeometry(.38,10,8),M(x-sg*.1,1.5,z+.2));FMASS(cx,cz,ry,top,x,z,.8,.8,1)}}
  for(let z=-L2+1.5;z<L2-1;z+=2.5)for(const sg of[-1,1])B('warm',.04,.9,.18,sg*3.26,3.4,z)}
 // ---- loft lobby: realistic materials (board-formed concrete, polished concrete floor with baked light, walnut, blackened steel,
 //      boucle, leather, brass, marble), floor-to-ceiling steel-framed studio windows wherever the room meets the facade
 const LTX={};
 {const noise=(g,w,h,n,a,b,al=.08)=>{for(let i=0;i<n;i++){const v=a+cr()*(b-a)|0;g.fillStyle=`rgba(${v},${v},${v},${.02+cr()*al})`;g.fillRect(cr()*w,cr()*h,1+cr()*3,1+cr()*3)}};
  {const[c,g]=cvs(512,512);g.fillStyle='#6d6a66';g.fillRect(0,0,512,512);for(let y=0;y<512;y+=32){const v=92+cr()*24|0;g.fillStyle=`rgb(${v},${v-2},${v-6})`;g.fillRect(0,y,512,31);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,y+31,512,1);
    for(let k=0;k<5;k++){g.strokeStyle=`rgba(0,0,0,${.04+cr()*.06})`;g.lineWidth=1;g.beginPath();g.moveTo(0,y+cr()*30);for(let x=0;x<=512;x+=32)g.lineTo(x,y+4+cr()*24);g.stroke()}}
   noise(g,512,512,9000,40,170);for(let i=0;i<50;i++){g.fillStyle='rgba(28,28,28,.55)';g.beginPath();g.arc(cr()*512,cr()*512,.8+cr()*1.6,0,7);g.fill()}LTX.conc=ctex(c,1)}
  {const[c,g]=cvs(512,512);g.fillStyle='#8f8b85';g.fillRect(0,0,512,512);for(let i=0;i<26;i++){const x=cr()*512,y=cr()*512,r=40+cr()*120,rg=g.createRadialGradient(x,y,0,x,y,r);const v=cr()<.5?110:160;rg.addColorStop(0,`rgba(${v},${v-4},${v-10},.18)`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,512,512)}
   noise(g,512,512,14000,60,200,.06);g.fillStyle='rgba(40,38,36,.55)';g.fillRect(0,0,512,2);g.fillRect(0,0,2,512);LTX.floor=ctex(c,1)}
  {const[c,g]=cvs(256,1024);const gr=g.createLinearGradient(0,0,256,0);gr.addColorStop(0,'#5a3a24');gr.addColorStop(.5,'#6d462a');gr.addColorStop(1,'#553420');g.fillStyle=gr;g.fillRect(0,0,256,1024);
   for(let i=0;i<120;i++){const x0=cr()*256,amp=2+cr()*6,ph=cr()*6;g.strokeStyle=`rgba(${30+cr()*30|0},${18+cr()*14|0},${8+cr()*8|0},${.25+cr()*.4})`;g.lineWidth=.6+cr()*1.8;g.beginPath();for(let y=0;y<=1024;y+=8)g.lineTo(x0+Math.sin(y*.012+ph)*amp+Math.sin(y*.05+ph)*1.2,y);g.stroke()}LTX.wood=ctex(c,1)}
  {const[c,g]=cvs(512,512);g.fillStyle='#d6cebf';g.fillRect(0,0,512,512);noise(g,512,512,22000,140,235,.1);g.strokeStyle='#3a3632';g.lineWidth=16;g.strokeRect(24,24,464,464);g.lineWidth=3;g.strokeRect(50,50,412,412);
   for(let y=0;y<512;y+=4){g.fillStyle=`rgba(120,100,80,${cr()*.05})`;g.fillRect(0,y,512,2)}LTX.rug=ctex(c)}
  {const[c,g]=cvs(512,256);g.fillStyle='#ecebe7';g.fillRect(0,0,512,256);for(let i=0;i<26;i++){g.strokeStyle=`rgba(90,90,95,${.08+cr()*.3})`;g.lineWidth=.5+cr()*2;g.beginPath();let x=cr()*512,y=cr()*256;g.moveTo(x,y);for(let k=0;k<14;k++){x+=rr(-10,40);y+=rr(-18,18);g.lineTo(x,y)}g.stroke()}LTX.marble=ctex(c)}
  LTX.art=[0,1,2].map(n=>{const[c,g]=cvs(256,320);const P=[['#c96f4a','#2d3e50','#e8dcc4','#d9a441'],['#1f3b4d','#b8c4bb','#e9e4d8','#8a5a44'],['#3b3b3b','#d4c7b0','#9c3d2e','#f1ece3']][n];g.fillStyle=P[2];g.fillRect(0,0,256,320);
   for(let i=0;i<8;i++){g.fillStyle=P[i%4];g.globalAlpha=.55+cr()*.4;const x=cr()*190,y=cr()*250;g.beginPath();if(i%2)g.arc(x+30,y+30,20+cr()*50,0,7);else g.rect(x,y,40+cr()*120,20+cr()*90);g.fill()}
   g.globalAlpha=1;noise(g,256,320,3000,0,255,.05);const t=ctex(c);return new T.MeshStandardMaterial({map:t,roughness:.9,emissive:0x3a3026,emissiveMap:t})})}
 Object.assign(LBM,{
  conc:new T.MeshStandardMaterial({map:LTX.conc,color:0xb4aea6,roughness:.92,metalness:0,emissive:0x221e19,emissiveMap:LTX.conc}),
  ceil:new T.MeshStandardMaterial({color:0x2b2926,roughness:.95,emissive:0x0d0c0b,side:T.DoubleSide}),
  walnut:new T.MeshStandardMaterial({map:LTX.wood,roughness:.55,metalness:0,emissive:0x3a2414,emissiveMap:LTX.wood}),
  blk:new T.MeshStandardMaterial({color:0x141517,metalness:.7,roughness:.38,emissive:0x050506}),
  win:new T.MeshPhysicalMaterial({color:0xdcecf2,metalness:0,roughness:.02,transparent:true,opacity:.09,clearcoat:1,clearcoatRoughness:.02,depthWrite:false,side:T.DoubleSide}),
  boucle:new T.MeshStandardMaterial({color:0xbab1a4,roughness:.98,emissive:0x221f1a}),
  leather:new T.MeshStandardMaterial({color:0x6e4026,roughness:.55,metalness:.05,emissive:0x1a0d06}),
  brass:new T.MeshStandardMaterial({color:0xb48a4a,metalness:.95,roughness:.3,emissive:0x1f160a}),
  leaf:new T.MeshStandardMaterial({color:0x2f5b2c,roughness:.65,side:T.DoubleSide,emissive:0x0a1a0c,flatShading:true}),
  bark:new T.MeshStandardMaterial({color:0x4a3a2a,roughness:.9,emissive:0x0a0806}),
  pot:new T.MeshStandardMaterial({color:0xd2cbc0,roughness:.45,emissive:0x24211d}),
  rug:new T.MeshStandardMaterial({map:LTX.rug,roughness:1,emissive:0x2e2a24,emissiveMap:LTX.rug}),
  marble:new T.MeshStandardMaterial({map:LTX.marble,roughness:.18,metalness:0,emissive:0x2e2e2c,emissiveMap:LTX.marble}),
  bulb:new T.MeshBasicMaterial({color:0xffd9a0,toneMapped:false}),
  shade:new T.MeshStandardMaterial({color:0xefe6d6,roughness:.8,emissive:0x8a6a40,side:T.DoubleSide}),
  art0:LTX.art[0],art1:LTX.art[1],art2:LTX.art[2]});
 const NEUT=(m,k)=>{const pv=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){pv.call(this,sh,r);const F_='gl_FragColor = vec4( outgoingLight, diffuseColor.a );';if(sh.fragmentShader.indexOf(F_)<0)return;
   sh.fragmentShader=sh.fragmentShader.replace(F_,'outgoingLight=mix(outgoingLight,dot(outgoingLight,vec3(.3,.59,.11))*vec3(1.07,.97,.85),'+k.toFixed(2)+');\n'+F_)};
  m.customProgramCacheKey=()=>'neut'+k;m.needsUpdate=true;return m};
 for(const[k,v]of[['conc',.8],['ceil',.8],['walnut',.6],['blk',.85],['boucle',.8],['leather',.6],['brass',.55],['bark',.7],['pot',.85],['rug',.75],['marble',.85],['leaf',.45],['dwall',.65],['shade',.6],['glass',.5],['win',.4]])NEUT(LBM[k],v);
 function LOBBY(at,ry,tm,top,len,Wh,H,oc,FW){const[cx,cz]=at(tm,oc),base=new T.Matrix4().compose(new T.Vector3(cx,top,cz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(1,1,1)),
   R_=(k,g,x,y,z,rx=0,ry_=0,rz=0,sx=1,sy=1,sz=1)=>lbAdd(k,g,base.clone().multiply(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry_,rz)),new T.Vector3(sx,sy,sz)))),
   B=(k,w,h,d,x,y,z)=>R_(k,new T.BoxGeometry(w,h,d),x,y,z),CY=(k,r0,r1,h,x,y,z,seg=16)=>R_(k,new T.CylinderGeometry(r0,r1,h,seg),x,y,z),
   W=Wh*2,L2=len/2,ax=-oc,win={'-1':!!(FW&&FW[-1]),'1':!!(FW&&FW[1])},FM=(x,z,w,d,h)=>FMASS(cx,cz,ry,top,x,z,w,d,h),LP=[],OCC=[],
   fits=(x0,x1,z0,z1)=>x0>=-Wh+.02&&x1<=Wh-.02&&z0>=-L2+.15&&z1<=L2-.15&&!OCC.some(r=>x0<r[1]&&x1>r[0]&&z0<r[3]&&z1>r[2]),take=(x0,x1,z0,z1)=>OCC.push([x0,x1,z0,z1]);
  take(ax-1.9,ax+1.9,-L2,L2);for(const zz of[-L2+.9,L2-.9].concat(len>16?[0]:[]))take(-Wh,Wh,zz-.6,zz+.6);
  // ceiling: dark plaster with a walnut slat system and recessed linear lights
  R_('ceil',new T.PlaneGeometry(W,len),0,H,0,Math.PI/2);
  {let k=0;for(let x=-Wh+.3;x<Wh-.25;x+=.32,k++){if(k%9===4){B('bulb',.05,.02,len-.4,x,H-.04,0);LP.push(['line',x]);continue}B('walnut',.09,.16,len-.4,x,H-.1,0)}}
  // sides: steel-framed studio glazing where the room meets the facade, board-formed concrete with art elsewhere
  for(const sg of[-1,1]){const xw=sg*(Wh-.03);
   if(win[sg]){R_('win',new T.PlaneGeometry(len,H-.3),xw,.15+(H-.3)/2,0,0,-sg*Math.PI/2);B('blk',.14,.15,len,xw,.075,0);B('blk',.14,.15,len,xw,H-.075,0);
    const n=Math.max(2,Math.round(len/1.6)),rows=Math.max(3,Math.round((H-.3)/1.25));
    for(let k=0;k<=n;k++){const z=-L2+k*len/n;B('blk',.1,H,.07,xw,H/2,z);if(k<n)B('blk',.05,H-.3,.03,xw,.15+(H-.3)/2,z+len/n/2)}
    for(let r=1;r<rows;r++)B('blk',.08,.045,len,xw,.15+(H-.3)*r/rows,0);LP.push(['win',sg])}
   else{lbAdd('conc',tileBox(.12,H,len,1.6),base.clone().multiply(new T.Matrix4().makeTranslation(sg*(Wh-.06),H/2,0)));
    let a_=0;for(let z=-L2+2.6;z<L2-2;z+=4.6,a_++){if(OCC.some(r=>z+.8>r[2]&&z-.8<r[3]&&r[1]-r[0]>W*.9))continue;const xa=sg*(Wh-.145);
     R_('art'+(a_%3),new T.PlaneGeometry(1.2,1.5),xa,1.8,z,0,-sg*Math.PI/2);B('blk',.03,1.58,1.28,sg*(Wh-.115),1.8,z);B('brass',.08,.05,.7,sg*(Wh-.2),2.7,z);LP.push(['pt',sg*(Wh-.6),z,1.6,[255,214,160],.35]);
     if(fits(sg>0?Wh-.62:-Wh+.1,sg>0?Wh-.1:-Wh+.62,z-1.15,z+1.15)){B('walnut',.48,.62,2.2,sg*(Wh-.36),.39,z);for(const q of[-1,1])B('blk',.42,.08,.05,sg*(Wh-.36),.04,z+q*1);R_('pot',new T.SphereGeometry(.13,14,10),sg*(Wh-.36),.83,z-.6,0,0,0,1,1.3,1);
      take(sg>0?Wh-.62:-Wh+.1,sg>0?Wh-.1:-Wh+.62,z-1.15,z+1.15);FM(sg*(Wh-.36),z,.48,2.2,.7)}}}}
  // mezzanine: concrete deck on slim black columns, glass balustrade (walkable deck)
  if(H>=7&&Wh>=6){const my=H-2.7,sg=-1;lbAdd('conc',tileBox(2.4,.25,len-1,1.6),base.clone().multiply(new T.Matrix4().makeTranslation(sg*(Wh-1.2),my,0)));
   {const c=Math.cos(ry),s_=Math.sin(ry);for(let z=-L2+.6;z<=L2-.6;z+=.4)for(let x=-Wh+.1;x<=-Wh+2.3;x+=.4){const k=ci(cx+x*c+z*s_,cz-x*s_+z*c);if(k>=0&&SG[k]<top+my-.2){SB2[k]=top+my-.11;ST2[k]=top+my+.11}}}
   R_('glass',new T.PlaneGeometry(len-1,1.05),sg*(Wh-2.42),my+.65,0,0,Math.PI/2);B('blk',.05,.05,len-1,sg*(Wh-2.42),my+1.18,0);B('bulb',.03,.02,len-1.2,sg*(Wh-2.3),my-.14,0);
   for(let z=-L2+1;z<L2-1;z+=4){const x=sg*(Wh-2.3);if(!fits(x-.1,x+.1,z-.1,z+.1))continue;B('blk',.12,my,.12,x,my/2,z);FM(x,z,.12,.12,my);take(x-.1,x+.1,z-.1,z+.1)}
   for(let k=0;k<9;k++)B('walnut',1.0,.06,.3,sg*(Wh-.65),my*(k+1)/10,L2-2.2-k*.3);B('blk',.06,my*1.05,.06,sg*(Wh-.12),my/2,L2-3.4);take(-Wh,-Wh+1.2,L2-5,L2-1.9)}
  // round board-formed concrete columns
  for(let z=-L2+3;z<L2-2;z+=6)for(const sg of[-1,1]){const x=sg*Math.max(3,Wh-2);if(!fits(x-.3,x+.3,z-.3,z+.3))continue;CY('conc',.24,.24,H,x,H/2,z,24);FM(x,z,.48,.48,H);take(x-.3,x+.3,z-.3,z+.3)}
  // furniture helpers
  const PLANT=(x,z,s=1)=>{CY('pot',.3*s,.22*s,.6*s,x,.3*s,z,20);CY('blk',.27*s,.27*s,.02,x,.6*s,z,16);CY('bark',.02*s,.035*s,1.5*s,x,.6*s+.75*s,z,6);
    for(let i=0;i<26;i++){const h=.75+cr()*1.25,a=cr()*6.283,r=.12+cr()*.42*(h/1.6);R_('leaf',new T.SphereGeometry(.17*s,6,4),x+Math.cos(a)*r*s,.6*s+h*s,z+Math.sin(a)*r*s,cr()*1.2-.6,a,cr()*.9-.45,1,.16,1.45)}FM(x,z,.6*s,.6*s,1.4)};
  const PEND=(x,z,n=3)=>{for(let k=0;k<n;k++){const ox=(k-(n-1)/2)*.42,oz=(k%2)*.22-.11,hy=H-1.35-(k%2)*.3;B('blk',.012,H-hy,.012,x+ox,(H+hy)/2,z+oz);R_('bulb',new T.SphereGeometry(.12,16,12),x+ox,hy,z+oz)}LP.push(['pt',x,z,2.8,[255,205,150],.55])};
  const LOUNGE=(sg,zc)=>{const xs=sg*(Wh-.75),xc=sg*(Wh-2.1);
   R_('rug',new T.PlaneGeometry(3.3,3.6),xc,.014,zc,-Math.PI/2);
   B('blk',.85,.08,2.3,xs,.04,zc);B('boucle',.95,.24,2.4,xs,.2,zc);for(const j of[-1,0,1]){B('boucle',.68,.16,.76,xs-sg*.08,.4,zc+j*.79);R_('boucle',new T.BoxGeometry(.2,.5,.76),xs+sg*.36,.62,zc+j*.79,0,0,-sg*.12)}
   for(const q of[-1,1])B('boucle',.95,.52,.2,xs,.34,zc+q*1.25);FM(xs,zc,.95,2.7,.62);
   const tx=sg*(Wh-1.95);R_('marble',new T.CylinderGeometry(.48,.48,.035,40),tx,.41,zc);CY('blk',.06,.14,.39,tx,.2,zc,12);FM(tx,zc,.96,.96,.42);R_('walnut',new T.BoxGeometry(.24,.05,.3),tx+.1,.45,zc-.1,0,.4);
   for(const q of[-1,1]){const ch=sg*(Wh-3.05),cz_=zc+q*.78;B('leather',.72,.14,.7,ch,.38,cz_);R_('leather',new T.BoxGeometry(.12,.62,.7),ch-sg*.36,.66,cz_,0,0,sg*.2);
    for(const a of[-1,1])B('walnut',.72,.05,.05,ch,.3,cz_+a*.33);for(const a of[-1,1])for(const b_ of[-1,1])B('walnut',.05,.3,.05,ch+a*.32,.15,cz_+b_*.3);FM(ch,cz_,.75,.72,.5)}
   const px=sg*(Wh-.42),pz=zc-1.6;CY('marble',.17,.19,.04,px,.02,pz,24);CY('brass',.015,.015,1.9,px,.97,pz,8);R_('brass',new T.TorusGeometry(.6,.016,6,24,Math.PI/2),px-sg*.6,1.92,pz,0,sg>0?0:Math.PI,0);
   R_('shade',new T.SphereGeometry(.22,20,10,0,6.283,0,Math.PI/2),px-sg*.6,2.38,pz);R_('bulb',new T.SphereGeometry(.06,10,8),px-sg*.6,2.34,pz);LP.push(['pt',px-sg*.6,pz,2.2,[255,200,140],.5]);
   PLANT(sg*(Wh-.5),zc+1.65,.95);PEND(tx,zc,3);LP.push(['pt',xc,zc,2.6,[255,220,180],.18])};
  const WORK=(sg,zc)=>{const xc=sg*(Wh-2.1);R_('walnut',new T.CylinderGeometry(.8,.8,.05,40),xc,.74,zc);CY('blk',.07,.07,.72,xc,.36,zc,10);CY('blk',.35,.35,.03,xc,.015,zc,24);FM(xc,zc,1.6,1.6,.76);
   for(let k=0;k<4;k++){const a=k*Math.PI/2+.4,x=xc+Math.cos(a)*1.08,z=zc+Math.sin(a)*1.08;R_('leather',new T.BoxGeometry(.45,.06,.45),x,.46,z,0,-a);R_('leather',new T.BoxGeometry(.45,.42,.05),x+Math.cos(a)*.22,.7,z+Math.sin(a)*.22,0,-a+Math.PI/2);
    CY('blk',.02,.02,.44,x,.22,z,6)}
   R_('blk',new T.CylinderGeometry(.55,.55,.22,32,1,true),xc,H-1.6,zc);R_('bulb',new T.CircleGeometry(.52,32),xc,H-1.7,zc,Math.PI/2);B('blk',.012,1.5,.012,xc,H-.75,zc);LP.push(['pt',xc,zc,2.8,[255,214,165],.6])};
  // lounge zones against the sides (sofa backs to the glass), a work table every third zone, plants in the corners
  let nz_=0;for(const sg of[1,-1])for(let z=-L2+.9;z<L2-3.4;z+=.5){const x0=sg>0?Wh-3.95:-Wh+.25,x1=sg>0?Wh-.25:-Wh+3.95;if(!fits(x0,x1,z,z+3.5))continue;take(x0,x1,z,z+3.5);(nz_++%3===2&&Wh>=5.2?WORK:LOUNGE)(sg,z+1.75);z+=4.3}
  for(const[x,z]of[[Wh-.6,-L2+1.9],[-Wh+.6,-L2+1.9],[Wh-.6,L2-1.9],[-Wh+.6,L2-1.9],[ax+2.4,0],[ax-2.4,0]])if(fits(x-.4,x+.4,z-.4,z+.4)){take(x-.4,x+.4,z-.4,z+.4);PLANT(x,z,1.15)}
  // marble-topped concierge desk with a fluted walnut front beside the walkway in long rooms
  if(len>10)for(const zc of[len>16?-L2/2:0,len>16?L2/2:-2.5,2.5]){let done=false;for(const sd of[1,-1]){const x=ax+sd*2.45;if(!fits(x-.5,x+.5,zc-1.5,zc+1.5))continue;take(x-.5,x+.5,zc-1.5,zc+1.5);
    for(let k=0;k<14;k++)CY('walnut',.045,.045,1,x-sd*.38,.5,zc-1.3+k*.2,10);B('walnut',.7,1,2.7,x,.5,zc);B('marble',.9,.05,2.9,x,1.03,zc);B('bulb',.02,.02,2.6,x-sd*.44,.06,zc);FM(x,zc,.9,2.9,1.05);LP.push(['pt',x,zc,2.2,[255,220,180],.3]);done=true;break}if(done)break}
  // polished concrete floor with a baked light map (pendant pools, warm ceiling lines, cool daylight off the studio windows)
  {const CW=256,CH=Math.max(64,Math.min(1024,Math.round(256*len/W))),[c,g]=cvs(CW,CH),pxs=x=>(x+Wh)/W*CW,pzs=z=>(z+L2)/len*CH,sx=CW/W;
   g.fillStyle='rgb(58,53,47)';g.fillRect(0,0,CW,CH);g.globalCompositeOperation='lighter';
   for(const l of LP){if(l[0]==='line'){g.fillStyle='rgba(120,98,70,.35)';g.fillRect(pxs(l[1])-.6*sx,0,1.2*sx,CH)}
    else if(l[0]==='win'){const x0=pxs(l[1]*Wh),x1=pxs(l[1]*(Wh-3.2)),gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,'rgba(90,120,170,.75)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(Math.min(x0,x1),0,Math.abs(x1-x0),CH)}
    else{const[,x,z,r,col,a]=l,X=pxs(x),Z=pzs(z),R=r*sx,rg=g.createRadialGradient(X,Z,0,X,Z,R);rg.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(X-R,Z-R,2*R,2*R)}}
   const lm=new T.CanvasTexture(c),fg=new T.PlaneGeometry(W,len),uv=fg.attributes.uv;fg.setAttribute('uv2',new T.BufferAttribute(uv.array.slice(),2));for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*W/1.2,uv.getY(i)*len/1.2);
   const fm=new T.Mesh(fg,NEUT(new T.MeshPhysicalMaterial({map:LTX.floor,color:0xc8c4bc,roughness:.34,metalness:0,clearcoat:.3,clearcoatRoughness:.25,lightMap:lm,lightMapIntensity:1.3}),.85));
   fm.applyMatrix4(base.clone().multiply(new T.Matrix4().compose(new T.Vector3(0,.01,0),new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0)),new T.Vector3(1,1,1))));fm.receiveShadow=true;fm.userData.noClip=1;S0.add(fm)}}
 function lbBuild(){for(const k in LBG){const L=LBG[k];let n=0;L.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
   L.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count});
   const G=new T.BufferGeometry();G.setAttribute('position',new T.BufferAttribute(P,3));G.setAttribute('normal',new T.BufferAttribute(N,3));G.setAttribute('uv',new T.BufferAttribute(U,2));G.computeBoundingSphere();
   const m=new T.Mesh(G,LBM[k]);m.receiveShadow=!LBM[k].transparent;m.castShadow=k==='steel'||k==='beam'||k==='sofa';if(LBM[k].transparent)m.renderOrder=2;m.userData.noClip=1;S0.add(m)}}
 // ---- powered sliding doors: a partition wall across the passage with a 3 m opening; twin frosted panels slide into the wall
 //      pockets when a player comes within 4 m (either player in co-op), and seal the opening (collision) when shut
 const DOORS=[],DPM=new T.MeshPhysicalMaterial({color:0xb8dcff,metalness:.2,roughness:.25,transparent:true,opacity:.55,clearcoat:1,side:T.DoubleSide}),DEM=new T.MeshStandardMaterial({color:0x2a2d36,metalness:.85,roughness:.3});
 NEUT(DPM,.6);
 function DOORWALL(at,ry,t,top,XL,XR,HH){{const[qx,qz]=at(t);for(const d of DOORS)if(Math.hypot(d.pos.x-qx,d.pos.z-qz)<7&&Math.abs(d.top-top)<1)return}const OW=3,DH=3.2,[cx,cz]=at(t),base=new T.Matrix4().compose(new T.Vector3(cx,top,cz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(1,1,1)),
   M=(x,y,z)=>base.clone().multiply(new T.Matrix4().makeTranslation(x,y,z)),B=(k,w,h,d,x,y,z)=>lbAdd(k,new T.BoxGeometry(w,h,d),M(x,y,z));
  // wall either side of the opening and above it (local x = across the passage, z = along it)
  const TB=(w,h,d,x,y,z)=>lbAdd('dwall',tileBox(w,h,d,2.2),M(x,y,z));
  const wl=XL-OW/2,wr=XR-OW/2;if(wl>.05)TB(wl,HH,.35,-(OW/2+wl/2),HH/2,0);if(wr>.05)TB(wr,HH,.35,OW/2+wr/2,HH/2,0);TB(OW,HH-DH,.35,0,DH+(HH-DH)/2,0);
  for(const f of[-1,1]){const sm=base.clone().multiply(new T.Matrix4().compose(new T.Vector3(0,DH+.62,f*.185),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),f<0?Math.PI:0),new T.Vector3(1,1,1)));lbAdd('sign',new T.PlaneGeometry(1.9,.36),sm);
   for(const sg of[-1,1]){if((sg<0?wl:wr)>1.2)lbAdd('screen',new T.PlaneGeometry(.9,.56),base.clone().multiply(new T.Matrix4().compose(new T.Vector3(sg*(OW/2+.75),1.45,f*.185),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),f<0?Math.PI:0),new T.Vector3(1,1,1))))}}
  // frame, threshold, status light bar
  B('steel',.22,DH,.5,-OW/2-.11,DH/2,0);B('steel',.22,DH,.5,OW/2+.11,DH/2,0);B('steel',OW+.44,.24,.5,0,DH+.12,0);B('steel',OW,.04,.6,0,.02,0);
  B('cyan',OW*.8,.05,.52,0,DH+.26,0);for(const sg of[-1,1])B('cyan',.04,DH*.8,.52,sg*(OW/2+.23),DH*.45,0);
  // panels
  const g=new T.Group();g.position.set(cx,top,cz);g.rotation.y=ry;const pan=[];
  for(const sg of[-1,1]){const pn=new T.Group();const gl=new T.Mesh(new T.BoxGeometry(OW/2,DH-.06,.07),DPM);gl.position.y=(DH-.06)/2;pn.add(gl);
   const ed=new T.Mesh(new T.BoxGeometry(.08,DH-.06,.11),DEM);ed.position.set(-sg*OW/4+sg*.0,(DH-.06)/2,0);ed.position.x=-sg*(OW/4-.04);pn.add(ed);
   const st=new T.Mesh(new T.BoxGeometry(.03,DH*.55,.12),LBM.cyan);st.position.set(-sg*(OW/4-.1),DH*.5,0);pn.add(st);pn.position.x=sg*OW/4;g.add(pn);pan.push([pn,sg])}
  g.userData.noClip=1;S0.add(g);
  // collision cells: the whole wall line; the opening cells are toggled by the door state
  // classify grid cells by their centre in door-local space: |q| = distance from the wall plane, o = across the passage
  const oc=[],R_=Math.max(XL,XR)+1.5,cr_=Math.cos(ry),sr_=Math.sin(ry);
  for(let x=Math.floor(cx-R_);x<=Math.ceil(cx+R_);x++)for(let z=Math.floor(cz-R_);z<=Math.ceil(cz+R_);z++){const k=ci(x,z);if(k<0)continue;const dx_=x+.5-cx,dz_=z+.5-cz,o=dx_*cr_-dz_*sr_,q=dx_*sr_+dz_*cr_;
   if(Math.abs(q)>.75||o<-XL-.2||o>XR+.2)continue;if(Math.abs(o)<OW/2+.25)oc.push(k);else SG[k]=Math.max(SG[k],top+HH)}
  DOORS.push({g,pan,OW,cells:oc,top,k:0,open:false,pos:new T.Vector3(cx,top+1.5,cz),setSolid(on){for(const k of this.cells)SG[k]=on?top+DH:top}});DOORS[DOORS.length-1].setSolid(true)}
 // capped walkway end (the building runs on too far): a finished wall, never an invisible one
 function ENDCAP(at,ry,t,top,XL,XR,HH){const[cx,cz]=at(t),base=new T.Matrix4().compose(new T.Vector3(cx,top,cz),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(1,1,1));
  lbAdd('dwall',tileBox(XL+XR,HH,.3,2.2),base.clone().multiply(new T.Matrix4().makeTranslation((XR-XL)/2,HH/2,0)));FMASS(cx,cz,ry,top,(XR-XL)/2,0,XL+XR,.3,HH)}
 // launch platform past the exit door: cantilevered deck, glass balustrade, and a pad that throws you to a clear landing ahead
 const LPM=(()=>{const[c,g]=cvs(256,256);g.fillStyle='#07101a';g.fillRect(0,0,256,256);g.strokeStyle='#21e6ff';g.shadowColor='#21e6ff';g.shadowBlur=10;
  for(const r of[118,96,74])(g.lineWidth=r===118?6:3,g.beginPath(),g.arc(128,128,r,0,7),g.stroke());g.lineWidth=7;for(let k=0;k<3;k++){const y=150-k*34;g.beginPath();g.moveTo(92,y+18);g.lineTo(128,y-8);g.lineTo(164,y+18);g.stroke()}
  return new T.MeshBasicMaterial({map:ctex(c),toneMapped:false})})();LBM.padtop=LPM;
 function padTarget(x0,y0,z0,fx,fz){const C_=[];for(let D=8;D<=70;D+=2.5)for(let L=-D*.9;L<=D*.9;L+=2.5){const x=x0+fx*D-fz*L,z=z0+fz*D+fx*L,i=ci(x,z);if(i<0||Math.abs(x)>BND[1]-4||Math.abs(z)>BND[3]-4)continue;const h=SG[i];if(h>y0+2)continue;
   let ok=true;for(const[a_,b_]of[[0,0],[1.3,0],[-1.3,0],[0,1.3],[0,-1.3]]){const j=ci(x+a_,z+b_);if(j<0||Math.abs(SG[j]-h)>.35||sol(x+a_,h+.4,z+b_)||sol(x+a_,h+2.2,z+b_)){ok=false;break}}if(!ok)continue;C_.push([x,h,z,(h>2?0:25)+Math.abs(D-30)*.5+Math.abs(L)*.6])}
  C_.sort((p_,q_)=>p_[3]-q_[3]);for(const AP of[4.5,9,15])for(const[tx,ty,tz]of C_){const ap=Math.max(y0,ty)+AP,g=26,vy=Math.sqrt(2*g*(ap-y0)),tf=vy/g+Math.sqrt(2*(ap-ty)/g);let clr=true;
   for(let t=.05;t<tf-.08&&clr;t+=.02){const u=t/tf,px=x0+(tx-x0)*u,pz=z0+(tz-z0)*u,py=y0+vy*t-13*t*t;for(const h of[.2,1,1.8])if(sol(px,py+h,pz)){clr=false;break}}if(clr)return[tx,ty,tz,(tx-x0)/tf,vy,(tz-z0)/tf]}return null}
 function PLAT(sbr,at,ry,e,tt,top){const[dx,dz]=sbr.d,fx=dx*e,fz=dz*e;let best=null;
  // try a full-width deck first, then narrower or slightly offset ones, so tight exits still get a launch deck
  for(const hw of[3.7,2.8,2.1])for(const oc of[0,-1.2,1.2,-2.4,2.4]){let PD=6.5;for(let u=.9;u<=6.5&&PD>=3.2;u+=.25)for(let o=oc-hw;o<=oc+hw+.01;o+=.35){const[x,z]=at(tt+e*u,o);if(sol(x,top+.9,z)||sol(x,top+2.5,z)){PD=Math.min(PD,u-.3);break}}
   if(PD>=3.2&&(!best||PD*hw>best[0]*best[1]*1.25))best=[PD,hw,oc]}
  (window.NCC_PLATWHY=window.NCC_PLATWHY||[]).push([sbr.name,e,best]);if(!best)return;
  const[PD,hw,oc]=best,W_=(u,o,y)=>{const[x,z]=at(tt+e*u,o);return new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry),new T.Vector3(1,1,1))},
   B=(k,w,h,d,u,o,y)=>lbAdd(k,new T.BoxGeometry(w,h,d),W_(u,o,y)),Wd=hw*2;
  B('steel',Wd+.1,.32,PD,PD/2,oc,top-.16);B('blk',Wd-.2,.02,PD-.2,PD/2,oc,top+.005);
  for(const q of[-1,1]){const o=oc+q*(hw-.04);lbAdd('glass',new T.BoxGeometry(.03,1.05,PD),W_(PD/2,o,top+.56));B('steel',.07,.06,PD,PD/2,o,top+1.1);B('cyan',.04,.03,PD,PD/2,oc+q*hw,top+.02);for(let u=.2;u<PD;u+=1.6)B('steel',.06,1.1,.06,u,o,top+.55)}
  {const fu=PD-.06;lbAdd('glass',new T.BoxGeometry(Wd-.1,1.05,.03),W_(fu,oc,top+.56));B('steel',Wd,.06,.07,fu,oc,top+1.1);B('cyan',Wd,.03,.04,PD-.02,oc,top+.02)}
  for(const q of[-1,1]){const[x0,z0]=at(tt,oc+q*(hw-.6)),[x1,z1]=at(tt+e*PD*.8,oc+q*(hw-.6)),v=new T.Vector3(x1-x0,3.2,z1-z0),Lb=v.length();lbAdd('steel',new T.BoxGeometry(.18,.18,Lb),new T.Matrix4().compose(new T.Vector3((x0+x1)/2,top-1.95,(z0+z1)/2),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),v.normalize()),new T.Vector3(1,1,1)))}
  // collision: deck, rails on the three open sides (only where there is a drop)
  for(let u=0;u<=PD;u+=.25)for(let o=oc-hw-.05;o<=oc+hw+.05;o+=.25){const[x,z]=at(tt+e*u,o),i=ci(x,z);if(i<0)continue;if(SG[i]>top-.35)continue;const rail=(Math.abs(o-oc)>hw-.3||u>PD-.3)&&SG[i]<top-1;slab(x,z,top-.35,rail?top+1.1:top)}
  // the pad
  const pu=PD*.58,[px,pz]=at(tt+e*pu,oc),pr=Math.min(1.5,hw-.45);
  lbAdd('steel',new T.CylinderGeometry(pr+.25,pr+.35,.14,40),W_(pu,oc,top+.07));lbAdd('padtop',new T.CircleGeometry(pr,40).rotateX(-Math.PI/2),W_(pu,oc,top+.145));lbAdd('cyan',new T.TorusGeometry(pr+.12,.035,6,48).rotateX(Math.PI/2),W_(pu,oc,top+.15));
  lbAdd('holo',new T.CylinderGeometry(pr-.25,pr-.05,2.6,32,1,true),W_(pu,oc,top+1.45));
  const tg=padTarget(px,top,pz,fx,fz);PADS.push(tg?[px,pz,tg[3],tg[4],tg[5],top]:[px,pz,fx*4,13,fz*4,top]);(window.NCC_PLATS=window.NCC_PLATS||[]).push([sbr.name,e,+px.toFixed(1),+pz.toFixed(1),top,+PD.toFixed(1),hw,oc,tg?tg.slice(0,3).map(v=>+v.toFixed(1)):null])}
 function stepDoors(dt){const p2=typeof CO!=='undefined'&&CO.on&&CO.st.down<=0?CO.st.p:null;
  for(const d of DOORS){const near=!!(Math.hypot(P.x-d.pos.x,P.z-d.pos.z)<4.2&&Math.abs(P.y+1-d.pos.y)<3||(p2&&Math.hypot(p2.x-d.pos.x,p2.z-d.pos.z)<4.2&&Math.abs(p2.y+1-d.pos.y)<3));
   if(near!==d.open){d.open=near;try{AUD.door(d.pos,near)}catch(e){}}
   const tk=d.open?1:0;d.k+=Math.sign(tk-d.k)*Math.min(Math.abs(tk-d.k),dt/(d.open?.42:.62));const e=d.k*d.k*(3-2*d.k);
   for(const[pn,sg]of d.pan)pn.position.x=sg*(d.OW/4+e*d.OW*.48);
   d.setSolid(d.k<.55)}}
 const CLIPV=[];RMQ.forEach(f=>f());RMQ.length=0;
 {const TUN=[],doorTex=(()=>{const[c,g]=cvs(256,192);g.fillStyle='#04030a';g.fillRect(0,0,256,192);
   for(let k=0;k<9;k++){const f=Math.pow(.78,k),w=256*f,h=192*f,x=(256-w)/2,y=(192-h)/2+h*.06*(1-f);g.strokeStyle=`rgba(${k%2?'255,43,214':'33,230,255'},${.65*f+.08})`;g.lineWidth=Math.max(1,4*f);g.strokeRect(x,y,w,h)}
   const rg=g.createRadialGradient(128,104,4,128,104,60);rg.addColorStop(0,'rgba(150,230,255,.55)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,256,192);return ctex(c,1)})();
  const inM=new T.MeshStandardMaterial({color:0x232634,metalness:.55,roughness:.42,side:T.DoubleSide}),flM=new T.MeshStandardMaterial({color:0x16141f,metalness:.4,roughness:.3}),
   stripC=new T.MeshBasicMaterial({color:0x21e6ff}),stripM=new T.MeshBasicMaterial({color:0xff2bd6}),doorM=new T.MeshBasicMaterial({map:doorTex,toneMapped:false}),frameM=new T.MeshBasicMaterial({color:0x21e6ff});
  for(const sbr of LAY.skybridges){const[dx,dz]=sbr.d,sx=-dz,sz=dx,top=sbr.top,ry=RYd(sbr.d),at=(t,o=0)=>[sbr.c[0]+dx*t+sx*o,sbr.c[1]+dz*t+sz*o],hi=t=>{const i=ci(...at(t));return i<0?0:SG[i]};
   const L2=sbr.L/2,EXT=36,blk=t=>{const[x,z]=at(t),i=ci(x,z);if(i<0)return false;if(SG[i]>=top+4.8)return true;if(Math.abs(t)<=L2+.25)return false;return SG[i]>top+.6||sol(x,top+1,z)||sol(x,top+3,z)};
   let inB=false,t0=0,c0=false;const sp=[];for(let t=-L2-EXT;t<=L2+EXT+.01;t+=.5){const b=blk(t);if(b&&!inB){inB=true;t0=t;c0=t<=-L2-EXT+.01}else if(!b&&inB){inB=false;sp.push([t0,t-.5,c0,false])}}if(inB)sp.push([t0,L2+EXT,c0,true]);for(let k=sp.length-1;k>0;k--)if(sp[k][0]-sp[k-1][1]<=1.5||sp[k][0]-sp[k-1][1]<=4.6&&(Math.abs(sp[k][0])>L2||Math.abs(sp[k-1][1])>L2)){sp[k-1][1]=sp[k][1];sp[k-1][3]=sp[k][3];sp.splice(k,1)}
   for(const[p_,q_,u_,v_]of sp)if(q_>=-L2-3.5&&p_<=L2+3.5)TUN.push([sbr,p_,q_,u_,v_])}
  // carve a cell into a walkway section: floor at the deck, clear headroom hh, keep any structure above (and below, for gate towers over a street)
  const CARVE=(i,top,hh)=>{const H=SG[i];let hiT=0,loB=1e9;for(const[b_,t_]of[[SB[i],ST[i]],[SB2[i],ST2[i]]]){if(t_<=0)continue;if(t_>top+hh)hiT=Math.max(hiT,t_);if(b_<top&&t_>top-.6)loB=Math.min(loB,b_)}
   if(H>top-.6){SG[i]=top;SB[i]=top+hh;ST[i]=Math.max(hiT,H,top+hh+.4);SB2[i]=0;ST2[i]=0;return}
   SB[i]=Math.min(loB,top-.5);ST[i]=top;SB2[i]=top+hh;ST2[i]=Math.max(hiT,top+hh+.4)};
  for(const[sbr,t0,t1,cA,cB]of TUN){const[dx,dz]=sbr.d,sx=-dz,sz=dx,top=sbr.top,ry=RYd(sbr.d),at=(t,o=0)=>[sbr.c[0]+dx*t+sx*o,sbr.c[1]+dz*t+sz*o],a=t0-.6,b=t1+.6,len=b-a,tm=(a+b)/2,[cx,cz]=at(tm);
   // collision: floor at the deck, ceiling 4.8 m up, building above; the walls stay solid
   for(let t=a;t<=b;t+=.3)for(let o=-3.1;o<=3.1;o+=.3){const i=ci(...at(t,o));if(i<0)continue;const H=SG[i];if(H>=top+4.8){SG[i]=top;SB[i]=top+4.8;ST[i]=H;SB2[i]=0;ST2[i]=0;continue}if(Math.abs(t)>sbr.L/2+.2)CARVE(i,top,4.8)}
   // how much room the building leaves around the corridor: a lobby where it is wide and tall enough, a plain corridor otherwise
   const WS={'-1':9,'1':9},FW={'-1':1,'1':1},FX={'-1':0,'1':0};let Hb=1e9;const seam=(t)=>[-1,1].every(sg=>{const i=ci(...at(t,sg*3.4));return i>=0&&SG[i]<top+4.8&&!(ST[i]>top+4.8)});for(let t=a+1.6;t<=b-1.6;t+=1)for(const sg of[-1,1]){if(seam(t)||seam(t-.5)||seam(t+.5))continue;let o=3.4,br=false;for(;o<=10;o+=.5){const i=ci(...at(t,sg*o));if(i<0||SG[i]<top+4.8&&!(ST[i]>top+4.8)){br=i>=0;break}Hb=Math.min(Hb,Math.max(SG[i],ST[i]))}
    if(!br)FW[sg]=0;else FX[sg]=Math.max(FX[sg],o);WS[sg]=Math.min(WS[sg],br?o-.75:o-1.4)}
   const Wl=Math.max(3.3,WS[-1]),Wr=Math.max(3.3,WS[1]),Wh=(Wl+Wr)/2;
   const H=Math.max(4.8,Math.min(8.5,Hb-top-1.2)),lobby=Wl+Wr>=9&&len>=6;
   (window.NCC_LOBBIES=window.NCC_LOBBIES||[]).push([sbr.name,+a.toFixed(1),+b.toFixed(1),+Wh.toFixed(1),+H.toFixed(1),lobby]);
   if(lobby){for(let t=a;t<=b;t+=.3)for(let o=-Wl;o<=Wr;o+=.3){const i=ci(...at(t,o));if(i<0)continue;const Hc=Math.max(SG[i],ST[i]);if(Hc<top+4.8&&SG[i]<=top)continue;if(SG[i]<top-.6){CARVE(i,top,H);continue}SG[i]=top;SB[i]=top+H;ST[i]=Math.max(Hc,top+H+.4);SB2[i]=0;ST2[i]=0}
    // studio glazing is a real wall: seal the glass line
    for(const sg of[-1,1])if(FW[sg])for(let t=a;t<=b;t+=.3){const i=ci(...at(t,sg*((sg<0?Wl:Wr)+.2)));if(i<0||SG[i]>=top+H)continue;if(SG[i]>=top-.6)SG[i]=top+H;else{SB2[i]=top-.5;ST2[i]=top+H}}
    LOBBY(at,ry,tm,top,len,Wh,H,(Wr-Wl)/2,FW)}
   else{const grp=new T.Group();grp.position.set(cx,top,cz);grp.rotation.y=ry;
   const pl=(w,h,x,y,z,rx,rY,m)=>{const q=new T.Mesh(new T.PlaneGeometry(w,h),m);q.position.set(x,y,z);q.rotation.set(rx,rY,0);q.receiveShadow=true;grp.add(q);return q};
   pl(6.6,len,0,.01,0,-Math.PI/2,0,flM);pl(6.6,len,0,4.75,0,Math.PI/2,0,inM);pl(len,4.75,-3.3,2.37,0,0,Math.PI/2,inM);pl(len,4.75,3.3,2.37,0,0,-Math.PI/2,inM);
   for(const sx_ of[-1,1]){const st=new T.Mesh(new T.BoxGeometry(.06,.06,len),sx_<0?stripC:stripM);st.position.set(sx_*3.2,4.6,0);grp.add(st);const fl=new T.Mesh(new T.BoxGeometry(.05,.03,len),stripC);fl.position.set(sx_*3.15,.03,0);grp.add(fl)}
   for(let z=-len/2+2;z<len/2;z+=4){const lp=new T.Mesh(new T.BoxGeometry(2.4,.05,.25),new T.MeshBasicMaterial({color:0xcfe8ff}));lp.position.set(0,4.72,z);grp.add(lp)}
   grp.userData.noClip=1;S0.add(grp);CORR(at,ry,a,b,top)}
   // doorways on the facades where the corridor enters from open air
   {const XL=lobby?Wl:3.3,XR=lobby?Wr:3.3,HH=lobby?H:4.8;CLIPV.push([sbr.c[0]+dx*tm,sbr.c[1]+dz*tm,dx,dz,len/2,lobby&&FW[-1]?-(FX[-1]+.6):-XL+.07,lobby&&FW[1]?FX[1]+.6:XR-.07,top+.04,top+HH-.06]);
    for(const[e,tt,cap]of[[-1,a,cA],[1,b,cB]]){if(cap){ENDCAP(at,ry,tt-e*.4,top,XL,XR,HH);continue}DOORWALL(at,ry,tt-e*.9,top,XL,XR,HH);if(e*tt>sbr.L/2-.5)PLAT(sbr,at,ry,e,tt,top)}
    /* no partition across the middle of long lobbies */}}
  lbBuild();
  if(CLIPV.length){const N=CLIPV.length,UA=CLIPV.map(v=>new T.Vector4(v[0],v[1],v[2],v[3])),UB=CLIPV.map(v=>new T.Vector4(v[4],v[5],v[6],v[7])),UY=CLIPV.map(v=>v[8]),done=new Set;
   const hook=m=>{if(!m||done.has(m)||m.isShaderMaterial||m.isRawShaderMaterial)return;done.add(m);const prev=m.onBeforeCompile,pk=m.customProgramCacheKey;
    m.onBeforeCompile=function(sh,r){prev.call(this,sh,r);if(sh.vertexShader.indexOf('#include <project_vertex>')<0||sh.fragmentShader.indexOf('void main() {')<0)return;
     sh.uniforms.uClipA={value:UA};sh.uniforms.uClipB={value:UB};sh.uniforms.uClipY={value:UY};
     sh.vertexShader='varying vec3 vClipW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\n vClipW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\n vClipW=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif');
     sh.fragmentShader='varying vec3 vClipW;uniform vec4 uClipA['+N+'];uniform vec4 uClipB['+N+'];uniform float uClipY['+N+'];\n'+sh.fragmentShader.replace('void main() {','void main() {\n for(int i=0;i<'+N+';i++){vec4 a=uClipA[i],b=uClipB[i];vec2 d=vClipW.xz-a.xy;float t=dot(d,a.zw),o=dot(d,vec2(-a.w,a.z));if(abs(t)<b.x&&o>b.y&&o<b.z&&vClipW.y>b.w&&vClipW.y<uClipY[i])discard;}')};
    m.customProgramCacheKey=function(){return pk.call(this)+'|clip'+N+'|'+prev.toString().length};m.needsUpdate=true};
   const walk=o=>{if(o.userData&&o.userData.noClip)return;if(o.isMesh&&o.material&&!(o.material.visible===false))(Array.isArray(o.material)?o.material:[o.material]).forEach(hook);for(const c of o.children)walk(c)};
   for(const c of S0.children)if(!PRE_CITY.has(c))walk(c);window.NCC_CLIP={volumes:N,materials:done.size}}
  window.NCC_DOORS=DOORS;window.NCC_TUNNELS=TUN.map(([s,a,b,c,d])=>[s.name,+a.toFixed(1),+b.toFixed(1),c,d])}
 const shatter=(g,pt)=>{const G_=g.userData.glass;if(!G_||G_.broken)return false;G_.broken=1;g.visible=false;const pi=proxies.indexOf(g);if(pi>=0)proxies.splice(pi,1);
  for(const i of G_.cells){SB[i]=G_.top-.6;ST[i]=G_.top;SB2[i]=G_.top+4.8;ST2[i]=G_.top+5.3}
  if(typeof glassBurst==='function')glassBurst(g,pt);return true};
 const shatterNear=(pt,r)=>{for(const g of GLASS)if(!g.userData.glass.broken&&g.position.distanceTo(pt)<r+2.5)shatter(g,g.position)};
 S0.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m||Array.isArray(m)||m.transparent||m.blending===T.AdditiveBlending)return;if(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial){o.castShadow=true;o.receiveShadow=true}});
 R.shadowMap.needsUpdate=true;
 return{sol,hAt,stairH,boxes,proxies,update,liftAt,padAt,bounds:BND,LIFTS,PADS,shatter,shatterNear,GLASS,refreshShadows:()=>{R.shadowMap.needsUpdate=true}}})();

function applyCam(){C.fov=cfg.fov;C.updateProjectionMatrix()}applyCam();
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();checkOrient()});

// destructible blocks
const B=new Map(),k=(i,j,l)=>i+','+j+','+l,bg=new T.BoxGeometry(2,2,2);let BM=[];
const crateT=(()=>{const N=256,mk=()=>{const c=document.createElement('canvas');c.width=c.height=N;return[c,c.getContext('2d')]},[c,g]=mk(),[e,h]=mk();
 g.fillStyle='#2c313c';g.fillRect(0,0,N,N);for(let x=0;x<N;x+=16){g.fillStyle='#3a404e';g.fillRect(x,0,8,N);g.fillStyle='#1b1f27';g.fillRect(x+8,0,2,N)}
 for(let i=0;i<30;i++){g.fillStyle=`rgba(20,14,10,${.15+rnd()*.25})`;g.fillRect(rnd()*N,rnd()*N,3+rnd()*6,10+rnd()*50)}
 g.strokeStyle='#15171d';g.lineWidth=12;g.strokeRect(6,6,N-12,N-12);g.fillStyle='rgba(235,240,255,.8)';g.font='900 38px Impact, "Arial Black", sans-serif';g.fillText('VV-07',26,64);g.font='700 16px monospace';g.fillText('CARGO 2.0T',28,88);
 for(let i=-1;i<9;i++){g.fillStyle=i%2?'#e0a020':'#16161a';g.beginPath();g.moveTo(i*32,N-14);g.lineTo(i*32+32,N-14);g.lineTo(i*32+48,N-40);g.lineTo(i*32+16,N-40);g.fill()}
 h.fillStyle='#000';h.fillRect(0,0,N,N);h.fillStyle='#fff';h.fillRect(0,0,N,5);h.fillRect(0,N-5,N,5);h.fillRect(0,0,5,N);h.fillRect(N-5,0,5,N);h.fillRect(24,100,N-48,6);
 const t=new T.CanvasTexture(c),te=new T.CanvasTexture(e);t.anisotropy=te.anisotropy=4;return[t,te]})();
const bmat=[[0x9aa0b0,0xff9a3c,.5],[0xd0b0d0,0xff2bd6,1.3],[0xa8c8d0,0x21e6ff,1.3]].map(([c,e,i])=>new T.MeshStandardMaterial({map:crateT[0],color:c,emissive:e,emissiveMap:crateT[1],emissiveIntensity:i,roughness:.5,metalness:.45}));
const bcol=[0x3a2a80,0xff2bd6,0x21e6ff];
function addB(i,j,l){const r=rnd(),t=r<.86?0:r<.93?1:2,m=new T.Mesh(bg,bmat[t]);m.position.set(i*2+1,j*2+1,l*2+1);m.userData={i,j,k:l,col:bcol[t]};S.add(m);BM.push(m);B.set(k(i,j,l),m)}
function buildArena(){BM.forEach(m=>S.remove(m));BM=[];B.clear();
 [[-24,14,3,2,3],[-16,22,2,2,4],[-28,10,2,2,2],[13,13,3,2,3],[22,22,2,3,4],[14,26,3,2,2],[30,30,2,2,3],[22,-26,2,2,2],[-10,-20,2,2,3],[2,-28,1,2,2],[-4,-40,1,1,2],[-6,26,1,1,2],[4,40,1,1,2],[-36,-2,1,2,2],[36,2,1,1,3]].forEach(([x,z,w,d,h])=>{for(let a=0;a<w;a++)for(let b=0;b<d;b++){const wx=(x+a)*2+1,wz=(z+b)*2+1;if(CITY.sol(wx,.5,wz)||CITY.sol(wx-1,.5,wz-1)||CITY.sol(wx+1,.5,wz+1)||Math.hypot(wx,wz)<19||CITY.PADS.concat(CITY.LIFTS).some(q=>Math.hypot(q[0]-wx,q[1]-wz)<4))continue;for(let y=0;y<h;y++)addB(x+a,y,z+b)}})}
buildArena();
const solid=(x,y,z)=>B.has(k(Math.floor(x/2),Math.floor(y/2),Math.floor(z/2)))||CITY.sol(x,y,z);

// particles
const PA=[],pg=new T.BoxGeometry(.28,.28,.28);

// ---- blood: wound mist, stretched droplets with gravity, and wet splat decals where they land (ground and walls)
const BLOOD=(()=>{const MAXD=LOWSPEC?90:170,MAXS=LOWSPEC?30:55;
 const splTex=[0,1,2,3].map(v=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),R_=(a,b)=>a+Math.random()*(b-a);
  const blob=(x,y,r,a)=>{g.globalAlpha=a;g.beginPath();const N=14;for(let i=0;i<=N;i++){const t=i/N*6.283,rr=r*R_(.72,1.1);g.lineTo(x+Math.cos(t)*rr,y+Math.sin(t)*rr)}g.fill()};
  g.fillStyle='#fff';blob(64,64,R_(16,24),1);for(let i=0;i<5;i++)blob(64+R_(-14,14),64+R_(-14,14),R_(7,14),1);
  for(let i=0;i<22;i++){const a=R_(0,6.283),d=R_(22,58),r=R_(1,4.5)*(1-d/70);blob(64+Math.cos(a)*d,64+Math.sin(a)*d,Math.max(.8,r),R_(.6,1))}
  for(let i=0;i<5;i++){const a=R_(0,6.283),d0=R_(14,22),d1=R_(36,60);g.globalAlpha=.9;g.lineWidth=R_(1.2,3);g.strokeStyle='#fff';g.beginPath();g.moveTo(64+Math.cos(a)*d0,64+Math.sin(a)*d0);g.lineTo(64+Math.cos(a)*d1,64+Math.sin(a)*d1);g.stroke();blob(64+Math.cos(a)*d1,64+Math.sin(a)*d1,R_(1.5,3.2),1)}
  const t=new T.CanvasTexture(c);t.generateMipmaps=false;t.minFilter=T.LinearFilter;return t});
 const mistTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),rg=g.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.45,'rgba(255,255,255,.45)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);t.generateMipmaps=false;t.minFilter=T.LinearFilter;return t})();
 const dropM=new T.MeshStandardMaterial({color:0x0a3cff,roughness:.15,metalness:.05,emissive:0x1a6cff,emissiveIntensity:1.6,toneMapped:false});
 const drops=new T.InstancedMesh(new T.SphereGeometry(1,7,5),dropM,MAXD);drops.frustumCulled=false;drops.count=0;S.add(drops);
 const D=[],SP=[],MI=[],o=new T.Object3D(),up=new T.Vector3(0,1,0),tv=new T.Vector3();
 const splM=splTex.map(t=>new T.MeshStandardMaterial({emissiveIntensity:1.3,toneMapped:false,color:0x0830c0,alphaMap:t,transparent:true,roughness:.18,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,emissive:0x1060ff}));
 const plane=new T.PlaneGeometry(1,1);
 function splat(p,n,sz){if(SP.length>=MAXS){const q=SP.shift();S.remove(q.m)}const m=new T.Mesh(plane,splM[Math.random()*4|0].clone());m.position.copy(p).addScaledVector(n,.012);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);m.rotateZ(Math.random()*6.283);m.scale.set(sz,sz*(.8+Math.random()*.5),1);S.add(m);SP.push({m,t:0,life:9+Math.random()*4})}
 function hit(p,dir,k=1){k=Math.min(2.6,k);
  // mist: two soft puffs, one blown out the exit side
  for(let j=0;j<2;j++){if(MI.length>24){const q=MI.shift();S.remove(q.s)}const sm=new T.SpriteMaterial({map:mistTex,color:0x2a8cff,transparent:true,depthWrite:false,opacity:.9,blending:T.AdditiveBlending,toneMapped:false});const sp=new T.Sprite(sm);sp.position.copy(p).addScaledVector(dir,j*.25);S.add(sp);MI.push({s:sp,t:0,life:.32+j*.14,s0:.25*k,s1:(.9+j*.45)*k,v:dir.clone().multiplyScalar(j?1.6:.4)})}
  // droplets: mostly along the bullet's path (exit spray), some back-splash toward the shooter
  const n=Math.round(20+16*k);for(let i=0;i<n;i++){if(D.length>=MAXD)D.shift();const back=Math.random()<.22;
   tv.set(Math.random()-.5,Math.random()-.3,Math.random()-.5).multiplyScalar(back?1.1:.7).addScaledVector(dir,back?-.6:1).normalize();
   const sp=(back?2.5:4)+Math.random()*(back?2.5:5);D.push({p:p.clone().addScaledVector(dir,back?-.05:.12),v:tv.clone().multiplyScalar(sp),r:.016+Math.random()*.04*Math.sqrt(k),l:1.6})}
  // a wall splat if something solid is just behind the target
  for(let s_=1;s_<=10;s_++){const q=p.clone().addScaledVector(dir,.35*s_);if(q.y<.05)break;if(solid(q.x,q.y,q.z)){splat(q.addScaledVector(dir,-.3),dir.clone().negate(),.55+.4*k);break}}}
 function update(dt){let c=0;for(let i=D.length-1;i>=0;i--){const d=D[i];d.v.y-=14*dt;d.v.multiplyScalar(1-.6*dt);const np=d.p.clone().addScaledVector(d.v,dt);d.l-=dt;
   let land=null,nrm=null;if(np.y<=.03){land=np;land.y=.015;nrm=up}else if(solid(np.x,np.y,np.z)){land=d.p.clone();nrm=d.v.clone().negate().normalize();if(Math.abs(nrm.y)>.6)nrm=up}
   if(land){if(d.r>.018||Math.random()<.35)splat(land,nrm,.10+d.r*9);D.splice(i,1);continue}if(d.l<=0){D.splice(i,1);continue}d.p.copy(np)}
  for(const d of D){const sp=d.v.length();o.position.copy(d.p);o.quaternion.setFromUnitVectors(up,tv.copy(d.v).divideScalar(sp||1));const st=1+Math.min(3.5,sp*.12);o.scale.set(d.r,d.r*st,d.r);o.updateMatrix();drops.setMatrixAt(c++,o.matrix)}
  drops.count=c;drops.instanceMatrix.needsUpdate=true;
  for(let i=MI.length-1;i>=0;i--){const m=MI[i];m.t+=dt;const u=m.t/m.life;if(u>=1){S.remove(m.s);m.s.material.dispose();MI.splice(i,1);continue}m.s.position.addScaledVector(m.v,dt);m.s.scale.setScalar(m.s0+(m.s1-m.s0)*Math.sqrt(u));m.s.material.opacity=.9*(1-u)*(1-u)}
  for(let i=SP.length-1;i>=0;i--){const q=SP[i];q.t+=dt;if(q.t<.18)q.m.scale.multiplyScalar(1+dt*2.2);if(q.t>q.life-2)q.m.material.opacity=Math.max(0,(q.life-q.t)/2);if(q.t>=q.life){S.remove(q.m);q.m.material.dispose();SP.splice(i,1)}}}
 function clear(){D.length=0;drops.count=0;SP.forEach(q=>S.remove(q.m));SP.length=0;MI.forEach(m=>S.remove(m.s));MI.length=0}
 return{hit,update,clear}})();
// ---- realistic combat FX: streak sparks, tumbling debris fragments, soft smoke, flash, bullet-hole decals, tracers, casings
const FX=(()=>{const MS=420,MD=160,up=new T.Vector3(0,1,0),o=new T.Object3D(),tv=new T.Vector3(),tq=new T.Quaternion();
 const canv=(n,f)=>{const c=document.createElement('canvas');c.width=c.height=n;f(c.getContext('2d'),n);const t=new T.CanvasTexture(c);t.generateMipmaps=false;t.minFilter=T.LinearFilter;return t};
 const smokeTex=canv(128,(g,n)=>{for(let i=0;i<26;i++){const x=n/2+(Math.random()-.5)*n*.42,y=n/2+(Math.random()-.5)*n*.42,r=n*(.12+Math.random()*.2),rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(255,255,255,.22)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,n,n)}});
 const flashTex=canv(64,(g,n)=>{const rg=g.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.25,'rgba(255,230,190,.7)');rg.addColorStop(1,'rgba(255,140,60,0)');g.fillStyle=rg;g.fillRect(0,0,n,n)});
 const holeTex=canv(128,(g,n)=>{const c=n/2;let rg=g.createRadialGradient(c,c,0,c,c,c);rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(.16,'rgba(8,8,10,1)');rg.addColorStop(.24,'rgba(30,30,34,.9)');rg.addColorStop(.5,'rgba(20,18,20,.45)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,n,n);
  g.strokeStyle='rgba(5,5,6,.75)';for(let i=0;i<9;i++){const a=Math.random()*6.283,l=c*(.35+Math.random()*.5);g.lineWidth=.8+Math.random()*1.4;g.beginPath();g.moveTo(c+Math.cos(a)*c*.15,c+Math.sin(a)*c*.15);g.lineTo(c+Math.cos(a+.2)*l*.6,c+Math.sin(a+.2)*l*.6);g.lineTo(c+Math.cos(a)*l,c+Math.sin(a)*l);g.stroke()}
  g.fillStyle='rgba(160,160,170,.35)';for(let i=0;i<40;i++){const a=Math.random()*6.283,r=c*(.2+Math.random()*.25);g.fillRect(c+Math.cos(a)*r,c+Math.sin(a)*r,1.4,1.4)}});
 // sparks: stretched additive needles; debris: chipped low-poly fragments
 const sparkM=new T.MeshBasicMaterial({color:0xffffff,vertexColors:false,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const sparks=new T.InstancedMesh(new T.CylinderGeometry(1,1,1,5,1),sparkM,MS);sparks.instanceColor=new T.InstancedBufferAttribute(new Float32Array(MS*3),3);sparks.count=0;sparks.frustumCulled=false;S.add(sparks);
 const dg=new T.IcosahedronGeometry(1,0);{const p=dg.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*(.6+Math.random()*.7),p.getY(i)*(.4+Math.random()*.5),p.getZ(i)*(.6+Math.random()*.7));dg.computeVertexNormals()}
 const debM=new T.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:.15,flatShading:true});
 const deb=new T.InstancedMesh(dg,debM,MD);deb.instanceColor=new T.InstancedBufferAttribute(new Float32Array(MD*3),3);deb.count=0;deb.frustumCulled=false;S.add(deb);
 const SP=[],DB=[],SM=[],FL=[],DC=[],TRK=[],CS=[];const col=new T.Color();
 const csG=new T.CylinderGeometry(.0055,.0055,.026,8);csG.rotateZ(Math.PI/2);const csM=new T.MeshStandardMaterial({color:0xc9a04a,metalness:1,roughness:.28});const casings=new T.InstancedMesh(csG,csM,48);casings.count=0;casings.frustumCulled=false;S.add(casings);
 function spark(p,v,c,life,w){if(SP.length>=MS)SP.shift();SP.push({p:p.clone(),v,c:new T.Color(c),l:life,L:life,w:w||.006})}
 function debris(p,v,c,s){if(DB.length>=MD)DB.shift();DB.push({p:p.clone(),v,c:new T.Color(c),s,r:new T.Euler(Math.random()*6,Math.random()*6,Math.random()*6),w:new T.Vector3((Math.random()-.5)*20,(Math.random()-.5)*20,(Math.random()-.5)*20),l:2.5+Math.random()})}
 function smoke(p,v,c,s0,s1,life,op){if(SM.length>70){const q=SM.shift();S.remove(q.s);q.s.material.dispose()}const m=new T.SpriteMaterial({map:smokeTex,color:c,transparent:true,depthWrite:false,opacity:0});m.rotation=Math.random()*6.28;const s=new T.Sprite(m);s.position.copy(p);S.add(s);SM.push({s,v,s0,s1,t:0,L:life,op,rs:(Math.random()-.5)*1.2})}
 function flash(p,c,size,life){const m=new T.SpriteMaterial({map:flashTex,color:c,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});const s=new T.Sprite(m);s.position.copy(p);s.scale.setScalar(size);S.add(s);FL.push({s,t:0,L:life,size})}
 const holeG=new T.PlaneGeometry(1,1);const holeM=new T.MeshStandardMaterial({map:holeTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.9,metalness:.1});
 function decal(p,n,s){if(DC.length>=70){const q=DC.shift();S.remove(q.m);q.g&&S.remove(q.g)}const m=new T.Mesh(holeG,holeM.clone());m.position.copy(p).addScaledVector(n,.01);m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);m.rotateZ(Math.random()*6.28);m.scale.setScalar(s);S.add(m);
  const g=new T.Mesh(holeG,new T.MeshBasicMaterial({map:flashTex,color:0xff7a2a,transparent:true,depthWrite:false,blending:T.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-5,toneMapped:false}));g.position.copy(m.position).addScaledVector(n,.002);g.quaternion.copy(m.quaternion);g.scale.setScalar(s*.55);S.add(g);DC.push({m,g,t:0})}
 const rv=(k)=>new T.Vector3((Math.random()-.5)*k,(Math.random()-.5)*k,(Math.random()-.5)*k);
 // bullet hitting a surface: hot spark spray along the reflection, chips flung out, dust puff, brief flash, scorched hole
 function impact(p,n,c,k){k=k||1;n=n||up;const d=rc.ray.direction.clone(),rf=d.clone().sub(n.clone().multiplyScalar(2*d.dot(n))).normalize();
  flash(p.clone().addScaledVector(n,.04),new T.Color(1,.85,.6).lerp(new T.Color(c),.3),.38*k,.07);
  for(let i=0;i<Math.round(10*k);i++){const v=rf.clone().multiplyScalar(4+Math.random()*9).add(n.clone().multiplyScalar(Math.random()*4)).add(rv(5));spark(p,v,i%3?0xffb060:0xfff0d0,.18+Math.random()*.35,.004+Math.random()*.004)}
  for(let i=0;i<Math.round(5*k);i++){const v=n.clone().multiplyScalar(2+Math.random()*4).add(rv(4));v.y+=1.5;debris(p.clone().addScaledVector(n,.03),v,new T.Color(.18+Math.random()*.1,.18+Math.random()*.1,.2+Math.random()*.1),.012+Math.random()*.03)}
  smoke(p.clone().addScaledVector(n,.08),n.clone().multiplyScalar(.6).add(new T.Vector3(0,.25,0)),0x8a8c96,.12*k,.9*k,1.1,.55);smoke(p.clone().addScaledVector(n,.03),n.clone().multiplyScalar(1.4),0xb7b9c2,.06,.45*k,.45,.5);
  decal(p,n,.13+.05*k);if(!impact._t||performance.now()-impact._t>35){impact._t=performance.now();SND.impact(p)}}
 // generic burst (explosions, block breaks, skills): fireball flashes, smoke column, spark shower, chunky debris
 function blast(p,c,k){k=k||1;flash(p,new T.Color(1,.75,.45),3.2*k,.16);flash(p,c,2.2*k,.28);
  for(let i=0;i<6*k;i++)smoke(p.clone().add(rv(.8*k)),rv(1.5).add(new T.Vector3(0,1.3,0)),i%2?0x3a3b42:0x5a5c66,.6*k,2.6*k,2.2+Math.random(),.6);
  for(let i=0;i<9*k;i++){const fb=smoke(p.clone().add(rv(.7*k)),rv(3.5).add(new T.Vector3(0,1,0)),i%3?0xff8a30:0xffd27a,.5*k,1.9*k,.45+Math.random()*.25,.85);}
  for(let i=0;i<3;i++)flash(p.clone().add(rv(.8*k)),new T.Color(1,.6,.25),1.6*k,.22+i*.05);
  for(let i=0;i<40*k;i++)spark(p,rv(1).normalize().multiplyScalar(6+Math.random()*16).add(new T.Vector3(0,3,0)),i%4?0xffa040:0xffffff,.4+Math.random()*.8,.006+Math.random()*.008);
  for(let i=0;i<14*k;i++)debris(p,rv(1).normalize().multiplyScalar(4+Math.random()*9).add(new T.Vector3(0,4,0)),new T.Color(.12,.12,.14),.04+Math.random()*.08)}
 function puff(p,c,k){k=k||1;for(let i=0;i<4;i++)smoke(p.clone().add(rv(.3)),rv(1.2).add(new T.Vector3(0,.4,0)),c,.15*k,.8*k,.6,.45);for(let i=0;i<8*k;i++)spark(p,rv(1).normalize().multiplyScalar(2+Math.random()*4),c,.25+Math.random()*.3,.005)}
 function breakChunks(p,c){for(let i=0;i<7;i++)debris(p.clone().add(rv(.5)),rv(1).normalize().multiplyScalar(3+Math.random()*5).add(new T.Vector3(0,3,0)),new T.Color(c).multiplyScalar(.6+Math.random()*.4),.05+Math.random()*.09);smoke(p,new T.Vector3(0,.6,0),0x6a6c74,.4,1.8,1.4,.5)}
 // tracer: a short hot streak racing down the path, plus a faint fading trail
 const trM=new T.MeshBasicMaterial({color:0xffffff,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});const trG=new T.CylinderGeometry(1,1,1,6,1,true);
 function tracer(a,b,c){const len=a.distanceTo(b);if(len<.3)return;const dir=b.clone().sub(a).normalize(),q=new T.Quaternion().setFromUnitVectors(up,dir);
  const head=new T.Mesh(trG,trM.clone());head.material.color.set(new T.Color(1,.9,.7).lerp(new T.Color(c),.55));head.quaternion.copy(q);head.frustumCulled=false;S.add(head);
  const trail=new T.Mesh(trG,trM.clone());trail.material.color.set(c);trail.quaternion.copy(q);trail.frustumCulled=false;S.add(trail);
  TRK.push({a:a.clone(),b:b.clone(),dir,len,head,trail,t:0,sp:320})}
 function casing(p,v){if(CS.length>=48)CS.shift();CS.push({p:p.clone(),v,r:new T.Euler(Math.random()*6,Math.random()*6,0),w:new T.Vector3((Math.random()-.5)*40,(Math.random()-.5)*10,(Math.random()-.5)*40),l:2.2,b:0})}
 function update(dt){
  let c=0;for(let i=SP.length-1;i>=0;i--){const s=SP[i];s.l-=dt;if(s.l<=0){SP.splice(i,1);continue}s.v.y-=9.8*dt;s.v.multiplyScalar(1-1.2*dt);s.p.addScaledVector(s.v,dt);if(s.p.y<.02&&s.v.y<0){s.p.y=.02;s.v.y*=-.35;s.v.x*=.6;s.v.z*=.6}}
  for(const s of SP){const sp=s.v.length(),u=s.l/s.L;o.position.copy(s.p);o.quaternion.setFromUnitVectors(up,tv.copy(s.v).divideScalar(sp||1));o.scale.set(s.w*u,Math.min(.5,.012+sp*.022),s.w*u);o.updateMatrix();sparks.setMatrixAt(c,o.matrix);
   col.copy(s.c).multiplyScalar(.4+1.6*u);sparks.setColorAt(c,col);c++}
  sparks.count=c;sparks.instanceMatrix.needsUpdate=true;if(sparks.instanceColor)sparks.instanceColor.needsUpdate=true;
  c=0;for(let i=DB.length-1;i>=0;i--){const d=DB[i];d.l-=dt;if(d.l<=0){DB.splice(i,1);continue}d.v.y-=14*dt;d.p.addScaledVector(d.v,dt);d.r.x+=d.w.x*dt;d.r.y+=d.w.y*dt;d.r.z+=d.w.z*dt;
   if(d.p.y<d.s&&d.v.y<0){d.p.y=d.s;d.v.y*=-.3;d.v.x*=.55;d.v.z*=.55;d.w.multiplyScalar(.5)}}
  for(const d of DB){o.position.copy(d.p);o.rotation.copy(d.r);o.scale.setScalar(d.s*Math.min(1,d.l*2));o.updateMatrix();deb.setMatrixAt(c,o.matrix);deb.setColorAt(c,d.c);c++}
  deb.count=c;deb.instanceMatrix.needsUpdate=true;if(deb.instanceColor)deb.instanceColor.needsUpdate=true;
  for(let i=SM.length-1;i>=0;i--){const m=SM[i];m.t+=dt;const u=m.t/m.L;if(u>=1){S.remove(m.s);m.s.material.dispose();SM.splice(i,1);continue}m.s.position.addScaledVector(m.v,dt);m.v.multiplyScalar(1-1.5*dt);m.v.y+=.25*dt;
   m.s.scale.setScalar(m.s0+(m.s1-m.s0)*(1-Math.pow(1-u,2.2)));m.s.material.rotation+=m.rs*dt;m.s.material.opacity=m.op*Math.min(1,u*8)*(1-u)*(1-u)}
  for(let i=FL.length-1;i>=0;i--){const f=FL[i];f.t+=dt;const u=f.t/f.L;if(u>=1){S.remove(f.s);f.s.material.dispose();FL.splice(i,1);continue}f.s.material.opacity=1-u;f.s.scale.setScalar(f.size*(1+u*.6))}
  for(let i=DC.length-1;i>=0;i--){const q=DC[i];q.t+=dt;if(q.g){q.g.material.opacity=Math.max(0,1-q.t/1.4);if(q.t>1.4){S.remove(q.g);q.g.material.dispose();q.g=null}}if(q.t>14){q.m.material.opacity=Math.max(0,1-(q.t-14)/2);if(q.t>16){S.remove(q.m);q.m.material.dispose();DC.splice(i,1)}}}
  for(let i=TRK.length-1;i>=0;i--){const r=TRK[i];r.t+=dt;const hd=Math.min(r.len,r.t*r.sp),hl=Math.min(3.2,r.len*.4),tl=Math.max(0,hd-hl);
   const mid=r.a.clone().addScaledVector(r.dir,(hd+tl)/2);r.head.position.copy(mid);r.head.scale.set(.012,Math.max(.01,hd-tl),.012);r.head.material.opacity=hd>=r.len?Math.max(0,1-(r.t-r.len/r.sp)*25):1;
   r.trail.position.copy(r.a).addScaledVector(r.dir,hd/2);r.trail.scale.set(.0035,Math.max(.01,hd),.0035);r.trail.material.opacity=Math.max(0,.35-r.t*2.6);
   if(r.t>r.len/r.sp+.15){S.remove(r.head,r.trail);r.head.material.dispose();r.trail.material.dispose();TRK.splice(i,1)}}
  c=0;for(let i=CS.length-1;i>=0;i--){const k=CS[i];k.l-=dt;if(k.l<=0){CS.splice(i,1);continue}k.v.y-=9.8*dt;k.p.addScaledVector(k.v,dt);k.r.x+=k.w.x*dt;k.r.y+=k.w.y*dt;k.r.z+=k.w.z*dt;
   const gy=typeof CITY!=='undefined'&&CITY.hAt?Math.max(0,CITY.hAt(k.p.x,k.p.z)):0;if(k.p.y<gy+.006&&k.v.y<0){k.p.y=gy+.006;k.v.y*=-.35;k.v.x*=.5;k.v.z*=.5;k.w.multiplyScalar(.4);if(k.b++<2&&Math.hypot(k.p.x-P.x,k.p.z-P.z)<4)tink(k.b)}}
  for(const k of CS){o.position.copy(k.p);o.rotation.copy(k.r);o.scale.setScalar(1);o.updateMatrix();casings.setMatrixAt(c++,o.matrix)}casings.count=c;casings.instanceMatrix.needsUpdate=true}
 function tink(b){if(!AC)return;try{const t0=AC.currentTime+Math.random()*.02,out=sfxOut();for(const f of[4200,6100,8300]){const os=AC.createOscillator(),g=AC.createGain();os.frequency.value=f*(1+(Math.random()-.5)*.05);g.gain.setValueAtTime(.025/b,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.09);os.connect(g).connect(out);os.start(t0);os.stop(t0+.1)}}catch(e){}}
 function clear(){SP.length=DB.length=CS.length=0;SM.forEach(m=>S.remove(m.s));SM.length=0;FL.forEach(f=>S.remove(f.s));FL.length=0;DC.forEach(q=>{S.remove(q.m);q.g&&S.remove(q.g)});DC.length=0;TRK.forEach(r=>S.remove(r.head,r.trail));TRK.length=0}
 return{impact,blast,puff,breakChunks,tracer,casing,smoke,update,clear,flash}})();
const hNrm=h=>h&&h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):new T.Vector3(0,1,0);
function burst(p,n,col,sp){if(n>=18)FX.blast(p,new T.Color(col),Math.min(1.6,n/24));else FX.puff(p,col,n<=4?.6:1)}
// per-shot micro detail: ejected brass on ballistic weapons and a wisp of muzzle smoke
const BRASS={pulse:1,smg:1,burst:1,chain:1,scatter:2};
function fxShot(){try{C.updateMatrixWorld(true);const mp=new T.Vector3();barrel.getWorldPosition(mp);FX.smoke(mp,new T.Vector3(0,.35,0).addScaledVector(rc.ray.direction,.6),0xa8aab4,.03,.32,.7,.22);
 const b=BRASS[Wp.id];if(b){const ep=C.localToWorld(new T.Vector3(.22,-.17,-.48)),r=new T.Vector3(1,0,0).transformDirection(C.matrixWorld),u=new T.Vector3(0,1,0).transformDirection(C.matrixWorld),f=new T.Vector3(0,0,-1).transformDirection(C.matrixWorld);
  FX.casing(ep,r.multiplyScalar(2.2+rnd()*1.2).addScaledVector(u,1.6+rnd()).addScaledVector(f,-.4+rnd()*.3).add(V))}}catch(e){}}
let dirty=0,shake=0;
function destroy(pt,r){const rm=new Set(BM.filter(m=>m.position.distanceTo(pt)<r+.8));if(!rm.size)return;rm.forEach(m=>{S.remove(m);B.delete(k(m.userData.i,m.userData.j,m.userData.k));FX.breakChunks(m.position,m.userData.col)});BM=BM.filter(m=>!rm.has(m));dirty=1}
function settle(){BM.sort((a,b)=>a.userData.j-b.userData.j);let mv=0;for(const m of BM){const u=m.userData;if(u.j>0&&!B.has(k(u.i,u.j-1,u.k))){const n=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>B.has(k(u.i+a,u.j,u.k+b))).length;if(n<=1){B.delete(k(u.i,u.j,u.k));u.j--;B.set(k(u.i,u.j,u.k),m);m.position.y-=2;mv=1}}}dirty=mv}

// enemies
// SPIDER ROBOT enemy (from the supplied OBJ: 393k tris, decimated to two LODs, quantized + base64)
const SPIDER_LODS=[{p:{"body":[0,11436,21108],"glow":[313992,176,159],"leg0":[206700,1615,2579],"leg1":[233480,1606,2588],"leg2":[260252,1596,2576],"leg3":[286880,1628,2619]},piv:[[0.211,0.439,0.211],[-0.211,0.439,0.211],[-0.211,0.439,-0.211],[0.211,0.439,-0.211]],lo:[-1.07369, -0.00124, -0.83964],sc:[3.275981934437009e-05, 2.226907159711627e-05, 2.562417029068419e-05],b:"<<assets/data_52.b64>>"},{p:{"body":[0,3255,5627],"glow":[94472,176,159],"leg0":[56548,571,889],"leg1":[65880,604,918],"leg2":[75616,564,857],"leg3":[84708,600,927]},piv:[[0.211,0.439,0.211],[-0.211,0.439,0.211],[-0.211,0.439,-0.211],[0.211,0.439,-0.211]],lo:[-1.07267, 0.06066, -0.83838],sc:[3.272086228496318e-05, 2.1392622191397363e-05, 2.5591495843947552e-05],b:"<<assets/data_53.b64>>"}];
const SPM=SPIDER_LODS.map(L=>{const bin=Uint8Array.from(atob(L.b),c=>c.charCodeAt(0)).buffer,PAL=[[.028,.028,.032],[.20,.21,.23],[.05,.05,.06],[.30,.31,.34]];
 const geo=(k,piv)=>{const[o0,nv,nt]=L.p[k];let o=o0;const q=new Uint16Array(bin,o,nv*3);o+=nv*6;const ix=new Uint16Array(bin,o,nt*3);o+=nt*6;const ci=new Uint8Array(bin,o,nv);
  const pos=new Float32Array(nv*3),col=new Float32Array(nv*3);for(let i=0;i<nv;i++){for(let a=0;a<3;a++)pos[i*3+a]=L.lo[a]+q[i*3+a]*L.sc[a]-(piv?piv[a]:0);col.set(PAL[ci[i]],i*3)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(new T.BufferAttribute(new Uint16Array(ix),1));g.computeBoundingSphere();return g};
 return{body:geo('body'),glow:geo('glow'),legs:[0,1,2,3].map(i=>geo('leg'+i,L.piv[i])),piv:L.piv}});
SPIDER_LODS.forEach(L=>L.b=null);
const hitGeo=new T.BoxGeometry(2.1,2.1,2.1);hitGeo.translate(0,-.15,0);
const glowM=new T.MeshBasicMaterial({color:new T.Color(0x1a8cff).multiplyScalar(1.8),toneMapped:false}),UPV=new T.Vector3(0,1,0),qa=new T.Quaternion(),qb=new T.Quaternion();
const LAX=SPM[0].piv.map(p=>new T.Vector3(p[2],0,-p[0]).normalize());
function spiderModel(mat){return SPM.map(L=>{const w=new T.Group();w.position.y=-1.2;w.scale.setScalar(1.45);const b=new T.Group();b.add(new T.Mesh(L.body,mat),new T.Mesh(L.glow,glowM));w.add(b);
 const legs=L.legs.map((g,i)=>{const p=new T.Group();p.position.fromArray(L.piv[i]);p.add(new T.Mesh(g,mat));w.add(p);return p});return{w,b,legs}})}
// walk cycle: diagonal leg pairs alternate (lift about the hip, swing about vertical); near/far detail by distance
function spAnim(e,dist){const near=dist<16;e.lv[0].w.visible=near;e.lv[1].w.visible=!near;const L=e.lv[near?0:1],ph=e.ph;
 for(let i=0;i<4;i++){const p=ph+(i%2?Math.PI:0),sn=Math.sin(p);qa.setFromAxisAngle(LAX[i],-Math.max(0,sn)*.38);qb.setFromAxisAngle(UPV,Math.cos(p)*.26);L.legs[i].quaternion.copy(qb).multiply(qa)}
 L.b.position.y=Math.abs(Math.sin(ph))*.03;L.b.rotation.z=Math.sin(ph)*.025}
let EN=[];
function spawn(w){let sx=0,sz=0;for(let i=0;i<40;i++){const a=rnd()*6.28,r=38+rnd()*24;sx=cl(P.x+Math.cos(a)*r,CITY.bounds[0]+4,CITY.bounds[1]-4);sz=cl(P.z+Math.sin(a)*r,CITY.bounds[2]+4,CITY.bounds[3]-4);if(!solid(sx,.4,sz)&&!solid(sx,1.4,sz)&&Math.hypot(sx-P.x,sz-P.z)>25)break}const mat=new T.MeshStandardMaterial({vertexColors:true,metalness:.6,roughness:.34,flatShading:true,side:T.DoubleSide,emissive:0x000000,emissiveIntensity:0}),m=new T.Mesh(hitGeo,mat);
 m.layers.set(1);m.position.set(sx,1.2,sz);const lv=spiderModel(mat);lv.forEach(l=>m.add(l.w));lv[1].w.visible=false;
 m.userData.en=1;const e={m,lv,ph:rnd()*6.28,fl:0,hp:60+w*4,sp:3+w*.25+rnd(),eat:0};m.userData.e=e;S.add(m);EN.push(e)}

// ---- spider death: the final hit knocks it back, it rears and topples over onto its back/side under gravity,
//      bounces once on its own geometry, the legs draw in to a death curl with fading twitches, then it lies there
const DEAD=[],_db=new T.Box3(),_dq=new T.Quaternion(),_dq2=new T.Quaternion(),_dv=new T.Vector3(),XAX=new T.Vector3(1,0,0),ZAX=new T.Vector3(0,0,1);
function spDie(e){const m=e.m;m.userData.en=0;m.userData.e=null;m.raycast=()=>{};
 const L=e.lv[0];e.lv[0].w.visible=true;e.lv[1].w.visible=false;L.b.rotation.set(0,0,0);L.b.position.set(0,0,0);
 const away=_dv.set(m.position.x-P.x,0,m.position.z-P.z);if(away.lengthSq()<1e-4)away.set(0,0,1);away.normalize();
 const yaw=m.rotation.y,fwd=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw)),back=fwd.dot(away)<.2;   // shot from the front -> topples backwards; from behind -> pitches forward
 DEAD.push({e,m,L,t:0,a:0,w:0,y:m.position.y,vy:1.4,vx:away.x*3.2,vz:away.z*3.2,dir:back?-1:1,roll:(rnd()-.5)*1.1,ry:yaw,end:back?-(2.55+rnd()*.5):(1.9+rnd()*.4),bounced:0,curl:legsNow(L),tw:rnd()*9,mat:m.children[0]&&e.lv[0].b.children[0].material});
 if(DEAD.length>14){const o=DEAD.shift();S.remove(o.m)}}
function legsNow(L){return L.legs.map(g=>g.quaternion.clone())}
// highest walkable surface under (x,z) at or below height y (street, deck, bridge or roof)
const _gr=new T.Raycaster(),_gd=new T.Vector3(0,-1,0);
function groundBelow(x,y,z){let g=0;for(let h=y;h>-1;h-=.1)if(CITY.sol(x,h-.05,z)){g=h;break}
 // refine against the real collider boxes (the 1 m grid is coarse): highest box top under the body, else the street
 _gr.set(new T.Vector3(x,y+.4,z),_gd);_gr.far=y+2;const hs=_gr.intersectObjects(CITY.proxies,false);const top=hs.length?hs[0].point.y:0;
 return Math.abs(top-g)<.6?top:g}
const ASH=[],SHARD=[];
function glassBurst(g,pt){const N=420,pos=new Float32Array(N*3),vel=[],n=g.userData.glass.n,c=g.position,L=g.scale.z,ry=g.rotation.y,ax=Math.sin(ry),az=Math.cos(ry);
 for(let i=0;i<N;i++){const u=(Math.random()-.5)*L,h=(Math.random()-.5)*4.8;pos[i*3]=c.x+ax*u;pos[i*3+1]=c.y+h;pos[i*3+2]=c.z+az*u;const out=(Math.random()<.5?-1:1)*(.5+Math.random()*2.5);vel.push(n[0]*out+(rnd()-.5)*1.2,Math.random()*2,n[2]*out+(rnd()-.5)*1.2)}
 const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));const pm=new T.PointsMaterial({color:0xbfeaff,size:.07,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false});
 const pt_=new T.Points(ge,pm);pt_.frustumCulled=false;S.add(pt_);SHARD.push({pt:pt_,pos,vel,t:0});
 try{for(let k=0;k<4;k++)AUD.impact(new T.Vector3(c.x+ax*(k-1.5)*L/4,c.y+(Math.random()-.5)*2,c.z+az*(k-1.5)*L/4),'glass');if(typeof AC!=='undefined'&&AC)SND.impact(pt||c)}catch(e){}
 shake=Math.max(shake,.08)}
function stepShards(dt){for(let k=SHARD.length-1;k>=0;k--){const a=SHARD[k];a.t+=dt;for(let i=0;i<a.vel.length/3;i++){a.vel[i*3+1]-=26*dt;a.pos[i*3]+=a.vel[i*3]*dt;a.pos[i*3+1]+=a.vel[i*3+1]*dt;a.pos[i*3+2]+=a.vel[i*3+2]*dt}
  a.pt.geometry.attributes.position.needsUpdate=true;a.pt.material.opacity=Math.max(0,.9*(1-a.t/2.2));if(a.t>2.2){S.remove(a.pt);a.pt.geometry.dispose();a.pt.material.dispose();SHARD.splice(k,1)}}}
function ashBurst(d){const b=_db.setFromObject(d.L.w),N=260,pos=new Float32Array(N*3),vel=[];
 for(let i=0;i<N;i++){pos[i*3]=b.min.x+Math.random()*(b.max.x-b.min.x);pos[i*3+1]=b.min.y+Math.random()*(b.max.y-b.min.y);pos[i*3+2]=b.min.z+Math.random()*(b.max.z-b.min.z);vel.push(rnd()-.5,.6+Math.random()*1.6,rnd()-.5)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
 const pm=new T.PointsMaterial({color:0x8a5cff,size:.09,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false});const pt=new T.Points(g,pm);pt.frustumCulled=false;S.add(pt);ASH.push({pt,pos,vel,t:0})}
function stepAsh(dt){for(let k=ASH.length-1;k>=0;k--){const a=ASH[k];a.t+=dt;for(let i=0;i<a.vel.length/3;i++){a.vel[i*3+1]+=dt*.8;a.pos[i*3]+=a.vel[i*3]*dt;a.pos[i*3+1]+=a.vel[i*3+1]*dt;a.pos[i*3+2]+=a.vel[i*3+2]*dt}
  a.pt.geometry.attributes.position.needsUpdate=true;a.pt.material.opacity=Math.max(0,.95*(1-a.t/1.3));a.pt.material.color.setHSL(.72,.8,.6*(1-a.t/1.6)+.05);if(a.t>1.3){S.remove(a.pt);a.pt.geometry.dispose();a.pt.material.dispose();ASH.splice(k,1)}}}
function stepDead(dt){stepAsh(dt);stepShards(dt);for(let k=DEAD.length-1;k>=0;k--){const d=DEAD[k],m=d.m;d.t+=dt;const t=d.t;
  // topple about the hip line: gravity torque grows as it tips past balance; one damped bounce when it lands on its back/side
  if(t<1.6){const th=Math.abs(d.a),acc=5+21*Math.sin(Math.min(Math.PI/2,th+.25));if(!d.bounced||t<1.4){d.w+=acc*dt;d.a+=Math.sign(d.end)*d.w*dt*(t<.12?2.2:1)}
   if(Math.abs(d.a)>=Math.abs(d.end)){d.a=d.end;if(d.bounced<2&&d.w>1.2){d.w=-d.w*.28;d.bounced++;shakeAt(m.position,.05)}else d.w=0}
   if(d.bounced&&d.w<0){d.a+=Math.sign(d.end)*d.w*dt;d.w+=acc*dt;if(d.w>0)d.w=Math.min(d.w,4)}}
  // knock-back slide with ground friction
  const fr=Math.max(0,1-dt*4.5);d.vx*=fr;d.vz*=fr;m.position.x+=d.vx*dt;m.position.z+=d.vz*dt;
  const rk=Math.min(1,Math.abs(d.a)/Math.abs(d.end));_dq.setFromAxisAngle(XAX,d.a);_dq2.setFromAxisAngle(ZAX,d.roll*rk);m.quaternion.setFromAxisAngle(UPV,d.ry).multiply(_dq).multiply(_dq2);
  // real fall: free-fall at game gravity onto whatever is below (street, deck, roof), resting on its own lowest point
  m.position.y=d.y;m.updateMatrixWorld(true);_db.setFromObject(d.L.w);const off=d.y-_db.min.y,gr=groundBelow(m.position.x,_db.min.y+.3,m.position.z);
  d.vy-=26*dt;d.y+=d.vy*dt;if(d.y-off<=gr){d.y=gr+off;if(d.vy<-4){d.vy=-d.vy*.18;shakeAt(m.position,.06)}else d.vy=0}m.position.y=d.y;
  // legs: flail on the hit, then draw in to the death curl; small decaying nerve twitches
  {const cu=Math.min(1,Math.max(0,(t-.15)/.9)),ce=cu*cu*(3-2*cu);for(let i=0;i<d.L.legs.length;i++){const ax=LAX[i%LAX.length],tw=Math.exp(-t*1.6)*Math.sin(t*(23+i*3)+d.tw+i)*.22*(t>.5?1:0),fl=t<.3?Math.sin(t*30+i*1.7)*.35*(1-t/.3):0;
    _dq.setFromAxisAngle(ax,(1.15*ce+fl+tw));_dq2.setFromAxisAngle(UPV,(i%2?1:-1)*.35*ce);d.L.legs[i].quaternion.copy(d.curl[i]).slerp(_dq2.multiply(_dq),Math.min(1,ce+.15))}}
  // 2 s after death: disintegrate into drifting embers and ash
  if(t>=2&&!d.ash){d.ash=1;ashBurst(d);m.traverse(o=>{if(o.isMesh&&o.material&&o.material!==glowM&&!o.material.userData.dis){o.material.userData.dis=1;o.material.transparent=true}if(o.isMesh&&o.material===glowM)o.visible=false})}
  if(d.ash){const u=Math.min(1,(t-2)/.7);m.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData.dis)o.material.opacity=1-u});if(u>=1){S.remove(m);DEAD.splice(k,1)}}}}
function shakeAt(p,k){const d=p.distanceTo(P);if(d<14)shake=Math.max(shake,k*(1-d/14))}
function clearDead(){DEAD.forEach(d=>S.remove(d.m));DEAD.length=0;ASH.forEach(a=>S.remove(a.pt));ASH.length=0}
// claw slash: front legs rear up (wind-up), swipe down and across (strike), then recover; damage lands at the strike frame
const FRONT=SPM[0].piv.map((p,i)=>[p[2],i]).sort((a,b)=>b[0]-a[0]).slice(0,2).map(a=>a[1]);
function spSlash(e,d,dt){const inR=d<2.5&&Math.abs(P.y+.9-e.m.position.y)<1.7;e.scd=(e.scd||0)-dt;
 if(e.sl==null){if(inR&&e.scd<=0&&!(e.stun>0)){e.sl=0;e.sh=0;e.side=rnd()<.5?1:-1;slashSnd(0)}else return}
 e.sl+=dt*(e.chill>0?.5:1);const t=e.sl,L=e.lv[d<16?0:1];
 const up=t<.28?Math.sin(t/.28*Math.PI/2):t<.40?Math.cos((t-.28)/.12*Math.PI/2)*1.0-(t-.28)/.12*.35:-.35*(1-Math.min(1,(t-.40)/.3));
 const sw=t<.28?-.35*(t/.28):t<.40?-.35+1.25*((t-.28)/.12):.9*(1-Math.min(1,(t-.40)/.35));
 FRONT.forEach((li,k)=>{const sg=(k?1:-1)*e.side;qa.setFromAxisAngle(LAX[li],-up*1.15);qb.setFromAxisAngle(UPV,sw*sg*.8);L.legs[li].quaternion.copy(qb).multiply(qa)});
 L.b.rotation.x=-up*.22;L.b.position.z=(t>.28&&t<.5?Math.sin((t-.28)/.22*Math.PI)*.18:0);
 if(!e.sh&&t>=.34){e.sh=1;if(inR&&!(invT>0||shieldT>0)){takeDmg(14+wave*.8);clawFX(e.side);shake=Math.max(shake,.35);slashSnd(1)}else slashSnd(2)}
 if(t>=.75){e.sl=null;L.b.rotation.x=0;L.b.position.z=0;e.scd=.9+rnd()*.6}}
// screen claw marks: three ragged diagonal streaks that flash and fade
const CLAW=(()=>{const c=document.createElement('canvas');c.id='claw';c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;opacity:0;transition:opacity .45s ease-out';document.body.appendChild(c);return c})();
function clawFX(side){dmgA=Math.max(dmgA,1);return;const c=CLAW,w=c.width=Math.min(innerWidth,1280),h=c.height=Math.round(w*innerHeight/innerWidth),g=c.getContext('2d');g.clearRect(0,0,w,h);
 for(let k=0;k<3;k++){const x0=w*(.30+.13*k)+(side>0?0:w*.05),y0=h*.12+k*h*.04,x1=x0+side*w*.30,y1=h*.82+k*h*.03;
  for(let pass=0;pass<2;pass++){g.beginPath();const N=26;for(let i=0;i<=N;i++){const u=i/N,x=x0+(x1-x0)*u+(Math.random()-.5)*w*.006,y=y0+(y1-y0)*u;const th=(pass?2.2:9)*Math.sin(Math.PI*u)*(w/1280);
    g.lineTo(x-th,y)}for(let i=N;i>=0;i--){const u=i/N,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u,th=(pass?2.2:9)*Math.sin(Math.PI*u)*(w/1280);g.lineTo(x+th,y+th*.4)}
   g.closePath();g.fillStyle=pass?'rgba(255,235,225,.85)':'rgba(150,0,8,.55)';g.shadowColor='rgba(120,0,0,.8)';g.shadowBlur=pass?4:14;g.fill()}}
 c.style.transition='none';c.style.opacity=1;requestAnimationFrame(()=>requestAnimationFrame(()=>{c.style.transition='opacity .7s ease-out .15s';c.style.opacity=0}))}
// slash foley: servo wind-up, air swish, and on a hit a bright metallic scrape plus a body thud
function slashSnd(k){if(!AC)return;try{const t0=AC.currentTime,o=sfxOut();
 const nz=(t,dur,type,f0,f1,q,v)=>{const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=noiseBuf();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+dur*.25);g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(f).connect(g).connect(o);n.start(t,Math.random()*.5);n.stop(t+dur+.02)};
 if(k===0){const s=AC.createOscillator(),g=AC.createGain();s.type='sawtooth';s.frequency.setValueAtTime(140,t0);s.frequency.exponentialRampToValueAtTime(420,t0+.26);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.05,t0+.08);g.gain.exponentialRampToValueAtTime(.0001,t0+.28);const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;s.connect(f).connect(g).connect(o);s.start(t0);s.stop(t0+.3);return}
 nz(t0,.16,'bandpass',900,4200,1.4,.35);
 if(k===1){nz(t0+.01,.22,'bandpass',5200,2600,6,.22);nz(t0+.02,.18,'bandpass',3300,1800,9,.16);const s=AC.createOscillator(),g=AC.createGain();s.frequency.setValueAtTime(95,t0);s.frequency.exponentialRampToValueAtTime(45,t0+.15);g.gain.setValueAtTime(.4,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.18);s.connect(g).connect(o);s.start(t0);s.stop(t0+.2)}}catch(e){}}
function spiderPush(){const RR=1.4;for(const e of EN){const q=e.m.position;if(P.y>q.y+1.05||P.y+1.8<q.y-1.2)continue;const dx=P.x-q.x,dz=P.z-q.z,d=Math.hypot(dx,dz);if(d>=RR)continue;
 const ux=d>1e-4?dx/d:Math.sin(yaw),uz=d>1e-4?dz/d:Math.cos(yaw),px=q.x+ux*RR,pz=q.z+uz*RR;
 if(!hit(px,P.y,pz)){P.x=px;P.z=pz}else if(!hit(px,P.y,P.z))P.x=px;else if(!hit(P.x,P.y,pz))P.z=pz;
 const vn=V.x*ux+V.z*uz;if(vn<0){V.x-=vn*ux;V.z-=vn*uz}}}
function hurt(e,d){if(e.d)return;e.hp-=d;e.fl=.07;if(e.hp>0&&!(e._ah>performance.now())){e._ah=performance.now()+180;AUD.spHit(e)}if(e.hp<=0){e.d=1;AUD.spDie(e);spDie(e);{const bp=e.m.position.clone();bp.y+=.2;BLOOD.hit(bp,new T.Vector3(e.m.position.x-P.x,.3,e.m.position.z-P.z).normalize(),2.4);BLOOD.hit(bp,new T.Vector3(rnd()-.5,.6,rnd()-.5).normalize(),1.6)}score+=100;SK.k++;feed('<b>YOU</b> <i>['+dsrc+']</i> SWARMER');shake=Math.max(shake,.12);EN=EN.filter(x=>x!==e);beep(90,.2,'sawtooth',.15)}}

// player, gun, drone
const P=new T.Vector3(0,0,34),V=new T.Vector3(),dashDir=new T.Vector3();
let yaw=0,pitch=0,ground=1,slideT=0,hp=100,maxHP=100,ammo=30,rel=0,fcd=0,bcd=0,scd=0,wave=1,score=0,wt=0,go=false,rec=0,last=performance.now();
let dashT=0,invT=0,shieldT=0,droneT=0,dshot=0,slowT=0,healA=0,dmgA=0;
let Wp=WEAPONS[0],Ar=ARMORS[1],Sk=SKILLS[1];
// control-layout state: stance 0 stand / 1 crouch / 2 prone, ADS blend, sprint, loadout slots, tactical, streaks
let stance=0,eyeH=1.65,ads=0,adsW=false,sprinting=false,sprintLock=false,swapT=0,slots=[WEAPONS[0],WEAPONS[3]],slotAmmo=[30,40],cur=0,tacN=2,tacT=0,dsrc='',trig=false,cdT=0;
const STM=[1,.55,.25],EYE=[1.65,1.15,.55];
const FMODE={pulse:'ads',scatter:'hip',rail:'release',smg:'hip',arc:'mixed',ion:'hip',cryo:'hip',void:'onetap',burst:'ads',chain:'hip'};
const ADS_T={rail:.32,void:.3,arc:.28,burst:.22,scatter:.24},ADS_Z={rail:.45,void:.3};
const STREAKS=[{n:'SENTRY',c:5},{n:'STRIKE',c:10},{n:'OVERDRIVE',c:15}],SK={k:0,used:[0,0,0]};
function feed(h){const kf=$('kf'),d=document.createElement('div');d.innerHTML=h;kf.prepend(d);while(kf.children.length>4)kf.lastChild.remove();setTimeout(()=>d.remove(),3500)}
const gun=new T.Group();gun.position.set(.3,-.28,-.6);C.add(gun);
let barrel,mf;
let gunWrap,gunParts,gunModelG,fpRel={last:null},fpS=-1;const FPD=[];
// ---- grapple hardware: braided steel cable, four-prong claw, and a pistol-style launcher (first person and holstered on the avatar)
const GRG=(()=>{
 // 6-strand wire rope: helical strands with dark valleys between them and fine counter-twisted wires on each strand
 const cTex=(()=>{const N=64,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N,v=y/N,s=((u+v)*6)%1,st=Math.sin(Math.PI*s),fine=.5+.5*Math.sin((u-v)*36*Math.PI*2),val=Math.pow(st,.55)*(.72+.28*fine);
   const i=(y*N+x)*4,c_=30+val*215;im.data[i]=c_;im.data[i+1]=c_;im.data[i+2]=c_*1.03;im.data[i+3]=255}
  g.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t})();
 const cableM=new T.MeshStandardMaterial({color:0xc2c6ce,map:cTex,bumpMap:cTex,bumpScale:.004,metalness:.9,roughness:.34});
 const coilM=cableM.clone();coilM.map=cTex.clone();coilM.map.needsUpdate=true;coilM.map.repeat.set(14,1);coilM.bumpMap=coilM.map;
 const steel=new T.MeshStandardMaterial({color:0x4a4e57,metalness:.92,roughness:.3}),dark=new T.MeshStandardMaterial({color:0x121418,metalness:.8,roughness:.32}),
  poly=new T.MeshStandardMaterial({color:0x08090b,metalness:.15,roughness:.7}),tipM=new T.MeshStandardMaterial({color:0x9aa0aa,metalness:1,roughness:.18}),
  led=new T.MeshBasicMaterial({color:0x0b4dff});
 const cyl=(r0,r1,h,s=14)=>new T.CylinderGeometry(r0,r1,h,s),box=(x,y,z)=>new T.BoxGeometry(x,y,z);
 const add=(p,g,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o};
 // claw: shaft along +z, four hinged talons; open(k) swings them from folded (0) to fully spread (1)
 function seg(p,a,b,r0,r1,m){const d=new T.Vector3().subVectors(b,a),L=d.length(),o=new T.Mesh(cyl(r1,r0,L,8),m);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());p.add(o);return o}
 function claw(s=1){const g=new T.Group(),pr=[],V=(x,y,z)=>new T.Vector3(x,y,z);
  add(g,cyl(.017,.02,.15),dark,0,0,-.06,Math.PI/2);add(g,cyl(.03,.03,.04,16),steel,0,0,.02,Math.PI/2);add(g,new T.ConeGeometry(.03,.05,16),tipM,0,0,.065,Math.PI/2);
  add(g,new T.TorusGeometry(.017,.005,6,14),steel,0,0,-.14);
  for(let k=0;k<4;k++){const hub=new T.Group();hub.rotation.z=k*Math.PI/2+Math.PI/4;g.add(hub);const h=new T.Group();h.position.set(0,.026,.01);hub.add(h);
   add(h,cyl(.009,.009,.02,10),steel,0,0,0,0,0,Math.PI/2);                              // hinge pin
   const P=[V(0,0,0),V(0,.035,.045),V(0,.05,.10),V(0,.042,.15),V(0,.018,.185)];
   seg(h,P[0],P[1],.010,.009,dark);seg(h,P[1],P[2],.009,.008,dark);seg(h,P[2],P[3],.008,.0065,dark);
   for(const q of[P[1],P[2],P[3]]){const j=new T.Mesh(new T.SphereGeometry(.0095,8,6),dark);j.position.copy(q);h.add(j)}
   const tip=new T.Mesh(new T.ConeGeometry(.0068,.04,8),tipM);const d=P[4].clone().sub(P[3]);tip.position.copy(P[3]).addScaledVector(d,.5);tip.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());h.add(tip);
   pr.push(h)}
  g.scale.setScalar(s);g.userData.open=k=>pr.forEach(h=>h.rotation.x=.42-k*1.3);g.userData.open(0);return g}
 // launcher: receiver, barrel with the claw seated in the muzzle, cable spool on the side, pistol grip, trigger and guard, status light
 function gun(){const g=new T.Group();
  add(g,box(.052,.062,.20),dark,0,0,0);add(g,box(.054,.012,.17),poly,0,.036,-.01);
  for(let i=0;i<5;i++)add(g,box(.056,.004,.012),steel,0,.044,-.07+i*.03);                        // top rail slots
  add(g,cyl(.026,.028,.17),steel,0,.006,-.17,Math.PI/2);add(g,cyl(.031,.031,.03),dark,0,.006,-.245,Math.PI/2);
  for(let i=0;i<3;i++)add(g,cyl(.0285,.0285,.006),poly,0,.006,-.12-i*.025,Math.PI/2);            // barrel grip rings
  const sp=new T.Group();sp.position.set(-.046,-.004,.02);g.add(sp);add(sp,cyl(.048,.048,.04,22),dark,0,0,0,0,0,Math.PI/2);
  const coil=add(sp,cyl(.040,.040,.032,22),coilM,0,0,0,0,0,Math.PI/2);add(sp,cyl(.012,.012,.046,10),steel,0,0,0,0,0,Math.PI/2);
  add(g,box(.040,.10,.048),poly,0,-.075,.06,-.28);add(g,box(.044,.012,.05),dark,0,-.125,.074,-.28);   // grip and butt plate
  for(let i=0;i<4;i++)add(g,box(.042,.004,.03),dark,0,-.045-i*.02,.052+i*.006,-.28);                    // grip serrations
  const tg=add(g,new T.TorusGeometry(.024,.0045,6,14,Math.PI),dark,0,-.032,.008,0,Math.PI/2,Math.PI);    // trigger guard
  add(g,box(.008,.026,.008),steel,0,-.04,.006,.25);                                                         // trigger
  add(g,box(.006,.006,.05),led,.027,.014,-.03);
  const hd=claw(.55);hd.position.set(0,.006,-.255);hd.rotation.y=Math.PI;g.add(hd);g.userData.head=hd;g.userData.muzzle=new T.Vector3(0,.006,-.27);
  g.userData.grip=new T.Vector3(0,-.07,.06);return g}
 // holster for the avatar's belt: a thigh-rig frame with the launcher seated barrel-down
 function holster(){const g=new T.Group(),G=gun();G.rotation.set(-Math.PI/2+.12,0,0);g.add(G);
  // open-frame drop holster: a clip band round the barrel, a backing plate and a thin thigh strap
  add(g,new T.TorusGeometry(.036,.007,6,18),poly,0,-.17,.0,Math.PI/2);add(g,box(.012,.20,.05),poly,-.034,-.08,0);add(g,box(.006,.03,.09),dark,-.03,.02,0);
  add(g,new T.TorusGeometry(.10,.006,4,24,Math.PI*1.1),poly,-.10,-.13,0,Math.PI/2,0,Math.PI*.45);return g}
 // cable: rebuilt per frame along a sagging curve while it flies, pulled taut once the claw bites
 let tube=null;const tubeMesh=new T.Mesh(new T.BufferGeometry(),cableM);tubeMesh.frustumCulled=false;tubeMesh.visible=false;S.add(tubeMesh);
 const flyClaw=claw(1.15);flyClaw.visible=false;S.add(flyClaw);
 const fpGun=gun();fpGun.visible=false;C.add(fpGun);fpGun.traverse(o=>{if(o.isMesh)o.renderOrder=1});
 function cable(a,b,sag,wob,t){const pts=[],L=a.distanceTo(b);for(let i=0;i<=10;i++){const u=i/10,p=a.clone().lerp(b,u);p.y-=sag*L*Math.sin(Math.PI*u);
   if(wob)p.x+=Math.sin(u*9+t*30)*wob*Math.sin(Math.PI*u),p.z+=Math.cos(u*7+t*26)*wob*Math.sin(Math.PI*u);pts.push(p)}
  const g=new T.TubeGeometry(new T.CatmullRomCurve3(pts),Math.min(90,20+Math.round(L*1.5)),.0105,6,false);if(tubeMesh.geometry)tubeMesh.geometry.dispose();tubeMesh.geometry=g;
  cTex.repeat.set(L/.022,1);tubeMesh.visible=true}
 return{claw,gun,holster,cable,flyClaw,fpGun,tubeMesh,hide(){tubeMesh.visible=false;flyClaw.visible=false}}})();
let FPT=0;
const fpArm=(()=>{const g=new T.Group();C.add(g);
 const plate=new T.MeshStandardMaterial({color:0x121418,metalness:.8,roughness:.3}),dk=new T.MeshStandardMaterial({color:0x07080a,metalness:.5,roughness:.6}),gl=new T.MeshBasicMaterial({color:0x0b4dff});
 const L1=.5,L2=.48,S=new T.Vector3(-.2,-.47,-.08);
 const ua=new T.Group(),fa=new T.Group();g.add(ua,fa);
 {const m=new T.Mesh(new T.CylinderGeometry(.05,.055,L1,14),dk);m.position.y=L1/2;ua.add(m)}
 {const m=new T.Mesh(new T.BoxGeometry(.11,L1*.6,.11),plate);m.position.y=L1*.55;ua.add(m)}
 {const m=new T.Mesh(new T.CylinderGeometry(.042,.05,L2,14),dk);m.position.y=L2/2;fa.add(m);
  const pl=new T.Mesh(new T.BoxGeometry(.1,L2*.62,.1),plate);pl.position.y=L2*.55;fa.add(pl);
  const st=new T.Mesh(new T.BoxGeometry(.012,L2*.4,.006),gl);st.position.set(0,L2*.55,.053);fa.add(st);
  const st2=new T.Mesh(new T.BoxGeometry(.006,L2*.3,.012),gl);st2.position.set(.053,L2*.6,0);fa.add(st2);
  const cf=new T.Mesh(new T.BoxGeometry(.105,.03,.105),dk);cf.position.y=L2*.9;fa.add(cf)}
 const hd=new T.Group();hd.position.y=L2;fa.add(hd);
 {const palm=new T.Mesh(new T.BoxGeometry(.085,.09,.04),dk);palm.position.y=.045;hd.add(palm);
  const kn=new T.Mesh(new T.BoxGeometry(.088,.022,.045),plate);kn.position.set(0,.085,.0);hd.add(kn);
  for(let i=0;i<4;i++){const f=new T.Group();f.position.set(-.03+i*.02,.095,.01);f.rotation.x=1.1;hd.add(f);const a=new T.Mesh(new T.BoxGeometry(.017,.04,.02),dk);a.position.y=.02;f.add(a);const b=new T.Mesh(new T.BoxGeometry(.016,.03,.018),plate);b.position.set(0,.05,.01);b.rotation.x=.6;f.add(b)}
  const th=new T.Mesh(new T.BoxGeometry(.02,.05,.022),dk);th.position.set(.05,.06,.025);th.rotation.z=-.5;hd.add(th);
  const kl=new T.Mesh(new T.BoxGeometry(.05,.006,.006),gl);kl.position.set(0,.088,.024);hd.add(kl)}
 g.traverse(o=>{if(o.isMesh)o.renderOrder=1});
 // operative forearm + gloved fist (rest-pose mesh from the character model), placed rigidly between elbow and grip each frame
 const V3=(x,y,z)=>new T.Vector3(x,y,z),ER=V3(2.04,7.95,-.06),WR=V3(2.22,6.52,.04),dnr=V3(.05,-1,.07).normalize(),pnr=V3(-1,0,0).addScaledVector(dnr,-V3(-1,0,0).dot(dnr)).normalize();
 const FC=WR.clone().addScaledVector(dnr,1.65*.50).addScaledVector(pnr,1.65*.14),SC=L2/FC.distanceTo(ER);
 const SR=V3(.42,-.45,.22),L1R=.5;let OA=null;
 const mk=(mir)=>{const m=new T.Mesh(OA.geo,OA.mat);m.renderOrder=1;m.frustumCulled=false;C.add(m);
  const mv=v=>mir?V3(-v.x,v.y,v.z):v.clone(),fc=mv(FC),ax=mv(FC).sub(mv(ER)).normalize(),pb=mv(pnr);pb.addScaledVector(ax,-pb.dot(ax)).normalize();
  const rest=new T.Matrix4().makeBasis(ax,pb,new T.Vector3().crossVectors(ax,pb)).invert();return{m,fc,rest,mir}};
 const place=(o,E,H,palm)=>{const y=H.clone().sub(E).normalize();if(typeof palm==='function')palm=palm(y);const pz=palm.clone().addScaledVector(y,-palm.dot(y)).normalize();
  const R=new T.Matrix4().makeBasis(y,pz,new T.Vector3().crossVectors(y,pz)).multiply(o.rest);o.m.quaternion.setFromRotationMatrix(R);
  o.m.scale.set(o.mir?-SC:SC,SC,SC);o.m.position.copy(H).sub(o.fc.clone().multiplyScalar(SC).applyMatrix4(R).setX(o.fc.clone().multiplyScalar(SC).applyMatrix4(R).x))};
 let AL=null,ARt=null;const uaR=new T.Group();g.add(uaR);uaR.add(ua.children[0].clone(),ua.children[1].clone());
 return{g,vis(v){g.visible=v;if(AL)AL.m.visible=v;if(ARt)ARt.m.visible=v},suit(t){t=t||0;if(t===FPT)return;FPT=t;if(OA){OA.geo=opGeo(OPA_SRC,OPA_N[0],OPA_N[1],OPA_LO,OPA_HI,t);AL.m.geometry=OA.geo;ARt.m.geometry=OA.geo;OA.mat.uniforms.uDet.value=detTex('armor_t'+t);OA.mat.uniforms.uGlo.value.set(...SUITS[t].glo)}},pose(hand,grip,fwd,up,palmL,gax){
  if(!OA){try{OA={geo:opGeo(OPA_SRC,OPA_N[0],OPA_N[1],OPA_LO,OPA_HI,FPT),mat:opMat(1,FPT)};AL=mk(false);ARt=mk(true);fa.visible=false}catch(e){OA=0}}
  const E=ik2(S,hand,L1,L2,new T.Vector3(-.5,-1,.1));orient(ua,S,E,new T.Vector3(0,0,1));orient(fa,E,hand,new T.Vector3(0,0,1));
  if(OA){place(AL,E,hand,palmL?palmL:up?(y=>{const p_=up.clone().multiplyScalar(window.PSG||1);p_.addScaledVector(y,-p_.dot(y));return p_.lengthSq()>1e-4?p_.normalize():V3(.25,1,.1)}):fwd?(y=>{const p_=fwd.clone().cross(y).normalize();return p_.lengthSq()>.5?p_:V3(.25,1,.1)}):V3(.25,1,.1));
   if(grip){const E2=ik2(window.SRX?new T.Vector3(...window.SRX):SR,grip,L1R,L2,new T.Vector3(...(window.RPOLE||[1,-.5,1])));orient(uaR,window.SRX?new T.Vector3(...window.SRX):SR,E2,new T.Vector3(0,0,1));place(ARt,E2,grip,gax?(y=>{const p_=gax.clone().multiplyScalar(window.GSG||-1).cross(y);return p_.lengthSq()>1e-4?p_.normalize():V3(-1,.15,0)}):V3(-1,.15,0))}}}}})();
const FP_POUCH=new T.Vector3(-.12,-.95,-.3);
{const fl=new T.PointLight(0xb4c4ff,1.1,2.2,1.5);fl.position.set(.1,.25,.1);C.add(fl)}
// ---- muzzle flash: subtle, short and varied: a star of crossed planes and a small core, warm with a hint of the weapon's colour
const MFX=(()=>{let grp=null,t=0;const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.translate(64,64);
  const rg=g.createRadialGradient(0,0,0,0,0,64);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.18,'rgba(255,240,210,.9)');rg.addColorStop(.5,'rgba(255,170,80,.25)');rg.addColorStop(1,'rgba(255,120,40,0)');
  for(let i=0;i<7;i++){g.save();g.rotate(i/7*6.283+Math.random()*.3);g.fillStyle=rg;g.beginPath();g.moveTo(-6,0);g.quadraticCurveTo(0,-4,58*(.6+Math.random()*.4),0);g.quadraticCurveTo(0,4,-6,0);g.fill();g.restore()}
  const c2=g.createRadialGradient(0,0,0,0,0,26);c2.addColorStop(0,'rgba(255,255,255,1)');c2.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=c2;g.fillRect(-64,-64,128,128);const t_=new T.CanvasTexture(c);t_.generateMipmaps=false;t_.minFilter=T.LinearFilter;return t_})();
 const side=(()=>{const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d'),lg=g.createLinearGradient(0,0,128,0);lg.addColorStop(0,'rgba(255,250,230,1)');lg.addColorStop(.35,'rgba(255,190,100,.55)');lg.addColorStop(1,'rgba(255,120,40,0)');
  g.fillStyle=lg;g.beginPath();g.moveTo(0,10);g.quadraticCurveTo(64,0,128,16);g.quadraticCurveTo(64,32,0,22);g.fill();const t_=new T.CanvasTexture(c);t_.generateMipmaps=false;t_.minFilter=T.LinearFilter;return t_})();
 return{build(par,y,z,col){const tint=new T.Color(1,.86,.66).lerp(new T.Color(col),.25);grp=new T.Group();grp.position.set(0,y,z+.03);par.add(grp);
   const mk=(tx)=>new T.MeshBasicMaterial({map:tx,color:tint,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,side:T.DoubleSide,opacity:.7});
   const face=new T.Mesh(new T.PlaneGeometry(.2,.2),mk(tex));grp.add(face);
   for(let i=0;i<2;i++){const s=new T.Mesh(new T.PlaneGeometry(.26,.065),mk(side));s.position.z=.12;s.rotation.set(0,-Math.PI/2,i*Math.PI/2);s.rotation.order='YXZ';s.rotation.set(i?Math.PI/2:0,-Math.PI/2,0);grp.add(s)}
   grp.traverse(o=>{if(o.isMesh)o.renderOrder=3});grp.visible=false},
  fire(){if(!grp)return;t=.045;grp.visible=true;grp.rotation.z=Math.random()*6.283;const k=.7+Math.random()*.5;grp.scale.set(k,k,.8+Math.random()*.6);grp.children.forEach(c=>c.material.opacity=.45+Math.random()*.3)},
  get g(){return grp},
  step(dt){if(!grp||!grp.visible)return;t-=dt;if(t<=0)grp.visible=false;else grp.children.forEach(c=>c.material.opacity*=.8)}}})();
function buildGun(){while(gun.children.length)gun.remove(gun.children[0]);
 gunWrap=new T.Group();gun.add(gunWrap);
 const mats={fp:1,body:new T.MeshPhysicalMaterial({color:0x121418,metalness:.85,roughness:.32}),dark:new T.MeshPhysicalMaterial({color:0x07080a,metalness:.2,roughness:.7}),glow:new T.MeshBasicMaterial({color:Wp.col}),line:new T.MeshBasicMaterial({color:0x1f5cff})};
 const gm=gunModel(Wp.id,mats);gm.g.rotation.y=Math.PI;gm.g.scale.setScalar(.85);gunWrap.add(gm.g);gunParts=gm.parts;gunModelG=gm.g;fpRel={last:null};
 barrel=new T.Object3D();barrel.position.set(0,.035,gm.parts.muzzle);gm.g.add(barrel);
 mf=new T.PointLight(Wp.col,0,10);mf.position.set(0,.035,gm.parts.muzzle+.1);gm.g.add(mf);
 MFX.build(gm.g,(SIGHT[Wp.id]||{}).bore||.035,gm.parts.muzzle,Wp.col)}
// hunter drone: imported sci-fi drone model (decimated, quantised), blue-steel shell, gunmetal trim, neon-blue light lines and eye
const DRONE_B='<<assets/data_54.b64>>',DRONE_H=[[2993, 15579], [3700, 19200], [1296, 4497]];
const dr=new T.Group(),dy=new T.Mesh(new T.SphereGeometry(.06,16,12),new T.MeshBasicMaterial({color:new T.Color(0x2a8cff).multiplyScalar(1.6),toneMapped:false}));
{const raw=atob(DRONE_B),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);let o=0;
 const MATS=[new T.MeshStandardMaterial({color:0x5b7394,metalness:.92,roughness:.24,envMapIntensity:1.2}),new T.MeshStandardMaterial({color:0x1b1f27,metalness:.85,roughness:.38}),new T.MeshBasicMaterial({color:new T.Color(0x2a8cff).multiplyScalar(1.5),toneMapped:false})];
 const body=new T.Group();body.scale.setScalar(.36);body.rotation.y=Math.PI;dr.add(body);
 DRONE_H.forEach(([nv,ni],k)=>{const P=new Float32Array(nv*3),N=new Float32Array(nv*3),dv=new DataView(u.buffer);for(let i=0;i<nv*3;i++)P[i]=dv.getInt16(o+i*2,true)/32767*.55;o+=nv*6;
  for(let i=0;i<nv;i++)for(let a=0;a<3;a++)N[i*3+a]=dv.getInt8(o+i*4+a)/127;o+=nv*4;const ix=new Uint16Array(ni);for(let i=0;i<ni;i++)ix[i]=dv.getUint16(o+i*2,true);o+=ni*2;if((ni*2)%4)o+=2;
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setIndex(new T.BufferAttribute(ix,1));const m=new T.Mesh(g,MATS[k]);m.renderOrder=1;body.add(m)});
 dy.position.set(0,0,-.2);dr.add(dy);
 const fl=new T.PointLight(0x2a8cff,0,3,2);fl.position.set(0,0,-.35);dr.add(fl);dr.userData.fl=fl;dr.userData.body=body}
dr.position.set(-1.22,.74,-1.5);dr.visible=false;C.add(dr);
const rc=new T.Raycaster();rc.far=100;rc.layers.enable(1);const TR=[];
let AC;
// ---- reload foley: synthesized per weapon, keyed to each reload animation's phases (t = 0..1 of the reload)
let NB=null,SFXM=null,SFXT=0;
// ---- volume buses: every sound effect is routed through a per-context game bus; the menu theme plays on its own music bus
const MUSIC_SRC='data:audio/mpeg;base64,<<assets/file_26.mp3>>';
const volG=()=>cfg.vg==null?.8:cfg.vg,volM=()=>cfg.vm==null?.6:cfg.vm;
const busOf=c=>{if(!c._gb){c._gb=c.createGain();c._gb.gain.value=volG();c._gbOK=1;AudioNode.prototype._vvc.call(c._gb,c.destination)}return c._gb};
(()=>{const oc=AudioNode.prototype.connect;AudioNode.prototype._vvc=oc;AudioNode.prototype.connect=function(d,...a){
 if(d&&typeof AudioDestinationNode!=='undefined'&&d instanceof AudioDestinationNode&&!this._vvMusic&&this!==this.context._gb)return oc.call(this,busOf(this.context),...a);return oc.call(this,d,...a)}})();
const GAME_SRC='data:audio/mpeg;base64,<<assets/file_27.mp3>>';
// two looping tracks on the music bus: the menu theme in the hangar, the combat theme in play; they crossfade
const MUS={T:[{src:MUSIC_SRC,end:101.0526,menu:1},{src:GAME_SRC,end:60.9524,menu:0}],loading:0,
 dec(t){return new Promise((ok,no)=>{const raw=atob(t.src.slice(t.src.indexOf(',')+1)),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);AC.decodeAudioData(u.buffer,ok,no)})},
 startOne(t){if(t.node||t.loading||!AC)return;const go_=()=>{if(t.node)return;t.g=AC.createGain();t.g._vvMusic=1;t.g.gain.value=.0001;t.g.connect(AC.destination);const s=AC.createBufferSource();s.buffer=t.buf;s.loop=true;s.loopStart=0;s.loopEnd=Math.min(t.buf.duration,t.end);s._vvMusic=1;s.connect(t.g);s.start();t.node=s;this.tick()};
  if(t.buf)return go_();t.loading=1;this.dec(t).then(b=>{t.buf=b;t.loading=0;go_()}).catch(()=>{t.loading=0})},
 start(){if(!AC)return;const menu=!(typeof go!=='undefined'&&go);this.T.forEach(t=>{if(!!t.menu===menu||t.node)this.startOne(t)})},
 tick(){if(!AC)return;const menu=!(typeof go!=='undefined'&&go);for(const t of this.T){if(!t.node){if(!!t.menu===menu&&AC.state==='running')this.startOne(t);continue}
  const on=!!t.menu===menu,tgt=Math.max(.0001,(on?1:0)*volM()*(t.menu?.55:.42));t.g.gain.setTargetAtTime(tgt,AC.currentTime,on?.9:.5);
  if(on&&!t.menu&&t.restart){t.restart=0}}},
 get g(){return this.T[0].g}};
setInterval(()=>MUS.tick(),300);
const applyVol=()=>{if(AC&&AC._gb)AC._gb.gain.setTargetAtTime(volG(),AC.currentTime,.05);MUS.tick()};
function ensureAC(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended'&&AC.resume)AC.resume().catch(()=>{});MUS.start()}catch(e){AC=null}}
addEventListener('pointerdown',ensureAC,{capture:true,passive:true});addEventListener('keydown',ensureAC,{capture:true});addEventListener('touchstart',ensureAC,{capture:true,passive:true});
// menu theme starts as soon as the main menu loads; if the browser holds audio until a first click/key, it starts on that input
addEventListener('load',()=>{ensureAC();if(AC&&AC.addEventListener)AC.addEventListener('statechange',()=>{if(AC.state==='running')MUS.start()})});
const sfxOut=()=>{if(!SFXM||SFXM.context!==AC){SFXM=AC.createGain();SFXM.gain.value=.32;SFXM.connect(typeof AUD!=='undefined'&&AUD.init()?AUD.bus:AC.destination)}return SFXM};
const noiseBuf=()=>{if(!NB||NB.sampleRate!==AC.sampleRate){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return NB};
function env(t0,dur,v,atk){const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t0+atk);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);g.connect(sfxOut());return g}
function sN(dt,dur,type,f0,f1,q,v,atk=.002){const t0=AC.currentTime+SFXT+dt,n=AC.createBufferSource(),f=AC.createBiquadFilter();n.buffer=noiseBuf();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t0);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t0+dur);n.connect(f).connect(env(t0,dur,v,atk));n.start(t0,Math.random()*.6);n.stop(t0+dur+.03)}
function sO(dt,dur,type,f0,f1,v,atk=.003){const t0=AC.currentTime+SFXT+dt,o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dur);o.connect(env(t0,dur,v,atk));o.start(t0);o.stop(t0+dur+.03)}
// footsteps on steel stair treads: each foot contact excites the tread plate (inharmonic modes that ring and decay),
// a hollow knock from the stair body, a bright sole tick and a brief loose-plate rattle; alternating feet panned L/R; kept quiet in the mix
const STEP_VOL=.5;
function stairStep(foot,up,I){if(!AC)return;try{const t0=AC.currentTime+.004+Math.random()*.014,out=sfxOut(),pan=AC.createStereoPanner?AC.createStereoPanner():null;if(pan){pan.pan.value=foot?.18:-.18;pan.connect(out)}
 const dst=pan||out,v=STEP_VOL*I*(.85+Math.random()*.3),base=410+Math.random()*90;
 const gn=(t,vol,atk,dur)=>{const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+atk);g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(dst);return g};
 const nz=(t,dur,type,f0,f1,q,vol,atk=.001)=>{const n=AC.createBufferSource(),f=AC.createBiquadFilter();n.buffer=noiseBuf();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t+dur);n.connect(f).connect(gn(t,vol,atk,dur));n.start(t,Math.random()*.8);n.stop(t+dur+.03)};
 const md=(t,f,dur,vol)=>{const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.992,t+dur);o.connect(gn(t,vol,.0015,dur));o.start(t);o.stop(t+dur+.03)};
 const MODES=[[1,.34,1],[1.594,.26,.75],[2.136,.2,.6],[2.296,.17,.5],[2.653,.13,.42],[2.918,.11,.34],[3.501,.08,.26],[4.153,.06,.2]];
 const contact=(dt,k)=>{const t=t0+dt;
  nz(t,.008,'highpass',5200,5200,.7,.22*v*k);                                        // sole edge tick
  nz(t,.018,'bandpass',2400,1500,1.2,.16*v*k);                                       // grip-tread scrape
  for(const[r,d,a]of MODES){const f=base*r*(1+(Math.random()-.5)*.012);md(t,f,d*(.8+.4*k),.05*a*v*k)}   // tread plate ring
  for(const[f,q]of[[base*5.1,28],[base*6.7,34],[base*8.9,40]])nz(t,.09,'bandpass',f,f,q,.18*v*k,.001);   // bright grate shimmer
  md(t,150+Math.random()*25,.09,.11*v*k);nz(t,.05,'lowpass',380,160,.8,.12*v*k,.002)};   // hollow knock from the stair body
 if(up){contact(0,1);contact(.065,.45)}else{contact(0,.55);contact(.032,1.15)}            // up: heel then toe; down: toe catches then weight drops
 if(Math.random()<.5){const t=t0+.012,n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=gn(t,.035*v,.002,.07),lfo=AC.createOscillator(),lg=AC.createGain();   // loose plate rattle
  n.buffer=noiseBuf();f.type='bandpass';f.frequency.value=3000;f.Q.value=3;lfo.frequency.value=32+Math.random()*10;lg.gain.value=.5;const am=AC.createGain();am.gain.value=.5;lfo.connect(lg).connect(am.gain);
  n.connect(f).connect(am).connect(g);n.start(t,Math.random()*.8);n.stop(t+.1);lfo.start(t);lfo.stop(t+.1)}
 nz(t0+.01,.12,'bandpass',1300,900,.8,.02*v,.03)}catch(e){}}   // faint clothing rustle
// ---- environment footsteps: surface-aware, alternating feet, heel/toe timing from pace ----
const ENV_VOL=.5;
function surfAt(){const x=P.x,y=P.y,z=P.z;
 if(y>.2&&CITY.stairH(x,z)>=0)return 'stair';
 if(B.has(k(Math.floor(x/2),Math.floor((y-.4)/2),Math.floor(z/2))))return 'crate';
 if(y>.4){const r=Math.hypot(x,z),ax=Math.abs(x),az=Math.abs(z);
  if((y>8&&y<9.8&&(r>27.5&&r<34.2||ax>20.5&&ax<25.5&&az>19.5&&az<24.5))||(y>22.8&&y<25.4&&r<11.2))return 'grate';
  for(const[tx,tz]of[[-70,36],[-70,50]])if(Math.hypot(x-tx,z-tz)<5.6)return 'crate';
  const h=CITY.hAt(x,z);if(h>1.45&&h<1.75)return 'car';if(h>=5)return 'roof';return 'concrete'}
 const r=Math.hypot(x,z),ax=Math.abs(x),az=Math.abs(z);if(r<25.6)return 'stone';
 if((ax>=10&&ax<14&&az>=26)||(az>=10&&az<14&&ax>=26))return 'stone';if(ax>88||az>88)return 'concrete';return 'asphalt'}
function footstep(surf,foot,mode,I){if(!AC)return;try{const t0=AC.currentTime+.003+Math.random()*.012,out=sfxOut(),pan=AC.createStereoPanner?AC.createStereoPanner():null;if(pan){pan.pan.value=mode==='land'?0:(foot?.16:-.16);pan.connect(out)}
 const dst=pan||out,v=ENV_VOL*I*(.85+Math.random()*.3),rr_=()=>Math.random(),run=mode==='run',land=mode==='land',jmp=mode==='jump';
 const gn=(t,vol,atk,dur)=>{const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+atk);g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(dst);return g};
 const nz=(t,dur,type,f0,f1,q,vol,atk=.001)=>{const n=AC.createBufferSource(),f=AC.createBiquadFilter();n.buffer=noiseBuf();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);if(f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t+dur);n.connect(f).connect(gn(t,vol,atk,dur));n.start(t,rr_()*.8);n.stop(t+dur+.03)};
 const md=(t,f,dur,vol)=>{const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.985,t+dur);o.connect(gn(t,vol,.0015,dur));o.start(t);o.stop(t+dur+.03)};
 const thump=(t,k)=>{const f=80+rr_()*18;const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(42,t+.09);o.connect(gn(t,.3*v*k,.002,.09));o.start(t);o.stop(t+.12);nz(t,.05,'lowpass',620,190,.7,.26*v*k,.002)};
 const ring=(t,base,modes,vol,dl)=>{for(const[r,d,a]of modes)md(t,base*r*(1+(rr_()-.5)*.015),d*dl,vol*a)};
 const PLATE=[[1,.2,1],[1.594,.16,.7],[2.136,.12,.55],[2.653,.09,.4],[3.501,.06,.25]];
 const contact=(dt,k,heel)=>{const t=t0+dt;
  if(surf==='crawl'){nz(t,.22,'bandpass',700,1100,.7,.08*v,.05);nz(t+.05,.18,'bandpass',2600,1800,1,.03*v,.04);return}
  if(heel)thump(t,k*(surf==='grate'||surf==='car'?.6:1));
  switch(surf){
   case 'asphalt':{const puddle=rr_()<.28;nz(t,.03,'bandpass',1100,800,1.2,.17*v*k);nz(t+.004,puddle?.14:.08,'bandpass',1400,4300,1.3,(puddle?.16:.06)*v*k,.006);
    for(let i=0;i<(puddle?7:2);i++)nz(t+.02+rr_()*(puddle?.16:.08),.012+rr_()*.012,'bandpass',2800+rr_()*3600,2800+rr_()*3600,7,(puddle?.06:.03)*v*k);
    if(!heel)nz(t,.06,'bandpass',900,2400,2,.04*v*k,.004);break}
   case 'stone':nz(t,.012,'bandpass',3200,2700,3,.16*v*k);nz(t,.028,'bandpass',1500,950,1.3,.17*v*k);nz(t+.004,.045,'highpass',3600,3600,.7,.05*v*k);break;
   case 'concrete':nz(t,.03,'bandpass',1350,880,1.3,.2*v*k);nz(t+.005,.05,'highpass',3400,3400,.7,.06*v*k);break;
   case 'roof':{nz(t,.03,'bandpass',900,600,1,.12*v*k);const n=heel?(run?12:8):5;for(let i=0;i<n;i++)nz(t+rr_()*.09,.006+rr_()*.012,'bandpass',1400+rr_()*4500,1200+rr_()*3000,2+rr_()*3,(.05+rr_()*.06)*v*k);break}
   case 'grate':nz(t,.008,'highpass',5000,5000,.7,.14*v*k);ring(t,250+rr_()*40,PLATE,.03*v*k,.8+.4*k);md(t,170+rr_()*20,.07,.08*v*k);nz(t,.06,'bandpass',base5(),base5(),26,.08*v*k);break;
   case 'crate':md(t,105+rr_()*12,.26,.2*v*k);md(t,168+rr_()*15,.18,.1*v*k);ring(t,225+rr_()*30,PLATE,.03*v*k,1.4);nz(t,.008,'highpass',4800,4800,.7,.1*v*k);break;
   case 'car':ring(t,600+rr_()*80,[[1,.12,1],[1.47,.09,.6],[2.09,.07,.4]],.05*v*k,1);md(t,140,.08,.1*v*k);nz(t,.02,'bandpass',900,700,1.5,.1*v*k);break}};
 function base5(){return 2600+rr_()*900}
 if(land){contact(0,1.5,1);contact(.022,1.2,1);nz(t0+.03,.1,'bandpass',4300,3800,5,.05*v,.005);nz(t0+.02,.16,'bandpass',1200,800,.8,.07*v,.02);return}
 if(jmp){contact(0,.6,0);nz(t0,.08,'bandpass',1200,800,.8,.04*v,.02);return}
 if(surf==='crawl'){contact(0,1,0);return}
 contact(0,1,1);contact(run?.038:.075,.5,0);                                                        // heel strike, then the toe rolls off
 nz(t0+.01,.13,'bandpass',1300,900,.8,(run?.05:.03)*v,.03);if(run&&rr_()<.45)nz(t0+.03,.03,'bandpass',4300,3900,6,.035*v)   // clothing rustle, kit jingle
}catch(e){}}
const FOLEY={
 click:(v)=>{sN(0,.03,'bandpass',4200,2800,6,.4*v);sO(0,.035,'square',2100,1100,.04*v)},                        // mag release / bolt catch
 clack:(v)=>{sN(0,.07,'bandpass',1600,700,3,.55*v);sO(0,.08,'triangle',460,170,.22*v);sN(.012,.05,'highpass',5200,5200,.7,.14*v)}, // bolt slam
 slide:(v,o)=>{const up=o&&o.up;sN(0,.13,'bandpass',up?900:2600,up?2600:900,2.4,.24*v,.03)},              // metal sliding in/out
 rustle:(v)=>{sN(0,.17,'bandpass',1900,1200,1.1,.09*v,.05)},                                              // pouch
 seat:(v)=>{FOLEY.clack(v*1.1);sO(0,.13,'sine',150,70,.32*v);sN(.03,.04,'bandpass',3600,3000,5,.18*v)},   // magazine locks home
 shell:(v)=>{sN(0,.05,'bandpass',2700,1800,5,.32*v);sO(0,.06,'triangle',760,360,.12*v);sN(.02,.05,'bandpass',1200,900,2,.12*v)},
 clunk:(v)=>{sN(0,.12,'bandpass',900,380,2.2,.6*v);sO(0,.16,'sine',110,55,.4*v);sN(.01,.06,'highpass',4000,4000,.7,.12*v)},  // heavy hinge
 hiss:(v,o,d)=>{sN(0,d||.35,'highpass',2600,6000,.8,.16*v,.03)},                                            // coolant / vent
 ratchet:(v)=>{for(let i=0;i<5;i++)sN(i*.028,.018,'bandpass',3200+i*150,2600,7,.28*v)},                    // canister twist
 whine:(v,o,d)=>{d=d||.4;sO(0,d,'sawtooth',300,2400,.035*v,d*.8);sO(0,d,'sine',600,4800,.05*v,d*.8)},       // capacitor charge
 spin:(v,o,d)=>{d=d||.5;sO(0,d,'sawtooth',60,520,.06*v,d*.7);sN(0,d,'bandpass',300,2200,3,.1*v,d*.7)},     // barrel spin-up
 hum:(v,o,d)=>{d=d||.3;sO(0,d,'sawtooth',55,90,.07*v,d*.5);sO(0,d,'sine',110,180,.08*v,d*.5)},              // void core
 crackle:(v,o,d)=>{d=d||.15;const n=Math.max(4,d*60|0);for(let i=0;i<n;i++)sN(Math.random()*d,.012+Math.random()*.02,'highpass',3000+Math.random()*4000,3000,1,(.15+Math.random()*.25)*v)},
 ping:(v)=>{sO(0,.35,'sine',1760,1720,.1*v,.005);sO(.06,.3,'sine',2640,2600,.06*v,.005)},                     // ready chime
 servo:(v)=>{sO(0,.22,'sawtooth',160,340,.05*v,.04);sN(0,.22,'bandpass',800,1600,3,.08*v,.04)}};
const MAGSEQ=[[.1,'click'],[.115,'slide'],[.3,'rustle'],[.5,'rustle',.6],[.63,'slide',1,{up:1}],[.72,'seat']];
const RSFX={
 pulse:MAGSEQ.concat([[.74,'slide',.8],[.81,'clack']]),
 smg:MAGSEQ.concat([[.74,'slide',.7],[.81,'clack',.8]]),
 burst:[[.01,'click',1.2]].concat(MAGSEQ,[[.78,'clack',1.15]]),
 scatter:[[.06,'rustle'],[.15,'rustle',.7],[.25,'shell'],[.35,'rustle',.6],[.45,'shell'],[.55,'rustle',.6],[.65,'shell'],[.8,'slide',1],[.845,'clack',.9],[.88,'slide',1,{up:1}],[.925,'clack',1.1]],
 rail:[[.06,'hiss',.9,null,.3]].concat(MAGSEQ,[[.72,'whine',1,null,.23],[.95,'ping']]),
 arc:[[0,'clunk']].concat(MAGSEQ,[[.76,'clunk',1.1]]),
 ion:MAGSEQ.concat([[.74,'spin',1,null,.26]]),
 cryo:[[.03,'ratchet'],[.1,'hiss',.8]].concat(MAGSEQ,[[.72,'ratchet'],[.8,'hiss',.6,null,.25]]),
 void:[[0,'servo']].concat(MAGSEQ,[[.62,'hum',1,null,.18],[.72,'crackle',1,null,.08],[.8,'clunk',.9],[.82,'ping',.6]]),
 chain:MAGSEQ.concat([[.72,'crackle',1,null,.14],[.86,'ping',.8]])};
// fire every event whose time falls in (t0, t1]; durations in the table are fractions of the reload length
function rlSfx(id,t0,t1,rl,vol){if(!AC||AC.state!=='running')return;const L=RSFX[id]||MAGSEQ;
 for(const[t,k,v,o,d]of L)if(t0<t&&t<=t1)try{FOLEY[k]((v||1)*vol,o,d?d*rl:undefined)}catch(e){}}
function dropHit(v){if(!AC||AC.state!=='running')return;try{sN(0,.06,'bandpass',1300,700,2.5,.35*v);sO(0,.07,'triangle',330,140,.14*v);sN(.09,.04,'bandpass',1700,1200,3,.12*v);sO(.09,.05,'triangle',380,200,.05*v)}catch(e){}}
function beep(f,d,ty,v){if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,AC.currentTime);o.frequency.exponentialRampToValueAtTime(30,AC.currentTime+d);g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const targets=()=>BM.concat(EN.map(e=>e.m),CITY.proxies,typeof CO!=='undefined'?CO.hitList():[]);
function aimAt(ox,oy){rc.setFromCamera({x:ox,y:oy},C)}
function tracer(to,from,col){if(!from){from=new T.Vector3();barrel.getWorldPosition(from)}FX.tracer(from,to,col||Wp.col);TR.push({l:new T.Object3D(),t:.07})}
const farPt=()=>rc.ray.origin.clone().addScaledVector(rc.ray.direction,60);
function explode(pt,dmg,rad){CITY.shatterNear(pt,rad);destroy(pt,Wp.brk);burst(pt,22,Wp.col,12);shake=Math.max(shake,.3);AUD.boom(pt,1);[...EN].forEach(e=>{const d=e.m.position.distanceTo(pt);if(d<rad)hurt(e,dmg*(1-d/(rad+1)))})}
let spinT=0,burstN=0,burstT=0;const WELLS=[];
const wellGeo=new T.SphereGeometry(.7,20,14),wellRing=new T.TorusGeometry(1.4,.05,8,40);
function fire(){if(!go||rel>0||swapT>0)return;
 if(Wp.burst){if(burstN>0||fcd>0)return;if(ammo<=0){reload();return}burstN=Math.min(Wp.burst,ammo);burstT=0;return}
 if(fcd>0)return;if(ammo<=0){reload();return}
 fcd=Wp.rate*(Wp.spin?1+2*(1-Math.min(1,spinT/Wp.spin)):1);discharge()}
function chainZap(e0,dmg){let cur=e0.m.position.clone();const hit=new Set([e0]);
 for(let k=0;k<Wp.chain;k++){let best=null,bd=7.5;for(const e of EN){if(hit.has(e))continue;const d=e.m.position.distanceTo(cur);if(d<bd){bd=d;best=e}}
  if(!best)break;const np=best.m.position.clone(),mid=cur.clone().lerp(np,.5).add(new T.Vector3((rnd()-.5)*.8,(rnd()-.5)*.8,(rnd()-.5)*.8));
  tracer(mid,cur.clone());tracer(np,mid);hit.add(best);hurt(best,dmg*Math.pow(.75,k+1));burst(np,4,Wp.col,6);cur=np}}
function addWell(pt){const g=new T.Group();g.position.copy(pt);const core=new T.Mesh(wellGeo,new T.MeshBasicMaterial({color:0x05000a}));const ring=new T.Mesh(wellRing,new T.MeshBasicMaterial({color:Wp.col,transparent:true,opacity:.85}));ring.rotation.x=Math.PI/2;g.add(core,ring);S.add(g);WELLS.push({g,ring,p:pt.clone(),t:Wp.well})}
// max effective range per weapon (m): full damage to half range, falling to 35% at max range; nothing registers beyond it
const WRANGE={pulse:90,burst:85,smg:45,scatter:24,rail:170,arc:75,ion:60,cryo:22,void:45,chain:32};WEAPONS.forEach(w=>{w.range=WRANGE[w.id]||w.range||80});
const rangeMul=d=>{const R=Wp.range||80;return d<=R*.5?1:Math.max(.35,1-.65*(d-R*.5)/(R*.5))};
// spider hit zones: the box collider is only a broad phase; the ray is tested against the body ellipsoid (cephalothorax+abdomen)
// body hits do full damage, the head end (front third) 1.3x, a ray that only crosses the leg span does 35%
const _zi=new T.Matrix4(),_zo=new T.Vector3(),_zd=new T.Vector3();
function zoneMul(e){const m=e.m;m.updateMatrixWorld();_zi.copy(m.matrixWorld).invert();_zo.copy(rc.ray.origin).applyMatrix4(_zi);_zd.copy(rc.ray.direction).transformDirection(_zi);
 const rx=1.3,ry=.72,rz=.68,cy=.19,ox=_zo.x/rx,oy=(_zo.y-cy)/ry,oz=_zo.z/rz,dx=_zd.x/rx,dy=_zd.y/ry,dz=_zd.z/rz,a=dx*dx+dy*dy+dz*dz,b=2*(ox*dx+oy*dy+oz*dz),c=ox*ox+oy*oy+oz*oz-1,D=b*b-4*a*c;
 if(D<0)return .35;const t=(-b-Math.sqrt(D))/(2*a),hz=_zo.z+_zd.z*t;return hz>rz*.45?1.3:1}
function hitDmg(e,h){return Wp.dmg*zoneMul(e)*rangeMul(h.distance)}
function discharge(){ammo--;MFX.fire();fxShot();dsrc=SHORT[Wp.id]||Wp.name;const spr=Wp.spr*(1-.75*ads)*[1,.8,.6][stance]*(sprinting?1.6:1);rec+=Wp.rec;pitch+=Wp.kick;yaw+=(rnd()-.5)*Wp.kick;mf.intensity=3;SND.fire(Wp);rc.far=Wp.range||100;
 for(let p=0;p<Wp.pel;p++){aimAt((rnd()-.5)*2*spr,(rnd()-.5)*2*spr);
