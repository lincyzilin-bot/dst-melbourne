/* ================= 6. HUMAN CHARACTER ================= */
const player=new THREE.Group();
const skinM=new THREE.MeshStandardMaterial({color:0xf2c89b,roughness:.6});
const shirtM=new THREE.MeshStandardMaterial({color:0x2e7d5b,roughness:.7});
const pantsM=new THREE.MeshStandardMaterial({color:0x2b3550,roughness:.8});
const bootM=new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:.9});
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.34,0.55,6,12),shirtM);torso.position.y=1.25;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,18,14),skinM);head.position.y=1.98;head.castShadow=true;player.add(head);
const beanie=new THREE.Mesh(new THREE.SphereGeometry(0.29,14,10,0,Math.PI*2,0,Math.PI/2.4),new THREE.MeshStandardMaterial({color:0xd35400}));beanie.position.y=2.02;player.add(beanie);
const eyeM=new THREE.MeshBasicMaterial({color:0x141414});
for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,8),eyeM);e.position.set(sx*0.1,2.0,0.24);player.add(e);}
function limb(w,len,mat){const p=new THREE.Group();const m=new THREE.Mesh(new THREE.BoxGeometry(w,len,w),mat);m.position.y=-len/2;m.castShadow=true;p.add(m);return p;}
const armL=limb(0.15,0.62,shirtM);armL.position.set(-0.46,1.55,0);player.add(armL);
const armR=limb(0.15,0.62,shirtM);armR.position.set(0.46,1.55,0);player.add(armR);
for(const a of[armL,armR]){const h=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8),skinM);h.position.y=-0.66;a.add(h);}
const legL=limb(0.19,0.85,pantsM);legL.position.set(-0.15,0.9,0);player.add(legL);
const legR=limb(0.19,0.85,pantsM);legR.position.set(0.15,0.9,0);player.add(legR);
for(const l of[legL,legR]){const b=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.14,0.3),bootM);b.position.set(0,-0.9,0.05);l.add(b);}
scene.add(player);
// rowboat shell around the player, shown while paddling (select 🚣 in inventory)
const boatHull=new THREE.Group();
(function(){
  const hull=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.5,2.4),new THREE.MeshStandardMaterial({color:0x7a4a28,roughness:.9}));
  hull.position.y=0.35;hull.castShadow=true;boatHull.add(hull);
  const rim=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.18,2.6),new THREE.MeshStandardMaterial({color:0x5d3a20,roughness:.9}));
  rim.position.y=0.62;boatHull.add(rim);
  for(const sx of[-1,1]){const seat=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,0.35),new THREE.MeshStandardMaterial({color:0x8a6a3f}));seat.position.set(0,0.55,sx*0.6);boatHull.add(seat);}
})();
boatHull.visible=false;player.add(boatHull);
const P={x:SPAWN.x,z:SPAWN.z,face:0,hp:100,hunger:100,sanity:100,day:1,dayT:0.15,dead:false,speed:7.5,walkPhase:0,moving:false,atkAnim:0};
if(save.player)Object.assign(P,save.player);
function inBoat(){try{return sel==='boat'&&inv.boat>0;}catch(e){return false;}} // TDZ-safe: sel/inv load after this file
function boatPassable(x,z){return isMoat(x,z)||isPond(x,z);}
function walkable(x,z){
  if(Math.abs(x)>96||Math.abs(z)>96)return false;
  if(hitsSolid(x,z))return false;
  if(isWet(x,z)&&wetlandLocked())return false; // 🔒 locked until Day 4
  if(inFarm(x,z)&&farmLocked())return false;   // 🔒 locked until Day 5
  if(inRuin(x,z)&&ruinLocked())return false;   // 🔒 locked until Day 7
  if(isRiver(x,z)&&!onBridge(x,z))return false; // small rivers need bridges (boat can't cross)
  if(isWater(x,z)){
    if(inBoat()&&boatPassable(x,z))return true; // 🚣 rowboat paddles the moat/ponds
    return false;
  }
  return true;
}
if(!walkable(P.x,P.z)){P.x=SPAWN.x;P.z=SPAWN.z;}