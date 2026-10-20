/* Yantrika game: Sumo Bot Arena (drive a bot: mass, momentum, energy and strategy)
   Open source (MIT). See CONTRIBUTING.md and games/README.md for the game API. */
(function(){
'use strict';

const S=480,C=S/2,RR=200,PI=Math.PI;
const NAMES={manual:'🎮 I drive',charge:'Autopilot: Charge',dodge:'Autopilot: Dodge',guard:'Autopilot: Guard'};
const RIVAL={charge:'Charge',dodge:'Dodge',guard:'Guard'};
const TIPS={charge:'Chargers are easy to sidestep: steer around them and push from the side.',dodge:'Dodgers hate a calm centre: hold the middle and Brace when they come in.',guard:'Guards react slowly: build speed and Dash into them.'};
const sfx=n=>{try{SFX.play(n)}catch(e){}};
const wrap=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a;};
const weight=b=>b<=3?'Light':b<=7?'Medium':'Heavy';
let best=0; // best win streak, kept in memory only

function play(el){
 const cs=getComputedStyle(el),cv=(n,f)=>cs.getPropertyValue(n).trim()||f;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let build=5,strat='manual',level=1,streak=0,phase='idle',raf=0,last=0,bots=[],cnt=0,fall=0,shake=0,lastTick=0,rival={};
 let keys={},ptr=null,btnBrace=false,energy=100,dashCd=0,bound=false;
 const $=s=>el.querySelector(s);

 el.innerHTML=`
 <h2 class="m">Sumo Bot Arena</h2>
 <p>Build your bot, scout the rival, then <b>drive</b> it and shove the rival out of the ring.</p>
 <div class="sb-row"><span>⚡ Light</span><input id="sb-b" type="range" min="1" max="10" value="5" aria-label="Build: light and fast to heavy and strong"><span>Heavy 🛡️</span></div>
 <p id="sb-st" style="margin:4px 0"></p>
 <div class="sb-row" role="group" aria-label="Control mode">
  ${Object.keys(NAMES).map(k=>`<button class="chip" type="button" data-s="${k}" aria-pressed="${k===strat}">${NAMES[k]}</button>`).join('')}
 </div>
 <p id="sb-scout" style="margin:4px 0"></p>
 <canvas id="sb-cv" class="sb-cv" width="${S}" height="${S}" role="img" aria-label="Sumo ring with your cyan robot and a red rival"></canvas>
 <div class="sb-row">
  <button class="btn cy" id="sb-dash" type="button">⚡ Dash (Space)</button>
  <button class="btn" id="sb-brace" type="button">🛡️ Brace (hold Shift)</button>
 </div>
 <p class="sb-hint" style="margin:4px 0;font-size:.9em">Steer with <b>arrow keys / WASD</b> or <b>drag on the ring</b>. <b>Dash</b> is a burst of speed, <b>Brace</b> plants your wheels so you are hard to push. Both use energy.</p>
 <p id="sb-msg" aria-live="polite" style="min-height:2.6em"></p>
 <div class="sb-row">
  <button class="btn cy" id="sb-go" type="button">🤖 Fight!</button>
  <button class="btn" id="sb-new" type="button">🔀 New rival</button>
  <span id="sb-sc"></span>
 </div>`;

 const cvs=$('#sb-cv'),g=cvs.getContext('2d');
 const mass=b=>.6+.25*b;
 const mEff=b=>b.m*(b.brace?2.2:1);

 const mk=(x,y,a,b,s,boost,col)=>{const m=mass(b);return{x,y,vx:0,vy:0,a,m,acc:.25/m*boost,s,manual:s==='manual',col,side:Math.random()<.5?-1:1,out:false,sc:1,dash:0,cd:60,brace:false};};
 const newRival=()=>{rival={build:1+Math.random()*10|0,strat:Object.keys(RIVAL)[Math.random()*3|0]};};
 const setup=()=>{
  const j=()=>(Math.random()-.5)*40;
  bots=[mk(C-120,C+j(),0,build,strat,1,cv('--cy','#22d3ee')),
        mk(C+120,C+j(),PI,rival.build,rival.strat,Math.min(1.5,.9+.04*level),cv('--red','#ef4444'))];
  energy=100;dashCd=0;
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
  let ux=0,uy=0,th=0,lim=.09*dt;
  if(b.manual){
   ux=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0);
   uy=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);
   if(!ux&&!uy&&ptr){const dx=ptr.x-b.x,dy=ptr.y-b.y,dd=Math.hypot(dx,dy);if(dd>18){ux=dx/dd;uy=dy/dd;}}
   th=(ux||uy)?1:0;lim=.16*dt;
  }else{const r=brain(b,o);ux=r[0];uy=r[1];th=r[2];}
  let acc=b.acc,fr=.94;
  if(b.dash>0){b.dash-=dt;acc*=3;th=1;if(!ux&&!uy){ux=Math.cos(b.a);uy=Math.sin(b.a);}}
  if(b.brace){acc*=.4;fr=.88;}
  if(ux||uy)b.a+=Math.max(-lim,Math.min(lim,wrap(Math.atan2(uy,ux)-b.a)));
  b.vx+=Math.cos(b.a)*acc*th*dt;b.vy+=Math.sin(b.a)*acc*th*dt;
  const fx=Math.cos(b.a),fy=Math.sin(b.a);
  let vf=b.vx*fx+b.vy*fy,vl=-b.vx*fy+b.vy*fx;
  vf*=Math.pow(fr,dt);vl*=Math.pow(.8,dt); // grip: sideways speed dies fast
  b.vx=vf*fx-vl*fy;b.vy=vf*fy+vl*fx;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
 };

 const collide=()=>{
  const[p,r]=bots;
  if(p.out||r.out)return;
  const dx=r.x-p.x,dy=r.y-p.y,d=Math.hypot(dx,dy)||1,min=40;
  if(d>=min)return;
  const pm=mEff(p),rm=mEff(r),mt=pm+rm;
  const nx=dx/d,ny=dy/d,ov=min-d;
  p.x-=nx*ov*rm/mt;p.y-=ny*ov*rm/mt;r.x+=nx*ov*pm/mt;r.y+=ny*ov*pm/mt;
  const rv=(r.vx-p.vx)*nx+(r.vy-p.vy)*ny;
  if(rv<0){
   const j=-1.6*rv/(1/pm+1/rm);
   p.vx-=nx*j/pm;p.vy-=ny*j/pm;r.vx+=nx*j/rm;r.vy+=ny*j/rm;
   if(rv<-.5){sfx('bump');if(!reduce)shake=8;}
  }
  // a head-on hit shoves harder than a glancing one; a dash hit shoves harder still
  const fp=Math.max(0,Math.cos(p.a)*nx+Math.sin(p.a)*ny)*(p.dash>0?1.6:1);
  const fr=Math.max(0,-(Math.cos(r.a)*nx+Math.sin(r.a)*ny))*(r.dash>0?1.6:1);
  r.vx+=nx*fp*1.5*pm/mt;r.vy+=ny*fp*1.5*pm/mt;
  p.vx-=nx*fr*1.5*rm/mt;p.vy-=ny*fr*1.5*rm/mt;
 };

 const doDash=()=>{
  if(phase!=='fight'||dashCd>0||energy<35||bots[0].out)return;
  energy-=35;dashCd=30;bots[0].dash=14;sfx('whoosh');
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
  if(!el.isConnected){unbind();raf=0;return;}
  const dt=Math.min(2.5,(ts-last)/16.67||1);last=ts;
  if(phase==='count'){
   cnt-=dt;const n=Math.ceil(cnt/50);
   if(n!==lastTick&&n>0){lastTick=n;sfx('tick');}
   if(cnt<=0){phase='fight';sfx('go');}
  }else if(phase==='fight'){
   const p=bots[0],r=bots[1],sec=dt/60;
   dashCd=Math.max(0,dashCd-dt);
   p.brace=energy>0&&!!(keys.shift||btnBrace);
   energy=p.brace?Math.max(0,energy-25*sec):Math.min(100,energy+14*sec);
   // the rival also uses Dash from round 2 on
   r.cd-=dt;
   if(level>=2&&r.cd<=0&&!r.out&&Math.hypot(p.x-r.x,p.y-r.y)<170&&Math.random()<.03){r.dash=14;r.cd=170-Math.min(70,level*7);}
   move(p,r,dt);move(r,p,dt);collide();
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
  const ink=cv('--ink','#888'),cy=cv('--cy','#22d3ee');
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,S,S);
  if(shake>0){g.translate((Math.random()-.5)*6,(Math.random()-.5)*6);shake--;}
  g.fillStyle='rgba(128,128,128,.16)';g.beginPath();g.arc(C,C,RR,0,2*PI);g.fill();
  g.lineWidth=4;g.strokeStyle=ink;g.stroke();
  g.lineWidth=2;g.setLineDash([8,8]);g.strokeStyle=cv('--red','#ef4444');
  g.beginPath();g.arc(C,C,RR-14,0,2*PI);g.stroke();g.setLineDash([]);
  g.fillStyle=ink;g.globalAlpha=.4;g.fillRect(C-10,C-1,20,2);g.fillRect(C-1,C-10,2,20);g.globalAlpha=1;
  if(ptr&&bots[0]&&bots[0].manual&&(phase==='fight'||phase==='count')){
   g.strokeStyle=cy;g.lineWidth=2;g.beginPath();g.arc(ptr.x,ptr.y,10,0,2*PI);g.stroke();
  }
  bots.forEach(b=>{
   if(b.sc<=0)return;
   g.save();g.translate(b.x,b.y);g.scale(b.sc,b.sc);
   if(b.dash>0&&!reduce){g.globalAlpha=.35;g.fillStyle=b.col;g.beginPath();g.arc(-Math.cos(b.a)*18,-Math.sin(b.a)*18,24,0,2*PI);g.fill();g.globalAlpha=1;}
   if(b.brace){g.lineWidth=4;g.strokeStyle=ink;g.setLineDash([6,5]);g.beginPath();g.arc(0,0,28,0,2*PI);g.stroke();g.setLineDash([]);}
   g.rotate(b.a);
   g.fillStyle=b.col;g.beginPath();g.arc(0,0,20,0,2*PI);g.fill();
   g.lineWidth=2;g.strokeStyle=ink;g.stroke();
   g.fillStyle=ink;g.beginPath();g.moveTo(17,-12);g.lineTo(30,0);g.lineTo(17,12);g.closePath();g.fill();
   g.fillStyle='#fff';[-6,6].forEach(y=>{g.beginPath();g.arc(6,y,3.5,0,2*PI);g.fill();});
   g.restore();
  });
  // energy bar
  g.fillStyle='rgba(128,128,128,.3)';g.fillRect(16,S-26,140,10);
  g.fillStyle=energy<35?cv('--red','#ef4444'):cy;g.fillRect(16,S-26,1.4*energy,10);
  g.fillStyle=ink;g.font='11px sans-serif';g.textAlign='left';g.fillText('⚡ energy',16,S-32);
  if(phase==='count'){
   g.fillStyle=ink;g.font='bold 80px sans-serif';g.textAlign='center';
   g.fillText(String(Math.max(1,Math.ceil(cnt/50))),C,C+28);
  }
 };

 const ui=()=>{
  const m=mass(build),a=.25/m;
  $('#sb-st').innerHTML=`${weight(build)} bot · mass <b>${m.toFixed(1)} kg</b> · acceleration <b>${(a*100).toFixed(0)}</b>`;
  $('#sb-scout').innerHTML=`🔍 Rival: <b>${weight(rival.build)}</b> bot, strategy <b>${RIVAL[rival.strat]}</b>`;
  $('#sb-sc').textContent=`Streak ${streak} · Best ${best}`;
 };
 const lock=on=>{el.querySelectorAll('#sb-b,.chip,#sb-go,#sb-new').forEach(x=>x.disabled=on);};

 // keyboard and pointer input (bound only while a bout is running)
 const GAMEKEYS=['arrowup','arrowdown','arrowleft','arrowright',' ','shift'];
 const kd=e=>{
  if(!el.isConnected){unbind();return;}
  const k=e.key.toLowerCase();
  if(GAMEKEYS.includes(k)||'wasd'.includes(k)&&k.length===1)e.preventDefault();
  keys[k]=true;
  if(k===' '&&!e.repeat)doDash();
 };
 const ku=e=>{const k=e.key.toLowerCase();keys[k]=false;if(k===' ')e.preventDefault();};
 const blur=()=>{keys={};btnBrace=false;};
 function bind(){if(bound)return;bound=true;document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);window.addEventListener('blur',blur);}
 function unbind(){bound=false;keys={};ptr=null;btnBrace=false;document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);window.removeEventListener('blur',blur);}
 const setPtr=e=>{const r=cvs.getBoundingClientRect();ptr={x:(e.clientX-r.left)*S/r.width,y:(e.clientY-r.top)*S/r.height};};
 cvs.addEventListener('pointerdown',e=>{if(phase==='fight'||phase==='count'){setPtr(e);try{cvs.setPointerCapture(e.pointerId);}catch(x){}}});
 cvs.addEventListener('pointermove',e=>{if(ptr)setPtr(e);});
 ['pointerup','pointercancel'].forEach(t=>cvs.addEventListener(t,()=>{ptr=null;}));

 function stop(){cancelAnimationFrame(raf);raf=0;phase='idle';unbind();lock(false);ui();}

 $('#sb-b').oninput=e=>{build=+e.target.value;if(phase==='idle'){setup();draw();}ui();};
 el.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
  strat=b.dataset.s;el.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b));
  if(phase==='idle'){setup();draw();}
 });
 $('#sb-new').onclick=()=>{if(phase!=='idle')return;newRival();setup();draw();ui();$('#sb-msg').textContent='New rival found. Scout it, then fight!';};
 $('#sb-dash').onclick=doDash;
 const br=$('#sb-brace');
 br.onpointerdown=()=>{btnBrace=true;};
 ['pointerup','pointerleave','pointercancel'].forEach(t=>br.addEventListener(t,()=>{btnBrace=false;}));
 $('#sb-go').onclick=()=>{
  if(phase!=='idle')return;
  setup();phase='count';cnt=150;lastTick=0;lock(true);bind();
  $('#sb-msg').textContent='Get ready…';
  last=performance.now();raf=requestAnimationFrame(frame);
 };

 newRival();setup();draw();ui();
 $('#sb-msg').textContent='Pick a build, scout the rival, then press Fight!';
}

