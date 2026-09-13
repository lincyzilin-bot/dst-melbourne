/* ================= 7. RESOURCES / RABBITS / SPIDERS / FIRES ================= */
const world=new THREE.Group();scene.add(world);
const interactables=[],mobs=[],fires=[],rabbits=[],possums=[];
const GIFTS=['berries','wheat','morsel','meat','flower'];
function addEntity(o){o.mesh.position.set(o.x,0,o.z);world.add(o.mesh);interactables.push(o);return o;}
function randIn(rect){for(let t=0;t<60;t++){const x=rect.x0+2+Math.random()*(rect.x1-rect.x0-4),z=rect.z0+2+Math.random()*(rect.z1-rect.z0-4);if(!walkable(x,z)||isRoad(x,z))continue;if(Math.hypot(x-P.x,z-P.z)<3)continue;return{x,z};}return{x:SPAWN.x+3,z:SPAWN.z};}
function randCBD(){return randIn(CBD);}function randGrass(){for(let t=0;t<60;t++){const x=GRASS.x0+2+Math.random()*(GRASS.x1-GRASS.x0-4),z=GRASS.z0+2+Math.random()*(GRASS.z1-GRASS.z0-4);if(isWater(x,z)||hitsSolid(x,z,0.6))continue;return{x,z};}return{x:-50,z:-50};}
function randWet(){for(let t=0;t<60;t++){const x=WET.x0+2+Math.random()*(WET.x1-WET.x0-4),z=WET.z0+2+Math.random()*(WET.z1-WET.z0-4);if(isWater(x,z)||hitsSolid(x,z,0.6))continue;return{x,z};}return{x:-50,z:40};}
function randFarm(){for(let t=0;t<40;t++){const x=FARM.x0+1.5+Math.random()*(FARM.x1-FARM.x0-3),z=FARM.z0+1.5+Math.random()*(FARM.z1-FARM.z0-3);if(hitsSolid(x,z,0.8))continue;return{x,z};}return{x:85,z:0};}
function randRuin(){const R=Math.random()<.5?RUIN_N:RUIN_S;for(let t=0;t<40;t++){const x=R.x0+2+Math.random()*(R.x1-R.x0-4),z=R.z0+2+Math.random()*(R.z1-R.z0-4);if(hitsSolid(x,z,0.9))continue;return{x,z};}return{x:30,z:-60};}
const trunkM=new THREE.MeshStandardMaterial({color:0x6b4423,roughness:.9});
const leafM=new THREE.MeshStandardMaterial({color:0x2f7d32,roughness:.8});
function makeTree(x,z){const g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.26,1.8,8),trunkM);tr.position.y=0.9;tr.castShadow=true;g.add(tr);const c=new THREE.Mesh(new THREE.SphereGeometry(0.95,10,10),leafM);c.position.y=2.2;c.castShadow=true;g.add(c);return addEntity({kind:'tree',mesh:g,x,z,hp:3});}
function makeRock(x,z){const g=new THREE.Group();const r=new THREE.Mesh(new THREE.DodecahedronGeometry(0.6,0),new THREE.MeshStandardMaterial({color:0x8d8d96}));r.position.y=0.4;r.castShadow=true;g.add(r);return addEntity({kind:'rock',mesh:g,x,z,hp:3});}
function makeBush(x,z){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(0.6,10,10),new THREE.MeshStandardMaterial({color:0x2e6b2e}));b.position.y=0.6;b.castShadow=true;g.add(b);const berries=new THREE.Group();for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),new THREE.MeshStandardMaterial({color:0xe63946}));const a=Math.random()*7;s.position.set(Math.cos(a)*0.5,0.7,Math.sin(a)*0.5);berries.add(s);}g.add(berries);return addEntity({kind:'bush',mesh:g,x,z,hp:1,berries,has:true});}
function makeWheat(x,z){const g=new THREE.Group();const sm=new THREE.MeshStandardMaterial({color:0xa8892f}),hm=new THREE.MeshStandardMaterial({color:0xd9a92e});for(let i=0;i<6;i++){const sx=(Math.random()-.5),sz=(Math.random()-.5);const st=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.0,5),sm);st.position.set(sx,0.5,sz);g.add(st);const hd=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.45,7),hm);hd.position.set(sx,1.15,sz);g.add(hd);}return addEntity({kind:'wheat',mesh:g,x,z,hp:1});}
function makeGrassTuft(x,z){const g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0x6aa84f});for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.6,5),m);b.position.set((Math.random()-.5)*0.5,0.3,(Math.random()-.5)*0.5);g.add(b);}return addEntity({kind:'grass',mesh:g,x,z,hp:1});}
function makeFlower(x,z){const g=new THREE.Group();const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.5,6),new THREE.MeshStandardMaterial({color:0x3f8f3f}));stem.position.y=0.25;g.add(stem);const cols=[0xff5fa2,0xffd93b,0xffffff,0xc77dff];const f=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,8),new THREE.MeshStandardMaterial({color:cols[Math.floor(Math.random()*cols.length)]}));f.position.y=0.55;g.add(f);return addEntity({kind:'flower',mesh:g,x,z,hp:1});}
(function seed(){
  for(let i=0;i<70;i++){const s=randCBD();if(inPark(s.x,s.z)||Math.random()<0.5)makeTree(s.x,s.z);}
  for(let i=0;i<45;i++){const s=randCBD();makeRock(s.x,s.z);}
  for(let i=0;i<45;i++){const s=randCBD();makeBush(s.x,s.z);}
  for(let i=0;i<60;i++){const s=randCBD();makeFlower(s.x,s.z);}
  for(let i=0;i<40;i++){const s=randCBD();makeGrassTuft(s.x,s.z);}
  for(let i=0;i<30;i++){const s=randCBD();makeWheat(s.x,s.z);}
  // NW grassland: mainly rabbits + wheat (dense clusters)
  for(let c=0;c<18;c++){const ctr=randGrass();for(let j=0;j<12;j++){const x=ctr.x+(Math.random()+Math.random()+Math.random()-1.5)*8,z=ctr.z+(Math.random()+Math.random()+Math.random()-1.5)*8;if(isWater(x,z)||hitsSolid(x,z,0.5))continue;makeWheat(x,z);}}
  for(let i=0;i<40;i++){const s=randGrass();makeGrassTuft(s.x,s.z);}
  for(let i=0;i<40;i++){const s=randGrass();makeFlower(s.x,s.z);}
  for(let i=0;i<20;i++){const s=randGrass();makeTree(s.x,s.z);}
  for(let i=0;i<20;i++){const s=randGrass();makeRock(s.x,s.z);}
  for(let i=0;i<14;i++){const s=randGrass();makeBush(s.x,s.z);}
  // SW wetland: grass + bushes + flowers
  for(let i=0;i<50;i++){const s=randWet();makeGrassTuft(s.x,s.z);}
  for(let i=0;i<44;i++){const s=randWet();makeBush(s.x,s.z);}
  for(let i=0;i<36;i++){const s=randWet();makeFlower(s.x,s.z);}
  for(let i=0;i<14;i++){const s=randWet();makeTree(s.x,s.z);}
  for(let i=0;i<14;i++){const s=randWet();makeRock(s.x,s.z);}
  // FARM: neat wheat rows + a few trees/rocks at edges
  for(let rz=FARM.z0+4;rz<FARM.z1-3;rz+=4){for(let rx=FARM.x0+3;rx<FARM.x1-2;rx+=3){if(hitsSolid(rx,rz,0.8))continue;makeWheat(rx+(Math.random()-.5),rz+(Math.random()-.5));}}
  for(let i=0;i<10;i++){const s=randFarm();makeFlower(s.x,s.z);}
  // RUINS: construction waste = rocks + sparse weeds/flowers + dead trees
  for(let i=0;i<50;i++){const s=randRuin();makeRock(s.x,s.z);}
  for(let i=0;i<30;i++){const s=randRuin();makeGrassTuft(s.x,s.z);}
  for(let i=0;i<20;i++){const s=randRuin();makeFlower(s.x,s.z);}
  for(let i=0;i<16;i++){const s=randRuin();makeTree(s.x,s.z);}
})();
function spawnRabbit(pre){const s=pre||(Math.random()<0.75?randGrass():randCBD());const g=new THREE.Group();const fur=new THREE.MeshStandardMaterial({color:Math.random()<0.5?0xe8e2d4:0x9a7b5f,roughness:.85});const body=new THREE.Mesh(new THREE.SphereGeometry(0.28,12,10),fur);body.position.y=0.32;body.scale.set(1,0.85,1.25);body.castShadow=true;g.add(body);const hd=new THREE.Mesh(new THREE.SphereGeometry(0.18,10,10),fur);hd.position.set(0,0.55,0.3);g.add(hd);for(const sx of[-1,1]){const ear=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.32,0.05),fur);ear.position.set(sx*0.08,0.85,0.28);g.add(ear);}g.position.set(s.x,0,s.z);scene.add(g);rabbits.push({mesh:g,x:s.x,z:s.z,hp:20,dir:Math.random()*7,retarget:2,hop:Math.random()*7});}
for(let i=0;i<21;i++)spawnRabbit(randGrass());
for(let i=0;i<8;i++)spawnRabbit();
// POSSUMS — live in CBD parks (Flagstaff); gift food/flowers to befriend, hit to make enemy
function moodSprite(emoji){const cv=document.createElement('canvas');cv.width=cv.height=64;const cc=cv.getContext('2d');cc.font='48px serif';cc.textAlign='center';cc.textBaseline='middle';cc.fillText(emoji,32,36);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(0.9,0.9,1);s.position.y=1.9;s.visible=false;return s;}
function spawnPossum(x,z){
  const g=new THREE.Group();
  const fur=new THREE.MeshStandardMaterial({color:0x6f6a66,roughness:.9});
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.4,14,12),fur);body.position.y=0.5;body.scale.set(1.15,0.9,0.95);body.castShadow=true;g.add(body);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(0.27,12,10),new THREE.MeshStandardMaterial({color:0x8d8880}));hd.position.set(0,0.85,0.35);g.add(hd);
  for(const sx of[-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.28,8),new THREE.MeshStandardMaterial({color:0x5a5550}));ear.position.set(sx*0.18,1.12,0.3);g.add(ear);}
  const heart=moodSprite('❤️'),anger=moodSprite('❗');g.add(heart);g.add(anger);
  g.position.set(x,0,z);scene.add(g);
  const p={mesh:g,x,z,hp:45,mode:'neutral',trust:0,home:{x,z},dir:Math.random()*7,retarget:2,atkT:0,heart,anger};
  possums.push(p);return p;
}
function setPossumMood(p){p.heart.visible=(p.mode==='friend');p.anger.visible=(p.mode==='enemy');}
for(let i=0;i<5;i++){const a=Math.random()*7,r=2+Math.random()*5;const x=FLAGSTAFF.x+Math.cos(a)*r,z=FLAGSTAFF.z+Math.sin(a)*r;if(walkable(x,z))spawnPossum(x,z);}
for(let i=0;i<2;i++){const s=randCBD();if(inPark(s.x,s.z))spawnPossum(s.x,s.z);}
function nearestPossum(maxD=2.8){let best=null,bd=maxD;for(const p of possums){const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;best=p;}}return best;}
function giftToPossum(p){
  if(p.mode==='enemy'){toast('🦡 It hisses! It remembers that fight.');return;}
  if(p.mode==='friend'){toast('🦡 Already your mate — it follows you.');return;}
  const id=sel;
  if(!GIFTS.includes(id)||!(inv[id]>0)){toast('Select food or flowers first, then E to offer');return;}
  inv[id]--;p.trust++;P.sanity=Math.min(100,P.sanity+6);
  if(p.trust>=2){p.mode='friend';setPossumMood(p);toast('🦡 Possum friend! It follows and fights spiders.');}
  else toast('🦡 It nibbles... one more gift? (1/2)');
  renderInv();
}
function updatePossums(dt){
  for(const p of possums){
    p.retarget-=dt;p.atkT-=dt;
    let sp=0,tx=null,tz=null;
    if(p.mode==='friend'){
      const dx=P.x-p.x,dz=P.z-p.z,d=Math.hypot(dx,dz);
      let foe=null,fd=5;
      for(const m of mobs){const dd=Math.hypot(m.x-P.x,m.z-P.z);if(dd<fd){fd=dd;foe=m;}}
      if(foe){foe.hp-=25*dt;if(foe.hp<=0){scene.remove(foe.mesh);mobs.splice(mobs.indexOf(foe),1);inv.meat++;toast('🦡 Mate mauled a spider! +meat');renderInv();}}
      if(d>3){tx=P.x;tz=P.z;sp=5.5;}
    }else if(p.mode==='enemy'){
      const dx=P.x-p.x,dz=P.z-p.z,d=Math.hypot(dx,dz);
      if(d<14){tx=P.x;tz=P.z;sp=5.2;if(d<1.7&&p.atkT<=0){p.atkT=1.1;P.hp-=6;P.sanity=Math.max(0,P.sanity-4);toast('🦡 Possum scratch! -6 HP');}}
      else{if(p.retarget<=0){p.retarget=2+Math.random()*3;p.dir=Math.random()*7;}tx=p.x+Math.sin(p.dir)*5;tz=p.z+Math.cos(p.dir)*5;sp=1.5;}
    }else{
      if(p.retarget<=0){p.retarget=2+Math.random()*4;p.dir=Math.random()*7;}
      if(Math.hypot(p.x-p.home.x,p.z-p.home.z)>16)p.dir=Math.atan2(p.home.x-p.x,p.home.z-p.z);
      tx=p.x+Math.sin(p.dir)*5;tz=p.z+Math.cos(p.dir)*5;sp=1.5;
    }
    if(tx!==null){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>0.2){const nx=p.x+dx/d*Math.min(sp*dt,d),nz=p.z+dz/d*Math.min(sp*dt,d);if(walkable(nx,nz)){p.x=nx;p.z=nz;}p.mesh.rotation.y=Math.atan2(dx,dz);}p.mesh.position.set(p.x,Math.abs(Math.sin(performance.now()*0.012))*0.12,p.z);}
  }
}
function spawnSpider(){const a=Math.random()*7,r=16+Math.random()*8;let x=Math.max(-95,Math.min(95,P.x+Math.cos(a)*r)),z=Math.max(-95,Math.min(95,P.z+Math.sin(a)*r));if(!walkable(x,z))return;const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,10),new THREE.MeshStandardMaterial({color:0x1a1a22}));b.position.y=0.55;b.castShadow=true;g.add(b);g.position.set(x,0,z);scene.add(g);mobs.push({mesh:g,x,z,hp:60,atkT:0});}
function placeFire(x,z,fuel=120){const g=new THREE.Group();for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,1.1,7),trunkM);l.rotation.z=Math.PI/2;l.rotation.y=i*0.8;l.position.y=0.25;g.add(l);}const flame=new THREE.Mesh(new THREE.ConeGeometry(0.4,1.1,10),new THREE.MeshBasicMaterial({color:0xff9a2e,transparent:true,opacity:.95}));flame.position.y=1.0;g.add(flame);const light=new THREE.PointLight(0xff9a3c,30,24,1.7);light.position.y=1.6;g.add(light);g.position.set(x,0,z);scene.add(g);fires.push({mesh:g,x,z,fuel,flame,light});}