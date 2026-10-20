# Yantrika official website

Website of **Yantrika**, the Robotics & Coding Club of IACS Kolkata
(Research Scholars' Association). Live at <https://yantrika.in>.

## 🎮 The Games Arcade is open source

The arcade ([`games/`](games/)) lets visitors learn robotics, electronics and
game theory by playing. **Every game is free and open source under the MIT
licence, and contributions are welcome**, from fixing a typo to adding a whole
new game.

* **Play:** open the *Games* page of the site.
* **Read the code:** each game is one file, `games/<id>/game.js`. Every game
  page has a *Read the code* link.
* **Add a game:** `node tools/new-game.js my-game "My Game" learn`, then follow
  [games/README.md](games/README.md). No build step, no framework.
* **Need ideas?** [docs/GAME_IDEAS.md](docs/GAME_IDEAS.md)
* **Rules, licensing and credit:** [CONTRIBUTING.md](CONTRIBUTING.md)

## Run it locally

No installs are needed to use or edit the site. Open `index.html` in a browser,
or serve the folder:

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
```

Press Ctrl+F5 after editing to bypass the cache.

## Project layout

| Path | What it is |
|---|---|
| `index.html` | The single-page site: events, team, materials, donate pages and the arcade page logic. A guide to editing it is at the top of the file. |
| `games/` | The open-source games: `manifest.js`, `core.js`, `games.css`, one folder per game, a `_template/`. |
| `tools/` | `check-games.js` (validator), `new-game.js` (scaffolder), `smoke-test.js` (opens every game). |
| `images/`, `posters/`, `materials/` | Photos, event posters, downloadable PDFs. |
| `animations.css`, `mobile.css`, `sitemap.js` ... | Extra styles and the footer. |

## Checks

```bash
node tools/check-games.js     # fast, no install
npm install && npm test       # validator + lint + opens every game headlessly
```

These run automatically on every pull request.

## Licence

[MIT](LICENSE). Contributors keep their copyright and license their work under
the same terms. See [CONTRIBUTING.md](CONTRIBUTING.md#licence-and-credit).
