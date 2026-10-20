/* =====================================================================
   YANTRIKA GAMES: core (open source, MIT)
   ---------------------------------------------------------------------
   Every game lives in its own folder:  games/<id>/game.js
   and registers itself with  YK.register({...}).
   The list of games on the site is games/manifest.js.
   Full guide for contributors: games/README.md and CONTRIBUTING.md

   This file gives games a few shared tools (available to every game):
     esc(text)          make text safe to put inside HTML
     SFX.play(name)     sound effects: click on off step bump hint tick ping go
                        tie coin win lose buzz gavel whoosh devil
     SL(id,label,min,max,value,step)   a slider for a "Try it" demo
     TIN(box,title,html,fn)            the "Try it" demo box
     YK.figure(x,hat,mood)             cartoon character (games/shared/figures.js)
     EV, LINKS, PIL     site data (events, links, pillars), read-only
   ===================================================================== */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SFX=(()=>{let ac=null,on=true;try{on=localStorage.getItem('yk_snd')!=='0'}catch(e){}
 const cx=()=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}};
 const t=(f,d=.15,ty='sine',v=.1,at=0,f2)=>{const a=cx();if(!a||!on)return;const o=a.createOscillator(),g=a.createGain(),st=a.currentTime+at;o.type=ty;o.frequency.setValueAtTime(f,st);if(f2)o.frequency.exponentialRampToValueAtTime(f2,st+d);g.gain.setValueAtTime(v,st);g.gain.exponentialRampToValueAtTime(.001,st+d);o.connect(g);g.connect(a.destination);o.start(st);o.stop(st+d+.02);};
 const S={
  click:()=>t(520,.04,'square',.03),
  on:()=>{t(600,.07,'square',.06);t(900,.09,'square',.06,.06)},
  off:()=>{t(900,.07,'square',.05);t(520,.09,'square',.05,.06)},
  step:()=>t(260,.05,'triangle',.07,0,200),
  bump:()=>t(90,.12,'square',.09,0,60),
  hint:()=>{t(660,.1,'sine',.1);t(990,.16,'sine',.1,.09)},
  tick:()=>t(1500,.04,'square',.05),
  ping:()=>t(1300,.35,'sine',.1,0,700),
  go:()=>t(880,.3,'square',.09),
  tie:()=>{t(440,.12,'triangle',.09);t(440,.12,'triangle',.09,.14)},
  coin:()=>{t(988,.07,'square',.06);t(1319,.22,'square',.06,.07)},
  win:()=>[523,659,784,1047].forEach((f,i)=>t(f,.2,'triangle',.11,i*.1)),
  lose:()=>[392,370,349,311].forEach((f,i)=>t(f,.3,'sawtooth',.07,i*.22,f*.93)),
  buzz:()=>{t(120,.3,'sawtooth',.1);t(114,.3,'square',.05)},
  gavel:()=>{t(180,.1,'square',.14,0,60);t(140,.16,'square',.12,.16,50)},
  whoosh:()=>t(200,.35,'sawtooth',.05,0,1200),
  devil:()=>{t(70,1.3,'sawtooth',.06);for(let i=0;i<5;i++){t(250-i*20,.15,'sawtooth',.09,i*.2,200-i*20);t(500-i*40,.1,'square',.025,i*.2+.02)}}
 };
 return{play:n=>{try{S[n]&&S[n]()}catch(e){}},toggle:()=>{on=!on;try{localStorage.setItem('yk_snd',on?'1':'0')}catch(e){}return on},get on(){return on}};
})();
(()=>{const mk=()=>{const b=document.createElement('button');b.id='sndb';b.type='button';b.className='chip';b.setAttribute('aria-label','Toggle sound effects');b.style.cssText='position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:60';const u=()=>{b.textContent=SFX.on?'🔊':'🔇';};u();b.onclick=e=>{e.stopPropagation();SFX.toggle();u();SFX.play('on');};document.body.appendChild(b);};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mk):mk();
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&b.id!=='sndb')SFX.play('click');},true);})();
const SL=(id,l,a,b,v,st)=>`<label for="ti_${id}"><b>${l}: <span id="ti_${id}v"></span></b></label><input id="ti_${id}" type="range" min="${a}" max="${b}" step="${st||1}" value="${v}" style="display:block;width:100%;max-width:420px;margin:4px 0 8px">`;
const TIN=(box,title,html,fn)=>{box.innerHTML=`<div class="tiny"><h4 class="m">🧪 ${title}</h4>${html}<div id="ti_o"></div></div>`;const v=k=>+box.querySelector('#ti_'+k).value,u=()=>{box.querySelectorAll('input[type=range]').forEach(i=>{const t=box.querySelector('#'+i.id+'v');if(t)t.textContent=i.value});box.querySelector('#ti_o').innerHTML=fn(v)};box.querySelectorAll('input,select').forEach(i=>i.oninput=i.onchange=u);u();};

