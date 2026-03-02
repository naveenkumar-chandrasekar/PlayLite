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
    },
    {
        id: 'stroop',
        name: 'Stroop Test',
        description: 'Name the ink color, ignore the word',
        scoreLabel: 'Best Score',
        scoreKey: 'stroop-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/Stroop.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:8px;">
                <div style="font-size:22px;font-weight:bold;color:#e74c3c;">BLUE</div>
                <div style="font-size:12px;color:#aaa;">What color is the ink?</div>
            </div>`
    },
    {
        id: 'hanoi',
        name: 'Tower of Hanoi',
        description: 'Move all disks to the right peg',
        scoreLabel: 'Best (moves)',
        scoreKey: 'hanoi-best',
        scoreDefault: null,
        scoreFormat: (v) => v ? v + ' moves' : '--',
        category: 'iq',
        module: () => import('../games/TowerHanoi.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;gap:12px;background:#1a1a2e;border-radius:10px;padding:10px;box-sizing:border-box;">
                <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                    <div style="width:50px;height:10px;background:#e74c3c;border-radius:3px;"></div>
                    <div style="width:34px;height:10px;background:#e67e22;border-radius:3px;"></div>
                    <div style="width:18px;height:10px;background:#f1c40f;border-radius:3px;"></div>
                    <div style="width:60px;height:4px;background:#666;"></div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <div style="width:60px;height:4px;background:#666;margin-top:36px;"></div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <div style="width:60px;height:4px;background:#666;margin-top:36px;"></div>
                </div>
            </div>`
    },
    {
        id: 'wordscramble',
        name: 'Word Scramble',
        description: 'Unscramble letters to form words',
        scoreLabel: 'Best Score',
        scoreKey: 'wordscramble-best',
        scoreDefault: 0,
        category: 'word',
        module: () => import('../games/WordScramble.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:8px;">
                <div style="font-size:22px;font-weight:bold;color:#2ecc71;letter-spacing:4px;">TELAKN</div>
                <div style="font-size:12px;color:#aaa;">Unscramble the word</div>
            </div>`
    },
    {
        id: 'nback',
        name: 'N-Back',
        description: 'Remember positions from N steps ago',
        scoreLabel: 'Best Level',
        scoreKey: 'nback-best',
        scoreDefault: 1,
        category: 'iq',
        module: () => import('../games/NBack.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:90px;height:90px;">
                    ${Array.from({length:9},(_,i)=>`<div style="background:${i===4?'#667eea':'#2a2a3e'};border-radius:4px;"></div>`).join('')}
                </div>
            </div>`
    },
    {
        id: 'sequences',
        name: 'Number Sequences',
        description: 'Find the next number in the pattern',
        scoreLabel: 'Best Score',
        scoreKey: 'sequences-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/Sequences.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:8px;">
                <div style="color:#f1c40f;font-size:16px;font-weight:bold;">2, 4, 8, 16, ?</div>
                <div style="color:#aaa;font-size:12px;">Find the pattern</div>
            </div>`
    },
    {
        id: 'oddoneout',
        name: 'Odd One Out',
        description: 'Find which item doesn\'t belong',
        scoreLabel: 'Best Score',
        scoreKey: 'oddoneout-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/OddOneOut.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:6px;padding:10px;box-sizing:border-box;">
                <div style="display:flex;gap:6px;">
                    <div style="background:#2d3561;color:#a5b0ff;padding:6px 10px;border-radius:6px;font-size:11px;">apple</div>
                    <div style="background:#2d3561;color:#a5b0ff;padding:6px 10px;border-radius:6px;font-size:11px;">banana</div>
                </div>
                <div style="display:flex;gap:6px;">
                    <div style="background:#2d3561;color:#a5b0ff;padding:6px 10px;border-radius:6px;font-size:11px;">grape</div>
                    <div style="background:#7f1d1d;color:#fca5a5;padding:6px 10px;border-radius:6px;font-size:11px;">carrot</div>
                </div>
            </div>`
    },
    {
        id: 'codingspeed',
        name: 'Coding Speed',
        description: 'Digit-symbol substitution test',
        scoreLabel: 'Best Score',
        scoreKey: 'codingspeed-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/CodingSpeed.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:10px;">
                <div style="display:flex;gap:6px;">${[1,2,3].map(i=>`<div style="background:#1c2438;border:1px solid rgba(129,140,248,0.2);border-radius:4px;padding:4px 8px;text-align:center;"><div style="color:#818cf8;font-size:10px;">${i}</div><div style="font-size:14px;">${['★','♦','♠'][i-1]}</div></div>`).join('')}</div>
                <div style="font-size:2.5rem;color:#f1c40f;">♦</div>
            </div>`
    },
    {
        id: 'wordanalogy',
        name: 'Word Analogy',
        description: 'HOT:COLD :: BIG:? Verbal reasoning',
        scoreLabel: 'Best Score',
        scoreKey: 'wordanalogy-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/WordAnalogy.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;">
                <div style="color:#a5b0ff;font-size:13px;font-weight:bold;">HOT : COLD</div>
                <div style="color:#64748b;font-size:11px;">is to</div>
                <div style="color:#fcd34d;font-size:13px;font-weight:bold;">BIG : ?</div>
            </div>`
    },
    {
        id: 'digitspan',
        name: 'Digit Span',
        description: 'Memorize and recall number sequences',
        scoreLabel: 'Best Span',
        scoreKey: 'digitspan-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/DigitSpan.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:8px;">
                <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;color:#a5b0ff;">7 3 9</div>
                <div style="font-size:12px;color:#64748b;">Remember & recall</div>
            </div>`
    },
    {
        id: 'patternmemory',
        name: 'Pattern Memory',
        description: 'Memorize and repeat spatial sequences',
        scoreLabel: 'Best Span',
        scoreKey: 'patternmemory-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/PatternMemory.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;width:100px;height:100px;">
                    ${Array.from({length:16},(_,i)=>`<div style="background:${[1,5,10,14].includes(i)?'#6366f1':'#1c2438'};border-radius:3px;"></div>`).join('')}
                </div>
            </div>`
    },
    {
        id: 'mentalarithmetic',
        name: 'Mental Arithmetic',
        description: 'Compute chained operations in your head',
        scoreLabel: 'Best Score',
        scoreKey: 'mentalarithmetic-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/MentalArithmetic.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;">
                <div style="color:#e2e8f0;font-size:13px;font-weight:bold;">12 + 7 − 4 × 2</div>
                <div style="color:#fcd34d;font-size:16px;font-weight:bold;">= ?</div>
            </div>`
    },
    {
        id: 'logicreasoning',
        name: 'Logic Reasoning',
        description: 'Evaluate syllogisms: True, False, or Uncertain',
        scoreLabel: 'Best Score',
        scoreKey: 'logicreasoning-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/LogicReasoning.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:6px;padding:10px;box-sizing:border-box;text-align:center;">
                <div style="color:#94a3b8;font-size:10px;">All A are B. All B are C.</div>
                <div style="color:#fcd34d;font-size:11px;font-weight:bold;">∴ All A are C?</div>
                <div style="display:flex;gap:4px;margin-top:4px;">
                    <div style="background:#166534;color:#4ade80;padding:3px 8px;border-radius:4px;font-size:10px;">TRUE</div>
                </div>
            </div>`
    },
    {
        id: 'visualmatrix',
        name: 'Visual Matrix',
        description: 'Find the missing cell in the pattern grid',
        scoreLabel: 'Best Score',
        scoreKey: 'visualmatrix-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/VisualMatrix.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:110px;height:110px;">
                    ${[1,2,3,4,5,6,7,8,'?'].map(v=>`<div style="background:#1c2438;border-radius:4px;display:flex;align-items:center;justify-content:center;color:${v==='?'?'#6366f1':'#818cf8'};font-size:14px;font-weight:bold;">${v}</div>`).join('')}
                </div>
            </div>`
    },
    {
        id: 'spatialrotation',
        name: 'Spatial Rotation',
        description: 'Find the rotated version of the shape',
        scoreLabel: 'Best Score',
        scoreKey: 'spatialrotation-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/SpatialRotation.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;gap:16px;flex-direction:column;">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;width:60px;height:60px;">
                    ${[1,0,0,0,1,1,0,0,0,1,0,0,0,1,0,0].map(v=>`<div style="background:${v?'#6366f1':'rgba(255,255,255,0.04)'};border-radius:2px;"></div>`).join('')}
                </div>
                <div style="color:#64748b;font-size:11px;">Which rotation matches?</div>
            </div>`
    },
    {
        id: 'taskswitch',
        name: 'Task Switch',
        description: 'Alternate between ODD/EVEN and HIGH/LOW',
        scoreLabel: 'Best Score',
        scoreKey: 'taskswitch-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/TaskSwitch.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:10px;">
                <div style="color:#818cf8;font-size:12px;">ODD or EVEN?</div>
                <div style="font-size:3rem;font-weight:bold;color:#fcd34d;">7</div>
                <div style="display:flex;gap:8px;">
                    <div style="background:#2d3561;color:#c8d0df;padding:5px 12px;border-radius:6px;font-size:11px;">ODD</div>
                    <div style="background:#1c2438;color:#4a5568;padding:5px 12px;border-radius:6px;font-size:11px;">EVEN</div>
                </div>
            </div>`
    },
    {
        id: 'speedmatch',
        name: 'Speed Match',
        description: 'Rapid same/different perceptual judgments',
        scoreLabel: 'Best Score',
        scoreKey: 'speedmatch-best',
        scoreDefault: 0,
        category: 'iq',
        module: () => import('../games/SpeedMatch.js'),
        previewHTML: `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px;flex-direction:column;gap:10px;">
                <div style="color:#818cf8;font-size:12px;">Same SHAPE?</div>
                <div style="display:flex;gap:20px;align-items:center;">
                    <span style="color:#e74c3c;font-size:2.5rem;">★</span>
                    <span style="color:#3498db;font-size:2.5rem;">★</span>
                </div>
                <div style="display:flex;gap:8px;">
                    <div style="background:#166534;color:#4ade80;padding:4px 10px;border-radius:6px;font-size:11px;">SAME</div>
                    <div style="background:#1c2438;color:#4a5568;padding:4px 10px;border-radius:6px;font-size:11px;">DIFF</div>
                </div>
            </div>`
    }
];
