import { storage, notifyScoreUpdate } from '../core/storage.js';

const WORDS = [
    'PLANET','BRIDGE','CLOUDS','FROZEN','KNIGHT','GRAVEL','CACTUS','ANCHOR','BRONZE','CHROME',
    'DAGGER','EMPIRE','FAMINE','GLITCH','HAMLET','INJECT','JUNGLE','KINDLE','LOCKET','MAGNET',
    'NAPKIN','OYSTER','PEPPER','QUARTZ','ROCKET','SAFARI','TICKLE','URCHIN','VACUUM','WALNUT',
    'XYSTER','YOGURT','ZIPPER','ARMOUR','BLIGHT','COBBLE','DANGLE','ELBOW','FRIGHT','GOBLIN',
    'HELPER','IGNITE','JIGSAW','KETTLE','LINGER','MUFFIN','NOODLE','OOZING','PILLAR','QUIVER',
    'RIPPLE','SORROW','TANGLE','UNFURL','VORTEX','WANDER','YELLOW','ZOMBIE','ABRUPT','BLEACH',
    'CRAFTY','DWINDLE','FLOPPY','GRUMPY','HUMBLE','ICICLE','JUMBLE','KERNEL','LOFTY','MORTAL',
    'NARROW','OUTRUN','PARCEL','QUENCH','RUSTLE','SCORCH','THRIVE','UNRULY','VIOLET','WITHER',
    'CLENCH','DISMAL','EMBARK','FATHOM','GLUTEN','HURDLE','INSULT','JESTER','KNOTTY','LAVISH',
    'MENACE','NUZZLE','OUTLAW','PLUNGE','RAGGED','SPARSE','TOPPLE','UNVEIL','VANISH','WRITHE'
];

function scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    return result === word ? scramble(word) : result;
}

export default class WordScrambleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.currentWord = '';
        this.best = storage.get('wordscramble-best') || 0;
        this.usedWords = new Set();
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Word Scramble</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="wsScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="wsTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="wsBest">${this.best}</div></div>
            </div>
            <div class="wordscramble-container">
                <div class="ws-scrambled" id="wsScrambled">?????</div>
                <div class="ws-feedback" id="wsFeedback"></div>
                <div class="ws-input-row">
                    <input type="text" id="wsInput" class="ws-input" placeholder="Type the word..." autocomplete="off">
                    <button class="btn" id="wsSkip">Skip</button>
                </div>
                <div class="game-controls">
                    <button class="btn" id="wsStart">Start</button>
                    <button class="btn" id="wsReset">Reset</button>
                </div>
                <div class="game-instructions">Unscramble the letters to form a word</div>
            </div>
        `;
        document.getElementById('wsStart').addEventListener('click', () => this.start());
        document.getElementById('wsReset').addEventListener('click', () => this.reset());
        document.getElementById('wsSkip').addEventListener('click', () => this._skip());
        document.getElementById('wsInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._check();
        });
    }

    _nextWord() {
        const pool = WORDS.filter(w => !this.usedWords.has(w));
        if (pool.length === 0) this.usedWords.clear();
        this.currentWord = pool[Math.floor(Math.random() * pool.length)];
        this.usedWords.add(this.currentWord);
        document.getElementById('wsScrambled').textContent = scramble(this.currentWord);
        document.getElementById('wsInput').value = '';
        document.getElementById('wsFeedback').textContent = '';
        document.getElementById('wsInput').focus();
    }

    _check() {
        if (!this.gameStarted || this.gameOver) return;
        const input = document.getElementById('wsInput');
        const val = input.value.trim().toUpperCase();
        if (!val) return;
        if (val === this.currentWord) {
            this.score++;
            document.getElementById('wsScore').textContent = this.score;
            this._setFeedback('✓ Correct!', 'correct');
            setTimeout(() => this._nextWord(), 400);
        } else {
            this._setFeedback('✗ Try again!', 'wrong');
            input.value = '';
        }
    }

    _skip() {
        if (!this.gameStarted || this.gameOver) return;
        this._setFeedback(`Answer: ${this.currentWord}`, 'skip');
        setTimeout(() => this._nextWord(), 800);
    }

    _setFeedback(msg, type) {
        const el = document.getElementById('wsFeedback');
        if (el) { el.textContent = msg; el.className = `ws-feedback ws-feedback-${type}`; }
    }

    start() {
        this.gameStarted = true; this.gameOver = false;
        this.score = 0; this.timeLeft = 60; this.usedWords.clear();
        document.getElementById('wsScore').textContent = '0';
        document.getElementById('wsStart').disabled = true;
        this._nextWord();
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('wsTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this._end();
        }, 1000);
    }

    _end() {
        this.gameOver = true; this.gameStarted = false;
        clearInterval(this.timer);
        document.getElementById('wsStart').disabled = false;
        document.getElementById('wsScrambled').textContent = 'Time\'s up!';
        document.getElementById('wsInput').value = '';
        this._setFeedback(`Final score: ${this.score}`, 'correct');
        if (this.score > this.best) {
            this.best = this.score;
            storage.set('wordscramble-best', this.best);
            notifyScoreUpdate();
            document.getElementById('wsBest').textContent = this.best;
        }
    }

    reset() {
        clearInterval(this.timer);
        this.gameStarted = false; this.gameOver = false;
        this.score = 0; this.timeLeft = 60; this.usedWords.clear();
        document.getElementById('wsScore').textContent = '0';
        document.getElementById('wsTime').textContent = '60';
        document.getElementById('wsStart').disabled = false;
        document.getElementById('wsScrambled').textContent = '?????';
        document.getElementById('wsInput').value = '';
        document.getElementById('wsFeedback').textContent = '';
    }

    cleanup() { clearInterval(this.timer); }
}
