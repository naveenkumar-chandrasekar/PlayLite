import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.startTime = null;
        this.gameStarted = false;
        this.setupUI();
        this.initCards();
    }

    initCards() {
        const symbols = ['🎮', '🎯', '🎲', '🎸', '🎨', '🎭', '🎪', '🎬'];
        const all = [...symbols, ...symbols];
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }
        this.cards = all.map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));
    }

    setupUI() {
        const gameContainer = document.getElementById('gameContainer');
        const best = storage.get('memory-best');
        gameContainer.innerHTML = `
            <h2 class="game-title">Memory Game</h2>
            <div class="game-info">
                <div class="score-display">
                    <div class="score-label">Pairs Found</div>
                    <div class="score-value" id="memoryPairs">0/8</div>
                </div>
                <div class="score-display">
                    <div class="score-label">Best Time</div>
                    <div class="score-value" id="memoryBest">${best ? best + 's' : '--'}</div>
                </div>
            </div>
            <div class="game-instructions" id="memoryStatus">Click cards to find pairs!</div>
            <div class="memory-game">
                <div class="memory-board" id="memoryBoard"></div>
                <div class="game-controls">
                    <button class="btn" id="memoryNewGame">New Game</button>
                </div>
            </div>
        `;
        const boardEl = document.getElementById('memoryBoard');
        this.cardElements = [];
        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.addEventListener('click', () => this.flipCard(i));
            boardEl.appendChild(card);
            this.cardElements.push(card);
        }
        document.getElementById('memoryNewGame').addEventListener('click', () => this.reset());
        this.updateBoard();
    }

    flipCard(index) {
        const card = this.cards[index];
        if (card.flipped || card.matched || this.flippedCards.length >= 2) return;
        if (!this.gameStarted) { this.startTime = Date.now(); this.gameStarted = true; }
        card.flipped = true;
        this.flippedCards.push(index);
        this.updateBoard();
        if (this.flippedCards.length === 2) setTimeout(() => this.checkMatch(), 1000);
    }

    checkMatch() {
        const [i1, i2] = this.flippedCards;
        if (this.cards[i1].symbol === this.cards[i2].symbol) {
            this.cards[i1].matched = this.cards[i2].matched = true;
            this.matchedPairs++;
            document.getElementById('memoryPairs').textContent = `${this.matchedPairs}/8`;
            if (this.matchedPairs === 8) {
                const time = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('memoryStatus').textContent = `Completed in ${time}s!`;
                const best = storage.get('memory-best');
                if (!best || time < best) {
                    storage.set('memory-best', time);
                    notifyScoreUpdate();
                    document.getElementById('memoryBest').textContent = time + 's';
                }
            }
        } else {
            this.cards[i1].flipped = this.cards[i2].flipped = false;
        }
        this.flippedCards = [];
        this.updateBoard();
    }

    updateBoard() {
        this.cards.forEach((card, i) => {
            const el = this.cardElements[i];
            el.textContent = card.flipped || card.matched ? card.symbol : '';
            el.className = 'memory-card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
        });
    }

    reset() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.startTime = null;
        this.gameStarted = false;
        document.getElementById('memoryStatus').textContent = 'Click cards to find pairs!';
        document.getElementById('memoryPairs').textContent = '0/8';
        this.initCards();
        this.updateBoard();
    }
}
