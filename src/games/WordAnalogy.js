import { storage, notifyScoreUpdate } from '../core/storage.js';

const ANALOGIES = [
    {stem:['HOT','COLD'],q:'BIG',a:'SMALL',d:['LARGE','HUGE','WARM']},
    {stem:['DAY','NIGHT'],q:'WHITE',a:'BLACK',d:['DARK','GRAY','BLUE']},
    {stem:['HAND','GLOVE'],q:'FOOT',a:'SHOE',d:['SOCK','LEG','BOOT']},
    {stem:['DOCTOR','HOSPITAL'],q:'TEACHER',a:'SCHOOL',d:['STUDENT','CLASS','LEARN']},
    {stem:['FISH','WATER'],q:'BIRD',a:'AIR',d:['SKY','WING','FLY']},
    {stem:['KNIFE','SHARP'],q:'PILLOW',a:'SOFT',d:['BED','SLEEP','FLUFFY']},
    {stem:['CAR','ROAD'],q:'BOAT',a:'WATER',d:['SAIL','FLOAT','RIVER']},
    {stem:['AUTHOR','BOOK'],q:'PAINTER',a:'CANVAS',d:['BRUSH','ART','COLOR']},
    {stem:['LION','CUB'],q:'BEAR',a:'CUB',d:['KITTEN','PUP','FOAL']},
    {stem:['CLOCK','TIME'],q:'THERMOMETER',a:'TEMPERATURE',d:['HEAT','FEVER','CELSIUS']},
    {stem:['EAR','HEAR'],q:'EYE',a:'SEE',d:['LOOK','SIGHT','BLINK']},
    {stem:['WINTER','COLD'],q:'SUMMER',a:'HOT',d:['WARM','SUN','HEAT']},
    {stem:['MOON','NIGHT'],q:'SUN',a:'DAY',d:['LIGHT','STAR','BRIGHT']},
    {stem:['CUP','DRINK'],q:'PLATE',a:'EAT',d:['FOOD','DISH','SPOON']},
    {stem:['SOLDIER','ARMY'],q:'PLAYER',a:'TEAM',d:['GAME','SPORT','CLUB']},
    {stem:['TREE','FOREST'],q:'GRASS',a:'MEADOW',d:['FIELD','GARDEN','LAWN']},
    {stem:['BRICK','HOUSE'],q:'PLANK','a':'FLOOR',d:['WOOD','BOARD','NAIL']},
    {stem:['PETAL','FLOWER'],q:'CHAPTER',a:'BOOK',d:['PAGE','STORY','NOVEL']},
    {stem:['HUNGRY','EAT'],q:'TIRED',a:'SLEEP',d:['REST','NAP','BED']},
    {stem:['FAST','SLOW'],q:'LOUD',a:'QUIET',d:['SOFT','SILENT','NOISE']},
    {stem:['ACTOR','STAGE'],q:'ATHLETE',a:'FIELD',d:['SPORT','ARENA','COURT']},
    {stem:['PUPPY','DOG'],q:'KITTEN',a:'CAT',d:['PET','FUR','CLAW']},
    {stem:['FIRE','HOT'],q:'ICE',a:'COLD',d:['WATER','FROZEN','SNOW']},
    {stem:['MORNING','BREAKFAST'],q:'EVENING',a:'DINNER',d:['SUPPER','NIGHT','DARK']},
    {stem:['BIRD','NEST'],q:'SPIDER',a:'WEB',d:['SILK','THREAD','TRAP']},
    {stem:['WRITER','PEN'],q:'CARPENTER',a:'HAMMER',d:['WOOD','NAIL','SAW']},
    {stem:['SMILE','HAPPY'],q:'FROWN',a:'SAD',d:['ANGRY','FACE','UPSET']},
    {stem:['WOOL','SHEEP'],q:'SILK',a:'WORM',d:['THREAD','CLOTH','SPIDER']},
    {stem:['PRESIDENT','COUNTRY'],q:'CAPTAIN',a:'SHIP',d:['SAILOR','SEA','CREW']},
    {stem:['CLOCK','TICK'],q:'BELL',a:'RING',d:['CHIME','DING','SOUND']},
].filter(q=>q.a); // filter out the one with typo

function shuffle(a){return [...a].sort(()=>Math.random()-0.5);}

