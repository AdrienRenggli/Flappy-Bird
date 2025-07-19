const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 320;

const GRAVITY = 0.4;
const FLAP = -7;
const SPAWN_RATE = 100;
const GAP_SIZE = 200;

let bird;
let pipes = [];
let score = 0;
let isGameOver = false;

const birdWidth = canvas.width * 0.05;
const birdHeight = canvas.height * 0.05;

document.addEventListener("keydown", controlBird);
document.addEventListener("touchstart", controlBird);

function controlBird(event) {
    if (isGameOver) return;

    if (event.type === "keydown" && event.key === " " || event.type === "touchstart") {
        bird.velocity = FLAP;
    }
}

function restartGame() {
    bird = new Bird();
    pipes = [];
    score = 0;
    isGameOver = false;
    document.getElementById("gameOverOverlay").style.display = "none";
    gameLoop();
}

document.getElementById("restartBtn").addEventListener("click", restartGame);

class Bird {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.width = birdWidth;
        this.height = birdHeight;
        this.velocity = 0;
    }

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // Prevent bird from flying off screen
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }

    draw() {
        ctx.save();

        // Mirror the bird horizontally
        ctx.scale(-1, 1);
        ctx.fillText("🕊️", -this.x - this.width, this.y + this.height / 2);

        ctx.restore();
    }
}

class Pipe {
    constructor() {
        this.width = 50;
        this.x = canvas.width;
        this.topHeight = Math.floor(Math.random() * (canvas.height - GAP_SIZE));
        this.bottomHeight = canvas.height - (this.topHeight + GAP_SIZE);
    }

    update() {
        this.x -= 2;
    }

    draw() {
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.fillRect(this.x, canvas.height - this.bottomHeight, this.width, this.bottomHeight);
    }

    offscreen() {
        return this.x + this.width < 0;
    }

    collidesWith(bird) {
        return (
            bird.x + bird.width > this.x &&
            bird.x < this.x + this.width &&
            (bird.y < this.topHeight || bird.y + bird.height > canvas.height - this.bottomHeight)
        );
    }
}

function updateScore() {
    ctx.font = "20px 'Press Start 2P', monospace";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 30);
}

function gameOver() {
    isGameOver = true;
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOverOverlay").style.display = "block";
}

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        pipes.push(new Pipe());
    }

    bird.update();
    bird.draw();

    pipes.forEach((pipe, index) => {
        pipe.update();
        pipe.draw();

        if (pipe.offscreen()) {
            pipes.splice(index, 1);
            score++;
        }

        if (pipe.collidesWith(bird)) {
            gameOver();
        }
    });

    updateScore();

    requestAnimationFrame(gameLoop);
}

bird = new Bird();
gameLoop();