const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Postavljanje dimenzija canvasa ( -10 da se vidi rub canvasa )
canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

// Konstante
const BRICK_ROWS = 3;
const BRICK_COLS = 10;
const BRICK_WIDTH = 125;
const BRICK_HEIGHT = 30;
const BRICK_PADDING = 10;
const BALL_SPEED = 4;
const PADDLE_WIDTH = 150;
const PADDLE_HEIGHT = 20;

const brickImage = new Image();
brickImage.src = 'cigla.jpg'; // Slika za cigle

// definicija promjenjivih varijabli
let ball = { x: canvas.width / 2, y: canvas.height - 50, dx: BALL_SPEED, dy: -BALL_SPEED, radius: 10 };
let paddle = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: canvas.height - PADDLE_HEIGHT - 10, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, dx: 0 };
let bricks = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

// Funkcija za inicijalizaciju cigli, offsetX namješta cigle na sredinu ekrana
function createBricks() {
    const totalWidth = BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING;
    const offsetX = (canvas.width - totalWidth - 20) / 2;
    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            const x = offsetX + col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING;
            const y = row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50;
            bricks[row][col] = { x, y, status: 1 };
        }
    }
}

// Funkcija za crtanje ploče s rezultatom
function drawScoreBoard() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, 50);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Bodovi: ${score}`, 10, 30);

    ctx.textAlign = 'right';
    ctx.fillText(`Najbolji rezultat: ${highScore}`, canvas.width - 10, 30);
}

// Funkcija za crtanje cigli, strokeRect za sjenčanje
function drawBricks() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.status === 1) {
                ctx.drawImage(brickImage, brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
            }
        });
    });
}

// Funkcija za crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0';
    ctx.fill();
    ctx.closePath();
}

// Funkcija za crtanje platforme
function drawPaddle() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Funkcija za rješavanje sudara loptice s ciglama, na kraju provjera je li igrač pobjedio
function ballBrickCollision() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.status === 1) {
                if (ball.x > brick.x && ball.x < brick.x + BRICK_WIDTH &&
                    ball.y > brick.y && ball.y < brick.y + BRICK_HEIGHT) {
                    ball.dy *= -1;
                    brick.status = 0;
                    score++;
                }
            }
        });
    });

    if (score === BRICK_ROWS * BRICK_COLS) {
        gameOver = true;
        draw(); 
        showGameOver(); 
    }
}

// Funkcija za rješavanje sudara
function detectCollisions() {
    // Sudar s rubovima ekrana
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx *= -1;
    }
    // ovdje 50 zbog ploče s rezultatima da loptica ne prelazi preko rezultata
    if (ball.y - ball.radius < 50) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        gameOver = true;
    }

    // Sudar s platformom
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y) {
    
        // hitPos računa s koje strane platforme je loptica udarila da u tom smjeru vrati lopticu
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const relativePos = hitPos - 0.5; 
        ball.dx = relativePos * 2 * BALL_SPEED;
        ball.dy *= -1;
    }

    // Sudar s ciglama
    ballBrickCollision();
}

// Funkcija za prikazivanje kraja igre
function showGameOver() {
    ctx.fillStyle = '#fff';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    const text = score === BRICK_ROWS * BRICK_COLS ? 'POBJEDA!' : 'GAME OVER';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// Funkcija za nacrtati igru
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScoreBoard();
    drawBricks();
    drawBall();
    drawPaddle();
}

// Funkcija za promjeniti:
function update() {
    //kraj igre
    if (gameOver) {
        showGameOver();
        if (score > highScore) {
            localStorage.setItem('highScore', score);
        }
        return;
    }
    ball.x += ball.dx;
    ball.y += ball.dy;

    //poziciju platforme
    updatePaddle();

    //sudare
    detectCollisions();
    draw();

    requestAnimationFrame(update);
}

// Kontroliranje platforme sa strelicama
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
        paddle.dx = 7; 
    } else if (e.key === 'ArrowLeft') {
        paddle.dx = -7; 
    }
});

document.addEventListener('keyup', () => {
    paddle.dx = 0;
});

// Funkcija za promjenu pozicije platforme
function updatePaddle() {
    paddle.x += paddle.dx;

    // Kontrola da platforma ne iziđe iz ruba canvasa
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Inicijalizacija
createBricks();
update();
