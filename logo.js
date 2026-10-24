/* ==========================================================
   YANTRIKA: the club logo, in ONE place.

   Change the logo files or paths here and every page that uses
   YLOGO updates together. Today it is used in the navigation bar;
   later you can use it in the footer, the hero, the game screen etc.

   FILES (relative to index.html; on the web always use / not \):
     logo/logo.jpeg             full-colour logo (has a background)
     logo/logo_transparent.png  white logo, transparent background

   USE FROM ANY PAGE TEMPLATE / SCRIPT:
     YLOGO.img('black')             the transparent logo turned black   (for light/yellow backgrounds)
     YLOGO.img('white')             the transparent logo as it is, white (for dark backgrounds)
     YLOGO.img('color')             the full-colour logo
     YLOGO.img('black','my-class')  same, plus your own CSS class
     YLOGO.src('black')             just the file path, if you need it for a background-image etc.

   UPDATING THE LOGO LATER: replace the files, then raise ver below
   (e.g. '1' to '2') so browsers fetch the new picture instead of an old cached one.

   TO USE: add this line next to your other <script src=...> lines,
   BEFORE the big inline <script> in index.html:
       <script src="logo.js"></script>
   ========================================================== */
(function(){
 const YLOGO=window.YLOGO={
  ver:'1',
  color:'logo/logo.png',
  mono:'logo/logo_transparent.png',
  src:kind=>(kind==='color'?YLOGO.color:YLOGO.mono)+'?v='+YLOGO.ver,
  img:(kind,cls,alt)=>`<img class="ylogo ylogo-${kind||'black'}${cls?' '+cls:''}" src="${YLOGO.src(kind)}" alt="${alt||''}" decoding="async" onerror="this.remove()">`
 };

 /* looks: "black" = the white transparent logo turned pure black. Navigation bar: logo next to the name (the name keeps the site's marker font). */
 const css=`
 .ylogo{display:block;flex:0 0 auto;width:auto}
 .ylogo-black{filter:brightness(0)}
 nav .logo{display:flex;align-items:center;gap:10px}
 nav .logo .ylogo{height:40px;max-width:none}
 @media(max-width:600px){nav .logo{gap:8px}nav .logo .ylogo{height:34px}}`;
 if(!document.getElementById('ylogo-style')){
  const st=document.createElement('style');st.id='ylogo-style';st.textContent=css;document.head.appendChild(st);
 }
})();