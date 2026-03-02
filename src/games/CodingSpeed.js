import { storage, notifyScoreUpdate } from '../core/storage.js';

const SYMBOLS = ['★','♦','♠','♥','◆','▲','●','■','◇'];

export default class CodingSpeedGame {
    constructor(){
        this.score=0; this.timeLeft=90; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('codingspeed-best')||0;
        this.current=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Coding Speed</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="csScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="csTime">90</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="csBest">${this.best}</div></div>
            </div>
            <div class="cs-container">
                <div class="cs-key-table" id="csKeyTable"></div>
                <div class="cs-stimulus" id="csStimulus">?</div>
                <div class="cs-digit-btns" id="csDigitBtns"></div>
                <div class="cs-feedback" id="csFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="csStart">Start</button>
                    <button class="btn" id="csReset">Reset</button>
                </div>
                <div class="game-instructions">Look up the symbol in the key table and click its number</div>
            </div>`;
        this._buildKeyTable();
        this._buildDigitBtns();
        document.getElementById('csStart').addEventListener('click',()=>this.start());
        document.getElementById('csReset').addEventListener('click',()=>this.reset());
    }
    _buildKeyTable(){
        const el=document.getElementById('csKeyTable');
        el.innerHTML='';
        SYMBOLS.forEach((sym,i)=>{
            const cell=document.createElement('div');
            cell.className='cs-key-cell';
            cell.innerHTML=`<div class="cs-key-digit">${i+1}</div><div class="cs-key-sym">${sym}</div>`;
            el.appendChild(cell);
        });
    }
    _buildDigitBtns(){
        const el=document.getElementById('csDigitBtns');
        el.innerHTML='';
        for(let i=1;i<=9;i++){
            const btn=document.createElement('button');
            btn.className='cs-digit-btn';
            btn.textContent=i;
            btn.addEventListener('click',()=>this._pick(i));
            el.appendChild(btn);
        }
    }
    _next(){
        this.current=Math.floor(Math.random()*9);
        document.getElementById('csStimulus').textContent=SYMBOLS[this.current];
        document.getElementById('csFeedback').textContent='';
        document.querySelectorAll('.cs-digit-btn').forEach(b=>{b.disabled=false; b.className='cs-digit-btn';});
    }
    _pick(digit){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.cs-digit-btn').forEach(b=>b.disabled=true);
        const correct=this.current+1;
        const fb=document.getElementById('csFeedback');
        if(digit===correct){
            this.score++;
            document.getElementById('csScore').textContent=this.score;
            fb.textContent='✓'; fb.className='cs-feedback cs-correct';
        } else {
            fb.textContent=`✗ Was ${correct}`; fb.className='cs-feedback cs-wrong';
        }
        setTimeout(()=>this._next(),300);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=90;
        document.getElementById('csScore').textContent='0';
        document.getElementById('csStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('csTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('csStart').disabled=false;
        document.getElementById('csStimulus').textContent='Done';
        document.querySelectorAll('.cs-digit-btn').forEach(b=>b.disabled=true);
        document.getElementById('csFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('codingspeed-best',this.best); notifyScoreUpdate(); document.getElementById('csBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=90;
        document.getElementById('csScore').textContent='0';
        document.getElementById('csTime').textContent='90';
        document.getElementById('csStart').disabled=false;
        document.getElementById('csStimulus').textContent='?';
        document.getElementById('csFeedback').textContent='';
        document.querySelectorAll('.cs-digit-btn').forEach(b=>{b.disabled=false; b.className='cs-digit-btn';});
    }
    cleanup(){clearInterval(this.timer);}
}
