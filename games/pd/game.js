/* Yantrika game: Prisoner's Dilemma
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

/* ---------- Prisoner's Dilemma data ---------- */
/* Payoffs (you, them): both cooperate 3/3, you defect on a cooperator 5/0, both defect 1/1. T(5)>R(3)>P(1)>S(0) and 2R>T+S, so this is a valid dilemma. */
// Scores per round [you, them]: C = cooperate, D = defect
const PAY={CC:[3,3],CD:[0,5],DC:[5,0],DD:[1,1]};

// The six computer opponents (name, emoji, hint, reveal text and strategy function f)
const OPP=[
 {k:'tft',n:'Mirror Mike',e:'🪞',h:'Plays nice, then copies you.',r:'Tit for Tat: cooperates first, then repeats your last move. Nice, retaliating and forgiving.',f:(h)=>h.length?h[h.length-1]:'C'},
 {k:'allc',n:'Kind Kim',e:'😇',h:'Always hopeful.',r:'Always Cooperate: never defects, which makes her easy to exploit.',f:()=>'C'},
 {k:'alld',n:'Sly Sam',e:'😈',h:'Out for himself.',r:'Always Defect: betrays every round, no matter what you do.',f:()=>'D'},
 {k:'grudge',n:'Grudge Gary',e:'😠',h:'Never forgets.',r:'Grudger: cooperates until you defect once, then defects forever.',f:(h)=>h.includes('D')?'D':'C'},
 {k:'pav',n:'Pavlov Pat',e:'🔁',h:'Repeats what works.',r:'Win-Stay, Lose-Shift: keeps his move after a good outcome and switches after a bad one.',f:(h,o)=>{if(!h.length)return 'C';return h[h.length-1]===o[o.length-1]?'C':'D';}},
 {k:'rand',n:'Chaos Chip',e:'🎲',h:'Flips a coin.',r:'Random: cooperates or defects 50/50, ignoring you completely.',f:()=>Math.random()<.5?'C':'D'}
];

const pdBest={};

const pdMx=l=>`<div style="overflow-x:auto"><table class="pdm" aria-label="Payoff matrix: your points, then their points"><tr><th></th><th>They cooperate 🤝</th><th>They cheat 🗡️</th></tr><tr><th>You cooperate 🤝</th><td class="${l==='CC'?'hl':''}">${PAY.CC.join(' , ')}</td><td class="${l==='CD'?'hl':''}">${PAY.CD.join(' , ')}</td></tr><tr><th>You cheat 🗡️</th><td class="${l==='DC'?'hl':''}">${PAY.DC.join(' , ')}</td><td class="${l==='DD'?'hl':''}">${PAY.DD.join(' , ')}</td></tr></table></div>`;


const pdMood=(S,fin)=>{if(!S||!S.h.length)return['normal','normal',0];const k=S.last,ld=S.ys-S.os,th=Math.max(5,.2*3*S.h.length);
 if(fin)return ld>=th?['devil','sad',1]:-ld>=th?['sad','devil',-1]:ld>0?['happy','normal',0]:ld<0?['normal','happy',0]:['happy','happy',0];
 if(k==='DC')return['devil','sad',1];if(k==='CD')return['sad','devil',-1];
 if(ld>=th)return['devil','sad',0];if(-ld>=th)return['sad','devil',0];
 return k==='CC'?['happy','happy',0]:['angry','angry',0];};

const pdCoins=(n,cx)=>`<text x="${cx}" y="56" text-anchor="middle" font-size="22" fill="var(--ink)">+${n}</text>`+Array.from({length:n},(_,i)=>`<circle cx="${cx+(i-(n-1)/2)*21}" cy="84" r="9" fill="var(--yel)" stroke="var(--ink)" stroke-width="3" style="animation:pop .4s ease both;animation-delay:${i*.08}s"/>`).join('');

const pdScene=(S,fin)=>{const [ym,tm,bb]=pdMood(S,fin),k=S&&S.last,v=k?PAY[k]:null,who=S?(S.mys?'other player':S.o.n.toLowerCase()):'other player';
 return `<svg class="tsc" viewBox="0 0 640 250" role="img" aria-label="You and the other player stand either side of a coin machine"><line x1="10" y1="214" x2="630" y2="214" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
 <rect x="240" y="40" width="160" height="174" fill="#5a5a62" stroke="var(--ink)" stroke-width="4"/><path d="M255 135L320 80L385 135L320 190ZM290 108V162M350 108V162M255 135H385M320 80V190" fill="none" stroke="var(--ink)" stroke-width="3" opacity=".75"/><path d="M226 214Q226 198 240 198V214ZM414 214Q414 198 400 198V214Z" fill="#5a5a62" stroke="var(--ink)" stroke-width="3"/>
 <text x="70" y="26" text-anchor="middle" font-size="15" fill="var(--ink)" opacity=".55">you ↓</text><text x="570" y="26" text-anchor="middle" font-size="15" fill="var(--ink)" opacity=".55">${who} ↓</text>
 ${YK.figure(70,'var(--red)',ym)}${YK.figure(570,'#338eda',tm)}${bb?`<text x="${bb>0?170:470}" y="128" text-anchor="middle" font-size="19" fill="var(--red)" transform="rotate(${bb>0?-8:8} ${bb>0?170:470} 128)">MWAHAHA! 😈</text>`:''}
 ${v?pdCoins(v[0],70)+pdCoins(v[1],570)+`<text x="70" y="238" text-anchor="middle" font-size="14" fill="var(--ink)">${S.h[S.h.length-1]==='C'?'cooperated':'cheated'}</text><text x="570" y="238" text-anchor="middle" font-size="14" fill="var(--ink)">${S.p[S.p.length-1]==='C'?'cooperated':'cheated'}</text>`:''}</svg>`;};

