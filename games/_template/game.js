/* ---------------------------------------------------------------------
   GAME TEMPLATE: copy this folder, rename it, and make it yours.
   Quick start:   node tools/new-game.js my-game "My Game" learn
   Full guide:    games/README.md

   This tiny example ("Ohm's Law Sprint") shows every part of a game:
   metadata, the game itself, theory text, a "Try it" demo and CSS.
   --------------------------------------------------------------------- */
(function(){
'use strict';

// 1. YOUR GAME. `el` is an empty box on the page: draw into it.
//    Keep everything inside this function so games never clash.
function play(el){
 let score=0,round=0,ans=0;
 const ROUNDS=5;

 const next=()=>{
  const V=[3,5,9,12][Math.random()*4|0],R=[100,220,330,470,1000][Math.random()*5|0];
  ans=Math.round(V/R*1000);                       // current in mA
  el.innerHTML=`
   <h2 class="m">Ohm's Law Sprint</h2>
   <p>Round <b>${++round}</b> of ${ROUNDS} &middot; Score <b>${score}</b></p>
   <p class="tpl-q">A <b>${V} V</b> supply drives a <b>${R} &Omega;</b> resistor. How many <b>mA</b> flow?</p>
   <div class="tpl-opts">${shuffle([ans,ans*2||2,Math.max(1,Math.round(ans/2)),ans+7]).map(n=>`<button class="chip" type="button" data-n="${n}">${n} mA</button>`).join('')}</div>
   <p id="tpl-fb" aria-live="polite"></p>`;
  el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{
   const good=+b.dataset.n===ans;
   SFX.play(good?'win':'buzz');                   // built-in sound effects
   if(good)score++;
   el.querySelector('#tpl-fb').innerHTML=good?'✅ Correct!':'❌ It was <b>'+ans+' mA</b>.';
   el.querySelectorAll('[data-n]').forEach(x=>x.disabled=true);
   setTimeout(()=>round<ROUNDS?next():done(),900);
  });
 };
 const done=()=>{
  el.innerHTML=`<h2 class="m">Done!</h2><p>You scored <b>${score}</b> out of ${ROUNDS}.</p>
   <button class="btn cy" type="button" id="tpl-again">Play again</button>`;
  el.querySelector('#tpl-again').onclick=()=>{score=0;round=0;next();};
 };
 const shuffle=a=>[...new Set(a)].sort(()=>Math.random()-.5);
 next();
}

// 2. REGISTER IT. This is what puts your game on the site.
YK.register({
 id:'template',                       // = your folder name: lowercase, numbers, dashes
 pillar:'learn',                      // 'learn' | 'build' | 'compete' | 'share'
 icon:'⚡',                           // one emoji
 title:"Ohm's Law Sprint",
 description:'Work out the current in five quick circuits.',   // one line
 events:['workshop-1'],               // ids from the EV list in index.html (can be [])
 authors:['@your-github-name'],       // optional: you get credit on the game page
 thumb:'games/template/thumb.svg',    // 800x800 picture in your folder (png/jpg/webp/svg)

 // Optional: a short explanation shown under the game (HTML allowed)
 theory:`<p><b>Ohm's law</b> links voltage, current and resistance: <b>I = V &divide; R</b>.</p>
  <ul><li>More resistance means less current.</li><li>Every LED needs a resistor so it does not burn out.</li></ul>`,

 // Optional: a small interactive demo under the theory. TIN() and SL() are provided.
 demo:box=>TIN(box,'Try it: change the resistor',
  SL('r','Resistor (Ω)',50,1000,220,10),
  v=>`Current at 5 V = <b>${(5/v('r')*1000).toFixed(1)} mA</b>`),

 // Optional: CSS only for your game. Prefix class names (here: tpl-) to avoid clashes.
 css:`.tpl-q{font-size:1.15rem}.tpl-opts{display:flex;gap:10px;flex-wrap:wrap}`,

 run:play                             // called with the empty box each time the game opens
});
})();
