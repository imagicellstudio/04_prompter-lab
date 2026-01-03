// 캔버스 및 컨텍스트 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상태
let gameState = 'menu'; // menu, playing, paused, gameOver
let score = 0;
let highScore = localStorage.getItem('galagaHighScore') || 0;
let lives = 3;
let level = 1;
let gameLoop;

// UI 요소
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const gameOverElement = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

highScoreElement.textContent = highScore;

// 플레이어 클래스
class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 80;
        this.speed = 5;
        this.bullets = [];
        this.shootCooldown = 0;
    }

    draw() {
        // 플레이어 우주선 그리기 (삼각형 모양)
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // 날개
        ctx.fillStyle = '#0c0';
        ctx.fillRect(this.x - 5, this.y + this.height - 10, 10, 10);
        ctx.fillRect(this.x + this.width - 5, this.y + this.height - 10, 10, 10);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        if (this.shootCooldown <= 0) {
            this.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -8, '#0ff'));
            this.shootCooldown = 15;
        }
    }

    update() {
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // 총알 업데이트
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.y > 0;
        });
    }
}

// 총알 클래스
class Bullet {
    constructor(x, y, speedY, color) {
        this.x = x;
        this.y = y;
        this.speedY = speedY;
        this.width = 4;
        this.height = 12;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speedY;
    }
}

// 적 클래스
class Enemy {
    constructor(x, y, type) {
        this.width = 35;
        this.height = 35;
        this.x = x;
        this.y = y;
        this.type = type; // 0: 보스, 1: 나비, 2: 벌
        this.health = type === 0 ? 2 : 1;
        this.speed = 1;
        this.direction = 1;
        this.shootCooldown = Math.random() * 200 + 100;
        this.diving = false;
        this.diveSpeed = 0;
        this.originalX = x;
        this.originalY = y;
    }

    draw() {
        // 적 타입에 따라 다른 색상
        if (this.type === 0) {
            // 보스 (빨간색)
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f88';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 1) {
            // 나비 (파란색)
            ctx.fillStyle = '#00f';
            ctx.fillRect(this.x + 10, this.y + 5, 15, 25);
            ctx.fillStyle = '#88f';
            ctx.fillRect(this.x, this.y + 10, 10, 15);
            ctx.fillRect(this.x + 25, this.y + 10, 10, 15);
        } else {
            // 벌 (노란색)
            ctx.fillStyle = '#ff0';
            ctx.fillRect(this.x + 5, this.y, 25, 35);
            ctx.fillStyle = '#cc0';
            ctx.fillRect(this.x, this.y + 10, 5, 15);
            ctx.fillRect(this.x + 30, this.y + 10, 5, 15);
        }
    }

    update() {
        if (!this.diving) {
            // 좌우 이동
            this.x += this.speed * this.direction;

            // 화면 경계 확인
            if (this.x <= 0 || this.x >= canvas.width - this.width) {
                this.direction *= -1;
                this.y += 10; // 아래로 이동
            }
        } else {
            // 급강하 공격
            this.y += 3;
            if (this.y > canvas.height) {
                this.diving = false;
                this.y = this.originalY;
                this.x = this.originalX;
            }
        }

        // 발사 쿨다운
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    shoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = Math.random() * 200 + 100;
            return new Bullet(this.x + this.width / 2 - 2, this.y + this.height, 4, '#f0f');
        }
        return null;
    }

    startDive() {
        if (!this.diving && Math.random() < 0.001) {
            this.diving = true;
        }
    }
}

// 폭발 효과 클래스
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = 30;
        this.speed = 2;
        this.done = false;
    }

    draw() {
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#f80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }

    update() {
        this.radius += this.speed;
        if (this.radius >= this.maxRadius) {
            this.done = true;
        }
    }
}

// 게임 객체
let player;
let enemies = [];
let enemyBullets = [];
let explosions = [];
let keys = {};

// 키보드 입력
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        player.shoot();
    }

    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 버튼 이벤트
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// 게임 초기화
function initGame() {
    player = new Player();
    enemies = [];
    enemyBullets = [];
    explosions = [];
    score = 0;
    lives = 3;
    level = 1;
    updateUI();
    createEnemies();
}

