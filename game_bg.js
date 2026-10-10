/* ==========================================================
   YANTRIKA: game picture as the background when a game is opened
   Add ONE line to index.html, just before </body>
   (next to the sitemap.js line):
       <script src="game-bg.js"></script>
   When a game is clicked on the Games page (or from the home
   slider / an event page), the game's picture fills the
   background of the opened game with a slight see-through veil.
   It uses your own GI picture list, so new games work too.
   ========================================================== */
(function(){
 /* How strongly the page colour covers the picture (0% = picture at full
    strength, 100% = no picture). 60% keeps text easy to read. */
 const VEIL='60%';

 function init(){
  try{
   if(typeof GM==='undefined'||typeof GI==='undefined')return;
   const app=document.getElementById('app');
   if(!app)return;

   if(!document.getElementById('gbg-style')){
    const st=document.createElement('style');
    st.id='gbg-style';
    st.textContent=`
    .gfull.has-bg{
      background-color:var(--bg);
      background-image:linear-gradient(color-mix(in srgb,var(--bg) ${VEIL},transparent),color-mix(in srgb,var(--bg) ${VEIL},transparent)),var(--gbg);
      background-size:cover;
      background-position:center;
      background-repeat:no-repeat;
    }`;
    document.head.appendChild(st);
   }

   function apply(gp){
    if(!gp.classList.contains('gfull')){gp.classList.remove('has-bg');return;}
    const badge=gp.querySelector('.gbar .badge');
    const title=badge?badge.textContent.trim():'';
    const g=GM.find(x=>(x.i+' '+x.t)===title);
    const path=g&&GI[g.id];
    if(path){
     gp.style.setProperty('--gbg','url("'+new URL(path,document.baseURI).href+'")');
     gp.classList.add('has-bg');
    }else gp.classList.remove('has-bg');
   }

   function watch(){
    const gp=document.getElementById('gp');
    if(!gp||gp.__bg)return;
    gp.__bg=true;
    /* re-check when the game panel is opened/closed or its content is replaced */
    new MutationObserver(()=>apply(gp)).observe(gp,{childList:true,attributes:true,attributeFilter:['class']});
    apply(gp);
   }

   /* the Games page is re-drawn on every navigation, so look for a new panel each time */
   new MutationObserver(watch).observe(app,{childList:true});
   watch();
  }catch(err){console.warn('Game background skipped:',err);}
 }
 if(document.readyState==='complete')init();else addEventListener('load',init);
})();