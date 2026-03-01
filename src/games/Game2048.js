import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class Game2048 {
    constructor() {
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.won = false;
        this.gameOver = false;
        this.initBoard();
        this.setupUI();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.keyHandler = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.keyHandler);
    }

    initBoard() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">2048</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="score2048">0</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="best2048">${storage.get('game2048-best') || 0}</div></div>
            </div>
            <div class="game-instructions">Arrow keys or swipe to move tiles</div>
            <div class="game2048-container">
                <div class="board-2048" id="board2048"></div>
                <div class="game-controls">
                    <button class="btn" id="btn2048New">New Game</button>
                </div>
            </div>
        `;
        document.getElementById('btn2048New').addEventListener('click', () => this.reset());
    }

    renderBoard() {
        const boardEl = document.getElementById('board2048');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell-2048';
                const v = this.board[i][j];
                if (v) { cell.textContent = v; cell.className += ` tile-${v}`; }
                boardEl.appendChild(cell);
            }
        }
    }

    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (!this.board[i][j]) empty.push({ r: i, c: j });
        if (empty.length) {
            const { r, c } = empty[Math.floor(Math.random() * empty.length)];
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(v => v);
            const newRow = [];
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2); this.score += row[j] * 2; j++;
                } else newRow.push(row[j]);
            }
            while (newRow.length < this.size) newRow.push(0);
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) moved = true;
            this.board[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(v => v);
            const newRow = [];
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2); this.score += row[j] * 2; j--;
                } else newRow.unshift(row[j]);
            }
            while (newRow.length < this.size) newRow.unshift(0);
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) moved = true;
            this.board[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) if (this.board[i][j]) col.push(this.board[i][j]);
            const newCol = [];
            for (let i = 0; i < col.length; i++) {
                if (i < col.length - 1 && col[i] === col[i + 1]) {
                    newCol.push(col[i] * 2); this.score += col[i] * 2; i++;
                } else newCol.push(col[i]);
            }
            while (newCol.length < this.size) newCol.push(0);
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== newCol[i]) moved = true;
                this.board[i][j] = newCol[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) if (this.board[i][j]) col.push(this.board[i][j]);
            const newCol = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i > 0 && col[i] === col[i - 1]) {
                    newCol.unshift(col[i] * 2); this.score += col[i] * 2; i--;
                } else newCol.unshift(col[i]);
            }
            while (newCol.length < this.size) newCol.unshift(0);
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== newCol[i]) moved = true;
                this.board[i][j] = newCol[i];
            }
        }
        return moved;
    }

    handleKeyPress(e) {
        const moves = { ArrowLeft: 'moveLeft', ArrowRight: 'moveRight', ArrowUp: 'moveUp', ArrowDown: 'moveDown' };
        if (!moves[e.key]) return;
        e.preventDefault();
        if (this.gameOver) return;
        const moved = this[moves[e.key]]();
        if (moved) { this.addRandomTile(); this.updateDisplay(); this.checkGameOver(); }
    }

    checkGameOver() {
        let hasEmpty = false, canMove = false;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.board[i][j]) hasEmpty = true;
                if (this.board[i][j] === 2048 && !this.won) this.won = true;
                if ((i < this.size - 1 && this.board[i][j] === this.board[i+1][j]) ||
                    (j < this.size - 1 && this.board[i][j] === this.board[i][j+1])) canMove = true;
            }
        }
        if (!hasEmpty && !canMove) {
            this.gameOver = true;
            this._saveBest();
            const container = document.querySelector('.game2048-container');
            if (container && !container.querySelector('.game-over-overlay')) {
                const el = document.createElement('div');
                el.className = 'game-over-overlay';
                el.innerHTML = `<div class="game-over-message"><h3>Game Over!</h3><p>Final Score: ${this.score}</p><button class="btn">Try Again</button></div>`;
                container.appendChild(el);
                el.querySelector('.btn').addEventListener('click', () => this.reset());
            }
        }
        if (this.won) {
            const container = document.querySelector('.game2048-container');
            if (container && !container.querySelector('.game-won-overlay')) {
                const el = document.createElement('div');
                el.className = 'game-won-overlay';
                el.innerHTML = `<div class="game-over-message"><h3>You Win! 🎉</h3><p>Reached 2048!</p><button class="btn">Continue</button></div>`;
                container.appendChild(el);
                el.querySelector('.btn').addEventListener('click', () => { this.won = false; el.remove(); });
                setTimeout(() => el.parentNode && el.remove(), 3000);
            }
        }
    }

    updateDisplay() {
        const el = document.getElementById('score2048');
        if (el) el.textContent = this.score;
        this._saveBest();
        this.renderBoard();
    }

    _saveBest() {
        const best = storage.get('game2048-best') || 0;
        if (this.score > best) {
            storage.set('game2048-best', this.score);
            notifyScoreUpdate();
            const el = document.getElementById('best2048');
            if (el) el.textContent = this.score;
        }
    }

    reset() {
        document.querySelector('.game-over-overlay')?.remove();
        document.querySelector('.game-won-overlay')?.remove();
        this.score = 0;
        this.won = false;
        this.gameOver = false;
        this.initBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    cleanup() {
        window.removeEventListener('keydown', this.keyHandler);
    }
}
