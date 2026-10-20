/* Yantrika game 15: The Infinite Restaurant (Chinese restaurant process)
   Open source (MIT). See CONTRIBUTING.md and games/README.md for the game API. */
(function(){
'use strict';

const NS='http://www.w3.org/2000/svg',W=640,H=420,MAX=150;
const FACES=['👩','👨','🧓','👧','👦','🧑‍🍳','🧙','🧛','🦸','👸','🤖','👽','🐱','🐶','🦊','🐼','🐸','🐵','🦄','🐙'];
const sfx=n=>{try{SFX.play(n)}catch(e){}};
const hue=k=>(k*137.5)%360;
const pct=p=>(p*100).toFixed(p<.1?1:0)+'%';

const panel=()=>`<style>
.ir-svg{width:100%;max-width:${W}px;display:block;border-radius:14px;background:rgba(128,128,128,.1);touch-action:manipulation}
.ir-g{transition:transform .65s cubic-bezier(.3,1.3,.5,1);cursor:pointer}
.ir-c{transition:r .5s,stroke-width .2s}
.ir-f{animation:irpop .35s ease-out both;transform-box:fill-box;transform-origin:center;pointer-events:none}
.ir-w{transition:transform .65s ease-in;pointer-events:none}
.ir-fl .ir-c{animation:irfl .7s}
@keyframes irpop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
@keyframes irfl{50%{stroke-width:8}}
.ir-row{display:flex;align-items:center;gap:6px;width:100%;background:none;border:0;padding:3px 0;font:inherit;color:inherit;text-align:left;cursor:pointer}
.ir-bar{flex:1;height:12px;border-radius:6px;background:rgba(128,128,128,.18);overflow:hidden}
.ir-bar i{display:block;height:100%;border-radius:6px}
.ir-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:10px 0}
.ir-st div{padding:8px;border-radius:10px;background:rgba(128,128,128,.12);font-size:.85em}
.ir-st b{display:block;font-size:1.3em}
.ir-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
.ir-m[aria-pressed=true],#ir-auto[aria-pressed=true]{outline:3px solid var(--cy)}
</style>
<h2 class="m">Explore: the infinite restaurant</h2>
<p>The restaurant has endless tables. Each new customer either joins a table <b>in proportion to how many people already sit there</b>, or opens a brand-new table with a chance set by <b>α</b>. Watch the rich get richer.</p>
<div class="ir-ctl" role="group" aria-label="Mode">
 <button class="btn ir-m" type="button" data-mode="watch" aria-pressed="true">👀 Watch</button>
 <button class="btn ir-m" type="button" data-mode="predict" aria-pressed="false">🔮 Predict</button>
 <button class="btn ir-m" type="button" data-mode="host" aria-pressed="false">🧑‍🍳 Be the host</button>
</div>
<p id="ir-hint" style="margin:4px 0 8px"></p>
<svg id="ir-svg" class="ir-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Restaurant floor with tables of seated customers">
 <g id="ir-tabs"></g>
 <text x="34" y="${H-26}" text-anchor="middle" font-size="26">🚪</text>
 <text x="34" y="${H-6}" text-anchor="middle" font-size="10" fill="currentColor">entrance</text>
</svg>
<p id="ir-msg" aria-live="polite" style="margin:8px 0;min-height:2.6em"><b>Press “Seat next customer” to open the restaurant.</b></p>
<div class="ir-ctl">
 <button class="btn" id="ir-next" type="button">🙋 Seat next customer</button>
 <button class="btn" id="ir-ten" type="button">×10</button>
 <button class="btn" id="ir-auto" type="button" aria-pressed="false">▶ Auto-seat</button>
 <button class="btn" id="ir-reset" type="button">🔄 Reset</button>
</div>
<div class="ir-ctl">
 <label>α (newcomer boldness): <b id="ir-av">1.0</b> <input id="ir-a" type="range" min="0.1" max="20" step="0.1" value="1"></label>
 <button class="btn ir-p" type="button" data-a="0.3">Cliquey</button>
 <button class="btn ir-p" type="button" data-a="2">Balanced</button>
 <button class="btn ir-p" type="button" data-a="10">Social butterflies</button>
 <label>Speed <input id="ir-sp" type="range" min="1" max="10" value="5"></label>
</div>
<div class="ir-st" id="ir-st"></div>
<h3 class="m">Chance the next customer picks…</h3>
<div id="ir-bars"></div>
<h3 class="m">Where to use it</h3>
${['game-theory-hackathon','technical-hackathon'].map(id=>EV.find(x=>x.id===id)).filter(Boolean).map(e=>`<a class="btn" href="#/${e.id}">${esc(e.t)} (${e.d})</a>`).join('')}`;

const wire=root=>{
 const $=s=>root.querySelector(s),svg=$('#ir-svg'),layer=$('#ir-tabs');
 let tabs=[],n=0,alpha=1,mode='watch',gen=0,timer=0,hits=0,tries=0,lazy=0,hostP=0,hostN=0;
 const HINT={watch:'Watch mode: guests follow the rule. Click any table to inspect it.',predict:'Predict mode: click the table (or the New table bar, or empty floor) where the next customer will sit.',host:'Host mode: you seat the guests. Click a table to seat the next guest there, or empty floor to open a table at that spot.'};
 const mk=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
 const R=s=>9*Math.sqrt(s)+13;
 const place=t=>{t.g.style.transform='translate('+t.x+'px,'+t.y+'px)';};
 const say=m=>{$('#ir-msg').innerHTML=m;};
 const name=c=>c?'Table '+c.k:'a new table';
 const prob=c=>(c?c.s:alpha)/(n+alpha);

 const settle=()=>{
  for(let it=0;it<40;it++){
   for(let i=0;i<tabs.length;i++){const a=tabs[i];
    for(let j=i+1;j<tabs.length;j++){const b=tabs[j];
     let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||.01,m=a.r+b.r+8;
     if(d<m){const p=(m-d)/2/d;dx*=p;dy*=p;a.x-=dx;a.y-=dy;b.x+=dx;b.y+=dy;}}}
   tabs.forEach(a=>{a.x=Math.min(W-a.r-4,Math.max(a.r+4,a.x));a.y=Math.min(H-a.r-18,Math.max(a.r+4,a.y));});
  }
  tabs.forEach(place);
 };

 const addTable=at=>{
  const t={k:tabs.length+1,s:0,r:R(0),x:W/2,y:H/2};
  if(at){t.x=at.x;t.y=at.y;}
  else if(tabs.length){let best=-1e9;
   for(let i=0;i<25;i++){const x=40+Math.random()*(W-80),y=40+Math.random()*(H-90);
    const sc=Math.min(...tabs.map(o=>Math.hypot(o.x-x,o.y-y)-o.r));
    if(sc>best){best=sc;t.x=x;t.y=y;}}}
  const h=hue(t.k);
  t.g=mk('g',{class:'ir-g','data-t':tabs.length},layer);
  t.c=mk('circle',{class:'ir-c',r:t.r,fill:'hsla('+h+',70%,60%,.28)',stroke:'hsl('+h+',70%,50%)','stroke-width':3},t.g);
  t.c.style.r=t.r+'px';
  t.lb=mk('text',{'text-anchor':'middle','font-size':11,fill:'currentColor',y:t.r+13},t.g);
  t.g.style.transform='translate('+t.x+'px,'+t.y+'px)';
  tabs.push(t);
  return t;
 };

 const seatAt=t=>{
  const i=t.s++;n++;t.r=R(t.s);
  t.c.setAttribute('r',t.r);t.c.style.r=t.r+'px';
  t.lb.setAttribute('y',t.r+13);t.lb.textContent='#'+t.k+' · '+t.s;
  settle();
  const face=FACES[Math.random()*FACES.length|0],rad=9*Math.sqrt(i),an=i*2.39996,fx=rad*Math.cos(an),fy=rad*Math.sin(an),g=gen;
  const w=mk('text',{'text-anchor':'middle',dy:'.35em','font-size':15,class:'ir-w'},svg);
  w.textContent=face;w.style.transform='translate(34px,'+(H-30)+'px)';
  void w.getBoundingClientRect();
  w.style.transform='translate('+(t.x+fx)+'px,'+(t.y+fy)+'px)';
  setTimeout(()=>{w.remove();if(g!==gen)return;
   const f=mk('text',{x:fx,y:fy,'text-anchor':'middle',dy:'.35em','font-size':15,class:'ir-f'},t.g);f.textContent=face;
   if(i===0){const c=mk('text',{x:fx,y:fy-11,'text-anchor':'middle','font-size':9,class:'ir-f'},t.g);c.textContent='👑';}
  },650);
  t.g.classList.add('ir-fl');setTimeout(()=>t.g.classList.remove('ir-fl'),700);
 };

 const sample=()=>{let r=Math.random()*(n+alpha);for(const t of tabs){r-=t.s;if(r<0)return t;}return null;};
 const seat=(c,at)=>{if(c)seatAt(c);else seatAt(addTable(at));sfx('go');draw();};

 const row=(attr,col,p,label)=>`<button type="button" class="ir-row" ${attr}><span style="width:100px">${label}</span><span class="ir-bar"><i style="width:${p*100}%;background:${col}"></i></span><b style="width:48px;text-align:right">${pct(p)}</b></button>`;
 const draw=()=>{
  const d=n+alpha,top=[...tabs].sort((a,b)=>b.s-a.s).slice(0,7);
  let h=top.map(t=>row('data-t="'+tabs.indexOf(t)+'"','hsl('+hue(t.k)+',70%,50%)',t.s/d,'Table '+t.k+' ('+t.s+')')).join('');
  const rest=tabs.length-top.length;
  if(rest>0){const ps=tabs.reduce((a,t)=>a+(top.includes(t)?0:t.s),0)/d;h+='<div class="ir-row" style="cursor:default;opacity:.7"><span style="width:100px">+'+rest+' small</span><span class="ir-bar"><i style="width:'+ps*100+'%;background:#888"></i></span><b style="width:48px;text-align:right">'+pct(ps)+'</b></div>';}
  h+=row('data-new="1"','var(--yel)',alpha/d,'🆕 New table');
  $('#ir-bars').innerHTML=h;
  let e=0;for(let i=0;i<n;i++)e+=alpha/(alpha+i);
  const big=Math.max(0,...tabs.map(t=>t.s));
  $('#ir-st').innerHTML='<div>Customers<b>'+n+'/'+MAX+'</b></div><div>Tables<b>'+tabs.length+'</b></div><div>Expected tables<b>'+e.toFixed(1)+'</b></div><div>Biggest table<b>'+(n?Math.round(100*big/n):0)+'%</b></div>'
   +(mode==='predict'?'<div>Your hits<b>'+hits+'/'+tries+'</b>“Always biggest”: '+lazy+'/'+tries+'</div>':'')
   +(mode==='host'&&hostN?'<div>Avg chance of your picks<b>'+Math.round(100*hostP/hostN)+'%</b></div>':'');
 };

 const choose=(c,at)=>{
  if(n>=MAX){say('<b>The restaurant is full.</b> Press Reset to start again.');return;}
  if(n===0){seat(null,at);say('The first customer always opens a table. 👑');return;}
  if(mode==='watch'){if(c)say('<b>Table '+c.k+'</b>: '+c.s+' guests ('+pct(c.s/n)+' of everyone). The next customer joins with chance '+pct(prob(c))+'.');return;}
  if(mode==='host'){const p=prob(c);hostP+=p;hostN++;seat(c,at);
   say('You seated a guest at <b>'+name(c)+'</b>. Under the real rule that had a <b>'+pct(p)+'</b> chance.');return;}
  const big=tabs.reduce((a,t)=>!a||t.s>a.s?t:a,null),p=prob(c),act=sample(),ok=act===c;
  tries++;if(ok)hits++;if(act===big)lazy++;
  sfx(ok?'win':'buzz');
  say((ok?'✅ ':'❌ ')+'You bet on <b>'+name(c)+'</b> ('+pct(p)+'). The customer chose <b>'+name(act)+'</b> ('+pct(prob(act))+').');
  seat(act);
 };
 const next=()=>{if(n>=MAX){choose(null);return;}const c=n?sample():null;seat(c);say('Customer '+n+' chose <b>'+name(c)+'</b> (chance '+pct(c?c.s/(n-1+alpha):1)+').');};

 svg.addEventListener('click',e=>{
  const g=e.target.closest('.ir-g');
  if(g){choose(tabs[+g.dataset.t]);return;}
  const r=svg.getBoundingClientRect();
  choose(null,{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height});
 });
 $('#ir-bars').addEventListener('click',e=>{
  const b=e.target.closest('.ir-row');
  if(!b||b.tagName!=='BUTTON')return;
  choose(b.dataset.t!==undefined?tabs[+b.dataset.t]:null);
 });

 const setAuto=on=>{
  clearInterval(timer);timer=0;
  const b=$('#ir-auto');b.setAttribute('aria-pressed',on);b.textContent=on?'⏸ Pause':'▶ Auto-seat';
  if(on)timer=setInterval(()=>{if(!root.isConnected||n>=MAX){setAuto(false);return;}next();},1700-150*(+$('#ir-sp').value));
 };
 const setMode=m=>{
  mode=m;root.querySelectorAll('.ir-m').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));
  $('#ir-hint').textContent=HINT[m];draw();
 };
 const reset=()=>{
  gen++;setAuto(false);tabs=[];n=hits=tries=lazy=hostP=hostN=0;layer.innerHTML='';
  svg.querySelectorAll('.ir-w').forEach(w=>w.remove());
  say('<b>Fresh restaurant. Press “Seat next customer”.</b>');draw();
 };
 const setAlpha=a=>{alpha=a;$('#ir-a').value=a;$('#ir-av').textContent=a.toFixed(1);draw();};

 $('#ir-next').onclick=next;
 $('#ir-ten').onclick=()=>{const g=gen;for(let i=0;i<10;i++)setTimeout(()=>{if(g===gen&&n<MAX)next();},i*200);};
 $('#ir-auto').onclick=()=>setAuto(!timer);
 $('#ir-reset').onclick=reset;
 $('#ir-a').oninput=e=>setAlpha(+e.target.value);
 $('#ir-sp').oninput=()=>{if(timer)setAuto(true);};
 root.querySelectorAll('.ir-p').forEach(b=>b.onclick=()=>setAlpha(+b.dataset.a));
 root.querySelectorAll('.ir-m').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
 setMode('watch');
};