/* ---------- Prisoner's Dilemma game ---------- */
// (Game logic from here down. Only edit if you want to change how a game plays.)
function pdInit(el){
 let N=10,S=null,lock=false;
 const menu=()=>{
  el.innerHTML=`<h2 class="m">Build trust: the Prisoner's Dilemma</h2>
  <p>You have one choice. In front of you is a machine: if you put a coin in, the <i>other player</i> gets the payout, and vice versa. Each of you can <b>cooperate</b> (put in a coin) or <b>cheat</b> (keep it). Cheating pays more in a single round, yet two cheaters do worse than two cooperators. Can you build trust and still win?</p>
  ${pdScene(null)}
  ${pdMx('')}
  <p style="margin:0"><small>Each cell shows <b>your points , their points</b>.</small></p>
  <h3 class="m" style="margin-top:18px">1. Pick the number of rounds</h3>
  <div>${[5,10,15,20].map(n=>`<button class="chip" type="button" data-n="${n}" aria-pressed="${n===N}">${n} rounds</button>`).join('')}</div>
  <h3 class="m" style="margin-top:18px">2. Choose your opponent</h3>
  <div class="grid" style="gap:14px">${OPP.map((o,i)=>`<button class="pdo" type="button" data-o="${i}"><span>${o.e}</span><b>${o.n}</b><br>${o.h}${pdBest[o.k]!=null?`<br><small>Your best: <b>${pdBest[o.k]}</b> pts</small>`:''}</button>`).join('')}<button class="pdo" type="button" data-o="-1"><span>❓</span><b>Mystery Opponent</b><br>A hidden strategy. Work it out!</button></div>`;
  el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{N=+b.dataset.n;el.querySelectorAll('[data-n]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const i=+b.dataset.o;start(i<0?Math.floor(Math.random()*OPP.length):i,i<0);});
 };
 const start=(i,mys)=>{S={o:OPP[i],i,mys,h:[],p:[],ys:0,os:0,last:'',msg:'What should you do?'};lock=false;play();};
 const play=()=>{
  const r=S.h.length,mx=5*N;
  el.innerHTML=`<h2 class="m">${S.mys?'❓ Mystery Opponent':S.o.e+' '+S.o.n}</h2>
  <p style="margin:0"><b>Round ${Math.min(r+1,N)} of ${N}</b></p>
  <div class="pdsc"><div><b>You: <span id="ys">${S.ys}</span></b><div class="bar"><i id="yb" style="width:${S.ys/mx*100}%"></i></div></div><div><b>${S.mys?'Them':S.o.n}: <span id="os">${S.os}</span></b><div class="bar"><i class="o" id="ob" style="width:${S.os/mx*100}%"></i></div></div></div>
  ${pdScene(S)}
  <p class="pdbig m" id="pm2" aria-live="polite" style="text-align:center;margin:4px 0">${S.msg}</p>
  <div class="tbs"><button class="tb" type="button" data-m="D">Cheat</button><button class="tb" type="button" data-m="C">Cooperate</button></div>
  <p style="text-align:center;margin:0"><small>Cooperate = put in a coin. Cheat = keep it.</small></p>
  ${pdMx(S.last)}
  <div class="hist" id="hs" aria-label="Round history">${S.h.map((m,k)=>`<span class="hr" title="Round ${k+1}">${m==='C'?'🤝':'🗡️'}${S.p[k]==='C'?'🤝':'🗡️'}</span>`).join('')}</div>
  <p style="margin:6px 0 0"><small>History shows you, then them. </small><button class="chip" type="button" id="qt">Quit game</button></p>`;
  el.querySelector('#qt').onclick=menu;
  el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>move(b.dataset.m));
 };
 const move=m=>{
  if(lock)return;lock=true;
  const bs=el.querySelectorAll('[data-m]');bs.forEach(b=>b.disabled=true);
  const msg=el.querySelector('#pm2');msg.textContent='🤔 '+(S.mys?'They are':S.o.n+' is')+' deciding...';
  setTimeout(()=>{
   const t=S.o.f(S.h,S.p),k=m+t,[a,b]=PAY[k];
   S.h.push(m);S.p.push(t);S.ys+=a;S.os+=b;S.last=k;
   const who=S.mys?'They':S.o.n;
   S.msg={CC:`🤝 Both cooperated. +${a} each. Trust pays!`,CD:`😬 You cooperated but ${who} cheated. You get ${a}, they get ${b}.`,DC:`😏 You cheated a cooperator. You get ${a}, they get ${b}. They will remember...`,DD:`💥 Both cheated. Only +${a} each. Nobody wins.`}[k];
   SFX.play({CC:'coin',CD:'lose',DC:'devil',DD:'buzz'}[k]);
   if(S.h.length>=N){end();return;}
   lock=false;play();
   if(k==='CD'||k==='DD')el.querySelector('#pm2').classList.add('shake');
  },550);
 };
 const end=()=>{
  const mx=5*N,coop=Math.round(S.h.filter(x=>x==='C').length/N*100),tc=Math.round(S.p.filter(x=>x==='C').length/N*100);
  const prev=pdBest[S.o.k];if(prev==null||S.ys>prev)pdBest[S.o.k]=S.ys;
  SFX.play(S.ys-S.os>=Math.max(5,.6*N)?'devil':S.ys>S.os?'win':S.ys<S.os?'lose':'coin');
  const win=S.ys>S.os?'🏆 You outscored them!':S.ys<S.os?'They outscored you this time.':'🤝 It is a tie.';
  const cc=S.h.filter((x,i)=>x==='C'&&S.p[i]==='C').length;
  const tip=cc===N?'Perfect trust: you both cooperated every round and earned the maximum shared score together.':S.o.k==='alld'?'Against a pure defector, defecting back is the only way to avoid being exploited.':S.o.k==='allc'?'Kind Kim can be exploited, but notice how much you could have earned by simply cooperating with a friendly partner.':S.ys>=3*N?'Excellent! You averaged at least the cooperative score.':'Tip: repeated games reward being nice, retaliating when needed, and forgiving. Try building trust early.';
  el.innerHTML=`<h2 class="m">Game over!</h2>
  ${pdScene(S,true)}
  <div class="info pdbig"><b>${win}</b><br>You: <b>${S.ys}</b> pts &nbsp;|&nbsp; ${S.mys?'Them':S.o.n}: <b>${S.os}</b> pts<br><small>Max possible: ${mx}. Perfect mutual cooperation: ${3*N} each. Your best vs ${S.o.n}: ${pdBest[S.o.k]}.</small></div>
  <p>You cooperated <b>${coop}%</b> of the time; they cooperated <b>${tc}%</b>.</p>
  <div class="hist">${S.h.map((m,k)=>`<span class="hr">${m==='C'?'🤝':'🗡️'}${S.p[k]==='C'?'🤝':'🗡️'}</span>`).join('')}</div>
  <div class="info"><b>${S.o.e} ${S.o.n} revealed:</b> ${S.o.r}<br><br>💡 ${tip}</div>
  <p style="margin-top:14px"><button class="btn cy" type="button" id="ag">Play again</button><button class="btn" type="button" id="ch">Choose another opponent</button><a class="btn" href="#/game-theory-hackathon">Game Theory Hackathon</a></p>`;
  el.querySelector('#ag').onclick=()=>start(S.i,S.mys);
  el.querySelector('#ch').onclick=menu;
 };
 menu();
}

YK.register({
  id:"pd",
  pillar:'build',
  icon:'🤝',
  title:"Prisoner's Dilemma",
  description:'Build trust against six strategies.',
  events:['game-theory-hackathon','technical-hackathon','team-challenge'],
  thumb:'games/pd/thumb.png',
  theory:`<p>The Prisoner's Dilemma shows why rational individuals can end up worse off than if they had trusted each other.</p><ul><li><b>Nash equilibrium:</b> in one round, defecting is the best reply to anything, so both defect and earn 1 each, though both cooperating would give 3 each. That outcome is not <b>Pareto optimal</b>.</li><li><b>Repeated games:</b> when you meet again, the "shadow of the future" makes cooperation worthwhile. Robert Axelrod's tournaments were won by the simplest strategy, <b>Tit for Tat</b>.</li><li><b>Winning traits:</b> be nice, retaliate, forgive, stay clear. Useful for multi-robot teams, networks and negotiations.</li></ul>`,
  demo:b=>TIN(b,'Try it: does the future change the best move?',SL('n','Rounds you will meet again',1,20,1),v=>{const n=v('n'),c=3*n,d=5+n-1;return `Two Tit-for-Tat players: <b>${c}</b> points each.<br>A defector against Tit for Tat: <b>${d}</b> points.<br><b>${c>d?'🤝 Trust wins from 3 rounds on.':c===d?'😐 Exactly a tie.':'🗡️ One round only: defecting wins. Longer relationships reward trust.'}</b>`}),
  run:el=>{el.innerHTML='<div id="pd"></div>';pdInit(el.firstChild);}
 });
})();
