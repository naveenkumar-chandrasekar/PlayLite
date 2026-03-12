import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.mode = 'computer';
        this.setupUI();
    }

    setupUI() {
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <h2 class="game-title">Tic Tac Toe</h2>
            <div class="mode-selector">
                <button class="mode-btn active" id="tttModeComputer">vs Computer</button>
                <button class="mode-btn" id="tttModeMulti">2 Players</button>
            </div>
            <div class="game-info">
                <div class="score-display">
                    <div class="score-label">Status</div>
                    <div class="score-value" id="gameStatus" style="font-size:1.2rem;">X's turn</div>
                </div>
                <div class="score-display">
                    <div class="score-label" id="tttWinsLabel">Wins</div>
                    <div class="score-value" id="tttWins">${storage.get('tictactoe-wins') || 0}</div>
                </div>
            </div>
            <div class="game-instructions" id="tttInstructions">You are X — click any cell to play | Beat the computer!</div>
            <div class="tictactoe-game">
                <div class="tictactoe-board" id="board"></div>
                <div class="game-controls">
                    <button class="btn" id="tttNewGame">New Game</button>
                </div>
            </div>
        `;
        const boardEl = document.getElementById('board');
        this.cells = [];
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'tictactoe-cell';
            cell.addEventListener('click', () => this.makeMove(i));
            boardEl.appendChild(cell);
            this.cells.push(cell);
        }
        document.getElementById('tttNewGame').addEventListener('click', () => this.reset());
        document.getElementById('tttModeComputer').addEventListener('click', () => this.setMode('computer'));
        document.getElementById('tttModeMulti').addEventListener('click', () => this.setMode('multiplayer'));
        this.updateBoard();
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('tttModeComputer').classList.toggle('active', mode === 'computer');
        document.getElementById('tttModeMulti').classList.toggle('active', mode === 'multiplayer');
        const label = document.getElementById('tttWinsLabel');
        const instructions = document.getElementById('tttInstructions');
        if (mode === 'multiplayer') {
            label.textContent = 'X Wins';
            document.getElementById('tttWins').textContent = storage.get('tictactoe-p1wins') || 0;
            instructions.textContent = 'P1 = X, P2 = O — take turns clicking cells | 3 in a row wins!';
        } else {
            label.textContent = 'Wins';
            document.getElementById('tttWins').textContent = storage.get('tictactoe-wins') || 0;
            instructions.textContent = 'You are X — click any cell to play | Beat the computer!';
        }
        this.reset();
    }

    makeMove(index) {
        if (this.board[index] || this.gameOver) return;
        this.board[index] = this.currentPlayer;
        this.updateBoard();
        if (this.checkWinner()) {
            this.gameOver = true;
            if (this.mode === 'multiplayer') {
                const label = this.winner === 'X' ? 'Player 1 (X) Wins!' : 'Player 2 (O) Wins!';
                document.getElementById('gameStatus').textContent = label;
                const key = this.winner === 'X' ? 'tictactoe-p1wins' : 'tictactoe-p2wins';
                const wins = (storage.get(key) || 0) + 1;
                storage.set(key, wins);
                notifyScoreUpdate();
                if (this.winner === 'X') document.getElementById('tttWins').textContent = wins;
            } else {
                if (this.winner === 'X') {
                    const wins = (storage.get('tictactoe-wins') || 0) + 1;
                    storage.set('tictactoe-wins', wins);
                    notifyScoreUpdate();
                    document.getElementById('gameStatus').textContent = 'You Win!';
                    document.getElementById('tttWins').textContent = wins;
                } else {
                    document.getElementById('gameStatus').textContent = 'Computer Wins!';
                }
            }
            return;
        }
        if (this.board.every(c => c)) {
            this.gameOver = true;
            document.getElementById('gameStatus').textContent = 'Draw!';
            return;
        }
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        if (this.mode === 'computer' && this.currentPlayer === 'O') {
            setTimeout(() => this.computerMove(), 500);
        } else {
            document.getElementById('gameStatus').textContent = this.mode === 'multiplayer'
                ? `Player ${this.currentPlayer === 'X' ? 1 : 2} (${this.currentPlayer})'s turn`
                : "X's turn";
        }
    }

    computerMove() {
        const empty = this.board.map((c, i) => c === '' ? i : null).filter(v => v !== null);
        if (!empty.length) return;
        let move;
        for (const idx of empty) {
            this.board[idx] = 'O';
            if (this.checkWinner()) { move = idx; this.board[idx] = ''; break; }
            this.board[idx] = '';
        }
        if (move === undefined) {
            for (const idx of empty) {
                this.board[idx] = 'X';
                if (this.checkWinner()) { move = idx; this.board[idx] = ''; break; }
                this.board[idx] = '';
            }
        }
        if (move === undefined) move = empty[Math.floor(Math.random() * empty.length)];
        this.makeMove(move);
    }

    checkWinner() {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const [a, b, c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                return true;
            }
        }
        return false;
    }

    updateBoard() {
        this.cells.forEach((cell, i) => {
            cell.textContent = this.board[i];
            cell.disabled = !!this.board[i] || this.gameOver;
        });
        if (!this.gameOver && this.currentPlayer === 'O' && this.mode === 'computer') {
            const el = document.getElementById('gameStatus');
            if (el) el.textContent = "O's turn...";
        }
    }

    reset() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        const status = this.mode === 'multiplayer' ? "Player 1 (X)'s turn" : "X's turn";
        document.getElementById('gameStatus').textContent = status;
        this.updateBoard();
    }
}
