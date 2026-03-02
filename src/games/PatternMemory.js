import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class PatternMemoryGame {
    constructor(){
        this.span=3; this.best=storage.get('patternmemory-best')||0;
        this.sequence=[]; this.clicked=[];
        this.phase='idle'; this.showTimer=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Pattern Memory</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Span</div><div class="score-value" id="pmSpan">${this.span}</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="pmBest">${this.best}</div></div>
            </div>
            <div class="pm-container">
                <div class="pm-instruction" id="pmInstruction">Watch the pattern, then click the same squares in order</div>
                <div class="pm-grid" id="pmGrid"></div>
                <div class="pm-feedback" id="pmFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="pmStart">Start</button>
                    <button class="btn" id="pmReset">Reset</button>
                </div>
            </div>`;
        this._buildGrid();
        document.getElementById('pmStart').addEventListener('click',()=>this._startRound());
        document.getElementById('pmReset').addEventListener('click',()=>this.reset());
    }
    _buildGrid(){
        const grid=document.getElementById('pmGrid');
        grid.innerHTML='';
        for(let i=0;i<16;i++){
            const cell=document.createElement('div');
            cell.className='pm-cell';
            cell.dataset.idx=i;
            cell.addEventListener('click',()=>this._cellClick(i));
            grid.appendChild(cell);
        }
    }
    _startRound(){
        const available=[...Array(16).keys()];
        this.sequence=[];
        for(let i=0;i<this.span;i++){
            const idx=Math.floor(Math.random()*available.length);
            this.sequence.push(available.splice(idx,1)[0]);
        }
        this.clicked=[]; this.phase='showing';
        document.getElementById('pmStart').disabled=true;
        document.getElementById('pmFeedback').textContent='';
        document.getElementById('pmInstruction').textContent='Watch…';
        document.querySelectorAll('.pm-cell').forEach(c=>{c.classList.remove('pm-active','pm-user','pm-correct','pm-wrong'); c.style.pointerEvents='none';});
        this._showSequence(0);
    }
    _showSequence(idx){
        if(idx>=this.sequence.length){
            document.querySelectorAll('.pm-cell').forEach(c=>c.style.pointerEvents='');
            this.phase='input';
            document.getElementById('pmInstruction').textContent=`Repeat the ${this.span}-step pattern`;
            return;
        }
        const cell=document.querySelector(`.pm-cell[data-idx="${this.sequence[idx]}"]`);
        cell.classList.add('pm-active');
        this.showTimer=setTimeout(()=>{
            cell.classList.remove('pm-active');
            this.showTimer=setTimeout(()=>this._showSequence(idx+1),300);
        },700);
    }
    _cellClick(idx){
        if(this.phase!=='input') return;
        const cell=document.querySelector(`.pm-cell[data-idx="${idx}"]`);
        const expected=this.sequence[this.clicked.length];
        this.clicked.push(idx);
        if(idx===expected){
            cell.classList.add('pm-user');
            if(this.clicked.length===this.sequence.length){
                this.phase='done';
                this.span++;
                document.getElementById('pmSpan').textContent=this.span;
                document.getElementById('pmFeedback').textContent=`✓ Perfect! Advancing to span ${this.span}`;
                document.getElementById('pmFeedback').className='pm-feedback pm-correct';
                if(this.span-1>this.best){this.best=this.span-1; storage.set('patternmemory-best',this.best); notifyScoreUpdate(); document.getElementById('pmBest').textContent=this.best;}
                document.getElementById('pmStart').disabled=false;
                document.getElementById('pmInstruction').textContent='Ready for next round?';
            }
        } else {
            cell.classList.add('pm-wrong');
            this.sequence.forEach(i=>document.querySelector(`.pm-cell[data-idx="${i}"]`).classList.add('pm-correct'));
            this.phase='done';
            document.getElementById('pmFeedback').textContent=`✗ Wrong! Span reset to 3`;
            document.getElementById('pmFeedback').className='pm-feedback pm-fb-wrong';
            this.span=3;
            document.getElementById('pmSpan').textContent='3';
            document.getElementById('pmStart').disabled=false;
            document.getElementById('pmInstruction').textContent='Try again?';
            document.querySelectorAll('.pm-cell').forEach(c=>c.style.pointerEvents='none');
        }
    }
    reset(){
        clearTimeout(this.showTimer); this.span=3; this.phase='idle';
        document.getElementById('pmSpan').textContent='3';
        document.getElementById('pmFeedback').textContent='';
        document.getElementById('pmInstruction').textContent='Watch the pattern, then click the same squares in order';
        document.getElementById('pmStart').disabled=false;
        document.querySelectorAll('.pm-cell').forEach(c=>{c.className='pm-cell'; c.style.pointerEvents='';});
    }
    cleanup(){clearTimeout(this.showTimer);}
}
