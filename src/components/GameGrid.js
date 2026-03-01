import { GAMES } from '../core/registry.js';
import { storage } from '../core/storage.js';

export class GameGrid {
    constructor(container, onGameSelect) {
        this.container = container;
        this.onGameSelect = onGameSelect;
        this._render();
        this._bindEvents();
        document.addEventListener('scoreUpdate', () => this.refreshScores());
    }

    _formatScore(game) {
        const val = storage.get(game.scoreKey);
        if (game.scoreFormat) return game.scoreFormat(val);
        return val ?? game.scoreDefault;
    }

    _render() {
        this.container.innerHTML = GAMES.map(game => `
            <div class="game-card" data-game="${game.id}" data-category="${game.category}">
                <div class="game-preview">${game.previewHTML}</div>
                <div class="game-card-body">
                    <h3>${game.name}</h3>
                    <p>${game.description}</p>
                    <div class="high-score">
                        ${game.scoreLabel}: <span id="${game.id}-score">${this._formatScore(game)}</span>
                    </div>
                    <button class="play-btn" aria-label="Play ${game.name}">Play</button>
                </div>
            </div>
        `).join('');
    }

    _bindEvents() {
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.game-card');
            if (card) this.onGameSelect(card.dataset.game);
        });
    }

    refreshScores() {
        GAMES.forEach(game => {
            const el = document.getElementById(`${game.id}-score`);
            if (el) el.textContent = this._formatScore(game);
        });
    }

    filterByCategory(category) {
        const cards = this.container.querySelectorAll('.game-card');
        cards.forEach(card => {
            const match = category === 'all' || card.dataset.category === category;
            card.style.display = match ? '' : 'none';
        });
    }
}
