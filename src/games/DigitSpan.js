import { storage, notifyScoreUpdate } from '../core/storage.js';

export default class DigitSpanGame {
    constructor(){
        this.span=3; this.best=storage.get('digitspan-best')||0;
        this.phase='idle'; this.sequence=[]; this.showIdx=0;
        this.mode='forward'; this.showTimer=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Digit Span</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Span</div><div class="score-value" id="dsSpan">${this.span}</div></div>
                <div class="score-display"><div class="score-label">Mode</div><div class="score-value" id="dsMode">Forward</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="dsBest">${this.best}</div></div>
            </div>
            <div class="ds-container">
                <div class="ds-mode-btns">
                    <button class="btn ds-mode-btn active" data-mode="forward">Forward</button>
                    <button class="btn ds-mode-btn" data-mode="backward">Backward</button>
                </div>
                <div class="ds-display" id="dsDisplay">Ready?</div>
                <div class="ds-input-area" id="dsInputArea" style="display:none">
                    <input type="tel" id="dsInput" class="ds-input" placeholder="Enter digits..." maxlength="12" autocomplete="off">
                    <button class="btn" id="dsSubmit">Submit</button>
                </div>
                <div class="ds-feedback" id="dsFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="dsStart">Start</button>
                    <button class="btn" id="dsReset">Reset</button>
                </div>
                <div class="game-instructions">Memorize the digits, then type them in ${this.mode} order</div>
            </div>`;
        document.querySelectorAll('.ds-mode-btn').forEach(btn=>btn.addEventListener('click',()=>{
            this.mode=btn.dataset.mode;
            document.querySelectorAll('.ds-mode-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('dsMode').textContent=this.mode==='forward'?'Forward':'Backward';
            document.querySelector('.game-instructions').textContent=`Memorize the digits, then type them in ${this.mode} order`;
        }));
        document.getElementById('dsStart').addEventListener('click',()=>this._startRound());
        document.getElementById('dsReset').addEventListener('click',()=>this.reset());
        document.getElementById('dsSubmit').addEventListener('click',()=>this._check());
        document.getElementById('dsInput').addEventListener('keydown',e=>{if(e.key==='Enter')this._check();});
    }
    _startRound(){
        this.sequence=Array.from({length:this.span},()=>Math.floor(Math.random()*10));
        this.showIdx=0; this.phase='showing';
        document.getElementById('dsStart').disabled=true;
        document.getElementById('dsInputArea').style.display='none';
        document.getElementById('dsFeedback').textContent='';
        this._showNext();
    }
    _showNext(){
        if(this.showIdx>=this.sequence.length){
            document.getElementById('dsDisplay').textContent='?';
            this.phase='input';
            document.getElementById('dsInputArea').style.display='flex';
            const inp=document.getElementById('dsInput');
            inp.value=''; inp.focus();
            return;
        }
        document.getElementById('dsDisplay').textContent=this.sequence[this.showIdx];
        this.showIdx++;
        this.showTimer=setTimeout(()=>{
            document.getElementById('dsDisplay').textContent='';
            this.showTimer=setTimeout(()=>this._showNext(),300);
        },800);
    }
    _check(){
        if(this.phase!=='input') return;
        const val=document.getElementById('dsInput').value.trim().replace(/\s/g,'');
        const entered=val.split('').map(Number);
        const expected=this.mode==='forward'?[...this.sequence]:[...this.sequence].reverse();
        const correct=entered.length===expected.length&&entered.every((d,i)=>d===expected[i]);
        const fb=document.getElementById('dsFeedback');
        document.getElementById('dsInputArea').style.display='none';
        if(correct){
            this.span++;
            document.getElementById('dsSpan').textContent=this.span;
            fb.textContent=`✓ Correct! Advancing to span ${this.span}`;
            fb.className='ds-feedback ds-correct';
            if(this.span-1>this.best){this.best=this.span-1; storage.set('digitspan-best',this.best); notifyScoreUpdate(); document.getElementById('dsBest').textContent=this.best;}
            document.getElementById('dsStart').disabled=false;
            document.getElementById('dsDisplay').textContent='Ready?';
        } else {
            fb.textContent=`✗ Expected: ${expected.join(' ')}`;
            fb.className='ds-feedback ds-wrong';
            if(this.span>3){
                fb.textContent+=` | Span reset to 3`;
                this.span=3;
                document.getElementById('dsSpan').textContent=this.span;
            }
            document.getElementById('dsStart').disabled=false;
            document.getElementById('dsDisplay').textContent='Try again?';
        }
    }
    reset(){
        clearTimeout(this.showTimer); this.span=3; this.phase='idle';
        document.getElementById('dsSpan').textContent='3';
        document.getElementById('dsDisplay').textContent='Ready?';
        document.getElementById('dsInputArea').style.display='none';
        document.getElementById('dsFeedback').textContent='';
        document.getElementById('dsStart').disabled=false;
    }
    cleanup(){clearTimeout(this.showTimer);}
}
