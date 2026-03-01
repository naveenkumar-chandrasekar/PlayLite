import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class MathGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.currentProblem = null;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.setupUI();
        this._generate();
    }

    setupUI() {
        const best = storage.get('math-best') || 0;
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Math Challenge</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="mathScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="mathTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="mathBest">${best}</div></div>
            </div>
            <div class="math-game">
                <div class="math-problem" id="mathProblem">2 + 2 = ?</div>
                <div class="math-options" id="mathOptions"></div>
                <div class="game-controls">
                    <button class="btn" id="mathStartBtn">Start</button>
                    <button class="btn" id="mathResetBtn">Reset</button>
                </div>
            </div>
        `;
        document.getElementById('mathStartBtn').addEventListener('click', () => this.start());
        document.getElementById('mathResetBtn').addEventListener('click', () => this.reset());
    }

    _generate() {
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * 3)];
        let n1, n2, ans;
        if (op === '+') { n1 = Math.floor(Math.random() * 50) + 1; n2 = Math.floor(Math.random() * 50) + 1; ans = n1 + n2; }
        else if (op === '-') { n1 = Math.floor(Math.random() * 50) + 25; n2 = Math.floor(Math.random() * n1); ans = n1 - n2; }
        else { n1 = Math.floor(Math.random() * 12) + 1; n2 = Math.floor(Math.random() * 12) + 1; ans = n1 * n2; }
        this.currentProblem = { ans };
        const wrongs = new Set();
        while (wrongs.size < 3) { const w = ans + Math.floor(Math.random() * 20) - 10; if (w !== ans && w > 0) wrongs.add(w); }
        const options = [ans, ...wrongs].sort(() => Math.random() - 0.5);
        document.getElementById('mathProblem').textContent = `${n1} ${op} ${n2} = ?`;
        const el = document.getElementById('mathOptions');
        el.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'math-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => this._check(opt));
            el.appendChild(btn);
        });
    }

    _check(selected) {
        if (!this.gameStarted || this.gameOver) return;
        if (selected === this.currentProblem.ans) { this.score++; document.getElementById('mathScore').textContent = this.score; this._generate(); }
        else { this.timeLeft = Math.max(0, this.timeLeft - 5); document.getElementById('mathTime').textContent = this.timeLeft; if (this.timeLeft <= 0) this._end(); }
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        document.getElementById('mathStartBtn').disabled = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('mathTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);
    }

    _end() {
        this.gameOver = true; this.gameStarted = false;
        clearInterval(this.timer);
        document.getElementById('mathStartBtn').disabled = false;
        document.getElementById('mathProblem').textContent = `Time's up! Score: ${this.score}`;
        const best = storage.get('math-best') || 0;
        if (this.score > best) { storage.set('math-best', this.score); notifyScoreUpdate(); document.getElementById('mathBest').textContent = this.score; }
    }

    reset() {
        clearInterval(this.timer);
        this.score = 0; this.timeLeft = 60; this.gameStarted = false; this.gameOver = false;
        document.getElementById('mathScore').textContent = '0';
        document.getElementById('mathTime').textContent = '60';
        document.getElementById('mathStartBtn').disabled = false;
        this._generate();
    }

    cleanup() { clearInterval(this.timer); }
}
