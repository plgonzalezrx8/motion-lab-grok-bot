# Engines: pick one and name it in OUTPUT

Name the engine and its numbers in the OUTPUT line ("A Remotion composition, 1920 x 1080, 30 fps, 450 frames") or the model chooses for you.

Rule of thumb: one idea under 10 seconds -> plain HTML/CSS/Canvas. Anything 3D -> Three.js. A series, a template or a data-driven video -> Remotion. Motion that lives inside a product (not a video) -> Motion or GSAP.

## Plain HTML, CSS, SVG, Canvas 2D (supported, no install)
Zero dependencies; covers 2D loops under 10 s: type, shapes, UI. Start from `templates/starter-2d.html` or `examples/title-loop/`. `render.mjs` seeks CSS/WAAPI animations and calls `window.renderAt(t)`.
Animate only transform and opacity (no width/height/top/left). Snap resting text to whole pixels.

## Three.js r160, pinned (supported)
3D scenes, lights, physical materials and shaders on WebGL. Start from `templates/starter-three.html` (importmap from jsDelivr, pinned to 0.160.0).
- Drive time from `renderAt(t)`, never the clock; `renderer.setAnimationLoop` only when there is no `?t=`.
- `preserveDrawingBuffer: true` so screenshots always see the last frame.
- r160 trap: `TextGeometry` reads `height` for extrusion depth; a `depth` option is ignored and the default (50) wins. Pin the version and name the right parameter.
- Studio reflections: build a PMREM environment in code (RoomEnvironment or your own softboxes), no HDR downloads.
- Seed all noise; make every periodic value a whole number of cycles per loop.
- **On the Grok Bot box there is no GPU.** render.mjs uses SwiftShader (software WebGL): correct but slow. Preview with `--times`, draft at 540x540 / 24 fps, and keep `--subframes` (motion blur) for the final. Pass `--gpu` on a machine with a real GPU.

## Remotion (supported via its own CLI)
Video as React components, frame-exact. Licence: free for individuals and companies of up to 3 employees; larger companies need a company licence (remotion.dev/license).
```sh
npx create-video@latest            # pick a template, e.g. my-video
cd my-video && npm i
npx remotion studio                # preview in the browser
npx remotion render MyComp out/video.mp4 --browser-executable=/usr/bin/google-chrome
npx remotion still MyComp out/still.png --frame=84 --browser-executable=/usr/bin/google-chrome
```
Use `useCurrentFrame()` and `interpolate`/`spring` from Remotion (all frame-based, so the render contract holds automatically). Remotion renders its own MP4; you can still run `contact-sheet.sh`-style checks by rendering stills or extracting frames with ffmpeg (`ffmpeg -i out/video.mp4 out/frames/%04d.png`), then `export.sh` for the GIF. Remotion's spring defaults (mass 1, damping 10, stiffness 100) are a damping ratio of 0.5.

## GSAP and Motion (for product UI, mention only)
GSAP is free including SplitText, MorphSVG, DrawSVG, ScrollTrigger. For video, build a paused timeline and seek it in `renderAt(t)`: `tl.pause(); window.renderAt = t => tl.seek(t);`.
Motion (formerly Framer Motion) animates live React interfaces under MIT; it has no video renderer.

## HyperFrames (optional, not set up)
HeyGen's open-source HTML + GSAP -> MP4 renderer (Apache 2.0). It needs Node 22+; the Grok Bot box currently has Node 20, so this plugin doesn't use it. If you install Node 22 yourself: `npx hyperframes init my-video`, `npx hyperframes preview`, `npx hyperframes render`.
