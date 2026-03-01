import { storage, notifyScoreUpdate } from '../core/storage.js';

const WORDS = [
    'CRANE', 'SLATE', 'TRACE', 'STORE', 'SHORE', 'BLEND', 'CRISP', 'FLINT', 'GROAN', 'PLUMB',
    'BRAVE', 'CHIME', 'DRINK', 'EMBER', 'FROST', 'GLIDE', 'HANDY', 'INGOT', 'JOUST', 'KNACK',
    'LAPEL', 'MIRTH', 'NYMPH', 'OCHRE', 'PERCH', 'QUILL', 'RIVET', 'SCORN', 'TROVE', 'USURP',
    'VAPOR', 'WHELP', 'XYLEM', 'YEARN', 'ZEBRA', 'ANVIL', 'BRISK', 'CLAMP', 'DINGY', 'EPOCH',
    'FLAIR', 'GRAFT', 'HEIST', 'INEPT', 'JOIST', 'KNELT', 'LUNGE', 'MARSH', 'NOTCH', 'OPTIC',
    'PRAWN', 'QUIRK', 'RHYME', 'SMELT', 'THUMP', 'UNWED', 'VERGE', 'WHISK', 'EXPEL', 'YACHT',
    'ZILCH', 'ABBOT', 'BLUNT', 'COMET', 'DROIT', 'EASEL', 'FLUKE', 'GRIPE', 'HUTCH', 'IMPLY',
    'JIVED', 'KIOSK', 'LIBEL', 'MOULT', 'NADIR', 'OUNCE', 'PIXEL', 'QUERY', 'RELIC', 'SNORE',
    'TAUNT', 'UMBRA', 'VYING', 'WRUNG', 'EXPAT', 'YOUNG', 'ZONAL', 'ADEPT', 'BASIL', 'CIVIC',
    'DENIM', 'ELBOW', 'FUDGE', 'GUILE', 'HORDE', 'IRKED', 'JELLY', 'KITTY', 'LUSTY', 'MINER'
];

