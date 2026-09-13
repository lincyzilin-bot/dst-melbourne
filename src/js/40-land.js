computeLand();lifeBits=save.lifetime.split('').map(Number);
// 3D ground scatter (after all solids): grass blades + pebbles so ground never looks flat
(function(){
  const bladeG=new THREE.ConeGeometry(0.09,0.55,4);
  const bladeM=new THREE.MeshStandardMaterial({roughness:1});
  const blades=new THREE.InstancedMesh(bladeG,bladeM,1400);
  const pebG=new THREE.DodecahedronGeometry(0.14,0);
  const pebM=new THREE.MeshStandardMaterial({roughness:1});
  const pebs=new THREE.InstancedMesh(pebG,pebM,320);
  const d=new THREE.Object3D();const col=new THREE.Color();let bi=0,pi=0;
  function drop(x,z){
    if(isWater(x,z)||hitsSolid(x,z,0.4)||isRoad(x,z))return;
    const zn=zoneOf(x,z);
    if(bi<1400&&Math.random()<0.85){
      d.position.set(x,0.22,z);d.rotation.set((Math.random()-.5)*0.4,Math.random()*7,(Math.random()-.5)*0.4);
      const s=0.7+Math.random()*0.9;d.scale.set(s,s,s);d.updateMatrix();blades.setMatrixAt(bi,d.matrix);
      col.set(zn==='wetland'?0x4f9440:zn==='grassland'?0x3f8f3f:zn==='farm'?0x6fbf5a:zn==='cbd'?0x5da24a:0x6aa84f).offsetHSL(0,0,(Math.random()-.5)*0.06);
      blades.setColorAt(bi,col);bi++;
    }else if(pi<320){
      d.position.set(x,0.08,z);d.rotation.set(Math.random()*3,Math.random()*3,0);const s=0.5+Math.random();d.scale.set(s,s*0.7,s);d.updateMatrix();pebs.setMatrixAt(pi,d.matrix);
      col.set(Math.random()<.5?0x8d8d96:0x6e6a62);pebs.setColorAt(pi,col);pi++;
    }
  }
  for(let i=0;i<2600&&bi<1400;i++)drop((Math.random()*2-1)*95,(Math.random()*2-1)*95);
  blades.count=bi;pebs.count=pi;blades.instanceMatrix.needsUpdate=true;pebs.instanceMatrix.needsUpdate=true;
  if(blades.instanceColor)blades.instanceColor.needsUpdate=true;if(pebs.instanceColor)pebs.instanceColor.needsUpdate=true;
  scene.add(blades);scene.add(pebs);
})();
/* ================= 5. FOG ================= */
const fogCanvas=document.createElement('canvas');fogCanvas.width=fogCanvas.height=N;
const fogCtx=fogCanvas.getContext('2d');const fogTex=new THREE.CanvasTexture(fogCanvas);fogTex.magFilter=THREE.LinearFilter;fogTex.minFilter=THREE.LinearFilter;fogTex.generateMipmaps=false;
const fogMesh=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),new THREE.MeshBasicMaterial({map:fogTex,transparent:true,depthWrite:false}));
fogMesh.rotation.x=-Math.PI/2;fogMesh.position.y=0.25;fogMesh.renderOrder=5;scene.add(fogMesh);
function redrawFog(){const img=fogCtx.createImageData(N,N);for(let i=0;i<N*N;i++){const o=i*4;if(lifeBits[i])img.data[o+3]=0;else{img.data[o]=10;img.data[o+1]=10;img.data[o+2]=26;img.data[o+3]=215;}}fogCtx.putImageData(img,0,0);fogTex.needsUpdate=true;}
redrawFog();