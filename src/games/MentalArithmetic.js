import { storage, notifyScoreUpdate } from '../core/storage.js';

const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

function genChain(difficulty){
    const steps=difficulty<=2?3:difficulty<=4?4:5;
    let val=rnd(5,25);
    const chain=[val];
    const ops=['+','-','×','÷'];
    for(let i=0;i<steps;i++){
        const valid=[];
        if(val<80) valid.push('+');
        if(val>5) valid.push('-');
        if(val<=15) valid.push('×');
        if(val>1&&val%2===0) valid.push('÷');
        const op=valid[Math.floor(Math.random()*valid.length)];
        let operand, result;
        if(op==='+'){operand=rnd(1,Math.min(20,95-val)); result=val+operand;}
        else if(op==='-'){operand=rnd(1,val-1); result=val-operand;}
        else if(op==='×'){operand=rnd(2,Math.min(4,Math.floor(80/val))); result=val*operand;}
        else{const divisors=[2,3,4,5].filter(d=>val%d===0&&val/d>=2); operand=divisors[0]||2; if(val%operand!==0){chain.push({op:'+',operand:1}); val+=1;} result=val/operand;}
        chain.push({op,operand}); val=result;
    }
    return{chain,answer:val};
}

function chainToString(chain){
    let s=String(chain[0]);
    for(let i=1;i<chain.length;i++) s+=` ${chain[i].op} ${chain[i].operand}`;
    return s+' = ?';
}

function makeChoices(answer){
    const s=new Set([answer]);
    const offsets=[1,2,3,4,5,7,10,-1,-2,-3];
    for(const o of offsets.sort(()=>Math.random()-0.5)){
        if(s.size>=4) break;
        const v=answer+o;
        if(v>0) s.add(v);
    }
    while(s.size<4) s.add(answer+s.size*3);
    return [...s].sort(()=>Math.random()-0.5);
}

export default class MentalArithmeticGame {
    constructor(){
        this.score=0; this.timeLeft=90; this.difficulty=1;
        this.gameStarted=false; this.gameOver=false; this.timer=null;
        this.best=storage.get('mentalarithmetic-best')||0;
        this.current=null; this.streak=0;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Mental Arithmetic</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="maScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="maTime">90</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="maBest">${this.best}</div></div>
            </div>
            <div class="ma-container">
                <div class="ma-chain" id="maChain">Compute left-to-right</div>
                <div class="ma-options" id="maOptions"></div>
                <div class="ma-feedback" id="maFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="maStart">Start</button>
                    <button class="btn" id="maReset">Reset</button>
                </div>
                <div class="game-instructions">Compute left to right (no PEMDAS)</div>
            </div>`;
        document.getElementById('maStart').addEventListener('click',()=>this.start());
        document.getElementById('maReset').addEventListener('click',()=>this.reset());
    }
    _next(){
        this.current=genChain(this.difficulty);
        document.getElementById('maChain').textContent=chainToString(this.current.chain);
        document.getElementById('maFeedback').textContent='';
        const opts=makeChoices(this.current.answer);
        const el=document.getElementById('maOptions');
        el.innerHTML='';
        opts.forEach(v=>{
            const btn=document.createElement('button');
            btn.className='ma-opt-btn';
            btn.textContent=v;
            btn.addEventListener('click',()=>this._pick(v,btn));
            el.appendChild(btn);
        });
    }
    _pick(v,btn){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.ma-opt-btn').forEach(b=>b.disabled=true);
        const fb=document.getElementById('maFeedback');
        if(v===this.current.answer){
            this.streak++; this.score+=1+Math.floor(this.streak/3);
            document.getElementById('maScore').textContent=this.score;
            btn.classList.add('ma-correct');
            fb.textContent=this.streak>=3?`✓ Streak ×${this.streak}!`:'✓ Correct!';
            fb.className='ma-feedback ma-fb-correct';
            if(this.streak%5===0) this.difficulty=Math.min(8,this.difficulty+1);
        } else {
            this.streak=0;
            btn.classList.add('ma-wrong');
            document.querySelectorAll('.ma-opt-btn').forEach(b=>{if(parseInt(b.textContent)===this.current.answer)b.classList.add('ma-correct');});
            fb.textContent=`✗ Answer: ${this.current.answer}`; fb.className='ma-feedback ma-fb-wrong';
        }
        setTimeout(()=>this._next(),800);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=90;
        this.difficulty=1; this.streak=0;
        document.getElementById('maScore').textContent='0';
        document.getElementById('maStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('maTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('maStart').disabled=false;
        document.getElementById('maOptions').innerHTML='';
        document.getElementById('maFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('mentalarithmetic-best',this.best); notifyScoreUpdate(); document.getElementById('maBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=90; this.difficulty=1; this.streak=0;
        document.getElementById('maScore').textContent='0';
        document.getElementById('maTime').textContent='90';
        document.getElementById('maStart').disabled=false;
        document.getElementById('maChain').textContent='Compute left-to-right';
        document.getElementById('maOptions').innerHTML='';
        document.getElementById('maFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer);}
}
