/* ==========================================================
   YANTRIKA: auto-scrolling "Play a game" slider (home page)
   Add ONE line to index.html, just before </body>
   (next to the sitemap.js line):
       <script src="games-slider.js"></script>
   It reads the site's own game list (GM), so new games appear
   in the slider automatically. It appears on the home page only,
   between "Where we are now" and the Promo Video.
   ========================================================== */
(function(){
 function init(){
  try{
   if(typeof GM==='undefined'||!GM.length)return;
   const app=document.getElementById('app');
   if(!app)return;

   const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
   const col=typeof PCOL!=='undefined'?PCOL:{};
   const pil=typeof PIL!=='undefined'?PIL:[];
   const PE={learn:'📘',build:'🛠️',compete:'🏆',share:'📣'};   /* small emoji per pillar */
   const SECONDS_PER_GAME=6;                                      /* bigger = slower scrolling */

   /* ---- style (uses the page's colour variables, so dark mode works) ---- */
   if(!document.getElementById('gs-style')){
    const st=document.createElement('style');
    st.id='gs-style';
    st.textContent=`
    .gs{margin:0 0 40px}
    .gs-head{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:6px}
    .gs-head h2{margin:0}
    .gs-head .btn{margin:0}
    .gs-view{overflow:hidden;margin:0 -20px;padding:10px 0 22px;-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)}
    .gs-run{display:flex;width:max-content;animation:gsRun var(--gs-t,72s) linear infinite}
    .gs-view:hover .gs-run,.gs-view:focus-within .gs-run{animation-play-state:paused}
    @keyframes gsRun{to{transform:translateX(-50%)}}
    .gs-card{flex:0 0 270px;margin-right:16px;display:flex;flex-direction:column;gap:6px;text-align:left;font:inherit;color:var(--ink);cursor:pointer;background:var(--card);border:3px solid var(--dk);border-top:12px solid var(--pc,var(--dk));border-radius:12px;box-shadow:5px 5px 0 var(--dk);padding:14px 16px;transition:transform .15s ease,box-shadow .15s ease}
    .gs-card:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--dk)}
    .gs-card:focus-visible{outline:3px solid var(--bl);outline-offset:3px}
    .gs-top{display:flex;align-items:center;gap:10px}
    .gs-i{flex:0 0 auto;width:42px;height:42px;border-radius:50%;border:3px solid var(--dk);background:var(--yel);display:flex;align-items:center;justify-content:center;font-size:1.35rem;line-height:1}
    .gs-card b{font-size:1.15rem;line-height:1.2}
    .gs-card .badge{align-self:flex-start;margin:0;color:#fff;font-size:.78rem}
    .gs-card span.gs-d{flex:1;font-size:.95rem}
    .gs-card small{opacity:.75}
    .gs-go{font-weight:700;margin-top:4px}
    .gs-hint{margin:0;font-size:.9rem;opacity:.75}
    @media(max-width:600px){.gs-view{margin:0 -14px}.gs-card{flex-basis:230px}}
    @media(prefers-reduced-motion:reduce){.gs-run{animation:none}.gs-view{overflow-x:auto}.gs-clone{display:none}.gs-card{transition:none}}`;
    document.head.appendChild(st);
   }

   const card=(g,clone)=>{
    const p=pil.find(x=>x.k===g.p);
    const c=col[g.p]||'var(--dk)';
    const ev=(typeof EV!=='undefined'&&g.ev&&g.ev[0])?EV.find(e=>e.id===g.ev[0]):null;
    return `<button class="gs-card${clone?' gs-clone':''}" type="button" data-gs="${g.id}" style="--pc:${c}"${clone?' tabindex="-1" aria-hidden="true"':` aria-label="Play ${esc(g.t)}"`}>
      <span class="gs-top"><span class="gs-i" aria-hidden="true">${g.i}</span><b class="m">${esc(g.t)}</b></span>
      <span class="badge" style="background:${c}">${PE[g.p]||'🎮'} ${esc((p?p.t:g.p).toUpperCase())}</span>
      <span class="gs-d">${esc(g.d)}</span>
      ${ev?`<small>🔗 ${esc(ev.t)}</small>`:''}
      <span class="gs-go">🕹️ Play now &rarr;</span>
    </button>`;
   };

   function build(){
    if(!app.querySelector('.hero2'))return;      /* home page only */
    if(app.querySelector('#gs-home'))return;     /* already added */

    const one=GM.map(g=>card(g,false)).join('');
    const two=GM.map(g=>card(g,true)).join('');   /* second copy makes the loop seamless */

    const sec=document.createElement('section');
    sec.id='gs-home';sec.className='gs';sec.setAttribute('aria-label','Play a game');
    sec.innerHTML=`<div class="gs-head"><h2 class="m">🎮 Play a game</h2><a class="btn cy" href="#/games">All games &rarr;</a></div>
      <p class="gs-hint">Hover (or touch) to pause. Tap a card to play it. Every game prepares you for a Yantrika event.</p>
      <div class="gs-view"><div class="gs-run" style="--gs-t:${GM.length*SECONDS_PER_GAME}s">${one}${two}</div></div>`;

    const anchor=[...app.children].find(el=>el.tagName==='H2'&&/promo video/i.test(el.textContent))||app.querySelector('.vid');
    if(anchor)app.insertBefore(sec,anchor);else app.appendChild(sec);

    /* clicking a card opens the Games page with that game started */
    sec.addEventListener('click',e=>{
     const c=e.target.closest('[data-gs]');if(!c)return;
     pendG=c.dataset.gs;
     location.hash='#/games';
    });
   }

   /* the page content is re-drawn on every navigation, so watch for the home page */
   new MutationObserver(build).observe(app,{childList:true});
   build();
  }catch(err){console.warn('Games slider skipped:',err);}
 }
 if(document.readyState==='complete')init();else addEventListener('load',init);
})();
