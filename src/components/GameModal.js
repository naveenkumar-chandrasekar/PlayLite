export class GameModal {
    constructor() {
        this.currentGame = null;
        this.modal = document.getElementById('gameModal');
        this.container = document.getElementById('gameContainer');
        this.closeBtn = document.getElementById('closeBtn');
        this._bindEvents();
    }

    _bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    async open(gameId, gameConfig) {
        this._cleanup();
        this.modal.classList.add('active');
        this.container.innerHTML = `<div class="game-loading">Loading...</div>`;

        try {
            const module = await gameConfig.module();
            const GameClass = module.default;
            this.container.innerHTML = '';
            this.currentGame = new GameClass();
        } catch (err) {
            this.container.innerHTML = `<div class="game-error">Failed to load game. Please try again.</div>`;
            console.error('Game load error:', err);
        }
    }

    close() {
        this._cleanup();
        this.modal.classList.remove('active');
        this.container.innerHTML = '';
    }

    _cleanup() {
        if (this.currentGame?.cleanup) {
            this.currentGame.cleanup();
        }
        this.currentGame = null;
    }
}