export default class WordAnalogyGame {
    constructor(){
        this.score=0; this.timeLeft=60; this.gameStarted=false; this.gameOver=false;
        this.timer=null; this.best=storage.get('wordanalogy-best')||0;
        this.pool=[]; this.current=null;
        this.setupUI();
    }
    setupUI(){
        document.getElementById('gameContainer').innerHTML=`
            <h2 class="game-title">Word Analogy</h2>
            <div class="game-info">
                <div class="score-display"><div class="score-label">Score</div><div class="score-value" id="waScore">0</div></div>
                <div class="score-display"><div class="score-label">Time</div><div class="score-value" id="waTime">60</div></div>
                <div class="score-display"><div class="score-label">Best</div><div class="score-value" id="waBest">${this.best}</div></div>
            </div>
            <div class="wa-container">
                <div class="wa-stem" id="waStem"></div>
                <div class="wa-prompt" id="waPrompt"></div>
                <div class="wa-options" id="waOptions"></div>
                <div class="wa-feedback" id="waFeedback"></div>
                <div class="game-controls">
                    <button class="btn" id="waStart">Start</button>
                    <button class="btn" id="waReset">Reset</button>
                </div>
            </div>`;
        document.getElementById('waStart').addEventListener('click',()=>this.start());
        document.getElementById('waReset').addEventListener('click',()=>this.reset());
    }
    _next(){
        if(!this.pool.length) this.pool=shuffle(ANALOGIES);
        this.current=this.pool.pop();
        document.getElementById('waStem').textContent=`${this.current.stem[0]} : ${this.current.stem[1]}`;
        document.getElementById('waPrompt').textContent=`${this.current.q} : ?`;
        document.getElementById('waFeedback').textContent='';
        const opts=shuffle([this.current.a,...this.current.d.slice(0,3)]);
        const el=document.getElementById('waOptions');
        el.innerHTML='';
        opts.forEach(v=>{
            const btn=document.createElement('button');
            btn.className='wa-opt-btn';
            btn.textContent=v;
            btn.addEventListener('click',()=>this._pick(v,btn));
            el.appendChild(btn);
        });
    }
    _pick(v,btn){
        if(!this.gameStarted||this.gameOver) return;
        document.querySelectorAll('.wa-opt-btn').forEach(b=>b.disabled=true);
        const fb=document.getElementById('waFeedback');
        if(v===this.current.a){
            this.score++;
            document.getElementById('waScore').textContent=this.score;
            btn.classList.add('wa-correct');
            fb.textContent='✓ Correct!'; fb.className='wa-feedback wa-fb-correct';
        } else {
            btn.classList.add('wa-wrong');
            document.querySelectorAll('.wa-opt-btn').forEach(b=>{if(b.textContent===this.current.a)b.classList.add('wa-correct');});
            fb.textContent=`✗ Answer: ${this.current.a}`; fb.className='wa-feedback wa-fb-wrong';
        }
        setTimeout(()=>this._next(),900);
    }
    start(){
        this.gameStarted=true; this.gameOver=false; this.score=0; this.timeLeft=60;
        this.pool=shuffle(ANALOGIES);
        document.getElementById('waScore').textContent='0';
        document.getElementById('waStart').disabled=true;
        this._next();
        this.timer=setInterval(()=>{
            this.timeLeft--;
            document.getElementById('waTime').textContent=this.timeLeft;
            if(this.timeLeft<=0) this._end();
        },1000);
    }
    _end(){
        this.gameOver=true; this.gameStarted=false; clearInterval(this.timer);
        document.getElementById('waStart').disabled=false;
        document.getElementById('waOptions').innerHTML='';
        document.getElementById('waFeedback').textContent=`Final: ${this.score}`;
        if(this.score>this.best){this.best=this.score; storage.set('wordanalogy-best',this.best); notifyScoreUpdate(); document.getElementById('waBest').textContent=this.best;}
    }
    reset(){
        clearInterval(this.timer); this.gameStarted=false; this.gameOver=false;
        this.score=0; this.timeLeft=60;
        document.getElementById('waScore').textContent='0';
        document.getElementById('waTime').textContent='60';
        document.getElementById('waStart').disabled=false;
        document.getElementById('waStem').textContent='';
        document.getElementById('waPrompt').textContent='';
        document.getElementById('waOptions').innerHTML='';
        document.getElementById('waFeedback').textContent='';
    }
    cleanup(){clearInterval(this.timer);}
}
