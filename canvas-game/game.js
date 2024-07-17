const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player, bullets, enemies, score, gameOver;

// 初始化游戏变量
function init() {
  player = { x: canvas.width / 2, y: canvas.height - 50, width: 50, height: 50, speed: 5 };
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;

  spawnEnemies();
  requestAnimationFrame(gameLoop);
}

// 创建敌人
function spawnEnemies() {
  setInterval(() => {
    if (!gameOver) {
      let x = Math.random() * (canvas.width - 50);
      let y = -50;
      enemies.push({ x, y, width: 50, height: 50, speed: 2 });
    }
  }, 1000);
}

let keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// 移动玩家
function movePlayer() {
  if (keys["KeyA"] && player.x > 0) player.x -= player.speed;
  if (keys["KeyD"] && player.x + player.width < canvas.width) player.x += player.speed;
  if (keys["Space"]) shoot();
}

// 射击
function shoot() {
  bullets.push({ x: player.x + player.width / 2, y: player.y, width: 5, height: 10, speed: 7 });
}

function update() {
  movePlayer();

  bullets = bullets.filter((bullet) => bullet.y > 0);
  bullets.forEach((bullet) => (bullet.y -= bullet.speed));

  enemies = enemies.filter((enemy) => enemy.y < canvas.height);
  enemies.forEach((enemy) => (enemy.y += enemy.speed));

  checkCollisions();
}

// 检查碰撞
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        score += 10;
      }
    });
  });

  enemies.forEach((enemy) => {
    if (
      enemy.x < player.x + player.width &&
      enemy.x + enemy.width > player.x &&
      enemy.y < player.y + player.height &&
      enemy.y + enemy.height > player.y
    ) {
      gameOver = true;
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  bullets.forEach((bullet) => {
    ctx.fillStyle = "red";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  enemies.forEach((enemy) => {
    ctx.fillStyle = "green";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "48px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

window.onload = init;
