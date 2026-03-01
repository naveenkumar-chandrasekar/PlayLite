import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class PongGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pongCanvas';
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.paddle1 = { x: 10, y: 150, width: 10, height: 100, score: 0 };
        this.paddle2 = { x: 580, y: 150, width: 10, height: 100, score: 0 };
        this.ball = { x: 300, y: 200, radius: 10, dx: 5, dy: 3 };
        this.keys = {};
        this.gameRunning = false;
        this.setupUI();
        this.setupControls();
        this.gameLoop();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Pong</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">You</div><div class="score-value" id="pongScore1">0</div></div>
                <div class="score-display"><div class="score-label">AI</div><div class="score-value" id="pongScore2">0</div></div>
            </div>
            <div class="game-instructions">W/S keys to move | First to 5 wins</div>
            <div class="pong-container">
                ${this.canvas.outerHTML}
                <div class="game-controls">
                    <button class="btn" id="pongStartBtn">Start</button>
                    <button class="btn" id="pongResetBtn">Reset</button>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('pongStartBtn').addEventListener('click', () => this.start());
        document.getElementById('pongResetBtn').addEventListener('click', () => this.reset());
    }

    setupControls() {
        this.keyHandler = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
            this.keys[e.key.toLowerCase()] = e.type === 'keydown';
        };
        window.addEventListener('keydown', this.keyHandler);
        window.addEventListener('keyup', this.keyHandler);
    }

    start() { this.gameRunning = true; this._resetBall(); }

    update() {
        if (!this.gameRunning) return;
        if (this.keys['w'] && this.paddle1.y > 0) this.paddle1.y -= 7;
        if (this.keys['s'] && this.paddle1.y < this.canvas.height - this.paddle1.height) this.paddle1.y += 7;
        const p2c = this.paddle2.y + this.paddle2.height / 2;
        if (this.ball.y < p2c - 5 && this.paddle2.y > 0) this.paddle2.y -= 5;
        else if (this.ball.y > p2c + 5 && this.paddle2.y < this.canvas.height - this.paddle2.height) this.paddle2.y += 5;
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) this.ball.dy = -this.ball.dy;
        if (this.ball.x - this.ball.radius <= this.paddle1.x + this.paddle1.width &&
            this.ball.y >= this.paddle1.y && this.ball.y <= this.paddle1.y + this.paddle1.height && this.ball.dx < 0) {
            const hit = (this.ball.y - (this.paddle1.y + this.paddle1.height / 2)) / (this.paddle1.height / 2);
            this.ball.dx = Math.abs(this.ball.dx); this.ball.dy = hit * 5;
        }
        if (this.ball.x + this.ball.radius >= this.paddle2.x &&
            this.ball.y >= this.paddle2.y && this.ball.y <= this.paddle2.y + this.paddle2.height && this.ball.dx > 0) {
            const hit = (this.ball.y - (this.paddle2.y + this.paddle2.height / 2)) / (this.paddle2.height / 2);
            this.ball.dx = -Math.abs(this.ball.dx); this.ball.dy = hit * 5;
        }
        if (this.ball.x < 0) {
            this.paddle2.score++;
            document.getElementById('pongScore2').textContent = this.paddle2.score;
            if (this.paddle2.score >= 5) { this.gameRunning = false; return; }
            this._resetBall();
        }
        if (this.ball.x > this.canvas.width) {
            this.paddle1.score++;
            document.getElementById('pongScore1').textContent = this.paddle1.score;
            if (this.paddle1.score >= 5) {
                this.gameRunning = false;
                const wins = (storage.get('pong-wins') || 0) + 1;
                storage.set('pong-wins', wins); notifyScoreUpdate();
            } else this._resetBall();
        }
    }

    _resetBall() {
        this.ball = { x: 300, y: 200, radius: 10, dx: (Math.random() > 0.5 ? 1 : -1) * 5, dy: (Math.random() > 0.5 ? 1 : -1) * 3 };
    }

    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff'; this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(300, 0); this.ctx.lineTo(300, this.canvas.height);
        this.ctx.stroke(); this.ctx.setLineDash([]);
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
            this.ctx.font = '24px Arial'; this.ctx.textAlign = 'center';
            if (this.paddle1.score === 0 && this.paddle2.score === 0) {
                this.ctx.fillText('Click Start!', 300, 200);
            } else {
                this.ctx.fillText(this.paddle1.score >= 5 ? 'You Win! 🎉' : 'AI Wins!', 300, 200);
            }
        }
    }

    gameLoop() { this.update(); this.draw(); requestAnimationFrame(() => this.gameLoop()); }

    reset() {
        this.paddle1.score = 0; this.paddle2.score = 0;
        this.paddle1.y = 150; this.paddle2.y = 150;
        this.gameRunning = false;
        this._resetBall();
        document.getElementById('pongScore1').textContent = '0';
        document.getElementById('pongScore2').textContent = '0';
    }

    cleanup() {
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('keyup', this.keyHandler);
    }
}
