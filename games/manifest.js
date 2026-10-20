/* =====================================================================
   YANTRIKA GAMES: manifest
   The games shown on the site, in this order (home slider, Games page).

   TO ADD YOUR GAME: put it in  games/<your-id>/game.js  and add its id to
   the list below. That is the only line outside your folder you change.
   See games/README.md.
   ===================================================================== */
YK.manifest={
 // Shared helper scripts that games may use (load before the games)
 shared:['shared/figures.js'],
 games:[
  // Learn
  'circuit','binary','walk','echo',
  // Build
  'bot','breadboard','pd',
  // Compete
  'duel','simon','maze','rps','auction', 'sumobot',
  // Share
  'pick','plan'
 ]
};
