import { storage, notifyScoreUpdate } from '../core/storage.js';

const SHAPES = [
    [[0,0],[0,1],[1,1],[2,1]],
    [[0,0],[1,0],[2,0],[2,1]],
    [[0,1],[1,0],[1,1],[2,0]],
    [[0,0],[0,1],[0,2],[1,0]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,1],[1,0],[1,1],[2,1]],
    [[0,0],[1,0],[1,1],[2,1]],
    [[0,0],[0,1],[0,2],[1,1]],
    [[0,0],[0,1],[1,0],[2,0]],
    [[0,2],[1,0],[1,1],[1,2]],
    [[0,0],[1,0],[1,1],[1,2]],
];

function rotate90(cells){return cells.map(([r,c])=>[c,3-r]);}
function normalize(cells){
    const minR=Math.min(...cells.map(([r])=>r));
    const minC=Math.min(...cells.map(([,c])=>c));
    return cells.map(([r,c])=>[r-minR,c-minC]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
}
function shapeKey(cells){return normalize(cells).map(c=>c.join(',')).join('|');}
function eq(a,b){return shapeKey(a)===shapeKey(b);}

function allRotations(shape){
    const rots=[shape];
    for(let i=0;i<3;i++) rots.push(rotate90(rots[rots.length-1]));
    const seen=new Set();
    return rots.filter(r=>{const k=shapeKey(r);return seen.has(k)?false:seen.add(k)&&true;});
}

function renderShape(cells,color='#6366f1'){
    const norm=normalize(cells);
    const maxR=Math.max(...norm.map(([r])=>r));
    const maxC=Math.max(...norm.map(([,c])=>c));
    const size=4;
    let html='<div style="display:grid;grid-template-columns:repeat('+size+',1fr);gap:2px;width:80px;height:80px;">';
    for(let r=0;r<=Math.max(maxR,size-1);r++){
        for(let c=0;c<=Math.max(maxC,size-1);c++){
            const filled=norm.some(([cr,cc])=>cr===r&&cc===c);
            html+=`<div style="background:${filled?color:'rgba(255,255,255,0.05)'};border-radius:3px;aspect-ratio:1;"></div>`;
        }
    }
    html+='</div>';
    return html;
}

export default class SpatialRotationGame {
    constructor(){
        this.score=0; this.timeLeft=60; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('spatialrotation-best')||0;
        this.target=null; this.correct=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Spatial Rotation</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="srScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="srTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="srBest">${this.best}</div></div>
            </div>
            <div class="sr-container">
                <div class="sr-instruction">Which option is a rotation of the target?</div>
                <div class="sr-target-area">
                    <div class="sr-label">Target</div>
                    <div id="srTarget"></div>
                </div>
                <div class="sr-options" id="srOptions"></div>
                <div class="sr-feedback" id="srFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="srStart">Start</button>
                    <button class="btn" id="srReset">Reset</button>
                </div>
            </div>`;
        document.getElementById('srStart').addEventListener('click',()=>this.start());
        document.getElementById('srReset').addEventListener('click',()=>this.reset());
    }
    _next(){
        const baseShape=SHAPES[Math.floor(Math.random()*SHAPES.length)];
        const rots=allRotations(baseShape);
        const targetRot=Math.floor(Math.random()*rots.length);
        this.target=rots[targetRot];
        const correctOpt=rots[Math.floor(Math.random()*rots.length)];
        this.correct=correctOpt;
        const distractors=[];
        while(distractors.length<3){
            const s=SHAPES[Math.floor(Math.random()*SHAPES.length)];
            const r=allRotations(s)[0];
            if(!eq(r,baseShape)&&!distractors.some(d=>eq(d,r))) distractors.push(r);
        }
        const opts=[correctOpt,...distractors].sort(()=>Math.random()-0.5);
        document.getElementById('srTarget').innerHTML=renderShape(this.target,'#a5b0ff');
        document.getElementById('srFeedback').textContent='';
        const el=document.getElementById('srOptions');
        el.innerHTML='';
        opts.forEach((shape,i)=>{
            const btn=document.createElement('button');
            btn.className='sr-opt-btn';
            btn.innerHTML=renderShape(shape);
            btn.addEventListener('click',()=>this._pick(shape,btn));
            el.appendChild(btn);
        });
    }
    _pick(shape,btn){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.sr-opt-btn').forEach(b=>b.disabled=true);
        const correct=eq(shape,this.correct);
        const fb=document.getElementById('srFeedback');
        if(correct){
            this.score++;
            document.getElementById('srScore').textContent=this.score;
            btn.classList.add('sr-correct');
            fb.textContent='✓ Correct!'; fb.className='sr-feedback sr-fb-correct';
        } else {
            btn.classList.add('sr-wrong');
            fb.textContent='✗ Wrong!'; fb.className='sr-feedback sr-fb-wrong';
        }
        setTimeout(()=>this._next(),900);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=60;
        document.getElementById('srScore').textContent='0';
        document.getElementById('srStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('srTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('srStart').disabled=false;
        document.getElementById('srOptions').innerHTML='';
        document.getElementById('srFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('spatialrotation-best',this.best); notifyScoreUpdate(); document.getElementById('srBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=60;
        document.getElementById('srScore').textContent='0';
        document.getElementById('srTime').textContent='60';
        document.getElementById('srStart').disabled=false;
        document.getElementById('srTarget').innerHTML='';
        document.getElementById('srOptions').innerHTML='';
        document.getElementById('srFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer);}
}
