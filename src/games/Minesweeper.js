import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class MinesweeperGame {
    constructor() {
        this.rows = 10; this.cols = 10; this.mines = 15;
        this.board = []; this.revealed = []; this.flagged = [];
        this.gameOver = false; this.gameWon = false; this.firstClick = true;
        this._initBoard();
        this.setupUI();
    }

    _initBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.gameOver = false; this.gameWon = false; this.firstClick = true;
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Minesweeper</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Mines</div><div class="score-value" id="minesCount">${this.mines}</div></div>
                <div class="score-display"><div class="score-label">Status</div><div class="score-value" id="gameStatus">Playing</div></div>
                <div class="score-display"><div class="score-label">Wins</div><div class="score-value" id="mineWins">${storage.get('minesweeper-wins') || 0}</div></div>
            </div>
            <div class="minesweeper-container">
                <div class="minesweeper-board" id="minesweeperBoard"></div>
                <div class="game-controls">
                    <button class="btn" id="mineNew">New Game</button>
                </div>
                <div class="game-instructions">Left click: reveal | Right click: flag</div>
            </div>
        `;
        document.getElementById('mineNew').addEventListener('click', () => this.reset());
        this._render();
    }

    _placeMines(avoidR, avoidC) {
        let placed = 0;
        while (placed < this.mines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            if ((r === avoidR && c === avoidC) || this.board[r][c] === -1) continue;
            this.board[r][c] = -1; placed++;
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] !== -1) this.board[nr][nc]++;
            }
        }
    }

    _render() {
        const el = document.getElementById('minesweeperBoard');
        if (!el) return;
        el.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        el.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'minesweeper-cell';
                if (this.revealed[r][c]) {
                    if (this.board[r][c] === -1) { cell.className += ' mine'; cell.textContent = '💣'; }
                    else if (this.board[r][c] > 0) { cell.className += ` number-${this.board[r][c]}`; cell.textContent = this.board[r][c]; }
                    else cell.className += ' empty';
                } else if (this.flagged[r][c]) { cell.className += ' flagged'; cell.textContent = '🚩'; }
                cell.addEventListener('click', () => this._reveal(r, c));
                cell.addEventListener('contextmenu', (e) => { e.preventDefault(); this._flag(r, c); });
                el.appendChild(cell);
            }
        }
        const mEl = document.getElementById('minesCount');
        if (mEl) mEl.textContent = this.mines - this.flagged.flat().filter(Boolean).length;
    }

    _reveal(r, c) {
        if (this.gameOver || this.gameWon || this.revealed[r][c] || this.flagged[r][c]) return;
        if (this.firstClick) { this._placeMines(r, c); this.firstClick = false; }
        if (this.board[r][c] === -1) {
            this.gameOver = true;
            for (let i = 0; i < this.rows; i++) for (let j = 0; j < this.cols; j++) this.revealed[i][j] = true;
            const el = document.getElementById('gameStatus');
            if (el) el.textContent = 'Game Over!';
            this._render(); return;
        }
        this._revealRec(r, c);
        this._checkWin();
        this._render();
    }

    _revealRec(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.revealed[r][c] || this.flagged[r][c]) return;
        this.revealed[r][c] = true;
        if (this.board[r][c] === 0) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) this._revealRec(r + dr, c + dc);
    }

    _flag(r, c) {
        if (this.gameOver || this.gameWon || this.revealed[r][c]) return;
        this.flagged[r][c] = !this.flagged[r][c];
        this._render();
    }

    _checkWin() {
        let revealed = 0;
        for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) if (this.revealed[r][c]) revealed++;
        if (revealed === this.rows * this.cols - this.mines) {
            this.gameWon = true;
            const el = document.getElementById('gameStatus');
            if (el) el.textContent = 'You Win!';
            const wins = (storage.get('minesweeper-wins') || 0) + 1;
            storage.set('minesweeper-wins', wins);
            notifyScoreUpdate();
            document.getElementById('mineWins').textContent = wins;
        }
    }

    reset() {
        this._initBoard();
        this._render();
        const el = document.getElementById('gameStatus');
        if (el) el.textContent = 'Playing';
    }
}