YK.register({
 id:'sumobot',
 pillar:'compete',
 icon:'🤖',
 title:'Sumo Bot Arena',
 description:'Drive your own sumo bot: steer, dash and brace to push the rival out of the ring.',
 events:['game-theory-hackathon','technical-hackathon'],
 thumb:'games/sumobot/thumb.svg',
 css:`.sb-cv{width:100%;max-width:${S}px;display:block;margin:8px auto;border-radius:14px;background:rgba(128,128,128,.1);touch-action:none}
 .sb-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
 .sb-row input[type=range]{flex:1;min-width:140px}`,
 theory:`<p>In robot sumo, <b>mass</b> and <b>motor force</b> trade off. Newton's second law says <b>a = F / m</b>: with the same motor, a light bot speeds up quickly and a heavy bot slowly. When two bots collide, the <b>lighter one gets pushed back more</b>, because the same impulse changes its velocity by Δv = J / m.</p>
 <p><b>Brace</b> works like extra traction: planting the wheels makes the bot behave as if it were heavier, but it cannot accelerate much. <b>Dash</b> spends stored battery energy for a short burst of force. Since energy is limited, <i>when</i> you use it matters more than how often. Real sumo robots combine sensors, a low wedge and good grip, and pick tactics by scouting the opponent, which is a small <b>game theory</b> problem.</p>`,
 demo:b=>TIN(b,'Try it: same motor, different weight',SL('m','Mass (kg)',0.5,4,1,0.1),v=>{const m=v('m'),a=10/m;return `With a 10 N motor force, a <b>${m} kg</b> bot accelerates at <b>${a.toFixed(1)} m/s²</b> and reaches 1 m/s in <b>${(1/a).toFixed(2)} s</b>. Heavier means slower off the line but harder to shove.`}),
 run:play
});
})();
