// 初始化Three.js
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

adjustWindowSize();
// 窗口大小调整事件
window.addEventListener("resize", adjustWindowSize);

function adjustWindowSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

// 创建地面
const floorGeometry = new THREE.PlaneGeometry(100, 100);
// const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 添加灯光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const controls = new THREE.PointerLockControls(camera, document.body);
document.addEventListener("click", () => controls.lock());

// 子弹
let bullets = [];
// 射击目标
let targets = [];

let score = 0;
const scoreElement = document.getElementById("score");
// 处理玩家移动
const move = { forward: false, backward: false, left: false, right: false };

init();

// 初始化
function init() {
  for (let i = 0; i < 20; i++) {
    createTarget();
  }
  animate();
}

// 创建目标物
function createTarget() {
  const targetGeometry = new THREE.BoxGeometry(2, 2, 2);
  const targetMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(Math.random(), Math.random(), Math.random()),
  });
  const target = new THREE.Mesh(targetGeometry, targetMaterial);

  let validPosition = false;
  while (!validPosition) {
    target.position.set(Math.random() * 100 - 50, 1, Math.random() * 100 - 50);
    validPosition = true;
    for (let i = 0; i < targets.length; i++) {
      const otherTarget = targets[i];
      if (target.position.distanceTo(otherTarget.position) < 5) {
        // 检查距离
        validPosition = false;
        break;
      }
    }
  }

  target.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1);
  targets.push(target);
  scene.add(target);
}

function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateBullets();
  updateTargets();

  checkHit();

  renderer.render(scene, camera);
}

// 处理射击
function shoot() {
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(controls.getObject().position);
  bullet.velocity = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  bullet.gravity = new THREE.Vector3(0, -0.001, 0); // 添加重力
  bullets.push(bullet);
  scene.add(bullet);
}

// 检测是否击中目标
function checkHit() {
  targets.forEach((target, tIndex) => {
    bullets.forEach((bullet, bIndex) => {
      const distance = target.position.distanceTo(bullet.position);
      if (distance < 1) {
        createExplosion(target.position);
        scene.remove(target);
        scene.remove(bullet);
        targets.splice(tIndex, 1);
        bullets.splice(bIndex, 1);
        score += 10;
        scoreElement.innerText = `分数: ${score}`;
        createTarget(); // 创建新的目标物
      }
    });
  });
}
// 预加载爆炸纹理
const explosionTexture = new THREE.TextureLoader().load("./expose.jpg");
// 爆炸效果
function createExplosion(position) {
  const explosionMaterial = new THREE.PointsMaterial({
    size: 1,
    map: explosionTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    color: 0xff4500,
  });

  const explosionGeometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 100; i++) {
    const particle = new THREE.Vector3();
    particle.x = position.x + (Math.random() - 0.5) * 5;
    particle.y = position.y + (Math.random() - 0.5) * 5;
    particle.z = position.z + (Math.random() - 0.5) * 5;
    vertices.push(particle.x, particle.y, particle.z);
  }
  explosionGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

  const explosion = new THREE.Points(explosionGeometry, explosionMaterial);
  scene.add(explosion);

  setTimeout(() => {
    scene.remove(explosion);
  }, 100);
}

// 更新子弹位置
function updateBullets() {
  bullets = bullets.filter((bullet) => {
    bullet.velocity.add(bullet.gravity); // 更新速度
    bullet.position.add(bullet.velocity);
    if (bullet.position.length() >= 100) {
      scene.remove(bullet);
      return false;
    }
    return true;
  });
}

// 更新目标物位置
function updateTargets() {
  targets.forEach((target) => {
    target.position.add(target.velocity);
    // 简单的边界处理，使目标物在地面内移动
    if (target.position.x > 50 || target.position.x < -50) target.velocity.x = -target.velocity.x;
    if (target.position.z > 50 || target.position.z < -50) target.velocity.z = -target.velocity.z;
  });
}

// 更新玩家位置
function updatePlayer() {
  const speed = 0.1;
  const direction = new THREE.Vector3();
  if (move.forward) direction.z += speed;
  if (move.backward) direction.z -= speed;
  if (move.left) direction.x -= speed;
  if (move.right) direction.x += speed;

  controls.moveRight(direction.x);
  controls.moveForward(direction.z);
}

// 处理四个方向键和空格键按下事件
const onKeyDown = function (event) {
  switch (event.code) {
    case "ArrowUp":
      move.forward = true;
      break;
    case "ArrowLeft":
      move.left = true;
      break;
    case "ArrowDown":
      move.backward = true;
      break;
    case "ArrowRight":
      move.right = true;
      break;
    case "Space":
      shoot();
      break;
  }
};

// 处理四个方向键弹起事件
const onKeyUp = function (event) {
  switch (event.code) {
    case "ArrowUp":
      move.forward = false;
      break;
    case "ArrowLeft":
      move.left = false;
      break;
    case "ArrowDown":
      move.backward = false;
      break;
    case "ArrowRight":
      move.right = false;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