YK.register({
  id:"infi_rest",
  pillar:'compete',
  icon:'🍽️',
  title:'The Infinite Restaurant',
  description:'New guests pick a crowded table or a new one. Watch clusters emerge.',
  events:['game-theory-hackathon','technical-hackathon'],
  thumb:'games/infi_rest/thumb.jpg',
  theory:`<p>The <b>Chinese restaurant process</b> seats customers one by one. Customer <i>n+1</i> joins an occupied table <i>k</i> with probability <b>n<sub>k</sub> / (n + α)</b> and opens a new table with probability <b>α / (n + α)</b>. Popular tables attract more guests: a <b>rich-get-richer</b> effect that makes a few big clusters and many tiny ones. The same rule powers <b>Dirichlet process</b> clustering in machine learning, and models city sizes, word frequencies and species counts. A small α gives a few huge crowds; a large α gives many small groups. The expected number of tables after <i>n</i> customers is Σ α/(α+i), which grows only like α·ln(n).</p>`,
  demo:b=>TIN(b,'Try it: how many tables for 50 customers?',SL('al','Boldness α',0.1,20,1,0.1),v=>{const a=v('al');let e=0;for(let i=0;i<50;i++)e+=a/(a+i);return `With α = <b>${a}</b>, 50 customers fill about <b>${e.toFixed(1)}</b> tables. Small α: a few huge crowds. Large α: many small groups.`}),
  run:el=>{el.innerHTML=panel();wire(el);}
 });
})();
