/* Yantrika game: Random Walk Lab
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

const PC=['#ec3750','#338eda','#ff8c37','#33d6a6','#ff5a5f','#8e44ad'];

// ---- Random Walk Lab: game logic ----
// Three tabs: lab (watch a crowd of noisy robots), guess (predict how far they drift), ruin (battery gambler's ruin)
function walkInit(el){
 let tab='lab',run=0;
 const TABS=[['lab','🤖 Drunk Robot Lab'],['guess','🎯 Predict the Drift'],['ruin','🔋 Battery Gambler']];
 const ink=()=>getComputedStyle(el).getPropertyValue('--ink').trim()||'#17171d';
 // one lattice step: pr = chance of stepping right (0.25 = fair), the other 3 directions share the rest
 const stepXY=pr=>{const po=(1-pr)/3,u=Math.random();return u<pr?[1,0]:u<pr+po?[-1,0]:u<pr+2*po?[0,1]:[0,-1];};
 const path=(N,pr)=>{let x=0,y=0;const p=[[0,0]];for(let i=0;i<N;i++){const d=stepXY(pr);x+=d[0];y+=d[1];p.push([x,y]);}return p;};
 const endDist=N=>{let x=0,y=0;for(let i=0;i<N;i++){const d=stepXY(.25);x+=d[0];y+=d[1];}return Math.hypot(x,y);};
 const RNG='style="display:block;width:100%;max-width:420px;margin:4px 0 8px"';

 // ---------- TAB 1: Drunk Robot Lab ----------
 const lab=box=>{
  let N=200,R=20,D=0;
  box.innerHTML=`<p>Each robot takes one cell-sized step per tick in a random direction (up, down, left or right), like a robot with noisy wheel encoders and nothing to correct it. Release a crowd and watch how they spread. Add <b>wheel bias</b> to mimic one wheel that is slightly stronger.</p>
  <label for="wn"><b>Steps per robot: <span id="wnv"></span></b></label><input id="wn" type="range" min="10" max="2000" step="10" value="${N}" ${RNG}>
  <label for="wr"><b>Number of robots: <span id="wrv"></span></b></label><input id="wr" type="range" min="1" max="60" value="${R}" ${RNG}>
  <label for="wd"><b>Wheel bias to the right: <span id="wdv"></span>%</b></label><input id="wd" type="range" min="0" max="40" value="0" ${RNG}>
  <button class="btn cy" type="button" id="wgo">▶ Release the robots</button>
  <canvas id="wc" width="480" height="480" role="img" aria-label="Paths of random-walking robots" style="width:100%;max-width:480px;border:3px solid var(--dk);border-radius:10px;background:var(--card);display:block;margin:12px 0"></canvas>
  <div class="info" id="wi" aria-live="polite">Press the button to start. The dashed circle shows the typical distance, the square root of the number of steps.</div>`;
  const cv=box.querySelector('#wc'),cx=cv.getContext('2d'),wi=box.querySelector('#wi'),rd=q=>+box.querySelector(q).value;
  const lbl=()=>{N=rd('#wn');R=rd('#wr');D=rd('#wd');box.querySelector('#wnv').textContent=N;box.querySelector('#wrv').textContent=R;box.querySelector('#wdv').textContent=D;};
  ['#wn','#wr','#wd'].forEach(q=>box.querySelector(q).oninput=lbl);lbl();
  // blank canvas: axes + dashed circle of radius sqrt(N)
  const base=sc=>{
   const c=ink();cx.clearRect(0,0,480,480);cx.strokeStyle=c;cx.globalAlpha=.25;cx.lineWidth=1;cx.beginPath();cx.moveTo(240,0);cx.lineTo(240,480);cx.moveTo(0,240);cx.lineTo(480,240);cx.stroke();cx.globalAlpha=1;
   if(sc){cx.setLineDash([6,5]);cx.lineWidth=2;cx.globalAlpha=.8;cx.beginPath();cx.arc(240,240,Math.sqrt(N)*sc,0,7);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1;}
  };
  base(0);
  box.querySelector('#wgo').onclick=()=>{SFX.play('whoosh');
   lbl();const tok=++run,pr=.25+D/200;
   const W=Array.from({length:R},()=>path(N,pr));
   let ext=4;W.forEach(p=>p.forEach(q=>{ext=Math.max(ext,Math.abs(q[0]),Math.abs(q[1]));}));
   const sc=225/ext,per=Math.max(1,Math.ceil(N/160));let k=0;
   const draw=()=>{
    base(sc);const c=ink();
    W.forEach((p,r)=>{
     cx.strokeStyle=PC[r%6];cx.lineWidth=1.6;cx.globalAlpha=.75;cx.beginPath();
     for(let i=0;i<=k;i++){const q=p[i],X=240+q[0]*sc,Y=240-q[1]*sc;i?cx.lineTo(X,Y):cx.moveTo(X,Y);}
     cx.stroke();cx.globalAlpha=1;
     const e=p[k];cx.fillStyle=PC[r%6];cx.beginPath();cx.arc(240+e[0]*sc,240-e[1]*sc,4,0,7);cx.fill();cx.strokeStyle=c;cx.lineWidth=1.5;cx.stroke();
    });
    cx.fillStyle=c;cx.beginPath();cx.arc(240,240,5,0,7);cx.fill();
   };
   const fin=()=>{
    const E=W.map(p=>p[N]),dist=E.map(e=>Math.hypot(e[0],e[1])),mean=dist.reduce((a,b)=>a+b,0)/R,far=Math.max(...dist);
    const mx=E.reduce((a,e)=>a+e[0],0)/R,my=E.reduce((a,e)=>a+e[1],0)/R;
    wi.innerHTML=`<b>After ${N} steps</b> the average robot is <b>${mean.toFixed(1)}</b> cells from the start (farthest: ${far.toFixed(1)}).<br>`+(D===0
     ?`Theory for an unbiased walk: about 0.89 x √${N} = <b>${(.886*Math.sqrt(N)).toFixed(1)}</b>. A straight line would have gone ${N} cells. The crowd's average position is (${mx.toFixed(1)}, ${my.toFixed(1)}): it stays centred while each robot wanders off.`
     :`The bias pushes the whole crowd: average position (<b>${mx.toFixed(1)}</b>, ${my.toFixed(1)}). Expected drift is about <b>${(N*D/150).toFixed(0)}</b> cells to the right, against a random spread of only about ${Math.sqrt(N).toFixed(0)}.`);
   };
   const tick=()=>{
    if(tok!==run||!box.isConnected)return;
    k=Math.min(N,k+per);draw();
    if(k<N){wi.innerHTML=`Step <b>${k}</b> of ${N}`;requestAnimationFrame(tick);}else fin();
   };
   if(matchMedia('(prefers-reduced-motion:reduce)').matches){k=N;draw();fin();}else tick();
  };
 };

 // ---------- TAB 2: Predict the Drift (5 rounds) ----------
 const guess=box=>{
  const NS=[25,64,100,225,400],T=5;let r=0,score=0,ratio=0;
  const ask=()=>{
   const N=NS[Math.floor(Math.random()*NS.length)];
   box.innerHTML=`<h3 class="m">Round ${r+1} of ${T} | Score: ${score}</h3>
   <p>A robot takes <b>${N}</b> random steps, one cell each, in random directions. We release 60 of them. How far from the start will the <b>average</b> robot be at the end?</p>
   <label for="gs"><b>Your guess: <span id="gv"></span> cells</b></label><input id="gs" type="range" min="0" max="${N}" value="${Math.round(N/2)}" ${RNG}>
   <p><small>Walking in a straight line for ${N} steps would put it ${N} cells away.</small></p>
   <button class="btn cy" type="button" id="gl">🔒 Lock in my guess</button>`;
   const sl=box.querySelector('#gs'),u=()=>{box.querySelector('#gv').textContent=sl.value;};sl.oninput=u;u();
   box.querySelector('#gl').onclick=()=>{SFX.play('gavel');
    const g=+sl.value;let tot=0;for(let i=0;i<60;i++)tot+=endDist(N);const a=tot/60;
    const pts=Math.max(0,Math.round(100-100*Math.abs(g-a)/a));score+=pts;ratio+=g/N;r++;
    const bar=(l,v,c)=>`<p style="margin:6px 0"><small>${l}: <b>${v.toFixed(1)}</b></small><span class="bar" style="display:block;max-width:none"><i style="width:${Math.max(1,v/N*100)}%;background:${c}"></i></span></p>`;
    box.innerHTML=`<h3 class="m">Round ${r} of ${T} | Score: ${score}</h3>`+bar('Your guess',g,'var(--bl)')+bar('Actual average distance',a,'var(--cy)')+bar('Straight line',N,'var(--or)')+`<div class="info"><b>+${pts} points.</b> Theory says about 0.89 x √${N} = ${(.886*Math.sqrt(N)).toFixed(1)}. Random steps mostly cancel each other out, so distance grows like the <b>square root</b> of the steps, not the steps themselves.</div><p><button class="btn cy" type="button" id="gn">${r>=T?'See final score':'Next round'}</button></p>`;
    box.querySelector('#gn').onclick=r>=T?finish:ask;
   };
  };
  const finish=()=>{
   const avg=ratio/T;
   box.innerHTML=`<h3 class="m">Final score: ${score} / ${T*100}</h3>
   <div class="info pdbig"><b>${score>=400?'🏆 You really understand random walks!':score>=200?'Not bad! You are getting a feel for the square-root law.':'Random walks are famously unintuitive. Most people guess far too high.'}</b><br>On average you guessed <b>${Math.round(avg*100)}%</b> of the straight-line distance.</div>
   <div class="info">💡 4 times more steps only gets you 2 times farther. That is why a robot that relies on wheel counting alone slowly drifts off course, and why it needs sensors to correct itself.</div>
   <p><button class="btn cy" type="button" id="ag">Play again</button></p>`;
   box.querySelector('#ag').onclick=()=>guess(box);
  };
  ask();
 };

 // ---------- TAB 3: Battery Gambler (gambler's ruin) ----------
 const ruin=box=>{
  const G=20;let B=10,P=50,pos=10,steps=0,done=false;
  box.innerHTML=`<p>Your robot has a battery on a track from <b>0</b> (💀 dead) to <b>${G}</b> (⚡ docking station). Each move it either gains 1 unit (a bit of sunlight) or loses 1. Will it reach the dock before dying? This is the <b>gambler's ruin</b> problem.</p>
  <label for="rb"><b>Starting charge: <span id="rbv"></span></b></label><input id="rb" type="range" min="1" max="19" value="10" ${RNG}>
  <label for="rp"><b>Chance of gaining a unit each move: <span id="rpv"></span>%</b></label><input id="rp" type="range" min="40" max="60" value="50" ${RNG}>
  <div id="rt" role="img" aria-label="Battery track" style="display:flex;flex-wrap:wrap;gap:3px;margin:12px 0"></div>
  <div class="info" id="ri" aria-live="polite"></div>
  <button class="btn cy" type="button" id="r1">Take a step</button><button class="btn" type="button" id="r2">Run to the end</button><button class="btn cy" type="button" id="r3">Simulate 2000 robots</button><button class="chip" type="button" id="r0">Reset</button>`;
  const q=s=>box.querySelector(s);
  // theory: chance of reaching G from b when each step is +1 with probability p
  const theory=(b,p)=>{p/=100;if(p===.5)return b/G;const r=(1-p)/p;return (1-Math.pow(r,b))/(1-Math.pow(r,G));};
  const track=()=>{q('#rt').innerHTML=Array.from({length:G+1},(_,i)=>`<span title="Charge ${i}" style="width:24px;height:34px;display:flex;align-items:center;justify-content:center;border:2px solid var(--dk);border-radius:6px;font-size:${i===pos||i===0||i===G?'.95rem':'.6rem'};background:${i===pos?'var(--yel)':i===0?'var(--red)':i===G?'var(--cy)':'var(--card)'};color:${i===pos||i===G?'#17171d':'inherit'}">${i===pos?'🤖':i===0?'💀':i===G?'⚡':i}</span>`).join('');};
  const reset=()=>{B=+q('#rb').value;P=+q('#rp').value;q('#rbv').textContent=B;q('#rpv').textContent=P;pos=B;steps=0;done=false;track();q('#ri').innerHTML=`Charge <b>${pos}</b>. Theory says the chance of reaching the dock from here is <b>${(theory(B,P)*100).toFixed(1)}%</b>. Try 48% and see what a tiny edge does.`;};
  const mv=()=>{pos+=Math.random()<P/100?1:-1;steps++;if(pos<=0||pos>=G)done=true;};
  const status=()=>{track();q('#ri').innerHTML=done?(pos>=G?`⚡ <b>Docked after ${steps} steps!</b>`:`💀 <b>Battery dead after ${steps} steps.</b>`)+' Press Reset to try again.':`Charge <b>${pos}</b> after ${steps} steps.`;};
  q('#r1').onclick=()=>{if(done)return;SFX.play('step');mv();status();};
  q('#r2').onclick=()=>{SFX.play('whoosh');while(!done)mv();status();};
  q('#r3').onclick=()=>{let ok=0,st=0;const T=2000;for(let i=0;i<T;i++){let x=B,s=0;while(x>0&&x<G){x+=Math.random()<P/100?1:-1;s++;}if(x>=G)ok++;st+=s;}q('#ri').innerHTML=`<b>${T} robots</b> starting at charge ${B} with a ${P}% chance of gaining: <b>${(ok/T*100).toFixed(1)}%</b> reached the dock (theory: ${(theory(B,P)*100).toFixed(1)}%). Average journey: ${(st/T).toFixed(0)} steps.`;};
  q('#r0').onclick=reset;
  q('#rb').oninput=reset;q('#rp').oninput=reset;
  reset();
 };

 const show=()=>{
  run++;
  el.innerHTML=`<h2 class="m">Random Walk Lab: the drunkard's walk</h2>
  <p>A random walk is a path made of random steps. It describes a robot's drifting wheel counts, a diffusing molecule, a shaky stock price, and even how web pages get ranked. Pick an experiment:</p>
  <div>${TABS.map(t=>`<button class="chip" type="button" data-t="${t[0]}" aria-pressed="${t[0]===tab}">${t[1]}</button>`).join('')}</div>
  <div id="wk" style="margin-top:14px"></div>`;
  el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;show();});
  ({lab,guess,ruin})[tab](el.querySelector('#wk'));
 };
 show();
}

YK.register({
  id:"walk",
  pillar:'learn',
  icon:'🚶',
  title:'Random Walk Lab',
  description:'Release drunk robots, predict how far they drift, and gamble a battery.',
  events:['workshop-2','ai-robotics-workshop','robotics-hackathon','game-theory-hackathon'],
  thumb:'games/walk/thumb.jpg',
  theory:`<p>A <b>random walk</b> is a path built from random steps, also called the drunkard's walk. It models a robot's drifting wheel counts, diffusing molecules (Brownian motion), shaky prices, and even how Google's PageRank surfs the web.</p><ul><li><b>The square-root law:</b> after N unit steps in random directions, the typical distance from the start is about <b>the square root of N</b>, not N. Four times more steps only gets you twice as far (about 0.89 x the square root of N for the average distance on a grid).</li><li><b>Drift beats noise:</b> a small bias, like one slightly stronger wheel, adds a push that grows like N while the random spread grows like the square root of N. Past a crossover point the drift dominates, which is why dead-reckoning robots need sensors to correct themselves.</li><li><b>Gambler's ruin:</b> a fair walk starting at charge B between 0 and G reaches G first with probability <b>B/G</b>. Even a 2% house edge badly cuts the odds, and the walk always ends at one of the edges.</li><li><b>Used in:</b> Monte Carlo simulation, particle filters for robot localisation, simulated annealing, and search algorithms.</li></ul>`,
  demo:b=>TIN(b,'Try it: when does drift beat noise?',SL('n','Steps taken',4,2500,400)+SL('d','Wheel bias to the right (%)',1,40,10),v=>{const n=v('n'),d=v('d'),sp=Math.sqrt(n),dr=n*d/150,cr=Math.pow(150/d,2);return `Random spread: about <b>${sp.toFixed(0)}</b> cells.<br>Systematic drift: about <b>${dr.toFixed(0)}</b> cells.<br>${dr>sp?'🧭 Drift wins: the bias now matters more than the noise.':'🎲 Noise still wins at this point.'}<br><small>Drift overtakes the spread after about ${cr.toFixed(0)} steps. A smaller bias takes longer, but it always wins eventually.</small>`}),
  run:el=>{el.innerHTML='<div id="wk0"></div>';walkInit(el.firstChild);}
 });
})();
