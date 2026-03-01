import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class RockPaperScissors {
    constructor() {
        this.userScore = 0;
        this.computerScore = 0;
        this.setupUI();
    }

    setupUI() {
        document.getElementById('gameContainer').innerHTML = `
            <h2 class="game-title">Rock Paper Scissors</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">You</div><div class="score-value" id="rpsUserScore">0</div></div>
                <div class="score-display"><div class="score-label">Computer</div><div class="score-value" id="rpsComputerScore">0</div></div>
            </div>
            <div class="rps-game">
                <div class="rps-result" id="rpsResult">Choose your move!</div>
                <div class="rps-choices">
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
    }

    play(userChoice) {
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
            this.userScore++;
            result.textContent = 'You Win! 🎉'; result.style.color = '#2ecc71';
            const best = storage.get('rps-wins') || 0;
            if (this.userScore > best) { storage.set('rps-wins', this.userScore); notifyScoreUpdate(); }
        } else {
            this.computerScore++;
            result.textContent = 'You Lose! 😢'; result.style.color = '#e74c3c';
        }
        document.getElementById('rpsUserScore').textContent = this.userScore;
        document.getElementById('rpsComputerScore').textContent = this.computerScore;
    }

    reset() {
        this.userScore = 0; this.computerScore = 0;
        document.getElementById('rpsUserScore').textContent = '0';
        document.getElementById('rpsComputerScore').textContent = '0';
        document.getElementById('rpsResult').textContent = 'Choose your move!';
        document.getElementById('rpsResult').style.color = '#333';
        document.getElementById('userChoice').innerHTML = '';
        document.getElementById('computerChoice').innerHTML = '';
    }
}
