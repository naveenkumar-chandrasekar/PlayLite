import { GameGrid } from './GameGrid.js';
import { GameModal } from './GameModal.js';
import { GAMES } from '../core/registry.js';

export class App {
    constructor() {
        this.modal = null;
        this.grid = null;
    }

    init() {
        const gridEl = document.getElementById('gamesGrid');
        this.modal = new GameModal();
        this.grid = new GameGrid(gridEl, (gameId) => this._openGame(gameId));
        this._setupSearch();
        this._setupCategoryFilter();
        this._setupStats();
    }

    _openGame(gameId) {
        const gameConfig = GAMES.find(g => g.id === gameId);
        if (!gameConfig) return;
        this.modal.open(gameId, gameConfig);
    }

    _setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.game-card').forEach(card => {
                const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                card.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
            });
        });
    }

    _setupCategoryFilter() {
        const filterBtns = document.querySelectorAll('[data-filter]');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.grid.filterByCategory(btn.dataset.filter);
            });
        });
    }

    _setupStats() {
        const totalEl = document.getElementById('totalGames');
        if (totalEl) totalEl.textContent = GAMES.length;
    }
}
