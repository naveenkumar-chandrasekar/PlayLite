import { storage, notifyScoreUpdate } from '../core/storage.js';

const WORD_HINTS = {
    JAVASCRIPT:'A programming language for the web',COMPUTER:'Electronic data processor',
    KEYBOARD:'Input device with keys',ALGORITHM:'Problem-solving instructions',
    PROGRAMMING:'Writing code for computers',DEVELOPER:'Software creator',
    FUNCTION:'Reusable code block',VARIABLE:'Data container',
    DATABASE:'Organized data collection',NETWORK:'Connected computers system',
    FRAMEWORK:'Application development platform',LIBRARY:'Pre-written code collection',
    APPLICATION:'Software for users',SOFTWARE:'Programs and data',
    HARDWARE:'Physical computer parts',BROWSER:'Website viewing program',
    INTERNET:'Global computer network',WEBSITE:'Web pages collection',
    SECURITY:'Protection against threats',ENCRYPTION:'Information encoding process'
};

export default class HangmanGame {
    constructor() {
        this.words = Object.keys(WORD_HINTS);
        this.word = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrong = 6;
        this.gameOver = false;
        this.setupUI();
        this.newGame();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Hangman</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Wrong</div><div class="score-value" id="hangmanWrong">0/${this.maxWrong}</div></div>
                <div class="score-display"><div class="score-label">Wins</div><div class="score-value" id="hangmanWins">${storage.get('hangman-wins') || 0}</div></div>
            </div>
            <div class="hangman-game">
                <div class="hangman-display" id="hangmanDisplay">🎮</div>
                <div class="word-display-hangman" id="wordDisplay"></div>
                <div id="hintDisplay" style="text-align:center;margin:15px 0;padding:15px;min-height:50px;color:#667eea;font-style:italic;font-size:1.1rem;background:#f0f4ff;border-radius:8px;border:2px solid #667eea;"></div>
                <div class="keyboard" id="keyboard"></div>
                <div class="game-controls">
                    <button class="btn" id="hintBtn">💡 Hint</button>
                    <button class="btn" id="newWordBtn">New Word</button>
                </div>
            </div>
        `;
        this._createKeyboard();
        document.getElementById('hintBtn').addEventListener('click', () => this._showHint());
        document.getElementById('newWordBtn').addEventListener('click', () => this.newGame());
    }

    _createKeyboard() {
        const kb = document.getElementById('keyboard');
        kb.innerHTML = '';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.textContent = letter;
            btn.addEventListener('click', () => this.guessLetter(letter));
            kb.appendChild(btn);
        });
    }

    newGame() {
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameOver = false;
        document.querySelectorAll('.letter-btn').forEach(b => {
            b.disabled = false; b.classList.remove('guessed', 'wrong');
        });
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) { hintBtn.disabled = false; hintBtn.textContent = '💡 Hint'; }
        const hintEl = document.getElementById('hintDisplay');
        if (hintEl) { hintEl.innerHTML = ''; }
        this._updateDisplay();
    }

    guessLetter(letter) {
        if (this.gameOver || this.guessedLetters.includes(letter)) return;
        this.guessedLetters.push(letter);
        const btn = [...document.querySelectorAll('.letter-btn')].find(b => b.textContent === letter);
        if (!this.word.includes(letter)) {
            this.wrongGuesses++;
            if (btn) { btn.classList.add('wrong'); btn.disabled = true; }
        } else {
            if (btn) { btn.classList.add('guessed'); btn.disabled = true; }
        }
        this._updateDisplay();
    }

    _updateDisplay() {
        const display = document.getElementById('wordDisplay');
        if (!display) return;
        display.innerHTML = '';
        const parts = ['🎮','😊','😐','😟','😢','💀','☠️'];
        const hangmanEl = document.getElementById('hangmanDisplay');
        if (hangmanEl) hangmanEl.textContent = parts[this.wrongGuesses];
        const wrongEl = document.getElementById('hangmanWrong');
        if (wrongEl) wrongEl.textContent = `${this.wrongGuesses}/${this.maxWrong}`;
        let won = true;
        this.word.split('').forEach(letter => {
            const span = document.createElement('span');
            if (this.guessedLetters.includes(letter)) { span.textContent = letter; span.className = 'revealed'; }
            else { span.textContent = '_'; won = false; }
            display.appendChild(span);
        });
        if (won) {
            this.gameOver = true;
            const wins = (storage.get('hangman-wins') || 0) + 1;
            storage.set('hangman-wins', wins);
            notifyScoreUpdate();
            document.getElementById('hangmanWins').textContent = wins;
            display.insertAdjacentHTML('afterbegin', `<div style="color:#2ecc71;font-size:1.5rem;">You Win! 🎉</div>`);
        } else if (this.wrongGuesses >= this.maxWrong) {
            this.gameOver = true;
            display.insertAdjacentHTML('afterbegin', `<div style="color:#e74c3c;font-size:1.2rem;">Word was: ${this.word}</div>`);
        }
    }

    _showHint() {
        const hint = WORD_HINTS[this.word];
        if (!hint) return;
        const el = document.getElementById('hintDisplay');
        if (el) el.innerHTML = `<strong>💡 Hint:</strong> ${hint}`;
        const btn = document.getElementById('hintBtn');
        if (btn) { btn.disabled = true; btn.textContent = '💡 Hint (Used)'; }
    }
}
