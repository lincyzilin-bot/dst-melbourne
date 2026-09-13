/* ================= 4. BUILDINGS (CBD blocks) + landmarks ================= */
function windowTexture(base,lit){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,64,128);for(let y=8;y<120;y+=12)for(let x=6;x<58;x+=12){g.fillStyle=Math.random()<lit?'#ffe28a':'#20242e';g.fillRect(x,y,7,8);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const bMats=[windowTexture('#8d9299',.25),windowTexture('#6f7f96',.3),windowTexture('#a08060',.2),windowTexture('#4a5a70',.45)].map(t=>new THREE.MeshLambertMaterial({map:t}));
const roofMat=new THREE.MeshLambertMaterial({color:0x555a60});
function addBlock(x0,x1,z0,z1,h,mat){const w=x1-x0,d=z1-z0;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set((x0+x1)/2,h/2,(z0+z1)/2);m.castShadow=true;m.receiveShadow=true;scene.add(m);const roof=new THREE.Mesh(new THREE.BoxGeometry(w+0.3,0.4,d+0.3),roofMat);roof.position.set((x0+x1)/2,h+0.2,(z0+z1)/2);scene.add(roof);solids.push({x0,x1,z0,z1});return m;}
(function buildCBD(){
  const xs=[CBD.x0,...ROADS_V.flatMap(s=>[s-ROAD_W/2-1,s+ROAD_W/2+1]),CBD.x1].sort((a,b)=>a-b);
  const zs=[CBD.z0,...ROADS_H.flatMap(s=>[s-ROAD_W/2-1,s+ROAD_W/2+1]),CBD.z1].sort((a,b)=>a-b);
  for(let ix=0;ix<xs.length-1;ix++)for(let iz=0;iz<zs.length-1;iz++){
    const bx0=xs[ix]+0.6,bx1=xs[ix+1]-0.6,bz0=zs[iz]+0.6,bz1=zs[iz+1]-0.6;
    if(bx1-bx0<6||bz1-bz0<6)continue;
    const cx=(bx0+bx1)/2,cz=(bz0+bz1)/2;
    if(inPark(cx,cz))continue;
    if(Math.hypot(cx-SPAWN.x,cz-SPAWN.z)<7)continue;
    if(Math.random()<0.2)continue;
    const distC=Math.hypot(cx-38,cz);
    const h=distC<18?12+Math.random()*20:6+Math.random()*10;
    addBlock(bx0,bx1,bz0,bz1,h,bMats[Math.floor(Math.random()*bMats.length)]);
  }
  addBlock(58,66,-6,2,30,bMats[3]); // Eureka-ish tower
  addBlock(8,20,30,35,7,new THREE.MeshLambertMaterial({color:0xd9a441})); // station-ish
})();
/* Floating map texts removed per design — zones read from ground colours. */
// stone circle (ref img 1) with walk-in gaps
const stoneM=new THREE.MeshStandardMaterial({color:0x8f8b82,roughness:.95});
const stoneD=new THREE.MeshStandardMaterial({color:0x6e6a62,roughness:.95});
(function(){for(let i=0;i<10;i++){if(i===2||i===7)continue;const a=i/10*Math.PI*2,h=3.5+Math.random()*3;const st=new THREE.Mesh(new THREE.BoxGeometry(1.4,h,1.0),i%2?stoneM:stoneD);st.position.set(STONE_CIRCLE.x+Math.cos(a)*STONE_CIRCLE.R,h/2-0.2,STONE_CIRCLE.z+Math.sin(a)*STONE_CIRCLE.R);st.rotation.y=a;st.castShadow=true;st.receiveShadow=true;scene.add(st);solids.push({x0:st.position.x-0.8,x1:st.position.x+0.8,z0:st.position.z-0.6,z1:st.position.z+0.6});}
const altar=new THREE.Mesh(new THREE.BoxGeometry(3,0.8,1.8),stoneD);altar.position.set(STONE_CIRCLE.x,0.4,STONE_CIRCLE.z);altar.castShadow=true;scene.add(altar);})();
// wetland dressing: boardwalk, fence, lilies, reeds (refs 2-3)
(function(){
  const woodM=new THREE.MeshStandardMaterial({color:0x6b4423,roughness:.9});
  const dock=new THREE.Mesh(new THREE.BoxGeometry(6,0.3,2),woodM);dock.position.set(-56,0.35,48);dock.castShadow=true;scene.add(dock);
  for(const dx of [-2.5,0,2.5]){const post=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,1.6,8),woodM);post.position.set(-56+dx,0.2,49);scene.add(post);}
  const fenceM=new THREE.MeshStandardMaterial({color:0x7a5230});
  for(let i=0;i<8;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.16,1.4,7),fenceM);p.position.set(-72+i*2.2,0.7,40);p.castShadow=true;scene.add(p);}
  const rail=new THREE.Mesh(new THREE.BoxGeometry(17,0.25,0.25),fenceM);rail.position.set(-64.2,1.2,40);scene.add(rail);
  const lilyM=new THREE.MeshLambertMaterial({color:0x3f8f3f});
  for(let i=0;i<30;i++){const p=PONDS[i%PONDS.length];const a=Math.random()*7,r=Math.random()*p.r*0.8;const pad=new THREE.Mesh(new THREE.CircleGeometry(0.3+Math.random()*0.35,10),lilyM);pad.rotation.x=-Math.PI/2;pad.position.set(p.x+Math.cos(a)*r,0.12,p.z+Math.sin(a)*r);scene.add(pad);}
  const reedM=new THREE.MeshStandardMaterial({color:0x4f9440}),tipM=new THREE.MeshStandardMaterial({color:0x7a2e2e});
  for(let i=0;i<40;i++){const p=PONDS[i%PONDS.length];const a=Math.random()*7;const x=p.x+Math.cos(a)*(p.r+1+Math.random()*3),z=p.z+Math.sin(a)*(p.r+1+Math.random()*3);if(!isWet(x,z))continue;const st=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.2,6),reedM);st.position.set(x,0.6,z);scene.add(st);const tip=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.35,6),tipM);tip.position.set(x,1.2,z);scene.add(tip);}
  // pic3 props: fallen log + stump + rowboat on the bank
  const logM=new THREE.MeshStandardMaterial({color:0x6b4423,roughness:1});
  const log=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,5,9),logM);log.rotation.z=Math.PI/2;log.rotation.y=0.5;log.position.set(-46,0.5,58);log.castShadow=true;scene.add(log);
  const stump=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.8,0.8,10),logM);stump.position.set(-40,0.4,62);stump.castShadow=true;scene.add(stump);
  const boatG=new THREE.Group();
  const hull=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.7,4.2),new THREE.MeshStandardMaterial({color:0x7a4a28,roughness:1}));hull.position.y=0.35;hull.castShadow=true;boatG.add(hull);
  const rim=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.25,4.5),new THREE.MeshStandardMaterial({color:0x5d3a20}));rim.position.y=0.7;boatG.add(rim);
  boatG.position.set(-52,0.05,60);boatG.rotation.y=0.6;scene.add(boatG);
})();
// pic2 props: pines for ruins/north + stone lanterns along CBD/ruin paths
function makePine(x,z,s=1){
  const g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.16*s,0.22*s,1.2*s,7),new THREE.MeshStandardMaterial({color:0x5a3d24,roughness:1}));tr.position.y=0.6*s;tr.castShadow=true;g.add(tr);
  const greens=[0x2e6b34,0x35793c,0x2a6130];
  for(let i=0;i<3;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry((1.3-i*0.28)*s,1.3*s,9),new THREE.MeshStandardMaterial({color:greens[i%3],roughness:.9}));cone.position.y=(1.5+i*0.85)*s;cone.castShadow=true;g.add(cone);}
  g.position.set(x,0,z);g.rotation.y=Math.random()*7;scene.add(g);return g;
}
for(let i=0;i<14;i++){const x=(Math.random()*2-1)*90,z=-44-Math.random()*44;if(hitsSolid(x,z,1.2)||isRoad(x,z)||isWater(x,z))continue;makePine(x,z,0.8+Math.random()*0.7);}
for(let i=0;i<10;i++){const s=Math.random()<.5?randGrass():randWet();if(!hitsSolid(s.x,s.z,1))makePine(s.x,s.z,0.9+Math.random()*0.6);}
function makeLantern(x,z){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.3,0.7),new THREE.MeshStandardMaterial({color:0x6e6a62}));base.position.y=0.15;g.add(base);
  const post=new THREE.Mesh(new THREE.BoxGeometry(0.3,1.4,0.3),new THREE.MeshStandardMaterial({color:0x4a4e55}));post.position.y=1.0;post.castShadow=true;g.add(post);
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.6,0.55),new THREE.MeshStandardMaterial({color:0x2c2f36,roughness:.7}));lamp.position.y=1.9;g.add(lamp);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.4),new THREE.MeshBasicMaterial({color:0xffd98a}));glow.position.y=1.9;g.add(glow);
  g.position.set(x,0,z);scene.add(g);
}
for(const x of ROADS_V)for(const z of ROADS_H){if(Math.random()<0.5)makeLantern(x+3.6,z+3.6);}
makeLantern(14,44);makeLantern(30,58);makeLantern(48,60);