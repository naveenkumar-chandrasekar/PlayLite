import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class SimonGame {
    constructor() {
        this.sequence = [];
        this.userSeq = [];
        this.level = 1;
        this.gameStarted = false;
        this.gameOver = false;
        this.colors = ['red', 'green', 'blue', 'yellow'];
        this.setupUI();
    }

    setupUI() {
        const best = storage.get('simon-best') || 0;
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Simon Says</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Level</div><div class="score-value" id="simonLevel">1</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="simonBest">${best}</div></div>
            </div>
            <div class="game-instructions" id="simonStatus">Click Start to begin!</div>
            <div class="simon-game">
                <div class="simon-board">
                    <div class="simon-button red" data-color="red"></div>
                    <div class="simon-button green" data-color="green"></div>
                    <div class="simon-button blue" data-color="blue"></div>
                    <div class="simon-button yellow" data-color="yellow"></div>
                </div>
                <div class="game-controls">
                    <button class="btn" id="simonStartBtn">Start</button>
                    <button class="btn" id="simonResetBtn">Reset</button>
                </div>
            </div>
        `;
        document.querySelectorAll('.simon-button').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameStarted || this.gameOver) return;
                this._handleClick(btn.dataset.color);
            });
        });
        document.getElementById('simonStartBtn').addEventListener('click', () => this.start());
        document.getElementById('simonResetBtn').addEventListener('click', () => this.reset());
    }

    start() {
        this.gameStarted = true;
        this.gameOver = false;
        this.level = 1;
        this.sequence = [];
        this.userSeq = [];
        document.getElementById('simonStartBtn').disabled = true;
        document.getElementById('simonStatus').textContent = 'Watch the sequence...';
        this._nextLevel();
    }

    _nextLevel() {
        this.sequence.push(this.colors[Math.floor(Math.random() * 4)]);
        this.userSeq = [];
        document.getElementById('simonLevel').textContent = this.level;
        this._playSequence();
    }

    async _playSequence() {
        for (const color of this.sequence) {
            await this._flash(color, 500);
            await this._delay(200);
        }
        document.getElementById('simonStatus').textContent = 'Your turn!';
    }

    _flash(color, ms) {
        return new Promise(resolve => {
            const btn = document.querySelector(`.simon-button[data-color="${color}"]`);
            btn.classList.add('active');
            setTimeout(() => { btn.classList.remove('active'); resolve(); }, ms);
        });
    }

    _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    _handleClick(color) {
        if (this.userSeq.length >= this.sequence.length) return;
        this._flash(color, 200);
        this.userSeq.push(color);
        if (this.userSeq[this.userSeq.length - 1] !== this.sequence[this.userSeq.length - 1]) {
            this.gameOver = true;
            document.getElementById('simonStatus').textContent = 'Wrong! Game Over!';
            document.getElementById('simonStartBtn').disabled = false;
            const best = storage.get('simon-best') || 0;
            if (this.level - 1 > best) { storage.set('simon-best', this.level - 1); notifyScoreUpdate(); document.getElementById('simonBest').textContent = this.level - 1; }
            return;
        }
        if (this.userSeq.length === this.sequence.length) {
            this.level++;
            document.getElementById('simonStatus').textContent = 'Correct! Next level...';
            setTimeout(() => this._nextLevel(), 1000);
        }
    }

    reset() {
        this.gameStarted = false; this.gameOver = false; this.level = 1;
        this.sequence = []; this.userSeq = [];
        document.getElementById('simonLevel').textContent = '1';
        document.getElementById('simonStatus').textContent = 'Click Start to begin!';
        document.getElementById('simonStartBtn').disabled = false;
        document.querySelectorAll('.simon-button').forEach(b => b.classList.remove('active'));
    }
}
