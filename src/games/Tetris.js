import { storage, notifyScoreUpdate } from '../core/storage.js';

const SHAPES = [[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
const COLORS = ['#3498db','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22'];

export default class TetrisGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'tetrisCanvas';
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 30;
        this.cols = 10; this.rows = 20;
        this.board = [];
        this.currentPiece = null;
        this.score = 0; this.level = 1; this.lines = 0;
        this.gameRunning = false;
        this.dropTime = 0; this.lastTime = 0;
        this.setupUI();
        this._initBoard();
        this.keyHandler = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.keyHandler);
        requestAnimationFrame(t => this.gameLoop(t));
    }

    _initBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Tetris</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="tetrisScore">0</div></div>
                <div class="score-display"><div class="score-label">Lines</div><div class="score-value" id="tetrisLines">0</div></div>
                <div class="score-display"><div class="score-label">Level</div><div class="score-value" id="tetrisLevel">1</div></div>
            </div>
            <div class="game-instructions">Arrows: Move/Rotate | Space: Drop</div>
            <div class="tetris-container">
                ${this.canvas.outerHTML}
                <div class="game-controls">
                    <button class="btn" id="tetrisStart">Start</button>
                    <button class="btn" id="tetrisReset">Reset</button>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('tetrisStart').addEventListener('click', () => this.start());
        document.getElementById('tetrisReset').addEventListener('click', () => this.reset());
    }

    _createPiece() {
        const type = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[type];
        return { shape: shape.map(r => [...r]), color: COLORS[type], x: Math.floor(this.cols / 2) - Math.floor(shape[0].length / 2) - 1, y: 0 };
    }

    start() {
        this.gameRunning = true;
        this.currentPiece = this._createPiece();
        this.lastTime = performance.now();
    }

    handleKeyPress(e) {
        if (!this.gameRunning || !this.currentPiece) {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
            return;
        }
        switch(e.key) {
            case 'ArrowLeft': e.preventDefault(); if (this._valid(-1, 0)) this.currentPiece.x--; break;
            case 'ArrowRight': e.preventDefault(); if (this._valid(1, 0)) this.currentPiece.x++; break;
            case 'ArrowDown': e.preventDefault(); if (this._valid(0, 1)) this.currentPiece.y++; break;
            case 'ArrowUp': e.preventDefault(); const rot = this._rotate(); if (this._valid(0, 0, rot)) this.currentPiece = rot; break;
            case ' ': e.preventDefault(); while (this._valid(0, 1)) this.currentPiece.y++; break;
        }
    }

    _rotate() {
        const s = this.currentPiece.shape;
        const r = s[0].map((_, i) => s.map(row => row[i]).reverse());
        return { ...this.currentPiece, shape: r };
    }

    _valid(dx = 0, dy = 0, piece = this.currentPiece) {
        const nx = piece.x + dx, ny = piece.y + dy;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (!piece.shape[y][x]) continue;
                const bx = nx + x, by = ny + y;
                if (bx < 0 || bx >= this.cols || by >= this.rows) return false;
                if (by >= 0 && this.board[by][bx]) return false;
            }
        }
        return true;
    }

    _place() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (!this.currentPiece.shape[y][x]) continue;
                const by = this.currentPiece.y + y, bx = this.currentPiece.x + x;
                if (by >= 0 && by < this.rows && bx >= 0 && bx < this.cols) this.board[by][bx] = this.currentPiece.color;
            }
        }
        this._clearLines();
        this.currentPiece = this._createPiece();
        if (!this._valid(0, 0)) { this.gameRunning = false; this._checkHighScore(); }
    }

    _clearLines() {
        let cleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(c => c)) { this.board.splice(y, 1); this.board.unshift(Array(this.cols).fill(0)); cleared++; y++; }
        }
        if (cleared) {
            this.lines += cleared;
            this.score += cleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            document.getElementById('tetrisScore').textContent = this.score;
            document.getElementById('tetrisLines').textContent = this.lines;
            document.getElementById('tetrisLevel').textContent = this.level;
            this._checkHighScore();
        }
    }

    update(time = 0) {
        if (!this.gameRunning) return;
        const delta = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += delta;
        const interval = Math.max(100, 1000 - (this.level - 1) * 100);
        if (this.dropTime > interval) {
            if (this._valid(0, 1)) this.currentPiece.y++;
            else this._place();
            this.dropTime = 0;
        }
    }

    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) { this.ctx.fillStyle = this.board[y][x]; this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1); }
            }
        }
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) this.ctx.fillRect((this.currentPiece.x + x) * this.blockSize, (this.currentPiece.y + y) * this.blockSize, this.blockSize - 1, this.blockSize - 1);
                }
            }
        }
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
            this.ctx.font = '20px Arial'; this.ctx.textAlign = 'center';
            this.ctx.fillText(this.score > 0 ? 'Game Over!' : 'Click Start!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    gameLoop(time) { this.update(time); this.draw(); requestAnimationFrame(t => this.gameLoop(t)); }

    _checkHighScore() {
        const best = storage.get('tetris-high') || 0;
        if (this.score > best) { storage.set('tetris-high', this.score); notifyScoreUpdate(); }
    }

    reset() {
        this._initBoard(); this.currentPiece = null;
        this.score = 0; this.level = 1; this.lines = 0;
        this.gameRunning = false; this.dropTime = 0;
        document.getElementById('tetrisScore').textContent = '0';
        document.getElementById('tetrisLines').textContent = '0';
        document.getElementById('tetrisLevel').textContent = '1';
    }

    cleanup() { window.removeEventListener('keydown', this.keyHandler); }
}
