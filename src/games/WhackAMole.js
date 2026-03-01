import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.moleTimer = null;
        this.activeHole = -1;
        this.setupUI();
    }

    setupUI() {
        const best = storage.get('whackamole-best') || 0;
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Whack-a-Mole</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="whackScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="whackTime">30</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="whackBest">${best}</div></div>
            </div>
            <div class="whackamole-container">
                <div class="whackamole-board" id="whackBoard"></div>
                <div class="game-controls">
                    <button class="btn" id="whackStart">Start</button>
                    <button class="btn" id="whackReset">Reset</button>
                </div>
            </div>
        `;
        document.getElementById('whackStart').addEventListener('click', () => this.start());
        document.getElementById('whackReset').addEventListener('click', () => this.reset());
        this._renderBoard();
    }

    _renderBoard() {
        const board = document.getElementById('whackBoard');
        if (!board) return;
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.className = 'whack-hole';
            hole.dataset.index = i;
            const mole = document.createElement('div');
            mole.className = 'whack-mole';
            hole.appendChild(mole);
            hole.addEventListener('click', () => this._whack(i));
            board.appendChild(hole);
        }
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        document.getElementById('whackStart').disabled = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('whackTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);
        this._showMole();
    }

    _showMole() {
        if (!this.gameStarted || this.gameOver) return;
        document.querySelectorAll('.whack-hole').forEach(h => h.classList.remove('active'));
        this.activeHole = Math.floor(Math.random() * 9);
        document.querySelectorAll('.whack-hole')[this.activeHole]?.classList.add('active');
        this.moleTimer = setTimeout(() => {
            document.querySelectorAll('.whack-hole')[this.activeHole]?.classList.remove('active');
            this._showMole();
        }, Math.random() * 1500 + 800);
    }

    _whack(index) {
        if (!this.gameStarted || this.gameOver) return;
        const holes = document.querySelectorAll('.whack-hole');
        if (index === this.activeHole && holes[index].classList.contains('active')) {
            this.score++;
            document.getElementById('whackScore').textContent = this.score;
            holes[index].classList.remove('active');
            holes[index].classList.add('hit');
            setTimeout(() => holes[index].classList.remove('hit'), 200);
            clearTimeout(this.moleTimer);
            this._showMole();
        }
    }

    _end() {
        this.gameOver = true; this.gameStarted = false;
        clearInterval(this.timer); clearTimeout(this.moleTimer);
        document.getElementById('whackStart').disabled = false;
        document.querySelectorAll('.whack-hole').forEach(h => h.classList.remove('active'));
        const best = storage.get('whackamole-best') || 0;
        if (this.score > best) { storage.set('whackamole-best', this.score); notifyScoreUpdate(); document.getElementById('whackBest').textContent = this.score; }
    }

    reset() {
        clearInterval(this.timer); clearTimeout(this.moleTimer);
        this.score = 0; this.timeLeft = 30; this.gameStarted = false; this.gameOver = false; this.activeHole = -1;
        document.getElementById('whackScore').textContent = '0';
        document.getElementById('whackTime').textContent = '30';
        document.getElementById('whackStart').disabled = false;
        document.querySelectorAll('.whack-hole').forEach(h => h.classList.remove('active', 'hit'));
    }

    cleanup() { clearInterval(this.timer); clearTimeout(this.moleTimer); }
}
