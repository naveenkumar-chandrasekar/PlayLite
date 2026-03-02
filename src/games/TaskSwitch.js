import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class TaskSwitchGame {
    constructor(){
        this.score=0; this.errors=0; this.timeLeft=60;
        this.gameStarted=false; this.gameOver=false; this.timer=null;
        this.best=storage.get('taskswitch-best')||0;
        this.task=null; this.num=null; this.awaitingResponse=false;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Task Switch</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="tsScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="tsTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="tsBest">${this.best}</div></div>
            </div>
            <div class="ts-container">
                <div class="ts-task-label" id="tsTaskLabel">—</div>
                <div class="ts-number" id="tsNumber">?</div>
                <div class="ts-buttons" id="tsButtons">
                    <button class="btn ts-btn" id="tsLeft" disabled></button>
                    <button class="btn ts-btn" id="tsRight" disabled></button>
                </div>
                <div class="ts-feedback" id="tsFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="tsStart">Start</button>
                    <button class="btn" id="tsReset">Reset</button>
                </div>
                <div class="game-instructions">Alternate between two classification tasks based on the prompt</div>
            </div>`;
        document.getElementById('tsStart').addEventListener('click',()=>this.start());
        document.getElementById('tsReset').addEventListener('click',()=>this.reset());
        document.getElementById('tsLeft').addEventListener('click',()=>this._answer('left'));
        document.getElementById('tsRight').addEventListener('click',()=>this._answer('right'));
        document.addEventListener('keydown',this._keyHandler=e=>{
            if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') this._answer('left');
            if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') this._answer('right');
        });
    }
    _next(){
        const tasks=['odd/even','high/low'];
        this.task=tasks[Math.floor(Math.random()*tasks.length)];
        this.num=Math.floor(Math.random()*8)+1; // 1-8, avoid 5 confusion but keep it
        if(this.num===5) this.num=Math.random()<0.5?4:6;
        this.awaitingResponse=true;
        const label=document.getElementById('tsTaskLabel');
        const numEl=document.getElementById('tsNumber');
        const left=document.getElementById('tsLeft');
        const right=document.getElementById('tsRight');
        document.getElementById('tsFeedback').textContent='';
        numEl.textContent=this.num;
        if(this.task==='odd/even'){
            label.textContent='ODD  or  EVEN?';
            label.className='ts-task-label ts-task-oe';
            left.textContent='ODD'; right.textContent='EVEN';
        } else {
            label.textContent='HIGH (>4)  or  LOW (≤4)?';
            label.className='ts-task-label ts-task-hl';
            left.textContent='LOW'; right.textContent='HIGH';
        }
        left.disabled=false; right.disabled=false;
    }
    _answer(side){
        if(!this.gameStarted||this.gameOver||!this.awaitingResponse) return;
        this.awaitingResponse=false;
        document.getElementById('tsLeft').disabled=true;
        document.getElementById('tsRight').disabled=true;
        let correct=false;
        if(this.task==='odd/even'){
            const isOdd=this.num%2!==0;
            correct=(isOdd&&side==='left')||(!isOdd&&side==='right');
        } else {
            const isHigh=this.num>4;
            correct=(isHigh&&side==='right')||(!isHigh&&side==='left');
        }
        const fb=document.getElementById('tsFeedback');
        if(correct){
            this.score++;
            document.getElementById('tsScore').textContent=this.score;
            fb.textContent='✓'; fb.className='ts-feedback ts-correct';
        } else {
            this.errors++;
            fb.textContent='✗'; fb.className='ts-feedback ts-wrong';
        }
        setTimeout(()=>this._next(),400);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.errors=0; this.timeLeft=60;
        document.getElementById('tsScore').textContent='0';
        document.getElementById('tsStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('tsTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('tsStart').disabled=false;
        document.getElementById('tsLeft').disabled=true;
        document.getElementById('tsRight').disabled=true;
        document.getElementById('tsNumber').textContent='Done';
        document.getElementById('tsTaskLabel').textContent='';
        document.getElementById('tsFeedback').textContent=`Score: ${this.score} | Errors: ${this.errors}`;
        if(this.score>this.best){this.best=this.score; storage.set('taskswitch-best',this.best); notifyScoreUpdate(); document.getElementById('tsBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.errors=0; this.timeLeft=60; this.awaitingResponse=false;
        document.getElementById('tsScore').textContent='0';
        document.getElementById('tsTime').textContent='60';
        document.getElementById('tsStart').disabled=false;
        document.getElementById('tsLeft').disabled=true;
        document.getElementById('tsRight').disabled=true;
        document.getElementById('tsNumber').textContent='?';
        document.getElementById('tsTaskLabel').textContent='—';
        document.getElementById('tsFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer); document.removeEventListener('keydown',this._keyHandler);}
}
