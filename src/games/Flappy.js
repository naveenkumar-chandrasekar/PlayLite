import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class FlappyGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'flappyCanvas';
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.bird = { x: 50, y: 300, width: 30, height: 30, velocity: 0, gravity: 0.5, jumpPower: -8 };
        this.pipes = [];
        this.pipeGap = 200;
        this.pipeWidth = 60;
        this.pipeSpeed = 3;
        this.score = 0;
        this.bestScore = storage.get('flappy-best') || 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.frameCount = 0;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Flappy Bird</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="flappyScore">0</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="flappyBest">${this.bestScore}</div></div>
            </div>
            <div class="flappy-container">
                ${this.canvas.outerHTML}
                <div class="game-controls">
                    <button class="btn" id="flappyStart">Start</button>
                    <button class="btn" id="flappyReset">Reset</button>
                </div>
                <div class="game-instructions">Click or Space to jump</div>
            </div>
        `;
        this.canvas = document.getElementById('flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('flappyStart').addEventListener('click', () => this.start());
        document.getElementById('flappyReset').addEventListener('click', () => this.reset());
        this.keyHandler = (e) => { if (e.code === 'Space') { e.preventDefault(); if (!this.gameStarted) this.start(); else if (!this.gameOver) this._jump(); } };
        this.clickHandler = () => { if (!this.gameStarted) this.start(); else if (!this.gameOver) this._jump(); };
        this.draw();
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        this.bird.y = 300; this.bird.velocity = 0;
        this.pipes = []; this.score = 0; this.frameCount = 0;
        document.getElementById('flappyStart').disabled = true;
        window.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('click', this.clickHandler);
        this._loop();
    }

    _jump() { this.bird.velocity = this.bird.jumpPower; }

    update() {
        if (!this.gameStarted || this.gameOver) return;
        this.frameCount++;
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        if (this.frameCount % 90 === 0) {
            const top = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({ x: this.canvas.width, topHeight: top, bottomY: top + this.pipeGap, passed: false });
        }
        for (const pipe of this.pipes) {
            pipe.x -= this.pipeSpeed;
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true; this.score++;
                document.getElementById('flappyScore').textContent = this.score;
            }
            if (this.bird.x < pipe.x + this.pipeWidth && this.bird.x + this.bird.width > pipe.x) {
                if (this.bird.y < pipe.topHeight || this.bird.y + this.bird.height > pipe.bottomY) {
                    this.gameOver = true; this._checkHighScore(); return;
                }
            }
        }
        this.pipes = this.pipes.filter(p => p.x + this.pipeWidth > 0);
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) { this.gameOver = true; this._checkHighScore(); }
    }

    draw() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        for (const pipe of this.pipes) {
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
        }
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 15, this.bird.y + 15, 15, 0, Math.PI * 2);
        this.ctx.fill();
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white'; this.ctx.font = '30px Arial'; this.ctx.textAlign = 'center';
            this.ctx.fillText('Click to Start', 200, 300);
        }
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white'; this.ctx.font = 'bold 30px Arial'; this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', 200, 270);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score: ${this.score}`, 200, 310);
        }
    }

    _loop() {
        this.update(); this.draw();
        if (this.gameStarted && !this.gameOver) requestAnimationFrame(() => this._loop());
        else if (this.gameOver) {
            document.getElementById('flappyStart').disabled = false;
        }
    }

    _checkHighScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            storage.set('flappy-best', this.bestScore);
            notifyScoreUpdate();
            document.getElementById('flappyBest').textContent = this.bestScore;
        }
    }

    reset() {
        this.gameStarted = false; this.gameOver = false;
        this.bird.y = 300; this.bird.velocity = 0;
        this.pipes = []; this.score = 0; this.frameCount = 0;
        document.getElementById('flappyStart').disabled = false;
        document.getElementById('flappyScore').textContent = '0';
        window.removeEventListener('keydown', this.keyHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
        this.draw();
    }

    cleanup() {
        window.removeEventListener('keydown', this.keyHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
    }
}
