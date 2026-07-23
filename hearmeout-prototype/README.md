# HearMeOut MF02 evaluation prototype

A clickable preview built to judge one proposed exercise mechanic (tap,
hold and release delivery) inside a convincing version of the HearMeOut
app. The MF02 learning job (responsive delivery) is approved; the
mechanic, its thresholds, timings, scene and result rules are prototype
fixtures and are not approved.

This folder is self-contained. Deleting it removes the prototype
completely. Nothing here touches production specifications, registries
or content banks, and nothing leaves the device: no accounts, no
network calls, no analytics. Local storage holds only settings, the
first-use flag and preview progress values.

## Run it

```
npm install
npm run dev        # development server
npm test           # vitest suite
npm run lint       # eslint
npm run build      # production build
```

## Where things live

- `src/app` - product shell: Bridge, Style, Clarity, Pocket, Settings
- `src/exercise` - MF02 entry, instructions, game loop, results, audio
- `src/exercise/mf02FixtureConfig.ts` - every evaluation threshold and
  result rule, in one place, so they can be replaced or deleted
- `src/scene` - the 3D office (Three.js), character rigs, and the
  animated fallback for browsers without WebGL
- `src/content/fixtureCopy.ts` - all preview copy and fixture data
- `src/design` - color, radius, shadow and motion tokens

The exercise path in the app: Bridge → See all → Communication →
Tone & delivery. `Continue practice` on Bridge goes to the same entry.
