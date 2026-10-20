/* Yantrika game: Binary LEDs
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Binary Rush (timed, lives, grows from 4 to 8 bits)
function bin(el){
 let b=[],B=4,t=0,sc=0,lives=3,tl=0,tot=0,iv=0,best=0,on=false;
 const val=()=>b.reduce((a,x)=>a*2+x,0),stop=()=>{clearInterval(iv);iv=0;};
 const nt=()=>{B=sc<5?4:sc<10?6:8;b=Array(B).fill(0);t=1+Math.floor(Math.random()*(2**B-1));tot=tl=Math.max(4,12-sc*.5);};
 const run=()=>{stop();iv=setInterval(()=>{if(!el.isConnected){stop();return;}tl-=.1;if(tl>0&&tl<=3&&Math.round(tl*10)%10===0)SFX.play('tick');const f=el.querySelector('#tb');if(f)f.style.width=Math.max(0,tl/tot*100)+'%';if(tl<=0)lose('⏰ Too slow!');},100);};
 const lose=m=>{lives--;stop();SFX.play(lives<=0?'lose':'buzz');if(lives<=0){on=false;best=Math.max(best,sc);draw('💥 Game over! You solved '+sc+'. Best: '+best+'.');return;}nt();draw(m+' You lost a life.');run();};
 const draw=m=>{
  el.innerHTML=`<h2 class="m">Binary Rush</h2>`+(!on?`<p>Light the LEDs so their bit values add up to the target, before the timer runs out. You get 3 lives. It starts with 4 bits, then grows to 6 and 8, and the timer shrinks. After 5 solves the live total is hidden, so you must add in your head.</p><p class="pdbig m" style="text-align:center">${m||'Ready?'}</p><div class="tbs"><button class="tb" id="bs" type="button">Start</button></div>`
  :`<p style="margin:0;text-align:center">Make <b class="m" style="font-size:2.6rem">${t}</b></p><div class="bar" style="max-width:none;margin:6px 0"><i id="tb" style="width:${tl/tot*100}%;transition:none;background:var(--or)"></i></div>
  <div class="slots" style="justify-content:center">${b.map((x,i)=>`<div style="text-align:center"><button class="slot ${x?'on':''}" type="button" data-b="${i}" aria-pressed="${!!x}" aria-label="Bit worth ${2**(B-1-i)}" style="opacity:1;cursor:pointer;font:inherit;color:inherit;background-color:${x?'var(--yel)':'transparent'}">${x?'💡':'⚫'}</button><br><b>${2**(B-1-i)}</b></div>`).join('')}</div>
  <p class="pdbig m" style="text-align:center;margin:4px 0">${m||''}</p><div class="info">${'❤️'.repeat(lives)+'🖤'.repeat(3-lives)} &nbsp; Solved: <b>${sc}</b> &nbsp; ${sc<5?'Current value: <b>'+val()+'</b>':'🙈 Live total hidden'}</div>`);
  const st=el.querySelector('#bs');if(st)st.onclick=()=>{on=true;sc=0;lives=3;nt();draw('');run();};
  el.querySelectorAll('[data-b]').forEach(c=>c.onclick=()=>{b[+c.dataset.b]^=1;SFX.play(b[+c.dataset.b]?'on':'off');if(val()===t){sc++;SFX.play('coin');nt();draw('✅ Match!');run();}else draw('');});
 };
 draw('');
}

YK.register({
  id:"binary",
  pillar:'learn',
  icon:'🔢',
  title:'Binary LEDs',
  description:'Light the bits to match the target number.',
  events:['workshop-1','ai-robotics-workshop'],
  thumb:'games/binary/thumb.jpg',
  theory:`<p>Computers store everything as bits (0 or 1). Each position doubles in value (1, 2, 4, 8...), so <b>4 bits give 2&#8308; = 16 values (0 to 15)</b> and 8 bits give 256. Arduino pins, memory and sensor readings are all numbers in binary.</p>`,
  demo:b=>TIN(b,'Try it: any number as 8 bits',SL('d','Number',0,255,13),v=>{const d=v('d');return `<b style="font-size:1.4rem;letter-spacing:.1em">${d.toString(2).padStart(8,'0')}</b> = ${d}<br>Needs <b>${d.toString(2).length}</b> bit${d?'s':''}. 1 byte (8 bits) holds up to 255.`}),
  run:bin
 });
})();
