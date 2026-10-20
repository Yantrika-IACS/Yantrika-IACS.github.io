/* Yantrika game: Rock Paper Scissors vs Bot
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Rock Paper Scissors vs a bot that reads your last two moves (15-round match)
function rps(el){
 const M=['🪨','📄','✂️'],NM=['Rock','Paper','Scissors'],R=15;let fq,cx,hs,w,l,d;
 const nw=()=>{fq=[0,0,0];cx={};hs=[];w=l=d=0;};nw();
 el.innerHTML=`<h2 class="m">Rock Paper Scissors vs a learning bot</h2><p>This bot remembers what you played after your last <b>two</b> moves and counters it. Game theory says the unbeatable strategy is to be random. A 15-round match: can you stay unpredictable?</p>
 <div class="tbs">${M.map((m,i)=>`<button class="tb" type="button" data-r="${i}" aria-label="${NM[i]}">${m} ${NM[i]}</button>`).join('')}</div>
 <p class="pdbig m" id="rr" aria-live="polite" style="text-align:center">Pick your move.</p><div class="bar" style="max-width:none"><i id="rb" style="background:var(--cy)"></i></div><div class="info" id="rt"></div><div class="hist" id="rh"></div><p><button class="tb" type="button" id="rz" style="font-size:1rem;padding:6px 18px">New match</button></p>`;
 const q=x=>el.querySelector(x),sc=()=>{const n=hs.length,rd=w+l+d,pr=n>=3?Math.round(Math.max(...fq)/n*100):0;q('#rb').style.width=(rd?w/rd*100:0)+'%';
  q('#rt').innerHTML='Round <b>'+Math.min(n+1,R)+' / '+R+'</b> | Wins <b>'+w+'</b> | Losses <b>'+l+'</b> | Ties <b>'+d+'</b>'+(n>=6?'<br><small>🧠 Bot confidence in reading you is rising. Random play wins about 1 round in 3.</small>':'');
  q('#rh').innerHTML=hs.map(h=>'<span class="hr">'+M[h[0]]+M[h[1]]+'</span>').join('');};sc();
 el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{
  if(hs.length>=R)return;const me=+b.dataset.r,k=hs.slice(-2).map(h=>h[0]).join('');let bot=Math.floor(Math.random()*3);
  if(hs.length>=3&&Math.random()<.85){const c=cx[k]||fq,pr=c.indexOf(Math.max(...c));bot=(pr+1)%3;}
  if(hs.length>=2){cx[k]=cx[k]||[0,0,0];cx[k][me]++;}fq[me]++;
  const r=(me-bot+3)%3;r===0?d++:r===1?w++:l++;SFX.play(r===0?'tie':r===1?'coin':'lose');hs.push([me,bot]);
  q('#rr').textContent=M[me]+' vs '+M[bot]+' → '+(r===0?'Tie.':r===1?'You win! 🎉':'Bot wins. 🤖')+(hs.length>=R?(w>l?'  🏆 Match won!':w<l?'  🤖 Bot takes the match.':'  🤝 Match drawn.'):'');sc();
 });
 q('#rz').onclick=()=>{nw();q('#rr').textContent='Fresh match. Pick your move.';sc();};
}

YK.register({
  id:"rps",
  pillar:'compete',
  icon:'✂️',
  title:'Rock Paper Scissors vs Bot',
  description:'Outsmart a bot that learns your habits.',
  events:['game-theory-hackathon','team-challenge'],
  thumb:'games/rps/thumb.png',
  theory:`<p>Rock Paper Scissors looks like a children's game, but it is the textbook <b>zero-sum game</b>: whatever you win, the other player loses.</p><ul><li><b>Nash equilibrium:</b> the only stable strategy is a <b>mixed strategy</b>: play each move with probability 1/3, completely at random. Then nothing your opponent does beats you in the long run (expected score 0).</li><li><b>Why patterns lose:</b> if you favour one move, a smart opponent plays the <b>best response</b> and exploits you. That is exactly what this bot does after a few rounds.</li><li><b>Minimax theorem (von Neumann):</b> in zero-sum games, maximising your worst case and minimising your opponent's best case give the same answer.</li><li><b>In the real world:</b> penalty kicks, tennis serves and poker bluffs all depend on being unpredictable. It is also the basis of adversarial and multi-agent AI.</li></ul>`,
  demo:b=>TIN(b,'Try it: how exploitable is your habit?',SL('r','How often you play Rock (%)',0,100,60)+'<small>Paper and Scissors share the rest equally.</small>',v=>{const r=v('r')/100,s=(1-r)/2,val=-Math.abs(r-s),sc=Math.round(val*100);return `Against an opponent who counters your habit${r>s?' (by always playing Paper)':r<s?' (by always playing Rock or Scissors accordingly)':''}, you score <b>${sc}</b> per 100 rounds.<br>${Math.abs(sc)<2?'✅ Unexploitable: this is the Nash equilibrium (1/3 each).':'⚠️ Any lean away from 1/3 can be punished. Randomness is the best defence.'}`}),
  run:rps
 });
})();
