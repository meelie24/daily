# Lot 31 — Realistic Blender House Build

This is the source project for the custom Lot 31 house. It is intentionally built in **Blender**, not as a primitive-box Three.js demo. Blender authors the architecture, imports real licensed furniture/vehicle/plant assets, saves an editable `.blend`, and exports a PBR `.glb` for the interactive browser viewer.

## Locked brief

### Site

- Corrected irregular Lot 31 polygon, mathematically fixed at **8,031 sq ft**.
- House façade pushed back to create a proper **25 × 24 ft two-car driveway** with a flared road apron.
- Pool and entertainment area placed near the rear, leaving only a modest planted strip behind the pool.

### Ground floor

- Two-car attached garage.
- Ground-floor guest suite with ensuite and wardrobe.
- Large open kitchen, dining and living space connected to the pool terrace through wide sliders.
- Compact cozy corner bar beside dining but separated from the main living seating.
- The bar has **exactly three stools**.

### Upper floor

- Master suite.
- One regular bedroom.
- Dedicated game room with a full billiards table and media wall.

### Exterior

- Covered patio / pavilion.
- **15 × 30 ft pool** and raised spa.
- Outdoor kitchen and built-in grill.
- Lounge seating.
- Covered outdoor pool table.
- Tropical palms, dense hedges, flowering accents and low boundary walls.

### Visual direction

Modern tropical / Bahamian luxury villa: warm-white stucco, gray stone, teak accents, dark aluminum glazing, generous overhangs, controlled daylight, realistic PBR materials, layered tropical landscaping, and bright-but-balanced interiors. No giant sun disc, no washed-out whites, no low-poly game look.

## Real assets

The build downloads and imports real glTF assets from the Khronos glTF Sample Assets project, including sofas, dining chairs, a refrigerator, cars, plants and selected décor. Each original model README/license notice is preserved in the final package. The environment map is a CC0 Poly Haven HDRI when available.

## Output

The GitHub Actions build produces:

- `Lot31_Realistic_House.blend` — editable Blender source.
- `viewer/Lot31_Realistic_House.glb` — PBR model for the interactive viewer.
- `viewer/index.html` — 360° orbit, zoom, pan, exterior/interior presets, floor isolation and first-person walkthrough.
- `previews/` — Blender-rendered front, backyard, dollhouse and interior checks.
- `BUILD_REPORT.json` — generated dimensions and imported-asset report.
- `ASSET_CREDITS.md` and individual license notices.

## Open the finished viewer

1. Extract the final ZIP.
2. Open the `viewer` folder.
3. Double-click `START_VIEWER.bat` on Windows, or run `./START_VIEWER.sh` on macOS/Linux.
4. The browser opens at `http://127.0.0.1:8765/`.

Opening `index.html` directly with `file://` will not work because browsers block local GLB fetches. Use the included launcher.
