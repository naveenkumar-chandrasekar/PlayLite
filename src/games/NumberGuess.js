import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class NumberGuessGame {
    constructor() {
        this.target = 0;
        this.guesses = [];
        this.gameOver = false;
        this.best = storage.get('numberguess-best') || null;
        this.setupUI();
        this.newGame();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Number Guess</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Tries</div><div class="score-value" id="ngTries">0</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="ngBest">${this.best ? this.best + ' tries' : '--'}</div></div>
            </div>
            <div class="numberguess-container">
                <div class="ng-range">Guess a number between <strong>1</strong> and <strong>100</strong></div>
                <div class="ng-hint" id="ngHint">Make your first guess!</div>
                <div class="ng-input-row">
                    <input type="number" id="ngInput" class="ng-input" min="1" max="100" placeholder="1-100">
                    <button class="btn" id="ngGuess">Guess</button>
                </div>
                <div class="ng-history" id="ngHistory"></div>
                <div class="game-controls">
                    <button class="btn" id="ngNew">New Game</button>
                </div>
            </div>
        `;
        document.getElementById('ngGuess').addEventListener('click', () => this._makeGuess());
        document.getElementById('ngNew').addEventListener('click', () => this.newGame());
        document.getElementById('ngInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._makeGuess();
        });
    }

    newGame() {
        this.target = Math.floor(Math.random() * 100) + 1;
        this.guesses = [];
        this.gameOver = false;
        const input = document.getElementById('ngInput');
        if (input) { input.value = ''; input.disabled = false; }
        const guessBtn = document.getElementById('ngGuess');
        if (guessBtn) guessBtn.disabled = false;
        this._setHint('Make your first guess!', '');
        this._updateTries();
        const hist = document.getElementById('ngHistory');
        if (hist) hist.innerHTML = '';
    }

    _makeGuess() {
        if (this.gameOver) return;
        const input = document.getElementById('ngInput');
        const val = parseInt(input?.value);
        if (!val || val < 1 || val > 100) {
            this._setHint('Enter a number between 1 and 100!', 'error');
            return;
        }
        input.value = '';
        this.guesses.push(val);
        this._updateTries();
        this._addToHistory(val);

        if (val === this.target) {
            this.gameOver = true;
            input.disabled = true;
            document.getElementById('ngGuess').disabled = true;
            const tries = this.guesses.length;
            this._setHint(`Correct! The number was ${this.target}. You got it in ${tries} ${tries === 1 ? 'try' : 'tries'}!`, 'correct');
            if (this.best === null || tries < this.best) {
                this.best = tries;
                storage.set('numberguess-best', this.best);
                notifyScoreUpdate();
                const bestEl = document.getElementById('ngBest');
                if (bestEl) bestEl.textContent = this.best + ' tries';
            }
        } else {
            const diff = Math.abs(val - this.target);
            let hint, cls;
            if (diff <= 5) { hint = val < this.target ? 'Very hot! Go higher!' : 'Very hot! Go lower!'; cls = 'hot'; }
            else if (diff <= 15) { hint = val < this.target ? 'Warm! Go higher!' : 'Warm! Go lower!'; cls = 'warm'; }
            else if (diff <= 30) { hint = val < this.target ? 'Cool. Go higher.' : 'Cool. Go lower.'; cls = 'cool'; }
            else { hint = val < this.target ? 'Cold! Much higher.' : 'Cold! Much lower.'; cls = 'cold'; }
            this._setHint(hint, cls);
        }
    }

    _addToHistory(val) {
        const hist = document.getElementById('ngHistory');
        if (!hist) return;
        const item = document.createElement('div');
        item.className = 'ng-history-item';
        const diff = val - this.target;
        item.innerHTML = `<span class="ng-guess-val">${val}</span><span class="ng-arrow">${diff < 0 ? '▲' : diff > 0 ? '▼' : '✓'}</span>`;
        hist.insertBefore(item, hist.firstChild);
    }

    _setHint(msg, cls) {
        const el = document.getElementById('ngHint');
        if (!el) return;
        el.textContent = msg;
        el.className = `ng-hint ${cls ? 'ng-hint-' + cls : ''}`;
    }

    _updateTries() {
        const el = document.getElementById('ngTries');
        if (el) el.textContent = this.guesses.length;
    }

    cleanup() {}
}
