import { storage, notifyScoreUpdate } from '../core/storage.js';

const WORDS = ['javascript','computer','keyboard','algorithm','programming','developer',
    'function','variable','database','network','framework','library','application',
    'software','hardware','python','react','angular','nodejs','typescript','html','css',
    'docker','github','api','rest','graphql','json','xml','server','client','frontend',
    'backend','fullstack','devops','agile','testing','debugging','security','encryption',
    'interface','component','module','package','deployment','production','configuration',
    'documentation','repository','branch','commit','merge','closure','scope','prototype',
    'inheritance','polymorphism','encapsulation','abstraction','promise','async','await',
    'generator','iterator','callback','event','stream','cache','buffer','performance'];

export default class TypingGame {
    constructor() {
        this.currentWord = '';
        this.score = 0;
        this.timeLeft = 60;
        this.gameStarted = false;
        this.gameOver = false;
        this.correctWords = 0;
        this.wpm = 0;
        this.totalChars = 0;
        this.correctChars = 0;
        this.startTime = null;
        this.setupUI();
        this._nextWord();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Typing Speed</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="typingScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="typingTime">60</div></div>
                <div class="score-display"><div class="score-label">WPM</div><div class="score-value" id="typingWPM">0</div></div>
            </div>
            <div class="typing-game-container">
                <div class="word-display" id="wordDisplay">Press Start</div>
                <input type="text" class="typing-input" id="typingInput" placeholder="Type here..." disabled autocomplete="off" spellcheck="false">
                <div class="typing-stats">
                    <div>Correct: <span id="correctWords">0</span></div>
                    <div>Accuracy: <span id="accuracy">100</span>%</div>
                </div>
                <div class="game-controls">
                    <button class="btn" id="typingStartBtn">Start</button>
                    <button class="btn" id="typingResetBtn">Reset</button>
                </div>
            </div>
        `;
        this.inputEl = document.getElementById('typingInput');
        this.inputEl.addEventListener('input', () => this._handleInput());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this._checkWord(); }
        });
        document.getElementById('typingStartBtn').addEventListener('click', () => this.start());
        document.getElementById('typingResetBtn').addEventListener('click', () => this.reset());
    }

    _nextWord() {
        this.currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        const el = document.getElementById('wordDisplay');
        if (el) el.textContent = this.currentWord;
        if (this.inputEl) { this.inputEl.value = ''; if (this.gameStarted) this.inputEl.focus(); }
    }

    _handleInput() {
        if (!this.gameStarted || this.gameOver) return;
        const prev = this.inputEl.value.slice(0, -1);
        const cur = this.inputEl.value;
        if (cur.length > prev.length) {
            this.totalChars++;
            const li = cur.length - 1;
            if (li < this.currentWord.length && cur[li] === this.currentWord[li]) this.correctChars++;
        }
        const el = document.getElementById('wordDisplay');
        if (!el) return;
        el.innerHTML = '';
        for (let i = 0; i < this.currentWord.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentWord[i];
            if (i < cur.length) span.className = cur[i] === this.currentWord[i] ? 'correct' : 'incorrect';
            el.appendChild(span);
        }
        this._updateStats();
    }

    _checkWord() {
        if (!this.inputEl.value) return;
        if (this.inputEl.value.trim() === this.currentWord) {
            this.score += this.currentWord.length * 10;
            this.correctWords++;
            document.getElementById('correctWords').textContent = this.correctWords;
            this._nextWord();
        }
    }

    _updateStats() {
        if (this.startTime && this.timeLeft < 60) {
            const elapsed = (60 - this.timeLeft) / 60;
            if (elapsed > 0) {
                this.wpm = Math.round((this.correctWords / elapsed) * 60);
                document.getElementById('typingWPM').textContent = this.wpm;
            }
        }
        if (this.totalChars > 0) {
            document.getElementById('accuracy').textContent = Math.min(100, Math.round((this.correctChars / this.totalChars) * 100));
        }
        document.getElementById('typingScore').textContent = this.score;
    }

    start() {
        this.gameStarted = true;
        this.gameOver = false;
        this.totalChars = 0; this.correctChars = 0;
        this.startTime = Date.now();
        this.inputEl.disabled = false;
        setTimeout(() => this.inputEl.focus(), 100);
        document.getElementById('typingStartBtn').disabled = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('typingTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._endGame();
            else this._updateStats();
        }, 1000);
        this._nextWord();
    }

    _endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        clearInterval(this.timer);
        this.inputEl.disabled = true;
        document.getElementById('typingStartBtn').disabled = false;
        const best = storage.get('typing-high') || 0;
        if (this.score > best) { storage.set('typing-high', this.score); notifyScoreUpdate(); }
        const container = document.querySelector('.typing-game-container');
        if (container && !container.querySelector('.typing-game-over')) {
            const el = document.createElement('div');
            el.className = 'typing-game-over';
            el.innerHTML = `<h3>Time's Up!</h3>
                <p>Score: ${this.score}</p>
                <p>WPM: ${this.wpm}</p>
                <p>Words: ${this.correctWords}</p>
                <p>Accuracy: ${this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 0}%</p>`;
            container.appendChild(el);
        }
    }

    reset() {
        clearInterval(this.timer);
        this.score = 0; this.timeLeft = 60; this.gameStarted = false; this.gameOver = false;
        this.correctWords = 0; this.wpm = 0; this.totalChars = 0; this.correctChars = 0;
        this.inputEl.disabled = true; this.inputEl.value = '';
        document.getElementById('typingStartBtn').disabled = false;
        document.getElementById('typingScore').textContent = '0';
        document.getElementById('typingTime').textContent = '60';
        document.getElementById('typingWPM').textContent = '0';
        document.getElementById('correctWords').textContent = '0';
        document.getElementById('accuracy').textContent = '100';
        document.querySelector('.typing-game-over')?.remove();
        this._nextWord();
    }

    cleanup() { clearInterval(this.timer); }
}
