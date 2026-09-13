/* ================= 3. GROUND — distinct materials per zone ================= */
/* ================= 3. GROUND — pixel-art tiles, texel-locked =================
   Refs pic2/pic3: tiny 2-4px dither clusters, dirt patches with dark rims,
   cracked slabs, mud shorelines — painted at 2048 so texels sit ~0.1u. */
const GS=2048;
const w2u=v=>(v+HALF)/WORLD*GS;
function paintGround(){
  const c=document.createElement('canvas');c.width=c.height=GS;const g=c.getContext('2d');
  const R=(a,b)=>a+Math.random()*(b-a);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  // world-unit-locked pixel: size in world units -> px, snapped so it never stretches
  function px(wx,wz,ww,wh,color){g.fillStyle=color;g.fillRect(Math.round(w2u(wx)),Math.round(w2u(wz)),Math.max(1,Math.round(ww/WORLD*GS)),Math.max(1,Math.round(wh/WORLD*GS)));}
  function fillRectW(x0,z0,x1,z1,color){g.fillStyle=color;g.fillRect(w2u(x0),w2u(z0),w2u(x1)-w2u(x0),w2u(z1)-w2u(z0));}
  function ditherW(x0,z0,x1,z1,colors,count,s=0.28){for(let i=0;i<count;i++)px(R(x0,x1),R(z0,z1),s,s,pick(colors));}
  // dirt patch: layered blobs + dark rim dots + inner speckle (pic2 style)
  function dirtPatch(cx,cz,rx,rz,base='#7a5a3a',rim='#5d422a'){
    const n=26;
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random());px(cx+Math.cos(a)*rx*r,cz+Math.sin(a)*rz*r,R(0.5,1.4),R(0.4,1.0),Math.random()<.5?base:'#6e5136');}
    for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2;px(cx+Math.cos(a)*rx*1.02,cz+Math.sin(a)*rz*1.02,0.3,0.3,rim);}
    for(let i=0;i<16;i++)px(R(cx-rx*.7,cx+rx*.7),R(cz-rz*.7,cz+rz*.7),0.28,0.28,pick(['#8a6a45','#543d24','#95744f']));
  }
  // ---- base wilds: dry olive ----
  fillRectW(-HALF,-HALF,HALF,HALF,'#7d8f43');
  ditherW(-HALF,-HALF,HALF,HALF,['#75863c','#8b9c4e','#6d7c36'],14000);
  for(let i=0;i<22;i++)dirtPatch(R(-90,90),R(-90,90),R(2,5),R(1.5,3.5));
  // ---- GRASSLAND NW: vivid green + soils + flower dots ----
  fillRectW(GRASS.x0,GRASS.z0,GRASS.x1,GRASS.z1,'#5da24a');
  ditherW(GRASS.x0,GRASS.z0,GRASS.x1,GRASS.z1,['#549144','#6fbf5a','#4c8a3e','#7cc768'],7000,0.3);
  for(let i=0;i<16;i++)dirtPatch(R(GRASS.x0+4,GRASS.x1-4),R(GRASS.z0+4,GRASS.z1-4),R(2,4.5),R(1.5,3));
  for(let i=0;i<420;i++)px(R(GRASS.x0,GRASS.x1),R(GRASS.z0,GRASS.z1),0.28,0.28,pick(['#c0392b','#efe9dc','#d9a92e']));
  ditherW(GRASS.x0,GRASS.z0,GRASS.x1,GRASS.z1,['#3f7a32'],900,0.22); // dark grass flecks
  // ---- WETLAND SW: saturated green, mud near ponds ----
  fillRectW(WET.x0,WET.z0,WET.x1,WET.z1,'#3f9c46');
  ditherW(WET.x0,WET.z0,WET.x1,WET.z1,['#35823a','#55b25a','#2f7a33','#77cc6a'],7000,0.3);
  for(let i=0;i<12;i++)dirtPatch(R(WET.x0+4,WET.x1-4),R(WET.z0+4,WET.z1-4),R(1.5,3.5),R(1,2.2));
  // ponds: irregular mud shoreline + two-tone water + foam dots (pic3)
  for(const p of PONDS){
    for(let i=0;i<9;i++){const a=Math.random()*Math.PI*2,rr=p.r*R(0.55,0.95);g.fillStyle='#8a7150';g.beginPath();g.arc(w2u(p.x+Math.cos(a)*rr*0.5),w2u(p.z+Math.sin(a)*rr*0.5),(p.r*0.42)/WORLD*GS,0,7);g.fill();}
    g.fillStyle='#5d4a30';g.beginPath();g.arc(w2u(p.x),w2u(p.z),(p.r+1.1)/WORLD*GS,0,7);g.fill();
    g.fillStyle='#8a7150';g.beginPath();g.arc(w2u(p.x),w2u(p.z),(p.r+0.4)/WORLD*GS,0,7);g.fill();
    g.fillStyle='#17494a';g.beginPath();g.arc(w2u(p.x),w2u(p.z),p.r/WORLD*GS,0,7);g.fill();
    g.fillStyle='#1f7f7a';g.beginPath();g.arc(w2u(p.x),w2u(p.z),p.r*0.8/WORLD*GS,0,7);g.fill();
    g.fillStyle='#37b3ac';g.beginPath();g.arc(w2u(p.x-p.r*0.2),w2u(p.z-p.r*0.25),p.r*0.4/WORLD*GS,0,7);g.fill();
    for(let i=0;i<26;i++){const a=Math.random()*7,rr=p.r*R(0.7,1.0);px(p.x+Math.cos(a)*rr,p.z+Math.sin(a)*rr,0.26,0.26,'rgba(230,250,245,.8)');}
    for(let i=0;i<14;i++){const a=Math.random()*7,rr=p.r*Math.random()*0.6;px(p.x+Math.cos(a)*rr,p.z+Math.sin(a)*rr,0.3,0.3,'#0f3a3c');}
  }
  // ---- FARM: grass margin, tilled soil, furrows, crop dots ----
  fillRectW(FARM.x0,FARM.z0,FARM.x1,FARM.z1,'#4f8f3f');
  ditherW(FARM.x0,FARM.z0,FARM.x1,FARM.z1,['#47853a','#5da24a'],1200,0.3);
  fillRectW(FARM.x0+0.6,FARM.z0+0.6,FARM.x1-0.6,FARM.z1-0.6,'#6e5136');
  ditherW(FARM.x0+1,FARM.z0+1,FARM.x1-1,FARM.z1-1,['#64492e','#7d5f3d'],1500,0.3);
  for(let z=FARM.z0+2.5;z<FARM.z1-1;z+=1.6){for(let x=FARM.x0+1.5;x<FARM.x1-1;x+=0.5)px(x,z,0.34,0.2,'#4e3a22');}
  for(let z=FARM.z0+2.5;z<FARM.z1-1;z+=1.6){for(let x=FARM.x0+2;x<FARM.x1-1.5;x+=1.4)px(x,z-0.5,0.3,0.3,pick(['#6fbf5a','#549144']));}
  // ---- RUINS: cracked slabs, missing tiles show dirt, rubble speckle ----
  for(const Rr of [RUIN_N,RUIN_S]){
    fillRectW(Rr.x0,Rr.z0,Rr.x1,Rr.z1,'#6e5136');
    const slab=2.4;
    for(let z=Rr.z0;z<Rr.z1;z+=slab)for(let x=Rr.x0;x<Rr.x1;x+=slab){
      if(Math.random()<0.28)continue; // missing slab -> dirt shows through
      const v=pick(['#9aa0a6','#93989e','#a4a9af','#8b9096']);
      fillRectW(x+0.08,z+0.08,x+slab-0.08,z+slab-0.08,v);
      ditherW(x+0.2,z+0.2,x+slab-0.2,z+slab-0.2,['rgba(0,0,0,.10)','rgba(255,255,255,.08)'],14,0.24);
      if(Math.random()<0.3){g.strokeStyle='rgba(40,38,34,.55)';g.lineWidth=2;g.beginPath();let cxp=w2u(x+0.4),czp=w2u(z+R(0.4,2));g.moveTo(cxp,czp);for(let k=0;k<3;k++){cxp+=R(-8,8);czp+=R(2,8);g.lineTo(cxp,czp);}g.stroke();}
    }
    ditherW(Rr.x0,Rr.z0,Rr.x1,Rr.z1,['#5a5e64','#b06a3b','#7a7e84'],900,0.3);
  }
  // ---- CBD slab: per-tile value shift + joints + cracks + dirt seep ----
  fillRectW(CBD.x0,CBD.z0,CBD.x1,CBD.z1,'#c4c8cd');
  for(let z=CBD.z0;z<CBD.z1;z+=2)for(let x=CBD.x0;x<CBD.x1;x+=2){
    if(Math.random()<0.12)fillRectW(x,z,x+2,z+2,pick(['#bcc0c6','#cdd1d6','#b4b9bf']));
  }
  ditherW(CBD.x0,CBD.z0,CBD.x1,CBD.z1,['rgba(0,0,0,.06)','rgba(255,255,255,.08)'],2600,0.26);
  g.strokeStyle='rgba(60,60,66,.35)';g.lineWidth=2;
  for(let u=CBD.x0;u<=CBD.x1;u+=2){g.beginPath();g.moveTo(w2u(u),w2u(CBD.z0));g.lineTo(w2u(u),w2u(CBD.z1));g.stroke();}
  for(let u=CBD.z0;u<=CBD.z1;u+=2){g.beginPath();g.moveTo(w2u(CBD.x0),w2u(u));g.lineTo(w2u(CBD.x1),w2u(u));g.stroke();}
  for(let i=0;i<10;i++){const cx=R(CBD.x0+4,CBD.x1-4),cz=R(CBD.z0+4,CBD.z1-4);dirtPatch(cx,cz,R(1.5,3),R(1,2));}
  g.strokeStyle='rgba(40,38,34,.4)';g.lineWidth=2;
  for(let i=0;i<14;i++){let cxp=w2u(R(CBD.x0,CBD.x1)),czp=w2u(R(CBD.z0,CBD.z1));g.beginPath();g.moveTo(cxp,czp);for(let k=0;k<4;k++){cxp+=R(-10,10);czp+=R(-10,10);g.lineTo(cxp,czp);}g.stroke();}
  // ---- parks: grass disc, mow rings, soil, gravel cross ----
  for(const p of PARKS){
    g.fillStyle='#4f9c40';g.beginPath();g.arc(w2u(p.x),w2u(p.z),p.r/WORLD*GS,0,7);g.fill();
    g.save();g.beginPath();g.arc(w2u(p.x),w2u(p.z),p.r/WORLD*GS,0,7);g.clip();
    for(let r=0;r<p.r;r+=1.6){g.fillStyle='rgba(255,255,255,.06)';g.beginPath();g.arc(w2u(p.x),w2u(p.z),(p.r-r)/WORLD*GS,0,7);g.lineWidth=6;g.stroke();}
    const pg={x0:p.x-p.r,z0:p.z-p.r,x1:p.x+p.r,z1:p.z+p.r};
    ditherW(pg.x0,pg.z0,pg.x1,pg.z1,['#47853a','#63bd52'],700,0.28);
    for(let i=0;i<4;i++)dirtPatch(p.x+R(-4,4),p.z+R(-4,4),R(1,2.2),R(0.8,1.6));
    g.fillStyle='#c9bd9a';g.fillRect(w2u(p.x)-5,w2u(p.z-p.r),10,(p.r*2)/WORLD*GS);
    g.fillStyle='#b5a888';for(let z=p.z-p.r;z<p.z+p.r;z+=1.2)g.fillRect(w2u(p.x)-5,w2u(z),10,2);
    g.restore();
    g.strokeStyle='#3d6b34';g.lineWidth=4;g.beginPath();g.arc(w2u(p.x),w2u(p.z),p.r/WORLD*GS,0,7);g.stroke();
  }
  // ---- roads: concrete deck, slab joints per 1u, worn centre, pale curb ----
  const PX=GS/WORLD;
  for(const x of ROADS_V){
    g.fillStyle='#e2e4e7';g.fillRect(w2u(x-ROAD_W/2-0.9),w2u(CBD.z0),(ROAD_W+1.8)*PX,w2u(CBD.z1)-w2u(CBD.z0));
    g.fillStyle='#a8adb2';g.fillRect(w2u(x-ROAD_W/2),w2u(CBD.z0),ROAD_W*PX,w2u(CBD.z1)-w2u(CBD.z0));
    ditherW(x-ROAD_W/2,CBD.z0,x+ROAD_W/2,CBD.z1,['#9aa0a6','#b4b9bf','rgba(0,0,0,.08)'],700,0.26);
    g.strokeStyle='rgba(60,60,66,.4)';g.lineWidth=2;
    for(let z=CBD.z0;z<CBD.z1;z+=2){g.beginPath();g.moveTo(w2u(x-ROAD_W/2),w2u(z));g.lineTo(w2u(x+ROAD_W/2),w2u(z));g.stroke();}
    for(let z=CBD.z0+1;z<CBD.z1;z+=3)px(x+R(-1,1),z,0.5,1.1,'rgba(70,66,60,.25)');
  }
  for(const z of ROADS_H){
    g.fillStyle='#e2e4e7';g.fillRect(w2u(CBD.x0),w2u(z-ROAD_W/2-0.9),w2u(CBD.x1)-w2u(CBD.x0),(ROAD_W+1.8)*PX);
    g.fillStyle='#a8adb2';g.fillRect(w2u(CBD.x0),w2u(z-ROAD_W/2),w2u(CBD.x1)-w2u(CBD.x0),ROAD_W*PX);
    ditherW(CBD.x0,z-ROAD_W/2,CBD.x1,z+ROAD_W/2,['#9aa0a6','#b4b9bf'],500,0.26);
    g.strokeStyle='rgba(60,60,66,.4)';g.lineWidth=2;
    for(let x=CBD.x0;x<CBD.x1;x+=2){g.beginPath();g.moveTo(w2u(x),w2u(z-ROAD_W/2));g.lineTo(w2u(x),w2u(z+ROAD_W/2));g.stroke();}
  }
  g.fillStyle='#f4d35e';
  for(const x of ROADS_V)for(let z=CBD.z0+2;z<CBD.z1-2;z+=4)g.fillRect(w2u(x)-1.5,w2u(z),3,8);
  // dirt tracks linking zones + worn edges
  fillRectW(-8,-4,12,4,'#8a6f4d');ditherW(-8,-4,12,4,['#6b543a','#9a7f58'],300,0.3);
  fillRectW(-50,-6,-8,-3.4,'#6b543a');fillRectW(-50,8,-8,10.6,'#8a6f4d');
  // soft large light variation so zones feel lit like pic2/3
  for(let i=0;i<8;i++){const gr=g.createRadialGradient(R(0,GS),R(0,GS),10,R(0,GS),R(0,GS),R(150,380));gr.addColorStop(0,'rgba(255,255,240,.05)');gr.addColorStop(1,'rgba(0,0,20,0)');g.fillStyle=gr;g.fillRect(0,0,GS,GS);}
  return c;
}
const groundCanvas=paintGround();
const groundTex=new THREE.CanvasTexture(groundCanvas);groundTex.colorSpace=THREE.SRGBColorSpace;groundTex.anisotropy=renderer.capabilities.getMaxAnisotropy();groundTex.generateMipmaps=true;groundTex.minFilter=THREE.LinearMipmapLinearFilter;groundTex.magFilter=THREE.LinearFilter;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),new THREE.MeshStandardMaterial({map:groundTex,roughness:1,metalness:0}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
// pond water skins: real raised discs so water reads as water, not paint
for(const p of PONDS){
  const mud=new THREE.Mesh(new THREE.CircleGeometry(p.r+0.9,28),new THREE.MeshStandardMaterial({color:0x6b543a,roughness:1}));
  mud.rotation.x=-Math.PI/2;mud.position.set(p.x,0.03,p.z);mud.receiveShadow=true;scene.add(mud);
  const wat=new THREE.Mesh(new THREE.CircleGeometry(p.r,28),new THREE.MeshStandardMaterial({color:0x1e6f6e,roughness:0.35,metalness:0.05,transparent:true,opacity:0.92}));
  wat.rotation.x=-Math.PI/2;wat.position.set(p.x,0.07,p.z);scene.add(wat);
  const deep=new THREE.Mesh(new THREE.CircleGeometry(p.r*0.45,20),new THREE.MeshStandardMaterial({color:0x14494a,roughness:0.4,transparent:true,opacity:0.9}));
  deep.rotation.x=-Math.PI/2;deep.position.set(p.x,0.09,p.z);scene.add(deep);
}