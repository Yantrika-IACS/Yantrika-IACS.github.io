/* Yantrika game: Pattern Memory
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Pattern Memory (3 modes, sound, speeds up)
function simon(el){
 const C=['#ec3750','#338eda','#33d6a6','#f1c40f'],N=['Red','Blue','Green','Yellow'],F=[262,330,392,523],MD=['Classic','Backwards','Turbo'];let seq=[],pos=0,lock=true,bl=[0,0,0],g=0,md=0,au=null;
 el.innerHTML=`<h2 class="m">Pattern Memory</h2><p>Watch the sequence, then repeat it. <b>Backwards</b> mode asks for the sequence in reverse order. <b>Turbo</b> plays much faster. Every level adds a step and the playback speeds up.</p><div>${MD.map((m,i)=>`<button class="chip" type="button" data-m="${i}" aria-pressed="${i===0}">${m}</button>`).join('')}</div><div class="sg">${C.map((c,i)=>`<button type="button" data-s="${i}" aria-label="${N[i]}" style="background:${c}"></button>`).join('')}</div><p class="pdbig m" id="ss" aria-live="polite" style="text-align:center">Pick a mode, then press start.</p><div class="tbs"><button class="tb" id="go" type="button">Start</button></div>`;
 const bs=el.querySelectorAll('[data-s]'),ss=el.querySelector('#ss');
 const beep=i=>{try{au=au||new(window.AudioContext||window.webkitAudioContext)();const o=au.createOscillator(),k=au.createGain();o.frequency.value=F[i];o.connect(k);k.connect(au.destination);k.gain.setValueAtTime(.15,au.currentTime);k.gain.exponentialRampToValueAtTime(.001,au.currentTime+.3);o.start();o.stop(au.currentTime+.3);}catch(e){}};
 const fl=i=>{beep(i);bs[i].style.filter='brightness(1.7) saturate(1.4)';bs[i].style.transform='scale(.94)';setTimeout(()=>{bs[i].style.filter='';bs[i].style.transform='';},220);};
 const gap=()=>Math.max(200,(md===2?420:700)-seq.length*(md===2?12:25));
 const show=()=>{const my=++g,gp=gap();lock=true;pos=0;ss.textContent='Watch... level '+seq.length;seq.forEach((x,k)=>setTimeout(()=>{if(my===g)fl(x)},gp*k+500));setTimeout(()=>{if(my===g){lock=false;ss.textContent=md===1?'Your turn: BACKWARDS!':'Your turn!';}},gp*seq.length+500);};
 const nxt=()=>{seq.push(Math.floor(Math.random()*4));show();};
 el.querySelectorAll('[data-m]').forEach(c=>c.onclick=()=>{md=+c.dataset.m;g++;seq=[];lock=true;el.querySelectorAll('[data-m]').forEach(x=>x.setAttribute('aria-pressed',String(x===c)));ss.textContent=MD[md]+' mode. Press start.';});
 el.querySelector('#go').onclick=()=>{seq=[];el.querySelector('#go').textContent='Restart';nxt();};
 bs.forEach(b=>b.onclick=()=>{if(lock)return;const i=+b.dataset.s,ex=md===1?seq[seq.length-1-pos]:seq[pos];fl(i);
  if(i!==ex){lock=true;SFX.play('lose');const l=seq.length-1;bl[md]=Math.max(bl[md],l);ss.textContent='❌ Wrong! You cleared '+l+' level'+(l===1?'':'s')+'. Best in '+MD[md]+': '+bl[md]+'.';seq=[];return;}
  pos++;if(pos===seq.length){lock=true;SFX.play('coin');const my=g;ss.textContent='✅ Level '+seq.length+' cleared!';setTimeout(()=>{if(my===g)nxt()},900);}});
}

YK.register({
  id:"simon",
  pillar:'compete',
  icon:'🧠',
  title:'Pattern Memory',
  description:'Repeat a growing colour sequence.',
  events:['robotics-hackathon','technical-hackathon'],
  thumb:'games/simon/thumb.png',
  theory:`<p>Your <b>working memory</b> holds roughly 7 ± 2 items (Miller's law). Experts go further by <b>chunking</b>: grouping steps into patterns. Programmers do the same by breaking long programs into small functions.</p>`,
  demo:b=>TIN(b,'Try it: chunking',SL('g','Group size',1,6,1)+'<small>Remember: 948371625034</small>',v=>{const g=v('g'),s='948371625034'.match(new RegExp('.{1,'+g+'}','g'));return `<b style="font-size:1.3rem">${s.join(' ')}</b><br>Items to remember: <b>${s.length}</b> ${s.length<=4?'✅ easy':s.length<=7?'🙂 doable':'😵 hard'}`}),
  run:simon
 });
})();
