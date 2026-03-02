import { storage, notifyScoreUpdate } from '../core/storage.js';

const QS = [
    {items:['apple','banana','grape','carrot'],odd:3,hint:'not a fruit'},
    {items:['eagle','sparrow','penguin','hawk'],odd:2,hint:'cannot fly'},
    {items:['salmon','tuna','shark','dolphin'],odd:3,hint:'mammal, not fish'},
    {items:['ant','bee','spider','butterfly'],odd:2,hint:'arachnid, not insect'},
    {items:['dog','cat','snake','hamster'],odd:2,hint:'reptile'},
    {items:['north','south','east','up'],odd:3,hint:'not a compass direction'},
    {items:['Mercury','Venus','Mars','Moon'],odd:3,hint:'not a planet'},
    {items:['2','4','6','9'],odd:3,hint:'odd number'},
    {items:['4','8','16','12'],odd:3,hint:'not a power of 2'},
    {items:['3','7','11','9'],odd:3,hint:'9 is not prime'},
    {items:['km','kg','meter','mile'],odd:1,hint:'unit of weight'},
    {items:['red','blue','cloud','green'],odd:2,hint:'not a color'},
    {items:['piano','drum','guitar','violin'],odd:0,hint:'keyboard, not string/percussion'},
    {items:['rose','tulip','daisy','fern'],odd:3,hint:'not a flowering plant'},
    {items:['iron','copper','glass','silver'],odd:2,hint:'not a metal'},
    {items:['Paris','London','Tokyo','Amazon'],odd:3,hint:'not a capital city'},
    {items:['square','circle','triangle','cube'],odd:3,hint:'3D shape'},
    {items:['1','4','9','16'],odd:3,hint:'16 breaks if pattern is 1²,2²,3²... wait all are squares; use different set'},
    {items:['5','10','15','22'],odd:3,hint:'not a multiple of 5'},
    {items:['tennis','golf','chess','football'],odd:2,hint:'board game, not sport'},
    {items:['oxygen','nitrogen','iron','helium'],odd:2,hint:'not a gas at room temp'},
    {items:['blue','red','green','purple'],odd:3,hint:'secondary color (mixed)'},
    {items:['winter','summer','autumn','morning'],odd:3,hint:'not a season'},
    {items:['Jupiter','Saturn','Neptune','Pluto'],odd:3,hint:'dwarf planet'},
    {items:['violin','cello','harp','flute'],odd:3,hint:'wind, not string instrument'},
    {items:['triangle','hexagon','pentagon','circle'],odd:3,hint:'no straight sides'},
    {items:['2','3','5','6'],odd:3,hint:'not prime'},
    {items:['gold','silver','bronze','copper'],odd:3,hint:'not a medal color (Olympic)'},
    {items:['swim','run','jump','sing'],odd:3,hint:'not physical movement'},
    {items:['table','chair','lamp','sofa'],odd:2,hint:'not furniture (gives light)'},
    {items:['Earth','Mars','Jupiter','Sun'],odd:3,hint:'not a planet (star)'},
    {items:['Monday','Wednesday','Sunday','July'],odd:3,hint:'not a day of week'},
    {items:['8','27','64','36'],odd:3,hint:'not a perfect cube (36=6²)'},
    {items:['cm','mm','inch','liter'],odd:3,hint:'unit of volume, not length'},
    {items:['Shakespeare','Dickens','Mozart','Tolstoy'],odd:2,hint:'composer, not writer'},
    {items:['Africa','Asia','Europe','Atlantic'],odd:3,hint:'ocean, not continent'},
    {items:['sodium','calcium','oxygen','potassium'],odd:2,hint:'non-metal element'},
    {items:['crow','parrot','bat','pigeon'],odd:2,hint:'mammal, not bird'},
    {items:['1','8','27','16'],odd:3,hint:'16 is 2⁴, not a perfect cube'},
    {items:['novel','poem','essay','painting'],odd:3,hint:'not a literary form'},
];

function shuffle(a){return [...a].sort(()=>Math.random()-0.5);}

export default class OddOneOutGame {
    constructor(){
        this.score=0; this.timeLeft=60; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('oddoneout-best')||0;
        this.pool=[]; this.current=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Odd One Out</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="oooScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="oooTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="oooBest">${this.best}</div></div>
            </div>
            <div class="ooo-container">
                <div class="ooo-question">Which one doesn't belong?</div>
                <div class="ooo-items" id="oooItems"></div>
                <div class="ooo-feedback" id="oooFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="oooStart">Start</button>
                    <button class="btn" id="oooReset">Reset</button>
                </div>
            </div>`;
        document.getElementById('oooStart').addEventListener('click',()=>this.start());
        document.getElementById('oooReset').addEventListener('click',()=>this.reset());
    }
    _next(){
        if(!this.pool.length) this.pool=shuffle(QS);
        this.current=this.pool.pop();
        const el=document.getElementById('oooItems');
        el.innerHTML='';
        document.getElementById('oooFeedback').textContent='';
        const shuffledItems=[...this.current.items.map((v,i)=>({v,i}))].sort(()=>Math.random()-0.5);
        shuffledItems.forEach(({v,i})=>{
            const btn=document.createElement('button');
            btn.className='ooo-item-btn';
            btn.textContent=v;
            btn.addEventListener('click',()=>this._pick(i,btn));
            el.appendChild(btn);
        });
    }
    _pick(idx,btn){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.ooo-item-btn').forEach(b=>b.disabled=true);
        const fb=document.getElementById('oooFeedback');
        if(idx===this.current.odd){
            this.score++;
            document.getElementById('oooScore').textContent=this.score;
            btn.classList.add('ooo-correct');
            fb.textContent='✓ Correct!'; fb.className='ooo-feedback ooo-fb-correct';
        } else {
            btn.classList.add('ooo-wrong');
            document.querySelectorAll('.ooo-item-btn')[this.current.odd]?.classList.add('ooo-correct');
            fb.textContent=`✗ "${this.current.items[this.current.odd]}" — ${this.current.hint}`;
            fb.className='ooo-feedback ooo-fb-wrong';
        }
        setTimeout(()=>this._next(),900);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=60;
        this.pool=shuffle(QS);
        document.getElementById('oooScore').textContent='0';
        document.getElementById('oooStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('oooTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('oooStart').disabled=false;
        document.getElementById('oooItems').innerHTML='';
        document.getElementById('oooFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('oddoneout-best',this.best); notifyScoreUpdate(); document.getElementById('oooBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=60;
        document.getElementById('oooScore').textContent='0';
        document.getElementById('oooTime').textContent='60';
        document.getElementById('oooStart').disabled=false;
        document.getElementById('oooItems').innerHTML='';
        document.getElementById('oooFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer);}
}
