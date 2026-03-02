import { storage, notifyScoreUpdate } from '../core/storage.js';

const QS = [
    {premise:['All dogs are animals.','Rex is a dog.'],conclusion:'Rex is an animal.',answer:'TRUE'},
    {premise:['All birds have wings.','A penguin is a bird.'],conclusion:'A penguin can fly.',answer:'UNCERTAIN'},
    {premise:['No fish can walk.','Nemo is a fish.'],conclusion:'Nemo cannot walk.',answer:'TRUE'},
    {premise:['Some cats are black.','Whiskers is a cat.'],conclusion:'Whiskers is black.',answer:'UNCERTAIN'},
    {premise:['All squares are rectangles.','Shape A is a square.'],conclusion:'Shape A is a rectangle.',answer:'TRUE'},
    {premise:['All roses are flowers.','No flowers are animals.'],conclusion:'No roses are animals.',answer:'TRUE'},
    {premise:['Some students study hard.','Ali is a student.'],conclusion:'Ali studies hard.',answer:'UNCERTAIN'},
    {premise:['If it rains, the ground is wet.','It is raining.'],conclusion:'The ground is wet.',answer:'TRUE'},
    {premise:['If it rains, the ground is wet.','The ground is wet.'],conclusion:'It is raining.',answer:'UNCERTAIN'},
    {premise:['All metals conduct electricity.','Wood is not a metal.'],conclusion:'Wood does not conduct electricity.',answer:'UNCERTAIN'},
    {premise:['No mammals lay eggs.','A platypus is a mammal.'],conclusion:'A platypus does not lay eggs.',answer:'FALSE'},
    {premise:['All A are B.','All B are C.'],conclusion:'All A are C.',answer:'TRUE'},
    {premise:['Some A are B.','All B are C.'],conclusion:'Some A are C.',answer:'TRUE'},
    {premise:['No A are B.','All C are B.'],conclusion:'No C are A.',answer:'TRUE'},
    {premise:['All doctors are educated.','Some educated people are rich.'],conclusion:'Some doctors are rich.',answer:'UNCERTAIN'},
    {premise:['If X > 5, then X > 3.','X = 7.'],conclusion:'X > 3.',answer:'TRUE'},
    {premise:['All prime numbers are odd.','2 is a prime number.'],conclusion:'2 is odd.',answer:'FALSE'},
    {premise:['Every action has an equal reaction.','Pushing a wall is an action.'],conclusion:'The wall pushes back.',answer:'TRUE'},
    {premise:['All cats are mammals.','All mammals are warm-blooded.'],conclusion:'All cats are warm-blooded.',answer:'TRUE'},
    {premise:['Some politicians are honest.','No honest person is corrupt.'],conclusion:'Some politicians are not corrupt.',answer:'TRUE'},
    {premise:['If a shape is a triangle, it has 3 sides.','Shape B has 4 sides.'],conclusion:'Shape B is not a triangle.',answer:'TRUE'},
    {premise:['All cars need fuel.','This vehicle needs no fuel.'],conclusion:'This vehicle is not a car.',answer:'TRUE'},
    {premise:['Some birds migrate in winter.','Penguins are birds.'],conclusion:'Penguins migrate in winter.',answer:'UNCERTAIN'},
    {premise:['No reptile is warm-blooded.','A cobra is a reptile.'],conclusion:'A cobra is not warm-blooded.',answer:'TRUE'},
    {premise:['All happy people smile.','John is smiling.'],conclusion:'John is happy.',answer:'UNCERTAIN'},
];

function shuffle(a){return [...a].sort(()=>Math.random()-0.5);}
const OPTS=['TRUE','FALSE','UNCERTAIN'];

export default class LogicReasoningGame {
    constructor(){
        this.score=0; this.timeLeft=90; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('logicreasoning-best')||0;
        this.pool=[]; this.current=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Logic Reasoning</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="lrScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="lrTime">90</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="lrBest">${this.best}</div></div>
            </div>
            <div class="lr-container">
                <div class="lr-premises" id="lrPremises"></div>
                <div class="lr-conclusion" id="lrConclusion"></div>
                <div class="lr-opts" id="lrOpts"></div>
                <div class="lr-feedback" id="lrFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="lrStart">Start</button>
                    <button class="btn" id="lrReset">Reset</button>
                </div>
                <div class="game-instructions">Is the conclusion True, False, or Uncertain?</div>
            </div>`;
        document.getElementById('lrStart').addEventListener('click',()=>this.start());
        document.getElementById('lrReset').addEventListener('click',()=>this.reset());
    }
    _next(){
        if(!this.pool.length) this.pool=shuffle(QS);
        this.current=this.pool.pop();
        document.getElementById('lrPremises').innerHTML=this.current.premise.map(p=>`<div class="lr-premise">${p}</div>`).join('');
        document.getElementById('lrConclusion').textContent=`Therefore: "${this.current.conclusion}"`;
        document.getElementById('lrFeedback').textContent='';
        const el=document.getElementById('lrOpts');
        el.innerHTML='';
        OPTS.forEach(o=>{
            const btn=document.createElement('button');
            btn.className=`lr-opt-btn lr-${o.toLowerCase()}`;
            btn.textContent=o;
            btn.addEventListener('click',()=>this._pick(o,btn));
            el.appendChild(btn);
        });
    }
    _pick(v,btn){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.lr-opt-btn').forEach(b=>b.disabled=true);
        const fb=document.getElementById('lrFeedback');
        if(v===this.current.answer){
            this.score++;
            document.getElementById('lrScore').textContent=this.score;
            btn.classList.add('lr-selected-correct');
            fb.textContent='✓ Correct!'; fb.className='lr-feedback lr-fb-correct';
        } else {
            btn.classList.add('lr-selected-wrong');
            document.querySelectorAll('.lr-opt-btn').forEach(b=>{if(b.textContent===this.current.answer)b.classList.add('lr-selected-correct');});
            fb.textContent=`✗ Answer: ${this.current.answer}`; fb.className='lr-feedback lr-fb-wrong';
        }
        setTimeout(()=>this._next(),1000);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=90;
        this.pool=shuffle(QS);
        document.getElementById('lrScore').textContent='0';
        document.getElementById('lrStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('lrTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('lrStart').disabled=false;
        document.getElementById('lrOpts').innerHTML='';
        document.getElementById('lrFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('logicreasoning-best',this.best); notifyScoreUpdate(); document.getElementById('lrBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=90;
        document.getElementById('lrScore').textContent='0';
        document.getElementById('lrTime').textContent='90';
        document.getElementById('lrStart').disabled=false;
        document.getElementById('lrPremises').innerHTML='';
        document.getElementById('lrConclusion').textContent='';
        document.getElementById('lrOpts').innerHTML='';
        document.getElementById('lrFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer);}
}
