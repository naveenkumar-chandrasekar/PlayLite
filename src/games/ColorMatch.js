import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class ColorMatchGame {
    constructor() {
        this.colors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
        this.targetColor = null;
        this.score = 0;
        this.timeLeft = 30;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.setupUI();
    }

    setupUI() {
        const best = storage.get('colormatch-best') || 0;
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Color Match</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="colorScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="colorTime">30</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="colorBest">${best}</div></div>
            </div>
            <div class="colormatch-game">
                <div class="colormatch-instruction">Match this color:</div>
                <div class="colormatch-target" id="colorTarget" style="background:#ccc;"></div>
                <div class="colormatch-options" id="colorOptions"></div>
                <div class="game-controls">
                    <button class="btn" id="colorStart">Start</button>
                    <button class="btn" id="colorReset">Reset</button>
                </div>
            </div>
        `;
        document.getElementById('colorStart').addEventListener('click', () => this.start());
        document.getElementById('colorReset').addEventListener('click', () => this.reset());
        this._generate();
    }

    _generate() {
        this.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const target = document.getElementById('colorTarget');
        if (target) target.style.backgroundColor = this.targetColor;
        const others = this.colors.filter(c => c !== this.targetColor);
        const opts = [this.targetColor, ...others.sort(() => Math.random() - 0.5).slice(0, 5)].sort(() => Math.random() - 0.5);
        const el = document.getElementById('colorOptions');
        if (!el) return;
        el.innerHTML = '';
        opts.forEach(color => {
            const btn = document.createElement('div');
            btn.className = 'colormatch-option';
            btn.style.cssText = `background:${color};cursor:pointer;`;
            btn.addEventListener('click', () => this._select(color));
            el.appendChild(btn);
        });
    }

    _select(color) {
        if (!this.gameStarted || this.gameOver) return;
        if (color === this.targetColor) { this.score++; document.getElementById('colorScore').textContent = this.score; this._generate(); }
        else {
            this.timeLeft = Math.max(0, this.timeLeft - 2);
            document.getElementById('colorTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        document.getElementById('colorStart').disabled = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('colorTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);
    }

    _end() {
        this.gameOver = true; this.gameStarted = false;
        clearInterval(this.timer);
        document.getElementById('colorStart').disabled = false;
        const best = storage.get('colormatch-best') || 0;
        if (this.score > best) { storage.set('colormatch-best', this.score); notifyScoreUpdate(); document.getElementById('colorBest').textContent = this.score; }
    }

    reset() {
        clearInterval(this.timer);
        this.score = 0; this.timeLeft = 30; this.gameStarted = false; this.gameOver = false;
        document.getElementById('colorScore').textContent = '0';
        document.getElementById('colorTime').textContent = '30';
        document.getElementById('colorStart').disabled = false;
        this._generate();
    }

    cleanup() { clearInterval(this.timer); }
}
