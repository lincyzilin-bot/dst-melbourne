/* ================= 2. THREE ================= */
const container=document.getElementById('game');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.classList.add('webgl');container.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x87bfe8);scene.fog=new THREE.Fog(0x87bfe8,60,170);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,0.1,500);
const CAM_OFF=new THREE.Vector3(0,27,14.5);
const hemi=new THREE.HemisphereLight(0xcfe8ff,0x6a7a55,0.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff2d0,1.5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.camera.far=160;
scene.add(sun);scene.add(sun.target);
const playerLight=new THREE.PointLight(0xffb45e,0,26,1.6);scene.add(playerLight);