// Lints the games for typos and for use of things that do not exist.
// (The games share a few helpers from games/core.js; they are listed below.)
const globals=require('globals');
module.exports=[
 {
  files:['games/**/*.js'],
  ignores:['games/core.js','games/manifest.js'],
  languageOptions:{
   ecmaVersion:2022,sourceType:'script',
   globals:{...globals.browser,
    YK:'readonly',esc:'readonly',SFX:'readonly',SL:'readonly',TIN:'readonly',
    EV:'readonly',LINKS:'readonly',PIL:'readonly'}
  },
  rules:{
   'no-undef':'error','no-redeclare':'error','no-dupe-keys':'error','no-unreachable':'error',
   'no-unused-vars':['warn',{args:'none'}]
  }
 }
];
