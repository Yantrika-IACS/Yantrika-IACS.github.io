/* ==========================================================
   YANTRIKA: puts the background-music mute button (#sndb) in the
   navigation bar, right next to the theme toggle.

   The navigation bar is redrawn on every page change, which would delete
   anything placed inside it. This script keeps hold of the button and puts it
   back next to the theme toggle each time, so it survives navigation and keeps
   working exactly as before (it is the same button, only moved).

   TO USE: add this line at the very END of <body> in index.html, after the
   other scripts (after sitemap.js):
       <script src="sound-nav.js"></script>
   It also sets data-snd="off" (muted) or "on" on the button, following its emoji,
   so fullbleed.css can show a clean black speaker icon instead of the emoji.
   The look of the button in the bar is in fullbleed.css (rules for  nav #sndb).
   ========================================================== */
(function(){
 let btn=null,watched=null;
 /* the page's own script swaps the emoji (muted / sound on); mirror that as data-snd so CSS can draw a black icon */
 const sync=()=>{if(btn)btn.dataset.snd=btn.textContent.indexOf('\u{1F507}')>-1?'off':'on';};
 const place=()=>{
  const nav=document.getElementById('nav'),th=document.getElementById('th');
  if(!nav||!th)return;
  const found=document.getElementById('sndb');
  if(found)btn=found;                       /* the page's sound button, or the one we already hold */
  if(btn&&btn!==watched){watched=btn;new MutationObserver(sync).observe(btn,{childList:true,characterData:true,subtree:true});}
  sync();
  if(btn&&th.nextElementSibling!==btn)th.after(btn);
 };
 /* the bar was redrawn: put the button back straight away (before the screen repaints) */
 const nav=document.getElementById('nav');
 if(nav)new MutationObserver(place).observe(nav,{childList:true});
 /* the button was created after this script ran: pick it up (at most once per frame) */
 let q=false;
 new MutationObserver(()=>{if(!q){q=true;requestAnimationFrame(()=>{q=false;place();});}})
  .observe(document.body,{childList:true,subtree:true});
 place();
})();
