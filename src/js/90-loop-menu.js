/* ================= 11. LOOP ================= */
const clock=new THREE.Clock();let saveT=0,mmT=0,lockToastCd=0;
function movePlayer(dt){
  let ix=0,iz=0;
  if(keys.KeyW||keys.ArrowUp)iz-=1;if(keys.KeyS||keys.ArrowDown)iz+=1;
  if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
  if(clickTarget){const dx=clickTarget.x-P.x,dz=clickTarget.z-P.z,d=Math.hypot(dx,dz);if(d<0.7)clickTarget=null;else{ix+=dx/d;iz+=dz/d;}}
  const L=Math.hypot(ix,iz);P.moving=L>0.15;
  if(P.moving){
    if(L>1){ix/=L;iz/=L;}
    if(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||keys.ArrowUp||keys.ArrowDown||keys.ArrowLeft||keys.ArrowRight)clickTarget=null;
    const nx=P.x+ix*P.speed*dt,nz=P.z+iz*P.speed*dt;
    // zone gates: block entry + message while locked
    function gateMsg(test,msg){if(test(nx,nz)){lockToastCd-=dt;if(lockToastCd<=0){lockToastCd=3;toast(msg);}return true;}return false;}
    let blockedX=false;
    if(gateMsg((x,z)=>isWet(x,z)&&wetlandLocked(),'🔒 Wetland locked — survive past Day 3 (reach Day 4)!'))blockedX=true;
    else if(gateMsg((x,z)=>inFarm(x,z)&&farmLocked(),'🔒 Farm locked — survive 4 days (reach Day 5)!'))blockedX=true;
    else if(gateMsg((x,z)=>inRuin(x,z)&&ruinLocked(),'🔒 Ruins locked — survive 6 days (reach Day 7)!'))blockedX=true;
    else if(gateMsg((x,z)=>isMoat(x,z),'🌊 Wide moat — lay a 🌉 bridge (B) at the water\'s edge!'))blockedX=true;
    else if(gateMsg((x,z)=>isRiver(x,z)&&!onBridge(x,z),'🌊 Small river — cross at a 🌉 bridge (B)!'))blockedX=true;
    else if(walkable(nx,P.z))P.x=nx;
    if((isWet(P.x,nz)&&wetlandLocked())||(inFarm(P.x,nz)&&farmLocked())||(inRuin(P.x,nz)&&ruinLocked())){/* blocked on z too */}
    else if(walkable(P.x,nz))P.z=nz;
    P.face=Math.atan2(ix,iz);P.walkPhase+=dt*12;
  }
  player.position.set(P.x,0,P.z);player.rotation.y=P.face;
  const sw=P.moving?Math.sin(P.walkPhase)*0.55:0;
  legL.rotation.x=sw;legR.rotation.x=-sw;armL.rotation.x=-sw*0.8;
  if(P.atkAnim>0){P.atkAnim-=dt;armR.rotation.x=-2.2+P.atkAnim*6;}else armR.rotation.x=sw*0.8;
  torso.position.y=1.25+(P.moving?Math.abs(Math.sin(P.walkPhase))*0.05:0);
}
function updateSky(){
  const ph=phaseOf(P.dayT);
  const sky=ph==='day'?new THREE.Color(0x87bfe8):ph==='dusk'?new THREE.Color(0xe08a5a):new THREE.Color(0x0a0d26);
  scene.background.copy(sky);scene.fog.color.copy(sky);
  sun.intensity+=(((ph==='day')?1.5:(ph==='dusk'?0.7:0.08))-sun.intensity)*0.05;
  hemi.intensity+=(((ph==='day')?0.9:0.2)-hemi.intensity)*0.05;
  sun.position.set(P.x+20,ph==='night'?8:32,P.z+12);sun.target.position.set(P.x,0,P.z);
  playerLight.position.set(P.x,3,P.z);playerLight.intensity=ph==='night'?(nearFire()?0:7):0;playerLight.color.set(0x8fa8ff);
  lockWall.visible=wetlandLocked();
  if(typeof farmWall!=='undefined')farmWall.visible=farmLocked();
  if(typeof ruinWall!=='undefined')ruinWall.visible=ruinLocked();
  document.getElementById('clockfill').style.width=(P.dayT*100)+'%';
  document.getElementById('phase-icon').textContent=PHASE_ICO[ph];
  document.getElementById('day-label').textContent='Day '+P.day;
  document.getElementById('zone-label').textContent=ZONE_ICON[zoneOf(P.x,P.z)]+(isWet(P.x,P.z)?'':'') ;
  const lt=document.getElementById('lock-tag');
  if(lt){
    if(wetlandLocked()){lt.textContent=`🔒 WETLAND unlocks Day 4 (now Day ${P.day})`;lt.className='';}
    else{lt.textContent='💧 WETLAND OPEN — explore!';lt.className='open';}
    lt.id='lock-tag';
  }
  const lf=document.getElementById('lock-tag-farm');
  if(lf){
    if(farmLocked()){lf.textContent=`🔒 FARM unlocks Day 5 (now Day ${P.day})`;lf.className='';}
    else{lf.textContent='🚜 FARM OPEN — explore!';lf.className='open';}
    lf.id='lock-tag-farm';
  }
  const lr=document.getElementById('lock-tag-ruin');
  if(lr){
    if(ruinLocked()){lr.textContent=`🔒 RUINS unlock Day 7 (now Day ${P.day})`;lr.className='';}
    else{lr.textContent='🏚️ RUINS OPEN — explore!';lr.className='open';}
    lr.id='lock-tag-ruin';
  }
}
const mm=document.getElementById('minimap').getContext('2d');
const thumb=document.createElement('canvas');thumb.width=thumb.height=N;
thumb.getContext('2d').drawImage(groundCanvas,0,0,N,N);
function drawMinimap(){mm.clearRect(0,0,180,180);mm.drawImage(thumb,0,0,180,180);mm.fillStyle='rgba(5,5,15,.88)';const s=180/N;for(let gz=0;gz<N;gz++)for(let gx=0;gx<N;gx++)if(!lifeBits[gz*N+gx])mm.fillRect(gx*s,gz*s,s+0.5,s+0.5);const px=(P.x+HALF)/WORLD*180,pz=(P.z+HALF)/WORLD*180;mm.fillStyle='#fff';mm.beginPath();mm.arc(px,pz,4,0,7);mm.fill();mm.fillStyle='#e63946';mm.beginPath();mm.arc(px,pz,2.4,0,7);mm.fill();}
function updateExploreUI(){document.getElementById('explore-pct').textContent=lifetimePct().toFixed(1)+'%';document.getElementById('explore-sub').textContent=`lifetime · ${lifetimeCount()}/${landTotal} cells`;document.getElementById('run-sub').textContent=`this run · +${runAdded} new cells`;}
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.05);
  if(playing&&!P.dead){
    actCd-=dt;movePlayer(dt);simulate(dt);reveal(P.x,P.z);
    if(fogDirty){redrawFog();fogDirty=false;}
    const o=nearestInteract(),rb=nearestRabbit(2.6),pm=nearestPossum(2.8);const pr=document.getElementById('prompt');
    if(pm){pr.style.display='block';pr.innerHTML=pm.mode==='friend'?'🦡 mate — follows + fights spiders':pm.mode==='enemy'?'🦡 enemy! <b>[Space]</b> defend':'🦡 possum — <b>[E]</b> offer food/flowers';}
    else if(rb){pr.style.display='block';pr.innerHTML='🐇 rabbit — <b>[Space]</b> hunt';}
    else if(o){const nm={tree:'Tree (chop)',rock:'Rubble (mine)',bush:'Bush berries (pick)',wheat:'Wheat (pickaxe only)',grass:'Grass (pull)',flower:'Flowers (pick)'};pr.style.display='block';pr.innerHTML=`<b>[E]</b> ${nm[o.kind]||o.kind}`;}
    else pr.style.display='none';
    document.getElementById('hp-num').textContent=Math.ceil(P.hp);
    document.getElementById('hunger-num').textContent=Math.ceil(P.hunger);
    document.getElementById('sanity-num').textContent=Math.ceil(P.sanity);
    document.getElementById('hp-fill').style.width=Math.max(0,P.hp)+'%';
    document.getElementById('hunger-fill').style.width=Math.max(0,P.hunger)+'%';
    document.getElementById('sanity-fill').style.width=Math.max(0,P.sanity)+'%';
    updateExploreUI();mmT+=dt;if(mmT>0.5){mmT=0;drawMinimap();}
    saveT+=dt;if(saveT>5){saveT=0;commitLifetime();save.player={x:P.x,z:P.z,hp:P.hp,hunger:P.hunger,sanity:P.sanity,day:P.day,dayT:P.dayT,inv};persist(false);const t=document.getElementById('saved-tag');t.style.opacity=1;clearTimeout(persist._t);persist._t=setTimeout(()=>t.style.opacity=0,800);}
  }
  for(const o of interactables)if(o.kind==='wheat'&&!o.gone)o.mesh.rotation.z=Math.sin(performance.now()*0.0018+o.x)*0.045;
  camera.position.set(P.x+CAM_OFF.x,CAM_OFF.y,P.z+CAM_OFF.z);camera.lookAt(P.x,0,P.z);
  updateSky();renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
