/* Yantrika game: Sumo Bot Arena (mass, momentum and strategy)
   Open source (MIT). See CONTRIBUTING.md and games/README.md for the game API. */
(function(){
'use strict';

const S=480,C=S/2,RR=200,PI=Math.PI;
const NAMES={charge:'Charge',dodge:'Dodge',guard:'Guard'};
const TIPS={charge:'Chargers are easy to sidestep. Try <b>Dodge</b>.',dodge:'Dodgers hate a calm centre. Try <b>Guard</b>.',guard:'Guards react slowly. A heavy <b>Charge</b> can overpower them.'};
const sfx=n=>{try{SFX.play(n)}catch(e){}};
const wrap=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a;};
const weight=b=>b<=3?'Light':b<=7?'Medium':'Heavy';
let best=0; // best win streak, kept in memory only

function play(el){
 const cs=getComputedStyle(el),cv=(n,f)=>cs.getPropertyValue(n).trim()||f;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let build=5,strat='charge',level=1,streak=0,phase='idle',raf=0,last=0,bots=[],cnt=0,fall=0,shake=0,lastTick=0,rival={};
 const $=s=>el.querySelector(s);

 el.innerHTML=`
 <h2 class="m">Sumo Bot Arena</h2>
 <p>Tune your bot, pick a strategy, scout the rival, then shove it out of the ring.</p>
 <div class="sb-row"><span>⚡ Light</span><input id="sb-b" type="range" min="1" max="10" value="5" aria-label="Build: light and fast to heavy and strong"><span>Heavy 🛡️</span></div>
 <p id="sb-st" style="margin:4px 0"></p>
 <div class="sb-row" role="group" aria-label="Strategy">
  ${Object.keys(NAMES).map(k=>`<button class="chip" type="button" data-s="${k}" aria-pressed="${k===strat}">${NAMES[k]}</button>`).join('')}
 </div>
 <p id="sb-scout" style="margin:4px 0"></p>
 <canvas id="sb-cv" class="sb-cv" width="${S}" height="${S}" role="img" aria-label="Sumo ring with your cyan robot and a red rival"></canvas>
 <p id="sb-msg" aria-live="polite" style="min-height:2.6em"></p>
 <div class="sb-row">
  <button class="btn cy" id="sb-go" type="button">🤖 Fight!</button>
  <button class="btn" id="sb-new" type="button">🔀 New rival</button>
  <span id="sb-sc"></span>
 </div>`;

 const g=$('#sb-cv').getContext('2d');
 const mass=b=>.6+.25*b;

 const mk=(x,y,a,b,s,boost,col)=>{const m=mass(b);return{x,y,vx:0,vy:0,a,m,acc:.25/m*boost,s,col,side:Math.random()<.5?-1:1,out:false,sc:1};};
 const newRival=()=>{rival={build:1+Math.random()*10|0,strat:Object.keys(NAMES)[Math.random()*3|0]};};
 const setup=()=>{
  const j=()=>(Math.random()-.5)*40;
  bots=[mk(C-120,C+j(),0,build,strat,1,cv('--cy','#22d3ee')),
        mk(C+120,C+j(),PI,rival.build,rival.strat,Math.min(1.5,.9+.04*level),cv('--red','#ef4444'))];
 };

 const brain=(b,o)=>{
  const dx=o.x-b.x,dy=o.y-b.y,d=Math.hypot(dx,dy)||1,tx=dx/d,ty=dy/d;
  const ex=C-b.x,ey=C-b.y,eb=Math.hypot(ex,ey)||1;
  let ux=tx,uy=ty,th=1;
  if(b.s==='dodge'){
   const closing=-((o.vx-b.vx)*tx+(o.vy-b.vy)*ty);
   if(d<130&&closing>1.2){ux=-ty*b.side;uy=tx*b.side;}
   else if(d>=130)th=.8;
  }
  if(b.s==='guard'){
   if(eb>45){ux=ex/eb;uy=ey/eb;th=.7;}
   else th=d<90?1:.15;
  }
  if(b.s!=='charge'&&eb>RR-55){const k=Math.min(1,(eb-(RR-55))/30);ux=ux*(1-k)+ex/eb*k;uy=uy*(1-k)+ey/eb*k;}
  return[ux,uy,th];
 };

 const move=(b,o,dt)=>{
  if(b.out)return;
  const[ux,uy,th]=brain(b,o),lim=.09*dt;
  b.a+=Math.max(-lim,Math.min(lim,wrap(Math.atan2(uy,ux)-b.a)));
  b.vx+=Math.cos(b.a)*b.acc*th*dt;b.vy+=Math.sin(b.a)*b.acc*th*dt;
  const fx=Math.cos(b.a),fy=Math.sin(b.a);
  let vf=b.vx*fx+b.vy*fy,vl=-b.vx*fy+b.vy*fx;
  vf*=Math.pow(.94,dt);vl*=Math.pow(.8,dt); // grip: sideways speed dies fast
  b.vx=vf*fx-vl*fy;b.vy=vf*fy+vl*fx;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
 };

 const collide=()=>{
  const[p,r]=bots;
  if(p.out||r.out)return;
  const dx=r.x-p.x,dy=r.y-p.y,d=Math.hypot(dx,dy)||1,min=40;
  if(d>=min)return;
  const nx=dx/d,ny=dy/d,ov=min-d,mt=p.m+r.m;
  p.x-=nx*ov*r.m/mt;p.y-=ny*ov*r.m/mt;r.x+=nx*ov*p.m/mt;r.y+=ny*ov*p.m/mt;
  const rv=(r.vx-p.vx)*nx+(r.vy-p.vy)*ny;
  if(rv<0){
   const j=-(1.6)*rv/(1/p.m+1/r.m);
   p.vx-=nx*j/p.m;p.vy-=ny*j/p.m;r.vx+=nx*j/r.m;r.vy+=ny*j/r.m;
   if(rv<-.5){sfx('bump');if(!reduce)shake=8;}
  }
  // a head-on hit shoves harder than a glancing one
  const fp=Math.max(0,Math.cos(p.a)*nx+Math.sin(p.a)*ny),fr=Math.max(0,-(Math.cos(r.a)*nx+Math.sin(r.a)*ny));
  r.vx+=nx*fp*1.5*p.m/mt;r.vy+=ny*fp*1.5*p.m/mt;
  p.vx-=nx*fr*1.5*r.m/mt;p.vy-=ny*fr*1.5*r.m/mt;
 };

 const finish=()=>{
  const p=bots[0].out,r=bots[1].out;
  phase='over';fall=0;
  let m;
  if(p&&r){m='<b>🤝 Both bots fell!</b> A draw. Streak kept.';newRival();}
  else if(r){streak++;level++;best=Math.max(best,streak);sfx('win');m='<b>🏆 You win!</b> The rival is out. Here comes a tougher one.';newRival();}
  else{sfx('lose');m='<b>💥 You were pushed out.</b> '+TIPS[rival.strat]+' Same rival, try again.';streak=0;}
  $('#sb-msg').innerHTML=m;
 };

 const frame=ts=>{
  if(!el.isConnected){raf=0;return;}
  const dt=Math.min(2.5,(ts-last)/16.67||1);last=ts;
  if(phase==='count'){
   cnt-=dt;const n=Math.ceil(cnt/50);
   if(n!==lastTick&&n>0){lastTick=n;sfx('tick');}
   if(cnt<=0){phase='fight';sfx('go');}
  }else if(phase==='fight'){
   move(bots[0],bots[1],dt);move(bots[1],bots[0],dt);collide();
   bots.forEach(b=>{if(!b.out&&Math.hypot(b.x-C,b.y-C)>RR+4)b.out=true;});
   if(bots.some(b=>b.out))finish();
  }else if(phase==='over'){
   fall+=dt;bots.forEach(b=>{if(b.out)b.sc=Math.max(0,1-fall/50);});
   if(fall>55){draw();stop();return;}
  }
  draw();
  raf=requestAnimationFrame(frame);
 };

 const draw=()=>{
  const ink=cv('--ink','#888');
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,S,S);
  if(shake>0){g.translate((Math.random()-.5)*6,(Math.random()-.5)*6);shake--;}
  g.fillStyle='rgba(128,128,128,.16)';g.beginPath();g.arc(C,C,RR,0,2*PI);g.fill();
  g.lineWidth=4;g.strokeStyle=ink;g.stroke();
  g.lineWidth=2;g.setLineDash([8,8]);g.strokeStyle=cv('--red','#ef4444');
  g.beginPath();g.arc(C,C,RR-14,0,2*PI);g.stroke();g.setLineDash([]);
  g.fillStyle=ink;g.globalAlpha=.4;g.fillRect(C-10,C-1,20,2);g.fillRect(C-1,C-10,2,20);g.globalAlpha=1;
  bots.forEach(b=>{
   if(b.sc<=0)return;
   g.save();g.translate(b.x,b.y);g.scale(b.sc,b.sc);g.rotate(b.a);
   g.fillStyle=b.col;g.beginPath();g.arc(0,0,20,0,2*PI);g.fill();
   g.lineWidth=2;g.strokeStyle=ink;g.stroke();
   g.fillStyle=ink;g.beginPath();g.moveTo(17,-12);g.lineTo(30,0);g.lineTo(17,12);g.closePath();g.fill();
   g.fillStyle='#fff';[-6,6].forEach(y=>{g.beginPath();g.arc(6,y,3.5,0,2*PI);g.fill();});
   g.restore();
  });
  if(phase==='count'){
   g.fillStyle=ink;g.font='bold 80px sans-serif';g.textAlign='center';
   g.fillText(String(Math.max(1,Math.ceil(cnt/50))),C,C+28);
  }
 };

 const ui=()=>{
  const m=mass(build),a=.25/m;
  $('#sb-st').innerHTML=`${weight(build)} bot · mass <b>${m.toFixed(1)} kg</b> · acceleration <b>${(a*100).toFixed(0)}</b>`;
  $('#sb-scout').innerHTML=`🔍 Rival: <b>${weight(rival.build)}</b> bot, strategy <b>${NAMES[rival.strat]}</b>`;
  $('#sb-sc').textContent=`Streak ${streak} · Best ${best}`;
 };
 const lock=on=>{el.querySelectorAll('input,.chip,#sb-go,#sb-new').forEach(x=>x.disabled=on);};
 function stop(){cancelAnimationFrame(raf);raf=0;phase='idle';lock(false);ui();}

 $('#sb-b').oninput=e=>{build=+e.target.value;if(phase==='idle'){setup();draw();}ui();};
 el.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
  strat=b.dataset.s;el.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b));
 });
 $('#sb-new').onclick=()=>{if(phase!=='idle')return;newRival();setup();draw();ui();$('#sb-msg').textContent='New rival found. Scout it, then fight!';};
 $('#sb-go').onclick=()=>{
  if(phase!=='idle')return;
  setup();phase='count';cnt=150;lastTick=0;lock(true);
  $('#sb-msg').textContent='Get ready…';
  last=performance.now();raf=requestAnimationFrame(frame);
 };

 newRival();setup();draw();ui();
 $('#sb-msg').textContent='Pick a build and a strategy, then press Fight!';
}

