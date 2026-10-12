# Five animation principles on a voxel character (3D)

An 8 s, 60 fps, 1080x1080 loop: three studio lights click on, a voxel robot ("Pip") hops pad to pad along a floor that is a motion-tool timeline, then flips back along a dotted arc. A checklist of principles lights each label on the exact frame it happens, so a late move shows up as a label lighting before its move.

| Principle | Write it in the prompt as |
|---|---|
| Anticipation | 11-frame crouch (1.2x0.75) |
| Squash and stretch | stretch 0.85x1.28 at takeoff, squash 1.25x0.7 on landing |
| Overlapping action | arms lag 4 frames, legs 6 |
| Follow-through | arms settle at 2.2 Hz, damping 0.22 |
| Arcs | a flip along a dotted arc, 3.5 high |
| Slow in / slow out | spring back at damping 0.55 |
| Timing | 25 frames of air per hop, 18 frames of crouch before the flip |

- `prompt.txt`, `followups.txt` (4), `sound.txt` (0 follow-ups were needed).
- The prompt pins the character's proportions (14x10 body, 3x2 arms, 2x3 legs and eyes, 0.1 voxels, 8 deep). Every style you care about needs a guardrail line like that.

Original receipts: 399-word prompt, 4 follow-ups, a 71-check numeric audit of all 480 frames, about 2 h plus 70 min for sound.

Adapted from Florence (@flxrnc), "Motion Lab" article: https://x.com/flxrnc/status/2105311836190978392. Rebranded for this plugin (neutral palette, new title/character); every technique and number is hers unless noted.
