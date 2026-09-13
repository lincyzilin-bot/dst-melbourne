// zone lock walls mark each locked quadrant entrance (toggle by day)
const lockWall=new THREE.Mesh(new THREE.BoxGeometry(50,4,1.2),new THREE.MeshBasicMaterial({color:0x3fa9f5,transparent:true,opacity:0.28}));
lockWall.position.set(-50,2,45);scene.add(lockWall);
const farmWall=new THREE.Mesh(new THREE.BoxGeometry(50,4,1.2),new THREE.MeshBasicMaterial({color:0xf4d35e,transparent:true,opacity:0.28}));
farmWall.position.set(50,2,-45);scene.add(farmWall);
const ruinWall=new THREE.Mesh(new THREE.BoxGeometry(50,4,1.2),new THREE.MeshBasicMaterial({color:0xff8a5b,transparent:true,opacity:0.28}));
ruinWall.position.set(50,2,45);scene.add(ruinWall);
// FARM 3D: fenced wheat plot inside NE quadrant + scarecrow + shed
(function(){
  const fenceM=new THREE.MeshStandardMaterial({color:0x7a5230});
  function fenceRun(x0,z0,x1,z1){const len=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.round(len/2.4));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,1.3,7),fenceM);p.position.set(x,0.65,z);p.castShadow=true;scene.add(p);}const rail=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1-x0)||0.25,0.18,Math.abs(z1-z0)||0.25),fenceM);rail.position.set((x0+x1)/2,1.05,(z0+z1)/2);scene.add(rail);}
  const FX0=46,FX1=96,FZ0=-90,FZ1=-50;
  fenceRun(FX0,FZ0,FX1,FZ0);fenceRun(FX0,FZ1,FX1,FZ1);
  fenceRun(FX0,FZ0,FX0,FZ1);fenceRun(FX1,FZ0,FX1,FZ1);
  const shed=new THREE.Mesh(new THREE.BoxGeometry(5,3,4),new THREE.MeshStandardMaterial({color:0x9a3b2e}));shed.position.set(90,1.5,-56);shed.castShadow=true;scene.add(shed);solids.push({x0:87.5,x1:92.5,z0:-58,z1:-54});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,2.4,6),new THREE.MeshStandardMaterial({color:0x6b4423}));pole.position.set(65,1.2,-66);scene.add(pole);
  const arms=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.12,0.12),new THREE.MeshStandardMaterial({color:0x6b4423}));arms.position.set(65,1.8,-66);scene.add(arms);
})();
// RUIN 3D (south-east quadrant): broken tilted buildings + construction waste + barriers
(function(){
  const concM=new THREE.MeshStandardMaterial({color:0x8d9299,roughness:.95});
  const concM2=new THREE.MeshStandardMaterial({color:0x6f747a,roughness:.95});
  const spots=[];
  for(let i=0;i<40&&spots.length<12;i++){const x=RUIN.x0+5+Math.random()*(RUIN.x1-RUIN.x0-10),z=RUIN.z0+5+Math.random()*(RUIN.z1-RUIN.z0-10);if(isCBD(x,z)||isWater(x,z))continue;spots.push([x,z]);}
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
    const x=RUIN.x0+3+Math.random()*(RUIN.x1-RUIN.x0-6),z=RUIN.z0+3+Math.random()*(RUIN.z1-RUIN.z0-6);
    if(isCBD(x,z)||isWater(x,z)||hitsSolid(x,z,1))continue;
    const pile=new THREE.Mesh(new THREE.DodecahedronGeometry(0.5+Math.random()*0.6,0),new THREE.MeshStandardMaterial({color:Math.random()<.5?0x8d8d96:0xb06a3b}));
    pile.position.set(x,0.4,z);pile.castShadow=true;scene.add(pile);
  }
  const barM=new THREE.MeshStandardMaterial({color:0xe07b00});
  for(let i=0;i<10;i++){
    const x=RUIN.x0+2+Math.random()*(RUIN.x1-RUIN.x0-4),z=RUIN.z0+2+Math.random()*(RUIN.z1-RUIN.z0-4);
    if(isCBD(x,z)||isWater(x,z))continue;
    const bar=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.8,0.4),barM);
    bar.position.set(x,0.4,z);bar.rotation.y=Math.random()*3;bar.castShadow=true;scene.add(bar);
  }
  for(let i=0;i<22;i++){
    const x=RUIN.x0+2+Math.random()*(RUIN.x1-RUIN.x0-4),z=RUIN.z0+2+Math.random()*(RUIN.z1-RUIN.z0-4);
    if(isCBD(x,z)||isWater(x,z)||hitsSolid(x,z,1.4)||isRoad(x,z))continue;makePine(x,z,0.8+Math.random()*0.7);
  }
})();