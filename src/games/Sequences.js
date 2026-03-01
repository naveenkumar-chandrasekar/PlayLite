import { storage, notifyScoreUpdate } from '../core/storage.js';

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const GENERATORS = [
    () => { const s = rnd(1,15), d = rnd(2,12); return Array.from({length:5}, (_,i) => s + d*i); },
    () => { const s = rnd(1,6), r = rnd(2,4); return Array.from({length:5}, (_,i) => s * Math.pow(r,i)); },
    () => { const o = rnd(0,5); return Array.from({length:5}, (_,i) => Math.pow(i+1+o, 2)); },
    () => { const a = rnd(1,6), b = rnd(1,6); const seq=[a,b]; while(seq.length<5) seq.push(seq[seq.length-1]+seq[seq.length-2]); return seq; },
    () => { const s = rnd(2,20), d1 = rnd(3,10), d2 = rnd(-8,-2); const seq=[s]; for(let i=1;i<5;i++) seq.push(seq[i-1]+(i%2===1?d1:d2)); return seq; },
    () => { const s = rnd(1,10), d = rnd(2,8); return Array.from({length:5}, (_,i) => s + d*(i*(i+1)/2)); },
    () => { const s = rnd(50,200), d = rnd(5,25); return Array.from({length:5}, (_,i) => s - d*i); },
    () => { const o = rnd(1,4); return Array.from({length:5}, (_,i) => Math.pow(2, i+o)); },
];

function makeDistractors(answer, seq) {
    const d = new Set([answer]);
    const range = Math.max(5, Math.abs(answer * 0.4) | 0);
    let attempts = 0;
    while (d.size < 4 && attempts < 100) {
        const v = answer + rnd(-range, range);
        if (v !== answer && v > 0) d.add(v);
        attempts++;
    }
    while (d.size < 4) d.add(answer + d.size * 7);
    return [...d].sort(() => Math.random() - 0.5);
}

export default class SequencesGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.best = storage.get('sequences-best') || 0;
        this.streak = 0;
        this.answer = null;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Number Sequences</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="seqScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="seqTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="seqBest">${this.best}</div></div>
            </div>
            <div class="seq-container">
                <div class="seq-sequence" id="seqSequence">?, ?, ?, ?, ?</div>
                <div class="seq-question">What comes next?</div>
                <div class="seq-options" id="seqOptions"></div>
                <div class="seq-feedback" id="seqFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="seqStart">Start</button>
                    <button class="btn" id="seqReset">Reset</button>
                </div>
            </div>
        `;
        document.getElementById('seqStart').addEventListener('click', () => this.start());
        document.getElementById('seqReset').addEventListener('click', () => this.reset());
    }

    _next() {
        const gen = GENERATORS[Math.floor(Math.random() * GENERATORS.length)];
        const full = gen();
        const answer = full[4];
        this.answer = answer;
        const shown = full.slice(0, 4);
        document.getElementById('seqSequence').textContent = shown.join(', ') + ', ?';
        const opts = makeDistractors(answer, shown);
        const el = document.getElementById('seqOptions');
        el.innerHTML = '';
        opts.forEach(v => {
            const btn = document.createElement('button');
            btn.className = 'seq-opt-btn';
            btn.textContent = v;
            btn.addEventListener('click', () => this._pick(v, btn, opts));
            el.appendChild(btn);
        });
        document.getElementById('seqFeedback').textContent = '';
    }

    _pick(v, btn, opts) {
        if (!this.gameStarted || this.gameOver) return;
        const allBtns = document.querySelectorAll('.seq-opt-btn');
        allBtns.forEach(b => b.disabled = true);
        const fb = document.getElementById('seqFeedback');
        if (v === this.answer) {
            this.streak++;
            const bonus = Math.floor(this.streak / 3);
            const points = 1 + bonus;
            this.score += points;
            document.getElementById('seqScore').textContent = this.score;
            btn.classList.add('seq-correct');
            fb.textContent = bonus > 0 ? `+${points} (streak ×${this.streak})` : '✓ Correct!';
            fb.className = 'seq-feedback seq-fb-correct';
        } else {
            this.streak = 0;
            btn.classList.add('seq-wrong');
            allBtns.forEach(b => { if (parseInt(b.textContent) === this.answer) b.classList.add('seq-correct'); });
            fb.textContent = `✗ Answer was ${this.answer}`;
            fb.className = 'seq-feedback seq-fb-wrong';
        }
        setTimeout(() => this._next(), 900);
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        this.score = 0; this.timeLeft = 60; this.streak = 0;
        document.getElementById('seqScore').textContent = '0';
        document.getElementById('seqStart').disabled = true;
        this._next();
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('seqTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);
    }

    _end() {
        this.gameOver = true; this.gameStarted = false;
        clearInterval(this.timer);
        document.getElementById('seqStart').disabled = false;
        document.getElementById('seqSequence').textContent = "Time's up!";
        document.getElementById('seqOptions').innerHTML = '';
        document.getElementById('seqFeedback').textContent = `Final: ${this.score}`;
        if (this.score > this.best) {
            this.best = this.score;
            storage.set('sequences-best', this.best);
            notifyScoreUpdate();
            document.getElementById('seqBest').textContent = this.best;
        }
    }

    reset() {
        clearInterval(this.timer);
        this.gameStarted = false; this.gameOver = false;
        this.score = 0; this.timeLeft = 60; this.streak = 0;
        document.getElementById('seqScore').textContent = '0';
        document.getElementById('seqTime').textContent = '60';
        document.getElementById('seqStart').disabled = false;
        document.getElementById('seqSequence').textContent = '?, ?, ?, ?, ?';
        document.getElementById('seqOptions').innerHTML = '';
        document.getElementById('seqFeedback').textContent = '';
    }

    cleanup() { clearInterval(this.timer); }
}
