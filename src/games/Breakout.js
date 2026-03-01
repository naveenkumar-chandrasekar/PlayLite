import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class BreakoutGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'breakoutCanvas';
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.paddle = { x: 240, y: 380, width: 120, height: 15 };
        this.ball = { x: 300, y: 200, radius: 8, dx: 4, dy: -4 };
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.paused = false;
        this.gameRunning = true;
        this.mouseHandler = this.handleMouseMove.bind(this);
        this.keyHandler = this.handleKeyPress.bind(this);
        this.setupUI();
        this.initBricks();
        window.addEventListener('keydown', this.keyHandler);
        this.gameLoop();
    }

    initBricks() {
        this.bricks = [];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 8; c++) {
                this.bricks.push({
                    x: c * 75 + 35, y: r * 25 + 50,
                    width: 70, height: 20,
                    visible: true, color: `hsl(${r * 60},70%,60%)`
                });
            }
        }
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Breakout</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="breakoutScore">0</div></div>
                <div class="score-display"><div class="score-label">Lives</div><div class="score-value" id="breakoutLives">3</div></div>
            </div>
            <div class="game-instructions">Move mouse to control | Space to pause</div>
            <div class="breakout-container">
                ${this.canvas.outerHTML}
                <div class="game-controls">
                    <button class="btn" id="breakoutNew">New Game</button>
                    <button class="btn" id="breakoutPause">Pause</button>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('breakoutCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousemove', this.mouseHandler);
        document.getElementById('breakoutNew').addEventListener('click', () => this.reset());
        document.getElementById('breakoutPause').addEventListener('click', () => this.togglePause());
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        this.paddle.x = Math.max(0, Math.min(x - this.paddle.width / 2, this.canvas.width - this.paddle.width));
    }

    handleKeyPress(e) {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
        if (e.key === ' ') { e.preventDefault(); this.togglePause(); }
    }

    togglePause() {
        this.paused = !this.paused;
        const btn = document.getElementById('breakoutPause');
        if (btn) btn.textContent = this.paused ? 'Resume' : 'Pause';
        if (!this.paused && !this.gameOver) this.gameLoop();
    }

    update() {
        if (this.gameOver || this.paused || !this.gameRunning) return;
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.dx = -this.ball.dx;
            this.ball.x = Math.max(this.ball.radius, Math.min(this.canvas.width - this.ball.radius, this.ball.x));
        }
        if (this.ball.y - this.ball.radius <= 0) { this.ball.dy = -this.ball.dy; this.ball.y = this.ball.radius; }
        if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) { this.gameOver = true; this.gameRunning = false; this._checkHighScore(); }
            else this._resetBall();
        }
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {
            const hit = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            this.ball.dy = -Math.abs(this.ball.dy);
            this.ball.dx = hit * 5;
            this.ball.y = this.paddle.y - this.ball.radius;
        }
        for (const brick of this.bricks) {
            if (!brick.visible) continue;
            if (this.ball.x + this.ball.radius >= brick.x && this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y && this.ball.y - this.ball.radius <= brick.y + brick.height) {
                brick.visible = false;
                this.score += 10;
                const dx = this.ball.x - (brick.x + brick.width / 2);
                const dy = this.ball.y - (brick.y + brick.height / 2);
                if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) this.ball.dx = -this.ball.dx;
                else this.ball.dy = -this.ball.dy;
                if (this.bricks.every(b => !b.visible)) { this.gameOver = true; this.gameRunning = false; this._checkHighScore(); }
                break;
            }
        }
        document.getElementById('breakoutScore').textContent = this.score;
        document.getElementById('breakoutLives').textContent = this.lives;
    }

    _resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
        this.ball.dy = -4;
    }

    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const brick of this.bricks) {
            if (!brick.visible) continue;
            this.ctx.fillStyle = brick.color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            this.ctx.strokeStyle = '#fff';
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white'; this.ctx.font = '30px Arial'; this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white'; this.ctx.font = 'bold 30px Arial'; this.ctx.textAlign = 'center';
            this.ctx.fillText(this.lives <= 0 ? 'Game Over!' : 'You Win! 🎉', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        if (!this.gameOver && !this.paused) {
            this._raf = requestAnimationFrame(() => this.gameLoop());
        }
    }

    _checkHighScore() {
        const best = storage.get('breakout-high') || 0;
        if (this.score > best) { storage.set('breakout-high', this.score); notifyScoreUpdate(); }
    }

    reset() {
        cancelAnimationFrame(this._raf);
        this.paddle.x = 240;
        this._resetBall();
        this.score = 0; this.lives = 3; this.gameOver = false; this.paused = false; this.gameRunning = true;
        const btn = document.getElementById('breakoutPause');
        if (btn) btn.textContent = 'Pause';
        this.initBricks();
        document.getElementById('breakoutScore').textContent = '0';
        document.getElementById('breakoutLives').textContent = '3';
        this.gameLoop();
    }

    cleanup() {
        cancelAnimationFrame(this._raf);
        this.canvas.removeEventListener('mousemove', this.mouseHandler);
        window.removeEventListener('keydown', this.keyHandler);
    }
}
