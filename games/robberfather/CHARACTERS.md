# Character sprite assets · revision 2

These are generated raster images reduced in resolution and palette, rather than manually placed pixel art. The rectangle-built character design was removed. Characters now use transparent raster sprite atlases, sampled onto a native pixel grid with a shared 24-colour palette for each identity. Whole-body poses preserve natural contours, bent limbs and cloth folds.

- `assets/people-pixel-v2.png`: father, son, passerby, wealthy man, police and alley tough. Standing, two walking phases, rear view and seated poses.
- `assets/eating-pixel-v2.png`: four complete eating poses for father and son. Hands and spoons belong to each frame rather than being assembled over a body.
- `characters.js`: alpha trimming, native-resolution sampling, palette reduction, whole-pose animation and pocket close-ups.
- `scene.js`: streets, interiors and story scenes consume the same sprites. Existing gameplay is retained.

Art was generated with the built-in imagegen tool. Source prompt: “Production-ready transparent 16-bit adventure-game pixel sprite atlas; tired working father in worn olive coat and brown cap, small son in beige shirt and newspaper blanket, ordinary worker, restrained wealthy man, watchful police officer and hooded alley tough. Natural stepped contours, deliberate pixel clusters, readable silhouettes, matte materials, no stacked rectangular bodies, no cinematic effects. Standing, walking, rear and seated poses.” Eating prompt: “Same father and son, seated facing one another; four complete poses taking food, raising spoon, touching lips and lowering spoon; connected upper arm, elbow, hand and spoon; transparent background.”

Local check: `node tools/preview.mjs`, then `http://127.0.0.1:4174/__qa`. The studio verifies full-colour sprites, silhouettes, animation variants and gameplay fixtures.

## Side-lying child · revision 19

- Asset: assets/child-lying-v19.png. A separate horizontal resting pose replaces rotated seated poses in both collapse endings. The renderer samples it to 74 native pixels wide and applies the existing child palette.
- Generated with the built-in image_gen tool, using people-pixel-v2.png as an identity/style reference. Prompt: one side-lying boy, head left on bent forearm, closed eyes, patched ivory shirt, brown trousers, boots, newspaper over lower torso and legs; anatomically horizontal, limited muted pixel palette, transparent background, no props or effects.