addEventListener('beforeunload',()=>{if(playing){commitLifetime();save.player=P.dead?null:{x:P.x,z:P.z,hp:P.hp,hunger:P.hunger,sanity:P.sanity,day:P.day,dayT:P.dayT,inv};try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}}});
/* ================= 12. MENU ================= */
function refreshStartPanel(){document.getElementById('start-pct').textContent=lifetimePct().toFixed(1)+'%';const rl=document.getElementById('runs-list');rl.innerHTML=save.runs.length?save.runs.map((r,i)=>`<div>#${save.totalRuns-i} · ${r.d} — Day ${r.day}, lifetime ${r.pct}% (+${r.added})</div>`).join(''):'<div>No runs yet. Lace up your boots, mate.</div>';document.getElementById('btn-continue').style.display=save.player?'':'none';}
function startRun(fresh){
  if(fresh){if(runAdded>0||P.day>1){commitLifetime();save.runs.unshift({d:new Date().toLocaleString(),day:P.day,pct:+lifetimePct().toFixed(1),added:runAdded});save.runs=save.runs.slice(0,20);}save.totalRuns++;Object.assign(P,{x:SPAWN.x,z:SPAWN.z,hp:100,hunger:100,sanity:100,day:1,dayT:0.15,dead:false});inv={berries:2,wheat:0,morsel:0,flower:0,log:0,stone:0,meat:0,axe:0,pick:0,spear:0,firekit:0,garland:0,bridgekit:0};sel='berries';for(const m of mobs)scene.remove(m.mesh);mobs.length=0;for(const f of fires)scene.remove(f.mesh);fires.length=0;for(const r of rabbits)scene.remove(r.mesh);rabbits.length=0;for(const p of possums)scene.remove(p.mesh);possums.length=0;for(const b of bridges)if(b.group)scene.remove(b.group);bridges.length=0;for(let i=0;i<21;i++)spawnRabbit(randGrass());for(let i=0;i<5;i++){const a=Math.random()*7,r=2+Math.random()*5;spawnPossum(FLAGSTAFF.x+Math.cos(a)*r,FLAGSTAFF.z+Math.sin(a)*r);}save.player=null;}
  else if(save.player){Object.assign(P,save.player);inv=Object.assign(inv,save.player.inv);if(!walkable(P.x,P.z)){P.x=SPAWN.x;P.z=SPAWN.z;}}
  runAdded=0;persist(false);
  document.getElementById('start-overlay').classList.add('hidden');document.getElementById('dead-overlay').classList.add('hidden');
  document.getElementById('hud').classList.add('on');playing=true;P.dead=false;renderInv();drawMinimap();updateExploreUI();
  toast(fresh?'🧭 New run! Every crossing needs your own 🌉 bridge (B). Wet D4 · Farm D5 · Ruins D7.':'🧭 Welcome back. Map saved.');
}
document.getElementById('btn-continue').onclick=()=>startRun(false);
document.getElementById('btn-new').onclick=()=>startRun(true);
document.getElementById('btn-respawn').onclick=()=>{refreshStartPanel();startRun(true);};
document.getElementById('btn-wipe').onclick=()=>{if(confirm('Wipe ALL exploration + history?')){save=freshSave();lifeBits=save.lifetime.split('').map(Number);runAdded=0;persist();redrawFog();refreshStartPanel();}};
document.getElementById('history-btn').onclick=()=>{document.getElementById('history-list').innerHTML=save.runs.length?save.runs.map((r,i)=>`<div>#${save.totalRuns-i} · ${r.d} — Day ${r.day}, ${r.pct}% (+${r.added})</div>`).join(''):'<div>No runs yet.</div>';document.getElementById('history-overlay').classList.remove('hidden');};
document.getElementById('btn-close-history').onclick=()=>document.getElementById('history-overlay').classList.add('hidden');
document.getElementById('btn-how').onclick=()=>document.getElementById('how-overlay').classList.remove('hidden');
document.getElementById('btn-close-how').onclick=()=>document.getElementById('how-overlay').classList.add('hidden');
refreshStartPanel();renderInv();