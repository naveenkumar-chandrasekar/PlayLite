import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class NBackGame {
    constructor() {
        this.n = 1;
        this.best = storage.get('nback-best') || 1;
        this.sequence = [];
        this.currentIdx = 0;
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.falseAlarms = 0;
        this.roundLength = 20 + 1;
        this.roundActive = false;
        this.matchWindow = false;
        this.showTimer = null;
        this.hideTimer = null;
        this.responded = false;
        this.currentPos = null;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">N-Back</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Level</div><div class="score-value" id="nbLevel">${this.n}-Back</div></div>
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="nbScore">0</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="nbBest">${this.best}-Back</div></div>
            </div>
            <div class="nback-container">
                <div class="nback-instruction" id="nbInstruction">Does this match the position from <strong>${this.n}</strong> step(s) ago?</div>
                <div class="nback-grid" id="nbGrid"></div>
                <div class="nback-stats" id="nbStats"></div>
                <div class="nback-controls">
                    <button class="btn nback-match-btn" id="nbMatch" disabled>Match!</button>
                </div>
                <div class="game-controls">
                    <button class="btn" id="nbStart">Start Round</button>
                    <button class="btn" id="nbReset">Reset</button>
                </div>
                <div class="game-instructions">Press "Match!" when the highlighted square matches its position from ${this.n} step(s) ago. Advance levels by achieving ≥80% accuracy.</div>
            </div>
        `;
        this._buildGrid();
        document.getElementById('nbStart').addEventListener('click', () => this._startRound());
        document.getElementById('nbReset').addEventListener('click', () => this.reset());
        document.getElementById('nbMatch').addEventListener('click', () => this._onMatch());
        document.addEventListener('keydown', this._keyHandler = (e) => {
            if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); this._onMatch(); }
        });
    }

    _buildGrid() {
        const grid = document.getElementById('nbGrid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'nback-cell';
            cell.id = `nbc-${i}`;
            grid.appendChild(cell);
        }
    }

    _startRound() {
        this.sequence = [];
        for (let i = 0; i < this.roundLength; i++) {
            const pos = Math.floor(Math.random() * 9);
            this.sequence.push(pos);
        }
        this.currentIdx = 0;
        this.hits = 0;
        this.misses = 0;
        this.falseAlarms = 0;
        this.score = 0;
        this.roundActive = true;
        document.getElementById('nbStart').disabled = true;
        document.getElementById('nbMatch').disabled = false;
        document.getElementById('nbStats').textContent = '';
        this._step();
    }

    _step() {
        if (this.currentIdx >= this.sequence.length) {
            this._endRound();
            return;
        }
        this.currentPos = this.sequence[this.currentIdx];
        this.responded = false;
        const isMatch = this.currentIdx >= this.n &&
            this.sequence[this.currentIdx] === this.sequence[this.currentIdx - this.n];
        this.matchWindow = isMatch;

        const cell = document.getElementById(`nbc-${this.currentPos}`);
        if (cell) cell.classList.add('active');

        this.hideTimer = setTimeout(() => {
            if (cell) cell.classList.remove('active');
            if (!this.responded && this.matchWindow) {
                this.misses++;
            }
            this.currentIdx++;
            this.showTimer = setTimeout(() => this._step(), 300);
        }, 600);
    }

    _onMatch() {
        if (!this.roundActive || !document.getElementById('nbMatch') || this.currentIdx === 0) return;
        if (this.responded) return;
        this.responded = true;
        if (this.matchWindow) {
            this.hits++;
            this.score++;
            document.getElementById('nbScore').textContent = this.score;
            const cell = document.getElementById(`nbc-${this.currentPos}`);
            if (cell) { cell.classList.add('hit'); setTimeout(() => cell.classList.remove('hit'), 200); }
        } else {
            this.falseAlarms++;
            const cell = document.getElementById(`nbc-${this.currentPos}`);
            if (cell) { cell.classList.add('false-alarm'); setTimeout(() => cell.classList.remove('false-alarm'), 200); }
        }
    }

    _endRound() {
        this.roundActive = false;
        clearTimeout(this.showTimer);
        clearTimeout(this.hideTimer);
        document.getElementById('nbStart').disabled = false;
        document.getElementById('nbMatch').disabled = true;

        const targets = this.sequence.filter((_, i) => i >= this.n && this.sequence[i] === this.sequence[i - this.n]).length;
        const accuracy = targets > 0 ? Math.round((this.hits / targets) * 100) : 100;
        const falseRate = this.falseAlarms;

        let msg = `Hits: ${this.hits}/${targets} (${accuracy}%) | False alarms: ${falseRate}`;
        const statsEl = document.getElementById('nbStats');
        if (statsEl) {
            statsEl.textContent = msg;
            if (accuracy >= 80 && falseRate <= 3) {
                this.n++;
                statsEl.textContent += ` → Level up! Now ${this.n}-Back`;
                if (this.n > this.best) {
                    this.best = this.n;
                    storage.set('nback-best', this.best);
                    notifyScoreUpdate();
                    document.getElementById('nbBest').textContent = this.best + '-Back';
                }
                document.getElementById('nbLevel').textContent = this.n + '-Back';
                document.getElementById('nbInstruction').innerHTML = `Does this match the position from <strong>${this.n}</strong> step(s) ago?`;
            } else if (accuracy < 50 && this.n > 1) {
                this.n--;
                statsEl.textContent += ` → Level down. Back to ${this.n}-Back`;
                document.getElementById('nbLevel').textContent = this.n + '-Back';
                document.getElementById('nbInstruction').innerHTML = `Does this match the position from <strong>${this.n}</strong> step(s) ago?`;
            }
        }
    }

    reset() {
        clearTimeout(this.showTimer);
        clearTimeout(this.hideTimer);
        this.roundActive = false;
        this.n = 1;
        this.sequence = [];
        this.score = 0;
        this._buildGrid();
        document.getElementById('nbLevel').textContent = '1-Back';
        document.getElementById('nbScore').textContent = '0';
        document.getElementById('nbInstruction').innerHTML = 'Does this match the position from <strong>1</strong> step(s) ago?';
        document.getElementById('nbStats').textContent = '';
        document.getElementById('nbStart').disabled = false;
        document.getElementById('nbMatch').disabled = true;
    }

    cleanup() {
        clearTimeout(this.showTimer);
        clearTimeout(this.hideTimer);
        document.removeEventListener('keydown', this._keyHandler);
    }
}
