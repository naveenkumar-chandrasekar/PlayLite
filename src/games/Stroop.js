import { storage, notifyScoreUpdate } from '../core/storage.js';

const COLORS = [
    { name: 'RED',    hex: '#e74c3c' },
    { name: 'BLUE',   hex: '#3498db' },
    { name: 'GREEN',  hex: '#2ecc71' },
    { name: 'YELLOW', hex: '#f1c40f' },
    { name: 'PURPLE', hex: '#9b59b6' },
    { name: 'ORANGE', hex: '#e67e22' },
];

export default class StroopGame {
    constructor() {
        this.score = 0;
        this.wrong = 0;
        this.timeLeft = 60;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.wordColor = null;
        this.inkColor = null;
        this.best = storage.get('stroop-best') || 0;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Stroop Test</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="stroopScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="stroopTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="stroopBest">${this.best}</div></div>
            </div>
            <div class="stroop-container">
                <div class="stroop-instruction">Click the <strong>INK COLOR</strong> of the word below</div>
                <div class="stroop-word" id="stroopWord">READY</div>
                <div class="stroop-options" id="stroopOptions"></div>
                <div class="game-controls">
                    <button class="btn" id="stroopStart">Start</button>
                    <button class="btn" id="stroopReset">Reset</button>
                </div>
            </div>
        `;
        this._buildOptions();
        document.getElementById('stroopStart').addEventListener('click', () => this.start());
        document.getElementById('stroopReset').addEventListener('click', () => this.reset());
    }

    _buildOptions() {
        const el = document.getElementById('stroopOptions');
        if (!el) return;
        el.innerHTML = '';
        COLORS.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'stroop-btn';
            btn.style.background = c.hex;
            btn.textContent = c.name;
            btn.addEventListener('click', () => this._pick(c.name));
            el.appendChild(btn);
        });
    }

    _next() {
        const shuffle = [...COLORS].sort(() => Math.random() - 0.5);
        this.inkColor = shuffle[0];
        this.wordColor = shuffle[1] || shuffle[0];
        const el = document.getElementById('stroopWord');
        if (el) { el.textContent = this.wordColor.name; el.style.color = this.inkColor.hex; }
    }

    _pick(name) {
        if (!this.gameStarted || this.gameOver) return;
        if (name === this.inkColor.name) {
            this.score++;
            document.getElementById('stroopScore').textContent = this.score;
            const el = document.getElementById('stroopWord');
            if (el) { el.classList.add('stroop-correct'); setTimeout(() => el.classList.remove('stroop-correct'), 150); }
        } else {
            this.wrong++;
            const el = document.getElementById('stroopWord');
            if (el) { el.classList.add('stroop-wrong'); setTimeout(() => el.classList.remove('stroop-wrong'), 200); }
        }
        this._next();
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        this.score = 0; this.wrong = 0; this.timeLeft = 60;
        document.getElementById('stroopScore').textContent = '0';
        document.getElementById('stroopStart').disabled = true;
        this._next();
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('stroopTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);
    }

    _end() {
        this.gameOver = true; this.gameStarted = false;
        clearInterval(this.timer);
        document.getElementById('stroopStart').disabled = false;
        const el = document.getElementById('stroopWord');
        if (el) { el.textContent = `Done! ${this.score} correct`; el.style.color = '#667eea'; }
        if (this.score > this.best) {
            this.best = this.score;
            storage.set('stroop-best', this.best);
            notifyScoreUpdate();
            document.getElementById('stroopBest').textContent = this.best;
        }
    }

    reset() {
        clearInterval(this.timer);
        this.gameStarted = false; this.gameOver = false;
        this.score = 0; this.wrong = 0; this.timeLeft = 60;
        document.getElementById('stroopScore').textContent = '0';
        document.getElementById('stroopTime').textContent = '60';
        document.getElementById('stroopStart').disabled = false;
        const el = document.getElementById('stroopWord');
        if (el) { el.textContent = 'READY'; el.style.color = '#333'; }
    }

    cleanup() { clearInterval(this.timer); }
}