// 적 생성
function createEnemies() {
    enemies = [];
    const rows = 4 + Math.floor(level / 2);
    const cols = 8 + Math.floor(level / 3);
    const startX = 100;
    const startY = 50;
    const spacing = 60;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let type;
            if (row === 0) {
                type = 0; // 보스
            } else if (row < 3) {
                type = 1; // 나비
            } else {
                type = 2; // 벌
            }

            const x = startX + col * spacing;
            const y = startY + row * spacing;
            enemies.push(new Enemy(x, y, type));
        }
    }
}

// 게임 시작
function startGame() {
    if (gameState === 'gameOver') {
        initGame();
    }
    gameState = 'playing';
    gameOverElement.style.display = 'none';
    startBtn.textContent = '재시작';
    if (!gameLoop) {
        gameLoop = setInterval(update, 1000 / 60);
    }
}

// 일시정지
function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseBtn.textContent = '계속하기';
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseBtn.textContent = '일시정지';
    }
}

// UI 업데이트
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('galagaHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

// 충돌 감지
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 게임 업데이트
function update() {
    if (gameState !== 'playing') return;

    // 캔버스 클리어
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 배경
    drawStars();

    // 플레이어 이동
    if (keys['ArrowLeft']) {
        player.move('left');
    }
    if (keys['ArrowRight']) {
        player.move('right');
    }

    // 플레이어 업데이트 및 그리기
    player.update();
    player.draw();

    // 플레이어 총알 그리기
    player.bullets.forEach(bullet => {
        bullet.draw();
    });

    // 적 업데이트 및 그리기
    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();
        enemy.startDive();

        // 적 발사
        const bullet = enemy.shoot();
        if (bullet) {
            enemyBullets.push(bullet);
        }
    });

    // 적 총알 업데이트 및 그리기
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.update();
        bullet.draw();
        return bullet.y < canvas.height;
    });

    // 폭발 효과
    explosions = explosions.filter(explosion => {
        explosion.update();
        explosion.draw();
        return !explosion.done;
    });

    // 충돌 감지 - 플레이어 총알과 적
    player.bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
                enemy.health--;
                player.bullets.splice(bulletIndex, 1);

                if (enemy.health <= 0) {
                    explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                    enemies.splice(enemyIndex, 1);
                    score += (enemy.type === 0 ? 150 : enemy.type === 1 ? 80 : 50);
                    updateUI();
                }
            }
        });
    });

    // 충돌 감지 - 적 총알과 플레이어
    enemyBullets.forEach((bullet, bulletIndex) => {
        if (checkCollision(bullet, player)) {
            explosions.push(new Explosion(player.x + player.width / 2, player.y + player.height / 2));
            enemyBullets.splice(bulletIndex, 1);
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver();
            } else {
                player.x = canvas.width / 2 - player.width / 2;
            }
        }
    });

    // 충돌 감지 - 급강하 적과 플레이어
    enemies.forEach(enemy => {
        if (enemy.diving && checkCollision(enemy, player)) {
            explosions.push(new Explosion(player.x + player.width / 2, player.y + player.height / 2));
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver();
            } else {
                player.x = canvas.width / 2 - player.width / 2;
            }
        }
    });

    // 레벨 클리어
    if (enemies.length === 0) {
        level++;
        updateUI();
        createEnemies();
    }
}

// 별 배경
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2
    });
}

function drawStars() {
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += 0.5;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// 게임 오버
function gameOver() {
    gameState = 'gameOver';
    gameOverElement.style.display = 'block';
    clearInterval(gameLoop);
    gameLoop = null;
}

// 초기 화면
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#0f0';
ctx.font = '30px Courier New';
ctx.textAlign = 'center';
ctx.fillText('갤러그 게임에 오신 것을 환영합니다!', canvas.width / 2, canvas.height / 2 - 30);
ctx.fillText('게임 시작 버튼을 눌러주세요', canvas.width / 2, canvas.height / 2 + 30);
