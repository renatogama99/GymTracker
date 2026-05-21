# GymTracker — CrossFit Tracker

A single-page fitness tracking app built with React 18 + TypeScript + Tailwind CSS. All data is persisted to `localStorage`. UI is in Portuguese.

## Stack

- **React 18** + **TypeScript** (Vite)
- **Tailwind CSS** (via `@tailwindcss/vite`)
- **date-fns** — calendar date utilities
- **lucide-react** — icons

## Features

### Treinos
Four workout modes selectable via pill tabs:
- **AMRAP 10min** — Full Body: countdown timer + round counter
- **EMOM 10min** — Força: 1-min cycling timer with odd/even minute labels
- **Tabata** — Cardio: 20s work / 10s rest across 4 exercises × 8 rounds
- **Chipper** — Core: count-up stopwatch

Each mode displays the exercise list and a dedicated timer. When done, a save form lets you log date, score, and notes to localStorage.

### Calendário
- Month-view calendar built from scratch using date-fns
- Colored dots per workout type on logged days
- Click a day to see all logged workouts; delete any entry
- Previous/next month navigation; today is highlighted

### Nutrição
Static nutrition plan for a male CrossFit athlete (1.68m, 69kg, 7am training, muscle gain goal):
- Daily macro targets (2900 kcal · 175g protein · 345g carbs · 80g fat)
- Visual macro distribution bar
- Full meal timeline with times, names, calories, and food items
- Tip cards (hydration, rest days, supplements, adjustments)

## Setup

```bash
npm install
npm run dev    # development
npm run build  # production build
```

## Project Structure

```
src/
├── types/index.ts
├── context/AppContext.tsx
├── hooks/useTimer.ts
├── utils/storage.ts · uuid.ts · dateHelpers.ts
└── components/
    ├── BottomNav.tsx
    ├── treinos/ (TreinosTab, SaveForm, timers/*)
    ├── calendario/ (CalendarioTab)
    └── nutricao/ (NutricaoTab)
```

## localStorage

Key: `crossfit_logs` — array of `WorkoutLog`:
```ts
{ id: string; date: string; workoutType: 'amrap'|'emom'|'tabata'|'chipper'; score: string; notes: string }
```