const YK=(()=>{
 const PILLARS=['learn','build','compete','share'];
 // Change this one line if the repository ever moves.
 const REPO='https://github.com/yantrika-iacs/Yantrika-IACS.github.io';
 const games=[],thumbs={},theory={},demos={},problems=[];
 let loading=null;

 const warn=m=>{problems.push(m);try{console.error('[Yantrika games] '+m);}catch(e){}};

 /* A game calls this once. Long names are what contributors write; the site's
    older code reads the short names (p, i, t, d, ev), so both are kept. */
 function register(d){
  if(!d||typeof d!=='object')return warn('register() needs an object');
  const id=d.id;
  if(typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))return warn('game id must be lowercase letters, numbers and dashes: '+id);
  if(games.some(g=>g.id===id))return warn('duplicate game id: '+id);
  if(!PILLARS.includes(d.pillar))return warn(id+': pillar must be one of '+PILLARS.join(', '));
  if(typeof d.title!=='string'||!d.title.trim())return warn(id+': title is required');
  if(typeof d.description!=='string'||!d.description.trim())return warn(id+': description is required');
  if(typeof d.run!=='function')return warn(id+': run(el) function is required');
  const g={
   id,pillar:d.pillar,icon:d.icon||'🎮',title:d.title,description:d.description,
   events:Array.isArray(d.events)?d.events.slice():[],
   authors:Array.isArray(d.authors)?d.authors.slice():[],
   thumb:d.thumb||'games/'+id+'/thumb.png',run:d.run
  };
  // short names used by the rest of the site
  g.p=g.pillar;g.i=g.icon;g.t=g.title;g.d=g.description;g.ev=g.events;
  games.push(g);
  thumbs[id]=g.thumb;
  if(d.theory)theory[id]=d.theory;
  if(typeof d.demo==='function')demos[id]=d.demo;
  if(d.css&&typeof document!=='undefined'){
   const s=document.createElement('style');s.setAttribute('data-game',id);s.textContent=String(d.css);document.head.appendChild(s);
  }
 }

 /* Loads games/shared/* and every game listed in games/manifest.js.
    Scripts download in parallel but run in manifest order. One broken game
    never stops the others from loading. */
 function load(){
  if(loading)return loading;
  const m=YK.manifest||{shared:[],games:[]};
  const urls=[...(m.shared||[]).map(p=>'games/'+p),...(m.games||[]).map(id=>'games/'+id+'/game.js')];
  loading=Promise.all(urls.map(u=>new Promise(res=>{
   const s=document.createElement('script');
   s.src=u;s.async=false;
   s.onload=()=>res();
   s.onerror=()=>{warn('could not load '+u);res();};
   document.head.appendChild(s);
  }))).then(()=>games);
  return loading;
 }

 const srcUrl=id=>REPO+'/tree/main/games/'+id;
 const editUrl=id=>REPO+'/edit/main/games/'+id+'/game.js';
 const bugUrl=id=>REPO+'/issues/new?template=bug_report.yml&title='+encodeURIComponent('['+id+'] ');
 const ideaUrl=REPO+'/issues/new?template=game_idea.yml';
 const guideUrl=REPO+'/blob/main/CONTRIBUTING.md';

 const ext='target="_blank" rel="noopener"';
 /* Small strip shown under every open game */
 const srcStrip=g=>`<div class="info oss"><b>💻 This game is open source (MIT).</b> ${g.authors.length?'Made by '+g.authors.map(esc).join(', ')+'. ':''}Spot a bug or have a better idea? <a href="${srcUrl(g.id)}" ${ext}>Read the code</a> · <a href="${editUrl(g.id)}" ${ext}>Edit it on GitHub</a> · <a href="${bugUrl(g.id)}" ${ext}>Report a bug</a></div>`;
 /* Card shown on the Games page */
 const ossCard=()=>`<div class="card oss-card"><h2 class="m">Build a game with us</h2><p>Every game in this arcade is <b>free and open source</b> under the MIT licence. Read the code, learn from it, remix it, or add your own game. Anyone can contribute: students, alumni, hobbyists and first-timers. A new game is just one folder with one JavaScript file, and no tools or build step are needed.</p><p><a class="btn cy" href="${guideUrl}" ${ext}>How to contribute</a><a class="btn" href="${REPO}/tree/main/games" ${ext}>Browse the source</a><a class="btn" href="${ideaUrl}" ${ext}>Suggest a game</a></p></div>`;

 return{games,thumbs,theory,demos,problems,PILLARS,REPO,register,load,srcUrl,editUrl,bugUrl,ideaUrl,guideUrl,srcStrip,ossCard,manifest:null};
})();
