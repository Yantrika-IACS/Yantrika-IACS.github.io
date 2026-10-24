/* ==========================================================
   YANTRIKA: footer (black, faint grid, logo + link columns)
   Keep the one line in index.html, just before </body>:
       <script src="sitemap.js"></script>
   Edit LOGO and GITHUB below if needed.
   ========================================================== */
(function(){
 const LOGO='images/old_text.png';                    /* PNG logo shown in the footer */
 const GITHUB='https://github.com/yantrika-iacs'; /* change to your GitHub org link */

 const IC={
  github:'<svg viewBox="0 0 16 16" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  linkedin:'<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 11v5M8 8v.01M12 16v-5M12 13c0-1.5 1-2 2-2s2 .7 2 2.2V16"/></svg>',
  email:'<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>'
 };

 function init(){
  try{
   if(document.getElementById('sitemap'))return;
   const L=typeof LINKS!=='undefined'?LINKS:{};
   const pages=typeof PAGES!=='undefined'?PAGES:[['home','Home']];
   const label={};pages.forEach(p=>label[p[0]]=p[1]);
   const href=id=>id==='home'?'#/':'#/'+id;
   const col=(title,ids)=>{
    const l=ids.filter(id=>label[id]).map(id=>`<li><a href="${href(id)}">${label[id]}</a></li>`).join('');
    return l?`<div><h3>${title}</h3><ul>${l}</ul></div>`:'';
   };
   const first=['about','events','team','join'];
   const second=['games','materials','donate'];
   const rest=pages.map(p=>p[0]).filter(id=>id!=='home'&&!first.includes(id)&&!second.includes(id));

   const ext='target="_blank" rel="noopener"';
   const soc=[
    ['GitHub',GITHUB,IC.github,ext],
    L.ig&&['Instagram',L.ig,IC.instagram,ext],
    L.li&&['LinkedIn',L.li,IC.linkedin,ext],
    L.mail&&['Email','mailto:'+L.mail,IC.email,'']
   ].filter(Boolean).map(s=>`<a href="${s[1]}" ${s[3]} aria-label="${s[0]}" title="${s[0]}">${s[2]}</a>`).join('');

   const f=document.createElement('footer');
   f.id='sitemap';
   f.innerHTML=`<div class="sm-in">
    <div class="sm-main">
     <div class="sm-brand">
      <a href="#/" class="sm-logo">${typeof YLOGO!=='undefined'?YLOGO.img('color','sm-mark'):''}<img src="${LOGO}" alt="YANTRIKA" onerror="this.replaceWith(document.createTextNode('YANTRIKA'))"></a>
      <p class="sm-tag">Learn. Build. Compete. Share.</p>
      ${L.mail?`<p><a href="mailto:${L.mail}">${L.mail}</a></p>`:''}
      <div class="sm-soc">${soc}</div>
     </div>
     ${col('Yantrika',first)}
     ${col('Resources',[...second,...rest])}
    </div>
    <div class="sm-bot">
     <span>© ${new Date().getFullYear()} Yantrika. Robotics &amp; Coding Club, RSA, IACS Kolkata.</span>
     <button type="button" id="sm-th">◐ Toggle theme</button>
    </div>
   </div>`;
   document.body.appendChild(f);

   const s=document.createElement('style');
   s.textContent=`#sitemap{position:relative;z-index:1;margin-top:60px;color:#fff;background-color:#000;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:50px 50px;padding:64px 20px calc(30px + env(safe-area-inset-bottom,0px))}
#sitemap .sm-in{max-width:980px;margin:0 auto}
#sitemap .sm-main{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:40px}
#sitemap img{height:64px;width:auto;max-width:100%;display:block}
#sitemap .sm-logo{display:inline-flex;align-items:center;gap:14px;font-size:2rem;font-weight:700;margin-bottom:12px}
#sitemap .sm-mark{flex:0 0 auto;max-width:none;border-radius:10px}
#sitemap .sm-tag{font-size:1.15rem;margin:8px 0 4px}
#sitemap p{margin:4px 0}
#sitemap h3{font-size:1rem;margin:0 0 16px}
#sitemap ul{list-style:none;margin:0;padding:0}
#sitemap li{margin:0 0 14px;font-size:.92rem}
#sitemap a{color:#fff;text-decoration:none}
#sitemap a:hover{text-decoration:underline}
#sitemap .sm-soc{display:flex;gap:18px;margin-top:26px}
#sitemap .sm-soc a:hover{opacity:.7;text-decoration:none}
#sitemap .sm-bot{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;margin-top:60px;font-size:.85rem}
#sitemap button{background:none;border:0;color:#fff;font:inherit;cursor:pointer;padding:0}
#sitemap button:hover{text-decoration:underline}
#sitemap a:focus-visible,#sitemap button:focus-visible{outline:2px solid #fff;outline-offset:3px}
@media(max-width:700px){#sitemap .sm-main{grid-template-columns:1fr 1fr}#sitemap .sm-brand{grid-column:1/-1}#sitemap .sm-logo img{height:48px}}`;
   document.head.appendChild(s);

   f.querySelector('#sm-th').onclick=()=>{const t=document.getElementById('th');if(t)t.click();};
  }catch(err){console.warn('Footer skipped:',err);}
 }
 if(document.readyState==='complete')init();else addEventListener('load',init);
})();
