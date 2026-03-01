import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class Connect4Game {
    constructor() {
        this.rows = 6; this.cols = 7;
        this.board = Array(6).fill().map(() => Array(7).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = 0;
        this.player1Wins = storage.get('connect4-wins') || 0;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Connect Four</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Player</div><div class="score-value" id="c4Player">🔴</div></div>
                <div class="score-display"><div class="score-label">Wins</div><div class="score-value" id="c4Wins">${this.player1Wins}</div></div>
                <div class="score-display"><div class="score-label">Status</div><div class="score-value" id="c4Status">Your Turn</div></div>
            </div>
            <div class="connect4-container">
                <div class="connect4-board" id="c4Board"></div>
                <div class="game-controls">
                    <button class="btn" id="c4New">New Game</button>
                </div>
            </div>
        `;
        document.getElementById('c4New').addEventListener('click', () => this.reset());
        this._render();
    }

    _render() {
        const board = document.getElementById('c4Board');
        if (!board) return;
        board.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell' + (this.board[r][c] === 1 ? ' player1' : this.board[r][c] === 2 ? ' player2' : '');
                cell.addEventListener('click', () => this._move(c));
                board.appendChild(cell);
            }
        }
        const status = document.getElementById('c4Status');
        if (status) status.textContent = this.gameOver ? (this.winner === 1 ? 'You Win!' : this.winner === 2 ? 'AI Wins!' : 'Draw!') : (this.currentPlayer === 1 ? 'Your Turn' : 'AI...');
    }

    _move(col) {
        if (this.gameOver || this.currentPlayer !== 1) return;
        const row = this._lowest(col);
        if (row === -1) return;
        this.board[row][col] = 1;
        if (this._checkWin(row, col, 1)) {
            this.gameOver = true; this.winner = 1;
            this.player1Wins++;
            storage.set('connect4-wins', this.player1Wins);
            notifyScoreUpdate();
            document.getElementById('c4Wins').textContent = this.player1Wins;
            this._render(); return;
        }
        if (this._full()) { this.gameOver = true; this._render(); return; }
        this.currentPlayer = 2; this._render();
        setTimeout(() => this._aiMove(), 500);
    }

    _aiMove() {
        if (this.gameOver) return;
        let best = -Infinity, bestCol = -1;
        for (let c = 0; c < this.cols; c++) {
            const r = this._lowest(c);
            if (r === -1) continue;
            this.board[r][c] = 2;
            if (this._checkWin(r, c, 2)) { this.gameOver = true; this.winner = 2; this.board[r][c] = 0; this._render(); return; }
            let score = this._eval();
            this.board[r][c] = 1;
            if (this._checkWin(r, c, 1)) score = -1000;
            this.board[r][c] = 0;
            if (score > best) { best = score; bestCol = c; }
        }
        if (bestCol !== -1) {
            const r = this._lowest(bestCol);
            this.board[r][bestCol] = 2;
            if (this._checkWin(r, bestCol, 2)) { this.gameOver = true; this.winner = 2; }
            else if (this._full()) { this.gameOver = true; }
            this.currentPlayer = 1;
        }
        this._render();
    }

    _eval() {
        let score = 0;
        for (let r = 0; r < this.rows; r++)
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === 2) score += this._connections(r, c, 2) * 10;
                else if (this.board[r][c] === 1) score -= this._connections(r, c, 1) * 10;
            }
        return score;
    }

    _connections(row, col, player) {
        let count = 0;
        const dirs = [[0,1],[1,0],[1,1],[1,-1]];
        for (const [dr, dc] of dirs) {
            let streak = 0;
            for (let i = -3; i <= 3; i++) {
                const nr = row + dr * i, nc = col + dc * i;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === player) { streak++; if (streak === 4) count++; }
                else streak = 0;
            }
        }
        return count;
    }

    _lowest(col) {
        for (let r = this.rows - 1; r >= 0; r--) if (!this.board[r][col]) return r;
        return -1;
    }

    _checkWin(row, col, player) {
        const dirs = [[0,1],[1,0],[1,1],[1,-1]];
        for (const [dr, dc] of dirs) {
            let count = 1;
            for (let i = 1; i < 4; i++) { const nr = row + dr * i, nc = col + dc * i; if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === player) count++; else break; }
            for (let i = 1; i < 4; i++) { const nr = row - dr * i, nc = col - dc * i; if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === player) count++; else break; }
            if (count >= 4) return true;
        }
        return false;
    }

    _full() { return this.board[0].every(c => c !== 0); }

    reset() {
        this.board = Array(6).fill().map(() => Array(7).fill(0));
        this.currentPlayer = 1; this.gameOver = false; this.winner = 0;
        this._render();
    }
}
