import { storage, notifyScoreUpdate } from '../core/storage.js';

const SHAPES = ['●','■','▲','★','◆','◇','□','○','△'];
const COLORS = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22'];

function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function shuffle(a){return [...a].sort(()=>Math.random()-0.5);}

function genMatrix(){
    const type=rnd(0,4);
    if(type===0){
        // Count pattern: each row i has (i+1)*col items but simpler — use numbers in sequence
        // Each cell = row*3 + col + 1
        const offset=rnd(0,10);
        const cells=Array.from({length:9},(_,i)=>String(offset+i+1));
        return{cells,type:'number grid'};
    }
    if(type===1){
        // Row arithmetic: each row has same operation
        const rows=[[rnd(1,5),rnd(1,5),0],[rnd(1,5),rnd(1,5),0],[rnd(1,5),rnd(1,5),0]];
        rows.forEach(r=>r[2]=r[0]+r[1]);
        const cells=[...rows[0].map(String),...rows[1].map(String),...rows[2].map(String)];
        return{cells,type:'row sum'};
    }
    if(type===2){
        // Column pattern: each col multiplied by same factor
        const bases=[rnd(1,4),rnd(1,4),rnd(1,4)];
        const factor=rnd(2,4);
        const cells=[];
        for(let r=0;r<3;r++) for(let c=0;c<3;c++) cells.push(String(bases[c]*Math.pow(factor,r)));
        return{cells,type:'column mult'};
    }
    if(type===3){
        // Symbol rotation: same symbol, cycling colors per row
        const shape=SHAPES[rnd(0,SHAPES.length-1)];
        const rowColors=shuffle(COLORS).slice(0,3);
        const cells=[];
        for(let r=0;r<3;r++) for(let c=0;c<3;c++) cells.push({sym:shape,color:rowColors[(r+c)%3]});
        return{cells,type:'color cycle'};
    }
    // type 4: diagonal same value
    const diag=rnd(1,9);
    const cells=Array.from({length:9},(_,i)=>{
        const r=Math.floor(i/3),c=i%3;
        return r===c?String(diag):String(rnd(1,9));
    });
    return{cells,type:'diagonal'};
}

function renderCell(val){
    if(typeof val==='object'&&val.sym){
        return `<div class="vm-cell-inner" style="color:${val.color};font-size:1.4rem;">${val.sym}</div>`;
    }
    return `<div class="vm-cell-inner">${val}</div>`;
}

export default class VisualMatrixGame {
    constructor(){
        this.score=0; this.timeLeft=90; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('visualmatrix-best')||0;
        this.current=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Visual Matrix</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="vmScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="vmTime">90</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="vmBest">${this.best}</div></div>
            </div>
            <div class="vm-container">
                <div class="vm-grid" id="vmGrid"></div>
                <div class="vm-question">What fills the <span style="color:#a5b0ff">?</span> cell?</div>
                <div class="vm-choices" id="vmChoices"></div>
                <div class="vm-feedback" id="vmFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="vmStart">Start</button>
                    <button class="btn" id="vmReset">Reset</button>
                </div>
            </div>`;
        document.getElementById('vmStart').addEventListener('click',()=>this.start());
        document.getElementById('vmReset').addEventListener('click',()=>this.reset());
    }
    _next(){
        const mat=genMatrix();
        const answer=mat.cells[8];
        this.current={cells:mat.cells,answer};
        const grid=document.getElementById('vmGrid');
        grid.innerHTML='';
        mat.cells.slice(0,8).forEach(v=>{
            const cell=document.createElement('div');
            cell.className='vm-cell';
            cell.innerHTML=renderCell(v);
            grid.appendChild(cell);
        });
        const missing=document.createElement('div');
        missing.className='vm-cell vm-missing';
        missing.innerHTML='<div class="vm-cell-inner">?</div>';
        grid.appendChild(missing);
        document.getElementById('vmFeedback').textContent='';
        const distractors=this._makeDistractors(answer,mat.cells);
        const opts=shuffle([answer,...distractors]);
        const el=document.getElementById('vmChoices');
        el.innerHTML='';
        opts.forEach(v=>{
            const btn=document.createElement('button');
            btn.className='vm-choice-btn';
            btn.innerHTML=renderCell(v);
            btn.addEventListener('click',()=>this._pick(v,btn,opts));
            el.appendChild(btn);
        });
    }
    _makeDistractors(answer,cells){
        if(typeof answer==='object'){
            const usedColors=cells.slice(0,8).filter(c=>typeof c==='object').map(c=>c.color);
            const diffColors=COLORS.filter(c=>c!==answer.color&&!usedColors.includes(c));
            return shuffle(diffColors).slice(0,3).map(color=>({sym:answer.sym,color}));
        }
        const num=parseInt(answer);
        const d=new Set([num]);
        let attempts=0;
        while(d.size<4&&attempts++<100){const v=num+rnd(-5,5); if(v!==num&&v>0)d.add(v);}
        const arr=[...d]; arr.shift();
        return arr.slice(0,3).map(String);
    }
    _pick(v,btn,opts){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.vm-choice-btn').forEach(b=>b.disabled=true);
        const isCorrect=typeof v==='object'?
            v.sym===this.current.answer.sym&&v.color===this.current.answer.color:
            v===this.current.answer;
        const fb=document.getElementById('vmFeedback');
        if(isCorrect){
            this.score++;
            document.getElementById('vmScore').textContent=this.score;
            btn.classList.add('vm-correct');
            fb.textContent='✓ Correct!'; fb.className='vm-feedback vm-fb-correct';
        } else {
            btn.classList.add('vm-wrong');
            fb.textContent='✗ Wrong!'; fb.className='vm-feedback vm-fb-wrong';
        }
        setTimeout(()=>this._next(),900);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=90;
        document.getElementById('vmScore').textContent='0';
        document.getElementById('vmStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('vmTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('vmStart').disabled=false;
        document.getElementById('vmChoices').innerHTML='';
        document.getElementById('vmFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('visualmatrix-best',this.best); notifyScoreUpdate(); document.getElementById('vmBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=90;
        document.getElementById('vmScore').textContent='0';
        document.getElementById('vmTime').textContent='90';
        document.getElementById('vmStart').disabled=false;
        document.getElementById('vmGrid').innerHTML='';
        document.getElementById('vmChoices').innerHTML='';
        document.getElementById('vmFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer);}
}
