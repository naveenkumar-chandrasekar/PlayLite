export const GAMES = [
    {
        id: 'snake',
        name: 'Snake',
        description: 'Use arrow keys to control the snake',
        scoreLabel: 'High Score',
        scoreKey: 'snake-high',
        scoreDefault: 0,
        category: 'arcade',
        module: () => import('../games/Snake.js'),
        previewHTML: `<div class="snake-preview"></div>`
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'Stack the blocks',
        scoreLabel: 'Best Score',
        scoreKey: 'tetris-high',
        scoreDefault: 0,
        category: 'arcade',
        module: () => import('../games/Tetris.js'),
        previewHTML: `<div class="tetris-preview">${'<div></div>'.repeat(24)}</div>`
    },
    {
        id: 'breakout',
        name: 'Breakout',
        description: 'Break all the bricks',
        scoreLabel: 'High Score',
        scoreKey: 'breakout-high',
        scoreDefault: 0,
        category: 'arcade',
        module: () => import('../games/Breakout.js'),
        previewHTML: `
            <div class="breakout-preview">
                <div class="brick-row">
                    <div class="mini-brick" style="background:hsl(0,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(0,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(0,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(0,70%,60%)"></div>
                </div>
                <div class="brick-row">
                    <div class="mini-brick" style="background:hsl(60,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(60,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(60,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(60,70%,60%)"></div>
                </div>
                <div class="brick-row">
                    <div class="mini-brick" style="background:hsl(120,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(120,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(120,70%,60%)"></div>
                    <div class="mini-brick" style="background:hsl(120,70%,60%)"></div>
                </div>
                <div class="paddle-mini"></div>
            </div>`
    },
    {
        id: 'flappy',
        name: 'Flappy Bird',
        description: 'Navigate through pipes',
        scoreLabel: 'Best Score',
        scoreKey: 'flappy-best',
        scoreDefault: 0,
        category: 'arcade',
        module: () => import('../games/Flappy.js'),
        previewHTML: `
            <div style="width:100%;height:100%;background:#87CEEB;position:relative;border-radius:10px;overflow:hidden;">
                <div style="position:absolute;bottom:0;width:100%;height:30%;background:#90EE90;"></div>
                <div style="position:absolute;top:30%;left:20px;width:15px;height:40px;background:#FFD700;border-radius:50%;"></div>
            </div>`
    },
    {
        id: 'pong',
        name: 'Pong',
        description: 'Classic paddle game',
        scoreLabel: 'Wins',
        scoreKey: 'pong-wins',
        scoreDefault: 0,
        category: 'arcade',
        module: () => import('../games/Pong.js'),
        previewHTML: `<div class="pong-preview"><div class="pong-ball"></div></div>`
    },
    {
        id: 'game2048',
        name: '2048',
        description: 'Slide tiles to combine numbers',
        scoreLabel: 'Best Score',
        scoreKey: 'game2048-best',
        scoreDefault: 0,
        category: 'puzzle',
        module: () => import('../games/Game2048.js'),
        previewHTML: `
            <div class="game2048-preview">
                <div></div><div></div><div>2</div><div>4</div>
                <div>2</div><div></div><div></div><div></div>
                <div></div><div>8</div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
            </div>`
    },
    {
        id: 'tictactoe',
        name: 'Tic Tac Toe',
        description: 'Play against the computer',
        scoreLabel: 'Wins',
        scoreKey: 'tictactoe-wins',
        scoreDefault: 0,
        category: 'strategy',
        module: () => import('../games/TicTacToe.js'),
        previewHTML: `
            <div class="tictactoe-preview">
                <div>X</div><div>O</div><div>X</div>
                <div>O</div><div>X</div><div></div>
                <div></div><div>O</div><div></div>
            </div>`
    },
    {
        id: 'connect4',
        name: 'Connect Four',
        description: 'Connect four in a row',
        scoreLabel: 'Wins',
        scoreKey: 'connect4-wins',
        scoreDefault: 0,
        category: 'strategy',
        module: () => import('../games/Connect4.js'),
        previewHTML: `
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;width:100%;height:100%;background:#0066cc;padding:5px;border-radius:5px;box-sizing:border-box;">
                <div style="background:white;border-radius:50%;"></div>
                <div style="background:red;border-radius:50%;"></div>
                <div style="background:white;border-radius:50%;"></div>
                <div style="background:yellow;border-radius:50%;"></div>
                <div style="background:white;border-radius:50%;"></div>
                <div style="background:red;border-radius:50%;"></div>
                <div style="background:white;border-radius:50%;"></div>
            </div>`
    },
    {
        id: 'memory',
        name: 'Memory Game',
        description: 'Match pairs of cards',
        scoreLabel: 'Best Time',
        scoreKey: 'memory-best',
        scoreDefault: null,
        scoreFormat: (v) => v ? v + 's' : '--',
        category: 'puzzle',
        module: () => import('../games/Memory.js'),
        previewHTML: `
            <div class="memory-preview">
                <div>🎮</div><div></div><div>🎯</div><div></div>
                <div></div><div>🎲</div><div></div><div>🎸</div>
                <div>🎨</div><div></div><div></div><div>🎭</div>
                <div></div><div>🎪</div><div>🎬</div><div></div>
            </div>`
    },
    {
        id: 'sudoku',
        name: 'Sudoku',
        description: 'Fill the grid',
        scoreLabel: 'Puzzles Solved',
        scoreKey: 'sudoku-wins',
        scoreDefault: 0,
        category: 'puzzle',
        module: () => import('../games/Sudoku.js'),
        previewHTML: `<div class="sudoku-preview">9x9</div>`
    },
    {
        id: 'minesweeper',
        name: 'Minesweeper',
        description: 'Find all the mines',
        scoreLabel: 'Games Won',
        scoreKey: 'minesweeper-wins',
        scoreDefault: 0,
        category: 'puzzle',
        module: () => import('../games/Minesweeper.js'),
        previewHTML: `
            <div class="minesweeper-preview">
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2px;width:100%;height:100%;">
                    <div style="background:#c0c0c0;border:1px solid #808080;"></div>
                    <div style="background:#ff0;border:1px solid #808080;"></div>
                    <div style="background:#c0c0c0;border:1px solid #808080;"></div>
                    <div style="background:#c0c0c0;border:1px solid #808080;"></div>
                    <div style="background:#c0c0c0;border:1px solid #808080;"></div>
                </div>
            </div>`
    },
    {
        id: 'hangman',
        name: 'Hangman',
        description: 'Guess the word',
        scoreLabel: 'Wins',
        scoreKey: 'hangman-wins',
        scoreDefault: 0,
        category: 'word',
        module: () => import('../games/Hangman.js'),
        previewHTML: `
            <div class="hangman-preview">
                <div class="hangman-display-preview">_ _ _ _ _</div>
                <div class="hangman-icon">🎮</div>
            </div>`
    },
    {
        id: 'typing',
        name: 'Typing Speed',
        description: 'Test your typing speed',
        scoreLabel: 'Best Score',
        scoreKey: 'typing-high',
        scoreDefault: 0,
        category: 'word',
        module: () => import('../games/Typing.js'),
        previewHTML: `<div class="typing-preview">ABC</div>`
    },
    {
        id: 'wordguess',
        name: 'Word Guess',
        description: 'Guess the 5-letter word in 6 tries',
        scoreLabel: 'Wins',
        scoreKey: 'wordguess-wins',
        scoreDefault: 0,
        category: 'word',
        module: () => import('../games/WordGuess.js'),
        previewHTML: `
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:130px;height:130px;padding:5px;background:#f5f5f5;border-radius:8px;box-sizing:border-box;">
                <div style="background:#6aaa64;border-radius:3px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">W</div>
                <div style="background:#c9b458;border-radius:3px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">O</div>
                <div style="background:#787c7e;border-radius:3px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">R</div>
                <div style="background:#6aaa64;border-radius:3px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">D</div>
                <div style="background:#787c7e;border-radius:3px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">S</div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
                <div style="background:#ddd;border-radius:3px;"></div>
            </div>`
    },
    {
        id: 'reaction',
        name: 'Reaction Test',
        description: 'Click as fast as you can!',
        scoreLabel: 'Best',
        scoreKey: 'reaction-best',
        scoreDefault: null,
        scoreFormat: (v) => v ? v + 'ms' : '--',
        category: 'reflex',
        module: () => import('../games/Reaction.js'),
        previewHTML: `<div class="reaction-preview"></div>`
    },
    {
        id: 'colormatch',
        name: 'Color Match',
        description: 'Match the colors',
        scoreLabel: 'Best Score',
        scoreKey: 'colormatch-best',
        scoreDefault: 0,
        category: 'reflex',
        module: () => import('../games/ColorMatch.js'),
        previewHTML: `<div class="colormatch-preview"></div>`
    },
    {
        id: 'whackamole',
        name: 'Whack-a-Mole',
        description: 'Whack those moles!',
        scoreLabel: 'Best Score',
        scoreKey: 'whackamole-best',
        scoreDefault: 0,
        category: 'reflex',
        module: () => import('../games/WhackAMole.js'),
        previewHTML: `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;width:100%;height:100%;padding:10px;box-sizing:border-box;">
                <div style="background:#8B4513;border-radius:50%;position:relative;">
                    <div style="position:absolute;bottom:0;width:100%;height:40%;background:#654321;border-radius:50%;"></div>
                </div>
                <div style="background:#8B4513;border-radius:50%;position:relative;">
                    <div style="position:absolute;bottom:0;width:100%;height:60%;background:#654321;border-radius:50%;"></div>
                </div>
                <div style="background:#8B4513;border-radius:50%;"></div>
            </div>`
    },
    {
        id: 'numberguess',
        name: 'Number Guess',
        description: 'Guess the number 1-100',
        scoreLabel: 'Best (fewest tries)',
        scoreKey: 'numberguess-best',
        scoreDefault: null,
        scoreFormat: (v) => v ? v + ' tries' : '--',
        category: 'puzzle',
        module: () => import('../games/NumberGuess.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#2c3e50;border-radius:10px;flex-direction:column;gap:8px;">
                <div style="font-size:36px;font-weight:bold;color:#3498db;">?</div>
                <div style="color:#95a5a6;font-size:12px;">1 - 100</div>
            </div>`
    },
    {
        id: 'bubblepop',
        name: 'Bubble Pop',
        description: 'Pop bubbles before they float away!',
        scoreLabel: 'Best Score',
        scoreKey: 'bubblepop-best',
        scoreDefault: 0,
        category: 'reflex',
        module: () => import('../games/BubblePop.js'),
        previewHTML: `
            <div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:10px;position:relative;overflow:hidden;">
                <div style="position:absolute;width:40px;height:40px;background:rgba(52,152,219,0.7);border-radius:50%;top:20px;left:30px;border:2px solid rgba(255,255,255,0.4);"></div>
                <div style="position:absolute;width:30px;height:30px;background:rgba(231,76,60,0.7);border-radius:50%;top:50px;left:100px;border:2px solid rgba(255,255,255,0.4);"></div>
                <div style="position:absolute;width:50px;height:50px;background:rgba(46,204,113,0.7);border-radius:50%;top:100px;left:60px;border:2px solid rgba(255,255,255,0.4);"></div>
                <div style="position:absolute;width:35px;height:35px;background:rgba(155,89,182,0.7);border-radius:50%;top:30px;left:140px;border:2px solid rgba(255,255,255,0.4);"></div>
            </div>`
    },
    {
        id: 'rps',
        name: 'Rock Paper Scissors',
        description: 'Beat the computer',
        scoreLabel: 'Wins',
        scoreKey: 'rps-wins',
        scoreDefault: 0,
        category: 'strategy',
        module: () => import('../games/RockPaperScissors.js'),
        previewHTML: `<div class="rps-preview">🪨📄✂️</div>`
    },
    {
        id: 'simon',
        name: 'Simon Says',
        description: 'Remember the sequence',
        scoreLabel: 'Best Level',
        scoreKey: 'simon-best',
        scoreDefault: 0,
        category: 'memory',
        module: () => import('../games/Simon.js'),
        previewHTML: `
            <div class="simon-preview">
                <div></div><div></div><div></div><div></div>
            </div>`
    },
    {
        id: 'math',
        name: 'Math Challenge',
        description: 'Solve math problems',
        scoreLabel: 'Best Score',
        scoreKey: 'math-best',
        scoreDefault: 0,
        category: 'puzzle',
        module: () => import('../games/MathGame.js'),
        previewHTML: `<div class="math-preview">2+2=?</div>`
    }
];
