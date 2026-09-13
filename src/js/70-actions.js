/* ================= 9. INPUT ================= */
const keys={};let playing=false,actCd=0,clickTarget=null;
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='KeyE')doAct();if(e.code==='Space')doAttack();if(e.code==='KeyQ')doEat();if(e.code==='KeyC')doFire();if(e.code==='KeyB')doBridge();});
addEventListener('keyup',e=>keys[e.code]=false);
const ray=new THREE.Raycaster(),mouseV=new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown',e=>{mouseV.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(mouseV,camera);const hit=ray.intersectObject(ground)[0];if(hit&&walkable(hit.point.x,hit.point.z))clickTarget={x:hit.point.x,z:hit.point.z};});
document.getElementById('btn-act').onclick=()=>doAct();document.getElementById('btn-atk').onclick=()=>doAttack();
document.getElementById('btn-eat').onclick=()=>doEat();document.getElementById('btn-fire').onclick=()=>doFire();
document.getElementById('btn-bridge').onclick=()=>doBridge();
function toast(msg){const box=document.getElementById('toast');const d=document.createElement('div');d.className='toastmsg';d.textContent=msg;box.appendChild(d);setTimeout(()=>d.remove(),2600);while(box.children.length>3)box.firstChild.remove();}
function nearestInteract(maxD=2.8){let best=null,bd=maxD;for(const o of interactables){if(o.gone)continue;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<bd){bd=d;best=o;}}return best;}
function nearestRabbit(maxD=2.8){let best=null,bd=maxD;for(const r of rabbits){const d=Math.hypot(r.x-P.x,r.z-P.z);if(d<bd){bd=d;best=r;}}return best;}
function doAct(){
  if(!playing||P.dead||actCd>0)return;
  const pm=nearestPossum(2.8);
  if(pm){actCd=0.32;giftToPossum(pm);return;}
  const rb=nearestRabbit(2.6);
  if(rb){actCd=0.3;toast('🐇 Too quick — hit it with Space!');return;}
  const o=nearestInteract();if(!o){toast('Nothing in reach — try CBD parks, NW grassland, unlocked zones');return;}
  actCd=0.3;const hasAxe=inv.axe>0,hasPick=inv.pick>0;
  if(o.kind==='tree'){o.hp-=hasAxe?2:1;toast(hasAxe?'🪓 Chop!':'✊ Shaking the tree... craft an axe!');if(o.hp<=0){inv.log+=2;toast('🪵 +2 logs');regrow(o);}}
  else if(o.kind==='rock'){o.hp-=hasPick?2:1;toast(hasPick?'⛏️ Clang!':'✊ Kick the rubble... craft a pickaxe!');if(o.hp<=0){inv.stone+=2;toast('🪨 +2 stone');regrow(o);}}
  else if(o.kind==='bush'){if(o.has){o.has=false;o.berries.visible=false;inv.berries+=3;toast('🫐 +3 berries');setTimeout(()=>{o.has=true;o.berries.visible=true;},90000);}else toast('No berries yet...');}
  else if(o.kind==='wheat'){if(!(inv.pick>0)){toast('🌾 Tough roots! Harvest wheat with a ⛏️ pickaxe only.');}else{inv.wheat+=2;toast('🌾 +2 wheat');regrow(o);}}
  else if(o.kind==='flower'){inv.flower++;P.sanity=Math.min(100,P.sanity+5);toast('🌸 +1 petals, +5 sanity');regrow(o);}
  else if(o.kind==='grass'){inv.berries+=1;toast('🌱 +1 fibre-berries');regrow(o);}
  renderInv();
}
function regrow(o){o.gone=true;o.mesh.visible=false;setTimeout(()=>{const z=zoneOf(o.x,o.z);let s;if(o.kind==='wheat'&&(z==='grassland'||z==='farm'||Math.random()<0.6))s=(z==='farm'||Math.random()<0.4)?randFarm():randGrass();else if(z==='wetland')s=randWet();else if(z==='grassland')s=randGrass();else if(z==='farm')s=randFarm();else if(z==='ruin')s=randRuin();else s=randCBD();o.x=s.x;o.z=s.z;o.mesh.position.set(s.x,0,s.z);o.hp=(o.kind==='tree'||o.kind==='rock')?3:1;o.gone=false;o.mesh.visible=true;},60000);}
function doAttack(){
  if(!playing||P.dead)return;P.atkAnim=0.3;
  let hit=null,hk=null,bd=2.8;
  for(const m of mobs){const d=Math.hypot(m.x-P.x,m.z-P.z);if(d<bd){bd=d;hit=m;hk='spider';}}
  for(const r of rabbits){const d=Math.hypot(r.x-P.x,r.z-P.z);if(d<bd){bd=d;hit=r;hk='rabbit';}}
  for(const p of possums){const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;hit=p;hk='possum';}}
  const dmg=(sel==='spear'&&inv.spear>0)?34:10;
  if(!hit){toast('Swung at the air...');return;}
  hit.hp-=dmg;
  if(hk==='rabbit'&&hit.hp<=0){scene.remove(hit.mesh);rabbits.splice(rabbits.indexOf(hit),1);inv.morsel++;P.sanity=Math.max(0,P.sanity-2);toast('🍗 +1 morsel (edible)');}
  else if(hk==='spider'&&hit.hp<=0){scene.remove(hit.mesh);mobs.splice(mobs.indexOf(hit),1);inv.meat++;toast('🍖 +meat');}
  else if(hk==='possum'){
    if(hit.mode==='friend'){hit.mode='enemy';setPossumMood(hit);toast('🦡 Betrayal! Your mate turns enemy!');}
    else{if(hit.mode!=='enemy'){hit.mode='enemy';setPossumMood(hit);}toast('🦡 It hisses and fights back!');}
    P.sanity=Math.max(0,P.sanity-5);
    if(hit.hp<=0){scene.remove(hit.mesh);possums.splice(possums.indexOf(hit),1);inv.meat+=2;toast('🍖 +2 meat... the park remembers.');}
  }
  else toast(dmg>=34?'🗡️ Hit!':'👊 Hit!');
  renderInv();
}
function doEat(){if(!playing||P.dead)return;const it=ITEMS[sel];if(!it||!it.food||!(inv[sel]>0)){toast('Select berries / wheat / morsel / meat / petals first');return;}inv[sel]--;P.hunger=Math.min(100,P.hunger+it.food);if(sel==='flower')P.sanity=Math.min(100,P.sanity+4);if(sel==='garland'){P.sanity=Math.min(100,P.sanity+20);}toast(`😋 +${it.food} hunger`);renderInv();}
function doFire(){if(!playing||P.dead)return;if(!(inv.firekit>0)){toast('Craft a 🔥 Fire kit first (3 log + 1 stone)');return;}inv.firekit--;const fx=P.x+Math.sin(P.face)*1.5,fz=P.z+Math.cos(P.face)*1.5;placeFire(walkable(fx,fz)?fx:P.x,walkable(fx,fz)?fz:P.z);toast('🔥 Campfire lit!');renderInv();}
function segClosest(px,pz,ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;
  let t=L2?((px-ax)*dx+(pz-az)*dz)/L2:0;t=Math.max(0,Math.min(1,t));
  return {x:ax+dx*t,z:az+dz*t,d:Math.hypot(px-(ax+dx*t),pz-(az+dz*t)),dx,dz};
}
function doBridge(){
  if(!playing||P.dead)return;
  if(!(inv.bridgekit>0)){toast('Craft a 🌉 Bridge kit first (4 log + 2 stone)');return;}
  // nearest water segment (rivers + straight moat arms) — deck goes perpendicular to it
  let best=null;
  function consider(ax,az,bx,bz){const c=segClosest(P.x,P.z,ax,az,bx,bz);if(!best||c.d<best.d)best=c;}
  for(const r of RIVERS)for(let i=0;i<r.pts.length-1;i++)consider(r.pts[i][0],r.pts[i][1],r.pts[i+1][0],r.pts[i+1][1]);
  const mzN=(MOAT.z0+CBD.z0)/2,mzS=(MOAT.z1+CBD.z1)/2,mxW=(MOAT.x0+CBD.x0)/2,mxE=(MOAT.x1+CBD.x1)/2;
  consider(MOAT.x0,mzN,MOAT.x1,mzN);consider(MOAT.x0,mzS,MOAT.x1,mzS);
  consider(mxW,CBD.z0,mxW,CBD.z1);consider(mxE,CBD.z0,mxE,CBD.z1);
  if(!best||best.d>5.5){
    let pond=false;
    for(let a=0;a<8;a++)if(isPond(P.x+Math.cos(a/8*Math.PI*2)*3.5,P.z+Math.sin(a/8*Math.PI*2)*3.5)){pond=true;break;}
    if(pond){toast('Bridges are for rivers and the moat — just walk around the pond!');return;}
    toast('Stand next to water to lay a bridge (B)');
    return;
  }
  inv.bridgekit--;
  const L=Math.hypot(best.dx,best.dz)||1,nx=best.dx/L,nz=best.dz/L;
  const horiz=Math.abs(-nz)>=Math.abs(nx); // long axis (8) perpendicular to the water
  const b=addBridge(best.x,best.z,horiz);
  if(b){buildBridgeMesh(b);toast('🌉 Bridge laid straight across!');}
  renderInv();
}