YK.register({
 id:'sumobot',
 pillar:'compete',
 icon:'🤖',
 title:'Sumo Bot Arena',
 description:'Tune weight and strategy, then shove the rival bot out of the ring.',
 events:['game-theory-hackathon','technical-hackathon'],
 thumb:'games/sumobot/thumb.jpg',
 css:`.sb-cv{width:100%;max-width:${S}px;display:block;margin:8px auto;border-radius:14px;background:rgba(128,128,128,.1);touch-action:manipulation}
 .sb-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
 .sb-row input[type=range]{flex:1;min-width:140px}`,
 theory:`<p>In robot sumo, <b>mass</b> and <b>motor force</b> trade off. Newton's second law says <b>a = F / m</b>: with the same motor, a light bot speeds up quickly and a heavy bot slowly. But when two bots collide, the <b>lighter one gets pushed back more</b>, because the same impulse changes its velocity by Δv = J / m.</p>
 <p>Strategy matters too. A <b>charge</b> hits hard but cannot change direction, a <b>dodge</b> exploits that by sidestepping, and a <b>guard</b> waits near the centre. Real sumo robots combine sensors, a low wedge and good wheel grip, and pick their tactic by scouting the opponent. That is a small <b>game theory</b> problem: the best choice depends on what the rival picks.</p>`,
 demo:b=>TIN(b,'Try it: same motor, different weight',SL('m','Mass (kg)',0.5,4,1,0.1),v=>{const m=v('m'),a=10/m;return `With a 10 N motor force, a <b>${m} kg</b> bot accelerates at <b>${a.toFixed(1)} m/s²</b> and reaches 1 m/s in <b>${(1/a).toFixed(2)} s</b>. Heavier means slower off the line but harder to shove.`}),
 run:play
});
})();
