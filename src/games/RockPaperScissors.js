import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class RockPaperScissors {
    constructor() {
        this.p1Score = 0;
        this.p2Score = 0;
        this.mode = 'computer';
        this.p1Choice = null;
        this.waitingForP2 = false;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Rock Paper Scissors</h2>
            <div class="mode-selector">
                <button class="mode-btn active" id="rpsModeComputer">vs Computer</button>
                <button class="mode-btn" id="rpsModeMulti">2 Players</button>
            </div>
            <div class="game-info">
                <div class="score-display"><div class="score-label" id="rpsP1Label">You</div><div class="score-value" id="rpsUserScore">0</div></div>
                <div class="score-display"><div class="score-label" id="rpsP2Label">Computer</div><div class="score-value" id="rpsComputerScore">0</div></div>
            </div>
            <div class="rps-game">
                <div class="game-instructions" id="rpsInstructions">Pick Rock, Paper or Scissors — beat the computer!</div>
                <div class="rps-result" id="rpsResult">Choose your move!</div>
                <div class="rps-choices" id="rpsChoices">
                    <div class="rps-choice" data-choice="rock"><div class="rps-icon">🪨</div><div class="rps-label">Rock</div></div>
                    <div class="rps-choice" data-choice="paper"><div class="rps-icon">📄</div><div class="rps-label">Paper</div></div>
                    <div class="rps-choice" data-choice="scissors"><div class="rps-icon">✂️</div><div class="rps-label">Scissors</div></div>
                </div>
                <div class="rps-versus">
                    <div class="rps-choice-display" id="userChoice"></div>
                    <div class="rps-vs">VS</div>
                    <div class="rps-choice-display" id="computerChoice"></div>
                </div>
                <div class="game-controls">
                    <button class="btn" id="rpsReset">Reset</button>
                </div>
            </div>
        `;
        document.querySelectorAll('.rps-choice').forEach(c => {
            c.addEventListener('click', () => this.play(c.dataset.choice));
        });
        document.getElementById('rpsReset').addEventListener('click', () => this.reset());
        document.getElementById('rpsModeComputer').addEventListener('click', () => this.setMode('computer'));
        document.getElementById('rpsModeMulti').addEventListener('click', () => this.setMode('multiplayer'));
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('rpsModeComputer').classList.toggle('active', mode === 'computer');
        document.getElementById('rpsModeMulti').classList.toggle('active', mode === 'multiplayer');
        const p1Label = document.getElementById('rpsP1Label');
        const p2Label = document.getElementById('rpsP2Label');
        const instructions = document.getElementById('rpsInstructions');
        if (mode === 'multiplayer') {
            p1Label.textContent = 'Player 1';
            p2Label.textContent = 'Player 2';
            instructions.textContent = 'P1 picks secretly → pass to P2 → P2 picks → reveal! Best score wins.';
        } else {
            p1Label.textContent = 'You';
            p2Label.textContent = 'Computer';
            instructions.textContent = 'Pick Rock, Paper or Scissors — beat the computer!';
        }
        this.reset();
    }

    play(choice) {
        if (this.mode === 'multiplayer') {
            this._multiplayerPlay(choice);
        } else {
            this._vsComputer(choice);
        }
    }

    _vsComputer(userChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const comp = choices[Math.floor(Math.random() * 3)];
        const icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
        document.getElementById('userChoice').innerHTML = `<div style="font-size:4rem">${icons[userChoice]}</div>`;
        document.getElementById('computerChoice').innerHTML = `<div style="font-size:4rem">${icons[comp]}</div>`;
        const result = document.getElementById('rpsResult');
        if (userChoice === comp) {
            result.textContent = 'Tie! 🤝'; result.style.color = '#3498db';
        } else if ((userChoice === 'rock' && comp === 'scissors') ||
                   (userChoice === 'paper' && comp === 'rock') ||
                   (userChoice === 'scissors' && comp === 'paper')) {
            this.p1Score++;
            result.textContent = 'You Win! 🎉'; result.style.color = '#2ecc71';
            const best = storage.get('rps-wins') || 0;
            if (this.p1Score > best) { storage.set('rps-wins', this.p1Score); notifyScoreUpdate(); }
        } else {
            this.p2Score++;
            result.textContent = 'You Lose! 😢'; result.style.color = '#e74c3c';
        }
        document.getElementById('rpsUserScore').textContent = this.p1Score;
        document.getElementById('rpsComputerScore').textContent = this.p2Score;
    }

    _multiplayerPlay(choice) {
        if (!this.waitingForP2) {
            this.p1Choice = choice;
            this.waitingForP2 = true;
            document.getElementById('rpsResult').textContent = 'P1 chose! Now Player 2, pick your move:';
            document.getElementById('rpsResult').style.color = '#818cf8';
            document.getElementById('userChoice').innerHTML = '<div style="font-size:4rem">🤫</div>';
            document.getElementById('computerChoice').innerHTML = '';
        } else {
            const p2Choice = choice;
            const icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
            document.getElementById('userChoice').innerHTML = `<div style="font-size:4rem">${icons[this.p1Choice]}</div>`;
            document.getElementById('computerChoice').innerHTML = `<div style="font-size:4rem">${icons[p2Choice]}</div>`;
            const result = document.getElementById('rpsResult');
            if (this.p1Choice === p2Choice) {
                result.textContent = 'Tie! 🤝'; result.style.color = '#3498db';
            } else if ((this.p1Choice === 'rock' && p2Choice === 'scissors') ||
                       (this.p1Choice === 'paper' && p2Choice === 'rock') ||
                       (this.p1Choice === 'scissors' && p2Choice === 'paper')) {
                this.p1Score++;
                result.textContent = 'Player 1 Wins! 🎉'; result.style.color = '#2ecc71';
                const best = storage.get('rps-p1wins') || 0;
                if (this.p1Score > best) { storage.set('rps-p1wins', this.p1Score); notifyScoreUpdate(); }
            } else {
                this.p2Score++;
                result.textContent = 'Player 2 Wins! 🎉'; result.style.color = '#e74c3c';
            }
            document.getElementById('rpsUserScore').textContent = this.p1Score;
            document.getElementById('rpsComputerScore').textContent = this.p2Score;
            this.p1Choice = null;
            this.waitingForP2 = false;
        }
    }

    reset() {
        this.p1Score = 0; this.p2Score = 0;
        this.p1Choice = null; this.waitingForP2 = false;
        document.getElementById('rpsUserScore').textContent = '0';
        document.getElementById('rpsComputerScore').textContent = '0';
        document.getElementById('rpsResult').textContent = this.mode === 'multiplayer' ? 'Player 1, choose your move!' : 'Choose your move!';
        document.getElementById('rpsResult').style.color = '#333';
        document.getElementById('userChoice').innerHTML = '';
        document.getElementById('computerChoice').innerHTML = '';
    }
}