export default class WordGuessGame {
    constructor() {
        this.maxGuesses = 6;
        this.wordLength = 5;
        this.word = '';
        this.guesses = [];
        this.currentGuess = '';
        this.gameOver = false;
        this.gameWon = false;
        this.wins = storage.get('wordguess-wins') || 0;
        this.setupUI();
        this.newGame();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Word Guess</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Wins</div><div class="score-value" id="wgWins">${this.wins}</div></div>
                <div class="score-display"><div class="score-label">Guesses</div><div class="score-value" id="wgGuessCount">0/6</div></div>
            </div>
            <div class="wordguess-container">
                <div class="wordguess-grid" id="wgGrid"></div>
                <div class="wordguess-message" id="wgMessage"></div>
                <div class="wordguess-keyboard" id="wgKeyboard"></div>
                <div class="game-controls">
                    <button class="btn" id="wgNew">New Word</button>
                </div>
                <div class="game-instructions">Type a 5-letter word and press Enter</div>
            </div>
        `;
        document.getElementById('wgNew').addEventListener('click', () => this.newGame());
        this._buildKeyboard();
        this.keyHandler = (e) => this._handleKey(e.key);
        window.addEventListener('keydown', this.keyHandler);
    }

    newGame() {
        this.word = WORDS[Math.floor(Math.random() * WORDS.length)];
        this.guesses = [];
        this.currentGuess = '';
        this.gameOver = false;
        this.gameWon = false;
        this._showMessage('');
        this._resetKeyboard();
        this._renderGrid();
        this._updateGuessCount();
    }

    _buildKeyboard() {
        const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
        const kb = document.getElementById('wgKeyboard');
        if (!kb) return;
        kb.innerHTML = '';
        rows.forEach((row, i) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'wg-key-row';
            if (i === 2) {
                const enter = document.createElement('button');
                enter.className = 'wg-key wg-key-wide';
                enter.textContent = 'Enter';
                enter.addEventListener('click', () => this._handleKey('Enter'));
                rowEl.appendChild(enter);
            }
            for (const ch of row) {
                const key = document.createElement('button');
                key.className = 'wg-key';
                key.id = `wgKey-${ch}`;
                key.textContent = ch;
                key.addEventListener('click', () => this._handleKey(ch));
                rowEl.appendChild(key);
            }
            if (i === 2) {
                const del = document.createElement('button');
                del.className = 'wg-key wg-key-wide';
                del.textContent = '⌫';
                del.addEventListener('click', () => this._handleKey('Backspace'));
                rowEl.appendChild(del);
            }
            kb.appendChild(rowEl);
        });
    }

    _resetKeyboard() {
        document.querySelectorAll('.wg-key[id^="wgKey-"]').forEach(k => {
            k.className = 'wg-key';
        });
    }

    _handleKey(key) {
        if (this.gameOver || this.gameWon) return;
        if (key === 'Enter') {
            this._submitGuess();
        } else if (key === 'Backspace' || key === 'Delete') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this._renderGrid();
        } else if (/^[a-zA-Z]$/.test(key) && this.currentGuess.length < this.wordLength) {
            this.currentGuess += key.toUpperCase();
            this._renderGrid();
        }
    }

    _submitGuess() {
        if (this.currentGuess.length < this.wordLength) {
            this._showMessage('Not enough letters!');
            setTimeout(() => this._showMessage(''), 1500);
            return;
        }
        const result = this._evaluate(this.currentGuess);
        this.guesses.push({ word: this.currentGuess, result });
        this._updateKeyboard(this.currentGuess, result);
        this.currentGuess = '';
        this._renderGrid();
        this._updateGuessCount();

        if (result.every(r => r === 'correct')) {
            this.gameWon = true;
            this.gameOver = true;
            this.wins++;
            storage.set('wordguess-wins', this.wins);
            notifyScoreUpdate();
            document.getElementById('wgWins').textContent = this.wins;
            this._showMessage('Excellent! You got it!');
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this._showMessage(`The word was ${this.word}`);
        }
    }

    _evaluate(guess) {
        const result = Array(this.wordLength).fill('absent');
        const wordArr = this.word.split('');
        const guessArr = guess.split('');
        const used = Array(this.wordLength).fill(false);
        for (let i = 0; i < this.wordLength; i++) {
            if (guessArr[i] === wordArr[i]) { result[i] = 'correct'; used[i] = true; }
        }
        for (let i = 0; i < this.wordLength; i++) {
            if (result[i] === 'correct') continue;
            for (let j = 0; j < this.wordLength; j++) {
                if (!used[j] && guessArr[i] === wordArr[j]) {
                    result[i] = 'present'; used[j] = true; break;
                }
            }
        }
        return result;
    }

    _updateKeyboard(guess, result) {
        const priority = { correct: 3, present: 2, absent: 1 };
        guess.split('').forEach((ch, i) => {
            const el = document.getElementById(`wgKey-${ch}`);
            if (!el) return;
            const cur = el.dataset.state;
            if (!cur || priority[result[i]] > (priority[cur] || 0)) {
                el.dataset.state = result[i];
                el.className = `wg-key wg-${result[i]}`;
            }
        });
    }

    _renderGrid() {
        const grid = document.getElementById('wgGrid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let r = 0; r < this.maxGuesses; r++) {
            const row = document.createElement('div');
            row.className = 'wg-row';
            const guess = this.guesses[r];
            for (let c = 0; c < this.wordLength; c++) {
                const cell = document.createElement('div');
                cell.className = 'wg-cell';
                if (guess) {
                    cell.textContent = guess.word[c];
                    cell.classList.add(`wg-${guess.result[c]}`);
                } else if (r === this.guesses.length) {
                    cell.textContent = this.currentGuess[c] || '';
                    if (this.currentGuess[c]) cell.classList.add('wg-typing');
                }
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }
    }

    _updateGuessCount() {
        const el = document.getElementById('wgGuessCount');
        if (el) el.textContent = `${this.guesses.length}/6`;
    }

    _showMessage(msg) {
        const el = document.getElementById('wgMessage');
        if (el) el.textContent = msg;
    }

    cleanup() { window.removeEventListener('keydown', this.keyHandler); }
}
