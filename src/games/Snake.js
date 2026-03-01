import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class SnakeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'snakeCanvas';
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 20;
        this.cols = this.canvas.width / this.cellSize;
        this.rows = this.canvas.height / this.cellSize;
        this.reset();
        this.setupUI();
        this.gameLoop();
        this.keyHandler = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
    }

    generateFood() {
        const emptyCells = [];
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (!this.snake.some(s => s.x === i && s.y === j)) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        return emptyCells.length > 0
            ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
            : { x: 0, y: 0 };
    }

    handleKeyPress(e) {
        const keyMap = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 }
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            if (this.gameOver) return;
            const d = keyMap[e.key];
            if (d.x !== -this.direction.x || d.y !== -this.direction.y) {
                this.nextDirection = d;
            }
        }
    }

    update() {
        if (this.gameOver) return;
        this.direction = this.nextDirection;
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        if (
            head.x < 0 || head.x >= this.cols ||
            head.y < 0 || head.y >= this.rows ||
            this.snake.some(s => s.x === head.x && s.y === head.y)
        ) {
            this.gameOver = true;
            this._checkHighScore();
            return;
        }
        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(s => {
            this.ctx.fillRect(s.x * this.cellSize, s.y * this.cellSize, this.cellSize - 2, this.cellSize - 2);
        });
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.food.x * this.cellSize, this.food.y * this.cellSize, this.cellSize - 2, this.cellSize - 2);
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        const scoreEl = document.getElementById('snakeScore');
        if (scoreEl) scoreEl.textContent = this.score;
        if (!this.gameOver) {
            this._loopTimeout = setTimeout(() => this.gameLoop(), 150);
        }
    }

    _checkHighScore() {
        const best = storage.get('snake-high') || 0;
        if (this.score > best) {
            storage.set('snake-high', this.score);
            notifyScoreUpdate();
            const el = document.getElementById('snakeHighScore');
            if (el) el.textContent = this.score;
        }
    }

    setupUI() {
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <h2 class="game-title">Snake</h2>
            <div class="game-info">
                <div class="score-display">
                    <div class="score-label">Score</div>
                    <div class="score-value" id="snakeScore">0</div>
                </div>
                <div class="score-display">
                    <div class="score-label">High Score</div>
                    <div class="score-value" id="snakeHighScore">${storage.get('snake-high') || 0}</div>
                </div>
            </div>
            <div class="game-instructions">Arrow keys to move</div>
            <div class="snake-game">
                ${this.canvas.outerHTML}
                <div class="game-controls">
                    <button class="btn" id="snakeRestartBtn">Restart</button>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('snakeRestartBtn').addEventListener('click', () => {
            clearTimeout(this._loopTimeout);
            this.reset();
            this.gameLoop();
        });
    }

    cleanup() {
        clearTimeout(this._loopTimeout);
        window.removeEventListener('keydown', this.keyHandler);
    }
}
