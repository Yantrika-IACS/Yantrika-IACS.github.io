/* ==========================================================
   YANTRIKA: "Play a game" slider on the home page
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
   const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

   /* ---- style (uses the page's colour variables, so dark mode works) ---- */
   if(!document.getElementById('gs-style')){
    const st=document.createElement('style');
    st.id='gs-style';
    st.textContent=`
    .gs{margin:0 0 40px}
    .gs-head{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:6px}
    .gs-head h2{margin:0}
    .gs-head .btn{margin:0 0 0 8px}
    .gs-track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:10px 6px 22px;margin:0 -6px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
    .gs-track:focus-visible{outline:3px solid var(--bl);outline-offset:2px;border-radius:10px}
    .gs-card{flex:0 0 min(290px,78vw);scroll-snap-align:start;display:flex;flex-direction:column;gap:6px;text-align:left;font:inherit;color:var(--ink);cursor:pointer;background:var(--card);border:3px solid var(--dk);border-top:12px solid var(--pc,var(--dk));border-radius:12px;box-shadow:5px 5px 0 var(--dk);padding:14px 16px;transition:transform .15s ease,box-shadow .15s ease}
    .gs-card:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--dk)}
    .gs-card:focus-visible{outline:3px solid var(--bl);outline-offset:3px}
    .gs-i{font-size:2.6rem;line-height:1}
    .gs-card .badge{align-self:flex-start;margin:0;color:#fff;font-size:.78rem}
    .gs-card b{font-size:1.25rem;line-height:1.2}
    .gs-card span.gs-d{flex:1}
    .gs-card small{opacity:.75}
    .gs-go{font-weight:700;margin-top:4px}
    @media(prefers-reduced-motion:reduce){.gs-card{transition:none}}`;
    document.head.appendChild(st);
   }

   function build(){
    if(!app.querySelector('.hero2'))return;      /* home page only */
    if(app.querySelector('#gs-home'))return;     /* already added */

    const cards=GM.map(g=>{
     const p=pil.find(x=>x.k===g.p);
     const c=col[g.p]||'var(--dk)';
     const ev=(typeof EV!=='undefined'&&g.ev&&g.ev[0])?EV.find(e=>e.id===g.ev[0]):null;
     return `<button class="gs-card" type="button" data-gs="${g.id}" style="--pc:${c}" aria-label="Play ${esc(g.t)}">
       <span class="gs-i" aria-hidden="true">${g.i}</span>
       <span class="badge" style="background:${c}">${esc((p?p.t:g.p).toUpperCase())}</span>
       <b class="m">${esc(g.t)}</b>
       <span class="gs-d">${esc(g.d)}</span>
       ${ev?`<small>🔗 ${esc(ev.t)}</small>`:''}
       <span class="gs-go">Play now &rarr;</span>
     </button>`;
    }).join('');

    const sec=document.createElement('section');
    sec.id='gs-home';sec.className='gs';sec.setAttribute('aria-label','Play a game');
    sec.innerHTML=`<div class="gs-head"><h2 class="m">Play a game</h2>
      <div><button class="btn" type="button" data-d="-1" aria-label="Previous games">&larr;</button><button class="btn" type="button" data-d="1" aria-label="Next games">&rarr;</button><a class="btn cy" href="#/games">All games &rarr;</a></div></div>
      <p style="margin:0 0 4px">Swipe or use the arrows. Every game prepares you for a Yantrika event.</p>
      <div class="gs-track" tabindex="0" aria-label="Game cards, scroll sideways">${cards}</div>`;

    const anchor=[...app.children].find(el=>el.tagName==='H2'&&/promo video/i.test(el.textContent))||app.querySelector('.vid');
    if(anchor)app.insertBefore(sec,anchor);else app.appendChild(sec);
    wire(sec);
   }

   function wire(sec){
    const track=sec.querySelector('.gs-track');
    const step=()=>{const c=track.querySelector('.gs-card');return c?c.offsetWidth+16:300;};
    const move=d=>{
     const max=track.scrollWidth-track.clientWidth;
     if(d>0&&track.scrollLeft>=max-4)track.scrollTo({left:0,behavior:reduce?'auto':'smooth'});
     else if(d<0&&track.scrollLeft<=4)track.scrollTo({left:max,behavior:reduce?'auto':'smooth'});
     else track.scrollBy({left:d*step(),behavior:reduce?'auto':'smooth'});
    };
    sec.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>move(+b.dataset.d));

    /* clicking a card opens the Games page with that game started */
    track.addEventListener('click',e=>{
     const c=e.target.closest('[data-gs]');if(!c)return;
     pendG=c.dataset.gs;
     location.hash='#/games';
    });

    /* gentle auto-advance: pauses on hover, focus and touch; off for reduced motion */
    if(reduce)return;
    let paused=false,visible=false,t=null;
    const stop=()=>{paused=true;};
    const go=()=>{paused=false;};
    ['mouseenter','focusin','pointerdown','touchstart','wheel'].forEach(ev=>sec.addEventListener(ev,stop,{passive:true}));
    ['mouseleave','focusout'].forEach(ev=>sec.addEventListener(ev,go));
    sec.addEventListener('pointerup',()=>setTimeout(go,4000));
    new IntersectionObserver(en=>{visible=en[0].isIntersecting;},{threshold:.3}).observe(sec);
    t=setInterval(()=>{
     if(!sec.isConnected){clearInterval(t);return;}
     if(!paused&&visible)move(1);
    },3500);
   }

   /* the page content is re-drawn on every navigation, so watch for the home page */
   new MutationObserver(build).observe(app,{childList:true});
   build();
  }catch(err){console.warn('Games slider skipped:',err);}
 }
 if(document.readyState==='complete')init();else addEventListener('load',init);
})();
