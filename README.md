# Travelsona

This is a travel personality and compatibility quiz.

Running this project and visiting the link displays a 16 question personality quiz that will reveal 8 travel-related traits to varying degrees. 

Using your travelsona code with a friend's and clicking compare in the result screen shows a score of how compatible you and your friend are out of 100 along with a trait by trait breakdown of how each score difference could affect your travels together.


## Local Development

Setup and run project:
```powershell
npm install
npm run dev
```
Quiz runs at http://localhost:5173/ (link displayed in npm output).
`Ctrl`+`C` when done.


After making changes, rebuild project:

```powershell
npm run build
```

## Deploy To GitHub Pages

This repo is configured to deploy automatically with GitHub Actions when code is pushed to `main`.

One-time setup in GitHub:

1. Go to your repository `Settings` -> `Pages`.
2. Under `Build and deployment`, set `Source` to `GitHub Actions`.

After that, each push to `main` will publish the site.

Expected URL:

- `https://naluwho.github.io/travelsona-quiz/`

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4 (via Vite plugin)
- Recharts (radar chart)

## Where To Customize

- Edit all quiz prompts/options in `src/data/questions.ts`.
- Edit trait labels/descriptions/titles in `src/data/traits.ts`.
- Edit summary title behavior in `src/utils/scoring.ts` (`buildSummaryTitle`).
- Edit compatibility formula in `src/utils/compatibility.ts`.
- Edit overall look in `src/index.css` and Tailwind classes in components.

## Scoring Model

- 8 traits, each with 2 questions.
- Each answer contributes `+3`, `+1`, `-1`, or `-3` to its trait.
- Final trait values normalize to valid values:
  `-6, -4, -2, 0, 2, 4, 6`.

## Result Sharing

- A compact share code is generated from the 8 scores.
- The app also supports URL sharing with `?r=<code>`.
- Opening a shared URL restores the result immediately.

## Compatibility Logic

Current implementation:

1. Start at `100`.
2. For same-direction traits (`structure`, `budget`, `pace`, `energy`, `adventure`, `immersion`, `social`), subtract absolute score differences.
3. For `initiative`, subtract `abs(myInitiative + friendInitiative)` so opposites are rewarded.
4. Clamp result to `4..100`.
