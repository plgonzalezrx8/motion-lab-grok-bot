# Anatomy of a directed motion brief

A directed brief isn't long for its own sake. Each line removes one decision the model would otherwise make, and the model's own decisions are the default look. "Avoid a generic look" just swaps one default for another; naming the exact patterns to avoid works.

## Template (templates/prompt-template.txt)

```
GOAL: what the viewer should feel or do, in one sentence
OUTPUT: one self-contained HTML file (or a Remotion composition), W x H, engine + pinned version
TIME: seconds x fps = total frames. Loop: yes or no
LOOK: palette in hex, one accent, typeface + weight + size + tracking
MOTION: easing as cubic-bezier, springs as damping ratio, durations in frames
SHOTS: frame ranges, one hero move per shot, how each shot hands off
BANNED: the defaults you never want to see
QA: stills at named frames, a contact sheet, fix, then the full render
```
3D adds MODEL (units, primitives, sizes) and CAMERA (fov, distance, orbit, push-ins). Then paste the render contract.

- **Write GOAL first.** If it can't be said in one sentence, no easing curve will rescue the piece.
- **Then TIME**, because every other number hangs off the frame count.
- **SHOTS is where the story lives.** Each shot: a frame range, one hero move, a handoff (hard cut on the beat, a match cut where one shape becomes the next, or a mask wipe). Default to the cut; a transition should be a decision.
- **QA** makes the agent check stills before rendering the whole clip. That's where the lab loop starts (lab-loop.md).
- **Guardrails:** say what may not change (a character's exact proportions, a logo's geometry). Every style you care about needs a line like that.

## Starting ban list
- purple or blue gradients, glow, lens flares, bloom by default
- floating particles as decoration
- everything fading in at once
- fade-and-slide-up on every element (the generic default that reads as AI-generated)
- centered-everything layouts
- text that moves while it is being read
- spinning turntables, dark "space" backgrounds, made-up taglines

Keep the list alive: after every first render, name what the output used anyway and add it.

## Hierarchy
One hero per shot. A single orchestrated moment lands better than scattered effects. Everything else waits, dims to 40%, or holds still.
Secondary moves travel 50 to 70% as far as the hero and start 100 to 200 ms after it. Ambient motion stays under 5% of the hero's travel, runs on a slow sine and never stops.

## Translate adjectives into numbers (examples/earbuds)
- "Premium" -> materials: satin ceramic roughness 0.38 + clearcoat 0.35, chrome roughness 0.05, one accent used on one part only.
- "Cool" -> a studio: key, fill and rim with exact colors, strengths and positions; reflections from a studio built in code; soft contact shadows; no glow.
- "Modern" -> a camera: 30 degree fov, never parked, an orbit 34 to 10 degrees, one push-in on easeOutExpo at 2.0 s.
- "Animation" -> beats and springs: 120 BPM, a 3-frame anticipation before the lid springs at damping 0.6, follow-through at 0.5.
- The defaults -> banned by name.

Every adjective you replace with a number is a decision you take back from the model.
