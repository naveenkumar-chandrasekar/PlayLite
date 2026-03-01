import { storage, notifyScoreUpdate } from '../core/storage.js';

const COLORS = ['#3498db','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#e91e63'];

export default class BubblePopGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.spawnTimer = null;
        this.bubbles = [];
        this.bubbleId = 0;
        this.best = storage.get('bubblepop-best') || 0;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Bubble Pop</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="bpScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="bpTime">30</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="bpBest">${this.best}</div></div>
            </div>
            <div class="bubblepop-container">
                <div class="bubblepop-arena" id="bpArena"></div>
                <div class="game-controls">
                    <button class="btn" id="bpStart">Start</button>
                    <button class="btn" id="bpReset">Reset</button>
                </div>
                <div class="game-instructions">Pop the bubbles before they float away!</div>
            </div>
        `;
        document.getElementById('bpStart').addEventListener('click', () => this.start());
        document.getElementById('bpReset').addEventListener('click', () => this.reset());
    }

    start() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.timeLeft = 30;
        this.bubbles = [];
        this.bubbleId = 0;
        document.getElementById('bpStart').disabled = true;
        document.getElementById('bpScore').textContent = '0';
        document.getElementById('bpTime').textContent = '30';
        const arena = document.getElementById('bpArena');
        if (arena) arena.innerHTML = '';

        this.timer = setInterval(() => {
            this.timeLeft--;
            const t = document.getElementById('bpTime');
            if (t) t.textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);

        this._spawnBubble();
    }

    _spawnBubble() {
        if (!this.gameStarted || this.gameOver) return;
        this._addBubble();
        const delay = Math.max(400, 1200 - this.score * 20);
        this.spawnTimer = setTimeout(() => this._spawnBubble(), delay);
    }

    _addBubble() {
        const arena = document.getElementById('bpArena');
        if (!arena) return;
        const size = Math.floor(Math.random() * 40) + 30;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const id = this.bubbleId++;
        const maxX = arena.offsetWidth - size - 10;
        const x = Math.floor(Math.random() * maxX) + 5;
        const lifetime = Math.max(1500, 3500 - this.score * 30);

        const bubble = document.createElement('div');
        bubble.className = 'bp-bubble';
        bubble.id = `bp-${id}`;
        bubble.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;bottom:-${size}px;animation:bpFloat ${lifetime}ms linear forwards;`;
        bubble.addEventListener('click', () => this._pop(id, bubble));
        arena.appendChild(bubble);

        const entry = { id, el: bubble };
        this.bubbles.push(entry);

        setTimeout(() => {
            if (!this.gameOver) bubble.remove();
            this.bubbles = this.bubbles.filter(b => b.id !== id);
        }, lifetime);
    }

    _pop(id, el) {
        if (!this.gameStarted || this.gameOver) return;
        el.classList.add('bp-pop');
        setTimeout(() => el.remove(), 200);
        this.bubbles = this.bubbles.filter(b => b.id !== id);
        this.score++;
        const s = document.getElementById('bpScore');
        if (s) s.textContent = this.score;
    }

    _end() {
        this.gameOver = true;
        this.gameStarted = false;
        clearInterval(this.timer);
        clearTimeout(this.spawnTimer);
        const arena = document.getElementById('bpArena');
        if (arena) arena.innerHTML = '';
        document.getElementById('bpStart').disabled = false;
        if (this.score > this.best) {
            this.best = this.score;
            storage.set('bubblepop-best', this.best);
            notifyScoreUpdate();
            const b = document.getElementById('bpBest');
            if (b) b.textContent = this.best;
        }
    }

    reset() {
        clearInterval(this.timer);
        clearTimeout(this.spawnTimer);
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.timeLeft = 30;
        this.bubbles = [];
        document.getElementById('bpScore').textContent = '0';
        document.getElementById('bpTime').textContent = '30';
        document.getElementById('bpStart').disabled = false;
        const arena = document.getElementById('bpArena');
        if (arena) arena.innerHTML = '';
    }

    cleanup() {
        clearInterval(this.timer);
        clearTimeout(this.spawnTimer);
    }
}
