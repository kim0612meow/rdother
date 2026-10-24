# Swapping backgrounds

The current character art is generated raster art reduced to a small native resolution and palette. The new backgrounds are generated raster environment plates in a matching muted, textured style; they are not described as hand-placed pixel art.

`config.js` selects `ACTIVE_THEME`. Set it to `'classic'` to restore all previous procedural backgrounds without changing game rules, characters or saved games.

The new version lives entirely in `painted-city-v1/`. Its `backgrounds.png` has four equal panels: street (upper left), home (upper right), shop (lower left), gambling alley (lower right). Add a sibling directory and a new registry entry to keep a future version separate. `sourceGround` maps each panel's floor seam to the game's existing ground height; `fx` sets the camera-effect strength. Interactive doors, signs and the shell-game table remain code layers at their actual gameplay positions.

Generated with the built-in imagegen tool. Prompt: four separate, equal 16:9 environment panels in a strict 2×2 atlas, no people or text; worn old-European street, humble home alley, modest shop and dangerous gambling alley, with matte brick/wood/plaster textures and restrained olive/brown light matching the existing characters. No magic, excessive bloom or poster composition.

`props.png` in the same theme folder contains matching crate, metal bin, gambling table/cups and empty bowl assets in a 2×2 transparent atlas. It was generated with the built-in imagegen tool using the same environment reference, with worn matte wood/metal/ceramic and no characters or background.

## Side street revision 2

Active theme: side-street-v2. The independent background is themes/side-street-v2/alley.png. The old atlas stays in painted-city-v1/backgrounds.png; select painted-city-v1 in config.js to restore its previous composition. Select classic for the older procedural environment. No save migration is needed.

Street facade crops are centred on each SHOPS entry's door coordinate rather than repeating unrelated shop doors. ARCHITECTURE in config.js stores calibrated source door centres and architectural scales. Alley exits are drawn at the same local x=150 used by the simulation. Facades now use 55% of the original scale, room architecture 60%, and walking adults use sprite scale 1.75 (previously 1.3). Width, story positions and existing saved locations remain compatible.

New art was made using the built-in imagegen tool, with the existing atlas as a style reference. Final background prompt: strict side-on orthographic horizontal brick alley, uninterrupted left-right stone pavement, small barred windows, one modest left-hand wooden door, pipes and muted lantern, worn restrained olive-brown textures. No receding or upward path, people, UI, bins, crates or table. Ground seam was calibrated from the generated result.

Character action sheet: assets/actions-v3.png, separate from the existing walking/eating atlases. Built-in imagegen prompt: transparent 2-row, 4-column whole-body sheet matching the child and hooded thug identities; child hesitant, reaching, wallet-held and recoiling poses; thug raises a short wooden cosh, prepares, strikes left and follows through. Connected hands, fixed limb lengths, no detached props or background. Each pose is cropped, sampled to native sprite height and reduced to its character's existing 24-colour palette. The source is generated raster art, not manually placed pixel art.

Controls and volume are independent of story saves: settings.js, local storage one-more-meal-settings-v1. Escape is fixed; gameplay bindings are configurable, conflicts swap the two actions, and Reset restores defaults. Control labels in the tutorials, HUD and help follow the current bindings.

## Lived street revision 3

Active theme: lived-street-v3. New assets are themes/lived-street-v3/facades.png and themes/lived-street-v3/cover-cart.png. They are independent siblings; choose side-street-v2 in config.js to restore the preceding layout.

The residential facade replaces tiny repeating wall patches behind street shopfronts. Its uninterrupted upper floor remains visible; only the lower storefront and alley entrance crops overlay it, preventing cut-off or doubled upper windows. All existing door centres remain calibrated to their W entry positions.

Loaded delivery carts replace small hiding crates. A full seated/crouched father pose draws behind the cart, with the head visible above the low right-hand rail. Nothing is stretched or assembled from extra limb lines. F covers/reveals him; legacy BOXES ids and boxId fields are retained for save compatibility. Carts 3 and 4 are relocated away from door centres. Interaction reaches 98 world pixels to match the 196-pixel cart. Immediate hiding safety remains in effect. English and Korean controls/help/status describe crouching behind cover.

Generated using the built-in imagegen tool with painted-city-v1/backgrounds.png as style reference. Facade prompt: single wide side-on adjoining old-European residential houses, shuttered upper and lower windows, pipes, subtle ivy and a small laundry line, full edge-to-edge plaster/brick architecture, stone plinth at bottom; no entrances, storefronts, people, text, sky or vanishing point. Matte muted ochre/grey/brown, readable pixel-inspired raster texture. Cart prompt: transparent side-on low delivery cart, two iron-rimmed wooden wheels, tall sacks/crates with olive canvas on left, low empty rail on right for a crouching head to peek above; no people, background or writing, matte burlap and weathered wood, matching restrained game palette. These are generated raster assets, not manually placed pixel art.
