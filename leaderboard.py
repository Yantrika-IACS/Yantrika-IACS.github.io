#!/usr/bin/env python3
"""
Yantrika leaderboard builder (standard library only, Python 3.8+).

Reads scores from Supabase, keeps each player's best score per game, takes the
top 3 per game and writes leaderboard.json next to this script. The website
reads that file. Re-running rebuilds the list from the database, so new
players appear and beaten players drop off automatically.

  python leaderboard.py                 build leaderboard.json
  python leaderboard.py --prune         also delete every score outside the top 3
  python leaderboard.py --push          also git commit + push leaderboard.json
  (flags can be combined)

Set SUPABASE_KEY in your environment (never in the website or a public repo):
  - anon key           is enough to build the leaderboard
  - service_role key   is needed for --prune (deleting rows)
"""
import json, os, subprocess, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

URL = "https://nhrrttuyddalwhfmpfgd.supabase.co"                 # <- your Project URL
KEY = os.environ.get("SUPABASE_KEY", "")
TOP = 3
# game key -> "low" (smaller score wins) or "high" (bigger score wins)
GAMES = {"duel": "low", "simon": "high",
         "maze-easy": "low", "maze-medium": "low", "maze-hard": "low"}
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "leaderboard.json")


def call(method, params):
    q = "?" + urllib.parse.urlencode(params, safe="(),.-")
    req = urllib.request.Request(URL + "/rest/v1/scores" + q, method=method,
                                 headers={"apikey": KEY, "Authorization": "Bearer " + KEY})
    with urllib.request.urlopen(req, timeout=30) as f:
        body = f.read()
    return json.loads(body) if body else None


def fetch_all():
    rows, off = [], 0
    while True:
        page = call("GET", {"select": "id,game,username,score,created_at",
                            "game": "in.(" + ",".join(GAMES) + ")",
                            "order": "created_at.asc", "limit": 1000, "offset": off})
        rows += page
        if len(page) < 1000:
            return rows
        off += 1000


def main():
    if not KEY or "xxxx" in URL:
        sys.exit("Set URL in this file and SUPABASE_KEY in your environment first.")
    rows = fetch_all()

    # best score per player per game (names are case-insensitive; earliest wins ties)
    best = {}
    for r in rows:
        k = (r["game"], r["username"].lower())
        cur = best.get(k)
        if cur is None or (r["score"] < cur["score"] if GAMES[r["game"]] == "low"
                           else r["score"] > cur["score"]):
            best[k] = r

    board, keep = {}, set()
    for g, mode in GAMES.items():
        top = sorted((v for (gg, _), v in best.items() if gg == g),
                     key=lambda r: (r["score"] if mode == "low" else -r["score"], r["created_at"]))[:TOP]
        board[g] = [{"username": r["username"], "score": r["score"]} for r in top]
        keep.update(r["id"] for r in top)

    old = {}
    if os.path.exists(OUT):
        try:
            old = json.load(open(OUT, encoding="utf-8")).get("games", {})
        except Exception:
            pass
    if board != old:
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump({"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                       "games": board}, f, indent=1, ensure_ascii=False)
        print("leaderboard.json updated")
    else:
        print("no change in the top 3")

    if "--prune" in sys.argv:
        drop = [r["id"] for r in rows if r["id"] not in keep]
        for i in range(0, len(drop), 100):
            call("DELETE", {"id": "in.(" + ",".join(map(str, drop[i:i + 100])) + ")"})
        print("deleted", len(drop), "scores outside the top", TOP)

    if "--push" in sys.argv:
        d = os.path.dirname(OUT)
        subprocess.run(["git", "add", "leaderboard.json"], cwd=d, check=True)
        if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=d).returncode:
            subprocess.run(["git", "commit", "-m", "Update leaderboard"], cwd=d, check=True)
            subprocess.run(["git", "push"], cwd=d, check=True)


if __name__ == "__main__":
    main()
