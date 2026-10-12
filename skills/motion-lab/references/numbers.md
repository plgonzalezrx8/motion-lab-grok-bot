# The motion numbers cheat sheet

All of these are in `kit/motion.js` as tokens. Tell the scene code: use only these tokens, no inline numbers.

## Easing (easings.net, Andrey Sitnik)
| Name | cubic-bezier | Use it for |
|---|---|---|
| ease-out-expo | 0.16, 1, 0.3, 1 | Text and logo reveals |
| ease-out-quint | 0.22, 1, 0.36, 1 | Premium entrances |
| ease-in-out-quart | 0.76, 0, 0.24, 1 | Moves and camera pushes |
| ease-in-expo | 0.7, 0, 0.84, 0 | Fast exits |
| ease-out-back | 0.34, 1.56, 0.64, 1 | A playful pop with overshoot |

Enter with ease-out, exit with ease-in and make exits 40 to 50% shorter (Material 3 pairs a 400 ms entrance with a 200 ms exit). Move across the screen with ease-in-out. Linear only for rotation, progress bars and loop phase: linear easing on a move is the fastest way to make a render look like a render.

## Springs
One number translates between libraries: the damping ratio `zeta = d / (2 * sqrt(k * m))`.
1.0 never bounces. 0.7 to 0.85 feels premium. 0.4 to 0.6 is playful. Under 0.3 is a cartoon.
Remotion's default spring (mass 1, damping 10, stiffness 100) is 0.5; react-spring's default (tension 170, friction 26) is about 1.0.
Position and size may bounce; opacity and color never do (Material 3).
`spring(t, zeta, f)` in motion.js is closed-form: frame 84 renders without computing frames 0 to 83, as the render contract requires.

## Durations and stagger
UI feedback 100 to 200 ms (100 ms feels instant). UI moves 200 to 500 ms, hero reveals 600 to 900 ms, letters 1 frame apart, words 60 to 120 ms, list items 40 to 80 ms. Start the next element when the previous one is 30 to 50% done: fully sequential looks robotic, all at once looks cheap.
For video, say it in frames. At 24 fps one frame is about 42 ms: a 400 ms move is 10 frames, a 750 ms reveal is 18.

## Beat grid
Frames per beat = fps x 60 / BPM. 120 BPM at 24 fps = 12 frames. 128 BPM at 30 fps = 14.06: compute every beat from time and round each one (`beatFrame(n, bpm, fps)`). Adding a rounded 14 again and again drifts: after 32 beats you're 2 frames off.
Cut on the beat; change the layout on the bar (every 4 beats). Changing everything on every beat wears the viewer out.

## Holds, camera, accessibility
- On-screen text holds at least 0.3 s per word + 0.5 s (a two-word title needs 1.1 s). During a hold, a slow 2% push keeps the frame alive.
- Camera moves get the softest curves (ease-in-out-quart); objects get snappier ones. Parallax: 1.0 foreground, 0.5 middle, 0.2 background. A 35 to 50 degree fov is a good 3D start; 30 for product shots.
- Text keeps 4.5:1 contrast on every frame, including over moving backgrounds. Never flash more than 3 times per second (WCAG).
- Exaggeration: push key poses 10 to 30% further than feels right; the feed shrinks everything.
