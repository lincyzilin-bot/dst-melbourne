/* ================= 10. DAY/NIGHT SIM ================= */
function phaseOf(t){return t<0.55?'day':t<0.72?'dusk':'night';}
const PHASE_ICO={day:'☀️',dusk:'🌇',night:'🌙'};
function nearFire(r=13){return fires.some(f=>Math.hypot(f.x-P.x,f.z-P.z)<r&&f.fuel>0);}
function simulate(dt){
  P.dayT+=dt/DAY_LEN;
  if(P.dayT>=1){P.dayT-=1;P.day++;
    if(P.day===4)toast('🌅 Day 4 — 💧 WETLAND UNLOCKED! Head south-west!');
    else if(P.day===5)toast('🌅 Day 5 — 🚜 FARM UNLOCKED! Head north-east!');
    else if(P.day===7)toast('🌅 Day 7 — 🏚️ RUINS UNLOCKED! Head south-east!');
    else toast(`🌅 Day ${P.day} — over Melbourne`);
  }
  const ph=phaseOf(P.dayT);
  P.hunger=Math.max(0,P.hunger-dt*(100/360));
  if(P.hunger<=0)P.hp-=dt*3;else if(P.hunger>60)P.hp=Math.min(100,P.hp+dt*1.2);
  const garland=inv.garland>0;
  if(ph==='night'&&!nearFire(11))P.sanity-=dt*(garland?1.0:2.5);
  else if(nearFire(11))P.sanity=Math.min(100,P.sanity+dt*2.5);
  else if(ph==='day')P.sanity=Math.min(100,P.sanity+dt*0.8);
  if(ph==='night'&&!nearFire(11))P.hp-=dt*1.4;
  if(P.sanity<=0)P.hp-=dt*1.0;
  if(ph==='night'&&mobs.length<4&&Math.random()<dt*0.2)spawnSpider();
  if(ph==='day'&&mobs.length&&Math.random()<dt*0.4){const m=mobs.pop();if(m)scene.remove(m.mesh);}
  updatePossums(dt);
  // rabbits: day-active, flee player (50% more in grassland via spawn bias)
  if(ph==='night'){for(const r of rabbits)scene.remove(r.mesh);rabbits.length=0;}
  else{if(rabbits.length<24&&Math.random()<dt*0.6)spawnRabbit();
    for(const r of rabbits){const dx=r.x-P.x,dz=r.z-P.z,d=Math.hypot(dx,dz);r.retarget-=dt;r.hop+=dt*10;let sp=0;if(d<6){r.dir=Math.atan2(dx,dz);sp=6.5;}else{if(r.retarget<=0){r.retarget=2+Math.random()*3;r.dir=Math.random()*7;}sp=2;}const nx=r.x+Math.sin(r.dir)*sp*dt,nz=r.z+Math.cos(r.dir)*sp*dt;if(walkable(nx,nz)){r.x=nx;r.z=nz;}else r.dir+=1.7;r.mesh.position.set(r.x,Math.abs(Math.sin(r.hop))*0.22,r.z);r.mesh.rotation.y=r.dir;}}
  for(const m of mobs){
    const dx=P.x-m.x,dz=P.z-m.z,d=Math.hypot(dx,dz)||0.01;
    m.x+=dx/d*4.5*dt;m.z+=dz/d*4.5*dt;
    m.phase=(m.phase||0)+dt*14;
    m.mesh.position.set(m.x,Math.abs(Math.sin(m.phase*0.5))*0.08,m.z);
    m.mesh.rotation.y=Math.atan2(dx,dz);
    if(m.legs)for(const l of m.legs)l.hip.rotation.x=Math.sin(m.phase+l.off)*0.45;
    m.atkT-=dt;if(d<1.6&&m.atkT<=0){m.atkT=1.2;P.hp-=8;toast('🕷️ Spider bite! -8 HP');}
  }
  for(let i=fires.length-1;i>=0;i--){const f=fires[i];f.fuel-=dt;f.flame.scale.setScalar(0.8+Math.sin(performance.now()*0.02+f.x)*0.2);f.light.intensity=f.fuel>0?26:0;if(f.fuel<=0){scene.remove(f.mesh);fires.splice(i,1);}}
  if(P.hp<=0&&!P.dead)die('Hunger and shadow got you.');
}
function die(cause){P.dead=true;commitLifetime();const pct=lifetimePct();if(pct>(save.best||0))save.best=pct;save.runs.unshift({d:new Date().toLocaleString(),day:P.day,pct:+pct.toFixed(1),added:runAdded});save.runs=save.runs.slice(0,20);save.player=null;persist();document.getElementById('dead-cause').textContent=cause+` You survived to Day ${P.day}.`;document.getElementById('dead-stats').innerHTML=`<div>🗺️ Lifetime explored: <b>${pct.toFixed(1)}%</b> (${lifetimeCount()}/${landTotal})</div><div>➕ New ground this run: <b>${runAdded}</b> cells</div>`;document.getElementById('dead-overlay').classList.remove('hidden');refreshStartPanel();}