# Contributing to Yantrika

Thank you for helping! The **Games Arcade is fully open source** and built to be
easy to contribute to, whether you are a first-year student, an alumnus, or a
hobbyist anywhere in the world. You do not need to be a Yantrika member.

## Ways to contribute

* **Add a new game.** Best starting point: [games/README.md](games/README.md)
  and the ideas in [docs/GAME_IDEAS.md](docs/GAME_IDEAS.md).
* **Improve a game**: fix a bug, add a level, tidy the theory text, make it
  work better on phones, add keyboard or screen-reader support, translate it.
* **Report a bug or suggest a game** with an
  [issue](../../issues/new/choose).
* **Review pull requests.** Fresh eyes are valuable.

Using the rest of the site (events, team, donations)? Open an issue first; the
games arcade is where pull requests are most welcome.

## Add a game in four steps

1. **Claim it (optional but friendly).** Open a *Game idea* issue so others
   know you are on it.
2. **Fork** the repository and create a branch: `git checkout -b game/my-game`.
3. **Create your game:**
   ```bash
   node tools/new-game.js my-game "My Game" learn    # learn | build | compete | share
   ```
   Play it by opening `index.html` in your browser. Replace the placeholder
   `thumb.svg` with your own 800x800 picture if you can.
4. **Check and open a pull request:**
   ```bash
   node tools/check-games.js
   ```
   Fill in the pull request template. A maintainer will review it, usually
   within a week, and may ask for small changes. That is normal and friendly.

New to Git? Use GitHub's web editor: open any `games/<id>/game.js`, press the
pencil, edit, and GitHub will create the fork and pull request for you.

## What we look for in a game

* It teaches or celebrates something from robotics, electronics, coding, maths
  or game theory, and is suitable for school students.
* It works offline, on phones and laptops, in light and dark mode.
* It collects **no personal data**: no accounts, cookies, analytics or
  leaderboards, and makes no network requests.
* It is self-contained in `games/<id>/` (plus one line in `games/manifest.js`).
* The code is readable. Short comments for the clever parts help the next
  contributor learn from your work.

The full list is in [games/README.md](games/README.md#rules-the-checker-enforces-most-of-these).

## Licence and credit

* The project is released under the [MIT License](LICENSE).
* By opening a pull request you confirm that **you wrote your contribution (or
  have the right to share it)** and that it is licensed under the MIT License,
  the same as the rest of the project. That includes code, text and pictures
  in your game folder.
* You keep your copyright. You are credited through Git history and, if you
  add `authors:['@your-handle']` to your game, on the game's page.
* **Third-party material** (an image, a sound, a code snippet) is only allowed
  if its licence is compatible with MIT, for example CC0, CC BY, MIT, BSD or
  Apache-2.0. Add a line to [games/CREDITS.md](games/CREDITS.md) with the
  author, source and licence. Do not submit anything copied from a book,
  website, another game or an AI tool whose terms do not allow this.
* Please do not use Yantrika or IACS logos in a way that suggests official
  endorsement of a fork.

## Reviewing and merging (for maintainers)

* Every pull request runs `node tools/check-games.js`, ESLint and a headless
  smoke test that opens every game (see `.github/workflows/check.yml`).
* Check that the game plays correctly on a phone-sized screen, that the theory
  is accurate, and that licences are clear before merging.
* New contributors' first pull requests deserve extra encouragement.

## Code of conduct

Be kind, be curious, help each other learn. See
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
