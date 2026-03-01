import { storage, notifyScoreUpdate } from '../core/storage.js';

const DISK_COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db'];

export default class TowerHanoiGame {
    constructor() {
        this.disks = 3;
        this.pegs = [[], [], []];
        this.selected = null;
        this.moves = 0;
        this.won = false;
        this.best = storage.get('hanoi-best') || null;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Tower of Hanoi</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Moves</div><div class="score-value" id="hanoiMoves">0</div></div>
                <div class="score-display"><div class="score-label">Optimal</div><div class="score-value" id="hanoiOptimal">7</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="hanoiBest">${this.best ? this.best + ' moves' : '--'}</div></div>
            </div>
            <div class="hanoi-container">
                <div class="hanoi-difficulty">
                    <button class="btn hanoi-diff-btn ${this.disks === 3 ? 'active' : ''}" data-disks="3">3 Disks</button>
                    <button class="btn hanoi-diff-btn ${this.disks === 4 ? 'active' : ''}" data-disks="4">4 Disks</button>
                    <button class="btn hanoi-diff-btn ${this.disks === 5 ? 'active' : ''}" data-disks="5">5 Disks</button>
                </div>
                <div class="hanoi-message" id="hanoiMessage"></div>
                <div class="hanoi-pegs" id="hanoiPegs"></div>
                <div class="hanoi-peg-labels">
                    <span>A</span><span>B</span><span>C</span>
                </div>
                <div class="game-controls">
                    <button class="btn" id="hanoiReset">New Game</button>
                </div>
                <div class="game-instructions">Click a peg to select, click another to move the top disk</div>
            </div>
        `;
        document.getElementById('hanoiReset').addEventListener('click', () => this.newGame());
        document.querySelectorAll('.hanoi-diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.disks = parseInt(btn.dataset.disks);
                document.querySelectorAll('.hanoi-diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('hanoiOptimal').textContent = Math.pow(2, this.disks) - 1;
                this.newGame();
            });
        });
        this.newGame();
    }

    newGame() {
        this.pegs = [[], [], []];
        for (let i = this.disks; i >= 1; i--) this.pegs[0].push(i);
        this.selected = null;
        this.moves = 0;
        this.won = false;
        document.getElementById('hanoiMoves').textContent = '0';
        document.getElementById('hanoiOptimal').textContent = Math.pow(2, this.disks) - 1;
        document.getElementById('hanoiMessage').textContent = '';
        this._render();
    }

    _render() {
        const el = document.getElementById('hanoiPegs');
        if (!el) return;
        el.innerHTML = '';
        this.pegs.forEach((peg, i) => {
            const pegEl = document.createElement('div');
            pegEl.className = 'hanoi-peg' + (this.selected === i ? ' selected' : '');
            pegEl.addEventListener('click', () => this._clickPeg(i));

            const rod = document.createElement('div');
            rod.className = 'hanoi-rod';
            pegEl.appendChild(rod);

            const base = document.createElement('div');
            base.className = 'hanoi-base';

            const diskStack = document.createElement('div');
            diskStack.className = 'hanoi-disk-stack';

            [...peg].reverse().forEach(size => {
                const disk = document.createElement('div');
                disk.className = 'hanoi-disk';
                const w = 30 + size * 22;
                disk.style.cssText = `width:${w}px;background:${DISK_COLORS[size - 1]};`;
                disk.textContent = size;
                diskStack.appendChild(disk);
            });

            pegEl.appendChild(diskStack);
            pegEl.appendChild(base);
            el.appendChild(pegEl);
        });
    }

    _clickPeg(i) {
        if (this.won) return;
        if (this.selected === null) {
            if (this.pegs[i].length === 0) return;
            this.selected = i;
        } else {
            if (i !== this.selected) {
                const from = this.pegs[this.selected];
                const to = this.pegs[i];
                const top = from[from.length - 1];
                if (to.length === 0 || to[to.length - 1] > top) {
                    to.push(from.pop());
                    this.moves++;
                    document.getElementById('hanoiMoves').textContent = this.moves;
                    this._checkWin();
                } else {
                    const msg = document.getElementById('hanoiMessage');
                    if (msg) { msg.textContent = "Can't place larger disk on smaller!"; msg.className = 'hanoi-message hanoi-err'; setTimeout(() => { msg.textContent = ''; msg.className = 'hanoi-message'; }, 1500); }
                }
            }
            this.selected = null;
        }
        this._render();
    }

    _checkWin() {
        if (this.pegs[2].length === this.disks) {
            this.won = true;
            const optimal = Math.pow(2, this.disks) - 1;
            const msg = document.getElementById('hanoiMessage');
            const efficiency = this.moves === optimal ? '⭐ Perfect!' : this.moves <= optimal * 1.5 ? '🎉 Great!' : '✅ Solved!';
            if (msg) { msg.textContent = `${efficiency} ${this.moves} moves (optimal: ${optimal})`; msg.className = 'hanoi-message hanoi-win'; }
            if (this.best === null || this.moves < this.best) {
                this.best = this.moves;
                storage.set('hanoi-best', this.best);
                notifyScoreUpdate();
                document.getElementById('hanoiBest').textContent = this.best + ' moves';
            }
        }
    }

    cleanup() {}
}
