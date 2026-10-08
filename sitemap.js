/* ==========================================================
   YANTRIKA: sitemap footer (dropdowns, shown on every page)
   Add ONE line to index.html, just before </body>:
       <script src="sitemap.js"></script>
   It reads the site's own data (pages, events, games, materials)
   and only lists pages/data that actually exist, so it works on
   both the simple and the full version of the site.
   ========================================================== */
(function(){
 function init(){
 try{
  if(document.getElementById('sitemap'))return;

  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const EXT=' target="_blank" rel="noopener"';
  const li=a=>`<li>${a}</li>`;
  const sub=(title,items)=>`<details class="sm-sub"><summary>${title}</summary><ul>${items.map(li).join('')}</ul></details>`;
  const top=(icon,title,body)=>`<details class="sm-top"><summary><span>${icon} ${title}</span></summary><div class="sm-body">${body}</div></details>`;

  /* ---- data from the main script, each part optional ---- */
  const pages =typeof PAGES !=='undefined'?PAGES:[];
  const evs   =typeof EV    !=='undefined'?EV:[];
  const games =typeof GM    !=='undefined'?GM:[];
  const pillars=typeof PIL  !=='undefined'?PIL:[];
  const mats  =typeof MAT   !=='undefined'?MAT:[];
  const status=typeof ST    !=='undefined'?ST:{done:['Completed'],plan:['Upcoming'],prop:['Coming soon']};
  const links =typeof LINKS !=='undefined'?LINKS:{};
  const has=id=>pages.some(p=>p[0]===id);
  const hasGames=has('games')&&games.length>0;

  /* ---- sections (a section is skipped if its page does not exist) ---- */
  const S=[];
  S.push('<a class="sm-top sm-home" href="#/"><span>🏠 Home</span></a>');

  if(has('about')){
   let b=`<ul>${li('<a href="#/about">About Yantrika</a>')}${li('<a href="#/about">What we aim for</a>')}</ul>`;
   if(pillars.length)b+=sub('Our four pillars',pillars.map(p=>hasGames
     ?`<a href="#/games" data-f="${p.k}">${esc(p.t)}: ${esc(p.d)}</a>`
     :`<a href="#/about">${esc(p.t)}: ${esc(p.d)}</a>`));
   S.push(top('ℹ️','About',b));
  }

  if(hasGames){
   S.push(top('🎮','Games',
    `<ul>${li('<a href="#/games">Games Arcade (all games)</a>')}</ul>`+
    (pillars.length?pillars:[{k:'',t:'All games'}]).map(p=>{
      const g=p.k?games.filter(x=>x.p===p.k):games;
      return sub(esc(p.t)+' ('+g.length+')',[
        ...(p.k?[`<a href="#/games" data-f="${p.k}">All ${esc(p.t)} games</a>`]:[]),
        ...g.map(x=>`<a href="#/games" data-g="${x.id}">${x.i} ${esc(x.t)}</a>`)]);
    }).join('')));
  }

  if(has('events')&&evs.length){
   S.push(top('📅','Events',
    `<ul>${li('<a href="#/events">All events</a>')}</ul>`+
    ['done','plan','prop'].filter(s=>evs.some(e=>e.s===s)).map(s=>
      sub(esc(status[s][0])+' ('+evs.filter(e=>e.s===s).length+')',
        evs.filter(e=>e.s===s).map(e=>`<a href="#/${e.id}">${esc(e.t)} <small>${esc(e.d)}</small></a>`))).join('')));
  }

  if(has('materials')){
   S.push(top('📚','Materials',
    `<ul>${li('<a href="#/materials">Search all materials</a>')}</ul>`+
    (mats.length?sub('Slides, code and docs',mats.map(m=>`<a href="${m.u}"${EXT}>${esc(m.t)} <small>${esc(m.k)}</small></a>`)):'')));
  }

  if(has('team')){
   let b=`<ul>${li('<a href="#/team">Meet the Team</a>')}${has('join')?li('<a href="#/join">Join the team</a>'):''}</ul>`;
   if(typeof TEAM!=='undefined'){
    const grp=(title,arr,plain)=>(arr&&arr.length)?sub(title+' ('+arr.length+')',arr.map(m=>`<a href="#/team">${esc(plain?m:m[0])}${plain?'':' <small>'+esc(m[1]||'')+'</small>'}</a>`)):'';
    b+=grp('Faculty Advisor',TEAM.adv)+grp('Core Committee',TEAM.core)+grp('Leads &amp; Editors',TEAM.lead)+grp('Backend Core Members',TEAM.back,true);
   }
   S.push(top('👥','Team',b));
  }

  if(has('join')){
   const online=[links.web&&`<a href="${links.web}"${EXT}>🌐 Website</a>`,links.ig&&`<a href="${links.ig}"${EXT}>📸 Instagram</a>`,links.li&&`<a href="${links.li}"${EXT}>💼 LinkedIn</a>`].filter(Boolean);
   S.push(top('✉️','Join &amp; Contact',
    `<ul>${li('<a href="#/join">'+(has('donate')?'Chat with us':'Contact form')+'</a>')}${links.mail?li(`<a href="mailto:${links.mail}">Email us</a>`):''}</ul>`+
    (online.length?sub('Find us online',online):'')));
  }

  if(has('donate')){
   S.push(top('💛','Donate',
    `<ul>${li('<a href="#/donate">Donate via UPI</a>')}${links.mail?li(`<a href="mailto:${links.mail}?subject=${encodeURIComponent('Donation / Sponsorship for Yantrika')}">Sponsor an event</a>`):''}</ul>`));
  }

  /* ---- footer element ---- */
  const f=document.createElement('footer');
  f.id='sitemap';f.className='sm';
  f.innerHTML=`<div class="sm-in">
   <div class="sm-head"><h2 class="m">Sitemap</h2>
    <span><button class="btn" type="button" id="sm-open">Expand all</button><button class="btn" type="button" id="sm-close">Collapse all</button></span></div>
   <nav class="sm-grid" aria-label="Sitemap">${S.join('')}</nav>
   <div class="sm-foot"><span><b>YANTRIKA</b> · Robotics &amp; Coding Club · RSA, IACS Kolkata</span><button class="btn" type="button" id="sm-top">Back to top &uarr;</button></div>
  </div>`;
  document.body.appendChild(f);

  /* ---- style (uses the page's colour variables, so dark mode works) ---- */
  const st=document.createElement('style');
  st.textContent=`
  .sm{position:relative;z-index:1;margin-top:20px;background:var(--yel);color:#17171d;border-top:4px solid var(--dk);padding:36px 20px calc(24px + env(safe-area-inset-bottom,0px))}
  .sm-in{max-width:980px;margin:0 auto}
  .sm-head{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:18px}
  .sm-head h2{margin:0;font-size:2.2rem}
  .sm .btn{margin:0 8px 0 0;background:#fff}
  .sm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;align-items:start}
  .sm-top{display:block;background:#fff;color:#17171d;border:3px solid var(--dk);border-radius:10px;box-shadow:4px 4px 0 var(--dk)}
  .sm-top>summary,a.sm-home{display:block;padding:12px 14px;font-weight:700;cursor:pointer;list-style:none;text-decoration:none;color:#17171d}
  .sm-top>summary::-webkit-details-marker{display:none}
  .sm-top>summary{display:flex;justify-content:space-between;align-items:center}
  .sm-top>summary::after{content:'▾';transition:transform .2s ease;font-size:1.1rem}
  .sm-top[open]>summary::after{transform:rotate(180deg)}
  a.sm-home:hover,.sm-top>summary:hover{background:var(--yel)}
  .sm-body{padding:2px 14px 12px}
  .sm ul{list-style:none;margin:0;padding:0}
  .sm li{margin:4px 0}
  .sm a{color:#17171d;text-decoration:none}
  .sm .sm-body a:hover{text-decoration:underline wavy var(--red)}
  .sm small{opacity:.65;font-weight:400}
  .sm-sub{margin:8px 0 0;border-left:4px solid var(--dk);padding-left:10px}
  .sm-sub>summary{cursor:pointer;font-weight:700;font-size:.95rem;list-style:none;padding:2px 0}
  .sm-sub>summary::-webkit-details-marker{display:none}
  .sm-sub>summary::before{content:'▸ ';display:inline-block;transition:transform .2s ease}
  .sm-sub[open]>summary::before{transform:rotate(90deg)}
  .sm-sub ul{margin:4px 0 6px}
  .sm-sub li{font-size:.92rem}
  .sm-foot{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-top:22px;padding-top:14px;border-top:3px dashed var(--dk)}
  .sm a:focus-visible,.sm summary:focus-visible{outline:3px solid var(--bl);outline-offset:2px}
  @supports (animation-timeline:view()){.sm-top{animation:floatIn linear backwards;animation-timeline:view();animation-range:entry 0% entry 65%}}
  @media(prefers-reduced-motion:reduce){.sm-top{animation:none}.sm-top>summary::after,.sm-sub>summary::before{transition:none}}
  @media(max-width:600px){.sm{padding-left:14px;padding-right:14px}}`;
  document.head.appendChild(st);

  /* open the top-level dropdowns on wide screens, keep them closed on phones */
  if(innerWidth>=720)f.querySelectorAll('details.sm-top').forEach(d=>d.open=true);
  f.querySelector('#sm-open').onclick=()=>f.querySelectorAll('details').forEach(d=>d.open=true);
  f.querySelector('#sm-close').onclick=()=>f.querySelectorAll('details').forEach(d=>d.open=false);
  f.querySelector('#sm-top').onclick=()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});

  /* game / pillar links: open the Games page pre-filtered or with the game started */
  f.addEventListener('click',e=>{
   const a=e.target.closest('a');if(!a)return;
   const g=a.dataset.g,k=a.dataset.f;
   if(!g&&!k)return;
   e.preventDefault();
   if(g)pendG=g;else pendF=k;
   if(location.hash==='#/games')r();else location.hash='#/games';
  });
 }catch(err){console.warn('Sitemap footer skipped:',err);}
 }
 /* run after the whole page (and the main script) has loaded, wherever this tag is placed */
 if(document.readyState==='complete')init();else addEventListener('load',init);
})();