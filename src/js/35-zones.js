// wetland lock wall (translucent, no text) + blank wooden posts (no map text)
const lockWall=new THREE.Mesh(new THREE.BoxGeometry(84,4,1.2),new THREE.MeshBasicMaterial({color:0x3fa9f5,transparent:true,opacity:0.28}));
lockWall.position.set(-50,2,10);scene.add(lockWall);
function makePost(x,z){const g=new THREE.Group();const post=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,2.2,7),new THREE.MeshStandardMaterial({color:0x6b4423}));post.position.y=1.1;post.castShadow=true;g.add(post);const board=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.6,0.12),new THREE.MeshStandardMaterial({color:0x8a6a3f}));board.position.y=1.9;board.castShadow=true;g.add(board);g.position.set(x,0,z);scene.add(g);}
makePost(-30,8);makePost(-12,-10);makePost(-4,0);
// FARM 3D: perimeter fences + crop rows + scarecrow + shed
(function(){
  const fenceM=new THREE.MeshStandardMaterial({color:0x7a5230});
  function fenceRun(x0,z0,x1,z1){const len=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.round(len/2.4));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,1.3,7),fenceM);p.position.set(x,0.65,z);p.castShadow=true;scene.add(p);}const rail=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1-x0)||0.25,0.18,Math.abs(z1-z0)||0.25),fenceM);rail.position.set((x0+x1)/2,1.05,(z0+z1)/2);scene.add(rail);}
  fenceRun(FARM.x0,FARM.z0,FARM.x1,FARM.z0);fenceRun(FARM.x0,FARM.z1,FARM.x1,FARM.z1);
  fenceRun(FARM.x0,FARM.z0,FARM.x0,FARM.z1);fenceRun(FARM.x1,FARM.z0,FARM.x1,FARM.z1);
  const shed=new THREE.Mesh(new THREE.BoxGeometry(5,3,4),new THREE.MeshStandardMaterial({color:0x9a3b2e}));shed.position.set(90,1.5,24);shed.castShadow=true;scene.add(shed);solids.push({x0:87.5,x1:92.5,z0:22,z1:26});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,2.4,6),new THREE.MeshStandardMaterial({color:0x6b4423}));pole.position.set(80,1.2,0);scene.add(pole);
  const arms=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.12,0.12),new THREE.MeshStandardMaterial({color:0x6b4423}));arms.position.set(80,1.8,0);scene.add(arms);
})();
// RUIN 3D: broken tilted buildings + construction waste piles + barriers
(function(){
  const concM=new THREE.MeshStandardMaterial({color:0x8d9299,roughness:.95});
  const concM2=new THREE.MeshStandardMaterial({color:0x6f747a,roughness:.95});
  const spots=[[-2,-60],[14,-64],[32,-60],[50,-62],[20,-78],[44,-80],[12,60],[30,62],[50,64],[28,78],[52,80],[10,80]];
  for(const [x,z] of spots){
    const w=3+Math.random()*3,d=3+Math.random()*3,h=2+Math.random()*4;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),Math.random()<.5?concM:concM2);
    m.position.set(x,h/2-0.6,z);m.rotation.set((Math.random()-.5)*0.25,Math.random()*0.6,(Math.random()-.5)*0.3);
    m.castShadow=true;m.receiveShadow=true;scene.add(m);
    solids.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
    const slab=new THREE.Mesh(new THREE.BoxGeometry(w*0.9,0.4,d*0.9),concM2);
    slab.position.set(x+2.5,0.2,z+1.5);slab.rotation.y=Math.random();scene.add(slab);
  }
  for(let i=0;i<16;i++){
    const R=Math.random()<.5?RUIN_N:RUIN_S;
    const x=R.x0+3+Math.random()*(R.x1-R.x0-6),z=R.z0+3+Math.random()*(R.z1-R.z0-6);
    if(hitsSolid(x,z,1))continue;
    const pile=new THREE.Mesh(new THREE.DodecahedronGeometry(0.5+Math.random()*0.6,0),new THREE.MeshStandardMaterial({color:Math.random()<.5?0x8d8d96:0xb06a3b}));
    pile.position.set(x,0.4,z);pile.castShadow=true;scene.add(pile);
  }
  const barM=new THREE.MeshStandardMaterial({color:0xe07b00});
  for(let i=0;i<10;i++){
    const R=Math.random()<.5?RUIN_N:RUIN_S;
    const x=R.x0+2+Math.random()*(R.x1-R.x0-4),z=R.z0+2+Math.random()*(R.z1-R.z0-4);
    const bar=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.8,0.4),barM);
    bar.position.set(x,0.4,z);bar.rotation.y=Math.random()*3;bar.castShadow=true;scene.add(bar);
  }
  for(let i=0;i<22;i++){
    const R=Math.random()<.6?RUIN_N:RUIN_S;
    const x=R.x0+2+Math.random()*(R.x1-R.x0-4),z=R.z0+2+Math.random()*(R.z1-R.z0-4);
    if(hitsSolid(x,z,1.4)||isRoad(x,z))continue;makePine(x,z,0.8+Math.random()*0.7);
  }
})();