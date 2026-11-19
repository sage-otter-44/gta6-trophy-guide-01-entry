# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sage-otter-44/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sage-otter-44/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that is the best guide and tracker for the **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 0 online).

## What it does

- **Every trophy, exactly as PlayStation publishes it** — official name, description and grade, plus the PSN progress target where one exists (e.g. 250 stunts, 42 Shooting Range golds, 100 WAiNK locations). Names, descriptions and grades were verified 2026-11-19 against [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) and [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/).
- **A guide for each trophy in our own words, with its sources named beside it** — what to do, where, how, and when it can be missed. Where no unlock method was confirmed at launch (five trophies, plus Fair Game's animal), the guide says so plainly instead of guessing.
- **Roadmap to the platinum** in six stages, built from the official descriptions: story chapters and missions, side-character finales, activities, collectibles and counts, robberies and money, then 100% completion.
- **Missable flags** — Positive Mental Attitude is the one trophy that can be missed (Lucia's Chapter 1 balcony meditation); stranger chains are flagged as time-sensitive.
- **Tracker** — a checklist saved in the browser (localStorage), export to a file and import back, filters by kind (story, missable, collectibles, activities, robberies, exploration, money, combat, cryptic) and by grade, text search, earned-only view, and a **spoiler-safe setting** that hides story trophies until earned.
- **Works offline** — static files under `app/`, no network request at runtime. Serve `app/` with any static server and open `index.html` in desktop Chrome.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## Sources

- Official list: [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- Launch-era guidance: [EGamers.io](https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/), [OutputLag](https://outputlag.com/guides/gta-6-trophy-list/), [KeenGamer](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/), [Press-Start](https://press-start.com.au/news/2026/11/18/gta-6-trophy-list/)

An unofficial fan guide. Not affiliated with Rockstar Games or Sony. No Rockstar artwork or logos are used.

## License

MIT — see [LICENSE](LICENSE).
