import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class SudokuGame {
    constructor() {
        this.size = 9;
        this.grid = [];
        this.solution = [];
        this.original = [];
        this.selectedCell = null;
        this.errors = 0;
        this.difficulty = 'medium';
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Sudoku</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Errors</div><div class="score-value" id="sudokuErrors">0</div></div>
                <div class="score-display"><div class="score-label">Filled</div><div class="score-value" id="sudokuCompleted">0</div></div>
            </div>
            <div id="difficultySelection" style="text-align:center;margin:20px 0;">
                <div style="margin-bottom:10px;font-weight:bold;color:#667eea;">Select Difficulty:</div>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                    <button class="btn" id="sdEasy" style="background:#2ecc71;">Easy</button>
                    <button class="btn" id="sdMedium" style="background:#3498db;">Medium</button>
                    <button class="btn" id="sdHard" style="background:#e74c3c;">Hard</button>
                </div>
            </div>
            <div id="gameArea" style="display:none;">
                <div id="completionMessage" style="display:none;text-align:center;margin:15px 0;padding:15px;background:#2ecc71;color:white;border-radius:10px;font-size:1.2rem;font-weight:bold;"></div>
                <div class="game-instructions">Click cell then press 1-9 | Backspace to clear</div>
                <div class="sudoku-game">
                    <div class="sudoku-grid" id="sudokuGrid"></div>
                    <div class="sudoku-numbers" id="sudokuNumbers"></div>
                    <div class="game-controls">
                        <button class="btn" id="sdCheck">Check</button>
                        <button class="btn" id="sdNew">New Puzzle</button>
                        <button class="btn" id="sdChangeDiff">Difficulty</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('sdEasy').addEventListener('click', () => this._setDiff('easy'));
        document.getElementById('sdMedium').addEventListener('click', () => this._setDiff('medium'));
        document.getElementById('sdHard').addEventListener('click', () => this._setDiff('hard'));
        document.getElementById('sdCheck').addEventListener('click', () => this.checkSolution());
        document.getElementById('sdNew').addEventListener('click', () => this.reset());
        document.getElementById('sdChangeDiff').addEventListener('click', () => this._showDiffSelection());
        this._buildNumberBtns();
        this.keyHandler = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.keyHandler);
    }

    _buildNumberBtns() {
        const el = document.getElementById('sudokuNumbers');
        if (!el) return;
        el.innerHTML = '';
        for (let n = 1; n <= 9; n++) {
            const btn = document.createElement('button');
            btn.className = 'sudoku-number-btn';
            btn.id = `numBtn${n}`;
            btn.innerHTML = `<span>${n}</span><span class="num-count" id="numCount${n}">9</span>`;
            btn.addEventListener('click', () => this.inputNumber(n));
            el.appendChild(btn);
        }
        const clr = document.createElement('button');
        clr.className = 'sudoku-number-btn';
        clr.textContent = 'CLR';
        clr.addEventListener('click', () => this.inputNumber(0));
        el.appendChild(clr);
    }

    _setDiff(level) {
        this.difficulty = level;
        document.getElementById('difficultySelection').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('completionMessage').style.display = 'none';
        this._renderGrid();
        this._generatePuzzle();
        this._updateDisplay();
        this._updateCounts();
    }

    _showDiffSelection() {
        document.getElementById('difficultySelection').style.display = 'block';
        document.getElementById('gameArea').style.display = 'none';
    }

    _generatePuzzle() {
        for (let attempt = 0; attempt < 10; attempt++) {
            const sol = this._generateFull();
            if (sol) {
                this.solution = sol.map(r => [...r]);
                this.grid = sol.map(r => [...r]);
                const counts = { easy: 35, medium: 45, hard: 55 };
                const remove = counts[this.difficulty] || 45;
                const removed = new Set();
                let tries = 0;
                while (removed.size < remove && tries < 200) {
                    const r = Math.floor(Math.random() * 9);
                    const c = Math.floor(Math.random() * 9);
                    const key = r * 9 + c;
                    if (!removed.has(key)) { removed.add(key); this.grid[r][c] = 0; }
                    tries++;
                }
                this.original = this.grid.map(r => [...r]);
                this.errors = 0; this.selectedCell = null;
                const el = document.getElementById('sudokuErrors');
                if (el) el.textContent = '0';
                return;
            }
        }
    }

    _generateFull() {
        const g = Array(9).fill().map(() => Array(9).fill(0));
        return this._solve(g) ? g : null;
    }

    _solve(g) {
        const cell = this._findEmpty(g);
        if (!cell) return true;
        const [r, c] = cell;
        const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        for (const n of nums) {
            if (this._valid(g, r, c, n)) {
                g[r][c] = n;
                if (this._solve(g)) return true;
                g[r][c] = 0;
            }
        }
        return false;
    }

    _findEmpty(g) {
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!g[r][c]) return [r, c];
        return null;
    }

    _valid(g, row, col, num) {
        for (let i = 0; i < 9; i++) { if (g[row][i] === num || g[i][col] === num) return false; }
        const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (g[br+i][bc+j] === num) return false; }
        return true;
    }

    _renderGrid() {
        const el = document.getElementById('sudokuGrid');
        if (!el) return;
        el.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (i % 3 === 0 && i > 0) cell.classList.add('border-top');
                if (j % 3 === 0 && j > 0) cell.classList.add('border-left');
                cell.dataset.row = i; cell.dataset.col = j;
                cell.addEventListener('click', () => this.selectCell(i, j));
                el.appendChild(cell);
            }
        }
    }

    selectCell(r, c) { this.selectedCell = { row: r, col: c }; this._updateDisplay(); }

    inputNumber(num) {
        if (!this.selectedCell || !this.grid.length) return;
        const { row, col } = this.selectedCell;
        if (this.original[row]?.[col] !== 0) return;
        const old = this.grid[row][col];
        this.grid[row][col] = num;
        if (num !== 0 && this.solution[row]?.[col] !== undefined) {
            if (num !== this.solution[row][col]) { if (old === 0 || old === this.solution[row][col]) this.errors++; }
            else { if (old !== 0 && old !== this.solution[row][col]) this.errors = Math.max(0, this.errors - 1); }
            const el = document.getElementById('sudokuErrors');
            if (el) el.textContent = this.errors;
        }
        this._updateDisplay();
        this._updateCounts();
        this._checkCompletion();
    }

    handleKeyPress(e) {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
        if (!this.selectedCell) return;
        if (e.key >= '1' && e.key <= '9') this.inputNumber(parseInt(e.key));
        else if (e.key === 'Backspace' || e.key === 'Delete') this.inputNumber(0);
    }

    _updateDisplay() {
        if (!this.grid.length) return;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (!cell) continue;
                const v = this.grid[i]?.[j] || 0;
                cell.textContent = v || '';
                cell.classList.remove('selected', 'error', 'fixed');
                if (this.selectedCell?.row === i && this.selectedCell?.col === j) cell.classList.add('selected');
                if (v && this.solution[i]?.[j] !== undefined && v !== this.solution[i][j]) cell.classList.add('error');
                if (this.original[i]?.[j]) cell.classList.add('fixed');
            }
        }
    }

    _updateCounts() {
        const counts = {};
        for (let i = 1; i <= 9; i++) counts[i] = 0;
        for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const v = this.grid[i]?.[j]; if (v >= 1 && v <= 9) counts[v]++; }
        for (let n = 1; n <= 9; n++) {
            const rem = 9 - counts[n];
            const ce = document.getElementById(`numCount${n}`);
            const be = document.getElementById(`numBtn${n}`);
            if (ce) { ce.textContent = rem; ce.style.display = rem === 0 ? 'none' : ''; }
            if (be) { be.disabled = rem === 0; be.style.opacity = rem === 0 ? '0.5' : '1'; }
        }
    }

    _checkCompletion() {
        let filled = 0;
        for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (this.grid[i]?.[j]) filled++;
        const el = document.getElementById('sudokuCompleted');
        if (el) el.textContent = filled;
        if (filled === 81) this._verify();
    }

    _verify() {
        const ok = this.grid.every((row, i) => row.every((v, j) => v === this.solution[i][j]));
        if (ok) {
            const msg = document.getElementById('completionMessage');
            if (msg) { msg.style.display = 'block'; msg.style.background = '#2ecc71'; msg.innerHTML = '🎉 Puzzle Solved!'; setTimeout(() => msg.style.display = 'none', 5000); }
            const wins = (storage.get('sudoku-wins') || 0) + 1;
            storage.set('sudoku-wins', wins);
            notifyScoreUpdate();
        }
    }

    checkSolution() {
        let filled = 0, ok = true;
        for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { if (this.grid[i]?.[j]) filled++; if (this.grid[i]?.[j] !== this.solution[i]?.[j]) ok = false; }
        const msg = document.getElementById('completionMessage');
        if (!msg) return;
        if (ok && filled === 81) { this._verify(); return; }
        msg.style.display = 'block';
        msg.style.background = ok ? '#3498db' : '#e74c3c';
        msg.innerHTML = ok ? 'All correct so far! Keep going!' : 'There are errors. Keep trying!';
        setTimeout(() => { msg.style.display = 'none'; msg.style.background = '#2ecc71'; }, 3000);
    }

    reset() {
        const msg = document.getElementById('completionMessage');
        if (msg) msg.style.display = 'none';
        this._generatePuzzle();
        if (this.grid.length) { this._renderGrid(); this._updateDisplay(); this._updateCounts(); }
    }

    cleanup() { window.removeEventListener('keydown', this.keyHandler); }
}
