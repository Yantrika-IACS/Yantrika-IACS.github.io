# Yantrika Games: developer guide

Every game in the Yantrika Games Arcade is **open source (MIT)**. A game is one
folder with one JavaScript file. No build step, no framework, no installs: if
you can open `index.html` in a browser, you can make a game.

```
games/
  manifest.js          the list of games shown on the site (and their order)
  core.js              small shared toolkit (esc, SFX, SL, TIN, YK.register ...)
  games.css            shared look of the arcade
  shared/              helper scripts several games can use
  _template/           copy this to start a new game
  <your-id>/
    game.js            your game
    thumb.png          800x800 picture (png, jpg, webp or svg)
```

## Your first game in 5 minutes

```bash
git clone https://github.com/yantrika-iacs/Yantrika-IACS.github.io
cd Yantrika-IACS.github.io
node tools/new-game.js sort-race "Sorting Race" compete   # makes games/sort-race/
```

Open `index.html` in your browser (or run `python3 -m http.server` and visit
`localhost:8000`), go to **Games**, and play your new game. Edit
`games/sort-race/game.js`, refresh, repeat. When you are happy:

```bash
node tools/check-games.js      # catches the usual mistakes
git checkout -b game/sort-race
git add games && git commit -m "Add Sorting Race"
```

Then open a pull request. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## What a game looks like

```js
(function(){
'use strict';

function play(el){            // el = an empty box on the page
  el.innerHTML = '<h2 class="m">Hello</h2><button class="btn cy" id="go">Go</button>';
  el.querySelector('#go').onclick = () => SFX.play('win');
}

YK.register({
  id: 'hello',                // = folder name
  pillar: 'learn',            // learn | build | compete | share
  icon: '👋',
  title: 'Hello Bot',
  description: 'One short line shown on the game card.',
  events: ['workshop-1'],     // event ids from EV in index.html, or []
  thumb: 'games/hello/thumb.png',
  run: play
});
})();
```

Wrap everything in `(function(){ ... })();` so your names never clash with
another game.

## `YK.register({...})` fields

| Field | Required | What it is |
|---|---|---|
| `id` | yes | Lowercase letters, numbers, dashes. Must equal the folder name. |
| `pillar` | yes | `learn`, `build`, `compete` or `share` (the four Yantrika pillars). |
| `title` | yes | Game name (keep it under 40 characters). |
| `description` | yes | One line for the game card (under about 110 characters). |
| `run(el)` | yes | Draws the game into `el`. Called every time the game is opened. |
| `icon` | no | One emoji. Default 🎮. |
| `events` | no | List of event ids the game prepares people for. The game then shows up on those event pages. Valid ids are in the `EV` list in `index.html`. |
| `thumb` | no | Path to your picture, inside your folder. Default `games/<id>/thumb.png`. |
| `theory` | no | HTML shown under the game ("The theory behind it"). |
| `demo(box)` | no | A small interactive "Try it" shown under the theory. Use `TIN` and `SL`. |
| `css` | no | CSS text for your game only. Prefix your class names (`mygame-`). |
| `authors` | no | List of names or GitHub handles, e.g. `['@octocat']`. Shown on the game page. |

## Tools you can use inside a game

| Name | What it does |
|---|---|
| `esc(text)` | Makes text safe to put into `innerHTML`. Always use it on anything that is not your own fixed text. |
| `SFX.play(name)` | Sound effects: `click on off step bump hint tick ping go tie coin win lose buzz gavel whoosh devil`. The player's mute button is respected for you. |
| `SL(id, label, min, max, value, step)` | A slider for a "Try it" demo. |
| `TIN(box, title, html, fn)` | The "Try it" box. `fn(v)` returns HTML; `v('id')` reads a slider or select. See `games/circuit/game.js`. |
| `YK.figure(x, hat, mood)` | Cartoon character (SVG). Moods: `normal happy sad angry devil`. |
| `EV`, `LINKS`, `PIL` | Site data (events, links, pillars). Read only. |

## Look and feel

* Use the site's CSS variables so dark mode works: `--bg --card --ink --dk
  --soft --red --yel --cy --bl --or --pk`.
* Ready-made classes: `btn`, `btn cy`, `chip` (toggle buttons, use
  `aria-pressed`), `info` (note box), `bar`, `m` (marker-style heading).
* Games open **full screen** on phones, tablets and laptops. Test a narrow
  screen. Use `max-width:100%`, wrapping flex rows and tap targets of at least
  40px.
* Use real `<button>` elements, `aria-live="polite"` for results, and never
  rely on colour alone. Respect `prefers-reduced-motion`.

## Rules (the checker enforces most of these)

1. **Works offline, no tracking.** No network requests (`fetch`, XHR,
   WebSocket), no cookies, no analytics, no accounts, no external scripts,
   fonts or images. Put pictures inside your folder.
2. **No personal data and no leaderboards.** The arcade does not store scores
   or names. Keep "best score" values in memory only.
3. **Clean up.** If you use `setInterval` or `setTimeout`, stop them when
   `el` is no longer on the page (`if(!el.isConnected) return;`).
4. **One folder.** Everything for your game lives in `games/<id>/`. The only
   file outside it you edit is `games/manifest.js` (one line).
5. **Educational and kind.** Games should teach or celebrate something from
   robotics, electronics, computing, maths or game theory, and be suitable for
   school students.
6. **Your work, or properly credited.** Only submit code, pictures and text you
   wrote or have the right to share under MIT. See CONTRIBUTING.md.
7. **Keep it small.** `game.js` under 150 KB, thumbnail under 500 KB.

## Checks

```bash
node tools/check-games.js   # no install needed. Validates folders, fields, events, thumbnails, banned patterns
npm install && npm test     # also lints your code and opens every game in a fake browser
```

The same checks run automatically on every pull request.

## Improving an existing game

Each open game has an **Edit it on GitHub** link under it. You can also fix
typos, add a harder level, improve the theory text or make a game easier to use
on phones. Small pull requests are very welcome.
