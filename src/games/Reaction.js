import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class ReactionGame {
    constructor() {
        this.state = 'waiting';
        this.startTime = null;
        this.setupUI();
    }

    setupUI() {
        const best = storage.get('reaction-best');
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Reaction Test</h2>
            <div class="game-info">
                <div class="score-display">
                    <div class="score-label">Current</div>
                    <div class="score-value" id="reactionCurrent">--</div>
                </div>
                <div class="score-display">
                    <div class="score-label">Best</div>
                    <div class="score-value" id="reactionBest">${best ? best + 'ms' : '--'}</div>
                </div>
            </div>
            <div class="game-instructions" id="reactionStatus">Wait for green, then click!</div>
            <div class="reaction-game">
                <div class="reaction-circle waiting" id="reactionCircle">Wait...</div>
                <div id="reactionResult"></div>
                <div class="game-controls">
                    <button class="btn" id="reactionStartBtn">Start</button>
                    <button class="btn" id="reactionResetBtn">Reset</button>
                </div>
            </div>
        `;
        this.circle = document.getElementById('reactionCircle');
        this.circle.addEventListener('click', () => this.handleClick());
        document.getElementById('reactionStartBtn').addEventListener('click', () => this.start());
        document.getElementById('reactionResetBtn').addEventListener('click', () => this.reset());
    }

    start() {
        this.state = 'waiting';
        this.circle.className = 'reaction-circle waiting';
        this.circle.textContent = 'Wait...';
        document.getElementById('reactionResult').textContent = '';
        const delay = 2000 + Math.random() * 3000;
        this._t1 = setTimeout(() => {
            if (this.state === 'waiting') {
                this.state = 'ready';
                this.circle.className = 'reaction-circle ready';
                this.circle.textContent = 'Ready...';
            }
        }, delay);
        this._t2 = setTimeout(() => {
            if (this.state === 'ready') {
                this.state = 'go';
                this.startTime = Date.now();
                this.circle.className = 'reaction-circle go';
                this.circle.textContent = 'CLICK!';
            }
        }, delay + 500);
    }

    handleClick() {
        if (this.state === 'waiting' || this.state === 'ready') {
            this.state = 'too-early';
            this.circle.className = 'reaction-circle too-early';
            this.circle.textContent = 'Too Early!';
            document.getElementById('reactionResult').textContent = 'Wait for green!';
            clearTimeout(this._t1);
            clearTimeout(this._t2);
            return;
        }
        if (this.state === 'go') {
            const time = Date.now() - this.startTime;
            this.circle.className = 'reaction-circle';
            this.circle.textContent = `${time}ms`;
            document.getElementById('reactionResult').textContent = `Reaction time: ${time}ms`;
            document.getElementById('reactionCurrent').textContent = time + 'ms';
            const best = storage.get('reaction-best');
            if (!best || time < best) {
                storage.set('reaction-best', time);
                notifyScoreUpdate();
                document.getElementById('reactionBest').textContent = time + 'ms';
            }
            this.state = 'waiting';
        }
    }

    reset() {
        clearTimeout(this._t1);
        clearTimeout(this._t2);
        this.state = 'waiting';
        this.circle.className = 'reaction-circle waiting';
        this.circle.textContent = 'Wait...';
        document.getElementById('reactionResult').textContent = '';
        document.getElementById('reactionCurrent').textContent = '--';
    }

    cleanup() {
        clearTimeout(this._t1);
        clearTimeout(this._t2);
    }
}
