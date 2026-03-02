import { storage, notifyScoreUpdate } from '../core/storage.js';

const ITEMS = ['★','♦','♠','♥','◆','▲','●','■','◇','✿','⬡','⬟'];
const COLORS = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c'];

function randItem(){return{sym:ITEMS[Math.floor(Math.random()*ITEMS.length)],color:COLORS[Math.floor(Math.random()*COLORS.length)]};}

export default class SpeedMatchGame {
    constructor(){
        this.score=0; this.timeLeft=60; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('speedmatch-best')||0;
        this.left=null; this.right=null; this.matchType=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Speed Match</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="smScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="smTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="smBest">${this.best}</div></div>
            </div>
            <div class="sm-container">
                <div class="sm-match-type" id="smMatchType">—</div>
                <div class="sm-pair" id="smPair">
                    <div class="sm-symbol" id="smLeft"></div>
                    <div class="sm-symbol" id="smRight"></div>
                </div>
                <div class="sm-buttons">
                    <button class="btn sm-btn sm-same" id="smSame" disabled>SAME</button>
                    <button class="btn sm-btn sm-diff" id="smDiff" disabled>DIFFERENT</button>
                </div>
                <div class="sm-feedback" id="smFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="smStart">Start</button>
                    <button class="btn" id="smReset">Reset</button>
                </div>
                <div class="game-instructions">Are the two symbols SAME or DIFFERENT in the highlighted property? (← same / → different)</div>
            </div>`;
        document.getElementById('smStart').addEventListener('click',()=>this.start());
        document.getElementById('smReset').addEventListener('click',()=>this.reset());
        document.getElementById('smSame').addEventListener('click',()=>this._answer(true));
        document.getElementById('smDiff').addEventListener('click',()=>this._answer(false));
        document.addEventListener('keydown',this._keyHandler=e=>{
            if(e.key==='ArrowLeft'||e.key==='s'||e.key==='S') this._answer(true);
            if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') this._answer(false);
        });
    }
    _next(){
        const types=['shape','color','both'];
        this.matchType=types[Math.floor(Math.random()*types.length)];
        this.left=randItem();
        const same=Math.random()<0.5;
        if(this.matchType==='shape'){
            this.right=same?{sym:this.left.sym,color:COLORS[Math.floor(Math.random()*COLORS.length)]}:{sym:ITEMS.filter(i=>i!==this.left.sym)[Math.floor(Math.random()*(ITEMS.length-1))],color:COLORS[Math.floor(Math.random()*COLORS.length)]};
            this._expected=this.right.sym===this.left.sym;
        } else if(this.matchType==='color'){
            this.right=same?{sym:ITEMS[Math.floor(Math.random()*ITEMS.length)],color:this.left.color}:{sym:ITEMS[Math.floor(Math.random()*ITEMS.length)],color:COLORS.filter(c=>c!==this.left.color)[Math.floor(Math.random()*(COLORS.length-1))]};
            this._expected=this.right.color===this.left.color;
        } else {
            this.right=same?{...this.left}:randItem();
            while(!same&&this.right.sym===this.left.sym&&this.right.color===this.left.color) this.right=randItem();
            this._expected=this.right.sym===this.left.sym&&this.right.color===this.left.color;
        }
        document.getElementById('smLeft').innerHTML=`<span style="color:${this.left.color};font-size:2.5rem;">${this.left.sym}</span>`;
        document.getElementById('smRight').innerHTML=`<span style="color:${this.right.color};font-size:2.5rem;">${this.right.sym}</span>`;
        const labels={'shape':'Same SHAPE?','color':'Same COLOR?','both':'Identical?'};
        document.getElementById('smMatchType').textContent=labels[this.matchType];
        document.getElementById('smFeedback').textContent='';
        document.getElementById('smSame').disabled=false;
        document.getElementById('smDiff').disabled=false;
    }
    _answer(isSame){
        if(!this.gameStarted||this.gameOver) return;
        document.getElementById('smSame').disabled=true;
        document.getElementById('smDiff').disabled=true;
        const fb=document.getElementById('smFeedback');
        if(isSame===this._expected){
            this.score++;
            document.getElementById('smScore').textContent=this.score;
            fb.textContent='✓'; fb.className='sm-feedback sm-correct';
        } else {
            fb.textContent='✗'; fb.className='sm-feedback sm-wrong';
        }
        setTimeout(()=>this._next(),350);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=60;
        document.getElementById('smScore').textContent='0';
        document.getElementById('smStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('smTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('smStart').disabled=false;
        document.getElementById('smSame').disabled=true;
        document.getElementById('smDiff').disabled=true;
        document.getElementById('smFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('speedmatch-best',this.best); notifyScoreUpdate(); document.getElementById('smBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=60;
        document.getElementById('smScore').textContent='0';
        document.getElementById('smTime').textContent='60';
        document.getElementById('smStart').disabled=false;
        document.getElementById('smSame').disabled=true;
        document.getElementById('smDiff').disabled=true;
        document.getElementById('smLeft').innerHTML='';
        document.getElementById('smRight').innerHTML='';
        document.getElementById('smMatchType').textContent='—';
        document.getElementById('smFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer); document.removeEventListener('keydown',this._keyHandler);}
}
