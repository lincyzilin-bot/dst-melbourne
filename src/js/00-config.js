import * as THREE from 'three';
/* ================= 0. QUADRANT LAYOUT (photo ref) v1.2 =================
   x+ = east, z+ = south. WORLD 200 (-100..100), scale unchanged.
   CBD: centre | outer ring fills the whole map edge-to-edge, no gaps:
   GRASSLAND NW (x<0,z<0) | FARM NE (x>0,z<0) | WETLAND SW (x<0,z>0) | RUIN SE.
   A wide moat rings the CBD (boat water); 4 dirt fords keep it playable
   until the boat arrives. Small inter-zone rivers are visual-only for now. */
const WORLD=200, HALF=WORLD/2, N=72, CELL=WORLD/N;
const SAVE_KEY='dst_melbourne_zoned_v1', DAY_LEN=240, REVEAL_R=13;
const CBD={x0:-34,x1:34,z0:-36,z1:36};
const GRASS={x0:-100,x1:0,z0:-100,z1:0};
const FARM={x0:0,x1:100,z0:-100,z1:0};
const WET={x0:-100,x1:0,z0:0,z1:100};
const RUIN={x0:0,x1:100,z0:0,z1:100};
// CBD moat: water ring between CBD edge and this expanded box (wide river)
const MOAT={x0:-39,x1:39,z0:-41,z1:41};
// dirt fords across the moat (temporary until the boat lands)
const FORDS=[{x0:-2.5,x1:2.5,z0:-41,z1:-36},{x0:-2.5,x1:2.5,z0:36,z1:41},{x0:-39,x1:-34,z0:-2.5,z1:2.5},{x0:34,x1:39,z0:-2.5,z1:2.5}];
// small rivers between outer quadrants (BLOCKING — cross only by bridge)
const RIVERS=[
  {pts:[[2,-100],[-3,-80],[4,-64],[-2,-52],[1,-41]],w:2.0},   // north: Grass|Farm
  {pts:[[39,2],[55,-3],[71,3],[86,-2],[100,1]],w:2.0},        // east: Farm|Ruin
  {pts:[[-100,-1],[-80,3],[-60,-3],[-39,1]],w:2.0},           // west: Grass|Wet
  {pts:[[0,41],[-4,56],[3,70],[-5,86],[2,100]],w:2.0}         // south: Wet|Ruin
];
function distSeg(px,pz,ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;
  let t=L2?((px-ax)*dx+(pz-az)*dz)/L2:0;t=Math.max(0,Math.min(1,t));
  return Math.hypot(px-(ax+dx*t),pz-(az+dz*t));
}
function isRiver(x,z){
  for(const r of RIVERS){
    for(let i=0;i<r.pts.length-1;i++){
      if(distSeg(x,z,r.pts[i][0],r.pts[i][1],r.pts[i+1][0],r.pts[i+1][1])<r.w/2)return true;
    }
  }
  return false;
}
// bridges: 4 pre-placed + player-built (session only)
const FIXED_BRIDGES=[
  {x0:-2.5,x1:5.5,z0:-72.5,z1:-67.5},
  {x0:64.5,x1:69.5,z0:-1,z1:5},
  {x0:-70.5,x1:-65.5,z0:-3,z1:3},
  {x0:-0.5,x1:6.5,z0:67.5,z1:72.5}
];
const bridges=[];
function onBridge(x,z){
  for(const b of FIXED_BRIDGES)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return true;
  for(const b of bridges)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return true;
  return false;
}
function addBridge(x,z,horiz){
  if(bridges.length>=12){toast('Max 12 bridges — make them count!');return null;}
  const b=horiz?{x0:x-4,x1:x+4,z0:z-2.5,z1:z+2.5}:{x0:x-2.5,x1:x+2.5,z0:z-4,z1:z+4};
  bridges.push(b);return b;
}
const ROADS_V=[-20,-4,12,26], ROADS_H=[-24,-8,8,24], ROAD_W=5;
const PARKS=[{x:-18,z:-18,r:8,n:'PARK'},{x:16,z:16,r:8,n:'FLAGSTAFF'}];
const FLAGSTAFF={x:16,z:16,r:8};
const PONDS=[{x:-72,z:62,r:9},{x:-56,z:76,r:7},{x:-78,z:80,r:6}];
const STONE_CIRCLE={x:-65,z:-66,R:7};
const SPAWN={x:12,z:24}; // road intersection (V 12 x H 24): always clear of buildings
function inRect(x,z,r){return x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1;}
function isCBD(x,z){return inRect(x,z,CBD);}
function isGrass(x,z){return inRect(x,z,GRASS);}
function isWet(x,z){return inRect(x,z,WET);}
function isRoad(x,z){
  if(!isCBD(x,z))return false;
  for(const rx of ROADS_V)if(Math.abs(x-rx)<ROAD_W/2)return true;
  for(const rz of ROADS_H)if(Math.abs(z-rz)<ROAD_W/2)return true;
  return false;
}
function inPark(x,z){return PARKS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r);}
function inFarm(x,z){return inRect(x,z,FARM);}
function inRuin(x,z){return inRect(x,z,RUIN);}
function isPond(x,z){return PONDS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r);}
function inFord(x,z){return FORDS.some(f=>x>f.x0&&x<f.x1&&z>f.z0&&z<f.z1);}
function isMoat(x,z){
  const inOuter=x>MOAT.x0&&x<MOAT.x1&&z>MOAT.z0&&z<MOAT.z1;
  const inInner=isCBD(x,z);
  return inOuter&&!inInner&&!inFord(x,z);
}
function isWater(x,z){return isPond(x,z)||isMoat(x,z)||(isRiver(x,z)&&!onBridge(x,z));}
function wetlandLocked(){return P.day<=3;} // 💧 unlocks Day 4
function farmLocked(){return P.day<=4;}     // 🚜 unlocks Day 5 (survived 4 days)
function ruinLocked(){return P.day<=6;}     // 🏚️ unlocks Day 7 (survived 6 days)
function zoneOf(x,z){if(isCBD(x,z))return'cbd';if(isWet(x,z))return'wetland';if(isGrass(x,z))return'grassland';if(inFarm(x,z))return'farm';if(inRuin(x,z))return'ruin';return'wilds';}
const ZONE_ICON={cbd:'🏙️ CBD',grassland:'🌾 Grassland',wetland:'💧 Wetland',farm:'🚜 Farm',ruin:'🏚️ Ruins',wilds:'🧭 Wilds'};
/* ================= 1. EXPLORE SAVE ================= */
function freshSave(){return{lifetime:'0'.repeat(N*N),runs:[],best:0,totalRuns:0,player:null};}
function loadSave(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return freshSave();const s=Object.assign(freshSave(),JSON.parse(raw));if(!s.lifetime||s.lifetime.length!==N*N)return freshSave();return s;}catch(e){return freshSave();}}
let save=loadSave();
function persist(flash=true){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}if(flash){const t=document.getElementById('saved-tag');t.style.opacity=1;clearTimeout(persist._t);persist._t=setTimeout(()=>t.style.opacity=0,1200);}}
const solids=[];
function hitsSolid(x,z,rad=0.55){for(const s of solids){const cx=Math.max(s.x0,Math.min(x,s.x1)),cz=Math.max(s.z0,Math.min(z,s.z1));if(Math.hypot(x-cx,z-cz)<rad)return true;}return false;}
const LAND=new Uint8Array(N*N);let landTotal=0;
function computeLand(){landTotal=0;for(let gz=0;gz<N;gz++)for(let gx=0;gx<N;gx++){const x=-HALF+(gx+0.5)*CELL,z=-HALF+(gz+0.5)*CELL;const ok=!isWater(x,z)&&!hitsSolid(x,z,0);LAND[gz*N+gx]=ok?1:0;if(ok)landTotal++;}}
let lifeBits=save.lifetime.split('').map(Number);
function lifetimeCount(){let c=0;for(let i=0;i<lifeBits.length;i++)c+=lifeBits[i]*LAND[i];return c;}
function lifetimePct(){return landTotal?lifetimeCount()/landTotal*100:0;}
let runAdded=0, fogDirty=false;
function commitLifetime(){save.lifetime=lifeBits.join('');}
function reveal(x,z){const cx=Math.floor((x+HALF)/CELL),cz=Math.floor((z+HALF)/CELL),r=Math.ceil(REVEAL_R/CELL);let ch=false;for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const gx=cx+dx,gz=cz+dz;if(gx<0||gz<0||gx>=N||gz>=N)continue;const wx=-HALF+(gx+0.5)*CELL,wz=-HALF+(gz+0.5)*CELL;if(Math.hypot(wx-x,wz-z)>REVEAL_R)continue;const i=gz*N+gx;if(!lifeBits[i]){lifeBits[i]=1;runAdded++;ch=true;}}if(ch)fogDirty=true;}